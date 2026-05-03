import { Router } from "express";
import path from "node:path";
import fs from "node:fs";
import { requireAuth } from "../middleware/auth.js";
import { tenantContext } from "../middleware/tenant.js";
import { upload, UPLOAD_DIR } from "../middleware/upload.js";

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
// MVP 公開（生產環境應加權限檢查與簽名 URL）
export const filesRouter = Router();
filesRouter.get("/:tenantId/:ym/:filename", (req, res) => {
  const { tenantId, ym, filename } = req.params;
  // 防 path traversal
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return res.status(400).json({ error: "invalid_filename" });
  }
  if (!/^\d{4}-\d{2}$/.test(ym)) {
    return res.status(400).json({ error: "invalid_ym" });
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
