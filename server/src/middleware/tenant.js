// 租戶上下文 middleware
// 把 req.user.tenantId 提升為 req.tenantId，供 router 與 query 使用。
//
// portal-admin / super-admin 為跨租戶角色：
//   - 預設 req.tenantId = null（看全部）
//   - 可透過 ?tenantId=xxx query 顯式指定切換到單一租戶視角
//
// 其他角色：強制使用 JWT 內的 tenantId，忽略任何 query override。

const CROSS_TENANT_ROLES = new Set(["portal-admin", "super-admin"]);

export function tenantContext(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "unauthorized" });
  if (CROSS_TENANT_ROLES.has(req.user.role)) {
    req.tenantId = req.query.tenantId || null;
    req.isCrossTenant = true;
  } else {
    if (!req.user.tenantId) {
      return res.status(403).json({ error: "tenant_required" });
    }
    req.tenantId = req.user.tenantId;
    req.isCrossTenant = false;
  }
  next();
}

// 若 endpoint 要求必須指定單一租戶（例如 list events），用此中介
export function requireTenantScope(req, res, next) {
  if (!req.tenantId) {
    return res.status(400).json({ error: "tenant_scope_required", hint: "?tenantId=xxx" });
  }
  next();
}
