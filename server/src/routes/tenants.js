import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const tenantsRouter = Router();

// 全部 portal-admin / super-admin 跨租戶可讀；寫入限 portal-admin
tenantsRouter.use(requireAuth);

const tenantSchema = z.object({
  name: z.string().min(1),
  taxId: z.string().nullish(),
  industry: z.string().nullish(),
  size: z.string().nullish(),
  address: z.string().nullish(),
  phone: z.string().nullish(),
  status: z.enum(["active", "suspended"]).default("active"),
  externalId: z.string().nullish(),
});

// list
tenantsRouter.get("/", requireRole("portal-admin", "super-admin"), async (req, res, next) => {
  try {
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { users: true, events: true } } },
    });
    res.json(tenants);
  } catch (err) { next(err); }
});

// detail
tenantsRouter.get("/:id", requireRole("portal-admin", "super-admin"), async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.params.id },
      include: {
        subsystems: true,
        _count: { select: { users: true, events: true } },
      },
    });
    if (!tenant) return res.status(404).json({ error: "not_found" });
    res.json(tenant);
  } catch (err) { next(err); }
});

// create
tenantsRouter.post("/", requireRole("portal-admin"), async (req, res, next) => {
  try {
    const data = tenantSchema.parse(req.body);
    const tenant = await prisma.tenant.create({ data });
    res.status(201).json(tenant);
  } catch (err) { next(err); }
});

// update
tenantsRouter.patch("/:id", requireRole("portal-admin"), async (req, res, next) => {
  try {
    const data = tenantSchema.partial().parse(req.body);
    const tenant = await prisma.tenant.update({ where: { id: req.params.id }, data });
    res.json(tenant);
  } catch (err) { next(err); }
});

// delete (soft：set status=suspended)
tenantsRouter.delete("/:id", requireRole("portal-admin"), async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.update({
      where: { id: req.params.id },
      data: { status: "suspended" },
    });
    res.json(tenant);
  } catch (err) { next(err); }
});

// ───── 子系統開通（portal-admin 操作）─────

const subsystemSchema = z.object({
  subsystemKey: z.string().min(1),
  externalId: z.string().nullish(),
  contractEnd: z.string().datetime().nullish(),
});

tenantsRouter.get("/:id/subsystems", requireRole("portal-admin", "super-admin"), async (req, res, next) => {
  try {
    const subs = await prisma.tenantSubsystem.findMany({ where: { tenantId: req.params.id } });
    res.json(subs);
  } catch (err) { next(err); }
});

tenantsRouter.put("/:id/subsystems/:key", requireRole("portal-admin"), async (req, res, next) => {
  try {
    const body = subsystemSchema.partial().parse(req.body);
    const sub = await prisma.tenantSubsystem.upsert({
      where: { tenantId_subsystemKey: { tenantId: req.params.id, subsystemKey: req.params.key } },
      update: { externalId: body.externalId, contractEnd: body.contractEnd ? new Date(body.contractEnd) : null },
      create: {
        tenantId: req.params.id,
        subsystemKey: req.params.key,
        externalId: body.externalId,
        contractEnd: body.contractEnd ? new Date(body.contractEnd) : null,
      },
    });
    res.json(sub);
  } catch (err) { next(err); }
});

tenantsRouter.delete("/:id/subsystems/:key", requireRole("portal-admin"), async (req, res, next) => {
  try {
    await prisma.tenantSubsystem.delete({
      where: { tenantId_subsystemKey: { tenantId: req.params.id, subsystemKey: req.params.key } },
    });
    res.status(204).send();
  } catch (err) { next(err); }
});
