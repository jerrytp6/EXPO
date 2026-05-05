import { Router } from "express";
import path from "node:path";
import fs from "node:fs";
import { requireAuth } from "../middleware/auth.js";
import { tenantContext } from "../middleware/tenant.js";
import { upload, UPLOAD_DIR } from "../middleware/upload.js";
import { verifyToken } from "../lib/jwt.js";

export const uploadsRouter = Router();

// 上傳：multipart/form-data, field name = "file"
// 回傳 { storedFileName, originalName, size, url }
uploadsRouter.post("/", requireAuth, tenantContext, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "no_file" });
  const tenantId = req.tenantId || "_no-tenant";
  const ym = new Date().toISOString().slice(0, 7);
  const url = `/files/${tenantId}/${ym}/${req.file.filename}`;
  res.status(201).json({
    storedFileName: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    url,
  });
});

// 下載：/files/{tenantId}/{YYYY-MM}/{filename}
// F5：要求 JWT（Bearer header 或 ?token= query），並比對路徑 tenantId
// 跨租戶角色 (portal-admin / super-admin) 可存取所有 tenant 檔案
export const filesRouter = Router();

const CROSS_TENANT = new Set(["portal-admin", "super-admin"]);

function readFileAuth(req, res, next) {
  let token = null;
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) token = header.slice(7);
  else if (req.query.token) token = req.query.token;
  if (!token) return res.status(401).json({ error: "missing_token" });
  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ error: "invalid_token" });
  }
}

filesRouter.get("/:tenantId/:ym/:filename", readFileAuth, (req, res) => {
  const { tenantId, ym, filename } = req.params;
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return res.status(400).json({ error: "invalid_filename" });
  }
  if (!/^\d{4}-\d{2}$/.test(ym)) {
    return res.status(400).json({ error: "invalid_ym" });
  }
  // tenant 比對
  if (!CROSS_TENANT.has(req.user.role) && req.user.tenantId !== tenantId) {
    return res.status(403).json({ error: "forbidden_tenant" });
  }
  const filePath = path.join(UPLOAD_DIR, tenantId, ym, filename);
  if (!filePath.startsWith(UPLOAD_DIR)) {
    return res.status(400).json({ error: "invalid_path" });
  }
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "not_found" });
  }
  res.sendFile(filePath);
});
