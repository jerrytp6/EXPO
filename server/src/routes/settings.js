import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { tenantContext } from "../middleware/tenant.js";
import { scopeWhere, requireWriteTenant } from "../lib/scope.js";
import { verifySmtp, sendMail } from "../lib/mailer.js";

export const settingsRouter = Router();

settingsRouter.use(requireAuth, tenantContext);

// ───── SMTP Settings ─────

const smtpSchema = z.object({
  host: z.string().min(1),
  port: z.number().int().default(587),
  secure: z.boolean().default(false),
  username: z.string(),
  passwordMasked: z.string(),
  fromEmail: z.string().email(),
  fromName: z.string(),
  replyTo: z.string().email().nullish(),
});

settingsRouter.get("/smtp", async (req, res, next) => {
  try {
    const tenantId = requireWriteTenant(req);
    const smtp = await prisma.smtpSetting.findUnique({ where: { tenantId } });
    res.json(smtp);
  } catch (err) { next(err); }
});

settingsRouter.put("/smtp", requireRole("company-admin"), async (req, res, next) => {
  try {
    const tenantId = requireWriteTenant(req);
    const body = smtpSchema.parse(req.body);
    const smtp = await prisma.smtpSetting.upsert({
      where: { tenantId },
      update: body,
      create: { ...body, tenantId },
    });
    res.json(smtp);
  } catch (err) { next(err); }
});

settingsRouter.post("/smtp/test", requireRole("company-admin"), async (req, res, next) => {
  try {
    const tenantId = requireWriteTenant(req);
    const result = await verifySmtp(tenantId);
    const smtp = await prisma.smtpSetting.update({
      where: { tenantId },
      data: {
        testStatus: result.ok ? "success" : "failed",
        testError: result.ok ? null : result.error,
        testedAt: new Date(),
      },
    });
    res.json({ ok: result.ok, smtp, error: result.error });
  } catch (err) { next(err); }
});

// ───── Email Templates ─────

const emailTemplateSchema = z.object({
  scope: z.enum(["tenant", "event"]).default("tenant"),
  eventId: z.string().nullish(),
  trigger: z.string().min(1),
  name: z.string().min(1),
  subject: z.string().min(1),
  body: z.string(),
  isSystem: z.boolean().default(false),
});

settingsRouter.get("/email-templates", async (req, res, next) => {
  try {
    const where = { ...scopeWhere(req) };
    if (req.query.scope) where.scope = req.query.scope;
    if (req.query.eventId) where.eventId = req.query.eventId;
    const items = await prisma.emailTemplate.findMany({ where, orderBy: { trigger: "asc" } });
    res.json(items);
  } catch (err) { next(err); }
});

settingsRouter.post("/email-templates", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const tenantId = requireWriteTenant(req);
    const body = emailTemplateSchema.parse(req.body);
    const item = await prisma.emailTemplate.create({ data: { ...body, tenantId } });
    res.status(201).json(item);
  } catch (err) { next(err); }
});

settingsRouter.patch("/email-templates/:id", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const target = await prisma.emailTemplate.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    const body = emailTemplateSchema.partial().parse(req.body);
    const item = await prisma.emailTemplate.update({ where: { id: req.params.id }, data: body });
    res.json(item);
  } catch (err) { next(err); }
});

settingsRouter.delete("/email-templates/:id", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const target = await prisma.emailTemplate.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    await prisma.emailTemplate.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

// ───── Document Templates ─────

const docTemplateSchema = z.object({
  category: z.string().min(1),
  name: z.string().min(1),
  formats: z.string().default(".pdf"),
  required: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  fileName: z.string().nullish(),
});

settingsRouter.get("/document-templates", async (req, res, next) => {
  try {
    const items = await prisma.documentTemplate.findMany({
      where: scopeWhere(req),
      orderBy: { sortOrder: "asc" },
    });
    res.json(items);
  } catch (err) { next(err); }
});

settingsRouter.post("/document-templates", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const tenantId = requireWriteTenant(req);
    const body = docTemplateSchema.parse(req.body);
    const item = await prisma.documentTemplate.create({ data: { ...body, tenantId } });
    res.status(201).json(item);
  } catch (err) { next(err); }
});

settingsRouter.patch("/document-templates/:id", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const target = await prisma.documentTemplate.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    const body = docTemplateSchema.partial().parse(req.body);
    const item = await prisma.documentTemplate.update({ where: { id: req.params.id }, data: body });
    res.json(item);
  } catch (err) { next(err); }
});

