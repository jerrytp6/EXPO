import { verifyToken } from "../lib/jwt.js";

// 解析 Authorization: Bearer <jwt>
// 驗證成功時注入 req.user = { userId, role, tenantId, email, name }
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "missing_token" });
  }
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "invalid_token", detail: err.message });
  }
}

// 角色守門：requireRole("portal-admin", "super-admin")
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "forbidden", required: roles });
    }
    next();
  };
}
