import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

// list 自己的通知
notificationsRouter.get("/", async (req, res, next) => {
  try {
    const where = { userId: req.user.userId };
    if (req.query.unread === "1") where.readAt = null;
    const limit = Math.min(parseInt(req.query.limit || "30", 10), 100);
    const items = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.userId, readAt: null },
    });
    res.json({ items, unreadCount });
  } catch (err) { next(err); }
});

// mark single read
notificationsRouter.post("/:id/read", async (req, res, next) => {
  try {
    const n = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.userId },
      data: { readAt: new Date() },
    });
    res.json({ updated: n.count });
  } catch (err) { next(err); }
});

// mark all read
notificationsRouter.post("/mark-all-read", async (req, res, next) => {
  try {
    const r = await prisma.notification.updateMany({
      where: { userId: req.user.userId, readAt: null },
      data: { readAt: new Date() },
    });
    res.json({ updated: r.count });
  } catch (err) { next(err); }
});

notificationsRouter.delete("/:id", async (req, res, next) => {
  try {
    const r = await prisma.notification.deleteMany({
      where: { id: req.params.id, userId: req.user.userId },
    });
    res.status(r.count > 0 ? 204 : 404).send();
  } catch (err) { next(err); }
});
