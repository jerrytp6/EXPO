// Prisma extension：multi-tenant 自動 inject WHERE tenant_id
//
// 用法：
//   const tx = makeTenantClient(req.tenantId, req.isCrossTenant);
//   const events = await tx.event.findMany();   // 自動帶 WHERE tenant_id = req.tenantId
//   const v = await tx.vendor.create({ data });  // 自動補 tenantId
//
// 攔截範圍（read/create）：
//   - findFirst / findMany / count / aggregate / groupBy → where 加 tenantId
//   - create → data 加 tenantId
//   - createMany → data 每筆加 tenantId
//
// 不攔截（routes 自己用 findFirst 先確認所有權再操作）：
//   - findUnique / update / updateMany / delete / deleteMany / upsert
//   原因：這些操作的 where 必須是 unique key，加 tenantId 會破壞 unique 條件。
//
// 跨租戶角色（portal-admin / super-admin）且未指定 tenantId：bypass 過濾。

import { prisma } from "./prisma.js";

const TENANT_SCOPED_MODELS = new Set([
  "User", "Event", "BoothType", "EventDocument", "EventNotice",
  "NoticeAcknowledgment", "EventForm", "FormSubmission",
  "EquipmentCatalogItem", "EquipmentRequest", "PreEventNotice",
  "Vendor", "Invitation", "RsvpResponse", "Decorator",
  "DecorationProject", "DecoratorInvitation", "Design", "Message",
  "MemberPermOverride", "Activity", "SubmissionLog",
  "DocumentTemplate", "EmailTemplate", "SmtpSetting", "TenantSubsystem",
]);

const READ_OPS = new Set(["findFirst", "findMany", "count", "aggregate", "groupBy"]);
const CREATE_OPS = new Set(["create"]);
const CREATE_MANY_OPS = new Set(["createMany"]);

export function makeTenantClient(tenantId, isCrossTenant = false) {
  // 跨租戶角色（portal-admin / super-admin）且未指定 → bypass，回原 client
  if (isCrossTenant && !tenantId) return prisma;
  if (!tenantId) {
    throw new Error("makeTenantClient: tenantId required for non-cross-tenant role");
  }

  return prisma.$extends({
    name: "tenant-scope",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!TENANT_SCOPED_MODELS.has(model)) return query(args);

          if (READ_OPS.has(operation)) {
            args.where = { ...(args.where || {}), tenantId };
            return query(args);
          }
          if (CREATE_OPS.has(operation)) {
            args.data = { ...(args.data || {}), tenantId };
            return query(args);
          }
          if (CREATE_MANY_OPS.has(operation)) {
            const list = Array.isArray(args.data) ? args.data : [args.data];
            args.data = list.map((d) => ({ ...d, tenantId }));
            return query(args);
          }
          // 其他操作（findUnique / update / delete / upsert）不動
          return query(args);
        },
      },
    },
  });
}
