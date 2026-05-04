import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { tenantContext } from "../middleware/tenant.js";
import { scopeWhere, requireWriteTenant } from "../lib/scope.js";
import { sendByTrigger, appUrl } from "../lib/mailer.js";

export const equipmentRouter = Router();

equipmentRouter.use(requireAuth, tenantContext);

// ───── Catalog ─────

const catalogSchema = z.object({
  category: z.string().min(1),
  name: z.string().min(1),
  spec: z.string().nullish(),
  unit: z.string().default("項"),
  unitPrice: z.union([z.number(), z.string()]),
  stock: z.number().int().nullish(),
});

equipmentRouter.get("/catalog", async (req, res, next) => {
  try {
    const where = { ...scopeWhere(req), ...(req.query.eventId ? { eventId: req.query.eventId } : {}) };
    const items = await prisma.equipmentCatalogItem.findMany({
      where,
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    res.json(items);
  } catch (err) { next(err); }
});

equipmentRouter.post("/catalog", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const tenantId = requireWriteTenant(req);
    const eventId = req.body.eventId || req.query.eventId;
    if (!eventId) return res.status(400).json({ error: "eventId_required" });
    const body = catalogSchema.parse(req.body);
    const item = await prisma.equipmentCatalogItem.create({
      data: { ...body, tenantId, eventId, unitPrice: String(body.unitPrice) },
    });
    res.status(201).json(item);
  } catch (err) { next(err); }
});

equipmentRouter.patch("/catalog/:id", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const target = await prisma.equipmentCatalogItem.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    const body = catalogSchema.partial().parse(req.body);
    const data = { ...body };
    if (body.unitPrice !== undefined) data.unitPrice = String(body.unitPrice);
    const item = await prisma.equipmentCatalogItem.update({ where: { id: req.params.id }, data });
    res.json(item);
  } catch (err) { next(err); }
});

