// 權限矩陣 — PPT slide 14「帳號管理」對應的權限細粒度
//
// 規則：
// - DEFAULT_ROLE_PERMS：每個角色的預設權限
// - user-specific override（member_perm_overrides 表）可蓋過 role default
// - 跨租戶角色（portal-admin / super-admin）一律放行
//
// permission key 格式：resource.action（如 events.create / vendors.invite）

import { prisma } from "./prisma.js";

// 對應前端 Permissions.jsx 的 UI keys（PPT slide 14）
export const DEFAULT_ROLE_PERMS = {
  "portal-admin": "*",  // 跨租戶超管
  "super-admin": "*",   // EX 維運
  "company-admin": {
    "members.view": true, "members.invite": true, "members.edit": true,
    "members.remove": true, "members.permissions": true,
    "events.view": true, "events.create": true, "events.edit": true,
    "events.delete": true, "events.assign": true,
    "vendors.view": true, "vendors.import": true, "vendors.invite": true,
    "vendors.monitor": true,
    "forms.view": true, "forms.edit": true, "forms.review": true,
    "equipment.view": true, "equipment.edit": true, "equipment.review": true,
    "notices.view": true, "notices.edit": true,
    "decoration.view": true, "decoration.manage": true,
    "analytics.view": true, "analytics.export": true,
    "settings.company": true, "settings.billing": true,
    "settings.smtp": true, "settings.emailTemplates": true,
    "settings.documentTemplates": true,
  },
  "event-manager": {
    "members.view": true, "members.invite": false, "members.edit": false,
    "members.remove": false, "members.permissions": false,
    "events.view": true, "events.create": false, "events.edit": true,
    "events.delete": false, "events.assign": false,
    "vendors.view": true, "vendors.import": true, "vendors.invite": true,
    "vendors.monitor": true,
    "forms.view": true, "forms.edit": true, "forms.review": true,
    "equipment.view": true, "equipment.edit": true, "equipment.review": true,
    "notices.view": true, "notices.edit": true,
    "decoration.view": true, "decoration.manage": false,
    "analytics.view": true, "analytics.export": false,
    "settings.company": false, "settings.billing": false,
    "settings.smtp": false, "settings.emailTemplates": true,
    "settings.documentTemplates": true,
  },
  "member": {
    "members.view": true, "events.view": true, "vendors.view": true,
    "forms.view": true, "equipment.view": true, "notices.view": true,
    "decoration.view": true, "analytics.view": false,
    // 預設沒有任何寫入權限；可由 company-admin 對特定 user 開 override
  },
};

// 檢查 role + override 後是否有該權限
export function hasPermissionStatic(role, resource, action, overrides = []) {
  const key = `${resource}.${action}`;
  // user override 優先
  const ov = overrides.find((o) => o.resource === resource && o.action === action);
  if (ov) return ov.allow;
  // role default
  const perms = DEFAULT_ROLE_PERMS[role];
  if (perms === "*") return true;
  if (!perms) return false;
  return !!perms[key];
}

// 從 DB 撈 user override + role default 算 effective permissions
export async function getEffectivePermissions(userId, role) {
  if (DEFAULT_ROLE_PERMS[role] === "*") return { "*": true };
  const overrides = await prisma.memberPermOverride.findMany({ where: { userId } });
  const out = { ...(DEFAULT_ROLE_PERMS[role] || {}) };
  for (const ov of overrides) {
    out[`${ov.resource}.${ov.action}`] = ov.allow;
  }
  return out;
}

// async 版本（讀 DB 取 override + tenant role permission）
// 優先級（高 → 低）：
//   1. user-specific override (member_perm_overrides)
//   2. tenant-level role permission (role_permissions)
//   3. DEFAULT_ROLE_PERMS
export async function checkPermission(userId, role, resource, action, tenantId = null) {
  if (DEFAULT_ROLE_PERMS[role] === "*") return true;

  // 1. user override
  const userOv = await prisma.memberPermOverride.findFirst({
    where: { userId, resource, action },
  });
  if (userOv) return userOv.allow;

  // 2. tenant role permission
  if (tenantId) {
    const rolePerm = await prisma.rolePermission.findFirst({
      where: { tenantId, role, resource, action },
    });
    if (rolePerm) return rolePerm.allow;
  }

  // 3. role default
  return hasPermissionStatic(role, resource, action);
}

// effective permissions = role default + tenant role overrides + user overrides
export async function getEffectivePermissionsWithTenant(userId, role, tenantId) {
  if (DEFAULT_ROLE_PERMS[role] === "*") return { "*": true };
  const out = { ...(DEFAULT_ROLE_PERMS[role] || {}) };

  // tenant role 客製化
  if (tenantId) {
    const rolePerms = await prisma.rolePermission.findMany({
      where: { tenantId, role },
    });
    for (const r of rolePerms) {
      out[`${r.resource}.${r.action}`] = r.allow;
    }
  }

  // user override
  const userOvs = await prisma.memberPermOverride.findMany({ where: { userId } });
  for (const ov of userOvs) {
    out[`${ov.resource}.${ov.action}`] = ov.allow;
  }
  return out;
}
