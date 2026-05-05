import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { tenantContext } from "../middleware/tenant.js";
import { scopeWhere } from "../lib/scope.js";
import { parseListOpts, sendList } from "../lib/list-query.js";
import { eventBus } from "../lib/event-bus.js";
import { verifyToken } from "../lib/jwt.js";

export const auditRouter = Router();

// SSE 端不能用 Authorization header（EventSource 不支援），改 query 驗
auditRouter.get("/stream", (req, res, next) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(401).json({ error: "missing_token" });
    req.user = verifyToken(token);
    // 簡化的 tenant context（避免引入 prisma extension 開銷）
    const isCrossTenant = ["portal-admin", "super-admin"].includes(req.user.role);
    req.isCrossTenant = isCrossTenant;
    req.tenantId = isCrossTenant ? (req.query.tenantId || null) : req.user.tenantId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "invalid_token" });
  }
}, sseHandler);

auditRouter.use(requireAuth, tenantContext);

// F1 — SSE handler（client: EventSource("/api/audit/stream?eventId=xxx&token=jwt")）
function sseHandler(req, res) {
  const eventId = req.query.eventId;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Nginx 不要 buffer
  res.flushHeaders?.();
  res.write(`: connected\n\n`);
  const heartbeat = setInterval(() => res.write(`: ping\n\n`), 30000);

  const handler = (payload) => {
    if (eventId && payload.eventId !== eventId) return;
    if (req.tenantId && !req.isCrossTenant && payload.tenantId !== req.tenantId) return;
    res.write(`event: activity\ndata: ${JSON.stringify(payload.activity)}\n\n`);
  };
  // F2：notifications 給對應 user
  const notifHandler = (payload) => {
    if (payload.userId !== req.user.userId) return;
    res.write(`event: notification\ndata: ${JSON.stringify(payload.notification)}\n\n`);
  };
  eventBus.on("activity", handler);
  eventBus.on("notification", notifHandler);

  req.on("close", () => {
    clearInterval(heartbeat);
    eventBus.off("activity", handler);
    eventBus.off("notification", notifHandler);
  });
}

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

// E7 Email logs — 寄信記錄查詢
auditRouter.get("/email-logs", async (req, res, next) => {
  try {
    const opts = parseListOpts(req, {
      searchFields: ["toAddress", "subject"],
      allowedFilters: ["eventId", "vendorId", "trigger", "status"],
    });
    const where = { ...scopeWhere(req), ...opts.where };
    const [items, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy: { sentAt: "desc" },
        skip: opts.skip,
        take: opts.take || 100,
      }),
      prisma.emailLog.count({ where }),
    ]);
    sendList(res, req, items, total);
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
