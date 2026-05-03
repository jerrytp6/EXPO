import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import multer from "multer";

// 統一錯誤處理：4xx → 結構化、5xx → 不洩漏實作
export function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "validation_failed", issues: err.errors });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "duplicate", target: err.meta?.target });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: "not_found" });
    }
  }
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `upload_${err.code.toLowerCase()}`, field: err.field });
  }
  if (err.statusCode && err.statusCode < 500) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error("[error]", err);
  res.status(500).json({ error: "internal_error" });
}
