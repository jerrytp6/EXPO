import { Router } from "express";
import { z } from "zod";
import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { tenantContext } from "../middleware/tenant.js";
import { scopeWhere, requireWriteTenant } from "../lib/scope.js";

export const decoratorsRouter = Router();
export const publicDecoratorsRouter = Router();

decoratorsRouter.use(requireAuth, tenantContext);

// ───── Decorators (裝潢廠商主檔) ─────

const decoratorSchema = z.object({
  name: z.string().min(1),
  taxId: z.string().nullish(),
  email: z.string().email(),
  phone: z.string().nullish(),
  address: z.string().nullish(),
  contact: z.string().nullish(),
  title: z.string().nullish(),
  specialties: z.any().nullish(),
  status: z.enum(["active", "inactive"]).default("active"),
});

decoratorsRouter.get("/", async (req, res, next) => {
  try {
    const decorators = await prisma.decorator.findMany({
      where: scopeWhere(req),
      orderBy: { createdAt: "desc" },
    });
    res.json(decorators);
  } catch (err) { next(err); }
});

decoratorsRouter.get("/:id", async (req, res, next) => {
  try {
    const d = await prisma.decorator.findFirst({
      where: { id: req.params.id, ...scopeWhere(req) },
      include: { projects: { include: { event: { select: { id: true, name: true } } } } },
    });
    if (!d) return res.status(404).json({ error: "not_found" });
    res.json(d);
  } catch (err) { next(err); }
});

decoratorsRouter.post("/", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const tenantId = requireWriteTenant(req);
    const body = decoratorSchema.parse(req.body);
    const d = await prisma.decorator.create({ data: { ...body, tenantId } });
    res.status(201).json(d);
  } catch (err) { next(err); }
});

decoratorsRouter.patch("/:id", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const target = await prisma.decorator.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    const body = decoratorSchema.partial().parse(req.body);
    const d = await prisma.decorator.update({ where: { id: req.params.id }, data: body });
    res.json(d);
  } catch (err) { next(err); }
});

decoratorsRouter.delete("/:id", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const target = await prisma.decorator.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    await prisma.decorator.update({ where: { id: req.params.id }, data: { status: "inactive" } });
    res.status(204).send();
  } catch (err) { next(err); }
});

// ───── Decoration Projects ─────

const projectSchema = z.object({
  eventId: z.string(),
  vendorId: z.string(),
  decoratorId: z.string(),
  title: z.string().min(1),
  status: z.enum(["pending", "in-progress", "done"]).default("pending"),
  budget: z.union([z.number(), z.string()]).nullish(),
  deadline: z.string().nullish(),
});

decoratorsRouter.get("/projects/list", async (req, res, next) => {
  try {
    const where = { ...scopeWhere(req) };
    if (req.query.eventId) where.eventId = req.query.eventId;
    if (req.query.vendorId) where.vendorId = req.query.vendorId;
    if (req.query.decoratorId) where.decoratorId = req.query.decoratorId;
    const projects = await prisma.decorationProject.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        decorator: { select: { id: true, name: true } },
        vendor: { select: { id: true, company: true } },
        event: { select: { id: true, name: true } },
      },
    });
    res.json(projects);
  } catch (err) { next(err); }
});

decoratorsRouter.post("/projects", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const tenantId = requireWriteTenant(req);
    const body = projectSchema.parse(req.body);
    const p = await prisma.decorationProject.create({
      data: {
        ...body,
        tenantId,
        budget: body.budget ? String(body.budget) : null,
        deadline: body.deadline ? new Date(body.deadline) : null,
      },
    });
    res.status(201).json(p);
  } catch (err) { next(err); }
});

decoratorsRouter.patch("/projects/:id", async (req, res, next) => {
  try {
    const target = await prisma.decorationProject.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    const body = projectSchema.partial().parse(req.body);
    const data = { ...body };
    if (body.budget !== undefined) data.budget = body.budget ? String(body.budget) : null;
    if (body.deadline !== undefined) data.deadline = body.deadline ? new Date(body.deadline) : null;
    const p = await prisma.decorationProject.update({ where: { id: req.params.id }, data });
    res.json(p);
  } catch (err) { next(err); }
});

