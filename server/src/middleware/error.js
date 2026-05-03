import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

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
  console.error("[error]", err);
  res.status(500).json({ error: "internal_error" });
}
