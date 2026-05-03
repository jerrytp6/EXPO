import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { tenantContext } from "../middleware/tenant.js";
import { scopeWhere, requireWriteTenant } from "../lib/scope.js";

export const formsRouter = Router();

formsRouter.use(requireAuth, tenantContext);

const formSchema = z.object({
  category: z.string().default("其他"),
  name: z.string().min(1),
  templateFileName: z.string().nullish(),
  formats: z.string().default(".pdf"),
  isRequired: z.boolean().default(true),
  hasFee: z.boolean().default(false),
  skipOption: z.boolean().default(false),
  showWhen: z.any().nullish(),
  deadline: z.string().nullish(),
  sortOrder: z.number().int().default(0),
  allowDecoratorUpload: z.boolean().default(false),
});

// list
formsRouter.get("/", async (req, res, next) => {
  try {
    const where = { ...scopeWhere(req), ...(req.query.eventId ? { eventId: req.query.eventId } : {}) };
    const forms = await prisma.eventForm.findMany({ where, orderBy: { sortOrder: "asc" } });
    res.json(forms);
  } catch (err) { next(err); }
});

// 給特定廠商的表單列表（依 showWhen 過濾，PPT slide 12 條件式）
formsRouter.get("/for-vendor/:vendorId", async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.findFirst({
      where: { id: req.params.vendorId, ...scopeWhere(req) },
    });
    if (!vendor) return res.status(404).json({ error: "vendor_not_found" });
    const all = await prisma.eventForm.findMany({
      where: { eventId: vendor.eventId, ...scopeWhere(req) },
      orderBy: { sortOrder: "asc" },
    });
    const filtered = all.filter((f) => {
      if (!f.showWhen) return true;
      return vendor[f.showWhen.field] === f.showWhen.value;
    });
    res.json(filtered);
  } catch (err) { next(err); }
});

formsRouter.post("/", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const tenantId = requireWriteTenant(req);
    const eventId = req.body.eventId || req.query.eventId;
    if (!eventId) return res.status(400).json({ error: "eventId_required" });
    const body = formSchema.parse(req.body);
    const form = await prisma.eventForm.create({
      data: {
        ...body,
        tenantId,
        eventId,
        deadline: body.deadline ? new Date(body.deadline) : null,
      },
    });
    res.status(201).json(form);
  } catch (err) { next(err); }
});

formsRouter.patch("/:id", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const target = await prisma.eventForm.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    const body = formSchema.partial().parse(req.body);
    const data = { ...body };
    if (body.deadline !== undefined) data.deadline = body.deadline ? new Date(body.deadline) : null;
    const form = await prisma.eventForm.update({ where: { id: req.params.id }, data });
    res.json(form);
  } catch (err) { next(err); }
});

formsRouter.delete("/:id", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const target = await prisma.eventForm.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    await prisma.eventForm.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

// ───── Form Submissions（廠商繳交 + 三態確認）─────

const submitSchema = z.object({
  vendorId: z.string(),
  formId: z.string(),
  fileName: z.string().min(1),
  fileSize: z.string().nullish(),
  fee: z.union([z.number(), z.string()]).nullish(),
  paymentProofFileName: z.string().nullish(),
  uploadedByRole: z.enum(["vendor", "decorator"]).default("vendor"),
});

formsRouter.get("/submissions/list", async (req, res, next) => {
  try {
    const where = { ...scopeWhere(req) };
    if (req.query.eventId) where.eventId = req.query.eventId;
    if (req.query.vendorId) where.vendorId = req.query.vendorId;
    if (req.query.formId) where.formId = req.query.formId;
    const subs = await prisma.formSubmission.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      include: { form: { select: { id: true, name: true, category: true } } },
    });
    res.json(subs);
  } catch (err) { next(err); }
});

// 廠商上傳（也允許裝潢商，看 form.allowDecoratorUpload）
formsRouter.post("/submissions", async (req, res, next) => {
  try {
    const body = submitSchema.parse(req.body);
    const form = await prisma.eventForm.findFirst({
      where: { id: body.formId, ...scopeWhere(req) },
    });
    if (!form) return res.status(404).json({ error: "form_not_found" });
    const status = form.hasFee ? "pending_fee_review" : "submitted";
    const sub = await prisma.formSubmission.create({
      data: {
        tenantId: form.tenantId,
        eventId: form.eventId,
        vendorId: body.vendorId,
        formId: body.formId,
        fileName: body.fileName,
        fileSize: body.fileSize,
        fee: body.fee ? String(body.fee) : null,
        paymentProofFileName: body.paymentProofFileName,
        uploadedByRole: body.uploadedByRole,
        status,
        submittedAt: new Date(),
      },
    });
    await prisma.submissionLog.create({
      data: { tenantId: form.tenantId, submissionId: sub.id, action: "submitted", note: status },
    });
    res.status(201).json(sub);
  } catch (err) { next(err); }
});

// 管理員審核
formsRouter.post("/submissions/:id/review", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const target = await prisma.formSubmission.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    const { status, feedback } = z.object({
      status: z.enum(["approved", "rejected"]),
      feedback: z.string().optional(),
    }).parse(req.body);
    const sub = await prisma.formSubmission.update({
      where: { id: req.params.id },
      data: {
        status,
        feedback: feedback || null,
        reviewedBy: req.user.name,
        reviewedAt: new Date(),
      },
    });
    await prisma.submissionLog.create({
      data: { tenantId: sub.tenantId, submissionId: sub.id, action: "reviewed", by: req.user.name, note: status },
    });
    res.json(sub);
  } catch (err) { next(err); }
});

// 廠商最終確認 — 三態確認 (PPT slide 15)
formsRouter.post("/submissions/:id/confirm", async (req, res, next) => {
  try {
    const target = await prisma.formSubmission.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    if (target.status !== "approved") return res.status(409).json({ error: "not_approved" });
    const sub = await prisma.formSubmission.update({
      where: { id: req.params.id },
      data: { vendorConfirmed: true, vendorConfirmedAt: new Date(), needsReconfirm: false },
    });
    await prisma.submissionLog.create({
      data: { tenantId: sub.tenantId, submissionId: sub.id, action: "vendor_confirmed" },
    });
    res.json(sub);
  } catch (err) { next(err); }
});

// 管理員觸發重新確認 — PPT slide 15「↺ 觸發廠商重新確認」
formsRouter.post("/submissions/:id/reconfirm", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const target = await prisma.formSubmission.findFirst({ where: { id: req.params.id, ...scopeWhere(req) } });
    if (!target) return res.status(404).json({ error: "not_found" });
    const sub = await prisma.formSubmission.update({
      where: { id: req.params.id },
      data: { needsReconfirm: true, vendorConfirmed: false, vendorConfirmedAt: null },
    });
    await prisma.submissionLog.create({
      data: { tenantId: sub.tenantId, submissionId: sub.id, action: "reconfirm_triggered", by: req.user.name },
    });
    res.json(sub);
  } catch (err) { next(err); }
});
