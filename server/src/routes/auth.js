import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import { requireAuth } from "../middleware/auth.js";
import { getEffectivePermissionsWithTenant } from "../lib/permissions.js";
import { sendByTrigger, appUrl } from "../lib/mailer.js";

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

// ═══════════════════════════════════════════════════════════════════════
// E6：忘記密碼 / 重設密碼
// ═══════════════════════════════════════════════════════════════════════
//
// 設計：
// - reset token 是短期 JWT（1h），purpose="password_reset"
// - 不存 DB（無狀態），重設後 user.passwordHash 變動讓舊 token 隱性失效
// - forgot 不論 email 是否存在都回 200（防 email enumeration）

const forgotSchema = z.object({ email: z.string().email() });
const resetSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(6),
});

authRouter.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = forgotSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && user.status === "active") {
      // 1h JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, purpose: "password_reset", hashHint: user.passwordHash.slice(-8) },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );
      // 寄信（builtin fallback）
      sendByTrigger({
        tenantId: user.tenantId || "_system",
        trigger: "password_reset",
        to: user.email,
        vars: {
          user: { name: user.name, email: user.email },
          reset_url: appUrl(`/reset-password?token=${token}`),
          ttl: "1 小時",
        },
      }).catch((err) => console.warn("[forgot] mail failed", err.message));
    }
    // 不論結果都回 200（防 enumeration）
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/reset-password", async (req, res, next) => {
  try {
    const { token, newPassword } = resetSchema.parse(req.body);
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: "invalid_or_expired_token" });
    }
    if (payload.purpose !== "password_reset") {
      return res.status(401).json({ error: "wrong_token_purpose" });
    }
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.status !== "active") {
      return res.status(404).json({ error: "user_not_found" });
    }
    // 防重放：token 簽發時的 hash 尾段必須對應當下的 passwordHash
    if (payload.hashHint && user.passwordHash.slice(-8) !== payload.hashHint) {
      return res.status(401).json({ error: "token_already_used" });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    res.json({ ok: true, email: user.email });
  } catch (err) {
    next(err);
  }
});

// Effective permissions（role default + user overrides）
authRouter.get("/me/permissions", requireAuth, async (req, res, next) => {
  try {
    const perms = await getEffectivePermissionsWithTenant(
      req.user.userId, req.user.role, req.user.tenantId
    );
    res.json({ role: req.user.role, perms });
  } catch (err) { next(err); }
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

// ═══════════════════════════════════════════════════════════════════════
// B4：業主 Portal SSO 接口
// ═══════════════════════════════════════════════════════════════════════
//
// PPT slide 3 規格：Portal token 包含 6 欄位
//   portalUserId · username · role · companyId · tenantId · subsystemUserId
//
// 流程：
//   1. 業主 Portal 完成自家認證 → 簽發 SSO token → 跳轉到 EX `/sso?token=xxx`
//   2. EX 前端 SsoReceiver 把 token 送到 POST /auth/sso
//   3. EX 後端：
//      a. 解 token（JWT 驗章 / dev 模式用 base64）
//      b. 用 token.companyId（= tenantId）查本地 tenant.externalId
//      c. 用 token.subsystemUserId 或 token.username(email) 查本地 user.externalId
//         - 找不到 user：自動建立（auto-provision）
//      d. 簽 EX 自家 JWT 回傳
//
// 兩種驗證模式：
//   - JWT mode（生產）：env PORTAL_SSO_PUBLIC_KEY 設好（PEM）→ jwt.verify(token, pub, RS256)
//   - dev base64 mode：未設 PUBLIC_KEY → 接受 base64(JSON) 明文 token（demo 用）

function decodePortalToken(token) {
  const pubKey = process.env.PORTAL_SSO_PUBLIC_KEY;
  if (pubKey) {
    // 生產：JWT RS256 驗章
    return jwt.verify(token, pubKey, { algorithms: ["RS256"] });
  }
  // dev 模式：base64(JSON) — 對應前端 PortalHome 舊邏輯
  try {
    const json = Buffer.from(token, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch (err) {
    throw new Error("malformed_token");
  }
}

const ssoSchema = z.object({
  token: z.string().min(1),
});

authRouter.post("/sso", async (req, res, next) => {
  try {
    const { token } = ssoSchema.parse(req.body);

    let payload;
    try {
      payload = decodePortalToken(token);
    } catch (err) {
      return res.status(401).json({ error: "invalid_sso_token", detail: err.message });
    }

    // 必填欄位檢查（PPT slide 3 規格）
    const requiredFields = ["portalUserId", "username", "role"];
    for (const f of requiredFields) {
      if (!payload[f]) {
        return res.status(400).json({ error: "missing_sso_field", field: f });
      }
    }

    // companyId 與 tenantId 在 PPT 模型中等價
    const portalTenantId = payload.companyId || payload.tenantId;
    const isCrossTenantRole = ["portal-admin", "super-admin"].includes(payload.role);

    if (!isCrossTenantRole && !portalTenantId) {
      return res.status(400).json({ error: "tenant_required_for_role", role: payload.role });
    }

    // ───── 找 tenant（用 external_id 映射）─────
    let tenant = null;
    if (portalTenantId) {
      tenant = await prisma.tenant.findFirst({
        where: { OR: [{ externalId: portalTenantId }, { id: portalTenantId }] },
      });
      if (!tenant) {
        return res.status(404).json({
          error: "tenant_not_provisioned",
          hint: "請先在 Portal 開通子系統，將觸發 EX 端 tenant provisioning",
          portalTenantId,
        });
      }
    }

    // ───── 找 user（subsystemUserId 或 username/email）─────
    let user = null;
    if (payload.subsystemUserId) {
      user = await prisma.user.findFirst({
        where: { OR: [{ externalId: payload.subsystemUserId }, { id: payload.subsystemUserId }] },
      });
    }
    if (!user && payload.username) {
      user = await prisma.user.findUnique({ where: { email: payload.username } });
    }

    // 自動 provisioning：找不到就建（首次 SSO 登入）
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.username,
          name: payload.name || payload.username.split("@")[0],
          role: payload.role,
          tenantId: tenant?.id || null,
          externalId: payload.subsystemUserId || payload.portalUserId,
          // SSO user 不需密碼（永遠走 SSO 登入）— 設個強 random hash 防直登
          passwordHash: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10),
          status: "active",
        },
      });
    } else {
      // 已存在：同步 externalId / role / tenantId（trust Portal）
      const updates = {};
      if (!user.externalId && payload.subsystemUserId) updates.externalId = payload.subsystemUserId;
      if (user.role !== payload.role) updates.role = payload.role;
      if (tenant && user.tenantId !== tenant.id) updates.tenantId = tenant.id;
      if (Object.keys(updates).length) {
        user = await prisma.user.update({ where: { id: user.id }, data: updates });
      }
    }

    // 一致性 guard：非跨租戶角色，token 與 user 的 tenant 必須對應
    if (!isCrossTenantRole && user.tenantId !== tenant?.id) {
      return res.status(403).json({ error: "tenant_mismatch" });
    }

    // ───── 簽 EX 自家 JWT ─────
    const exToken = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
    });

    res.json({
      token: exToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        title: user.title,
        tenantId: user.tenantId,
        tenant: tenant ? { id: tenant.id, name: tenant.name } : null,
      },
      portalUserId: payload.portalUserId,
    });
  } catch (err) {
    next(err);
  }
});