settingsRouter.delete("/document-templates/:id", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const target = await prisma.documentTemplate.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    await prisma.documentTemplate.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

// ───── Event Documents（活動 ↔ 預設文件範本 join）─────

settingsRouter.get("/event-documents", async (req, res, next) => {
  try {
    const where = { ...scopeWhere(req), ...(req.query.eventId ? { eventId: req.query.eventId } : {}) };
    const items = await prisma.eventDocument.findMany({ where });
    res.json(items);
  } catch (err) { next(err); }
});

settingsRouter.put("/event-documents/:eventId/:templateId", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const tenantId = requireWriteTenant(req);
    const body = z.object({
      required: z.boolean().optional(),
      deadline: z.string().nullish(),
    }).parse(req.body);
    const item = await prisma.eventDocument.upsert({
      where: { eventId_templateId: { eventId: req.params.eventId, templateId: req.params.templateId } },
      update: {
        ...(body.required !== undefined ? { required: body.required } : {}),
        deadline: body.deadline ? new Date(body.deadline) : null,
      },
      create: {
        eventId: req.params.eventId,
        templateId: req.params.templateId,
        tenantId,
        required: body.required ?? true,
        deadline: body.deadline ? new Date(body.deadline) : null,
      },
    });
    res.json(item);
  } catch (err) { next(err); }
});

settingsRouter.delete("/event-documents/:eventId/:templateId", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    await prisma.eventDocument.delete({
      where: { eventId_templateId: { eventId: req.params.eventId, templateId: req.params.templateId } },
    }).catch(() => null);
    res.status(204).send();
  } catch (err) { next(err); }
});

// ───── Pre-Event Notices（展前通知）─────

const preEventSchema = z.object({
  eventId: z.string(),
  title: z.string().min(1),
  content: z.string(),
  audience: z.enum(["vendor", "decorator", "all"]).default("vendor"),
  channels: z.array(z.string()).default(["email"]),
  attachments: z.any().nullish(),
  scheduledAt: z.string().nullish(),
  status: z.enum(["draft", "scheduled", "sent"]).default("draft"),
});

settingsRouter.get("/pre-event", async (req, res, next) => {
  try {
    const where = { ...scopeWhere(req), ...(req.query.eventId ? { eventId: req.query.eventId } : {}) };
    const items = await prisma.preEventNotice.findMany({ where, orderBy: { scheduledAt: "desc" } });
    res.json(items);
  } catch (err) { next(err); }
});

settingsRouter.post("/pre-event", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const tenantId = requireWriteTenant(req);
    const body = preEventSchema.parse(req.body);
    const item = await prisma.preEventNotice.create({
      data: {
        ...body,
        tenantId,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      },
    });
    res.status(201).json(item);
  } catch (err) { next(err); }
});

settingsRouter.patch("/pre-event/:id", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const target = await prisma.preEventNotice.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    const body = preEventSchema.partial().parse(req.body);
    const data = { ...body };
    if (body.scheduledAt) data.scheduledAt = new Date(body.scheduledAt);
    const item = await prisma.preEventNotice.update({ where: { id: req.params.id }, data });
    res.json(item);
  } catch (err) { next(err); }
});

settingsRouter.post("/pre-event/:id/send", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const target = await prisma.preEventNotice.findFirst({
      where: { id: req.params.id, ...scopeWhere(req) },
      include: { event: { select: { name: true } } },
    });
    if (!target) return res.status(404).json({ error: "not_found" });

    // 撈收件人：依 audience 取出 vendors
    const vendors = await prisma.vendor.findMany({
      where: {
        eventId: target.eventId,
        ...(target.audience === "vendor" || target.audience === "all"
          ? { confirmStatus: "confirmed" }
          : {}),
      },
      select: { email: true, company: true, contact: true },
    });

    // 群發（並行，但不阻塞回應）
    const results = await Promise.all(
      vendors.map((v) =>
        sendMail({
          tenantId: target.tenantId,
          to: v.email,
          subject: `【${target.event.name}】${target.title}`,
          html: `<p>${v.company} ${v.contact || ""} 您好：</p>${target.content}`,
        }).catch((err) => ({ sent: false, reason: err.message }))
      )
    );
    const sentCount = results.filter((r) => r?.sent).length;

    const item = await prisma.preEventNotice.update({
      where: { id: req.params.id },
      data: { status: "sent", sentAt: new Date() },
    });
    res.json({ ...item, sentCount, totalRecipients: vendors.length });
  } catch (err) { next(err); }
});

settingsRouter.delete("/pre-event/:id", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const target = await prisma.preEventNotice.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    await prisma.preEventNotice.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) { next(err); }
});
