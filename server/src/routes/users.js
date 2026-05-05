import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { tenantContext } from "../middleware/tenant.js";
import { scopeWhere, requireWriteTenant } from "../lib/scope.js";
import { parseListOpts, sendList } from "../lib/list-query.js";

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
    const opts = parseListOpts(req, {
      searchFields: ["name", "email", "title"],
      allowedFilters: ["role", "status", "tenantId"],
    });
    const where = { ...scopeWhere(req), ...opts.where };
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: opts.skip,
        take: opts.take,
        select: {
          id: true, email: true, name: true, role: true, title: true, status: true,
          tenantId: true, createdAt: true,
          tenant: { select: { id: true, name: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    sendList(res, req, users, total);
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

// ───── Role-level permissions（tenant 客製化）─────

usersRouter.get("/role-permissions/:role", async (req, res, next) => {
  try {
    const tenantId = requireWriteTenant(req);
    const perms = await prisma.rolePermission.findMany({
      where: { tenantId, role: req.params.role },
    });
    res.json(perms);
  } catch (err) { next(err); }
});

// 整批替換指定 role 的權限
usersRouter.put("/role-permissions/:role", requireRole("portal-admin", "super-admin", "company-admin"), async (req, res, next) => {
  try {
    const tenantId = requireWriteTenant(req);
    const role = req.params.role;
    const body = z.array(z.object({
      resource: z.string(),
      action: z.string(),
      allow: z.boolean().default(true),
    })).parse(req.body);
    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { tenantId, role } });
      if (body.length) {
        await tx.rolePermission.createMany({
          data: body.map((p) => ({ ...p, tenantId, role })),
        });
      }
    });
    const perms = await prisma.rolePermission.findMany({ where: { tenantId, role } });
    res.json(perms);
  } catch (err) { next(err); }
});

// 單筆設定 / 移除（前端 toggle）
usersRouter.patch("/role-permissions/:role/:resource/:action", requireRole("portal-admin", "super-admin", "company-admin"), async (req, res, next) => {
  try {
    const tenantId = requireWriteTenant(req);
    const { role, resource, action } = req.params;
    const { allow } = z.object({ allow: z.boolean() }).parse(req.body);
    const perm = await prisma.rolePermission.upsert({
      where: { tenantId_role_resource_action: { tenantId, role, resource, action } },
      update: { allow },
      create: { tenantId, role, resource, action, allow },
    });
    res.json(perm);
  } catch (err) { next(err); }
});

usersRouter.delete("/role-permissions/:role/:resource/:action", requireRole("portal-admin", "super-admin", "company-admin"), async (req, res, next) => {
  try {
    const tenantId = requireWriteTenant(req);
    const { role, resource, action } = req.params;
    await prisma.rolePermission.deleteMany({
      where: { tenantId, role, resource, action },
    });
    res.status(204).send();
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