// ───── Designs（設計圖版本管理）─────

decoratorsRouter.get("/projects/:projectId/designs", async (req, res, next) => {
  try {
    const designs = await prisma.design.findMany({
      where: { projectId: req.params.projectId, ...scopeWhere(req) },
      orderBy: { uploadedAt: "desc" },
    });
    res.json(designs);
  } catch (err) { next(err); }
});

decoratorsRouter.post("/projects/:projectId/designs", async (req, res, next) => {
  try {
    const tenantId = requireWriteTenant(req);
    const body = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      version: z.number().int().default(1),
    }).parse(req.body);
    const project = await prisma.decorationProject.findFirst({
      where: { id: req.params.projectId, tenantId },
    });
    if (!project) return res.status(404).json({ error: "project_not_found" });
    const design = await prisma.design.create({
      data: {
        ...body,
        tenantId,
        projectId: project.id,
        status: "pending",
      },
    });
    res.status(201).json(design);
  } catch (err) { next(err); }
});

decoratorsRouter.patch("/designs/:id/review", async (req, res, next) => {
  try {
    const target = await prisma.design.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    const { status, feedback } = z.object({
      status: z.enum(["approved", "rejected"]),
      feedback: z.string().optional(),
    }).parse(req.body);
    const updated = await prisma.design.update({
      where: { id: req.params.id },
      data: { status, feedback: feedback || null },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

// ───── Messages ─────

decoratorsRouter.get("/projects/:projectId/messages", async (req, res, next) => {
  try {
    const msgs = await prisma.message.findMany({
      where: { projectId: req.params.projectId, ...scopeWhere(req) },
      orderBy: { at: "asc" },
    });
    res.json(msgs);
  } catch (err) { next(err); }
});

decoratorsRouter.post("/projects/:projectId/messages", async (req, res, next) => {
  try {
    const tenantId = requireWriteTenant(req);
    const body = z.object({
      sender: z.enum(["vendor", "decorator", "admin"]),
      senderName: z.string(),
      content: z.string().min(1),
    }).parse(req.body);
    const msg = await prisma.message.create({
      data: { ...body, tenantId, projectId: req.params.projectId },
    });
    res.status(201).json(msg);
  } catch (err) { next(err); }
});

// ───── Decorator Invitations（廠商邀請裝潢商）─────

decoratorsRouter.post("/invite", async (req, res, next) => {
  try {
    const tenantId = requireWriteTenant(req);
    const body = z.object({
      eventId: z.string(),
      fromVendorId: z.string(),
      decoratorEmail: z.string().email(),
      decoratorCompany: z.string().optional(),
      message: z.string().optional(),
    }).parse(req.body);
    const token = crypto.randomBytes(16).toString("hex");
    const inv = await prisma.decoratorInvitation.create({
      data: {
        token,
        tenantId,
        eventId: body.eventId,
        fromVendorId: body.fromVendorId,
        decoratorEmail: body.decoratorEmail,
        decoratorCompany: body.decoratorCompany,
        message: body.message,
        status: "sent",
        expiresAt: new Date(Date.now() + 30 * 86400_000),
      },
    });
    res.status(201).json(inv);
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════════════════════
// 公開 token endpoints（裝潢商接收邀約）
// ═══════════════════════════════════════════════════════════════════════

publicDecoratorsRouter.get("/decor-invite/:token", async (req, res, next) => {
  try {
    const inv = await prisma.decoratorInvitation.findUnique({
      where: { token: req.params.token },
      include: { event: { select: { id: true, name: true, location: true, startDate: true, endDate: true } } },
    });
    if (!inv) return res.status(404).json({ error: "invalid_token" });
    if (inv.expiresAt < new Date()) return res.status(410).json({ error: "expired" });
    res.json(inv);
  } catch (err) { next(err); }
});

publicDecoratorsRouter.post("/decor-invite/:token/respond", async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(["accepted", "declined"]) }).parse(req.body);
    const inv = await prisma.decoratorInvitation.update({
      where: { token: req.params.token },
      data: { status },
    });
    res.json(inv);
  } catch (err) { next(err); }
});
