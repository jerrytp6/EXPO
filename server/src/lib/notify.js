// F2：In-app notification helper
//
// notify({ tenantId, eventId, type, title, body, link, targetRole, targetUserIds })
//   - targetUserIds：精準寄給某些 user
//   - targetRole：寄給該 tenant 內所有此 role 的 user
//
// 寄完同步 event-bus emit "notification" 給 SSE 推

import { prisma } from "./prisma.js";
import { eventBus } from "./event-bus.js";

export async function notify({
  tenantId,
  eventId = null,
  type,
  title,
  body = null,
  link = null,
  targetRole = null,
  targetUserIds = null,
}) {
  let userIds = targetUserIds || [];
  if (targetRole && tenantId) {
    const users = await prisma.user.findMany({
      where: { tenantId, role: targetRole, status: "active" },
      select: { id: true },
    });
    userIds = [...new Set([...userIds, ...users.map((u) => u.id)])];
  }
  if (userIds.length === 0) return [];

  const data = userIds.map((userId) => ({
    tenantId, userId, eventId, type, title, body, link,
  }));

  // createMany 不 return rows，用 transaction + create 拿 IDs
  const created = await prisma.$transaction(
    data.map((d) => prisma.notification.create({ data: d }))
  );

  // SSE broadcast
  for (const n of created) {
    eventBus.emit("notification", { userId: n.userId, notification: n });
  }
  return created;
}