equipmentRouter.delete("/catalog/:id", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const target = await prisma.equipmentCatalogItem.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    await prisma.equipmentCatalogItem.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

// ───── Requests（PPT slide 13 完整狀態機）─────
//
// 狀態流：draft → pdf_generated → signed_uploaded → submitted → approved → paid
//                                                              → rejected
// 三態確認：approved 之後可 vendor_confirmed；管理員可觸發 reconfirm。

const requestItemSchema = z.object({
  catalogId: z.string(),
  qty: z.number().int().positive(),
  spec: z.string().default(""),
});

equipmentRouter.get("/requests", async (req, res, next) => {
  try {
    const where = { ...scopeWhere(req) };
    if (req.query.eventId) where.eventId = req.query.eventId;
    if (req.query.vendorId) where.vendorId = req.query.vendorId;
    const reqs = await prisma.equipmentRequest.findMany({ where, orderBy: { createdAt: "desc" } });
    res.json(reqs);
  } catch (err) { next(err); }
});

// 廠商建立申請單（cart → draft）
equipmentRouter.post("/requests", async (req, res, next) => {
  try {
    const body = z.object({
      eventId: z.string(),
      vendorId: z.string(),
      items: z.array(requestItemSchema).min(1),
    }).parse(req.body);

    // 計算金額
    const ids = body.items.map((i) => i.catalogId);
    const catalogItems = await prisma.equipmentCatalogItem.findMany({
      where: { id: { in: ids }, eventId: body.eventId, ...scopeWhere(req) },
    });
    const priceMap = Object.fromEntries(catalogItems.map((c) => [c.id, Number(c.unitPrice)]));
    const totalAmount = body.items.reduce((s, i) => s + (priceMap[i.catalogId] || 0) * i.qty, 0);

    const vendor = await prisma.vendor.findFirst({ where: { id: body.vendorId, ...scopeWhere(req) } });
    if (!vendor) return res.status(404).json({ error: "vendor_not_found" });

    const created = await prisma.equipmentRequest.create({
      data: {
        tenantId: vendor.tenantId,
        eventId: body.eventId,
        vendorId: body.vendorId,
        items: body.items,
        totalAmount: String(totalAmount),
        status: "draft",
      },
    });
    res.status(201).json(created);
  } catch (err) { next(err); }
});

// 廠商更新申請單（變更狀態）— PPT slide 13 中的 4 階段
const STATUS_TRANSITIONS = {
  draft: ["pdf_generated"],
  pdf_generated: ["signed_uploaded"],
  signed_uploaded: ["submitted"],
  submitted: ["approved", "rejected"],
  approved: ["paid"],
  rejected: ["draft"],
};

equipmentRouter.patch("/requests/:id", async (req, res, next) => {
  try {
    const target = await prisma.equipmentRequest.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    const body = z.object({
      status: z.string().optional(),
      signedFileName: z.string().nullish(),
      signedPath: z.string().nullish(),
      paymentProofFileName: z.string().nullish(),
      paymentProofPath: z.string().nullish(),
      pdfGeneratedAt: z.string().nullish(),
      pdfPath: z.string().nullish(),
    }).parse(req.body);

    if (body.status) {
      const allowed = STATUS_TRANSITIONS[target.status] || [];
      if (!allowed.includes(body.status)) {
        return res.status(409).json({ error: "invalid_transition", from: target.status, to: body.status, allowed });
      }
    }

    const data = { ...body };
    if (body.pdfGeneratedAt) data.pdfGeneratedAt = new Date(body.pdfGeneratedAt);
    else if (body.status === "pdf_generated") data.pdfGeneratedAt = new Date();

    const updated = await prisma.equipmentRequest.update({ where: { id: req.params.id }, data });
    res.json(updated);
  } catch (err) { next(err); }
});

// 管理員審核
equipmentRouter.post("/requests/:id/review", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const target = await prisma.equipmentRequest.findFirst({
      where: { id: req.params.id, ...scopeWhere(req) },
      include: {
        vendor: true,
        event: { select: { name: true } },
      },
    });
    if (!target) return res.status(404).json({ error: "not_found" });
    const { status, feedback } = z.object({
      status: z.enum(["approved", "rejected"]),
      feedback: z.string().optional(),
    }).parse(req.body);
    if (target.status !== "submitted") return res.status(409).json({ error: "not_submitted" });
    const updated = await prisma.equipmentRequest.update({
      where: { id: req.params.id },
      data: {
        status,
        feedback: feedback || null,
        reviewedBy: req.user.name,
        reviewedAt: new Date(),
      },
    });

    // 寄審核結果通知
    sendByTrigger({
      tenantId: target.tenantId,
      eventId: target.eventId,
      trigger: status === "approved" ? "equipment_approved" : "equipment_rejected",
      to: target.vendor.email,
      vars: {
        vendor: { company: target.vendor.company, contact: target.vendor.contact },
        event: { name: target.event.name },
        amount: Number(target.totalAmount).toLocaleString(),
        feedback: feedback || "",
        portal_url: appUrl(`/portal/vendor/${target.vendor.id}/equipment`),
      },
    }).catch(() => {});

    res.json(updated);
  } catch (err) { next(err); }
});

// 廠商確認 + 管理員重新觸發 — 三態確認 (PPT slide 15)
equipmentRouter.post("/requests/:id/confirm", async (req, res, next) => {
  try {
    const target = await prisma.equipmentRequest.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    if (target.status !== "approved") return res.status(409).json({ error: "not_approved" });
    const updated = await prisma.equipmentRequest.update({
      where: { id: req.params.id },
      data: { vendorConfirmed: true, vendorConfirmedAt: new Date(), needsReconfirm: false },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

equipmentRouter.post("/requests/:id/reconfirm", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const target = await prisma.equipmentRequest.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    const updated = await prisma.equipmentRequest.update({
      where: { id: req.params.id },
      data: { needsReconfirm: true, vendorConfirmed: false, vendorConfirmedAt: null },
    });
    res.json(updated);
  } catch (err) { next(err); }
});
