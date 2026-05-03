import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { tenantContext } from "../middleware/tenant.js";
import { scopeWhere, requireWriteTenant } from "../lib/scope.js";

export const usersRouter = Router();

usersRouter.use(requireAuth, tenantContext);

const ROLES = ["portal-admin", "super-admin", "company-admin", "event-manager", "member"];

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(ROLES),
  title: z.string().nullish(),
  password: z.string().min(6).optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  tenantId: z.string().nullish(),
});

// list — 跨租戶角色看全部、其他只看自己 tenant
usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: scopeWhere(req),
      orderBy: { createdAt: "desc" },
      select: {
        id: true, email: true, name: true, role: true, title: true, status: true,
        tenantId: true, createdAt: true,
        tenant: { select: { id: true, name: true } },
      },
    });
    res.json(users);
  } catch (err) { next(err); }
});

usersRouter.get("/:id", async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.params.id, ...scopeWhere(req) },
      include: { tenant: { select: { id: true, name: true } } },
    });
    if (!user) return res.status(404).json({ error: "not_found" });
    const { passwordHash, ...rest } = user;
    res.json(rest);
  } catch (err) { next(err); }
});

usersRouter.post("/", requireRole("portal-admin", "super-admin", "company-admin"), async (req, res, next) => {
  try {
    const body = userSchema.parse(req.body);
    if (!body.password) return res.status(400).json({ error: "password_required" });
    // company-admin 只能在自己 tenant 內建帳號
    let tenantId = body.tenantId ?? req.user.tenantId;
    if (req.user.role === "company-admin") tenantId = req.user.tenantId;
    if (!["portal-admin", "super-admin"].includes(body.role) && !tenantId) {
      return res.status(400).json({ error: "tenant_required" });
    }
    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        role: body.role,
        title: body.title,
        status: body.status,
        tenantId,
        passwordHash,
      },
    });
    const { passwordHash: _ph, ...rest } = user;
    res.status(201).json(rest);
  } catch (err) { next(err); }
});

usersRouter.patch("/:id", async (req, res, next) => {
  try {
    const body = userSchema.partial().parse(req.body);
    // 限制：member / event-manager 不能改別人；company-admin 限自己 tenant
    const target = await prisma.user.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    const data = { ...body };
    delete data.password;
    if (body.password) data.passwordHash = await bcrypt.hash(body.password, 10);
    const updated = await prisma.user.update({ where: { id: req.params.id }, data });
    const { passwordHash: _, ...rest } = updated;
    res.json(rest);
  } catch (err) { next(err); }
});

usersRouter.delete("/:id", requireRole("portal-admin", "super-admin", "company-admin"), async (req, res, next) => {
  try {
    const target = await prisma.user.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    await prisma.user.update({ where: { id: req.params.id }, data: { status: "inactive" } });
    res.status(204).send();
  } catch (err) { next(err); }
});

// ───── 細粒度權限 overrides ─────

const permSchema = z.object({
  resource: z.string().min(1),
  action: z.string().min(1),
  allow: z.boolean().default(true),
});

usersRouter.get("/:id/permissions", async (req, res, next) => {
  try {
    const perms = await prisma.memberPermOverride.findMany({
      where: { userId: req.params.id, ...scopeWhere(req) },
    });
    res.json(perms);
  } catch (err) { next(err); }
});

usersRouter.put("/:id/permissions", requireRole("portal-admin", "super-admin", "company-admin"), async (req, res, next) => {
  try {
    const tenantId = requireWriteTenant(req);
    const body = z.array(permSchema).parse(req.body);
    await prisma.$transaction(async (tx) => {
      await tx.memberPermOverride.deleteMany({ where: { userId: req.params.id, tenantId } });
      if (body.length) {
        await tx.memberPermOverride.createMany({
          data: body.map((p) => ({ ...p, userId: req.params.id, tenantId })),
        });
      }
    });
    const perms = await prisma.memberPermOverride.findMany({ where: { userId: req.params.id } });
    res.json(perms);
  } catch (err) { next(err); }
});
