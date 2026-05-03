// EX seed — 把舊前端 src/lib/seed.js 全部資料 → MySQL
//
// 資料量：1 主租戶（c-1）+ 2 待審租戶 + 9 帳號 + 3 活動 + 7 攤位類型
//        + 30 廠商 + 5 邀約 + 6 RSVP + 5 裝潢專案 + 5 設計稿 + 6 訊息
//        + 12 通知 + 8 表單 + 10+ 表單繳交 + 6 設備分類 + 8 申請單
//        + 13 文件範本 + 8 郵件模板 + 1 SMTP + 5 展前通知
//
// 執行：npm run prisma:reset → 自動跑 seed
// 或   npm run seed
//
// 整個 seed 用 upsert 確保冪等。
import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { SEED } from "./source-data.js";

const prisma = new PrismaClient();

const D = (s) => (s ? new Date(s) : null);

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 10);

  // ═══════════════════════ 1. tenants ═══════════════════════
  console.log("→ tenants");
  for (const c of SEED.companies) {
    await prisma.tenant.upsert({
      where: { id: c.id },
      update: {
        name: c.name, taxId: c.taxId, industry: c.industry, size: c.size,
        address: c.address, phone: c.phone, status: c.status,
      },
      create: {
        id: c.id,
        name: c.name, taxId: c.taxId, industry: c.industry, size: c.size,
        address: c.address, phone: c.phone, status: c.status,
        externalId: `portal-${c.id}`,
        createdAt: D(c.createdAt) || new Date(),
      },
    });
  }

  // ═══════════════════════ 2. users ═══════════════════════
  console.log("→ users");
  for (const u of SEED.users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: { email: u.email, name: u.name, role: u.role, title: u.title, tenantId: u.companyId },
      create: {
        id: u.id, email: u.email, name: u.name, role: u.role, title: u.title,
        tenantId: u.companyId, passwordHash, status: "active",
      },
    });
  }

  // ═══════════════════════ 3. tenant subsystems ═══════════════════════
  console.log("→ tenant_subsystems");
  for (const s of SEED.tenantSubsystems) {
    await prisma.tenantSubsystem.upsert({
      where: { tenantId_subsystemKey: { tenantId: s.companyId, subsystemKey: s.subsystemKey } },
      update: { contractEnd: D(s.contractEnd) },
      create: {
        tenantId: s.companyId, subsystemKey: s.subsystemKey,
        activatedAt: D(s.activatedAt) || new Date(),
        contractEnd: D(s.contractEnd),
        externalId: `portal-${s.companyId}-${s.subsystemKey}`,
      },
    });
  }

  // ═══════════════════════ 4. document templates ═══════════════════════
  console.log("→ document_templates");
  for (const t of SEED.documentTemplates) {
    await prisma.documentTemplate.upsert({
      where: { id: t.id },
      update: {
        category: t.category, name: t.name, formats: t.formats,
        required: t.required, sortOrder: t.sortOrder,
      },
      create: {
        id: t.id, tenantId: "c-1",
        category: t.category, name: t.name, formats: t.formats,
        required: t.required, sortOrder: t.sortOrder,
      },
    });
  }

  // ═══════════════════════ 5. events ═══════════════════════
  console.log("→ events");
  for (const e of SEED.events) {
    await prisma.event.upsert({
      where: { id: e.id },
      update: {
        name: e.name, type: e.type, description: e.description,
        startDate: D(e.startDate), endDate: D(e.endDate), location: e.location,
        status: e.status, managerId: e.managerId, capacity: e.capacity || 0,
      },
      create: {
        id: e.id, tenantId: e.companyId,
        name: e.name, type: e.type, description: e.description,
        startDate: D(e.startDate), endDate: D(e.endDate), location: e.location,
        status: e.status, managerId: e.managerId, capacity: e.capacity || 0,
        boothSelfSelectionEnabled: false,
        createdAt: D(e.createdAt) || new Date(),
      },
    });

    // booth types nested in event
    if (e.boothTypes) {
      for (const bt of e.boothTypes) {
        await prisma.boothType.upsert({
          where: { id: bt.id },
          update: {
            name: bt.name, size: bt.size, price: String(bt.price),
            capacity: bt.capacity, description: bt.description,
          },
          create: {
            id: bt.id, tenantId: e.companyId, eventId: e.id,
            name: bt.name, size: bt.size, price: String(bt.price),
            capacity: bt.capacity, description: bt.description, sortOrder: 0,
          },
        });
      }
    }
  }

  // ═══════════════════════ 6. event documents (join) ═══════════════════════
  console.log("→ event_documents");
  for (const ed of SEED.eventDocuments) {
    const event = SEED.events.find((e) => e.id === ed.eventId);
    if (!event) continue;
    await prisma.eventDocument.upsert({
      where: { eventId_templateId: { eventId: ed.eventId, templateId: ed.templateId } },
      update: { required: ed.required ?? true, deadline: D(ed.deadline) },
      create: {
        event: { connect: { id: ed.eventId } },
        template: { connect: { id: ed.templateId } },
        tenantId: event.companyId,
        required: ed.required ?? true,
        deadline: D(ed.deadline),
      },
    });
  }

  // ═══════════════════════ 7. event notices ═══════════════════════
  console.log("→ event_notices");
  for (const n of SEED.eventNotices) {
    const event = SEED.events.find((e) => e.id === n.eventId);
    if (!event) continue;
    await prisma.eventNotice.upsert({
      where: { id: n.id },
      update: {
        category: n.category, title: n.title, content: n.content,
        attachmentName: n.attachmentName, requiresAck: n.requiresAck,
        allowDecoratorView: n.allowDecoratorView, sortOrder: n.sortOrder,
        publishedAt: D(n.publishedAt),
      },
      create: {
        id: n.id, tenantId: event.companyId, eventId: n.eventId,
        category: n.category, title: n.title, content: n.content,
        attachmentName: n.attachmentName, requiresAck: n.requiresAck,
        allowDecoratorView: n.allowDecoratorView, sortOrder: n.sortOrder,
        publishedAt: D(n.publishedAt),
      },
    });
  }

  // ═══════════════════════ 8. event forms ═══════════════════════
  console.log("→ event_forms");
  for (const f of SEED.eventForms) {
    const event = SEED.events.find((e) => e.id === f.eventId);
    if (!event) continue;
    await prisma.eventForm.upsert({
      where: { id: f.id },
      update: {
        category: f.category, name: f.name, templateFileName: f.templateFileName,
        formats: f.formats, isRequired: f.isRequired, hasFee: f.hasFee,
        skipOption: f.skipOption, showWhen: f.showWhen,
        deadline: D(f.deadline), sortOrder: f.sortOrder,
        allowDecoratorUpload: f.allowDecoratorUpload || false,
      },
      create: {
        id: f.id, tenantId: event.companyId, eventId: f.eventId,
        category: f.category, name: f.name, templateFileName: f.templateFileName,
        formats: f.formats, isRequired: f.isRequired, hasFee: f.hasFee,
        skipOption: f.skipOption, showWhen: f.showWhen,
        deadline: D(f.deadline), sortOrder: f.sortOrder,
        allowDecoratorUpload: f.allowDecoratorUpload || false,
      },
    });
  }

  // ═══════════════════════ 9. equipment catalog ═══════════════════════
  console.log("→ equipment_catalog");
  for (const item of SEED.eventEquipmentCatalog) {
    const event = SEED.events.find((e) => e.id === item.eventId);
    if (!event) continue;
    await prisma.equipmentCatalogItem.upsert({
      where: { id: item.id },
      update: {
        category: item.category, name: item.name, spec: item.spec,
        unit: item.unit, unitPrice: String(item.unitPrice), stock: item.stock,
      },
      create: {
        id: item.id, tenantId: event.companyId, eventId: item.eventId,
        category: item.category, name: item.name, spec: item.spec,
        unit: item.unit, unitPrice: String(item.unitPrice), stock: item.stock,
      },
    });
  }

  // ═══════════════════════ 10. pre-event notices ═══════════════════════
  console.log("→ pre_event_notices");
  for (const p of SEED.preEventNotices) {
    const event = SEED.events.find((e) => e.id === p.eventId);
    if (!event) continue;
    await prisma.preEventNotice.upsert({
      where: { id: p.id },
      update: {
        title: p.title, content: p.content, audience: p.audience,
        channels: p.channels, attachments: p.attachments,
        scheduledAt: D(p.scheduledAt), sentAt: D(p.sentAt), status: p.status,
      },
      create: {
        id: p.id, tenantId: event.companyId, eventId: p.eventId,
        title: p.title, content: p.content, audience: p.audience,
        channels: p.channels, attachments: p.attachments,
        scheduledAt: D(p.scheduledAt), sentAt: D(p.sentAt), status: p.status,
      },
    });
  }

  // ═══════════════════════ 11. email templates ═══════════════════════
  console.log("→ email_templates");
  for (const t of SEED.emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { id: t.id },
      update: {
        scope: t.scope, eventId: t.eventId, trigger: t.trigger,
        name: t.name, subject: t.subject, body: t.body, isSystem: t.isSystem,
      },
      create: {
        id: t.id, tenantId: t.companyId,
        scope: t.scope, eventId: t.eventId, trigger: t.trigger,
        name: t.name, subject: t.subject, body: t.body, isSystem: t.isSystem,
      },
    });
  }

  // ═══════════════════════ 12. smtp settings ═══════════════════════
  console.log("→ smtp_settings");
  // 老 seed 的 secure 是 "tls"/"ssl" 字串，schema 是 Boolean
  const toBool = (v) => typeof v === "boolean" ? v : (v === "ssl" || v === true);
  for (const s of SEED.smtpSettings) {
    const data = {
      host: s.host, port: s.port, secure: toBool(s.secure),
      username: s.username, passwordMasked: s.passwordMasked,
      fromEmail: s.fromEmail, fromName: s.fromName, replyTo: s.replyTo,
      testStatus: s.testStatus, testError: s.testError, testedAt: D(s.testedAt),
    };
    await prisma.smtpSetting.upsert({
      where: { tenantId: s.companyId },
      update: data,
      create: { tenantId: s.companyId, ...data },
    });
  }

  // ═══════════════════════ 12.5 decorators（vendors 引用 decoratorId，需先 seed）═══════════════════════
  console.log("→ decorators");
  for (const d of SEED.decorators) {
    await prisma.decorator.upsert({
      where: { id: d.id },
      update: {
        name: d.name, taxId: d.taxId, email: d.email, phone: d.phone,
        address: d.address, contact: d.contact, title: d.title,
        specialties: d.specialties, status: d.status,
      },
      create: {
        id: d.id, tenantId: "c-1",
        name: d.name, taxId: d.taxId, email: d.email, phone: d.phone,
        address: d.address, contact: d.contact, title: d.title,
        specialties: d.specialties || [], status: d.status,
        createdAt: D(d.createdAt) || new Date(),
      },
    });
  }

  // ═══════════════════════ 13. vendors ═══════════════════════
  console.log("→ vendors");
  for (const v of SEED.vendors) {
    const event = SEED.events.find((e) => e.id === v.eventId);
    if (!event) continue;
    const data = {
      tenantId: event.companyId,
      eventId: v.eventId,
      company: v.company, taxId: v.taxId, contact: v.contact,
      email: v.email, phone: v.phone, status: v.status,
      invitedAt: D(v.invitedAt), clickedAt: D(v.clickedAt),
      registeredAt: D(v.registeredAt),
      rsvpStatus: v.rsvpStatus, rsvpRespondedAt: D(v.rsvpRespondedAt),
      confirmStatus: v.confirmStatus, confirmedAt: D(v.confirmedAt),
      confirmedBy: v.confirmedBy, confirmNote: v.confirmNote,
      preferredBoothTypeId: v.preferredBoothTypeId,
      boothTypeId: v.boothTypeId, boothNumber: v.boothNumber,
      boothSelectionStatus: v.boothNumber && v.boothTypeId ? "confirmed" : null,
      boothSelectedBy: v.boothNumber && v.boothTypeId ? "admin" : null,
      depositStatus: v.depositStatus, balanceStatus: v.balanceStatus,
      decorationMode: v.decorationMode, decoratorId: v.decoratorId,
      profile: v.profile ? (typeof v.profile === "string" ? { text: v.profile } : v.profile) : null,
      products: v.products || [],
    };
    await prisma.vendor.upsert({
      where: { id: v.id },
      update: data,
      create: { id: v.id, ...data },
    });
  }

  // ═══════════════════════ 14. invitations ═══════════════════════
  console.log("→ invitations");
  for (const i of SEED.invitations) {
    const event = SEED.events.find((e) => e.id === i.eventId);
    if (!event) continue;
    await prisma.invitation.upsert({
      where: { token: i.token },
      update: { expiresAt: D(i.expiresAt) || new Date(Date.now() + 30 * 86400_000) },
      create: {
        token: i.token, tenantId: event.companyId,
        eventId: i.eventId, vendorId: i.vendorId,
        expiresAt: D(i.expiresAt) || new Date(Date.now() + 30 * 86400_000),
      },
    });
  }

  // ═══════════════════════ 15. rsvp responses ═══════════════════════
  console.log("→ rsvp_responses");
  for (const r of SEED.rsvpResponses) {
    const event = SEED.events.find((e) => e.id === r.eventId);
    if (!event) continue;
    await prisma.rsvpResponse.upsert({
      where: { id: r.id },
      update: {
        token: r.token, response: r.response, reason: r.reason,
        respondedAt: D(r.respondedAt) || new Date(),
      },
      create: {
        id: r.id, tenantId: event.companyId,
        eventId: r.eventId, vendorId: r.vendorId,
        token: r.token, response: r.response, reason: r.reason,
        respondedAt: D(r.respondedAt) || new Date(),
      },
    });
  }

  // ═══════════════════════ 16. notice acknowledgments ═══════════════════════
  console.log("→ notice_acknowledgments");
  for (const a of SEED.noticeAcknowledgments) {
    const event = SEED.events.find((e) => e.id === a.eventId);
    if (!event) continue;
    await prisma.noticeAcknowledgment.upsert({
      where: { vendorId_noticeId: { vendorId: a.vendorId, noticeId: a.noticeId } },
      update: { acknowledgedAt: D(a.acknowledgedAt) || new Date() },
      create: {
        id: a.id, tenantId: event.companyId,
        eventId: a.eventId, vendorId: a.vendorId, noticeId: a.noticeId,
        acknowledgedAt: D(a.acknowledgedAt) || new Date(),
      },
    });
  }

  // ═══════════════════════ 17. form submissions ═══════════════════════
  console.log("→ form_submissions");
  for (const s of SEED.formSubmissions) {
    const event = SEED.events.find((e) => e.id === s.eventId);
    if (!event) continue;
    const data = {
      tenantId: event.companyId,
      eventId: s.eventId, vendorId: s.vendorId, formId: s.formId,
      fileName: s.fileName, fileSize: s.fileSize,
      fee: s.fee != null ? String(s.fee) : null,
      paymentProofFileName: s.paymentProofFileName,
      status: s.status, reviewedBy: s.reviewedBy,
      reviewedAt: D(s.reviewedAt), feedback: s.feedback,
      vendorConfirmed: s.vendorConfirmed || false,
      vendorConfirmedAt: D(s.vendorConfirmedAt),
      needsReconfirm: s.needsReconfirm || false,
      uploadedByRole: s.uploadedByRole || "vendor",
      submittedAt: D(s.submittedAt) || new Date(),
    };
    await prisma.formSubmission.upsert({
      where: { id: s.id },
      update: data,
      create: { id: s.id, ...data },
    });
  }

  // ═══════════════════════ 18. equipment requests ═══════════════════════
  console.log("→ equipment_requests");
  for (const r of SEED.equipmentRequests) {
    const event = SEED.events.find((e) => e.id === r.eventId);
    if (!event) continue;
    // 計算 totalAmount（如果 SEED 沒提供）
    let total = r.totalAmount;
    if (total == null) {
      total = r.items.reduce((sum, it) => {
        const cat = SEED.eventEquipmentCatalog.find((c) => c.id === it.catalogId);
        return sum + (cat?.unitPrice || 0) * it.qty;
      }, 0);
    }
    const data = {
      tenantId: event.companyId,
      eventId: r.eventId, vendorId: r.vendorId,
      items: r.items, totalAmount: String(total), status: r.status,
      pdfGeneratedAt: D(r.pdfGeneratedAt),
      signedFileName: r.signedFileName,
      paymentProofFileName: r.paymentProofFileName,
      paidAt: D(r.paidAt),
      reviewedBy: r.reviewedBy, reviewedAt: D(r.reviewedAt),
      feedback: r.feedback,
      vendorConfirmed: r.vendorConfirmed || false,
      vendorConfirmedAt: D(r.vendorConfirmedAt),
      needsReconfirm: r.needsReconfirm || false,
      createdAt: D(r.createdAt) || new Date(),
    };
    await prisma.equipmentRequest.upsert({
      where: { id: r.id },
      update: data,
      create: { id: r.id, ...data },
    });
  }

  // ═══════════════════════ 19. (decorators 已在 vendors 之前 seed) ═══════════════════════

  // ═══════════════════════ 20. decoration projects ═══════════════════════
  console.log("→ decoration_projects");
  for (const p of SEED.decorationProjects) {
    const event = SEED.events.find((e) => e.id === p.eventId);
    if (!event) continue;
    await prisma.decorationProject.upsert({
      where: { id: p.id },
      update: {
        title: p.title, status: p.status,
        budget: p.budget != null ? String(p.budget) : null,
        deadline: D(p.deadline),
      },
      create: {
        id: p.id, tenantId: event.companyId,
        eventId: p.eventId, vendorId: p.vendorId, decoratorId: p.decoratorId,
        title: p.title, status: p.status,
        budget: p.budget != null ? String(p.budget) : null,
        deadline: D(p.deadline),
        createdAt: D(p.createdAt) || new Date(),
      },
    });
  }

  // ═══════════════════════ 21. decorator invitations ═══════════════════════
  console.log("→ decorator_invitations");
  for (const i of SEED.decoratorInvitations) {
    const event = SEED.events.find((e) => e.id === i.eventId);
    if (!event) continue;
    await prisma.decoratorInvitation.upsert({
      where: { token: i.token },
      update: {
        decoratorEmail: i.decoratorEmail, decoratorCompany: i.decoratorCompany,
        message: i.message, status: i.status,
        expiresAt: D(i.expiresAt) || new Date(Date.now() + 30 * 86400_000),
      },
      create: {
        token: i.token, tenantId: event.companyId,
        eventId: i.eventId, fromVendorId: i.fromVendorId,
        decoratorEmail: i.decoratorEmail, decoratorCompany: i.decoratorCompany,
        message: i.message, status: i.status,
        expiresAt: D(i.expiresAt) || new Date(Date.now() + 30 * 86400_000),
        createdAt: D(i.createdAt) || new Date(),
      },
    });
  }

  // ═══════════════════════ 22. designs ═══════════════════════
  console.log("→ designs");
  for (const d of SEED.designs) {
    const project = SEED.decorationProjects.find((p) => p.id === d.projectId);
    if (!project) continue;
    const event = SEED.events.find((e) => e.id === project.eventId);
    if (!event) continue;
    // version 老 seed 是 "v1.0" 字串 — 抽出數字
    const versionNum = parseInt(String(d.version).replace(/\D/g, "")) || 1;
    await prisma.design.upsert({
      where: { id: d.id },
      update: {
        title: d.title, description: d.description, version: versionNum,
        status: d.status, feedback: d.feedback,
      },
      create: {
        id: d.id, tenantId: event.companyId, projectId: d.projectId,
        title: d.title, description: d.description, version: versionNum,
        status: d.status, feedback: d.feedback,
        uploadedAt: D(d.uploadedAt) || new Date(),
      },
    });
  }

  // ═══════════════════════ 23. messages ═══════════════════════
  console.log("→ messages");
  for (const m of SEED.messages) {
    const project = SEED.decorationProjects.find((p) => p.id === m.projectId);
    if (!project) continue;
    const event = SEED.events.find((e) => e.id === project.eventId);
    if (!event) continue;
    await prisma.message.upsert({
      where: { id: m.id },
      update: { content: m.content },
      create: {
        id: m.id, tenantId: event.companyId, projectId: m.projectId,
        sender: m.sender, senderName: m.senderName, content: m.content,
        at: typeof m.at === "number" ? new Date(m.at) : (D(m.at) || new Date()),
      },
    });
  }

  // ═══════════════════════ 24. activities ═══════════════════════
  console.log("→ activities");
  for (const a of SEED.activities) {
    const event = a.eventId ? SEED.events.find((e) => e.id === a.eventId) : null;
    await prisma.activity.upsert({
      where: { id: a.id },
      update: { action: a.action },
      create: {
        id: a.id, tenantId: event?.companyId || "c-1",
        eventId: a.eventId, vendorId: a.vendorId, action: a.action,
        at: typeof a.at === "number" ? new Date(a.at) : (D(a.at) || new Date()),
      },
    });
  }

  // ═══════════════════════ 25. submission logs ═══════════════════════
  console.log("→ submission_logs");
  for (const l of SEED.submissionLogs || []) {
    const sub = SEED.formSubmissions.find((s) => s.id === l.submissionId);
    const event = sub ? SEED.events.find((e) => e.id === sub.eventId) : null;
    if (!event) continue;
    await prisma.submissionLog.upsert({
      where: { id: l.id },
      update: { action: l.action, by: l.by, note: l.note },
      create: {
        id: l.id, tenantId: event.companyId,
        submissionId: l.submissionId, action: l.action,
        by: l.by, note: l.note,
        at: typeof l.at === "number" ? new Date(l.at) : (D(l.at) || new Date()),
      },
    });
  }

  // ═══════════════════════ 26. permissions overrides ═══════════════════════
  console.log("→ member_perm_overrides");
  for (const [userId, perms] of Object.entries(SEED.memberPermOverrides || {})) {
    const user = SEED.users.find((u) => u.id === userId);
    if (!user || !user.companyId) continue;
    for (const [key, value] of Object.entries(perms)) {
      const [resource, action] = key.includes(".") ? key.split(".") : [key, "view"];
      await prisma.memberPermOverride.upsert({
        where: { userId_resource_action: { userId, resource, action } },
        update: { allow: !!value },
        create: { tenantId: user.companyId, userId, resource, action, allow: !!value },
      });
    }
  }

  console.log("\n✓ Seed complete");
  const counts = await Promise.all([
    prisma.tenant.count(), prisma.user.count(), prisma.event.count(),
    prisma.vendor.count(), prisma.boothType.count(),
    prisma.eventNotice.count(), prisma.eventForm.count(),
    prisma.formSubmission.count(), prisma.equipmentCatalogItem.count(),
    prisma.equipmentRequest.count(), prisma.decorator.count(),
    prisma.decorationProject.count(), prisma.design.count(),
    prisma.message.count(), prisma.documentTemplate.count(),
    prisma.emailTemplate.count(), prisma.preEventNotice.count(),
  ]);
  console.log("counts:", {
    tenants: counts[0], users: counts[1], events: counts[2],
    vendors: counts[3], boothTypes: counts[4],
    notices: counts[5], forms: counts[6], formSubs: counts[7],
    equipCatalog: counts[8], equipReqs: counts[9],
    decorators: counts[10], projects: counts[11], designs: counts[12],
    messages: counts[13], docTemplates: counts[14],
    emailTemplates: counts[15], preEvents: counts[16],
  });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
