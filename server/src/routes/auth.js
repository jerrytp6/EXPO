import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });
    if (!user || user.status !== "active") {
      return res.status(401).json({ error: "invalid_credentials" });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "invalid_credentials" });

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
    });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        title: user.title,
        tenantId: user.tenantId,
        tenant: user.tenant ? { id: user.tenant.id, name: user.tenant.name } : null,
      },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { tenant: true },
    });
    if (!user) return res.status(404).json({ error: "user_not_found" });
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      title: user.title,
      tenantId: user.tenantId,
      tenant: user.tenant ? { id: user.tenant.id, name: user.tenant.name } : null,
    });
  } catch (err) {
    next(err);
  }
});

// B4 預留：業主 Portal SSO 接口（目前先 stub，B4 階段補完）
authRouter.post("/sso", async (req, res) => {
  res.status(501).json({
    error: "not_implemented",
    hint: "B4 階段實作：接 Portal token → verify → 找/建 user (external_id) → 發 EX JWT",
  });
});
