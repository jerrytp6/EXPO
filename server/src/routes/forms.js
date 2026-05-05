import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { tenantContext } from "../middleware/tenant.js";
import { scopeWhere, requireWriteTenant } from "../lib/scope.js";
import { parseListOpts, sendList } from "../lib/list-query.js";
import { rowsToCsv, sendCsv } from "../lib/csv.js";
import { sendByTrigger, appUrl } from "../lib/mailer.js";
import { notify } from "../lib/notify.js";

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
  storedPath: z.string().nullish(),
  fee: z.union([z.number(), z.string()]).nullish(),
  paymentProofFileName: z.string().nullish(),
  paymentProofPath: z.string().nullish(),
  uploadedByRole: z.enum(["vendor", "decorator"]).default("vendor"),
});

formsRouter.get("/submissions/list", async (req, res, next) => {
  try {
    const opts = parseListOpts(req, {
      searchFields: ["fileName"],
      allowedFilters: ["eventId", "vendorId", "formId", "status", "uploadedByRole"],
    });
    const where = { ...scopeWhere(req), ...opts.where };
    const [subs, total] = await Promise.all([
      prisma.formSubmission.findMany({
        where,
        orderBy: { submittedAt: "desc" },
        skip: opts.skip,
        take: opts.take,
        include: { form: { select: { id: true, name: true, category: true } } },
      }),
      prisma.formSubmission.count({ where }),
    ]);
    sendList(res, req, subs, total);
  } catch (err) { next(err); }
});

// CSV 匯出
formsRouter.get("/submissions/export.csv", async (req, res, next) => {
  try {
    const opts = parseListOpts(req, {
      allowedFilters: ["eventId", "vendorId", "formId", "status", "uploadedByRole"],
    });
    const where = { ...scopeWhere(req), ...opts.where };
    const rows = await prisma.formSubmission.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      include: {
        form: { select: { name: true, category: true } },
        vendor: { select: { company: true, contact: true } },
        event: { select: { name: true } },
      },
    });
    const csv = rowsToCsv(rows, [
      { key: "id",                  header: "ID" },
      { key: "event.name",          header: "活動" },
      { key: "vendor.company",      header: "廠商" },
      { key: "form.category",       header: "類別" },
      { key: "form.name",           header: "表單" },
      { key: "fileName",            header: "檔名" },
      { key: "fee",                 header: "費用" },
      { key: "paymentProofFileName",header: "匯款單" },
      { key: "status",              header: "狀態" },
      { key: "reviewedBy",          header: "審核人" },
      { key: (r) => r.reviewedAt?.toISOString().slice(0, 10), header: "審核日" },
      { key: "vendorConfirmed",     header: "廠商已確認" },
      { key: "needsReconfirm",      header: "待重新確認" },
      { key: "uploadedByRole",      header: "上傳者角色" },
      { key: (r) => r.submittedAt?.toISOString().slice(0, 10), header: "提交日" },
    ]);
    sendCsv(res, `form-submissions_${new Date().toISOString().slice(0, 10)}.csv`, csv);
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
        storedPath: body.storedPath,
        fee: body.fee ? String(body.fee) : null,
        paymentProofFileName: body.paymentProofFileName,
        paymentProofPath: body.paymentProofPath,
        uploadedByRole: body.uploadedByRole,
        status,
        submittedAt: new Date(),
      },
    });
    await prisma.submissionLog.create({
      data: { tenantId: form.tenantId, submissionId: sub.id, action: "submitted", note: status },
    });

    // F2 通知活動管理者：有新的待審
    const vendor = await prisma.vendor.findUnique({ where: { id: body.vendorId }, select: { company: true } });
    notify({
      tenantId: form.tenantId,
      eventId: form.eventId,
      type: status === "pending_fee_review" ? "form_fee_review" : "form_submitted",
      title: `${vendor?.company || "廠商"} 提交「${form.name}」`,
      body: status === "pending_fee_review" ? "含費用，需審核匯款單" : null,
      link: `/event/${form.eventId}/form-review`,
      targetRole: "event-manager",
    }).catch(() => {});

    res.status(201).json(sub);
  } catch (err) { next(err); }
});

// 管理員審核
formsRouter.post("/submissions/:id/review", requireRole("company-admin", "event-manager"), async (req, res, next) => {
  try {
    const target = await prisma.formSubmission.findFirst({
      where: { id: req.params.id, ...scopeWhere(req) },
      include: {
        vendor: true,
        form: { select: { name: true } },
        event: { select: { name: true } },
      },
    });
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

    // 寄審核結果通知
    sendByTrigger({
      tenantId: target.tenantId,
      eventId: target.eventId,
      trigger: status === "approved" ? "form_approved" : "form_rejected",
      to: target.vendor.email,
      vars: {
        vendor: { company: target.vendor.company, contact: target.vendor.contact },
        event: { name: target.event.name },
        form: { name: target.form.name },
        feedback: feedback || "",
        portal_url: appUrl(`/portal/vendor/${target.vendor.id}/forms`),
      },
    }).catch(() => {});

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
