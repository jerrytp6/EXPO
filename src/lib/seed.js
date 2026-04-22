// 種子資料 — 第一次啟動時寫入 localStorage
// v12: 加入 eventNotices / eventForms / eventEquipmentCatalog / equipmentRequests
//       emailTemplates / smtpSettings / preEventNotices / rsvpResponses
//       vendors.decorationMode / vendors.rsvpStatus / events.boothSelfSelectionEnabled
export const SEED = {
  users: [
    { id: "u-sa-1", email: "admin@exhibitos.com",       name: "平台管理員", role: "super-admin",   companyId: null,    title: "EX 系統維運" },
    { id: "u-ca-1", email: "ming@agcnet.com.tw",         name: "陳小明",     role: "company-admin", companyId: "c-1",  title: "資訊長 CIO" },
    { id: "u-em-1", email: "yating@agcnet.com.tw",       name: "林雅婷",     role: "event-manager", companyId: "c-1",  title: "行銷部主任" },
    { id: "u-em-2", email: "wenhao@agcnet.com.tw",       name: "張文豪",     role: "event-manager", companyId: "c-1",  title: "業務經理" },
    { id: "u-mb-1", email: "meiling@agcnet.com.tw",      name: "王美玲",     role: "member",        companyId: "c-1",  title: "客服專員" },
    { id: "u-mb-2", email: "junhong@agcnet.com.tw",      name: "李俊宏",     role: "member",        companyId: "c-1",  title: "行銷專員" },
  ],
  companies: [
    { id: "c-1", name: "群揚資通股份有限公司", taxId: "12345678", industry: "資訊服務業", size: "100–500 人", address: "台北市內湖區瑞光路 168 號", phone: "02-2345-6789", adminUserId: "u-ca-1", status: "active", createdAt: "2026-01-15" },
    { id: "c-2", name: "米兒設計有限公司", taxId: "55667788", industry: "設計服務業", size: "10–50 人", address: "台北市大安區忠孝東路四段 100 號", phone: "02-2700-1234", adminUserId: null, status: "pending", createdAt: "2026-04-07" },
    { id: "c-3", name: "天藍科技有限公司", taxId: "99887766", industry: "電子製造業", size: "50–100 人", address: "新竹市東區光復路二段 101 號", phone: "03-5712-3456", adminUserId: null, status: "pending", createdAt: "2026-04-06" },
  ],
  events: [
    {
      id: "e-1", companyId: "c-1", name: "2026 台北國際電腦展", type: "實體展覽",
      startDate: "2026-06-04", endDate: "2026-06-07", location: "TWTC 南港展覽館一館",
      description: "亞洲最具規模之 ICT 應用展，匯集 AI、雲端、5G、智慧製造等領域。",
      managerId: "u-em-1", status: "preparing", createdAt: "2026-02-10",
      boothSelfSelectionEnabled: true, // 攤位配置「開關」：允許廠商自選
      boothTypes: [
        { id: "bt-1", name: "標準攤位", size: "3x3m (9㎡)", price: 54000, capacity: 80, description: "含隔板、日光燈、地毯、桌椅各 1" },
        { id: "bt-2", name: "島型攤位", size: "6x6m (36㎡)", price: 180000, capacity: 20, description: "四面開放，裝潢自理" },
        { id: "bt-3", name: "旗艦攤位", size: "9x6m (54㎡)", price: 320000, capacity: 8, description: "角落位，三面開放，含基礎水電" },
      ],
    },
    {
      id: "e-2", companyId: "c-1", name: "AI x Cloud Summit 2026", type: "論壇",
      startDate: "2026-05-12", endDate: "2026-05-12", location: "台北萬豪酒店",
      description: "聚焦企業 AI 與雲端轉型的高階論壇。",
      managerId: "u-em-1", status: "recruiting", createdAt: "2026-03-01",
      boothSelfSelectionEnabled: false,
      boothTypes: [
        { id: "bt-4", name: "標準攤位", size: "2x2m (4㎡)", price: 25000, capacity: 30, description: "桌椅 + 電源" },
      ],
    },
    {
      id: "e-3", companyId: "c-1", name: "智慧製造週", type: "實體展覽",
      startDate: "2026-07-22", endDate: "2026-07-24", location: "高雄展覽館",
      description: "聚焦工業 4.0 與智慧工廠應用。",
      managerId: "u-em-2", status: "planning", createdAt: "2026-03-20",
      boothSelfSelectionEnabled: true,
      boothTypes: [
        { id: "bt-5", name: "標準攤位", size: "3x3m (9㎡)", price: 48000, capacity: 50, description: "含基本裝潢" },
        { id: "bt-6", name: "空地攤位", size: "6x6m (36㎡)", price: 120000, capacity: 15, description: "僅租地坪，裝潢自理" },
      ],
    },
  ],
  // 廠商擴充展位資料；新增 decorationMode / rsvpStatus / rsvpRespondedAt
  vendors: [
    { id: "v-1", eventId: "e-1", company: "台灣積體電路製造", taxId: "22099131", contact: "李建國", email: "jianguo.li@tsmc.com", phone: "03-5636688", status: "registered", invitedAt: "2026-03-15", clickedAt: "2026-03-16", registeredAt: "2026-03-18", boothNumber: "A-12", boothTypeId: "bt-3", profile: "全球領先的晶圓代工服務供應商，以世界級的技術製造服務客戶。", products: ["3nm 製程", "CoWoS 封裝", "車用晶片"], decoratorId: "d-1", confirmStatus: "confirmed", confirmedAt: "2026-04-01", confirmedBy: "林雅婷", confirmNote: "", preferredBoothTypeId: null, depositStatus: "paid", balanceStatus: "paid", rsvpStatus: "accepted", rsvpRespondedAt: "2026-03-16", decorationMode: "self" },
    { id: "v-2", eventId: "e-1", company: "聯發科技",         taxId: "24566673", contact: "陳家豪", email: "jiahao.chen@mtk.com", phone: "03-5670766", status: "registered", invitedAt: "2026-03-15", clickedAt: "2026-03-15", registeredAt: "2026-03-17", boothNumber: "A-13", boothTypeId: "bt-2", profile: "全球無晶圓廠半導體公司，提供智慧手機、智慧家庭與物聯網解決方案。", products: ["天璣 9400", "Wi-Fi 7 晶片"], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: "paid", balanceStatus: "unpaid", rsvpStatus: "accepted", rsvpRespondedAt: "2026-03-15", decorationMode: "booth-vendor" },
    { id: "v-3", eventId: "e-1", company: "華碩電腦",         taxId: "23638777", contact: "王思婷", email: "siting.wang@asus.com", phone: "02-28943447", status: "clicked",     invitedAt: "2026-03-15", clickedAt: "2026-03-20", registeredAt: null, boothNumber: "", boothTypeId: null, profile: "", products: [], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: null, balanceStatus: null, rsvpStatus: "accepted", rsvpRespondedAt: "2026-03-20", decorationMode: null },
    { id: "v-4", eventId: "e-1", company: "宏碁電腦",         taxId: "73724707", contact: "蔡明哲", email: "ming.tsai@acer.com",   phone: "02-26963131", status: "invited",    invitedAt: "2026-03-15", clickedAt: null, registeredAt: null, boothNumber: "", boothTypeId: null, profile: "", products: [], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: null, balanceStatus: null, rsvpStatus: "pending", rsvpRespondedAt: null, decorationMode: null },
    { id: "v-5", eventId: "e-1", company: "微星科技",         taxId: "23864797", contact: "張文君", email: "wenjun@msi.com",       phone: "02-32340099", status: "declined",   invitedAt: "2026-03-15", clickedAt: "2026-03-16", registeredAt: null, boothNumber: "", boothTypeId: null, profile: "", products: [], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: null, balanceStatus: null, rsvpStatus: "declined", rsvpRespondedAt: "2026-03-16", decorationMode: null },
    { id: "v-6", eventId: "e-2", company: "趨勢科技",         taxId: "23064247", contact: "周慧玲", email: "huiling@trend.com",    phone: "02-23789666", status: "registered", invitedAt: "2026-03-25", clickedAt: "2026-03-25", registeredAt: "2026-03-26", boothNumber: "B-05", boothTypeId: "bt-4", profile: "全球資安解決方案領導品牌。", products: ["Cloud One"], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: "paid", balanceStatus: "paid", rsvpStatus: "accepted", rsvpRespondedAt: "2026-03-25", decorationMode: "booth-vendor" },
    { id: "v-7", eventId: "e-2", company: "緯創資通",         taxId: "70798568", contact: "黃志明", email: "ming@wistron.com",     phone: "02-66128000", status: "invited",    invitedAt: "2026-03-25", clickedAt: null, registeredAt: null, boothNumber: "", boothTypeId: null, profile: "", products: [], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: null, balanceStatus: null, rsvpStatus: "pending", rsvpRespondedAt: null, decorationMode: null },
  ],
  invitations: [
    { token: "tkn-acer-2026", eventId: "e-1", vendorId: "v-4", expiresAt: "2026-05-01" },
    { token: "tkn-wistron-2026", eventId: "e-2", vendorId: "v-7", expiresAt: "2026-05-01" },
  ],
  // ───── RSVP 回覆紀錄（邀約信點「是否參加」單次回覆）─────
  rsvpResponses: [
    { id: "rsvp-1", token: "tkn-tsmc-2026",    eventId: "e-1", vendorId: "v-1", response: "accepted", reason: "", respondedAt: "2026-03-16" },
    { id: "rsvp-2", token: "tkn-mtk-2026",     eventId: "e-1", vendorId: "v-2", response: "accepted", reason: "", respondedAt: "2026-03-15" },
    { id: "rsvp-3", token: "tkn-asus-2026",    eventId: "e-1", vendorId: "v-3", response: "accepted", reason: "", respondedAt: "2026-03-20" },
    { id: "rsvp-4", token: "tkn-msi-2026",     eventId: "e-1", vendorId: "v-5", response: "declined", reason: "今年度展覽計畫調整，恕難出席。", respondedAt: "2026-03-16" },
    { id: "rsvp-5", token: "tkn-trend-2026",   eventId: "e-2", vendorId: "v-6", response: "accepted", reason: "", respondedAt: "2026-03-25" },
  ],
  activities: [
    { id: "a-1", eventId: "e-1", vendorId: "v-1", action: "registered", at: Date.now() - 2 * 60 * 1000 },
    { id: "a-2", eventId: "e-1", vendorId: "v-3", action: "clicked",     at: Date.now() - 5 * 60 * 1000 },
    { id: "a-3", eventId: "e-1", vendorId: "v-2", action: "registered", at: Date.now() - 12 * 60 * 1000 },
    { id: "a-4", eventId: "e-1", vendorId: "v-4", action: "clicked",     at: Date.now() - 18 * 60 * 1000 },
  ],

  // ───── 裝潢公司 ─────
  decorators: [
    {
      id: "d-1",
      name: "築境空間設計",
      taxId: "44556677",
      contact: "蔡建築",
      title: "資深設計師",
      email: "jian@zhuying-design.com",
      phone: "02-2706-8899",
      address: "台北市信義區基隆路一段 200 號",
      specialties: ["科技展", "金融展", "島型攤位"],
      status: "active",
      createdAt: "2026-03-20",
    },
  ],

  // 廠商寄給裝潢公司的邀請
  decoratorInvitations: [
    {
      token: "dtkn-mtk-zhuying",
      fromVendorId: "v-2",
      eventId: "e-1",
      decoratorEmail: "design@taipei-decor.com",
      decoratorCompany: "台北會展裝潢有限公司",
      message: "您好，我們是聯發科技，將參加 2026 台北國際電腦展，誠摯邀請貴公司協助本次展位設計與裝潢。",
      status: "pending",
      createdAt: "2026-04-01",
      expiresAt: "2026-05-01",
    },
  ],

  // 裝潢專案（廠商 ↔ 裝潢公司）
  decorationProjects: [
    {
      id: "dp-1",
      vendorId: "v-1",
      decoratorId: "d-1",
      eventId: "e-1",
      title: "TSMC 旗艦島型攤位設計",
      status: "designing",
      budget: 1800000,
      deadline: "2026-05-15",
      createdAt: "2026-03-25",
    },
  ],

  // 設計稿（裝潢上傳，廠商審核）
  designs: [
    { id: "ds-1", projectId: "dp-1", version: "v1.0", title: "初版整體配置圖", description: "以未來感金屬質感為主軸，中央設置 3D 投影展示區。", uploadedAt: "2026-03-28", status: "approved", feedback: "整體方向很棒，請維持這個風格。" },
    { id: "ds-2", projectId: "dp-1", version: "v2.0", title: "細部材質與燈光配置", description: "增加 LED 矩陣與層次燈光，材質改用霧面金屬與玻璃。", uploadedAt: "2026-04-05", status: "pending", feedback: "" },
  ],

  // 廠商與裝潢公司的訊息
  messages: [
    { id: "m-1", projectId: "dp-1", sender: "vendor",    senderName: "李建國", content: "您好，請問初版設計圖大概什麼時候可以看到？", at: Date.now() - 3 * 86400 * 1000 },
    { id: "m-2", projectId: "dp-1", sender: "decorator", senderName: "蔡建築", content: "您好！本週五前會交付初稿，謝謝。", at: Date.now() - 3 * 86400 * 1000 + 30 * 60 * 1000 },
    { id: "m-3", projectId: "dp-1", sender: "decorator", senderName: "蔡建築", content: "v2.0 已上傳，請參考細部材質與燈光配置。", at: Date.now() - 2 * 3600 * 1000 },
  ],

  // ───── 權限矩陣 ─────
  permissions: {
    "c-1::company-admin": {
      "members.view": true, "members.invite": true, "members.edit": true, "members.remove": true, "members.permissions": true,
      "events.view": true,  "events.create": true,  "events.edit": true,  "events.delete": true,  "events.assign": true,
      "vendors.view": true, "vendors.import": true, "vendors.invite": true, "vendors.monitor": true,
      "decoration.view": true, "decoration.manage": true,
      "analytics.view": true, "analytics.export": true,
      "settings.company": true, "settings.billing": true, "settings.smtp": true, "settings.emailTemplates": true,
    },
    "c-1::event-manager": {
      "members.view": true, "members.invite": false, "members.edit": false, "members.remove": false, "members.permissions": false,
      "events.view": true,  "events.create": false,  "events.edit": true,  "events.delete": false,  "events.assign": false,
      "vendors.view": true, "vendors.import": true, "vendors.invite": true, "vendors.monitor": true,
      "decoration.view": true, "decoration.manage": false,
      "analytics.view": true, "analytics.export": false,
      "settings.company": false, "settings.billing": false, "settings.smtp": false, "settings.emailTemplates": false,
    },
    "c-1::member": {
      "members.view": true, "members.invite": false, "members.edit": false, "members.remove": false, "members.permissions": false,
      "events.view": true,  "events.create": false,  "events.edit": false,  "events.delete": false,  "events.assign": false,
      "vendors.view": true, "vendors.import": false, "vendors.invite": false, "vendors.monitor": false,
      "decoration.view": true, "decoration.manage": false,
      "analytics.view": false, "analytics.export": false,
      "settings.company": false, "settings.billing": false, "settings.smtp": false, "settings.emailTemplates": false,
    },
  },

  memberPermOverrides: {},

  // ───── 全域文件模板庫（沿用；作為「繳交型」文件模板庫）─────
  documentTemplates: [
    { id: "dt-1",  category: "基本資料", name: "公司 Logo（高解析）",     required: true,  formats: ".png,.svg,.ai",   sortOrder: 1 },
    { id: "dt-2",  category: "基本資料", name: "公司簡介 PDF",            required: true,  formats: ".pdf",            sortOrder: 2 },
    { id: "dt-3",  category: "基本資料", name: "產品型錄",                required: false, formats: ".pdf,.pptx",      sortOrder: 3 },
    { id: "dt-4",  category: "展位相關", name: "攤位設計圖",              required: true,  formats: ".pdf,.dwg,.png",  sortOrder: 4 },
    { id: "dt-5",  category: "展位相關", name: "施工申請書",              required: true,  formats: ".pdf,.docx",      sortOrder: 5 },
    { id: "dt-6",  category: "展位相關", name: "用電需求表",              required: true,  formats: ".pdf,.xlsx",      sortOrder: 6 },
    { id: "dt-7",  category: "展位相關", name: "網路需求申請",            required: false, formats: ".pdf,.xlsx",      sortOrder: 7 },
    { id: "dt-8",  category: "法規文件", name: "公共意外險證明",          required: true,  formats: ".pdf,.jpg,.png",  sortOrder: 8 },
    { id: "dt-9",  category: "法規文件", name: "施工人員名冊",            required: true,  formats: ".pdf,.xlsx",      sortOrder: 9 },
    { id: "dt-10", category: "法規文件", name: "消防自主檢查表",          required: true,  formats: ".pdf",            sortOrder: 10 },
    { id: "dt-11", category: "行銷素材", name: "展覽手冊廣告稿",          required: false, formats: ".pdf,.ai,.psd",   sortOrder: 11 },
    { id: "dt-12", category: "行銷素材", name: "參展商介紹文字（中/英）",  required: true,  formats: ".pdf,.docx,.txt", sortOrder: 12 },
  ],

  eventDocuments: [
    { eventId: "e-1", templateId: "dt-1",  deadline: "2026-04-30", required: null },
    { eventId: "e-1", templateId: "dt-2",  deadline: "2026-04-30", required: null },
    { eventId: "e-1", templateId: "dt-3",  deadline: "2026-05-10", required: null },
    { eventId: "e-1", templateId: "dt-4",  deadline: "2026-05-01", required: null },
    { eventId: "e-1", templateId: "dt-5",  deadline: "2026-05-01", required: null },
    { eventId: "e-1", templateId: "dt-6",  deadline: "2026-05-10", required: null },
    { eventId: "e-1", templateId: "dt-8",  deadline: "2026-05-15", required: null },
    { eventId: "e-1", templateId: "dt-9",  deadline: "2026-05-20", required: null },
    { eventId: "e-1", templateId: "dt-10", deadline: "2026-05-20", required: null },
    { eventId: "e-1", templateId: "dt-11", deadline: "2026-04-25", required: null },
    { eventId: "e-1", templateId: "dt-12", deadline: "2026-04-25", required: null },
  ],

  submissions: [
    { id: "sub-1", eventId: "e-1", vendorId: "v-1", itemId: "dt-1",  fileName: "tsmc-logo-4k.png",          fileSize: "2.4 MB", submittedAt: "2026-04-10", status: "approved",  reviewedAt: "2026-04-11", reviewedBy: "林雅婷", feedback: "", vendorConfirmed: true,  vendorConfirmedAt: "2026-04-11", needsReconfirm: false },
    { id: "sub-2", eventId: "e-1", vendorId: "v-1", itemId: "dt-2",  fileName: "tsmc-company-profile.pdf",  fileSize: "5.8 MB", submittedAt: "2026-04-10", status: "approved",  reviewedAt: "2026-04-11", reviewedBy: "林雅婷", feedback: "", vendorConfirmed: true,  vendorConfirmedAt: "2026-04-11", needsReconfirm: false },
    { id: "sub-3", eventId: "e-1", vendorId: "v-1", itemId: "dt-4",  fileName: "tsmc-booth-layout-v1.pdf",  fileSize: "3.2 MB", submittedAt: "2026-04-08", status: "rejected",  reviewedAt: "2026-04-09", reviewedBy: "林雅婷", feedback: "尺寸不符規範，請依照 9x6m 的島型攤位重新繪製。", vendorConfirmed: false, vendorConfirmedAt: null, needsReconfirm: true },
    { id: "sub-4", eventId: "e-1", vendorId: "v-1", itemId: "dt-12", fileName: "tsmc-intro-zh-en.docx",     fileSize: "1.1 MB", submittedAt: "2026-04-12", status: "submitted", reviewedAt: null, reviewedBy: null, feedback: "", vendorConfirmed: false, vendorConfirmedAt: null, needsReconfirm: false },
    { id: "sub-5", eventId: "e-1", vendorId: "v-2", itemId: "dt-1",  fileName: "mtk-logo.svg",              fileSize: "0.3 MB", submittedAt: "2026-04-11", status: "submitted", reviewedAt: null, reviewedBy: null, feedback: "", vendorConfirmed: false, vendorConfirmedAt: null, needsReconfirm: false },
    { id: "sub-6", eventId: "e-1", vendorId: "v-2", itemId: "dt-2",  fileName: "mtk-profile-2026.pdf",      fileSize: "4.5 MB", submittedAt: "2026-04-11", status: "submitted", reviewedAt: null, reviewedBy: null, feedback: "", vendorConfirmed: false, vendorConfirmedAt: null, needsReconfirm: false },
  ],

  submissionLogs: [
    { id: "sl-1", submissionId: "sub-1", action: "submitted", by: "李建國", at: "2026-04-10", note: "" },
    { id: "sl-2", submissionId: "sub-1", action: "approved",  by: "林雅婷", at: "2026-04-11", note: "" },
    { id: "sl-3", submissionId: "sub-3", action: "submitted", by: "李建國", at: "2026-04-08", note: "" },
    { id: "sl-4", submissionId: "sub-3", action: "rejected",  by: "林雅婷", at: "2026-04-09", note: "尺寸不符規範，請依照 9x6m 的島型攤位重新繪製。" },
  ],

  reminders: [],

  // ═════════════════════════════════════════════════════════
  // ══════════  v12 新增：對應 PDF 五大業務流程 ══════════
  // ═════════════════════════════════════════════════════════

  // ───── 文件須知（Notices）— PDF p11「展覽文件確認須知流程」─────
  // 僅閱讀 + 勾選同意；裝潢廠商入口唯讀
  eventNotices: [
    { id: "n-1",  eventId: "e-1", category: "會場資訊", title: "會場平面圖",           content: "展覽地圖、區位編號、主要出入口與逃生動線標示。", attachmentName: "map-twtc-2026.pdf", requiresAck: true,  allowDecoratorView: true,  sortOrder: 1,  publishedAt: "2026-04-01" },
    { id: "n-2",  eventId: "e-1", category: "進場",     title: "廠商進撤場注意事項",   content: "進場時段：6/3 08:00–18:00；撤場：6/7 21:00 後。車輛需申請通行證。", attachmentName: null, requiresAck: true,  allowDecoratorView: true,  sortOrder: 2,  publishedAt: "2026-04-01" },
    { id: "n-3",  eventId: "e-1", category: "費用",     title: "保證金收退規範",       content: "每攤位需繳交 NT$30,000 保證金，撤場驗收無缺失後 14 日內退還。", attachmentName: null, requiresAck: true,  allowDecoratorView: false, sortOrder: 3,  publishedAt: "2026-04-01" },
    { id: "n-4",  eventId: "e-1", category: "裝潢",     title: "攤位裝潢注意事項",     content: "裝潢高度限 2.5m；使用防火建材；施工期間需配備工安人員。", attachmentName: "deco-rules.pdf", requiresAck: true,  allowDecoratorView: true,  sortOrder: 4,  publishedAt: "2026-04-01" },
    { id: "n-5",  eventId: "e-1", category: "進場",     title: "卸貨區進出場動線",     content: "卸貨區位於一館北側 B1；動線與時段表詳附件。", attachmentName: "loading-flow.pdf", requiresAck: true,  allowDecoratorView: true,  sortOrder: 5,  publishedAt: "2026-04-01" },
    { id: "n-6",  eventId: "e-1", category: "配備",     title: "基本隔間配備清單",     content: "標準攤位含：隔板、桌子 1 張、椅子 2 張、日光燈 2 支、110V 插座 1 組。", attachmentName: null, requiresAck: false, allowDecoratorView: true,  sortOrder: 6,  publishedAt: "2026-04-01" },
    { id: "n-7",  eventId: "e-1", category: "設備",     title: "電器設備消耗功率參考表", content: "常見設備耗電一覽；超出基本用電需另申請加電。", attachmentName: "power-ref.xlsx", requiresAck: false, allowDecoratorView: true,  sortOrder: 7,  publishedAt: "2026-04-01" },
    { id: "n-8",  eventId: "e-1", category: "議程",     title: "活動議程總覽",         content: "開幕式、主題論壇、頒獎典禮時程。", attachmentName: null, requiresAck: false, allowDecoratorView: false, sortOrder: 8,  publishedAt: "2026-04-01" },
    { id: "n-9",  eventId: "e-1", category: "須知",     title: "參展廠商須知",         content: "展覽期間人員配置、識別證領取、安全規範。", attachmentName: null, requiresAck: true,  allowDecoratorView: false, sortOrder: 9,  publishedAt: "2026-04-01" },
    { id: "n-10", eventId: "e-1", category: "展前",     title: "展前作業核對表",       content: "各項繳交期限、必辦事項一覽。", attachmentName: "checklist.pdf", requiresAck: true,  allowDecoratorView: false, sortOrder: 10, publishedAt: "2026-04-01" },
    { id: "n-11", eventId: "e-1", category: "申請",     title: "延長場地使用申請說明", content: "如需超時使用展場，請於展前 5 日提出申請。", attachmentName: null, requiresAck: false, allowDecoratorView: true,  sortOrder: 11, publishedAt: "2026-04-01" },
  ],

  // ───── 須知勾選紀錄 ─────
  noticeAcknowledgments: [
    { id: "ack-1", eventId: "e-1", vendorId: "v-1", noticeId: "n-1",  acknowledgedAt: "2026-04-05" },
    { id: "ack-2", eventId: "e-1", vendorId: "v-1", noticeId: "n-2",  acknowledgedAt: "2026-04-05" },
    { id: "ack-3", eventId: "e-1", vendorId: "v-1", noticeId: "n-3",  acknowledgedAt: "2026-04-05" },
    { id: "ack-4", eventId: "e-1", vendorId: "v-1", noticeId: "n-4",  acknowledgedAt: "2026-04-05" },
    { id: "ack-5", eventId: "e-1", vendorId: "v-2", noticeId: "n-1",  acknowledgedAt: "2026-04-08" },
    { id: "ack-6", eventId: "e-1", vendorId: "v-2", noticeId: "n-2",  acknowledgedAt: "2026-04-08" },
  ],

  // ───── 表單（Forms）— PDF p12「表單文件簽署流程」─────
  // 下載 → 簽 → 上傳；支援條件顯示（showWhen）+ 計費審核（hasFee）+ 跳過選項（skipOption）
  // showWhen.field 目前支援：decorationMode
  eventForms: [
    { id: "f-1",  eventId: "e-1", category: "切結書", name: "攤位廠商參展切結書",         templateFileName: "切結書-參展.pdf",   formats: ".pdf", isRequired: true,  hasFee: false, skipOption: false, showWhen: null,                                                   deadline: "2026-05-01", sortOrder: 1,  allowDecoratorUpload: false },
    { id: "f-2",  eventId: "e-1", category: "切結書", name: "特殊裝潢廠商施工切結書",     templateFileName: "切結書-裝潢.pdf",   formats: ".pdf", isRequired: true,  hasFee: false, skipOption: false, showWhen: { field: "decorationMode", value: "self" },           deadline: "2026-05-01", sortOrder: 2,  allowDecoratorUpload: true  },
    { id: "f-3",  eventId: "e-1", category: "施工",   name: "施工前安全衛生承諾書",       templateFileName: "安全衛生承諾書.pdf", formats: ".pdf", isRequired: true,  hasFee: false, skipOption: false, showWhen: { field: "decorationMode", value: "self" },           deadline: "2026-05-01", sortOrder: 3,  allowDecoratorUpload: true  },
    { id: "f-4",  eventId: "e-1", category: "施工",   name: "電力位置圖",                 templateFileName: "電力位置圖範本.pdf", formats: ".pdf,.dwg", isRequired: true, hasFee: false, skipOption: false, showWhen: { field: "decorationMode", value: "self" },           deadline: "2026-05-10", sortOrder: 4,  allowDecoratorUpload: true  },
    { id: "f-5",  eventId: "e-1", category: "撤場",   name: "撤場檢查單",                 templateFileName: "撤場檢查單.pdf",    formats: ".pdf", isRequired: true,  hasFee: false, skipOption: false, showWhen: null,                                                   deadline: "2026-06-07", sortOrder: 5,  allowDecoratorUpload: false },
    { id: "f-6",  eventId: "e-1", category: "行銷",   name: "公司名稱露出申請",           templateFileName: "公司名稱露出.pdf", formats: ".pdf", isRequired: true,  hasFee: false, skipOption: false, showWhen: null,                                                   deadline: "2026-04-25", sortOrder: 6,  allowDecoratorUpload: false },
    { id: "f-7",  eventId: "e-1", category: "申請",   name: "延長場地使用申請表",         templateFileName: "延長場地.pdf",     formats: ".pdf", isRequired: false, hasFee: true,  skipOption: true,  showWhen: null,                                                   deadline: "2026-05-25", sortOrder: 7,  allowDecoratorUpload: false },
    { id: "f-8",  eventId: "e-1", category: "申請",   name: "追加配備申請表",             templateFileName: "追加配備.pdf",     formats: ".pdf", isRequired: true,  hasFee: true,  skipOption: true,  showWhen: null,                                                   deadline: "2026-05-15", sortOrder: 8,  allowDecoratorUpload: false },
    { id: "f-9",  eventId: "e-1", category: "配備",   name: "攤位配備申請表",             templateFileName: "攤位配備.pdf",     formats: ".pdf", isRequired: true,  hasFee: false, skipOption: false, showWhen: null,                                                   deadline: "2026-05-10", sortOrder: 9,  allowDecoratorUpload: false },
    { id: "f-10", eventId: "e-1", category: "費用",   name: "保證金支票",                 templateFileName: "保證金說明.pdf",   formats: ".pdf,.jpg,.png", isRequired: true, hasFee: true, skipOption: false, showWhen: null,                                                deadline: "2026-05-20", sortOrder: 10, allowDecoratorUpload: false },
  ],

  // ───── 表單繳交紀錄 ─────
  formSubmissions: [
    { id: "fs-1", eventId: "e-1", vendorId: "v-1", formId: "f-1",  fileName: "tsmc-切結書-簽署.pdf",       fileSize: "0.8 MB", submittedAt: "2026-04-05", status: "approved",          fee: null,  paymentProofFileName: null, reviewedAt: "2026-04-06", reviewedBy: "林雅婷", feedback: "", vendorConfirmed: true,  vendorConfirmedAt: "2026-04-06", needsReconfirm: false, uploadedByRole: "vendor" },
    { id: "fs-2", eventId: "e-1", vendorId: "v-1", formId: "f-2",  fileName: "tsmc-裝潢切結書.pdf",         fileSize: "1.1 MB", submittedAt: "2026-04-08", status: "approved",          fee: null,  paymentProofFileName: null, reviewedAt: "2026-04-09", reviewedBy: "林雅婷", feedback: "", vendorConfirmed: true,  vendorConfirmedAt: "2026-04-09", needsReconfirm: false, uploadedByRole: "decorator" },
    { id: "fs-3", eventId: "e-1", vendorId: "v-1", formId: "f-8",  fileName: "tsmc-追加配備.pdf",           fileSize: "0.6 MB", submittedAt: "2026-04-10", status: "pending_fee_review", fee: 45000, paymentProofFileName: "匯款單-tsmc.jpg", reviewedAt: null, reviewedBy: null, feedback: "", vendorConfirmed: false, vendorConfirmedAt: null, needsReconfirm: false, uploadedByRole: "vendor" },
    { id: "fs-4", eventId: "e-1", vendorId: "v-2", formId: "f-1",  fileName: "mtk-切結書.pdf",             fileSize: "0.7 MB", submittedAt: "2026-04-11", status: "submitted",         fee: null,  paymentProofFileName: null, reviewedAt: null, reviewedBy: null, feedback: "", vendorConfirmed: false, vendorConfirmedAt: null, needsReconfirm: false, uploadedByRole: "vendor" },
    { id: "fs-5", eventId: "e-1", vendorId: "v-2", formId: "f-9",  fileName: "mtk-配備申請.pdf",           fileSize: "0.5 MB", submittedAt: "2026-04-12", status: "submitted",         fee: null,  paymentProofFileName: null, reviewedAt: null, reviewedBy: null, feedback: "", vendorConfirmed: false, vendorConfirmedAt: null, needsReconfirm: false, uploadedByRole: "vendor" },
  ],

  // ───── 設備目錄（Equipment Catalog）— PDF p13「設備申請流程」─────
  eventEquipmentCatalog: [
    { id: "eq-1",  eventId: "e-1", category: "電力",     name: "110V 單相電源 15A", spec: "110V / 15A / 單相",   unit: "組", unitPrice: 1200,  stock: 80 },
    { id: "eq-2",  eventId: "e-1", category: "電力",     name: "220V 單相電源 15A", spec: "220V / 15A / 單相",   unit: "組", unitPrice: 2500,  stock: 50 },
    { id: "eq-3",  eventId: "e-1", category: "電力",     name: "220V 三相電源 30A", spec: "220V / 30A / 三相",   unit: "組", unitPrice: 6800,  stock: 20 },
    { id: "eq-4",  eventId: "e-1", category: "網路",     name: "有線網路（100M）",  spec: "RJ45 / 100Mbps",      unit: "條", unitPrice: 1800,  stock: 60 },
    { id: "eq-5",  eventId: "e-1", category: "網路",     name: "專屬 Wi-Fi AP",     spec: "802.11ax / 500Mbps",  unit: "台", unitPrice: 4500,  stock: 15 },
    { id: "eq-6",  eventId: "e-1", category: "展示器材", name: "55\" 液晶電視",     spec: "4K UHD / HDMI",       unit: "台", unitPrice: 4800,  stock: 30 },
    { id: "eq-7",  eventId: "e-1", category: "展示器材", name: "75\" 液晶電視",     spec: "4K UHD / HDMI",       unit: "台", unitPrice: 8500,  stock: 10 },
    { id: "eq-8",  eventId: "e-1", category: "展示器材", name: "平板展架",          spec: "10.2 吋 iPad",         unit: "組", unitPrice: 2200,  stock: 40 },
    { id: "eq-9",  eventId: "e-1", category: "桌椅家具", name: "洽談桌",            spec: "120×60×75 cm",         unit: "張", unitPrice: 450,   stock: 100 },
    { id: "eq-10", eventId: "e-1", category: "桌椅家具", name: "洽談椅",            spec: "符合人體工學",         unit: "張", unitPrice: 180,   stock: 200 },
    { id: "eq-11", eventId: "e-1", category: "桌椅家具", name: "高腳椅",            spec: "吧檯款",               unit: "張", unitPrice: 280,   stock: 80 },
    { id: "eq-12", eventId: "e-1", category: "燈光音響", name: "HQI 投射燈 150W",   spec: "色溫 4000K",           unit: "盞", unitPrice: 850,   stock: 60 },
    { id: "eq-13", eventId: "e-1", category: "燈光音響", name: "無線麥克風組",      spec: "1 發射 + 2 收音",       unit: "組", unitPrice: 2800,  stock: 12 },
    { id: "eq-14", eventId: "e-1", category: "其他",     name: "飲水機",            spec: "冰溫熱三用",           unit: "台", unitPrice: 1500,  stock: 20 },
  ],

  // ───── 設備申請紀錄 ─────
  equipmentRequests: [
    {
      id: "er-1", eventId: "e-1", vendorId: "v-1",
      items: [
        { catalogId: "eq-2",  qty: 2, spec: "主電源" },
        { catalogId: "eq-6",  qty: 2, spec: "正面展示" },
        { catalogId: "eq-9",  qty: 1, spec: "" },
        { catalogId: "eq-10", qty: 4, spec: "" },
      ],
      totalAmount: 5000 + 9600 + 450 + 720,
      status: "approved",
      pdfGeneratedAt: "2026-04-10",
      signedFileName: "tsmc-設備申請-簽.pdf",
      paymentProofFileName: "tsmc-匯款單.jpg",
      paidAt: "2026-04-11",
      reviewedBy: "林雅婷", reviewedAt: "2026-04-12", feedback: "",
      createdAt: "2026-04-09", updatedAt: "2026-04-12",
      vendorConfirmed: true, vendorConfirmedAt: "2026-04-12", needsReconfirm: false,
    },
    {
      id: "er-2", eventId: "e-1", vendorId: "v-2",
      items: [
        { catalogId: "eq-1",  qty: 1, spec: "" },
        { catalogId: "eq-6",  qty: 1, spec: "" },
        { catalogId: "eq-9",  qty: 1, spec: "" },
        { catalogId: "eq-10", qty: 2, spec: "" },
      ],
      totalAmount: 1200 + 4800 + 450 + 360,
      status: "submitted",
      pdfGeneratedAt: "2026-04-11",
      signedFileName: null,
      paymentProofFileName: null,
      paidAt: null,
      reviewedBy: null, reviewedAt: null, feedback: "",
      createdAt: "2026-04-11", updatedAt: "2026-04-11",
      vendorConfirmed: false, vendorConfirmedAt: null, needsReconfirm: false,
    },
  ],

  // ───── 郵件模板（預設 + 活動）─────
  // scope: "tenant" → 租戶預設模板；"event" → 活動模板（建立活動時從預設複製過來）
  emailTemplates: [
    // ───── 租戶預設模板（companyId: c-1）─────
    { id: "et-t-1", scope: "tenant", companyId: "c-1", eventId: null, trigger: "invitation",       name: "廠商邀約信",           subject: "【{{event.name}}】誠摯邀請您參展",                body: "親愛的 {{vendor.contact}} 您好，\n\n我們正在籌備 {{event.name}}（{{event.startDate}} ~ {{event.endDate}}，地點：{{event.location}}），誠摯邀請貴公司參展。\n\n請點擊下方連結回覆是否參加：\n{{rsvp.acceptLink}}（接受）\n{{rsvp.declineLink}}（婉拒）\n\n順頌商祺\n{{company.name}}", isSystem: true,  updatedAt: "2026-03-01" },
    { id: "et-t-2", scope: "tenant", companyId: "c-1", eventId: null, trigger: "rsvp_accepted",    name: "RSVP 接受 → 註冊連結",   subject: "【{{event.name}}】歡迎！請完成廠商註冊",             body: "{{vendor.contact}} 您好，\n\n感謝您同意參展！請點擊下方連結完成廠商資料註冊，並進入參展系統：\n{{portal.registerLink}}\n\n如有問題請聯繫 {{event.manager.email}}", isSystem: true, updatedAt: "2026-03-01" },
    { id: "et-t-3", scope: "tenant", companyId: "c-1", eventId: null, trigger: "register_confirm", name: "註冊完成通知",         subject: "【{{event.name}}】註冊已完成",                     body: "{{vendor.contact}} 您好，\n\n貴公司已成功註冊為 {{event.name}} 參展廠商。\n接下來請依各項通知完成必要表單繳交。\n\n廠商入口：{{portal.loginLink}}", isSystem: true, updatedAt: "2026-03-01" },
    { id: "et-t-4", scope: "tenant", companyId: "c-1", eventId: null, trigger: "form_approved",    name: "表單審核通過",         subject: "【{{event.name}}】{{form.name}} 已審核通過",         body: "{{vendor.contact}} 您好，\n\n您提交的「{{form.name}}」已審核通過。", isSystem: true, updatedAt: "2026-03-01" },
    { id: "et-t-5", scope: "tenant", companyId: "c-1", eventId: null, trigger: "form_rejected",    name: "表單審核退回",         subject: "【{{event.name}}】{{form.name}} 需要修正",           body: "{{vendor.contact}} 您好，\n\n您提交的「{{form.name}}」需要修正，原因：\n{{form.feedback}}\n\n請登入重新繳交：{{portal.loginLink}}", isSystem: true, updatedAt: "2026-03-01" },
    { id: "et-t-6", scope: "tenant", companyId: "c-1", eventId: null, trigger: "reminder",         name: "繳交催繳提醒",         subject: "【{{event.name}}】尚有項目未繳交",                 body: "{{vendor.contact}} 您好，\n\n提醒您，以下項目尚未完成：\n{{pending.items}}\n\n繳交期限：{{form.deadline}}\n請盡速處理：{{portal.loginLink}}", isSystem: true, updatedAt: "2026-03-01" },
    { id: "et-t-7", scope: "tenant", companyId: "c-1", eventId: null, trigger: "pre_event_notice", name: "展前通知（佈展）",     subject: "【{{event.name}}】展前重要通知",                   body: "{{vendor.contact}} 您好，\n\n展覽開始日期：{{event.startDate}}\n\n{{preEvent.content}}\n\n詳細進場指引請登入查看。", isSystem: true, updatedAt: "2026-03-01" },
    { id: "et-t-8", scope: "tenant", companyId: "c-1", eventId: null, trigger: "fee_review",       name: "費用審核通知（活管）", subject: "【{{event.name}}】{{vendor.company}} 繳交費用待審",   body: "{{manager.name}} 您好，\n\n{{vendor.company}} 已提交 {{form.name}}（金額 NT$ {{form.fee}}），請審核匯款單並核可。\n\n管理後台：{{admin.reviewLink}}", isSystem: true, updatedAt: "2026-03-01" },

    // ───── 活動模板（e-1 台北國際電腦展，已從預設複製並客製）─────
    { id: "et-e-1", scope: "event", companyId: "c-1", eventId: "e-1", trigger: "invitation",       name: "廠商邀約信",           subject: "【2026 台北國際電腦展】誠摯邀請您參展",            body: "親愛的 {{vendor.contact}} 您好，\n\n2026 台北國際電腦展將於 6/4-6/7 於 TWTC 南港展覽館一館盛大舉辦，本屆主題為 AI × Cloud × 智慧製造。\n\n請回覆是否參加：\n{{rsvp.acceptLink}} / {{rsvp.declineLink}}", isSystem: false, updatedAt: "2026-03-05" },
    { id: "et-e-2", scope: "event", companyId: "c-1", eventId: "e-1", trigger: "rsvp_accepted",    name: "RSVP 接受 → 註冊連結",   subject: "【2026 台北國際電腦展】歡迎！請完成廠商註冊",       body: "感謝您同意參展！請點擊下方連結完成註冊：\n{{portal.registerLink}}", isSystem: false, updatedAt: "2026-03-05" },
    { id: "et-e-3", scope: "event", companyId: "c-1", eventId: "e-1", trigger: "form_approved",    name: "表單審核通過",         subject: "【台北國際電腦展】{{form.name}} 審核通過",           body: "{{vendor.contact}} 您好，您提交的「{{form.name}}」已審核通過。", isSystem: false, updatedAt: "2026-03-05" },
  ],

  // ───── SMTP 設定（租戶層）─────
  smtpSettings: [
    {
      companyId: "c-1",
      host: "smtp.gmail.com",
      port: 587,
      secure: "tls",
      username: "noreply@agcnet.com.tw",
      passwordMasked: "●●●●●●●●",
      fromName: "群揚資通展覽服務",
      fromEmail: "noreply@agcnet.com.tw",
      replyTo: "event@agcnet.com.tw",
      testedAt: "2026-04-01",
      testStatus: "success",
      testError: "",
    },
  ],

  // ───── 展前通知（Pre-event Notice）— PDF p8 +「佈展/進場指引」─────
  preEventNotices: [
    {
      id: "pe-1", eventId: "e-1",
      title: "展前 7 日重要通知",
      content: "各位參展夥伴：\n\n本屆台北國際電腦展將於 6/4（四）正式開展，請留意以下事項：\n\n1. 進場時段：6/3 08:00–18:00\n2. 進場證件請至服務台領取\n3. 請攜帶「撤場檢查單」正本\n\n祝展覽順利！",
      audience: "registered",
      channels: ["email", "portal"],
      scheduledAt: "2026-05-28 09:00",
      sentAt: null,
      status: "scheduled",
      attachments: ["進場地圖.pdf", "廠商識別證領取辦法.pdf"],
    },
    {
      id: "pe-2", eventId: "e-1",
      title: "開展日當日須知",
      content: "開展當日請於 08:00 前完成最後佈置...",
      audience: "confirmed",
      channels: ["email", "sms", "portal"],
      scheduledAt: "2026-06-03 18:00",
      sentAt: null,
      status: "draft",
      attachments: [],
    },
  ],
};
