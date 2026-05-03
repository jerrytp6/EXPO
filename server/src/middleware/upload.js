// 檔案上傳 middleware（multer + local disk）
//
// 路徑規則：server/uploads/{tenantId}/{YYYY-MM}/{uuid}-{原檔名}
// 限制：單檔 ≤ 10MB；副檔名白名單
//
// 上線時可改 S3 / 客戶提供的 storage（multer 換 multer-s3 即可）。

import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");

const ALLOWED_EXT = new Set([
  ".pdf", ".jpg", ".jpeg", ".png", ".gif", ".webp",
  ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".dwg", ".dxf", ".svg", ".ai", ".csv", ".txt", ".zip",
]);

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    const tenantId = req.tenantId || "_no-tenant";
    const ym = new Date().toISOString().slice(0, 7); // YYYY-MM
    const dir = path.join(UPLOAD_ROOT, tenantId, ym);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext)
      .replace(/[^一-鿿A-Za-z0-9_-]/g, "_")
      .slice(0, 80);
    const id = crypto.randomBytes(6).toString("hex");
    cb(null, `${id}-${base}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return cb(Object.assign(new Error("file_type_not_allowed"), { statusCode: 400 }));
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE, files: 1 },
});

// 公開靜態下載：把 server/uploads 暴露到 /files/*
// 注意：實際生產環境應該檢 JWT 才能下載；MVP 先公開
export const UPLOAD_DIR = UPLOAD_ROOT;
