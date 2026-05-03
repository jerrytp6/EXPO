// src/store/data.js — A4 重寫版（API 模式）
//
// 全部 collections 改成從後端 API 拉。state shape 與舊版兼容（保留 companies / tenantSubsystems
// 等舊命名作 alias），這樣大部分 components 的 useData() 寫法不需改。
//
// 階段：
// - A4.2（目前）：events / vendors / boothTypes / invitations / RSVP / users / tenants / subsystems
// - A4.3：forms / formSubmissions / equipment / notices
// - A4.4：decorators / projects / designs / templates / smtp / pre-event / permissions
//
// mutations 尚未對接的，會用 console.warn 占位 + 不執行（A4.3/.4 補完）。

import { create } from "zustand";
import { api } from "../lib/api";

// 把 backend Decimal/字串金額轉 number；JSON 欄位保持原狀
const toNumber = (v) => (v === null || v === undefined ? null : Number(v));
const stamp = (e) => ({
  ...e,
  // 把 boothType.price 從字串轉 number 給前端 UI 用
  boothTypes: (e.boothTypes || []).map((b) => ({ ...b, price: toNumber(b.price) })),
});

const STUB = (name) => () => {
  console.warn(`[store/data] action "${name}" 尚未串接 API（A4.3/.4 範圍）`);
};

const initialState = {
  // === 平台層 ===
  users: [],
  companies: [],          // = tenants（保留舊命名）
  tenantSubsystems: [],

  // === 活動 + 廠商 ===
  events: [],
  vendors: [],
  invitations: [],
  rsvpResponses: [],
  activities: [],

  // === 文件 / 表單 / 設備（A4.3 完整實作）===
  eventNotices: [],
  noticeAcknowledgments: [],
  eventForms: [],
  formSubmissions: [],
  submissionLogs: [],
  eventEquipmentCatalog: [],
  equipmentRequests: [],

  // === 系統設定 / 模板（A4.4）===
  documentTemplates: [],
  eventDocuments: [],
  emailTemplates: [],
  smtpSettings: [],
  preEventNotices: [],

  // === 裝潢廠商（A4.4）===
  decorators: [],
  decorationProjects: [],
  decoratorInvitations: [],
  designs: [],
  messages: [],

  // === 權限 / Audit（A4.4）===
  memberPermOverrides: {},

  // === Legacy（不再用）===
  reminders: [],
  submissions: [],

  // === Loading 狀態 ===
  bootstrapping: false,
  bootstrapError: null,
};

