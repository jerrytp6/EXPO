import { Router } from "express";
import { z } from "zod";
import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { tenantContext } from "../middleware/tenant.js";
import { permit } from "../middleware/permit.js";
import { scopeWhere, requireWriteTenant } from "../lib/scope.js";
import { parseListOpts, sendList } from "../lib/list-query.js";
import { rowsToCsv, sendCsv } from "../lib/csv.js";
import { sendByTrigger, appUrl } from "../lib/mailer.js";
import { eventBus } from "../lib/event-bus.js";
import { notify } from "../lib/notify.js";

export const vendorsRouter = Router();
export const publicVendorsRouter = Router(); // 不掛 auth — 公開 token 流程

vendorsRouter.use(requireAuth, tenantContext);

const vendorSchema = z.object({
  company: z.string().min(1),
  taxId: z.string().nullish(),
  contact: z.string().nullish(),
  email: z.string().email(),
  phone: z.string().nullish(),
  preferredBoothTypeId: z.string().nullish(),
  decorationMode: z.enum(["self", "booth-vendor"]).nullish(),
});

// list (per event)
vendorsRouter.get("/", async (req, res, next) => {
  try {
    const opts = parseListOpts(req, {
      searchFields: ["company", "contact", "email", "taxId"],
      allowedFilters: ["eventId", "status", "rsvpStatus", "confirmStatus", "decorationMode"],
    });
    const where = { ...scopeWhere(req), ...opts.where };
    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: opts.skip,
        take: opts.take,
        include: { boothType: { select: { id: true, name: true, price: true } } },
      }),
      prisma.vendor.count({ where }),
    ]);
    sendList(res, req, vendors, total);
  } catch (err) { next(err); }
});

