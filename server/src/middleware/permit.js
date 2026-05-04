// permit(resource, action) middleware
// 套在敏感 endpoint 上：先 requireAuth 後接此 middleware
//
// 用法：
//   eventsRouter.delete("/:id", requireAuth, tenantContext, permit("events", "delete"), handler);

import { checkPermission } from "../lib/permissions.js";

export function permit(resource, action) {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "unauthorized" });
    try {
      const ok = await checkPermission(req.user.userId, req.user.role, resource, action, req.user.tenantId);
      if (!ok) return res.status(403).json({ error: "forbidden", required: `${resource}.${action}` });
      next();
    } catch (err) {
      next(err);
    }
  };
}