export const useData = create((set, get) => ({
  ...initialState,

  // ═════════ Bootstrap：登入後一次拉所有可見資料 ═════════
  bootstrap: async (user) => {
    if (!user) return;
    set({ bootstrapping: true, bootstrapError: null });
    try {
      const isPortalAdmin = user.role === "portal-admin";
      const isSuper = user.role === "super-admin";

      // 各角色可見資料不同 — portal-admin/super-admin 看全部租戶
      const [
        users, companies, subs, events, vendors, invitations, rsvps,
        notices, forms, formSubs, equipCatalog, equipReqs,
        decorators, projects, decorInvites,
        emailTemplates, docTemplates, preEvents,
      ] = await Promise.all([
        api.get("/users").catch(() => []),
        (isPortalAdmin || isSuper)
          ? api.get("/tenants").catch(() => [])
          : (user.tenant ? Promise.resolve([user.tenant]) : Promise.resolve([])),
        (isPortalAdmin || isSuper)
          ? Promise.resolve([])  // portal-admin 在 Subsystems 頁逐租戶查
          : (user.tenantId ? api.get(`/tenants/${user.tenantId}/subsystems`).catch(() => []) : Promise.resolve([])),
        api.get("/events").catch(() => []),
        api.get("/vendors").catch(() => []),
        api.get("/forms/submissions/list").catch(() => []).then(() => []),  // invitations 走後端不暴露
        Promise.resolve([]),  // rsvpResponses 走後端不暴露
        api.get("/notices").catch(() => []),
        api.get("/forms").catch(() => []),
        api.get("/forms/submissions/list").catch(() => []),
        api.get("/equipment/catalog").catch(() => []),
        api.get("/equipment/requests").catch(() => []),
        api.get("/decorators").catch(() => []),
        api.get("/decorators/projects/list").catch(() => []),
        Promise.resolve([]),
        api.get("/settings/email-templates").catch(() => []),
        api.get("/settings/document-templates").catch(() => []),
        api.get("/settings/pre-event").catch(() => []),
      ]);

      set({
        users,
        companies,
        tenantSubsystems: subs.map((s) => ({
          companyId: s.tenantId, subsystemKey: s.subsystemKey,
          activatedAt: s.activatedAt, contractEnd: s.contractEnd,
        })),
        events: events.map(stamp),
        vendors,
        invitations: [],  // 透過 vendor.invite endpoint 動態取得
        rsvpResponses: rsvps,
        eventNotices: notices,
        eventForms: forms,
        formSubmissions: formSubs,
        eventEquipmentCatalog: equipCatalog,
        equipmentRequests: equipReqs,
        decorators,
        decorationProjects: projects,
        decoratorInvitations: decorInvites,
        emailTemplates,
        documentTemplates: docTemplates,
        preEventNotices: preEvents,
        bootstrapping: false,
      });
    } catch (err) {
      console.error("[store] bootstrap failed", err);
      set({ bootstrapping: false, bootstrapError: err.message || String(err) });
    }
  },

  refresh: async () => {
    // 重 fetch 主要 collections（不包含 user-specific bootstrap）
    const events = await api.get("/events").catch(() => []);
    const vendors = await api.get("/vendors").catch(() => []);
    set({ events: events.map(stamp), vendors });
  },

  resetAll: () => set(initialState),

  // ═════════════════════════════════════════════════════
  // A4.2 範圍：tenants / users / subsystems / events / boothTypes / vendors
  // ═════════════════════════════════════════════════════

  // ───── Tenants（前端 alias: companies）─────
  createCompany: async (payload) => {
    const t = await api.post("/tenants", payload);
    set((s) => ({ companies: [...s.companies, t] }));
    return t;
  },
  approveCompany: async (companyId) => {
    const t = await api.patch(`/tenants/${companyId}`, { status: "active" });
    set((s) => ({ companies: s.companies.map((x) => x.id === companyId ? t : x) }));
  },
  rejectCompany: async (companyId) => {
    await api.delete(`/tenants/${companyId}`);
    set((s) => ({ companies: s.companies.map((x) => x.id === companyId ? { ...x, status: "suspended" } : x) }));
  },

  // ───── Users（前端 alias: members）─────
  createMember: async (payload) => {
    const u = await api.post("/users", { ...payload, password: payload.password || "demo1234" });
    set((s) => ({ users: [...s.users, u] }));
    return u;
  },
  updateMember: async (userId, patch) => {
    const u = await api.patch(`/users/${userId}`, patch);
    set((s) => ({ users: s.users.map((x) => x.id === userId ? u : x) }));
  },
  deleteMember: async (userId) => {
    await api.delete(`/users/${userId}`);
    set((s) => ({ users: s.users.filter((x) => x.id !== userId) }));
  },

  // ───── Tenant Subsystems ─────
  toggleTenantSubsystem: async (companyId, subsystemKey, enable) => {
    if (enable) {
      const sub = await api.put(`/tenants/${companyId}/subsystems/${subsystemKey}`, {});
      set((s) => {
        const exists = s.tenantSubsystems.some((x) => x.companyId === companyId && x.subsystemKey === subsystemKey);
        const newItem = { companyId, subsystemKey, activatedAt: sub.activatedAt, contractEnd: sub.contractEnd };
        return {
          tenantSubsystems: exists
            ? s.tenantSubsystems.map((x) => x.companyId === companyId && x.subsystemKey === subsystemKey ? newItem : x)
            : [...s.tenantSubsystems, newItem],
        };
      });
    } else {
      await api.delete(`/tenants/${companyId}/subsystems/${subsystemKey}`);
      set((s) => ({
        tenantSubsystems: s.tenantSubsystems.filter((x) => !(x.companyId === companyId && x.subsystemKey === subsystemKey)),
      }));
    }
  },

  // ───── Events ─────
  createEvent: async (payload) => {
    const e = await api.post("/events", payload);
    set((s) => ({ events: [...s.events, stamp(e)] }));
    return e;
  },
  updateEvent: async (eventId, patch) => {
    const e = await api.patch(`/events/${eventId}`, patch);
    set((s) => ({ events: s.events.map((x) => x.id === eventId ? stamp({ ...x, ...e }) : x) }));
    return e;
  },
  deleteEvent: async (eventId) => {
    await api.delete(`/events/${eventId}`);
    set((s) => ({
      events: s.events.filter((x) => x.id !== eventId),
      vendors: s.vendors.filter((v) => v.eventId !== eventId),
    }));
  },

  // PPT slide 10：攤位分配模式切換
  setBoothSelfSelection: async (eventId, enabled) => {
    const e = await api.patch(`/events/${eventId}/booth-self-selection`, { enabled });
    set((s) => ({ events: s.events.map((x) => x.id === eventId ? stamp({ ...x, boothSelfSelectionEnabled: e.boothSelfSelectionEnabled }) : x) }));
  },

  // ───── Booth Types（嵌在 event.boothTypes）─────
  createBoothType: async (eventId, payload) => {
    const bt = await api.post(`/events/${eventId}/booth-types`, payload);
    const btParsed = { ...bt, price: toNumber(bt.price) };
    set((s) => ({
      events: s.events.map((x) =>
        x.id === eventId ? { ...x, boothTypes: [...(x.boothTypes || []), btParsed] } : x
      ),
    }));
    return btParsed;
  },
  updateBoothType: async (eventId, btId, patch) => {
    const bt = await api.patch(`/events/${eventId}/booth-types/${btId}`, patch);
    const btParsed = { ...bt, price: toNumber(bt.price) };
    set((s) => ({
      events: s.events.map((x) =>
        x.id === eventId ? { ...x, boothTypes: x.boothTypes.map((b) => b.id === btId ? btParsed : b) } : x
      ),
    }));
  },
  deleteBoothType: async (eventId, btId) => {
    await api.delete(`/events/${eventId}/booth-types/${btId}`);
    set((s) => ({
      events: s.events.map((x) =>
        x.id === eventId ? { ...x, boothTypes: x.boothTypes.filter((b) => b.id !== btId) } : x
      ),
    }));
  },

  // ───── Vendors ─────
  importVendors: async (eventId, rows) => {
    const created = await api.post(`/vendors?eventId=${eventId}`, { vendors: rows });
    set((s) => ({ vendors: [...s.vendors, ...created] }));
    return created;
  },
  sendInvitations: async (eventId, vendorIds) => {
    const tokens = [];
    for (const vid of vendorIds) {
      const r = await api.post(`/vendors/${vid}/invite`);
      tokens.push({ vendorId: vid, token: r.token });
    }
    // 重 fetch 廠商與邀約
    const vendors = await api.get("/vendors");
    set({ vendors });
    return tokens;
  },
  markVendorClicked: async (vendorId) => {
    // 後端在 GET /public/invite/:token 自動處理；前端 component 不必呼叫
    console.warn("[store] markVendorClicked: 已由後端 /public/invite/:token 自動處理");
  },
  registerVendor: async (vendorId, payload) => {
    const v = await api.post(`/public/vendors/${vendorId}/register`, payload);
    set((s) => ({ vendors: s.vendors.map((x) => x.id === vendorId ? v : x) }));
    return v;
  },
  updateVendor: async (vendorId, patch) => {
    const v = await api.patch(`/vendors/${vendorId}`, patch);
    set((s) => ({ vendors: s.vendors.map((x) => x.id === vendorId ? v : x) }));
    return v;
  },
  confirmVendors: async (vendorIds, confirmStatus, confirmedBy, confirmNote = "") => {
    for (const vid of vendorIds) {
      await api.post(`/vendors/${vid}/confirm`, { confirmStatus, confirmNote });
    }
    const vendors = await api.get("/vendors");
    set({ vendors });
  },

  // PPT slide 10：攤位分配 / 廠商自選
  assignBooth: async (vendorId, boothTypeId, boothNumber) => {
    const v = await api.patch(`/vendors/${vendorId}/booth`, { boothTypeId, boothNumber });
    set((s) => ({ vendors: s.vendors.map((x) => x.id === vendorId ? v : x) }));
  },
  vendorSelectBooth: async (vendorId, boothTypeId, boothNumber) => {
    const v = await api.patch(`/public/vendors/${vendorId}/booth-selection`, { boothTypeId, boothNumber });
    set((s) => ({ vendors: s.vendors.map((x) => x.id === vendorId ? v : x) }));
  },
  confirmVendorBoothSelection: async (vendorId) => {
    const v = await api.post(`/vendors/${vendorId}/booth-selection/confirm`);
    set((s) => ({ vendors: s.vendors.map((x) => x.id === vendorId ? v : x) }));
  },
  rejectVendorBoothSelection: async (vendorId) => {
    const v = await api.post(`/vendors/${vendorId}/booth-selection/reject`);
    set((s) => ({ vendors: s.vendors.map((x) => x.id === vendorId ? v : x) }));
  },
  updatePaymentStatus: async (vendorId, field, value) => {
    const v = await api.patch(`/vendors/${vendorId}`, { [field]: value });
    set((s) => ({ vendors: s.vendors.map((x) => x.id === vendorId ? v : x) }));
  },
  setVendorDecorationMode: async (vendorId, mode) => {
    const v = await api.patch(`/vendors/${vendorId}`, { decorationMode: mode });
    set((s) => ({ vendors: s.vendors.map((x) => x.id === vendorId ? v : x) }));
  },

  // RSVP（公開 token 流程，從 vendor RSVP 頁呼叫）
  submitRsvp: async (token, response, reason) => {
    const v = await api.post(`/public/rsvp/${token}`, { response, reason });
    set((s) => ({ vendors: s.vendors.some((x) => x.id === v.id) ? s.vendors.map((x) => x.id === v.id ? v : x) : [...s.vendors, v] }));
    return v;
  },

  // ═════════════════════════════════════════════════════
  // A4.3/.4 stubs — 之後補
  // ═════════════════════════════════════════════════════

  // forms（A4.3）
  createForm: STUB("createForm"),
  updateForm: STUB("updateForm"),
  deleteForm: STUB("deleteForm"),
  submitForm: STUB("submitForm"),
  reviewFormSubmission: STUB("reviewFormSubmission"),
  confirmFormSubmission: STUB("confirmFormSubmission"),
  triggerReconfirm: STUB("triggerReconfirm"),
  getFormsForVendor: (eventId, vendorId) => {
    const forms = get().eventForms.filter((f) => f.eventId === eventId);
    const vendor = get().vendors.find((v) => v.id === vendorId);
    if (!vendor) return [];
    return forms.filter((f) => {
      if (!f.showWhen) return true;
      return vendor[f.showWhen.field] === f.showWhen.value;
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  },

  // notices（A4.3）
  createNotice: STUB("createNotice"),
  updateNotice: STUB("updateNotice"),
  deleteNotice: STUB("deleteNotice"),
  acknowledgeNotice: STUB("acknowledgeNotice"),

  // equipment（A4.3）
  createEquipmentItem: STUB("createEquipmentItem"),
  updateEquipmentItem: STUB("updateEquipmentItem"),
  deleteEquipmentItem: STUB("deleteEquipmentItem"),
  createEquipmentRequest: STUB("createEquipmentRequest"),
  updateEquipmentRequest: STUB("updateEquipmentRequest"),
  reviewEquipmentRequest: STUB("reviewEquipmentRequest"),

  // document templates（A4.4）
  createDocTemplate: STUB("createDocTemplate"),
  updateDocTemplate: STUB("updateDocTemplate"),
  deleteDocTemplate: STUB("deleteDocTemplate"),
  toggleEventDocument: STUB("toggleEventDocument"),
  setEventDocDeadline: STUB("setEventDocDeadline"),
  setEventDocRequired: STUB("setEventDocRequired"),

  // email templates（A4.4）
  createEmailTemplate: STUB("createEmailTemplate"),
  updateEmailTemplate: STUB("updateEmailTemplate"),
  deleteEmailTemplate: STUB("deleteEmailTemplate"),
  copyTenantTemplatesToEvent: STUB("copyTenantTemplatesToEvent"),

  // smtp（A4.4）
  updateSmtpSettings: STUB("updateSmtpSettings"),
  testSmtpConnection: STUB("testSmtpConnection"),

  // pre-event（A4.4）
  createPreEventNotice: STUB("createPreEventNotice"),
  updatePreEventNotice: STUB("updatePreEventNotice"),
  deletePreEventNotice: STUB("deletePreEventNotice"),
  sendPreEventNotice: STUB("sendPreEventNotice"),

  // decorators（A4.4）
  createDecorator: STUB("createDecorator"),
  updateDecorator: STUB("updateDecorator"),
  deleteDecorator: STUB("deleteDecorator"),
  createProject: STUB("createProject"),
  updateProject: STUB("updateProject"),
  uploadDesign: STUB("uploadDesign"),
  reviewDesign: STUB("reviewDesign"),
  sendMessage: STUB("sendMessage"),
  sendDecoratorInvitation: STUB("sendDecoratorInvitation"),

  // permissions（A4.4）
  setRolePermission: STUB("setRolePermission"),
  setRolePermissions: STUB("setRolePermissions"),
  setMemberPermOverride: STUB("setMemberPermOverride"),
  getEffectivePermission: () => true,  // 暫時都放行

  // ═════════════════════════════════════════════════════
  // Helpers / Selectors（read-only，從 state 算）
  // ═════════════════════════════════════════════════════

  getTenantSubsystems: (companyId) =>
    get().tenantSubsystems.filter((x) => x.companyId === companyId),
  isSubsystemActiveForTenant: (companyId, subsystemKey) =>
    get().tenantSubsystems.some((x) => x.companyId === companyId && x.subsystemKey === subsystemKey),
  canAccessTenant: (user, companyId) => {
    if (!user) return false;
    if (user.role === "super-admin" || user.role === "portal-admin") return true;
    return user.tenantId === companyId;
  },
  canAccessEvent: (user, eventId) => {
    if (!user) return false;
    if (user.role === "super-admin" || user.role === "portal-admin") return true;
    const event = get().events.find((e) => e.id === eventId);
    return event?.tenantId === user.tenantId;
  },
  getMyEvents: (user) => {
    if (!user) return [];
    const all = get().events;
    if (user.role === "super-admin" || user.role === "portal-admin") return all;
    return all.filter((e) => e.tenantId === user.tenantId);
  },

  byId: {
    company: (id) => get().companies.find((x) => x.id === id),
    user: (id) => get().users.find((x) => x.id === id),
    event: (id) => get().events.find((x) => x.id === id),
    vendor: (id) => get().vendors.find((x) => x.id === id),
    decorator: (id) => get().decorators.find((x) => x.id === id),
    project: (id) => get().decorationProjects.find((x) => x.id === id),
    invitation: (token) => get().invitations.find((x) => x.token === token),
    decoratorInvitation: (token) => get().decoratorInvitations.find((x) => x.token === token),
    notice: (id) => get().eventNotices.find((x) => x.id === id),
    form: (id) => get().eventForms.find((x) => x.id === id),
    equipmentItem: (id) => get().eventEquipmentCatalog.find((x) => x.id === id),
    equipmentRequest: (id) => get().equipmentRequests.find((x) => x.id === id),
    emailTemplate: (id) => get().emailTemplates.find((x) => x.id === id),
    smtp: (companyId) => get().smtpSettings.find((x) => x.companyId === companyId || x.tenantId === companyId),
    preEventNotice: (id) => get().preEventNotices.find((x) => x.id === id),
    rsvpByToken: (token) => get().rsvpResponses.find((x) => x.token === token),
  },
}));
