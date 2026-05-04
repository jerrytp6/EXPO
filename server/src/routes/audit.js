import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { tenantContext } from "../middleware/tenant.js";
import { scopeWhere } from "../lib/scope.js";

export const auditRouter = Router();

auditRouter.use(requireAuth, tenantContext);

// 廠商行動 audit（vendors 邀約 / clicked / registered 等）
auditRouter.get("/activities", async (req, res, next) => {
  try {
    const where = { ...scopeWhere(req) };
    if (req.query.eventId) where.eventId = req.query.eventId;
    if (req.query.vendorId) where.vendorId = req.query.vendorId;
    const limit = Math.min(parseInt(req.query.limit || "100", 10), 500);
    const items = await prisma.activity.findMany({
      where,
      orderBy: { at: "desc" },
      take: limit,
      include: {
        vendor: { select: { id: true, company: true } },
        event: { select: { id: true, name: true } },
      },
    });
    res.json(items);
  } catch (err) { next(err); }
});

// 表單繳交 audit（submitted / reviewed / vendor_confirmed / reconfirm_triggered）
auditRouter.get("/submission-logs/:submissionId", async (req, res, next) => {
  try {
    const logs = await prisma.submissionLog.findMany({
      where: { submissionId: req.params.submissionId, ...scopeWhere(req) },
      orderBy: { at: "asc" },
    });
    res.json(logs);
  } catch (err) { next(err); }
});

// 整個事件的所有 submission_logs（給 dashboard 用）
auditRouter.get("/submission-logs", async (req, res, next) => {
  try {
    const where = { ...scopeWhere(req) };
    const limit = Math.min(parseInt(req.query.limit || "200", 10), 500);
    if (req.query.eventId) {
      // 透過 submission 的 eventId 過濾
      const subs = await prisma.formSubmission.findMany({
        where: { eventId: req.query.eventId, ...scopeWhere(req) },
        select: { id: true },
      });
      where.submissionId = { in: subs.map((s) => s.id) };
    }
    const logs = await prisma.submissionLog.findMany({
      where,
      orderBy: { at: "desc" },
      take: limit,
    });
    res.json(logs);
  } catch (err) { next(err); }
});
