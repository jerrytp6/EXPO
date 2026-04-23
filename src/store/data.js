import { create } from "zustand";
import { db, uid } from "../lib/db";

// 統一的資料 store —— 所有 CRUD 都會持久化到 localStorage
export const useData = create((set, get) => ({
  ...db.read(),

  refresh: () => set({ ...db.read() }),

  resetAll: () => set({ ...db.reset() }),

  // ───── Companies ─────
  createCompany: (payload) => {
    const company = {
      id: uid("c"),
      status: "pending",
      adminUserId: null,
      createdAt: new Date().toISOString().slice(0, 10),
      ...payload,
    };
    const next = db.write((d) => {
      d.companies.push(company);
      return d;
    });
    set({ ...next });
    return company;
  },
  approveCompany: (companyId) => {
    const next = db.write((d) => {
      const c = d.companies.find((x) => x.id === companyId);
      if (c) c.status = "active";
      return d;
    });
    set({ ...next });
  },
  rejectCompany: (companyId) => {
    const next = db.write((d) => {
      d.companies = d.companies.filter((x) => x.id !== companyId);
      return d;
    });
    set({ ...next });
  },

  // ───── Members (Users) ─────
  createMember: (payload) => {
    const user = { id: uid("u"), role: "member", ...payload };
    const next = db.write((d) => {
      d.users.push(user);
      return d;
    });
    set({ ...next });
    return user;
  },
  updateMember: (userId, patch) => {
    const next = db.write((d) => {
      const u = d.users.find((x) => x.id === userId);
      if (u) Object.assign(u, patch);
      return d;
    });
    set({ ...next });
  },
  deleteMember: (userId) => {
    const next = db.write((d) => {
      d.users = d.users.filter((x) => x.id !== userId);
      return d;
    });
    set({ ...next });
  },

  // ───── Events ─────
  createEvent: (payload) => {
    const event = {
      id: uid("e"),
      status: "planning", // planning → recruiting → preparing
      managerId: null,
      createdAt: new Date().toISOString().slice(0, 10),
      ...payload,
    };
    const next = db.write((d) => {
      d.events.push(event);
      return d;
    });
    set({ ...next });
    return event;
  },
  updateEvent: (eventId, patch) => {
    const next = db.write((d) => {
      const e = d.events.find((x) => x.id === eventId);
      if (e) Object.assign(e, patch);
      return d;
    });
    set({ ...next });
  },
  deleteEvent: (eventId) => {
    const next = db.write((d) => {
      d.events = d.events.filter((x) => x.id !== eventId);
      d.vendors = d.vendors.filter((v) => v.eventId !== eventId);
      return d;
    });
    set({ ...next });
  },

  // ───── Vendors ─────
  importVendors: (eventId, rows) => {
    const newOnes = rows.map((r) => ({
      id: uid("v"),
      eventId,
      status: "pending",
      invitedAt: null,
      clickedAt: null,
      registeredAt: null,
      confirmStatus: null,
      confirmedAt: null,
      confirmedBy: null,
      confirmNote: "",
      preferredBoothTypeId: null,
      ...r,
    }));
    const next = db.write((d) => {
      d.vendors.push(...newOnes);
      return d;
    });
    set({ ...next });
    return newOnes;
  },
  sendInvitations: (eventId, vendorIds) => {
    const at = new Date().toISOString();
    const next = db.write((d) => {
      d.vendors.forEach((v) => {
        if (v.eventId === eventId && vendorIds.includes(v.id)) {
          v.status = "invited";
          v.invitedAt = at;
          // 為每個邀請建立 token (簡化：用 vendor id)
          if (!d.invitations.find((i) => i.vendorId === v.id)) {
            d.invitations.push({
              token: `tkn-${v.id}`,
              eventId,
              vendorId: v.id,
              expiresAt: new Date(Date.now() + 30 * 86400 * 1000).toISOString().slice(0, 10),
            });
          }
        }
      });
      return d;
    });
    set({ ...next });
  },
  markVendorClicked: (vendorId) => {
    const next = db.write((d) => {
      const v = d.vendors.find((x) => x.id === vendorId);
      if (v && !v.clickedAt) {
        v.clickedAt = new Date().toISOString();
        if (v.status === "invited") v.status = "clicked";
        d.activities.unshift({ id: uid("a"), eventId: v.eventId, vendorId, action: "clicked", at: Date.now() });
      }
      return d;
    });
    set({ ...next });
  },
  registerVendor: (vendorId, payload) => {
    const next = db.write((d) => {
      const v = d.vendors.find((x) => x.id === vendorId);
      if (v) {
        Object.assign(v, payload);
        v.status = "registered";
        v.registeredAt = new Date().toISOString();
        d.activities.unshift({ id: uid("a"), eventId: v.eventId, vendorId, action: "registered", at: Date.now() });
      }
      return d;
    });
    set({ ...next });
  },

  // ───── 攤位分配與繳費 ─────
  assignBooth: (vendorId, boothTypeId, boothNumber) => {
    const next = db.write((d) => {
      const v = d.vendors.find((x) => x.id === vendorId);
      if (v) {
        v.boothTypeId = boothTypeId;
        v.boothNumber = boothNumber;
      }
      return d;
    });
    set({ ...next });
  },
  updatePaymentStatus: (vendorId, field, value) => {
    const next = db.write((d) => {
      const v = d.vendors.find((x) => x.id === vendorId);
      if (v) v[field] = value;
      return d;
    });
    set({ ...next });
  },

  // ───── 確認參展（加入/移出名單）─────
  confirmVendors: (vendorIds, confirmStatus, confirmedBy, confirmNote = "") => {
    const at = new Date().toISOString().slice(0, 10);
    const next = db.write((d) => {
      vendorIds.forEach((vid) => {
        const v = d.vendors.find((x) => x.id === vid);
        if (v) {
          v.confirmStatus = confirmStatus; // "confirmed" | null
          v.confirmedAt = confirmStatus ? at : null;
          v.confirmedBy = confirmStatus ? confirmedBy : null;
          v.confirmNote = confirmNote;
        }
      });
      return d;
    });
    set({ ...next });
  },

  // ───── Vendor Profile ─────
  updateVendor: (vendorId, patch) => {
    const next = db.write((d) => {
      const v = d.vendors.find((x) => x.id === vendorId);
      if (v) Object.assign(v, patch);
      return d;
    });
    set({ ...next });
  },

  // ───── 裝潢公司邀請（廠商→裝潢） ─────
  inviteDecorator: (vendorId, payload) => {
    const vendor = get().vendors.find((v) => v.id === vendorId);
    const invitation = {
      token: `dtkn-${uid("i").slice(2)}`,
      fromVendorId: vendorId,
      eventId: vendor?.eventId,
      decoratorEmail: payload.email,
      decoratorCompany: payload.company,
      message: payload.message || "",
      status: "pending",
      createdAt: new Date().toISOString().slice(0, 10),
      expiresAt: new Date(Date.now() + 30 * 86400 * 1000).toISOString().slice(0, 10),
    };
    const next = db.write((d) => {
      d.decoratorInvitations.push(invitation);
      return d;
    });
    set({ ...next });
    return invitation;
  },

  acceptDecoratorInvitation: (token, decoratorPayload) => {
    const data = get();
    const inv = data.decoratorInvitations.find((i) => i.token === token);
    if (!inv) return null;

    let decorator = data.decorators.find(
      (d) => d.email.toLowerCase() === decoratorPayload.email.toLowerCase()
    );
    if (!decorator) {
      decorator = {
        id: uid("d"),
        status: "active",
        createdAt: new Date().toISOString().slice(0, 10),
        specialties: [],
        ...decoratorPayload,
      };
    }

    const project = {
      id: uid("dp"),
      vendorId: inv.fromVendorId,
      decoratorId: decorator.id,
      eventId: inv.eventId,
      title: `${inv.decoratorCompany || decorator.name} × 攤位設計專案`,
      status: "draft",
      budget: 0,
      deadline: "",
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const next = db.write((d) => {
      const existed = d.decorators.find((x) => x.id === decorator.id);
      if (!existed) d.decorators.push(decorator);
      const i = d.decoratorInvitations.find((x) => x.token === token);
      if (i) i.status = "accepted";
      const v = d.vendors.find((x) => x.id === inv.fromVendorId);
      if (v) v.decoratorId = decorator.id;
      d.decorationProjects.push(project);
      return d;
    });
    set({ ...next });
    return { decorator, project };
  },

  // ───── 裝潢專案 ─────
  updateProject: (projectId, patch) => {
    const next = db.write((d) => {
      const p = d.decorationProjects.find((x) => x.id === projectId);
      if (p) Object.assign(p, patch);
      return d;
    });
    set({ ...next });
  },

  // ───── 設計稿 ─────
  uploadDesign: (projectId, payload) => {
    const existing = get().designs.filter((x) => x.projectId === projectId);
    const version = `v${existing.length + 1}.0`;
    const design = {
      id: uid("ds"),
      projectId,
      version,
      title: payload.title,
      description: payload.description || "",
      uploadedAt: new Date().toISOString().slice(0, 10),
      status: "pending",
      feedback: "",
    };
    const next = db.write((d) => {
      d.designs.push(design);
      const p = d.decorationProjects.find((x) => x.id === projectId);
      if (p && p.status === "draft") p.status = "designing";
      if (p && p.status === "designing") p.status = "review";
      return d;
    });
    set({ ...next });
    return design;
  },

  reviewDesign: (designId, status, feedback) => {
    const next = db.write((d) => {
      const ds = d.designs.find((x) => x.id === designId);
      if (ds) {
        ds.status = status;
        ds.feedback = feedback || "";
      }
      const p = d.decorationProjects.find((x) => x.id === ds?.projectId);
      if (p) {
        if (status === "approved") p.status = "approved";
        else if (status === "rejected") p.status = "designing";
      }
      return d;
    });
    set({ ...next });
  },

  // ───── 訊息 ─────
  sendMessage: (projectId, sender, senderName, content) => {
    const msg = {
      id: uid("m"),
      projectId,
      sender,
      senderName,
      content,
      at: Date.now(),
    };
    const next = db.write((d) => {
      d.messages.push(msg);
      return d;
    });
    set({ ...next });
    return msg;
  },

  // ───── 權限矩陣 ─────
  setRolePermission: (companyId, role, permKey, value) => {
    const next = db.write((d) => {
      const key = `${companyId}::${role}`;
      if (!d.permissions) d.permissions = {};
      if (!d.permissions[key]) d.permissions[key] = {};
      d.permissions[key][permKey] = value;
      return d;
    });
    set({ ...next });
  },

  setRolePermissions: (companyId, role, perms) => {
    const next = db.write((d) => {
      const key = `${companyId}::${role}`;
      if (!d.permissions) d.permissions = {};
      d.permissions[key] = { ...d.permissions[key], ...perms };
      return d;
    });
    set({ ...next });
  },

  setMemberPermOverride: (userId, permKey, value) => {
    // value = true/false 表示覆寫；undefined/null 表示移除覆寫（回歸角色預設）
    const next = db.write((d) => {
      if (!d.memberPermOverrides) d.memberPermOverrides = {};
      if (!d.memberPermOverrides[userId]) d.memberPermOverrides[userId] = {};
      if (value === undefined || value === null) {
        delete d.memberPermOverrides[userId][permKey];
      } else {
        d.memberPermOverrides[userId][permKey] = value;
      }
      return d;
    });
    set({ ...next });
  },

  getEffectivePermission: (companyId, userId, role, permKey) => {
    const state = get();
    // 個別覆寫優先
    const overrides = state.memberPermOverrides?.[userId];
    if (overrides && permKey in overrides) return overrides[permKey];
    // 角色預設
    const rolePerms = state.permissions?.[`${companyId}::${role}`];
    return rolePerms?.[permKey] ?? false;
  },

  // ───── 全域文件模板 CRUD ─────
  createDocTemplate: (payload) => {
    const tpl = {
      id: uid("dt"),
      category: "其他",
      required: true,
      formats: "",
      sortOrder: get().documentTemplates.length + 1,
      ...payload,
    };
    const next = db.write((d) => { d.documentTemplates.push(tpl); return d; });
    set({ ...next });
    return tpl;
  },
  updateDocTemplate: (id, patch) => {
    const next = db.write((d) => {
      const t = d.documentTemplates.find((x) => x.id === id);
      if (t) Object.assign(t, patch);
      return d;
    });
    set({ ...next });
  },
  deleteDocTemplate: (id) => {
    const next = db.write((d) => {
      d.documentTemplates = d.documentTemplates.filter((x) => x.id !== id);
      d.eventDocuments = d.eventDocuments.filter((x) => x.templateId !== id);
      return d;
    });
    set({ ...next });
  },

  // ───── 活動勾選矩陣 ─────
  toggleEventDocument: (eventId, templateId, enabled) => {
    const next = db.write((d) => {
      if (enabled) {
        if (!d.eventDocuments.find((x) => x.eventId === eventId && x.templateId === templateId)) {
          d.eventDocuments.push({ eventId, templateId, deadline: "", required: null });
        }
      } else {
        d.eventDocuments = d.eventDocuments.filter(
          (x) => !(x.eventId === eventId && x.templateId === templateId)
        );
      }
      return d;
    });
    set({ ...next });
  },
  setEventDocDeadline: (eventId, templateId, deadline) => {
    const next = db.write((d) => {
      const ed = d.eventDocuments.find((x) => x.eventId === eventId && x.templateId === templateId);
      if (ed) ed.deadline = deadline;
      return d;
    });
    set({ ...next });
  },
  setEventDocRequired: (eventId, templateId, value) => {
    // value: true/false = 覆寫, null = 回歸模板預設
    const next = db.write((d) => {
      const ed = d.eventDocuments.find((x) => x.eventId === eventId && x.templateId === templateId);
      if (ed) ed.required = value;
      return d;
    });
    set({ ...next });
  },
  bulkToggleEventDocs: (eventId, templateIds, enabled) => {
    const next = db.write((d) => {
      templateIds.forEach((tid) => {
        const exists = d.eventDocuments.find((x) => x.eventId === eventId && x.templateId === tid);
        if (enabled && !exists) {
          d.eventDocuments.push({ eventId, templateId: tid, deadline: "", required: null });
        } else if (!enabled && exists) {
          d.eventDocuments = d.eventDocuments.filter(
            (x) => !(x.eventId === eventId && x.templateId === tid)
          );
        }
      });
      return d;
    });
    set({ ...next });
  },

  // ───── Helper：取得某活動的有效繳交項目清單 ─────
  // required 合併：eventDoc.required ?? template.required
  getEventItems: (eventId) => {
    const state = get();
    const eds = (state.eventDocuments || []).filter((x) => x.eventId === eventId);
    return eds.map((ed) => {
      const tpl = (state.documentTemplates || []).find((t) => t.id === ed.templateId);
      if (!tpl) return null;
      return {
        ...tpl,
        templateId: tpl.id,
        deadline: ed.deadline,
        required: ed.required !== null && ed.required !== undefined ? ed.required : tpl.required,
        requiredOverridden: ed.required !== null && ed.required !== undefined,
      };
    }).filter(Boolean).sort((a, b) => a.sortOrder - b.sortOrder);
  },

  // ───── 廠商繳交 ─────
  submitFile: (eventId, vendorId, itemId, payload) => {
    const sub = {
      id: uid("sub"),
      eventId,
      vendorId,
      itemId,
      fileName: payload.fileName,
      fileSize: payload.fileSize || "—",
      submittedAt: new Date().toISOString().slice(0, 10),
      status: "submitted",
      reviewedAt: null,
      reviewedBy: null,
      feedback: "",
    };
    const log = { id: uid("sl"), submissionId: sub.id, action: "submitted", by: payload.submittedBy || "廠商", at: sub.submittedAt, note: "" };
    const next = db.write((d) => {
      // 移除同一廠商同一項目的舊 rejected 紀錄（重新繳交）
      d.submissions = d.submissions.filter(
        (s) => !(s.eventId === eventId && s.vendorId === vendorId && s.itemId === itemId && s.status === "rejected")
      );
      d.submissions.push(sub);
      d.submissionLogs.push(log);
      return d;
    });
    set({ ...next });
    return sub;
  },

  // ───── 審核 ─────
  reviewSubmission: (submissionId, status, feedback, reviewerName) => {
    const at = new Date().toISOString().slice(0, 10);
    const log = { id: uid("sl"), submissionId, action: status, by: reviewerName, at, note: feedback || "" };
    const next = db.write((d) => {
      const sub = d.submissions.find((x) => x.id === submissionId);
      if (sub) {
        sub.status = status;
        sub.feedback = feedback || "";
        sub.reviewedAt = at;
        sub.reviewedBy = reviewerName;
      }
      d.submissionLogs.push(log);
      return d;
    });
    set({ ...next });
  },

  // ───── 催繳 ─────
  sendReminder: (eventId, vendorId, vendorName, items) => {
    const reminder = {
      id: uid("rm"),
      eventId,
      vendorId,
      vendorName,
      items: items.map((i) => i.name),
      sentAt: new Date().toISOString(),
    };
    const next = db.write((d) => {
      if (!d.reminders) d.reminders = [];
      d.reminders.push(reminder);
      return d;
    });
    set({ ...next });
    return reminder;
  },

  // ═════════════════════════════════════════════════════════
  // ══════════  v12 新增：對應 PDF 五大業務流程 CRUD ══════════
  // ═════════════════════════════════════════════════════════

  // ───── RSVP（邀約回覆）─────
  respondRsvp: (token, response, reason = "") => {
    const data = get();
    const inv = data.invitations.find((i) => i.token === token);
    if (!inv) return null;
    const at = new Date().toISOString().slice(0, 10);
    const record = {
      id: uid("rsvp"),
      token,
      eventId: inv.eventId,
      vendorId: inv.vendorId,
      response, // "accepted" | "declined"
      reason,
      respondedAt: at,
    };
    const next = db.write((d) => {
      // 更新 vendor.rsvpStatus
      const v = d.vendors.find((x) => x.id === inv.vendorId);
      if (v) {
        v.rsvpStatus = response;
        v.rsvpRespondedAt = at;
        if (response === "declined") v.status = "declined";
      }
      // 覆寫舊紀錄或新增
      d.rsvpResponses = (d.rsvpResponses || []).filter((r) => r.token !== token);
      d.rsvpResponses.push(record);
      return d;
    });
    set({ ...next });
    return record;
  },

  // ───── 廠商裝潢模式設定（進入活動前的卡片選擇）─────
  setVendorDecorationMode: (vendorId, mode) => {
    // mode: "self" | "booth-vendor"
    const next = db.write((d) => {
      const v = d.vendors.find((x) => x.id === vendorId);
      if (v) v.decorationMode = mode;
      return d;
    });
    set({ ...next });
  },

  // ───── 攤位自選開關 ─────
  setBoothSelfSelection: (eventId, enabled) => {
    const next = db.write((d) => {
      const e = d.events.find((x) => x.id === eventId);
      if (e) e.boothSelfSelectionEnabled = !!enabled;
      return d;
    });
    set({ ...next });
  },

  // ───── 文件須知 CRUD ─────
  createNotice: (payload) => {
    const notice = {
      id: uid("n"),
      category: "其他",
      requiresAck: true,
      allowDecoratorView: false,
      sortOrder: (get().eventNotices || []).length + 1,
      publishedAt: new Date().toISOString().slice(0, 10),
      attachmentName: null,
      ...payload,
    };
    const next = db.write((d) => {
      if (!d.eventNotices) d.eventNotices = [];
      d.eventNotices.push(notice);
      return d;
    });
    set({ ...next });
    return notice;
  },
  updateNotice: (id, patch) => {
    const next = db.write((d) => {
      const n = d.eventNotices?.find((x) => x.id === id);
      if (n) Object.assign(n, patch);
      return d;
    });
    set({ ...next });
  },
  deleteNotice: (id) => {
    const next = db.write((d) => {
      d.eventNotices = (d.eventNotices || []).filter((x) => x.id !== id);
      d.noticeAcknowledgments = (d.noticeAcknowledgments || []).filter((x) => x.noticeId !== id);
      return d;
    });
    set({ ...next });
  },

  // 廠商勾選同意
  acknowledgeNotice: (eventId, vendorId, noticeId) => {
    const at = new Date().toISOString().slice(0, 10);
    const next = db.write((d) => {
      if (!d.noticeAcknowledgments) d.noticeAcknowledgments = [];
      const existed = d.noticeAcknowledgments.find(
        (x) => x.eventId === eventId && x.vendorId === vendorId && x.noticeId === noticeId
      );
      if (!existed) {
        d.noticeAcknowledgments.push({ id: uid("ack"), eventId, vendorId, noticeId, acknowledgedAt: at });
      }
      return d;
    });
    set({ ...next });
  },

  // Helper：廠商視角的須知列表（含勾選狀態）
  getNoticesForVendor: (eventId, vendorId) => {
    const state = get();
    const notices = (state.eventNotices || []).filter((n) => n.eventId === eventId);
    const acks = (state.noticeAcknowledgments || []).filter(
      (a) => a.eventId === eventId && a.vendorId === vendorId
    );
    return notices.map((n) => ({
      ...n,
      acknowledged: acks.some((a) => a.noticeId === n.id),
      acknowledgedAt: acks.find((a) => a.noticeId === n.id)?.acknowledgedAt || null,
    })).sort((a, b) => a.sortOrder - b.sortOrder);
  },

  // ───── 表單 CRUD ─────
  createForm: (payload) => {
    const form = {
      id: uid("f"),
      category: "其他",
      isRequired: true,
      hasFee: false,
      skipOption: false,
      showWhen: null,
      allowDecoratorUpload: false,
      formats: ".pdf",
      sortOrder: (get().eventForms || []).length + 1,
      ...payload,
    };
    const next = db.write((d) => {
      if (!d.eventForms) d.eventForms = [];
      d.eventForms.push(form);
      return d;
    });
    set({ ...next });
    return form;
  },
  updateForm: (id, patch) => {
    const next = db.write((d) => {
      const f = d.eventForms?.find((x) => x.id === id);
      if (f) Object.assign(f, patch);
      return d;
    });
    set({ ...next });
  },
  deleteForm: (id) => {
    const next = db.write((d) => {
      d.eventForms = (d.eventForms || []).filter((x) => x.id !== id);
      d.formSubmissions = (d.formSubmissions || []).filter((x) => x.formId !== id);
      return d;
    });
    set({ ...next });
  },

  // 條件顯示過濾：某廠商在該活動應看到的表單清單
  getFormsForVendor: (eventId, vendorId) => {
    const state = get();
    const vendor = state.vendors.find((v) => v.id === vendorId);
    if (!vendor) return [];
    const forms = (state.eventForms || []).filter((f) => f.eventId === eventId);
    return forms
      .filter((f) => {
        if (!f.showWhen) return true;
        return vendor[f.showWhen.field] === f.showWhen.value;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  // 表單繳交
  submitForm: (eventId, vendorId, formId, payload) => {
    const form = get().eventForms?.find((f) => f.id === formId);
    const initialStatus = form?.hasFee ? "pending_fee_review" : "submitted";
    const sub = {
      id: uid("fs"),
      eventId,
      vendorId,
      formId,
      fileName: payload.fileName,
      fileSize: payload.fileSize || "—",
      submittedAt: new Date().toISOString().slice(0, 10),
      status: initialStatus,
      fee: payload.fee || null,
      paymentProofFileName: payload.paymentProofFileName || null,
      reviewedAt: null,
      reviewedBy: null,
      feedback: "",
      vendorConfirmed: false,
      vendorConfirmedAt: null,
      needsReconfirm: false,
      uploadedByRole: payload.uploadedByRole || "vendor",
    };
    const next = db.write((d) => {
      if (!d.formSubmissions) d.formSubmissions = [];
      // 移除同一廠商同一表單的 rejected 舊紀錄
      d.formSubmissions = d.formSubmissions.filter(
        (s) => !(s.eventId === eventId && s.vendorId === vendorId && s.formId === formId && s.status === "rejected")
      );
      d.formSubmissions.push(sub);
      return d;
    });
    set({ ...next });
    return sub;
  },

  reviewFormSubmission: (submissionId, status, feedback, reviewerName) => {
    const at = new Date().toISOString().slice(0, 10);
    const next = db.write((d) => {
      const sub = d.formSubmissions?.find((x) => x.id === submissionId);
      if (sub) {
        sub.status = status;
        sub.feedback = feedback || "";
        sub.reviewedAt = at;
        sub.reviewedBy = reviewerName;
        if (status !== "approved") sub.needsReconfirm = true;
      }
      return d;
    });
    set({ ...next });
  },

  // 廠商端「確認完成」（三態確認的第一態）
  confirmFormSubmission: (submissionId) => {
    const at = new Date().toISOString().slice(0, 10);
    const next = db.write((d) => {
      const sub = d.formSubmissions?.find((x) => x.id === submissionId);
      if (sub) {
        sub.vendorConfirmed = true;
        sub.vendorConfirmedAt = at;
        sub.needsReconfirm = false;
      }
      return d;
    });
    set({ ...next });
  },

  // 管理員端：觸發廠商重新確認
  triggerReconfirm: (submissionId) => {
    const next = db.write((d) => {
      const sub = d.formSubmissions?.find((x) => x.id === submissionId);
      if (sub) {
        sub.vendorConfirmed = false;
        sub.vendorConfirmedAt = null;
        sub.needsReconfirm = true;
      }
      return d;
    });
    set({ ...next });
  },

  // ───── 設備目錄 CRUD ─────
  createEquipmentItem: (payload) => {
    const item = {
      id: uid("eq"),
      category: "其他",
      unit: "組",
      unitPrice: 0,
      stock: 0,
      ...payload,
    };
    const next = db.write((d) => {
      if (!d.eventEquipmentCatalog) d.eventEquipmentCatalog = [];
      d.eventEquipmentCatalog.push(item);
      return d;
    });
    set({ ...next });
    return item;
  },
  updateEquipmentItem: (id, patch) => {
    const next = db.write((d) => {
      const i = d.eventEquipmentCatalog?.find((x) => x.id === id);
      if (i) Object.assign(i, patch);
      return d;
    });
    set({ ...next });
  },
  deleteEquipmentItem: (id) => {
    const next = db.write((d) => {
      d.eventEquipmentCatalog = (d.eventEquipmentCatalog || []).filter((x) => x.id !== id);
      return d;
    });
    set({ ...next });
  },

  // 設備申請（廠商建立）
  createEquipmentRequest: (eventId, vendorId, items) => {
    const catalog = get().eventEquipmentCatalog || [];
    const total = items.reduce((sum, it) => {
      const cat = catalog.find((c) => c.id === it.catalogId);
      return sum + (cat?.unitPrice || 0) * (it.qty || 0);
    }, 0);
    const req = {
      id: uid("er"),
      eventId,
      vendorId,
      items,
      totalAmount: total,
      status: "draft",
      pdfGeneratedAt: null,
      signedFileName: null,
      paymentProofFileName: null,
      paidAt: null,
      reviewedBy: null,
      reviewedAt: null,
      feedback: "",
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      vendorConfirmed: false,
      vendorConfirmedAt: null,
      needsReconfirm: false,
    };
    const next = db.write((d) => {
      if (!d.equipmentRequests) d.equipmentRequests = [];
      d.equipmentRequests.push(req);
      return d;
    });
    set({ ...next });
    return req;
  },
  updateEquipmentRequest: (id, patch) => {
    const next = db.write((d) => {
      const r = d.equipmentRequests?.find((x) => x.id === id);
      if (r) {
        Object.assign(r, patch, { updatedAt: new Date().toISOString().slice(0, 10) });
      }
      return d;
    });
    set({ ...next });
  },
  reviewEquipmentRequest: (id, status, feedback, reviewerName) => {
    const at = new Date().toISOString().slice(0, 10);
    const next = db.write((d) => {
      const r = d.equipmentRequests?.find((x) => x.id === id);
      if (r) {
        r.status = status;
        r.feedback = feedback || "";
        r.reviewedBy = reviewerName;
        r.reviewedAt = at;
        r.updatedAt = at;
      }
      return d;
    });
    set({ ...next });
  },

  // ───── 郵件模板 CRUD ─────
  createEmailTemplate: (payload) => {
    const tpl = {
      id: uid("et"),
      scope: "event",
      isSystem: false,
      updatedAt: new Date().toISOString().slice(0, 10),
      ...payload,
    };
    const next = db.write((d) => {
      if (!d.emailTemplates) d.emailTemplates = [];
      d.emailTemplates.push(tpl);
      return d;
    });
    set({ ...next });
    return tpl;
  },
  updateEmailTemplate: (id, patch) => {
    const next = db.write((d) => {
      const t = d.emailTemplates?.find((x) => x.id === id);
      if (t) Object.assign(t, patch, { updatedAt: new Date().toISOString().slice(0, 10) });
      return d;
    });
    set({ ...next });
  },
  deleteEmailTemplate: (id) => {
    const next = db.write((d) => {
      d.emailTemplates = (d.emailTemplates || []).filter((x) => !(x.id === id && !x.isSystem));
      return d;
    });
    set({ ...next });
  },

  // 複製租戶預設模板到新活動（建立活動時呼叫）
  copyTenantTemplatesToEvent: (companyId, eventId) => {
    const tenantTpls = (get().emailTemplates || []).filter(
      (t) => t.scope === "tenant" && t.companyId === companyId
    );
    const at = new Date().toISOString().slice(0, 10);
    const clones = tenantTpls.map((t) => ({
      ...t,
      id: uid("et"),
      scope: "event",
      eventId,
      isSystem: false,
      updatedAt: at,
    }));
    const next = db.write((d) => {
      if (!d.emailTemplates) d.emailTemplates = [];
      d.emailTemplates.push(...clones);
      return d;
    });
    set({ ...next });
    return clones;
  },

  // ───── SMTP 設定 ─────
  updateSmtpSettings: (companyId, patch) => {
    const next = db.write((d) => {
      if (!d.smtpSettings) d.smtpSettings = [];
      let cfg = d.smtpSettings.find((s) => s.companyId === companyId);
      if (!cfg) {
        cfg = { companyId, host: "", port: 587, secure: "tls", username: "", passwordMasked: "", fromName: "", fromEmail: "", replyTo: "", testedAt: null, testStatus: null, testError: "" };
        d.smtpSettings.push(cfg);
      }
      Object.assign(cfg, patch);
      return d;
    });
    set({ ...next });
  },
  testSmtpConnection: (companyId) => {
    // Demo 模擬測試
    const at = new Date().toISOString();
    const ok = Math.random() > 0.1;
    const next = db.write((d) => {
      const cfg = d.smtpSettings?.find((s) => s.companyId === companyId);
      if (cfg) {
        cfg.testedAt = at;
        cfg.testStatus = ok ? "success" : "failed";
        cfg.testError = ok ? "" : "連線逾時（demo 模擬）";
      }
      return d;
    });
    set({ ...next });
    return ok;
  },

  // ───── 展前通知 ─────
  createPreEventNotice: (payload) => {
    const pe = {
      id: uid("pe"),
      audience: "registered",
      channels: ["email", "portal"],
      status: "draft",
      sentAt: null,
      attachments: [],
      ...payload,
    };
    const next = db.write((d) => {
      if (!d.preEventNotices) d.preEventNotices = [];
      d.preEventNotices.push(pe);
      return d;
    });
    set({ ...next });
    return pe;
  },
  updatePreEventNotice: (id, patch) => {
    const next = db.write((d) => {
      const p = d.preEventNotices?.find((x) => x.id === id);
      if (p) Object.assign(p, patch);
      return d;
    });
    set({ ...next });
  },
  deletePreEventNotice: (id) => {
    const next = db.write((d) => {
      d.preEventNotices = (d.preEventNotices || []).filter((x) => x.id !== id);
      return d;
    });
    set({ ...next });
  },
  sendPreEventNotice: (id) => {
    const at = new Date().toISOString();
    const next = db.write((d) => {
      const p = d.preEventNotices?.find((x) => x.id === id);
      if (p) { p.status = "sent"; p.sentAt = at; }
      return d;
    });
    set({ ...next });
  },

  // ───── 租戶訂閱子系統（Portal 層管理）─────
  toggleTenantSubsystem: (companyId, subsystemKey, enable) => {
    const at = new Date().toISOString().slice(0, 10);
    const next = db.write((d) => {
      if (!d.tenantSubsystems) d.tenantSubsystems = [];
      const existed = d.tenantSubsystems.find((x) => x.companyId === companyId && x.subsystemKey === subsystemKey);
      if (enable && !existed) {
        d.tenantSubsystems.push({
          companyId,
          subsystemKey,
          activatedAt: at,
          contractEnd: new Date(Date.now() + 365 * 86400 * 1000).toISOString().slice(0, 10),
        });
      } else if (!enable && existed) {
        d.tenantSubsystems = d.tenantSubsystems.filter(
          (x) => !(x.companyId === companyId && x.subsystemKey === subsystemKey)
        );
      }
      return d;
    });
    set({ ...next });
  },
  getTenantSubsystems: (companyId) => {
    return (get().tenantSubsystems || []).filter((x) => x.companyId === companyId).map((x) => x.subsystemKey);
  },
  isSubsystemActiveForTenant: (companyId, subsystemKey) => {
    if (!companyId) return false;
    return !!(get().tenantSubsystems || []).find((x) => x.companyId === companyId && x.subsystemKey === subsystemKey);
  },

  // ───── Tenant Guard（多租戶隔離 helper）─────
  // 傳入 user 與資源 companyId，判斷是否允許存取
  // super-admin 可跨租戶；其他角色必須 companyId 相符
  canAccessTenant: (user, companyId) => {
    if (!user) return false;
    if (user.role === "super-admin") return true;
    return user.companyId === companyId;
  },
  canAccessEvent: (user, eventId) => {
    if (!user) return false;
    if (user.role === "super-admin") return true;
    const event = get().events.find((e) => e.id === eventId);
    return event?.companyId === user.companyId;
  },
  getMyEvents: (user) => {
    if (!user) return [];
    const all = get().events;
    if (user.role === "super-admin") return all;
    return all.filter((e) => e.companyId === user.companyId);
  },

  // ───── Helpers ─────
  byId: {
    company: (id) => get().companies.find((x) => x.id === id),
    user: (id) => get().users.find((x) => x.id === id),
    event: (id) => get().events.find((x) => x.id === id),
    vendor: (id) => get().vendors.find((x) => x.id === id),
    decorator: (id) => get().decorators.find((x) => x.id === id),
    project: (id) => get().decorationProjects.find((x) => x.id === id),
    invitation: (token) => get().invitations.find((x) => x.token === token),
    decoratorInvitation: (token) => get().decoratorInvitations.find((x) => x.token === token),
    notice: (id) => get().eventNotices?.find((x) => x.id === id),
    form: (id) => get().eventForms?.find((x) => x.id === id),
    equipmentItem: (id) => get().eventEquipmentCatalog?.find((x) => x.id === id),
    equipmentRequest: (id) => get().equipmentRequests?.find((x) => x.id === id),
    emailTemplate: (id) => get().emailTemplates?.find((x) => x.id === id),
    smtp: (companyId) => get().smtpSettings?.find((x) => x.companyId === companyId),
    preEventNotice: (id) => get().preEventNotices?.find((x) => x.id === id),
    rsvpByToken: (token) => get().rsvpResponses?.find((x) => x.token === token),
  },
}));
