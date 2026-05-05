// Process-wide EventEmitter — 給 SSE / WebSocket 統一訂閱點
//
// 用法：
//   import { eventBus } from "../lib/event-bus.js";
//   eventBus.emit("activity", { tenantId, eventId, activity });
//
// SSE 端：eventBus.on("activity", (payload) => res.write(...))

import { EventEmitter } from "node:events";

class ExEventBus extends EventEmitter {}
ExEventBus.prototype._maxListeners = 200;

export const eventBus = new ExEventBus();
eventBus.setMaxListeners(200);

// 共用 helper：建立 activity 後同時 emit
import { prisma } from "./prisma.js";
export async function recordActivity({ tenantId, eventId, vendorId, action, detail }) {
  const activity = await prisma.activity.create({
    data: { tenantId, eventId, vendorId, action, detail: detail || null },
    include: { vendor: { select: { id: true, company: true } } },
  });
  eventBus.emit("activity", { tenantId, eventId, vendorId, activity });
  return activity;
}
