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
      status: "planning",
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
  },
}));
