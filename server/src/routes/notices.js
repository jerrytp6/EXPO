import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { tenantContext } from "../middleware/tenant.js";
import { scopeWhere, requireWriteTenant } from "../lib/scope.js";

export const noticesRouter = Router();

noticesRouter.use(requireAuth, tenantContext);

const noticeSchema = z.object({
  category: z.string().default("其他"),
  title: z.string().min(1),
  content: z.string(),
  attachmentName: z.string().nullish(),
  requiresAck: z.boolean().default(true),
  allowDecoratorView: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  publishedAt: z.string().nullish(),
});

noticesRouter.get("/", async (req, res, next) => {
  try {
    const where = { ...scopeWhere(req), ...(req.query.eventId ? { eventId: req.query.eventId } : {}) };
    const notices = await prisma.eventNotice.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });
    res.json(notices);
  } catch (err) { next(err); }
});

noticesRouter.get("/:id", async (req, res, next) => {
  try {
    const notice = await prisma.eventNotice.findFirst({
      where: { id: req.params.id, ...scopeWhere(req) },
    });
    if (!notice) return res.status(404).json({ error: "not_found" });
    res.json(notice);
  } catch (err) { next(err); }
});

noticesRouter.post("/", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const tenantId = requireWriteTenant(req);
    const eventId = req.body.eventId || req.query.eventId;
    if (!eventId) return res.status(400).json({ error: "eventId_required" });
    const body = noticeSchema.parse(req.body);
    const notice = await prisma.eventNotice.create({
      data: {
        ...body,
        tenantId,
        eventId,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
      },
    });
    res.status(201).json(notice);
  } catch (err) { next(err); }
});

noticesRouter.patch("/:id", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const target = await prisma.eventNotice.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    const body = noticeSchema.partial().parse(req.body);
    const data = { ...body };
    if (body.publishedAt) data.publishedAt = new Date(body.publishedAt);
    const notice = await prisma.eventNotice.update({ where: { id: req.params.id }, data });
    res.json(notice);
  } catch (err) { next(err); }
});

noticesRouter.delete("/:id", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const target = await prisma.eventNotice.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    await prisma.eventNotice.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

// 廠商確認須知（從廠商 portal 呼叫）
noticesRouter.post("/:id/ack", async (req, res, next) => {
  try {
    const { vendorId } = z.object({ vendorId: z.string() }).parse(req.body);
    const notice = await prisma.eventNotice.findFirst({
      where: { id: req.params.id, ...scopeWhere(req) },
    });
    if (!notice) return res.status(404).json({ error: "not_found" });
    const ack = await prisma.noticeAcknowledgment.upsert({
      where: { vendorId_noticeId: { vendorId, noticeId: notice.id } },
      update: { acknowledgedAt: new Date() },
      create: {
        tenantId: notice.tenantId,
        eventId: notice.eventId,
        vendorId,
        noticeId: notice.id,
      },
    });
    res.json(ack);
  } catch (err) { next(err); }
});

noticesRouter.get("/event/:eventId/acks", async (req, res, next) => {
  try {
    const acks = await prisma.noticeAcknowledgment.findMany({
      where: { eventId: req.params.eventId, ...scopeWhere(req) },
    });
    res.json(acks);
  } catch (err) { next(err); }
});