// CSV 匯出（同 list 條件）
vendorsRouter.get("/export.csv", async (req, res, next) => {
  try {
    const opts = parseListOpts(req, {
      searchFields: ["company", "contact", "email", "taxId"],
      allowedFilters: ["eventId", "status", "rsvpStatus", "confirmStatus", "decorationMode"],
    });
    const where = { ...scopeWhere(req), ...opts.where };
    const rows = await prisma.vendor.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { boothType: { select: { name: true } }, event: { select: { name: true } } },
    });
    const csv = rowsToCsv(rows, [
      { key: "id",                       header: "ID" },
      { key: "company",                  header: "公司名稱" },
      { key: "taxId",                    header: "統編" },
      { key: "contact",                  header: "聯絡人" },
      { key: "email",                    header: "Email" },
      { key: "phone",                    header: "電話" },
      { key: "event.name",               header: "活動" },
      { key: "status",                   header: "狀態" },
      { key: "rsvpStatus",               header: "RSVP" },
      { key: "confirmStatus",            header: "確認狀態" },
      { key: "boothType.name",           header: "攤位類型" },
      { key: "boothNumber",              header: "攤位編號" },
      { key: "decorationMode",           header: "裝潢方式" },
      { key: "depositStatus",            header: "訂金" },
      { key: "balanceStatus",            header: "尾款" },
      { key: (r) => r.invitedAt?.toISOString().slice(0, 10),    header: "邀約日" },
      { key: (r) => r.registeredAt?.toISOString().slice(0, 10), header: "註冊日" },
    ]);
    sendCsv(res, `vendors_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  } catch (err) { next(err); }
});

vendorsRouter.get("/:id", async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.findFirst({
      where: { id: req.params.id, ...scopeWhere(req) },
      include: { boothType: true, decorator: { select: { id: true, name: true } } },
    });
    if (!vendor) return res.status(404).json({ error: "not_found" });
    res.json(vendor);
  } catch (err) { next(err); }
});

// 匯入廠商（單筆或批次）— PPT slide 8 廠商匯入
vendorsRouter.post("/", permit("vendors", "import"), async (req, res, next) => {
  try {
    const tenantId = requireWriteTenant(req);
    const eventId = req.body.eventId || req.query.eventId;
    if (!eventId) return res.status(400).json({ error: "eventId_required" });
    const event = await prisma.event.findFirst({ where: { id: eventId, tenantId } });
    if (!event) return res.status(404).json({ error: "event_not_found" });

    const list = Array.isArray(req.body.vendors) ? req.body.vendors : [req.body];
    const parsed = list.map((v) => vendorSchema.parse(v));
    const created = await prisma.$transaction(
      parsed.map((v) =>
        prisma.vendor.create({
          data: { ...v, tenantId, eventId, status: "pending" },
        })
      )
    );
    res.status(201).json(created);
  } catch (err) { next(err); }
});

vendorsRouter.patch("/:id", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const target = await prisma.vendor.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    const body = vendorSchema.partial().extend({
      profile: z.any().optional(),
      products: z.any().optional(),
      decoratorId: z.string().nullish(),
      depositStatus: z.enum(["paid", "unpaid"]).nullish(),
      balanceStatus: z.enum(["paid", "unpaid"]).nullish(),
    }).parse(req.body);
    const vendor = await prisma.vendor.update({ where: { id: req.params.id }, data: body });
    res.json(vendor);
  } catch (err) { next(err); }
});

vendorsRouter.delete("/:id", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const target = await prisma.vendor.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    await prisma.vendor.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

// ───── 邀約 ─────

vendorsRouter.post("/:id/invite", permit("vendors", "invite"), async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.findFirst({
      where: { id: req.params.id, ...scopeWhere(req) },
      include: { event: true },
    });
    if (!vendor) return res.status(404).json({ error: "not_found" });
    const token = crypto.randomBytes(16).toString("hex");
    await prisma.$transaction([
      prisma.invitation.upsert({
        where: { vendorId: vendor.id },
        update: { token, expiresAt: new Date(Date.now() + 30 * 86400_000) },
        create: {
          token,
          tenantId: vendor.tenantId,
          eventId: vendor.eventId,
          vendorId: vendor.id,
          expiresAt: new Date(Date.now() + 30 * 86400_000),
        },
      }),
      prisma.vendor.update({
        where: { id: vendor.id },
        data: { status: "invited", invitedAt: new Date() },
      }),
      prisma.activity.create({
        data: { tenantId: vendor.tenantId, eventId: vendor.eventId, vendorId: vendor.id, action: "invited" },
      }),
    ]);

    // F1 SSE 推播（含 vendor 資訊以便前端不用重新 fetch）
    eventBus.emit("activity", {
      tenantId: vendor.tenantId,
      eventId: vendor.eventId,
      vendorId: vendor.id,
      activity: {
        id: `tmp-${Date.now()}`, action: "invited",
        tenantId: vendor.tenantId, eventId: vendor.eventId, vendorId: vendor.id,
        at: new Date().toISOString(),
        vendor: { id: vendor.id, company: vendor.company },
      },
    });

    // 寄邀約信（不阻塞回應）
    const mailRes = await sendByTrigger({
      tenantId: vendor.tenantId,
      eventId: vendor.eventId,
      trigger: "invitation",
      to: vendor.email,
      vars: {
        vendor: { company: vendor.company, contact: vendor.contact, email: vendor.email },
        event: { name: vendor.event.name, location: vendor.event.location, startDate: vendor.event.startDate?.toISOString().slice(0, 10), endDate: vendor.event.endDate?.toISOString().slice(0, 10) },
        invite_url: appUrl(`/invite/${token}`),
      },
    });

    res.json({ ok: true, token, mail: mailRes });
  } catch (err) { next(err); }
});

// 確認參展（管理員把 RSVP=accepted 的廠商加入正式名單）— PPT slide 8
vendorsRouter.post("/:id/confirm", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.findFirst({
      where: { id: req.params.id, ...scopeWhere(req) },
      include: { event: true },
    });
    if (!vendor) return res.status(404).json({ error: "not_found" });
    const { confirmStatus = "confirmed", confirmNote = "" } = req.body || {};
    const updated = await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        confirmStatus,
        confirmedAt: confirmStatus ? new Date() : null,
        confirmedBy: confirmStatus ? req.user.name : null,
        confirmNote,
      },
    });

    // 寄通知：確認加入名單
    if (confirmStatus === "confirmed") {
      sendByTrigger({
        tenantId: vendor.tenantId,
        eventId: vendor.eventId,
        trigger: "vendor_confirmed",
        to: vendor.email,
        vars: {
          vendor: { company: vendor.company, contact: vendor.contact },
          event: { name: vendor.event.name, location: vendor.event.location },
          portal_url: appUrl(`/portal/vendor/${vendor.id}`),
        },
      }).catch(() => {});
    }

    res.json(updated);
  } catch (err) { next(err); }
});

// 攤位分配（管理員）— PPT slide 10
vendorsRouter.patch("/:id/booth", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!vendor) return res.status(404).json({ error: "not_found" });
    const { boothTypeId, boothNumber } = z.object({
      boothTypeId: z.string().nullish(),
      boothNumber: z.string().nullish(),
    }).parse(req.body);
    const updated = await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        boothTypeId,
        boothNumber: boothNumber || "",
        boothSelectionStatus: boothTypeId && boothNumber ? "confirmed" : null,
        boothSelectedBy: boothTypeId && boothNumber ? "admin" : null,
      },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

// 確認/退回 廠商自選 — PPT slide 10 開關模式
vendorsRouter.post("/:id/booth-selection/confirm", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!vendor) return res.status(404).json({ error: "not_found" });
    if (vendor.boothSelectionStatus !== "pending") {
      return res.status(409).json({ error: "not_pending" });
    }
    const updated = await prisma.vendor.update({
      where: { id: vendor.id },
      data: { boothSelectionStatus: "confirmed" },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

vendorsRouter.post("/:id/booth-selection/reject", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!vendor) return res.status(404).json({ error: "not_found" });
    if (vendor.boothSelectionStatus !== "pending") {
      return res.status(409).json({ error: "not_pending" });
    }
    const updated = await prisma.vendor.update({
      where: { id: vendor.id },
      data: { boothTypeId: null, boothNumber: "", boothSelectionStatus: null, boothSelectedBy: null, boothSelectedAt: null },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════════════════════
// 公開 token endpoints — 廠商通過邀約連結進入
// ═══════════════════════════════════════════════════════════════════════

publicVendorsRouter.get("/invite/:token", async (req, res, next) => {
  try {
    const inv = await prisma.invitation.findUnique({
      where: { token: req.params.token },
      include: {
        event: { select: { id: true, name: true, location: true, startDate: true, endDate: true, type: true, description: true } },
        vendor: true,
      },
    });
    if (!inv) return res.status(404).json({ error: "invalid_token" });
    if (inv.expiresAt < new Date()) return res.status(410).json({ error: "expired" });
    // 標記點擊
    if (!inv.vendor.clickedAt) {
      await prisma.vendor.update({
        where: { id: inv.vendorId },
        data: { clickedAt: new Date(), status: "clicked" },
      });
      await prisma.activity.create({
        data: { tenantId: inv.tenantId, eventId: inv.eventId, vendorId: inv.vendorId, action: "clicked" },
      });
      eventBus.emit("activity", {
        tenantId: inv.tenantId, eventId: inv.eventId, vendorId: inv.vendorId,
        activity: {
          id: `tmp-${Date.now()}`, action: "clicked",
          tenantId: inv.tenantId, eventId: inv.eventId, vendorId: inv.vendorId,
          at: new Date().toISOString(),
          vendor: { id: inv.vendor.id, company: inv.vendor.company },
        },
      });
    }
    res.json({ event: inv.event, vendor: inv.vendor });
  } catch (err) { next(err); }
});

publicVendorsRouter.post("/rsvp/:token", async (req, res, next) => {
  try {
    const inv = await prisma.invitation.findUnique({ where: { token: req.params.token } });
    if (!inv) return res.status(404).json({ error: "invalid_token" });
    const body = z.object({
      response: z.enum(["accepted", "declined"]),
      reason: z.string().optional(),
    }).parse(req.body);
    const result = await prisma.$transaction(async (tx) => {
      await tx.rsvpResponse.create({
        data: {
          tenantId: inv.tenantId,
          eventId: inv.eventId,
          vendorId: inv.vendorId,
          token: inv.token,
          response: body.response,
          reason: body.reason,
        },
      });
      const vendor = await tx.vendor.update({
        where: { id: inv.vendorId },
        data: {
          rsvpStatus: body.response,
          rsvpRespondedAt: new Date(),
          status: body.response === "declined" ? "declined" : "registered",
        },
      });
      return vendor;
    });

    // F2 通知：RSVP 結果通知活動管理者
    notify({
      tenantId: inv.tenantId,
      eventId: inv.eventId,
      type: body.response === "accepted" ? "vendor_rsvp_accepted" : "vendor_rsvp_declined",
      title: `${result.company} ${body.response === "accepted" ? "接受邀約" : "婉拒邀約"}`,
      body: body.response === "declined" && body.reason ? `原因：${body.reason}` : null,
      link: `/event/${inv.eventId}/vendors`,
      targetRole: "event-manager",
    }).catch(() => {});

    res.json(result);
  } catch (err) { next(err); }
});

// 廠商註冊資料 — PPT slide 9
publicVendorsRouter.post("/vendors/:id/register", async (req, res, next) => {
  try {
    const body = z.object({
      profile: z.any().optional(),
      products: z.any().optional(),
      contact: z.string().optional(),
      phone: z.string().optional(),
      taxId: z.string().optional(),
      decorationMode: z.enum(["self", "booth-vendor"]).optional(),
    }).parse(req.body);
    const vendor = await prisma.vendor.update({
      where: { id: req.params.id },
      data: { ...body, registeredAt: new Date(), status: "registered" },
    });
    await prisma.activity.create({
      data: { tenantId: vendor.tenantId, eventId: vendor.eventId, vendorId: vendor.id, action: "registered" },
    });
    eventBus.emit("activity", {
      tenantId: vendor.tenantId, eventId: vendor.eventId, vendorId: vendor.id,
      activity: {
        id: `tmp-${Date.now()}`, action: "registered",
        tenantId: vendor.tenantId, eventId: vendor.eventId, vendorId: vendor.id,
        at: new Date().toISOString(),
        vendor: { id: vendor.id, company: vendor.company },
      },
    });
    res.json(vendor);
  } catch (err) { next(err); }
});

// 廠商自選攤位（廠商端，token 流程後）— PPT slide 10
publicVendorsRouter.patch("/vendors/:id/booth-selection", async (req, res, next) => {
  try {
    const body = z.object({
      boothTypeId: z.string(),
      boothNumber: z.string().min(1),
    }).parse(req.body);
    const updated = await prisma.vendor.update({
      where: { id: req.params.id },
      data: {
        boothTypeId: body.boothTypeId,
        boothNumber: body.boothNumber,
        boothSelectionStatus: "pending",
        boothSelectedBy: "vendor",
        boothSelectedAt: new Date(),
      },
    });
    res.json(updated);
  } catch (err) { next(err); }
});
