// Tenant 範圍輔助：把 req.tenantId 注入到 where 條件
//
// 使用方式：
//   const events = await prisma.event.findMany({ where: scopeWhere(req, { status: "active" }) });
//
// 規則：
// - 跨租戶角色 (portal-admin / super-admin) 且沒帶 ?tenantId → 看全部
// - 其他情況 → 強制 WHERE tenant_id = req.tenantId
//
// Phase B2 會把這個換成 Prisma extension 自動處理，目前手動。

export function scopeWhere(req, extra = {}) {
  if (req.isCrossTenant && !req.tenantId) return extra;
  return { ...extra, tenantId: req.tenantId };
}

// 寫入時自動補 tenantId（建立資源）
export function withTenant(req, data) {
  if (!req.tenantId) {
    throw Object.assign(new Error("tenant_required_for_write"), { statusCode: 400 });
  }
  return { ...data, tenantId: req.tenantId };
}

// 嘗試取得 tenantId（寫入用）— 跨租戶角色必須帶 ?tenantId
export function requireWriteTenant(req) {
  if (!req.tenantId) {
    const err = new Error("tenant_required");
    err.statusCode = 400;
    throw err;
  }
  return req.tenantId;
}
