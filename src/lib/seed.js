// 種子資料 — 第一次啟動時寫入 localStorage
// v13: 擴充 3 個活動的完整生態 — 豐富 Demo 資料
//      - vendors 擴充至 30 筆，狀態多樣化
//      - e-2 / e-3 補齊 notices / forms / equipment / email / preEvent
//      - 裝潢商 3 家，跨活動專案
//      - formSubmissions / equipmentRequests 各階段樣本
export const SEED = {
  users: [
    { id: "u-pa-1", email: "portal@exhibitos.com",       name: "Portal 超管", role: "portal-admin", companyId: null,    title: "展會營運平台 · 業務管理" },
    { id: "u-sa-1", email: "admin@exhibitos.com",       name: "平台維運",    role: "super-admin",   companyId: null,    title: "EX 系統技術維運" },
    { id: "u-ca-1", email: "ming@agcnet.com.tw",         name: "陳小明",     role: "company-admin", companyId: "c-1",  title: "資訊長 CIO" },
    { id: "u-em-1", email: "yating@agcnet.com.tw",       name: "林雅婷",     role: "event-manager", companyId: "c-1",  title: "行銷部主任" },
    { id: "u-em-2", email: "wenhao@agcnet.com.tw",       name: "張文豪",     role: "event-manager", companyId: "c-1",  title: "業務經理" },
    { id: "u-em-3", email: "shuwen@agcnet.com.tw",       name: "許淑雯",     role: "event-manager", companyId: "c-1",  title: "活動企劃經理" },
    { id: "u-mb-1", email: "meiling@agcnet.com.tw",      name: "王美玲",     role: "member",        companyId: "c-1",  title: "客服專員" },
    { id: "u-mb-2", email: "junhong@agcnet.com.tw",      name: "李俊宏",     role: "member",        companyId: "c-1",  title: "行銷專員" },
    { id: "u-mb-3", email: "yaqing@agcnet.com.tw",       name: "周雅琴",     role: "member",        companyId: "c-1",  title: "企劃助理" },
  ],
  companies: [
    { id: "c-1", name: "群揚資通股份有限公司", taxId: "12345678", industry: "資訊服務業", size: "100–500 人", address: "台北市內湖區瑞光路 168 號", phone: "02-2345-6789", adminUserId: "u-ca-1", status: "active", createdAt: "2026-01-15" },
    { id: "c-2", name: "米兒設計有限公司", taxId: "55667788", industry: "設計服務業", size: "10–50 人", address: "台北市大安區忠孝東路四段 100 號", phone: "02-2700-1234", adminUserId: null, status: "pending", createdAt: "2026-04-07" },
    { id: "c-3", name: "天藍科技有限公司", taxId: "99887766", industry: "電子製造業", size: "50–100 人", address: "新竹市東區光復路二段 101 號", phone: "03-5712-3456", adminUserId: null, status: "pending", createdAt: "2026-04-06" },
  ],

  // 子系統訂閱（Portal 層）— 存在於此表即表示該租戶已開通該子系統
  // subsystemKey: csm / ex / punch / opportunity
  tenantSubsystems: [
    { companyId: "c-1", subsystemKey: "csm",         activatedAt: "2026-01-15", contractEnd: "2027-01-15" },
    { companyId: "c-1", subsystemKey: "ex",          activatedAt: "2026-01-15", contractEnd: "2027-01-15" },
    { companyId: "c-1", subsystemKey: "opportunity", activatedAt: "2026-02-10", contractEnd: "2027-02-10" },
    { companyId: "c-3", subsystemKey: "ex",          activatedAt: "2026-03-20", contractEnd: "2027-03-20" },
    { companyId: "c-3", subsystemKey: "punch",       activatedAt: "2026-03-25", contractEnd: "2027-03-25" },
  ],
  events: [
    {
      id: "e-1", companyId: "c-1", name: "2026 台北國際電腦展", type: "實體展覽",
      startDate: "2026-06-04", endDate: "2026-06-07", location: "TWTC 南港展覽館一館",
      description: "亞洲最具規模之 ICT 應用展，匯集 AI、雲端、5G、智慧製造等領域。",
      managerId: "u-em-1", status: "preparing", createdAt: "2026-02-10",
      boothSelfSelectionEnabled: true,
      boothTypes: [
        { id: "bt-1", name: "標準攤位", size: "3x3m (9㎡)", price: 54000, capacity: 80, description: "含隔板、日光燈、地毯、桌椅各 1" },
        { id: "bt-2", name: "島型攤位", size: "6x6m (36㎡)", price: 180000, capacity: 20, description: "四面開放，裝潢自理" },
        { id: "bt-3", name: "旗艦攤位", size: "9x6m (54㎡)", price: 320000, capacity: 8, description: "角落位，三面開放，含基礎水電" },
      ],
    },
    {
      id: "e-2", companyId: "c-1", name: "AI x Cloud Summit 2026", type: "論壇",
      startDate: "2026-05-12", endDate: "2026-05-12", location: "台北萬豪酒店",
      description: "聚焦企業 AI 與雲端轉型的高階論壇，含主題演講、panel discussion 與贊助商攤位。",
      managerId: "u-em-1", status: "recruiting", createdAt: "2026-03-01",
      boothSelfSelectionEnabled: false,
      boothTypes: [
        { id: "bt-4", name: "標準攤位", size: "2x2m (4㎡)", price: 25000, capacity: 30, description: "桌椅 + 電源" },
        { id: "bt-7", name: "白金贊助", size: "4x3m (12㎡)", price: 120000, capacity: 3, description: "主場區位 + Logo 露出 + 主題演講時段" },
      ],
    },
    {
      id: "e-3", companyId: "c-1", name: "智慧製造週", type: "實體展覽",
      startDate: "2026-07-22", endDate: "2026-07-24", location: "高雄展覽館",
      description: "聚焦工業 4.0 與智慧工廠應用，涵蓋自動化、機器人、IIoT、預測性維護。",
      managerId: "u-em-1", status: "recruiting", createdAt: "2026-03-20",
      boothSelfSelectionEnabled: true,
      boothTypes: [
        { id: "bt-5", name: "標準攤位", size: "3x3m (9㎡)", price: 48000, capacity: 50, description: "含基本裝潢" },
        { id: "bt-6", name: "空地攤位", size: "6x6m (36㎡)", price: 120000, capacity: 15, description: "僅租地坪，裝潢自理" },
        { id: "bt-8", name: "旗艦島型", size: "9x9m (81㎡)", price: 450000, capacity: 5, description: "主入口區，四面開放" },
      ],
    },
  ],

  // ───── Vendors（擴充至 27 筆）─────
  vendors: [
    // ══ e-1 台北國際電腦展（12 筆，原 5 + 新 7）══
    { id: "v-1",  eventId: "e-1", company: "台灣積體電路製造", taxId: "22099131", contact: "李建國", email: "jianguo.li@tsmc.com", phone: "03-5636688", status: "registered", invitedAt: "2026-03-15", clickedAt: "2026-03-16", registeredAt: "2026-03-18", boothNumber: "A-12", boothTypeId: "bt-3", profile: "全球領先的晶圓代工服務供應商，以世界級的技術製造服務客戶。", products: ["3nm 製程", "CoWoS 封裝", "車用晶片"], decoratorId: "d-1", confirmStatus: "confirmed", confirmedAt: "2026-04-01", confirmedBy: "林雅婷", confirmNote: "", preferredBoothTypeId: null, depositStatus: "paid", balanceStatus: "paid", rsvpStatus: "accepted", rsvpRespondedAt: "2026-03-16", decorationMode: "self" },
    { id: "v-2",  eventId: "e-1", company: "聯發科技",         taxId: "24566673", contact: "陳家豪", email: "jiahao.chen@mtk.com", phone: "03-5670766", status: "registered", invitedAt: "2026-03-15", clickedAt: "2026-03-15", registeredAt: "2026-03-17", boothNumber: "A-13", boothTypeId: "bt-2", profile: "全球無晶圓廠半導體公司，提供智慧手機、智慧家庭與物聯網解決方案。", products: ["天璣 9400", "Wi-Fi 7 晶片"], decoratorId: null, confirmStatus: "confirmed", confirmedAt: "2026-04-02", confirmedBy: "林雅婷", confirmNote: "", preferredBoothTypeId: null, depositStatus: "paid", balanceStatus: "unpaid", rsvpStatus: "accepted", rsvpRespondedAt: "2026-03-15", decorationMode: "booth-vendor" },
    { id: "v-3",  eventId: "e-1", company: "華碩電腦",         taxId: "23638777", contact: "王思婷", email: "siting.wang@asus.com", phone: "02-28943447", status: "clicked",     invitedAt: "2026-03-15", clickedAt: "2026-03-20", registeredAt: null, boothNumber: "", boothTypeId: null, profile: "", products: [], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: null, balanceStatus: null, rsvpStatus: "accepted", rsvpRespondedAt: "2026-03-20", decorationMode: null },
    { id: "v-4",  eventId: "e-1", company: "宏碁電腦",         taxId: "73724707", contact: "蔡明哲", email: "ming.tsai@acer.com",   phone: "02-26963131", status: "invited",    invitedAt: "2026-03-15", clickedAt: null, registeredAt: null, boothNumber: "", boothTypeId: null, profile: "", products: [], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: null, balanceStatus: null, rsvpStatus: "pending", rsvpRespondedAt: null, decorationMode: null },
    { id: "v-5",  eventId: "e-1", company: "微星科技",         taxId: "23864797", contact: "張文君", email: "wenjun@msi.com",       phone: "02-32340099", status: "declined",   invitedAt: "2026-03-15", clickedAt: "2026-03-16", registeredAt: null, boothNumber: "", boothTypeId: null, profile: "", products: [], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: null, balanceStatus: null, rsvpStatus: "declined", rsvpRespondedAt: "2026-03-16", decorationMode: null },
    { id: "v-10", eventId: "e-1", company: "技嘉科技",         taxId: "85171161", contact: "劉光宇", email: "guangyu@gigabyte.com", phone: "02-89124000", status: "registered", invitedAt: "2026-03-16", clickedAt: "2026-03-17", registeredAt: "2026-03-19", boothNumber: "B-05", boothTypeId: "bt-2", profile: "主機板、顯示卡與伺服器的領導品牌。", products: ["AORUS 主機板", "AI 伺服器"], decoratorId: "d-2", confirmStatus: "confirmed", confirmedAt: "2026-04-03", confirmedBy: "林雅婷", confirmNote: "", preferredBoothTypeId: null, depositStatus: "paid", balanceStatus: "paid", rsvpStatus: "accepted", rsvpRespondedAt: "2026-03-17", decorationMode: "self" },
    { id: "v-11", eventId: "e-1", company: "威剛科技",         taxId: "70725830", contact: "黃德偉", email: "dewei@adata.com",      phone: "02-87528800", status: "registered", invitedAt: "2026-03-16", clickedAt: "2026-03-18", registeredAt: "2026-03-20", boothNumber: "C-08", boothTypeId: "bt-1", profile: "全球領先的記憶體與儲存解決方案供應商。", products: ["XPG 電競", "SSD 企業級"], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: "paid", balanceStatus: "unpaid", rsvpStatus: "accepted", rsvpRespondedAt: "2026-03-18", decorationMode: "booth-vendor" },
    { id: "v-12", eventId: "e-1", company: "威聯通科技 QNAP",   taxId: "96973797", contact: "蘇文彥", email: "wenyan@qnap.com",      phone: "02-26410150", status: "registered", invitedAt: "2026-03-16", clickedAt: "2026-03-19", registeredAt: "2026-03-22", boothNumber: "C-09", boothTypeId: "bt-1", profile: "NAS 儲存解決方案專家，涵蓋企業與家庭。", products: ["TVS-h Series", "QuTS hero"], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: "paid", balanceStatus: "unpaid", rsvpStatus: "accepted", rsvpRespondedAt: "2026-03-19", decorationMode: "booth-vendor" },
    { id: "v-13", eventId: "e-1", company: "友訊科技 D-Link",   taxId: "84149961", contact: "郭思妤", email: "siyu@dlink.com",        phone: "02-66000123", status: "clicked",     invitedAt: "2026-03-17", clickedAt: "2026-03-21", registeredAt: null, boothNumber: "", boothTypeId: null, profile: "", products: [], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: null, balanceStatus: null, rsvpStatus: "accepted", rsvpRespondedAt: "2026-03-21", decorationMode: null },
    { id: "v-14", eventId: "e-1", company: "群暉科技 Synology", taxId: "27905082", contact: "吳啟明", email: "qiming@synology.com",   phone: "02-29550828", status: "invited",    invitedAt: "2026-03-17", clickedAt: null, registeredAt: null, boothNumber: "", boothTypeId: null, profile: "", products: [], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: null, balanceStatus: null, rsvpStatus: "pending", rsvpRespondedAt: null, decorationMode: null },
    { id: "v-15", eventId: "e-1", company: "智易科技",         taxId: "27865210", contact: "林志賢", email: "zhixian@arcadyan.com",  phone: "03-6565000", status: "registered", invitedAt: "2026-03-18", clickedAt: "2026-03-19", registeredAt: "2026-03-24", boothNumber: "D-03", boothTypeId: "bt-1", profile: "寬頻通訊設備 ODM 專家。", products: ["5G CPE", "Wi-Fi 7 Gateway"], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: "unpaid", balanceStatus: "unpaid", rsvpStatus: "accepted", rsvpRespondedAt: "2026-03-19", decorationMode: "booth-vendor" },
    { id: "v-16", eventId: "e-1", company: "麗臺科技",         taxId: "04363908", contact: "羅婉婷", email: "wanting@leadtek.com",   phone: "02-82267088", status: "declined",    invitedAt: "2026-03-18", clickedAt: "2026-03-19", registeredAt: null, boothNumber: "", boothTypeId: null, profile: "", products: [], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: null, balanceStatus: null, rsvpStatus: "declined", rsvpRespondedAt: "2026-03-19", decorationMode: null },

    // ══ e-2 AI Cloud Summit（8 筆，原 2 + 新 6）══
    { id: "v-6",  eventId: "e-2", company: "趨勢科技",         taxId: "23064247", contact: "周慧玲", email: "huiling@trend.com",    phone: "02-23789666", status: "registered", invitedAt: "2026-03-25", clickedAt: "2026-03-25", registeredAt: "2026-03-26", boothNumber: "B-05", boothTypeId: "bt-4", profile: "全球資安解決方案領導品牌。", products: ["Cloud One"], decoratorId: null, confirmStatus: "confirmed", confirmedAt: "2026-04-01", confirmedBy: "林雅婷", confirmNote: "", preferredBoothTypeId: null, depositStatus: "paid", balanceStatus: "paid", rsvpStatus: "accepted", rsvpRespondedAt: "2026-03-25", decorationMode: "booth-vendor" },
    { id: "v-7",  eventId: "e-2", company: "緯創資通",         taxId: "70798568", contact: "黃志明", email: "ming@wistron.com",     phone: "02-66128000", status: "invited",    invitedAt: "2026-03-25", clickedAt: null, registeredAt: null, boothNumber: "", boothTypeId: null, profile: "", products: [], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: null, balanceStatus: null, rsvpStatus: "pending", rsvpRespondedAt: null, decorationMode: null },
    { id: "v-20", eventId: "e-2", company: "思科系統 Cisco",    taxId: "82884401", contact: "林俊彥", email: "chunyen@cisco.com",    phone: "02-87582233", status: "registered", invitedAt: "2026-03-26", clickedAt: "2026-03-26", registeredAt: "2026-03-27", boothNumber: "P-01", boothTypeId: "bt-7", profile: "網路設備與企業雲端解決方案全球領導者。", products: ["Catalyst", "Meraki"], decoratorId: null, confirmStatus: "confirmed", confirmedAt: "2026-04-05", confirmedBy: "林雅婷", confirmNote: "", preferredBoothTypeId: null, depositStatus: "paid", balanceStatus: "paid", rsvpStatus: "accepted", rsvpRespondedAt: "2026-03-26", decorationMode: "booth-vendor" },
    { id: "v-21", eventId: "e-2", company: "亞馬遜雲端 AWS",    taxId: "83023155", contact: "Nina Huang", email: "ninah@aws.com",     phone: "02-27873822", status: "registered", invitedAt: "2026-03-26", clickedAt: "2026-03-26", registeredAt: "2026-03-28", boothNumber: "P-02", boothTypeId: "bt-7", profile: "全球最大雲端服務商。", products: ["AWS Bedrock", "Amazon SageMaker"], decoratorId: "d-2", confirmStatus: "confirmed", confirmedAt: "2026-04-06", confirmedBy: "林雅婷", confirmNote: "", preferredBoothTypeId: null, depositStatus: "paid", balanceStatus: "unpaid", rsvpStatus: "accepted", rsvpRespondedAt: "2026-03-26", decorationMode: "self" },
    { id: "v-22", eventId: "e-2", company: "微軟 Microsoft",    taxId: "03742899", contact: "陳俊宏", email: "junhong@microsoft.com", phone: "02-37133000", status: "clicked",     invitedAt: "2026-03-27", clickedAt: "2026-03-28", registeredAt: null, boothNumber: "", boothTypeId: null, profile: "", products: [], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: null, balanceStatus: null, rsvpStatus: "accepted", rsvpRespondedAt: "2026-03-28", decorationMode: null },
    { id: "v-23", eventId: "e-2", company: "谷歌雲端 Google Cloud", taxId: "28776717", contact: "許芷晴", email: "zhiqing@google.com", phone: "02-87298000", status: "registered", invitedAt: "2026-03-27", clickedAt: "2026-03-28", registeredAt: "2026-03-30", boothNumber: "P-03", boothTypeId: "bt-4", profile: "Google 企業雲端服務。", products: ["Vertex AI", "Gemini"], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: "paid", balanceStatus: "paid", rsvpStatus: "accepted", rsvpRespondedAt: "2026-03-28", decorationMode: "booth-vendor" },
    { id: "v-24", eventId: "e-2", company: "國際商業機器 IBM",   taxId: "32866961", contact: "李正德", email: "zhengde@ibm.com",      phone: "02-27258000", status: "declined",    invitedAt: "2026-03-27", clickedAt: "2026-03-28", registeredAt: null, boothNumber: "", boothTypeId: null, profile: "", products: [], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: null, balanceStatus: null, rsvpStatus: "declined", rsvpRespondedAt: "2026-03-28", decorationMode: null },
    { id: "v-25", eventId: "e-2", company: "甲骨文 Oracle",      taxId: "16948421", contact: "賴宜芳", email: "yifang@oracle.com",    phone: "02-27201900", status: "invited",    invitedAt: "2026-03-28", clickedAt: null, registeredAt: null, boothNumber: "", boothTypeId: null, profile: "", products: [], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: null, balanceStatus: null, rsvpStatus: "pending", rsvpRespondedAt: null, decorationMode: null },

    // ══ e-3 智慧製造週（10 筆，全新）══
    { id: "v-30", eventId: "e-3", company: "台達電子",           taxId: "04398800", contact: "陳建志", email: "jianzhi@delta.com",    phone: "03-5726666", status: "registered", invitedAt: "2026-04-01", clickedAt: "2026-04-01", registeredAt: "2026-04-03", boothNumber: "I-01", boothTypeId: "bt-8", profile: "全球電源管理與散熱解決方案領導品牌，提供工業自動化產品。", products: ["工業機器人", "機器視覺"], decoratorId: "d-3", confirmStatus: "confirmed", confirmedAt: "2026-04-10", confirmedBy: "張文豪", confirmNote: "", preferredBoothTypeId: null, depositStatus: "paid", balanceStatus: "unpaid", rsvpStatus: "accepted", rsvpRespondedAt: "2026-04-01", decorationMode: "self" },
    { id: "v-31", eventId: "e-3", company: "上銀科技",           taxId: "86706057", contact: "王美玲", email: "meiling@hiwin.com",    phone: "04-23594510", status: "registered", invitedAt: "2026-04-01", clickedAt: "2026-04-02", registeredAt: "2026-04-05", boothNumber: "A-10", boothTypeId: "bt-6", profile: "全球傳動控制產業龍頭，線性滑軌、滾珠螺桿、機器人產品。", products: ["六軸機器人", "線性滑軌"], decoratorId: null, confirmStatus: "confirmed", confirmedAt: "2026-04-12", confirmedBy: "張文豪", confirmNote: "", preferredBoothTypeId: null, depositStatus: "paid", balanceStatus: "paid", rsvpStatus: "accepted", rsvpRespondedAt: "2026-04-02", decorationMode: "self" },
    { id: "v-32", eventId: "e-3", company: "研華科技",           taxId: "86832062", contact: "張雅婷", email: "yating@advantech.com", phone: "02-27925333", status: "registered", invitedAt: "2026-04-02", clickedAt: "2026-04-02", registeredAt: "2026-04-04", boothNumber: "A-11", boothTypeId: "bt-5", profile: "工業電腦與物聯網解決方案領導廠商。", products: ["工業 PC", "IIoT 閘道器"], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: "paid", balanceStatus: "paid", rsvpStatus: "accepted", rsvpRespondedAt: "2026-04-02", decorationMode: null },
    { id: "v-33", eventId: "e-3", company: "凌華科技",           taxId: "22270803", contact: "黃俊傑", email: "junjie@adlink.com",    phone: "02-82265877", status: "registered", invitedAt: "2026-04-02", clickedAt: "2026-04-03", registeredAt: "2026-04-06", boothNumber: "B-05", boothTypeId: "bt-5", profile: "邊緣運算與工業物聯網平台。", products: ["邊緣 AI 平台", "機器視覺"], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: "paid", balanceStatus: "unpaid", rsvpStatus: "accepted", rsvpRespondedAt: "2026-04-03", decorationMode: "booth-vendor" },
    { id: "v-34", eventId: "e-3", company: "新漢智能",           taxId: "84133310", contact: "林俊杰", email: "junjie@nexcom.com",    phone: "02-85117288", status: "clicked",     invitedAt: "2026-04-03", clickedAt: "2026-04-05", registeredAt: null, boothNumber: "", boothTypeId: null, profile: "", products: [], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: null, balanceStatus: null, rsvpStatus: "accepted", rsvpRespondedAt: "2026-04-05", decorationMode: null },
    { id: "v-35", eventId: "e-3", company: "瑞軒科技",           taxId: "23084321", contact: "吳文華", email: "wenhua@amtran.com",    phone: "02-82277818", status: "invited",    invitedAt: "2026-04-04", clickedAt: null, registeredAt: null, boothNumber: "", boothTypeId: null, profile: "", products: [], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: null, balanceStatus: null, rsvpStatus: "pending", rsvpRespondedAt: null, decorationMode: null },
    { id: "v-36", eventId: "e-3", company: "精聯電子",           taxId: "84148987", contact: "趙志偉", email: "zhiwei@ltd.com",       phone: "02-82276008", status: "registered", invitedAt: "2026-04-04", clickedAt: "2026-04-04", registeredAt: "2026-04-07", boothNumber: "C-02", boothTypeId: "bt-5", profile: "條碼讀取器與手持終端產品。", products: ["條碼掃描器", "手持 POS"], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: "paid", balanceStatus: "paid", rsvpStatus: "accepted", rsvpRespondedAt: "2026-04-04", decorationMode: "booth-vendor" },
    { id: "v-37", eventId: "e-3", company: "艾訊科技",           taxId: "89328432", contact: "蘇婉如", email: "wanru@axiomtek.com",   phone: "02-82262345", status: "registered", invitedAt: "2026-04-05", clickedAt: "2026-04-05", registeredAt: "2026-04-08", boothNumber: "C-03", boothTypeId: "bt-5", profile: "工業自動化與網路設備。", products: ["Fanless PC", "DIN-rail PC"], decoratorId: "d-3", confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: "paid", balanceStatus: "unpaid", rsvpStatus: "accepted", rsvpRespondedAt: "2026-04-05", decorationMode: "self" },
    { id: "v-38", eventId: "e-3", company: "英業達 Inventec",    taxId: "22099124", contact: "廖明達", email: "mingda@inventec.com",  phone: "02-28811000", status: "declined",    invitedAt: "2026-04-06", clickedAt: "2026-04-07", registeredAt: null, boothNumber: "", boothTypeId: null, profile: "", products: [], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: null, balanceStatus: null, rsvpStatus: "declined", rsvpRespondedAt: "2026-04-07", decorationMode: null },
    { id: "v-39", eventId: "e-3", company: "和碩聯合 Pegatron",   taxId: "97170473", contact: "邱德華", email: "dehua@pegatron.com",   phone: "02-81437000", status: "invited",    invitedAt: "2026-04-07", clickedAt: null, registeredAt: null, boothNumber: "", boothTypeId: null, profile: "", products: [], decoratorId: null, confirmStatus: null, confirmedAt: null, confirmedBy: null, confirmNote: "", preferredBoothTypeId: null, depositStatus: null, balanceStatus: null, rsvpStatus: "pending", rsvpRespondedAt: null, decorationMode: null },
  ],

  invitations: [
    { token: "tkn-tsmc-2026",     eventId: "e-1", vendorId: "v-1",  expiresAt: "2026-05-01" },
    { token: "tkn-mtk-2026",      eventId: "e-1", vendorId: "v-2",  expiresAt: "2026-05-01" },
    { token: "tkn-asus-2026",     eventId: "e-1", vendorId: "v-3",  expiresAt: "2026-05-01" },
    { token: "tkn-acer-2026",     eventId: "e-1", vendorId: "v-4",  expiresAt: "2026-05-01" },
    { token: "tkn-msi-2026",      eventId: "e-1", vendorId: "v-5",  expiresAt: "2026-05-01" },
    { token: "tkn-gigabyte-2026", eventId: "e-1", vendorId: "v-10", expiresAt: "2026-05-01" },
    { token: "tkn-adata-2026",    eventId: "e-1", vendorId: "v-11", expiresAt: "2026-05-01" },
    { token: "tkn-qnap-2026",     eventId: "e-1", vendorId: "v-12", expiresAt: "2026-05-01" },
    { token: "tkn-dlink-2026",    eventId: "e-1", vendorId: "v-13", expiresAt: "2026-05-01" },
    { token: "tkn-synology-2026", eventId: "e-1", vendorId: "v-14", expiresAt: "2026-05-01" },
    { token: "tkn-trend-2026",    eventId: "e-2", vendorId: "v-6",  expiresAt: "2026-05-01" },
    { token: "tkn-wistron-2026",  eventId: "e-2", vendorId: "v-7",  expiresAt: "2026-05-01" },
    { token: "tkn-cisco-2026",    eventId: "e-2", vendorId: "v-20", expiresAt: "2026-05-01" },
    { token: "tkn-aws-2026",      eventId: "e-2", vendorId: "v-21", expiresAt: "2026-05-01" },
    { token: "tkn-msft-2026",     eventId: "e-2", vendorId: "v-22", expiresAt: "2026-05-01" },
    { token: "tkn-oracle-2026",   eventId: "e-2", vendorId: "v-25", expiresAt: "2026-05-01" },
    { token: "tkn-delta-2026",    eventId: "e-3", vendorId: "v-30", expiresAt: "2026-06-20" },
    { token: "tkn-hiwin-2026",    eventId: "e-3", vendorId: "v-31", expiresAt: "2026-06-20" },
    { token: "tkn-adv-2026",      eventId: "e-3", vendorId: "v-32", expiresAt: "2026-06-20" },
    { token: "tkn-adlink-2026",   eventId: "e-3", vendorId: "v-33", expiresAt: "2026-06-20" },
    { token: "tkn-nexcom-2026",   eventId: "e-3", vendorId: "v-34", expiresAt: "2026-06-20" },
    { token: "tkn-pegatron-2026", eventId: "e-3", vendorId: "v-39", expiresAt: "2026-06-20" },
  ],

  rsvpResponses: [
    { id: "rsvp-1",  token: "tkn-tsmc-2026",     eventId: "e-1", vendorId: "v-1",  response: "accepted", reason: "", respondedAt: "2026-03-16" },
    { id: "rsvp-2",  token: "tkn-mtk-2026",      eventId: "e-1", vendorId: "v-2",  response: "accepted", reason: "", respondedAt: "2026-03-15" },
    { id: "rsvp-3",  token: "tkn-asus-2026",     eventId: "e-1", vendorId: "v-3",  response: "accepted", reason: "", respondedAt: "2026-03-20" },
    { id: "rsvp-4",  token: "tkn-msi-2026",      eventId: "e-1", vendorId: "v-5",  response: "declined", reason: "今年度展覽計畫調整，恕難出席。", respondedAt: "2026-03-16" },
    { id: "rsvp-5",  token: "tkn-gigabyte-2026", eventId: "e-1", vendorId: "v-10", response: "accepted", reason: "", respondedAt: "2026-03-17" },
    { id: "rsvp-6",  token: "tkn-adata-2026",    eventId: "e-1", vendorId: "v-11", response: "accepted", reason: "", respondedAt: "2026-03-18" },
    { id: "rsvp-7",  token: "tkn-qnap-2026",     eventId: "e-1", vendorId: "v-12", response: "accepted", reason: "", respondedAt: "2026-03-19" },
    { id: "rsvp-8",  token: "tkn-dlink-2026",    eventId: "e-1", vendorId: "v-13", response: "accepted", reason: "", respondedAt: "2026-03-21" },
    { id: "rsvp-9",  token: "tkn-trend-2026",    eventId: "e-2", vendorId: "v-6",  response: "accepted", reason: "", respondedAt: "2026-03-25" },
    { id: "rsvp-10", token: "tkn-cisco-2026",    eventId: "e-2", vendorId: "v-20", response: "accepted", reason: "", respondedAt: "2026-03-26" },
    { id: "rsvp-11", token: "tkn-aws-2026",      eventId: "e-2", vendorId: "v-21", response: "accepted", reason: "", respondedAt: "2026-03-26" },
    { id: "rsvp-12", token: "tkn-msft-2026",     eventId: "e-2", vendorId: "v-22", response: "accepted", reason: "", respondedAt: "2026-03-28" },
    { id: "rsvp-13", token: "tkn-ibm-2026",      eventId: "e-2", vendorId: "v-24", response: "declined", reason: "已有其他 AI 相關活動檔期衝突。", respondedAt: "2026-03-28" },
    { id: "rsvp-14", token: "tkn-delta-2026",    eventId: "e-3", vendorId: "v-30", response: "accepted", reason: "", respondedAt: "2026-04-01" },
    { id: "rsvp-15", token: "tkn-hiwin-2026",    eventId: "e-3", vendorId: "v-31", response: "accepted", reason: "", respondedAt: "2026-04-02" },
    { id: "rsvp-16", token: "tkn-adv-2026",      eventId: "e-3", vendorId: "v-32", response: "accepted", reason: "", respondedAt: "2026-04-02" },
    { id: "rsvp-17", token: "tkn-adlink-2026",   eventId: "e-3", vendorId: "v-33", response: "accepted", reason: "", respondedAt: "2026-04-03" },
    { id: "rsvp-18", token: "tkn-nexcom-2026",   eventId: "e-3", vendorId: "v-34", response: "accepted", reason: "", respondedAt: "2026-04-05" },
    { id: "rsvp-19", token: "tkn-inventec-2026", eventId: "e-3", vendorId: "v-38", response: "declined", reason: "本年度製造業相關展會暫不參加。", respondedAt: "2026-04-07" },
  ],

  activities: [
    { id: "a-1",  eventId: "e-1", vendorId: "v-1",  action: "registered", at: Date.now() - 2 * 60 * 1000 },
    { id: "a-2",  eventId: "e-1", vendorId: "v-3",  action: "clicked",    at: Date.now() - 5 * 60 * 1000 },
    { id: "a-3",  eventId: "e-1", vendorId: "v-2",  action: "registered", at: Date.now() - 12 * 60 * 1000 },
    { id: "a-4",  eventId: "e-1", vendorId: "v-4",  action: "clicked",    at: Date.now() - 18 * 60 * 1000 },
    { id: "a-5",  eventId: "e-1", vendorId: "v-10", action: "registered", at: Date.now() - 30 * 60 * 1000 },
    { id: "a-6",  eventId: "e-1", vendorId: "v-11", action: "registered", at: Date.now() - 45 * 60 * 1000 },
    { id: "a-7",  eventId: "e-1", vendorId: "v-12", action: "registered", at: Date.now() - 90 * 60 * 1000 },
    { id: "a-8",  eventId: "e-1", vendorId: "v-13", action: "clicked",    at: Date.now() - 2 * 3600 * 1000 },
    { id: "a-9",  eventId: "e-2", vendorId: "v-20", action: "registered", at: Date.now() - 3 * 3600 * 1000 },
    { id: "a-10", eventId: "e-2", vendorId: "v-21", action: "registered", at: Date.now() - 4 * 3600 * 1000 },
    { id: "a-11", eventId: "e-3", vendorId: "v-30", action: "registered", at: Date.now() - 5 * 3600 * 1000 },
    { id: "a-12", eventId: "e-3", vendorId: "v-31", action: "registered", at: Date.now() - 6 * 3600 * 1000 },
    { id: "a-13", eventId: "e-3", vendorId: "v-37", action: "registered", at: Date.now() - 12 * 3600 * 1000 },
  ],

  // ───── 裝潢公司（3 家）─────
  decorators: [
    { id: "d-1", name: "築境空間設計",   taxId: "44556677", contact: "蔡建築", title: "資深設計師", email: "jian@zhuying-design.com",   phone: "02-2706-8899", address: "台北市信義區基隆路一段 200 號", specialties: ["科技展", "金融展", "島型攤位"],           status: "active", createdAt: "2026-03-20" },
    { id: "d-2", name: "設計工坊",       taxId: "55667700", contact: "周雅晴", title: "首席設計師", email: "yaqing@design-studio.com",  phone: "02-2393-1122", address: "台北市大安區敦化南路二段 50 號",  specialties: ["B2B 展覽", "主題館",  "燈光工程"],         status: "active", createdAt: "2026-03-10" },
    { id: "d-3", name: "創藝展場",       taxId: "66778800", contact: "張子豪", title: "設計總監",   email: "zihao@cy-exhibition.com",   phone: "07-585-6677",  address: "高雄市左營區博愛二路 123 號",    specialties: ["旗艦館", "大型特裝",  "互動科技"],         status: "active", createdAt: "2026-02-28" },
  ],

  decoratorInvitations: [
    { token: "dtkn-mtk-zhuying",   fromVendorId: "v-2",  eventId: "e-1", decoratorEmail: "design@taipei-decor.com", decoratorCompany: "台北會展裝潢有限公司", message: "您好，我們是聯發科技，將參加 2026 台北國際電腦展，誠摯邀請貴公司協助本次展位設計與裝潢。", status: "pending",  createdAt: "2026-04-01", expiresAt: "2026-05-01" },
    { token: "dtkn-delta-cy",      fromVendorId: "v-30", eventId: "e-3", decoratorEmail: "zihao@cy-exhibition.com", decoratorCompany: "創藝展場",         message: "您好，我們是台達電子，誠摯邀請貴公司為我們設計智慧製造週的旗艦島型攤位。",                 status: "accepted", createdAt: "2026-04-08", expiresAt: "2026-05-15" },
    { token: "dtkn-aws-ds",        fromVendorId: "v-21", eventId: "e-2", decoratorEmail: "yaqing@design-studio.com", decoratorCompany: "設計工坊",        message: "您好，我們是 AWS，邀請貴公司協助 AI Summit 白金贊助攤位設計。",                          status: "accepted", createdAt: "2026-03-30", expiresAt: "2026-04-30" },
  ],

  decorationProjects: [
    { id: "dp-1", vendorId: "v-1",  decoratorId: "d-1", eventId: "e-1", title: "TSMC 旗艦島型攤位設計",    status: "designing",  budget: 1800000, deadline: "2026-05-15", createdAt: "2026-03-25" },
    { id: "dp-2", vendorId: "v-10", decoratorId: "d-2", eventId: "e-1", title: "技嘉 AI 主題展位",         status: "approved",   budget:  850000, deadline: "2026-05-20", createdAt: "2026-03-28" },
    { id: "dp-3", vendorId: "v-21", decoratorId: "d-2", eventId: "e-2", title: "AWS 白金贊助展位",         status: "building",   budget:  420000, deadline: "2026-05-05", createdAt: "2026-04-01" },
    { id: "dp-4", vendorId: "v-30", decoratorId: "d-3", eventId: "e-3", title: "台達電子智慧製造旗艦館",   status: "review",     budget: 2200000, deadline: "2026-07-10", createdAt: "2026-04-09" },
    { id: "dp-5", vendorId: "v-37", decoratorId: "d-3", eventId: "e-3", title: "艾訊工業自動化展位",       status: "draft",      budget:  580000, deadline: "2026-07-05", createdAt: "2026-04-11" },
  ],

  designs: [
    { id: "ds-1", projectId: "dp-1", version: "v1.0", title: "初版整體配置圖",          description: "以未來感金屬質感為主軸，中央設置 3D 投影展示區。", uploadedAt: "2026-03-28", status: "approved", feedback: "整體方向很棒，請維持這個風格。" },
    { id: "ds-2", projectId: "dp-1", version: "v2.0", title: "細部材質與燈光配置",      description: "增加 LED 矩陣與層次燈光，材質改用霧面金屬與玻璃。", uploadedAt: "2026-04-05", status: "pending",  feedback: "" },
    { id: "ds-3", projectId: "dp-2", version: "v1.0", title: "AI 主題展位初稿",         description: "以科技藍為主色，融入 AI 視覺元素。", uploadedAt: "2026-04-01", status: "approved", feedback: "很棒，請依此施工。" },
    { id: "ds-4", projectId: "dp-3", version: "v1.0", title: "AWS 橙色品牌形象展位",    description: "依 AWS 品牌規範設計，強調雲端運算視覺。", uploadedAt: "2026-04-04", status: "approved", feedback: "" },
    { id: "ds-5", projectId: "dp-4", version: "v1.0", title: "台達旗艦初版配置",        description: "以工業 4.0 為主題，中央設置機器人展演區。", uploadedAt: "2026-04-14", status: "pending",  feedback: "" },
  ],

  messages: [
    { id: "m-1", projectId: "dp-1", sender: "vendor",    senderName: "李建國", content: "您好，請問初版設計圖大概什麼時候可以看到？",            at: Date.now() - 3 * 86400 * 1000 },
    { id: "m-2", projectId: "dp-1", sender: "decorator", senderName: "蔡建築", content: "您好！本週五前會交付初稿，謝謝。",                         at: Date.now() - 3 * 86400 * 1000 + 30 * 60 * 1000 },
    { id: "m-3", projectId: "dp-1", sender: "decorator", senderName: "蔡建築", content: "v2.0 已上傳，請參考細部材質與燈光配置。",                   at: Date.now() - 2 * 3600 * 1000 },
    { id: "m-4", projectId: "dp-2", sender: "vendor",    senderName: "劉光宇", content: "設計風格很滿意，請儘快進入施工階段。",                       at: Date.now() - 1 * 86400 * 1000 },
    { id: "m-5", projectId: "dp-3", sender: "decorator", senderName: "周雅晴", content: "已開始進行材料採購，預計下週開始搭建。",                     at: Date.now() - 2 * 86400 * 1000 },
    { id: "m-6", projectId: "dp-4", sender: "decorator", senderName: "張子豪", content: "旗艦館初稿已上傳，請客戶審核並提供修改建議。",               at: Date.now() - 6 * 3600 * 1000 },
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
  // ══════════  v12+ PDF 五大業務流程資料 ══════════
  // ═════════════════════════════════════════════════════════

  // ───── 文件須知（Notices）─────
  eventNotices: [
    // ══ e-1 台北國際電腦展（11 筆，沿用）══
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

    // ══ e-2 AI Summit 論壇專用（7 筆）══
    { id: "n-e2-1", eventId: "e-2", category: "會場資訊", title: "會場平面圖（台北萬豪）",    content: "主論壇廳 2F、攤位區 3F；入口、報到台、茶歇區位置。",                 attachmentName: "marriott-floor.pdf", requiresAck: true,  allowDecoratorView: true,  sortOrder: 1, publishedAt: "2026-04-05" },
    { id: "n-e2-2", eventId: "e-2", category: "議程",     title: "論壇議程與主題演講時段",    content: "Keynote 09:00–10:30；白金贊助商上台時段；圓桌論壇；頒獎時程。",           attachmentName: "agenda.pdf",         requiresAck: true,  allowDecoratorView: false, sortOrder: 2, publishedAt: "2026-04-05" },
    { id: "n-e2-3", eventId: "e-2", category: "進場",     title: "進場時段與安裝指引",       content: "前一日 5/11 15:00–20:00 進場佈置；當日 07:30 前須完成所有裝設。",        attachmentName: null,                 requiresAck: true,  allowDecoratorView: true,  sortOrder: 3, publishedAt: "2026-04-05" },
    { id: "n-e2-4", eventId: "e-2", category: "設備",     title: "網路與投影規範",           content: "每家贊助商提供 100M 獨立網路；投影解析度 1920×1080；HDMI 轉接自備。",    attachmentName: null,                 requiresAck: true,  allowDecoratorView: true,  sortOrder: 4, publishedAt: "2026-04-05" },
    { id: "n-e2-5", eventId: "e-2", category: "行銷",     title: "Logo 露出與媒體規範",      content: "Logo 規格、場內物料使用規範、社群貼文 hashtag 建議。",                  attachmentName: "brand-guide.pdf",    requiresAck: false, allowDecoratorView: false, sortOrder: 5, publishedAt: "2026-04-05" },
    { id: "n-e2-6", eventId: "e-2", category: "須知",     title: "講者住宿與接送安排",       content: "講者入住萬豪酒店；機場接送需於 5/5 前確認。",                           attachmentName: null,                 requiresAck: false, allowDecoratorView: false, sortOrder: 6, publishedAt: "2026-04-05" },
    { id: "n-e2-7", eventId: "e-2", category: "費用",     title: "贊助費與退費規則",         content: "贊助費用發票寄送；取消贊助之退費比例說明。",                            attachmentName: null,                 requiresAck: true,  allowDecoratorView: false, sortOrder: 7, publishedAt: "2026-04-05" },

    // ══ e-3 智慧製造週（12 筆，與 e-1 類似架構）══
    { id: "n-e3-1",  eventId: "e-3", category: "會場資訊", title: "高雄展覽館平面圖",         content: "展館分區：自動化館、機器人館、IIoT 館；入口、卸貨區、停車場。",           attachmentName: "kaohsiung-map.pdf",    requiresAck: true,  allowDecoratorView: true,  sortOrder: 1,  publishedAt: "2026-04-10" },
    { id: "n-e3-2",  eventId: "e-3", category: "進場",     title: "進撤場時段",               content: "進場：7/21 06:00–22:00；撤場：7/24 20:00 後；大型機械需前一日進場。",    attachmentName: null,                    requiresAck: true,  allowDecoratorView: true,  sortOrder: 2,  publishedAt: "2026-04-10" },
    { id: "n-e3-3",  eventId: "e-3", category: "費用",     title: "保證金規範",               content: "標準攤位 NT$30,000；旗艦島型 NT$80,000；撤場驗收後退回。",               attachmentName: null,                    requiresAck: true,  allowDecoratorView: false, sortOrder: 3,  publishedAt: "2026-04-10" },
    { id: "n-e3-4",  eventId: "e-3", category: "裝潢",     title: "工業展場裝潢特殊規範",     content: "機械展演需設隔離區；重型設備需地坪加固；粉塵防治規範。",                   attachmentName: "industrial-rules.pdf",  requiresAck: true,  allowDecoratorView: true,  sortOrder: 4,  publishedAt: "2026-04-10" },
    { id: "n-e3-5",  eventId: "e-3", category: "進場",     title: "大型機械搬運動線",         content: "卸貨區地坪承重說明；推高機調度規則；重物運送須預約。",                     attachmentName: "heavy-flow.pdf",        requiresAck: true,  allowDecoratorView: true,  sortOrder: 5,  publishedAt: "2026-04-10" },
    { id: "n-e3-6",  eventId: "e-3", category: "配備",     title: "標準攤位配備",             content: "隔板、桌椅、110V/220V 電源、基礎照明。", attachmentName: null,                    requiresAck: false, allowDecoratorView: true,  sortOrder: 6,  publishedAt: "2026-04-10" },
    { id: "n-e3-7",  eventId: "e-3", category: "設備",     title: "高耗電設備申請流程",       content: "三相電、壓縮空氣、冷卻水等特殊需求申請辦法。",                             attachmentName: "power-apply.pdf",       requiresAck: false, allowDecoratorView: true,  sortOrder: 7,  publishedAt: "2026-04-10" },
    { id: "n-e3-8",  eventId: "e-3", category: "議程",     title: "主題論壇與研討會時程",     content: "工業 4.0 論壇、機器人應用研討、B2B 媒合會時程。",                          attachmentName: null,                    requiresAck: false, allowDecoratorView: false, sortOrder: 8,  publishedAt: "2026-04-10" },
    { id: "n-e3-9",  eventId: "e-3", category: "須知",     title: "參展廠商須知",             content: "ESD 靜電防護、機械安全防護、噪音規範。",                                   attachmentName: null,                    requiresAck: true,  allowDecoratorView: false, sortOrder: 9,  publishedAt: "2026-04-10" },
    { id: "n-e3-10", eventId: "e-3", category: "展前",     title: "展前作業核對表",           content: "各項繳交期限、必辦事項。",                                                 attachmentName: "checklist-e3.pdf",      requiresAck: true,  allowDecoratorView: false, sortOrder: 10, publishedAt: "2026-04-10" },
    { id: "n-e3-11", eventId: "e-3", category: "申請",     title: "延長場地使用申請",         content: "超時使用規則與費用計算。",                                                 attachmentName: null,                    requiresAck: false, allowDecoratorView: true,  sortOrder: 11, publishedAt: "2026-04-10" },
    { id: "n-e3-12", eventId: "e-3", category: "會場資訊", title: "南台灣交通與住宿建議",     content: "高鐵左營站接駁車、建議住宿酒店列表。",                                     attachmentName: null,                    requiresAck: false, allowDecoratorView: false, sortOrder: 12, publishedAt: "2026-04-10" },
  ],

  noticeAcknowledgments: [
    // e-1
    { id: "ack-1",  eventId: "e-1", vendorId: "v-1",  noticeId: "n-1",  acknowledgedAt: "2026-04-05" },
    { id: "ack-2",  eventId: "e-1", vendorId: "v-1",  noticeId: "n-2",  acknowledgedAt: "2026-04-05" },
    { id: "ack-3",  eventId: "e-1", vendorId: "v-1",  noticeId: "n-3",  acknowledgedAt: "2026-04-05" },
    { id: "ack-4",  eventId: "e-1", vendorId: "v-1",  noticeId: "n-4",  acknowledgedAt: "2026-04-05" },
    { id: "ack-5",  eventId: "e-1", vendorId: "v-2",  noticeId: "n-1",  acknowledgedAt: "2026-04-08" },
    { id: "ack-6",  eventId: "e-1", vendorId: "v-2",  noticeId: "n-2",  acknowledgedAt: "2026-04-08" },
    { id: "ack-7",  eventId: "e-1", vendorId: "v-10", noticeId: "n-1",  acknowledgedAt: "2026-04-09" },
    { id: "ack-8",  eventId: "e-1", vendorId: "v-10", noticeId: "n-2",  acknowledgedAt: "2026-04-09" },
    { id: "ack-9",  eventId: "e-1", vendorId: "v-10", noticeId: "n-3",  acknowledgedAt: "2026-04-09" },
    { id: "ack-10", eventId: "e-1", vendorId: "v-11", noticeId: "n-1",  acknowledgedAt: "2026-04-10" },
    // e-2
    { id: "ack-20", eventId: "e-2", vendorId: "v-6",  noticeId: "n-e2-1", acknowledgedAt: "2026-04-08" },
    { id: "ack-21", eventId: "e-2", vendorId: "v-6",  noticeId: "n-e2-2", acknowledgedAt: "2026-04-08" },
    { id: "ack-22", eventId: "e-2", vendorId: "v-20", noticeId: "n-e2-1", acknowledgedAt: "2026-04-09" },
    { id: "ack-23", eventId: "e-2", vendorId: "v-20", noticeId: "n-e2-2", acknowledgedAt: "2026-04-09" },
    { id: "ack-24", eventId: "e-2", vendorId: "v-21", noticeId: "n-e2-1", acknowledgedAt: "2026-04-10" },
    // e-3
    { id: "ack-30", eventId: "e-3", vendorId: "v-30", noticeId: "n-e3-1", acknowledgedAt: "2026-04-12" },
    { id: "ack-31", eventId: "e-3", vendorId: "v-30", noticeId: "n-e3-2", acknowledgedAt: "2026-04-12" },
    { id: "ack-32", eventId: "e-3", vendorId: "v-31", noticeId: "n-e3-1", acknowledgedAt: "2026-04-13" },
    { id: "ack-33", eventId: "e-3", vendorId: "v-32", noticeId: "n-e3-1", acknowledgedAt: "2026-04-14" },
  ],

  // ───── 表單（eventForms）─────
  eventForms: [
    // ══ e-1（10 筆，沿用）══
    { id: "f-1",  eventId: "e-1", category: "切結書", name: "攤位廠商參展切結書",         templateFileName: "切結書-參展.pdf",    formats: ".pdf",         isRequired: true,  hasFee: false, skipOption: false, showWhen: null,                                         deadline: "2026-05-01", sortOrder: 1,  allowDecoratorUpload: false },
    { id: "f-2",  eventId: "e-1", category: "切結書", name: "特殊裝潢廠商施工切結書",     templateFileName: "切結書-裝潢.pdf",    formats: ".pdf",         isRequired: true,  hasFee: false, skipOption: false, showWhen: { field: "decorationMode", value: "self" }, deadline: "2026-05-01", sortOrder: 2,  allowDecoratorUpload: true  },
    { id: "f-3",  eventId: "e-1", category: "施工",   name: "施工前安全衛生承諾書",       templateFileName: "安全衛生承諾書.pdf", formats: ".pdf",         isRequired: true,  hasFee: false, skipOption: false, showWhen: { field: "decorationMode", value: "self" }, deadline: "2026-05-01", sortOrder: 3,  allowDecoratorUpload: true  },
    { id: "f-4",  eventId: "e-1", category: "施工",   name: "電力位置圖",                 templateFileName: "電力位置圖範本.pdf", formats: ".pdf,.dwg",    isRequired: true,  hasFee: false, skipOption: false, showWhen: { field: "decorationMode", value: "self" }, deadline: "2026-05-10", sortOrder: 4,  allowDecoratorUpload: true  },
    { id: "f-5",  eventId: "e-1", category: "撤場",   name: "撤場檢查單",                 templateFileName: "撤場檢查單.pdf",     formats: ".pdf",         isRequired: true,  hasFee: false, skipOption: false, showWhen: null,                                         deadline: "2026-06-07", sortOrder: 5,  allowDecoratorUpload: false },
    { id: "f-6",  eventId: "e-1", category: "行銷",   name: "公司名稱露出申請",           templateFileName: "公司名稱露出.pdf",   formats: ".pdf",         isRequired: true,  hasFee: false, skipOption: false, showWhen: null,                                         deadline: "2026-04-25", sortOrder: 6,  allowDecoratorUpload: false },
    { id: "f-7",  eventId: "e-1", category: "申請",   name: "延長場地使用申請表",         templateFileName: "延長場地.pdf",       formats: ".pdf",         isRequired: false, hasFee: true,  skipOption: true,  showWhen: null,                                         deadline: "2026-05-25", sortOrder: 7,  allowDecoratorUpload: false },
    { id: "f-8",  eventId: "e-1", category: "申請",   name: "追加配備申請表",             templateFileName: "追加配備.pdf",       formats: ".pdf",         isRequired: true,  hasFee: true,  skipOption: true,  showWhen: null,                                         deadline: "2026-05-15", sortOrder: 8,  allowDecoratorUpload: false },
    { id: "f-9",  eventId: "e-1", category: "配備",   name: "攤位配備申請表",             templateFileName: "攤位配備.pdf",       formats: ".pdf",         isRequired: true,  hasFee: false, skipOption: false, showWhen: null,                                         deadline: "2026-05-10", sortOrder: 9,  allowDecoratorUpload: false },
    { id: "f-10", eventId: "e-1", category: "費用",   name: "保證金支票",                 templateFileName: "保證金說明.pdf",     formats: ".pdf,.jpg,.png", isRequired: true, hasFee: true, skipOption: false, showWhen: null,                                         deadline: "2026-05-20", sortOrder: 10, allowDecoratorUpload: false },

    // ══ e-2 AI Summit（6 筆，論壇專用）══
    { id: "f-e2-1", eventId: "e-2", category: "切結書", name: "贊助商參與切結書",     templateFileName: "贊助切結書.pdf",     formats: ".pdf",     isRequired: true,  hasFee: false, skipOption: false, showWhen: null, deadline: "2026-04-25", sortOrder: 1, allowDecoratorUpload: false },
    { id: "f-e2-2", eventId: "e-2", category: "行銷",   name: "Logo 露出授權書",       templateFileName: "logo授權.pdf",       formats: ".pdf",     isRequired: true,  hasFee: false, skipOption: false, showWhen: null, deadline: "2026-04-25", sortOrder: 2, allowDecoratorUpload: false },
    { id: "f-e2-3", eventId: "e-2", category: "行銷",   name: "講者/代表人資料表",     templateFileName: "講者資料.pdf",       formats: ".pdf,.docx", isRequired: true, hasFee: false, skipOption: false, showWhen: null, deadline: "2026-04-28", sortOrder: 3, allowDecoratorUpload: false },
    { id: "f-e2-4", eventId: "e-2", category: "內容",   name: "演講簡報上傳",           templateFileName: "簡報規格.pdf",       formats: ".pdf,.pptx", isRequired: true, hasFee: false, skipOption: false, showWhen: null, deadline: "2026-05-05", sortOrder: 4, allowDecoratorUpload: false },
    { id: "f-e2-5", eventId: "e-2", category: "費用",   name: "贊助費付款證明",         templateFileName: "付款說明.pdf",       formats: ".pdf,.jpg", isRequired: true, hasFee: true,  skipOption: false, showWhen: null, deadline: "2026-05-01", sortOrder: 5, allowDecoratorUpload: false },
    { id: "f-e2-6", eventId: "e-2", category: "申請",   name: "追加時段申請（白金）",   templateFileName: "追加時段.pdf",       formats: ".pdf",     isRequired: false, hasFee: true,  skipOption: true,  showWhen: null, deadline: "2026-04-30", sortOrder: 6, allowDecoratorUpload: false },

    // ══ e-3 智慧製造週（10 筆，與 e-1 類似結構）══
    { id: "f-e3-1",  eventId: "e-3", category: "切結書", name: "參展廠商切結書",               templateFileName: "切結書-e3.pdf",       formats: ".pdf",      isRequired: true,  hasFee: false, skipOption: false, showWhen: null,                                         deadline: "2026-06-30", sortOrder: 1,  allowDecoratorUpload: false },
    { id: "f-e3-2",  eventId: "e-3", category: "切結書", name: "自行裝潢施工切結書",           templateFileName: "施工切結-e3.pdf",     formats: ".pdf",      isRequired: true,  hasFee: false, skipOption: false, showWhen: { field: "decorationMode", value: "self" }, deadline: "2026-06-30", sortOrder: 2,  allowDecoratorUpload: true  },
    { id: "f-e3-3",  eventId: "e-3", category: "施工",   name: "工業展場安全衛生承諾書",       templateFileName: "安衛-e3.pdf",         formats: ".pdf",      isRequired: true,  hasFee: false, skipOption: false, showWhen: { field: "decorationMode", value: "self" }, deadline: "2026-06-30", sortOrder: 3,  allowDecoratorUpload: true  },
    { id: "f-e3-4",  eventId: "e-3", category: "施工",   name: "重型機械安裝位置圖",           templateFileName: "機械配置.pdf",        formats: ".pdf,.dwg", isRequired: true,  hasFee: false, skipOption: false, showWhen: { field: "decorationMode", value: "self" }, deadline: "2026-07-05", sortOrder: 4,  allowDecoratorUpload: true  },
    { id: "f-e3-5",  eventId: "e-3", category: "撤場",   name: "撤場檢查單",                   templateFileName: "撤場-e3.pdf",         formats: ".pdf",      isRequired: true,  hasFee: false, skipOption: false, showWhen: null,                                         deadline: "2026-07-24", sortOrder: 5,  allowDecoratorUpload: false },
    { id: "f-e3-6",  eventId: "e-3", category: "行銷",   name: "公司露出申請表",               templateFileName: "露出-e3.pdf",         formats: ".pdf",      isRequired: true,  hasFee: false, skipOption: false, showWhen: null,                                         deadline: "2026-06-15", sortOrder: 6,  allowDecoratorUpload: false },
    { id: "f-e3-7",  eventId: "e-3", category: "申請",   name: "高耗電設備申請表",             templateFileName: "高耗電.pdf",          formats: ".pdf",      isRequired: false, hasFee: true,  skipOption: true,  showWhen: null,                                         deadline: "2026-07-01", sortOrder: 7,  allowDecoratorUpload: false },
    { id: "f-e3-8",  eventId: "e-3", category: "申請",   name: "壓縮空氣/冷卻水申請",          templateFileName: "壓空-冷卻.pdf",       formats: ".pdf",      isRequired: false, hasFee: true,  skipOption: true,  showWhen: null,                                         deadline: "2026-07-01", sortOrder: 8,  allowDecoratorUpload: false },
    { id: "f-e3-9",  eventId: "e-3", category: "配備",   name: "標準攤位配備申請",             templateFileName: "配備-e3.pdf",         formats: ".pdf",      isRequired: true,  hasFee: false, skipOption: false, showWhen: null,                                         deadline: "2026-06-30", sortOrder: 9,  allowDecoratorUpload: false },
    { id: "f-e3-10", eventId: "e-3", category: "費用",   name: "保證金繳納證明",               templateFileName: "保證金-e3.pdf",       formats: ".pdf,.jpg", isRequired: true,  hasFee: true,  skipOption: false, showWhen: null,                                         deadline: "2026-07-10", sortOrder: 10, allowDecoratorUpload: false },
  ],

  formSubmissions: [
    // e-1
    { id: "fs-1",  eventId: "e-1", vendorId: "v-1",  formId: "f-1",  fileName: "tsmc-切結書-簽署.pdf",       fileSize: "0.8 MB", submittedAt: "2026-04-05", status: "approved",           fee: null,    paymentProofFileName: null,            reviewedAt: "2026-04-06", reviewedBy: "林雅婷", feedback: "",                         vendorConfirmed: true,  vendorConfirmedAt: "2026-04-06", needsReconfirm: false, uploadedByRole: "vendor"    },
    { id: "fs-2",  eventId: "e-1", vendorId: "v-1",  formId: "f-2",  fileName: "tsmc-裝潢切結書.pdf",         fileSize: "1.1 MB", submittedAt: "2026-04-08", status: "approved",           fee: null,    paymentProofFileName: null,            reviewedAt: "2026-04-09", reviewedBy: "林雅婷", feedback: "",                         vendorConfirmed: true,  vendorConfirmedAt: "2026-04-09", needsReconfirm: false, uploadedByRole: "decorator" },
    { id: "fs-3",  eventId: "e-1", vendorId: "v-1",  formId: "f-8",  fileName: "tsmc-追加配備.pdf",           fileSize: "0.6 MB", submittedAt: "2026-04-10", status: "pending_fee_review", fee: 45000,   paymentProofFileName: "匯款單-tsmc.jpg", reviewedAt: null,         reviewedBy: null,      feedback: "",                         vendorConfirmed: false, vendorConfirmedAt: null,         needsReconfirm: false, uploadedByRole: "vendor"    },
    { id: "fs-4",  eventId: "e-1", vendorId: "v-2",  formId: "f-1",  fileName: "mtk-切結書.pdf",             fileSize: "0.7 MB", submittedAt: "2026-04-11", status: "submitted",          fee: null,    paymentProofFileName: null,            reviewedAt: null,         reviewedBy: null,      feedback: "",                         vendorConfirmed: false, vendorConfirmedAt: null,         needsReconfirm: false, uploadedByRole: "vendor"    },
    { id: "fs-5",  eventId: "e-1", vendorId: "v-2",  formId: "f-9",  fileName: "mtk-配備申請.pdf",           fileSize: "0.5 MB", submittedAt: "2026-04-12", status: "submitted",          fee: null,    paymentProofFileName: null,            reviewedAt: null,         reviewedBy: null,      feedback: "",                         vendorConfirmed: false, vendorConfirmedAt: null,         needsReconfirm: false, uploadedByRole: "vendor"    },
    { id: "fs-6",  eventId: "e-1", vendorId: "v-10", formId: "f-1",  fileName: "gigabyte-切結書.pdf",        fileSize: "0.9 MB", submittedAt: "2026-04-11", status: "approved",           fee: null,    paymentProofFileName: null,            reviewedAt: "2026-04-12", reviewedBy: "林雅婷", feedback: "",                         vendorConfirmed: true,  vendorConfirmedAt: "2026-04-12", needsReconfirm: false, uploadedByRole: "vendor"    },
    { id: "fs-7",  eventId: "e-1", vendorId: "v-10", formId: "f-2",  fileName: "gigabyte-裝潢切結.pdf",      fileSize: "1.0 MB", submittedAt: "2026-04-11", status: "approved",           fee: null,    paymentProofFileName: null,            reviewedAt: "2026-04-13", reviewedBy: "林雅婷", feedback: "",                         vendorConfirmed: false, vendorConfirmedAt: null,         needsReconfirm: false, uploadedByRole: "decorator" },
    { id: "fs-8",  eventId: "e-1", vendorId: "v-10", formId: "f-10", fileName: "gigabyte-保證金支票.jpg",    fileSize: "0.4 MB", submittedAt: "2026-04-12", status: "pending_fee_review", fee: 30000,   paymentProofFileName: "匯款單-gigabyte.jpg", reviewedAt: null,         reviewedBy: null,      feedback: "",                      vendorConfirmed: false, vendorConfirmedAt: null,         needsReconfirm: false, uploadedByRole: "vendor"    },
    { id: "fs-9",  eventId: "e-1", vendorId: "v-11", formId: "f-1",  fileName: "adata-切結書.pdf",           fileSize: "0.6 MB", submittedAt: "2026-04-13", status: "rejected",           fee: null,    paymentProofFileName: null,            reviewedAt: "2026-04-14", reviewedBy: "林雅婷", feedback: "簽章位置錯誤，請依範本重新簽署。", vendorConfirmed: false, vendorConfirmedAt: null,         needsReconfirm: true,  uploadedByRole: "vendor"    },
    { id: "fs-10", eventId: "e-1", vendorId: "v-12", formId: "f-1",  fileName: "qnap-切結書.pdf",            fileSize: "0.7 MB", submittedAt: "2026-04-14", status: "submitted",          fee: null,    paymentProofFileName: null,            reviewedAt: null,         reviewedBy: null,      feedback: "",                         vendorConfirmed: false, vendorConfirmedAt: null,         needsReconfirm: false, uploadedByRole: "vendor"    },
    // e-2
    { id: "fs-20", eventId: "e-2", vendorId: "v-6",  formId: "f-e2-1", fileName: "trend-贊助切結書.pdf",     fileSize: "0.8 MB", submittedAt: "2026-04-01", status: "approved",           fee: null,    paymentProofFileName: null,            reviewedAt: "2026-04-02", reviewedBy: "林雅婷", feedback: "",                         vendorConfirmed: true,  vendorConfirmedAt: "2026-04-02", needsReconfirm: false, uploadedByRole: "vendor" },
    { id: "fs-21", eventId: "e-2", vendorId: "v-6",  formId: "f-e2-2", fileName: "trend-logo.pdf",          fileSize: "0.3 MB", submittedAt: "2026-04-02", status: "approved",           fee: null,    paymentProofFileName: null,            reviewedAt: "2026-04-03", reviewedBy: "林雅婷", feedback: "",                         vendorConfirmed: true,  vendorConfirmedAt: "2026-04-03", needsReconfirm: false, uploadedByRole: "vendor" },
    { id: "fs-22", eventId: "e-2", vendorId: "v-20", formId: "f-e2-1", fileName: "cisco-贊助切結書.pdf",     fileSize: "0.9 MB", submittedAt: "2026-04-03", status: "approved",           fee: null,    paymentProofFileName: null,            reviewedAt: "2026-04-04", reviewedBy: "林雅婷", feedback: "",                         vendorConfirmed: false, vendorConfirmedAt: null,         needsReconfirm: false, uploadedByRole: "vendor" },
    { id: "fs-23", eventId: "e-2", vendorId: "v-20", formId: "f-e2-5", fileName: "cisco-付款證明.jpg",        fileSize: "0.5 MB", submittedAt: "2026-04-05", status: "pending_fee_review", fee: 120000,  paymentProofFileName: "匯款單-cisco.jpg", reviewedAt: null,        reviewedBy: null,      feedback: "",                         vendorConfirmed: false, vendorConfirmedAt: null,         needsReconfirm: false, uploadedByRole: "vendor" },
    { id: "fs-24", eventId: "e-2", vendorId: "v-21", formId: "f-e2-1", fileName: "aws-切結書.pdf",           fileSize: "0.8 MB", submittedAt: "2026-04-04", status: "submitted",          fee: null,    paymentProofFileName: null,            reviewedAt: null,         reviewedBy: null,      feedback: "",                         vendorConfirmed: false, vendorConfirmedAt: null,         needsReconfirm: false, uploadedByRole: "vendor" },
    { id: "fs-25", eventId: "e-2", vendorId: "v-21", formId: "f-e2-4", fileName: "aws-簡報-v1.pdf",          fileSize: "12 MB",  submittedAt: "2026-04-10", status: "rejected",           fee: null,    paymentProofFileName: null,            reviewedAt: "2026-04-11", reviewedBy: "林雅婷", feedback: "簡報含有競品 Logo，請修正後重新上傳。", vendorConfirmed: false, vendorConfirmedAt: null,  needsReconfirm: true,  uploadedByRole: "vendor" },
    // e-3
    { id: "fs-30", eventId: "e-3", vendorId: "v-30", formId: "f-e3-1", fileName: "delta-切結書.pdf",         fileSize: "0.9 MB", submittedAt: "2026-04-13", status: "approved",           fee: null,    paymentProofFileName: null,            reviewedAt: "2026-04-14", reviewedBy: "張文豪", feedback: "",                         vendorConfirmed: true,  vendorConfirmedAt: "2026-04-15", needsReconfirm: false, uploadedByRole: "vendor" },
    { id: "fs-31", eventId: "e-3", vendorId: "v-30", formId: "f-e3-2", fileName: "delta-施工切結.pdf",        fileSize: "1.1 MB", submittedAt: "2026-04-14", status: "approved",           fee: null,    paymentProofFileName: null,            reviewedAt: "2026-04-15", reviewedBy: "張文豪", feedback: "",                         vendorConfirmed: true,  vendorConfirmedAt: "2026-04-15", needsReconfirm: false, uploadedByRole: "decorator" },
    { id: "fs-32", eventId: "e-3", vendorId: "v-30", formId: "f-e3-7", fileName: "delta-高耗電申請.pdf",      fileSize: "0.7 MB", submittedAt: "2026-04-16", status: "pending_fee_review", fee: 85000,   paymentProofFileName: "匯款單-delta.jpg", reviewedAt: null,        reviewedBy: null,      feedback: "",                      vendorConfirmed: false, vendorConfirmedAt: null,         needsReconfirm: false, uploadedByRole: "vendor" },
    { id: "fs-33", eventId: "e-3", vendorId: "v-31", formId: "f-e3-1", fileName: "hiwin-切結書.pdf",          fileSize: "0.8 MB", submittedAt: "2026-04-15", status: "approved",           fee: null,    paymentProofFileName: null,            reviewedAt: "2026-04-16", reviewedBy: "張文豪", feedback: "",                         vendorConfirmed: false, vendorConfirmedAt: null,         needsReconfirm: false, uploadedByRole: "vendor" },
    { id: "fs-34", eventId: "e-3", vendorId: "v-31", formId: "f-e3-2", fileName: "hiwin-施工切結.pdf",        fileSize: "1.2 MB", submittedAt: "2026-04-17", status: "submitted",          fee: null,    paymentProofFileName: null,            reviewedAt: null,         reviewedBy: null,      feedback: "",                         vendorConfirmed: false, vendorConfirmedAt: null,         needsReconfirm: false, uploadedByRole: "vendor" },
    { id: "fs-35", eventId: "e-3", vendorId: "v-32", formId: "f-e3-1", fileName: "adv-切結書.pdf",            fileSize: "0.8 MB", submittedAt: "2026-04-18", status: "submitted",          fee: null,    paymentProofFileName: null,            reviewedAt: null,         reviewedBy: null,      feedback: "",                         vendorConfirmed: false, vendorConfirmedAt: null,         needsReconfirm: false, uploadedByRole: "vendor" },
  ],

  // ───── 設備目錄（eventEquipmentCatalog）─────
  eventEquipmentCatalog: [
    // ══ e-1（14 筆，沿用）══
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

    // ══ e-2 AI Summit（8 筆，論壇尺度）══
    { id: "eq-e2-1", eventId: "e-2", category: "電力",     name: "110V 電源延長線",       spec: "6 插座 / 3M",        unit: "組", unitPrice: 300,   stock: 30 },
    { id: "eq-e2-2", eventId: "e-2", category: "網路",     name: "獨立有線網路 1Gbps",    spec: "RJ45 / 1Gbps",       unit: "條", unitPrice: 2500,  stock: 20 },
    { id: "eq-e2-3", eventId: "e-2", category: "展示器材", name: "55\" 觸控螢幕",         spec: "4K / 電容觸控",       unit: "台", unitPrice: 6500,  stock: 8  },
    { id: "eq-e2-4", eventId: "e-2", category: "展示器材", name: "投影機 10000 流明",     spec: "4K / HDR",           unit: "台", unitPrice: 12000, stock: 4  },
    { id: "eq-e2-5", eventId: "e-2", category: "桌椅家具", name: "洽談圓桌",              spec: "直徑 90cm",          unit: "張", unitPrice: 650,   stock: 20 },
    { id: "eq-e2-6", eventId: "e-2", category: "桌椅家具", name: "軟墊沙發椅",            spec: "單人沙發",            unit: "張", unitPrice: 800,   stock: 30 },
    { id: "eq-e2-7", eventId: "e-2", category: "燈光音響", name: "無線麥克風（領夾）",    spec: "UHF 領夾式",          unit: "支", unitPrice: 1500,  stock: 15 },
    { id: "eq-e2-8", eventId: "e-2", category: "其他",     name: "展攤 Logo 背板",        spec: "2.4×2m KT 板",        unit: "面", unitPrice: 4200,  stock: 10 },

    // ══ e-3 智慧製造週（14 筆，工業場景）══
    { id: "eq-e3-1",  eventId: "e-3", category: "電力",     name: "220V 三相 30A",          spec: "三相 / 30A",            unit: "組", unitPrice: 7500,  stock: 15 },
    { id: "eq-e3-2",  eventId: "e-3", category: "電力",     name: "220V 三相 60A",          spec: "三相 / 60A",            unit: "組", unitPrice: 15000, stock: 8  },
    { id: "eq-e3-3",  eventId: "e-3", category: "電力",     name: "110V 單相 15A",          spec: "110V / 15A",            unit: "組", unitPrice: 1200,  stock: 60 },
    { id: "eq-e3-4",  eventId: "e-3", category: "網路",     name: "工業級專線（1G）",       spec: "RJ45 / 1Gbps",          unit: "條", unitPrice: 3800,  stock: 30 },
    { id: "eq-e3-5",  eventId: "e-3", category: "公用設施", name: "壓縮空氣（7Bar）",       spec: "7Bar / 快接頭",          unit: "點", unitPrice: 8500,  stock: 10 },
    { id: "eq-e3-6",  eventId: "e-3", category: "公用設施", name: "冷卻水進出水管",         spec: "DN25 / 不鏽鋼",          unit: "組", unitPrice: 12000, stock: 6  },
    { id: "eq-e3-7",  eventId: "e-3", category: "展示器材", name: "65\" 工業顯示屏",        spec: "IP54 / 4K",             unit: "台", unitPrice: 9500,  stock: 15 },
    { id: "eq-e3-8",  eventId: "e-3", category: "展示器材", name: "大型 LED 牆 4×3m",       spec: "P3 室內",                unit: "組", unitPrice: 85000, stock: 3  },
    { id: "eq-e3-9",  eventId: "e-3", category: "桌椅家具", name: "工業風洽談桌",           spec: "180×90cm / 金屬框",      unit: "張", unitPrice: 750,   stock: 50 },
    { id: "eq-e3-10", eventId: "e-3", category: "桌椅家具", name: "洽談椅",                 spec: "金屬框 / 皮質",           unit: "張", unitPrice: 220,   stock: 150 },
    { id: "eq-e3-11", eventId: "e-3", category: "燈光音響", name: "HID 展示燈 400W",        spec: "色溫 5000K",              unit: "盞", unitPrice: 1800,  stock: 40 },
    { id: "eq-e3-12", eventId: "e-3", category: "安全",     name: "工業級 ESD 防靜電墊",   spec: "1×2m",                   unit: "片", unitPrice: 450,   stock: 60 },
    { id: "eq-e3-13", eventId: "e-3", category: "安全",     name: "工安警示帶",             spec: "紅白相間 / 100m",        unit: "捲", unitPrice: 300,   stock: 40 },
    { id: "eq-e3-14", eventId: "e-3", category: "其他",     name: "大型展示用地毯",         spec: "3×6m / 阻燃",            unit: "組", unitPrice: 1800,  stock: 25 },
  ],

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
      status: "approved", pdfGeneratedAt: "2026-04-10", signedFileName: "tsmc-設備申請-簽.pdf", paymentProofFileName: "tsmc-匯款單.jpg", paidAt: "2026-04-11",
      reviewedBy: "林雅婷", reviewedAt: "2026-04-12", feedback: "", createdAt: "2026-04-09", updatedAt: "2026-04-12",
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
      status: "submitted", pdfGeneratedAt: "2026-04-11", signedFileName: null, paymentProofFileName: null, paidAt: null,
      reviewedBy: null, reviewedAt: null, feedback: "", createdAt: "2026-04-11", updatedAt: "2026-04-11",
      vendorConfirmed: false, vendorConfirmedAt: null, needsReconfirm: false,
    },
    {
      id: "er-3", eventId: "e-1", vendorId: "v-10",
      items: [
        { catalogId: "eq-2",  qty: 1, spec: "" },
        { catalogId: "eq-7",  qty: 2, spec: "主展示牆" },
        { catalogId: "eq-13", qty: 1, spec: "" },
      ],
      totalAmount: 2500 + 17000 + 2800,
      status: "pdf_generated", pdfGeneratedAt: "2026-04-12", signedFileName: null, paymentProofFileName: null, paidAt: null,
      reviewedBy: null, reviewedAt: null, feedback: "", createdAt: "2026-04-12", updatedAt: "2026-04-12",
      vendorConfirmed: false, vendorConfirmedAt: null, needsReconfirm: false,
    },
    {
      id: "er-4", eventId: "e-2", vendorId: "v-6",
      items: [
        { catalogId: "eq-e2-3", qty: 1, spec: "" },
        { catalogId: "eq-e2-5", qty: 2, spec: "" },
        { catalogId: "eq-e2-6", qty: 6, spec: "" },
      ],
      totalAmount: 6500 + 1300 + 4800,
      status: "approved", pdfGeneratedAt: "2026-04-03", signedFileName: "trend-設備-簽.pdf", paymentProofFileName: "匯款-trend.jpg", paidAt: "2026-04-05",
      reviewedBy: "林雅婷", reviewedAt: "2026-04-06", feedback: "", createdAt: "2026-04-02", updatedAt: "2026-04-06",
      vendorConfirmed: true, vendorConfirmedAt: "2026-04-06", needsReconfirm: false,
    },
    {
      id: "er-5", eventId: "e-2", vendorId: "v-20",
      items: [
        { catalogId: "eq-e2-4", qty: 1, spec: "主舞台" },
        { catalogId: "eq-e2-7", qty: 3, spec: "" },
        { catalogId: "eq-e2-8", qty: 1, spec: "" },
      ],
      totalAmount: 12000 + 4500 + 4200,
      status: "signed_uploaded", pdfGeneratedAt: "2026-04-05", signedFileName: "cisco-設備-簽.pdf", paymentProofFileName: null, paidAt: null,
      reviewedBy: null, reviewedAt: null, feedback: "", createdAt: "2026-04-04", updatedAt: "2026-04-07",
      vendorConfirmed: false, vendorConfirmedAt: null, needsReconfirm: false,
    },
    {
      id: "er-6", eventId: "e-3", vendorId: "v-30",
      items: [
        { catalogId: "eq-e3-2",  qty: 2, spec: "主電源" },
        { catalogId: "eq-e3-5",  qty: 1, spec: "機器人氣動裝置" },
        { catalogId: "eq-e3-8",  qty: 1, spec: "主展示牆" },
        { catalogId: "eq-e3-11", qty: 6, spec: "" },
      ],
      totalAmount: 30000 + 8500 + 85000 + 10800,
      status: "approved", pdfGeneratedAt: "2026-04-15", signedFileName: "delta-設備-簽.pdf", paymentProofFileName: "匯款-delta.jpg", paidAt: "2026-04-17",
      reviewedBy: "張文豪", reviewedAt: "2026-04-18", feedback: "", createdAt: "2026-04-14", updatedAt: "2026-04-18",
      vendorConfirmed: false, vendorConfirmedAt: null, needsReconfirm: false,
    },
    {
      id: "er-7", eventId: "e-3", vendorId: "v-31",
      items: [
        { catalogId: "eq-e3-1",  qty: 1, spec: "" },
        { catalogId: "eq-e3-7",  qty: 2, spec: "" },
        { catalogId: "eq-e3-12", qty: 6, spec: "機器人工作區" },
      ],
      totalAmount: 7500 + 19000 + 2700,
      status: "submitted", pdfGeneratedAt: "2026-04-16", signedFileName: null, paymentProofFileName: null, paidAt: null,
      reviewedBy: null, reviewedAt: null, feedback: "", createdAt: "2026-04-16", updatedAt: "2026-04-16",
      vendorConfirmed: false, vendorConfirmedAt: null, needsReconfirm: false,
    },
    {
      id: "er-8", eventId: "e-3", vendorId: "v-32",
      items: [
        { catalogId: "eq-e3-3", qty: 2, spec: "" },
        { catalogId: "eq-e3-9", qty: 1, spec: "" },
        { catalogId: "eq-e3-10", qty: 3, spec: "" },
      ],
      totalAmount: 2400 + 750 + 660,
      status: "draft", pdfGeneratedAt: null, signedFileName: null, paymentProofFileName: null, paidAt: null,
      reviewedBy: null, reviewedAt: null, feedback: "", createdAt: "2026-04-18", updatedAt: "2026-04-18",
      vendorConfirmed: false, vendorConfirmedAt: null, needsReconfirm: false,
    },
  ],

  // ───── 郵件模板 ─────
  emailTemplates: [
    // 租戶預設（8 個系統）
    { id: "et-t-1", scope: "tenant", companyId: "c-1", eventId: null, trigger: "invitation",       name: "廠商邀約信",           subject: "【{{event.name}}】誠摯邀請您參展",                subject2: "", body: "親愛的 {{vendor.contact}} 您好，\n\n我們正在籌備 {{event.name}}（{{event.startDate}} ~ {{event.endDate}}，地點：{{event.location}}），誠摯邀請貴公司參展。\n\n請點擊下方連結回覆是否參加：\n{{rsvp.acceptLink}}（接受）\n{{rsvp.declineLink}}（婉拒）\n\n順頌商祺\n{{company.name}}", isSystem: true,  updatedAt: "2026-03-01" },
    { id: "et-t-2", scope: "tenant", companyId: "c-1", eventId: null, trigger: "rsvp_accepted",    name: "RSVP 接受 → 註冊連結", subject: "【{{event.name}}】歡迎！請完成廠商註冊",           body: "{{vendor.contact}} 您好，\n\n感謝您同意參展！請點擊下方連結完成廠商資料註冊，並進入參展系統：\n{{portal.registerLink}}\n\n如有問題請聯繫 {{event.manager.email}}", isSystem: true, updatedAt: "2026-03-01" },
    { id: "et-t-3", scope: "tenant", companyId: "c-1", eventId: null, trigger: "register_confirm", name: "註冊完成通知",         subject: "【{{event.name}}】註冊已完成",                     body: "{{vendor.contact}} 您好，\n\n貴公司已成功註冊為 {{event.name}} 參展廠商。\n接下來請依各項通知完成必要表單繳交。\n\n廠商入口：{{portal.loginLink}}", isSystem: true, updatedAt: "2026-03-01" },
    { id: "et-t-4", scope: "tenant", companyId: "c-1", eventId: null, trigger: "form_approved",    name: "表單審核通過",         subject: "【{{event.name}}】{{form.name}} 已審核通過",        body: "{{vendor.contact}} 您好，\n\n您提交的「{{form.name}}」已審核通過。", isSystem: true, updatedAt: "2026-03-01" },
    { id: "et-t-5", scope: "tenant", companyId: "c-1", eventId: null, trigger: "form_rejected",    name: "表單審核退回",         subject: "【{{event.name}}】{{form.name}} 需要修正",          body: "{{vendor.contact}} 您好，\n\n您提交的「{{form.name}}」需要修正，原因：\n{{form.feedback}}\n\n請登入重新繳交：{{portal.loginLink}}", isSystem: true, updatedAt: "2026-03-01" },
    { id: "et-t-6", scope: "tenant", companyId: "c-1", eventId: null, trigger: "reminder",         name: "繳交催繳提醒",         subject: "【{{event.name}}】尚有項目未繳交",                 body: "{{vendor.contact}} 您好，\n\n提醒您，以下項目尚未完成：\n{{pending.items}}\n\n繳交期限：{{form.deadline}}\n請盡速處理：{{portal.loginLink}}", isSystem: true, updatedAt: "2026-03-01" },
    { id: "et-t-7", scope: "tenant", companyId: "c-1", eventId: null, trigger: "pre_event_notice", name: "展前通知（佈展）",     subject: "【{{event.name}}】展前重要通知",                   body: "{{vendor.contact}} 您好，\n\n展覽開始日期：{{event.startDate}}\n\n{{preEvent.content}}\n\n詳細進場指引請登入查看。", isSystem: true, updatedAt: "2026-03-01" },
    { id: "et-t-8", scope: "tenant", companyId: "c-1", eventId: null, trigger: "fee_review",       name: "費用審核通知（活管）", subject: "【{{event.name}}】{{vendor.company}} 繳交費用待審",  body: "{{manager.name}} 您好，\n\n{{vendor.company}} 已提交 {{form.name}}（金額 NT$ {{form.fee}}），請審核匯款單並核可。\n\n管理後台：{{admin.reviewLink}}", isSystem: true, updatedAt: "2026-03-01" },

    // e-1 活動模板（3 個客製）
    { id: "et-e1-1", scope: "event", companyId: "c-1", eventId: "e-1", trigger: "invitation",    name: "廠商邀約信",           subject: "【2026 台北國際電腦展】誠摯邀請您參展",        body: "親愛的 {{vendor.contact}} 您好，\n\n2026 台北國際電腦展將於 6/4-6/7 於 TWTC 南港展覽館一館盛大舉辦，本屆主題為 AI × Cloud × 智慧製造。\n\n請回覆是否參加：\n{{rsvp.acceptLink}} / {{rsvp.declineLink}}", isSystem: false, updatedAt: "2026-03-05" },
    { id: "et-e1-2", scope: "event", companyId: "c-1", eventId: "e-1", trigger: "rsvp_accepted", name: "RSVP 接受 → 註冊連結", subject: "【2026 台北國際電腦展】歡迎！請完成廠商註冊",   body: "感謝您同意參展！請點擊下方連結完成註冊：\n{{portal.registerLink}}", isSystem: false, updatedAt: "2026-03-05" },
    { id: "et-e1-3", scope: "event", companyId: "c-1", eventId: "e-1", trigger: "form_approved", name: "表單審核通過",         subject: "【台北國際電腦展】{{form.name}} 審核通過",         body: "{{vendor.contact}} 您好，您提交的「{{form.name}}」已審核通過。", isSystem: false, updatedAt: "2026-03-05" },

    // e-2 活動模板（2 個客製）
    { id: "et-e2-1", scope: "event", companyId: "c-1", eventId: "e-2", trigger: "invitation",    name: "AI Summit 贊助邀請",    subject: "【AI x Cloud Summit 2026】贊助商邀約",                 body: "Dear {{vendor.contact}},\n\nAI x Cloud Summit 2026 將於 5/12 於台北萬豪酒店舉辦，誠摯邀請貴公司成為本屆白金贊助商。\n\n點此回覆：{{rsvp.acceptLink}} / {{rsvp.declineLink}}", isSystem: false, updatedAt: "2026-03-10" },
    { id: "et-e2-2", scope: "event", companyId: "c-1", eventId: "e-2", trigger: "fee_review",    name: "贊助費審核通知",        subject: "【AI Summit】{{vendor.company}} 贊助費待審",           body: "活動管理員您好，{{vendor.company}} 已上傳贊助費匯款單（NT$ {{form.fee}}），請審核。", isSystem: false, updatedAt: "2026-03-10" },

    // e-3 活動模板（2 個客製）
    { id: "et-e3-1", scope: "event", companyId: "c-1", eventId: "e-3", trigger: "invitation",       name: "智慧製造週邀請",    subject: "【智慧製造週】南台灣工業 4.0 盛會邀請",                body: "{{vendor.contact}} 您好，\n\n智慧製造週將於 7/22-7/24 於高雄展覽館舉辦，本屆聚焦工業 4.0 與智慧工廠應用。\n\n回覆邀約：{{rsvp.acceptLink}} / {{rsvp.declineLink}}", isSystem: false, updatedAt: "2026-03-20" },
    { id: "et-e3-2", scope: "event", companyId: "c-1", eventId: "e-3", trigger: "pre_event_notice", name: "工業展場進場須知", subject: "【智慧製造週】重型機械進場指引",                     body: "{{vendor.contact}} 您好，\n\n重型機械請於 7/21 前進場，地坪承重請參考附件，壓縮空氣等特殊申請請提早備齊。", isSystem: false, updatedAt: "2026-03-20" },
  ],

  // ───── SMTP 設定 ─────
  smtpSettings: [
    { companyId: "c-1", host: "smtp.gmail.com", port: 587, secure: "tls", username: "noreply@agcnet.com.tw", passwordMasked: "●●●●●●●●", fromName: "群揚資通展覽服務", fromEmail: "noreply@agcnet.com.tw", replyTo: "event@agcnet.com.tw", testedAt: "2026-04-01", testStatus: "success", testError: "" },
  ],

  // ───── 展前通知 ─────
  preEventNotices: [
    { id: "pe-1", eventId: "e-1", title: "展前 7 日重要通知",          content: "各位參展夥伴：\n\n本屆台北國際電腦展將於 6/4（四）正式開展，請留意以下事項：\n\n1. 進場時段：6/3 08:00–18:00\n2. 進場證件請至服務台領取\n3. 請攜帶「撤場檢查單」正本\n\n祝展覽順利！",                                               audience: "registered", channels: ["email", "portal"],         scheduledAt: "2026-05-28 09:00", sentAt: null,              status: "scheduled", attachments: ["進場地圖.pdf", "廠商識別證領取辦法.pdf"] },
    { id: "pe-2", eventId: "e-1", title: "開展日當日須知",              content: "開展當日請於 08:00 前完成最後佈置...",                                                                                                                                                                                                          audience: "confirmed",  channels: ["email", "sms", "portal"],  scheduledAt: "2026-06-03 18:00", sentAt: null,              status: "draft",     attachments: [] },
    { id: "pe-3", eventId: "e-2", title: "AI Summit 前日 checklist",    content: "講者與贊助商夥伴，請確認：\n\n1. 簡報檔案已上傳\n2. Logo 高解析檔已繳交\n3. 當日接送安排已回覆\n\n祝論壇順利！",                                                                                                                                   audience: "registered", channels: ["email", "portal"],         scheduledAt: "2026-05-11 10:00", sentAt: "2026-04-20 10:00", status: "sent",      attachments: ["當日流程.pdf"] },
    { id: "pe-4", eventId: "e-2", title: "當日進場指引",                content: "萬豪酒店 2F 主論壇廳 / 3F 贊助商攤位區；進場時段 07:00–08:30。",                                                                                                                                                                                 audience: "confirmed",  channels: ["email", "sms"],            scheduledAt: "2026-05-12 06:00", sentAt: null,              status: "scheduled", attachments: [] },
    { id: "pe-5", eventId: "e-3", title: "智慧製造週 — 重型機械進場",   content: "因應重型機械進場，請於 7/21 00:00 起完成大型設備進場作業；務必攜帶施工許可及安衛證明。",                                                                                                                                                         audience: "registered", channels: ["email", "portal"],         scheduledAt: "2026-07-15 10:00", sentAt: null,              status: "draft",     attachments: ["機械進場動線.pdf", "安衛要求.pdf"] },
    { id: "pe-6", eventId: "e-3", title: "高雄交通與住宿建議",          content: "建議搭乘高鐵至左營站後轉接駁車；配合住宿酒店列表於附件。",                                                                                                                                                                                        audience: "all",         channels: ["email"],                   scheduledAt: "2026-07-10 14:00", sentAt: null,              status: "scheduled", attachments: ["住宿列表.pdf"] },
  ],
};
