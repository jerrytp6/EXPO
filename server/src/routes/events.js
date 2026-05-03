import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { tenantContext } from "../middleware/tenant.js";
import { scopeWhere, requireWriteTenant } from "../lib/scope.js";

export const eventsRouter = Router();

eventsRouter.use(requireAuth, tenantContext);

const eventSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  description: z.string().nullish(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  location: z.string().nullish(),
  status: z.enum(["draft", "active", "closed"]).default("draft"),
  managerId: z.string().nullish(),
  capacity: z.number().int().nonnegative().default(0),
  boothSelfSelectionEnabled: z.boolean().default(false),
});

eventsRouter.get("/", async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      where: scopeWhere(req),
      orderBy: { startDate: "desc" },
      include: {
        manager: { select: { id: true, name: true } },
        boothTypes: { orderBy: { sortOrder: "asc" } },
        _count: { select: { vendors: true } },
      },
    });
    res.json(events);
  } catch (err) { next(err); }
});

eventsRouter.get("/:id", async (req, res, next) => {
  try {
    const event = await prisma.event.findFirst({
      where: { id: req.params.id, ...scopeWhere(req) },
      include: {
        manager: { select: { id: true, name: true } },
        boothTypes: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (!event) return res.status(404).json({ error: "not_found" });
    res.json(event);
  } catch (err) { next(err); }
});

eventsRouter.post("/", requireRole("company-admin", "event-manager", "super-admin", "portal-admin"), async (req, res, next) => {
  try {
    const tenantId = requireWriteTenant(req);
    const body = eventSchema.parse(req.body);
    const event = await prisma.event.create({
      data: {
        ...body,
        tenantId,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
      },
    });
    res.status(201).json(event);
  } catch (err) { next(err); }
});

eventsRouter.patch("/:id", requireRole("company-admin", "event-manager", "super-admin", "portal-admin"), async (req, res, next) => {
  try {
    const target = await prisma.event.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    const body = eventSchema.partial().parse(req.body);
    const data = { ...body };
    if (body.startDate) data.startDate = new Date(body.startDate);
    if (body.endDate) data.endDate = new Date(body.endDate);
    const event = await prisma.event.update({ where: { id: req.params.id }, data });
    res.json(event);
  } catch (err) { next(err); }
});

eventsRouter.delete("/:id", requireRole("company-admin", "super-admin", "portal-admin"), async (req, res, next) => {
  try {
    const target = await prisma.event.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    await prisma.event.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

// PPT slide 10：攤位分配模式切換
eventsRouter.patch("/:id/booth-self-selection", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const { enabled } = z.object({ enabled: z.boolean() }).parse(req.body);
    const target = await prisma.event.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: { boothSelfSelectionEnabled: enabled },
    });
    res.json(event);
  } catch (err) { next(err); }
});

// ───── Booth Types（隸屬於 event）─────

const boothTypeSchema = z.object({
  name: z.string().min(1),
  size: z.string().nullish(),
  price: z.union([z.number(), z.string()]),
  capacity: z.number().int().nonnegative().default(0),
  description: z.string().nullish(),
  sortOrder: z.number().int().default(0),
});

eventsRouter.get("/:eventId/booth-types", async (req, res, next) => {
  try {
    const types = await prisma.boothType.findMany({
      where: { eventId: req.params.eventId, ...scopeWhere(req) },
      orderBy: { sortOrder: "asc" },
    });
    res.json(types);
  } catch (err) { next(err); }
});

eventsRouter.post("/:eventId/booth-types", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const tenantId = requireWriteTenant(req);
    const body = boothTypeSchema.parse(req.body);
    const event = await prisma.event.findFirst({ where: { id: req.params.eventId, tenantId } });
    if (!event) return res.status(404).json({ error: "event_not_found" });
    const bt = await prisma.boothType.create({
      data: { ...body, eventId: req.params.eventId, tenantId, price: body.price.toString() },
    });
    res.status(201).json(bt);
  } catch (err) { next(err); }
});

eventsRouter.patch("/:eventId/booth-types/:btId", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const body = boothTypeSchema.partial().parse(req.body);
    const target = await prisma.boothType.findFirst({
      where: { id: req.params.btId, eventId: req.params.eventId, ...scopeWhere(req) },
    });
    if (!target) return res.status(404).json({ error: "not_found" });
    const data = { ...body };
    if (body.price !== undefined) data.price = body.price.toString();
    const bt = await prisma.boothType.update({ where: { id: req.params.btId }, data });
    res.json(bt);
  } catch (err) { next(err); }
});

eventsRouter.delete("/:eventId/booth-types/:btId", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const target = await prisma.boothType.findFirst({
      where: { id: req.params.btId, eventId: req.params.eventId, ...scopeWhere(req) },
    });
    if (!target) return res.status(404).json({ error: "not_found" });
    await prisma.boothType.delete({ where: { id: req.params.btId } });
    res.status(204).send();
  } catch (err) { next(err); }
});
