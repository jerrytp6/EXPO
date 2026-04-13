// 種子資料 — 第一次啟動時寫入 localStorage
export const SEED = {
  users: [
    { id: "u-sa-1", email: "admin@exhibitos.com",       name: "平台管理員", role: "super-admin",   companyId: null,    title: "平台維運" },
    { id: "u-ca-1", email: "ming@agcnet.com.tw",         name: "陳小明",     role: "company-admin", companyId: "c-1",  title: "資訊長 CIO" },
    { id: "u-em-1", email: "yating@agcnet.com.tw",       name: "林雅婷",     role: "event-manager", companyId: "c-1",  title: "行銷部主任" },
    { id: "u-em-2", email: "wenhao@agcnet.com.tw",       name: "張文豪",     role: "event-manager", companyId: "c-1",  title: "業務經理" },
    { id: "u-mb-1", email: "meiling@agcnet.com.tw",      name: "王美玲",     role: "member",        companyId: "c-1",  title: "客服專員" },
    { id: "u-mb-2", email: "junhong@agcnet.com.tw",      name: "李俊宏",     role: "member",        companyId: "c-1",  title: "行銷專員" },
  ],
  companies: [
    { id: "c-1", name: "群揚資通股份有限公司", taxId: "12345678", industry: "資訊服務業", size: "100–500 人", address: "台北市內湖區瑞光路 168 號", phone: "02-2345-6789", plan: "Business", adminUserId: "u-ca-1", status: "active", createdAt: "2026-01-15" },
    { id: "c-2", name: "米兒設計有限公司", taxId: "55667788", industry: "設計服務業", size: "10–50 人", address: "台北市大安區忠孝東路四段 100 號", phone: "02-2700-1234", plan: "Starter", adminUserId: null, status: "pending", createdAt: "2026-04-07" },
    { id: "c-3", name: "天藍科技有限公司", taxId: "99887766", industry: "電子製造業", size: "50–100 人", address: "新竹市東區光復路二段 101 號", phone: "03-5712-3456", plan: "Business", adminUserId: null, status: "pending", createdAt: "2026-04-06" },
  ],
  events: [
    { id: "e-1", companyId: "c-1", name: "2026 台北國際電腦展", type: "實體展覽", startDate: "2026-06-04", endDate: "2026-06-07", location: "TWTC 南港展覽館一館", description: "亞洲最具規模之 ICT 應用展，匯集 AI、雲端、5G、智慧製造等領域。", managerId: "u-em-1", status: "preparing", createdAt: "2026-02-10" },
    { id: "e-2", companyId: "c-1", name: "AI x Cloud Summit 2026", type: "論壇", startDate: "2026-05-12", endDate: "2026-05-12", location: "台北萬豪酒店", description: "聚焦企業 AI 與雲端轉型的高階論壇。", managerId: "u-em-1", status: "inviting", createdAt: "2026-03-01" },
    { id: "e-3", companyId: "c-1", name: "智慧製造週", type: "實體展覽", startDate: "2026-07-22", endDate: "2026-07-24", location: "高雄展覽館", description: "聚焦工業 4.0 與智慧工廠應用。", managerId: "u-em-2", status: "planning", createdAt: "2026-03-20" },
  ],
  // 廠商擴充展位資料
  vendors: [
    { id: "v-1", eventId: "e-1", company: "台灣積體電路製造", taxId: "22099131", contact: "李建國", email: "jianguo.li@tsmc.com", phone: "03-5636688", status: "registered", invitedAt: "2026-03-15", clickedAt: "2026-03-16", registeredAt: "2026-03-18", boothNumber: "A-12", boothSize: "9x6m", boothType: "premium", profile: "全球領先的晶圓代工服務供應商，以世界級的技術製造服務客戶。", products: ["3nm 製程", "CoWoS 封裝", "車用晶片"], decoratorId: "d-1", confirmStatus: "confirmed", confirmedAt: "2026-04-01", confirmedBy: "林雅婷", confirmNote: "" },
    { id: "v-2", eventId: "e-1", company: "聯發科技",         taxId: "24566673", contact: "陳家豪", email: "jiahao.chen@mtk.com", phone: "03-5670766", status: "registered", invitedAt: "2026-03-15", clickedAt: "2026-03-15", registeredAt: "2026-03-17", boothNumber: "A-13", boothSize: "6x6m", boothType: "island",  profile: "全球無晶圓廠半導體公司，提供智慧手機、智慧家庭與物聯網解決方案。", products: ["天璣 9400", "Wi-Fi 7 晶片"], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "" },
    { id: "v-3", eventId: "e-1", company: "華碩電腦",         taxId: "23638777", contact: "王思婷", email: "siting.wang@asus.com", phone: "02-28943447", status: "clicked",     invitedAt: "2026-03-15", clickedAt: "2026-03-20", registeredAt: null, boothNumber: "", boothSize: "", boothType: "standard", profile: "", products: [], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "" },
    { id: "v-4", eventId: "e-1", company: "宏碁電腦",         taxId: "73724707", contact: "蔡明哲", email: "ming.tsai@acer.com",   phone: "02-26963131", status: "invited",    invitedAt: "2026-03-15", clickedAt: null, registeredAt: null, boothNumber: "", boothSize: "", boothType: "standard", profile: "", products: [], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "" },
    { id: "v-5", eventId: "e-1", company: "微星科技",         taxId: "23864797", contact: "張文君", email: "wenjun@msi.com",       phone: "02-32340099", status: "declined",   invitedAt: "2026-03-15", clickedAt: "2026-03-16", registeredAt: null, boothNumber: "", boothSize: "", boothType: "standard", profile: "", products: [], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "" },
    { id: "v-6", eventId: "e-2", company: "趨勢科技",         taxId: "23064247", contact: "周慧玲", email: "huiling@trend.com",    phone: "02-23789666", status: "registered", invitedAt: "2026-03-25", clickedAt: "2026-03-25", registeredAt: "2026-03-26", boothNumber: "B-05", boothSize: "3x3m", boothType: "standard", profile: "全球資安解決方案領導品牌。", products: ["Cloud One"], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "" },
    { id: "v-7", eventId: "e-2", company: "緯創資通",         taxId: "70798568", contact: "黃志明", email: "ming@wistron.com",     phone: "02-66128000", status: "invited",    invitedAt: "2026-03-25", clickedAt: null, registeredAt: null, boothNumber: "", boothSize: "", boothType: "standard", profile: "", products: [], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "" },
  ],
  invitations: [
    { token: "tkn-acer-2026", eventId: "e-1", vendorId: "v-4", expiresAt: "2026-05-01" },
    { token: "tkn-wistron-2026", eventId: "e-2", vendorId: "v-7", expiresAt: "2026-05-01" },
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
      status: "designing", // draft / designing / review / approved / building / completed
      budget: 1800000,
      deadline: "2026-05-15",
      createdAt: "2026-03-25",
    },
  ],

  // 設計稿（裝潢上傳，廠商審核）
  designs: [
    {
      id: "ds-1",
      projectId: "dp-1",
      version: "v1.0",
      title: "初版整體配置圖",
      description: "以未來感金屬質感為主軸，中央設置 3D 投影展示區。",
      uploadedAt: "2026-03-28",
      status: "approved", // pending / approved / rejected / revising
      feedback: "整體方向很棒，請維持這個風格。",
    },
    {
      id: "ds-2",
      projectId: "dp-1",
      version: "v2.0",
      title: "細部材質與燈光配置",
      description: "增加 LED 矩陣與層次燈光，材質改用霧面金屬與玻璃。",
      uploadedAt: "2026-04-05",
      status: "pending",
      feedback: "",
    },
  ],

  // 廠商與裝潢公司的訊息
  messages: [
    { id: "m-1", projectId: "dp-1", sender: "vendor",    senderName: "李建國", content: "您好，請問初版設計圖大概什麼時候可以看到？", at: Date.now() - 3 * 86400 * 1000 },
    { id: "m-2", projectId: "dp-1", sender: "decorator", senderName: "蔡建築", content: "您好！本週五前會交付初稿，謝謝。", at: Date.now() - 3 * 86400 * 1000 + 30 * 60 * 1000 },
    { id: "m-3", projectId: "dp-1", sender: "decorator", senderName: "蔡建築", content: "v2.0 已上傳，請參考細部材質與燈光配置。", at: Date.now() - 2 * 3600 * 1000 },
  ],

  // ───── 權限矩陣 ─────
  // 每個 companyId 有一份角色權限表
  // key: `${companyId}::${role}` → { [permissionKey]: boolean }
  permissions: {
    "c-1::company-admin": {
      "members.view": true, "members.invite": true, "members.edit": true, "members.remove": true, "members.permissions": true,
      "events.view": true,  "events.create": true,  "events.edit": true,  "events.delete": true,  "events.assign": true,
      "vendors.view": true, "vendors.import": true, "vendors.invite": true, "vendors.monitor": true,
      "decoration.view": true, "decoration.manage": true,
      "analytics.view": true, "analytics.export": true,
      "settings.company": true, "settings.billing": true,
    },
    "c-1::event-manager": {
      "members.view": true, "members.invite": false, "members.edit": false, "members.remove": false, "members.permissions": false,
      "events.view": true,  "events.create": false,  "events.edit": true,  "events.delete": false,  "events.assign": false,
      "vendors.view": true, "vendors.import": true, "vendors.invite": true, "vendors.monitor": true,
      "decoration.view": true, "decoration.manage": false,
      "analytics.view": true, "analytics.export": false,
      "settings.company": false, "settings.billing": false,
    },
    "c-1::member": {
      "members.view": true, "members.invite": false, "members.edit": false, "members.remove": false, "members.permissions": false,
      "events.view": true,  "events.create": false,  "events.edit": false,  "events.delete": false,  "events.assign": false,
      "vendors.view": true, "vendors.import": false, "vendors.invite": false, "vendors.monitor": false,
      "decoration.view": true, "decoration.manage": false,
      "analytics.view": false, "analytics.export": false,
      "settings.company": false, "settings.billing": false,
    },
  },

  // 個別成員覆寫（優先度高於角色預設）
  // key: userId → { [permissionKey]: boolean | undefined }
  memberPermOverrides: {},

  // ───── 全域文件模板庫 ─────
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

  // ───── 活動勾選結果（eventId × templateId → 覆寫截止日 + 覆寫必填）─────
  // required: null=繼承模板預設, true/false=本活動覆寫
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

  // ───── 繳交紀錄（itemId 改指向 templateId）─────
  submissions: [
    { id: "sub-1", eventId: "e-1", vendorId: "v-1", itemId: "dt-1",  fileName: "tsmc-logo-4k.png",          fileSize: "2.4 MB", submittedAt: "2026-04-10", status: "approved",  reviewedAt: "2026-04-11", reviewedBy: "林雅婷", feedback: "" },
    { id: "sub-2", eventId: "e-1", vendorId: "v-1", itemId: "dt-2",  fileName: "tsmc-company-profile.pdf",  fileSize: "5.8 MB", submittedAt: "2026-04-10", status: "approved",  reviewedAt: "2026-04-11", reviewedBy: "林雅婷", feedback: "" },
    { id: "sub-3", eventId: "e-1", vendorId: "v-1", itemId: "dt-4",  fileName: "tsmc-booth-layout-v1.pdf",  fileSize: "3.2 MB", submittedAt: "2026-04-08", status: "rejected",  reviewedAt: "2026-04-09", reviewedBy: "林雅婷", feedback: "尺寸不符規範，請依照 9x6m 的島型攤位重新繪製。" },
    { id: "sub-4", eventId: "e-1", vendorId: "v-1", itemId: "dt-12", fileName: "tsmc-intro-zh-en.docx",     fileSize: "1.1 MB", submittedAt: "2026-04-12", status: "submitted", reviewedAt: null, reviewedBy: null, feedback: "" },
    { id: "sub-5", eventId: "e-1", vendorId: "v-2", itemId: "dt-1",  fileName: "mtk-logo.svg",              fileSize: "0.3 MB", submittedAt: "2026-04-11", status: "submitted", reviewedAt: null, reviewedBy: null, feedback: "" },
    { id: "sub-6", eventId: "e-1", vendorId: "v-2", itemId: "dt-2",  fileName: "mtk-profile-2026.pdf",      fileSize: "4.5 MB", submittedAt: "2026-04-11", status: "submitted", reviewedAt: null, reviewedBy: null, feedback: "" },
  ],

  // ───── 審核歷史 ─────
  submissionLogs: [
    { id: "sl-1", submissionId: "sub-1", action: "submitted", by: "李建國", at: "2026-04-10", note: "" },
    { id: "sl-2", submissionId: "sub-1", action: "approved",  by: "林雅婷", at: "2026-04-11", note: "" },
    { id: "sl-3", submissionId: "sub-3", action: "submitted", by: "李建國", at: "2026-04-08", note: "" },
    { id: "sl-4", submissionId: "sub-3", action: "rejected",  by: "林雅婷", at: "2026-04-09", note: "尺寸不符規範，請依照 9x6m 的島型攤位重新繪製。" },
  ],

  reminders: [],
};
