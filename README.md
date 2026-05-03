# Exhibition OS — 參展廠商管理系統 (EX)

群揚資通展會營運平台子系統 · 對齊 APCN x TSN 2025 PPT 架構

```
            ┌────────────────────────────────────────────┐
            │  Portal SSO（業主統一認證平台）              │
            │  Token: portalUserId · username · role ·    │
            │         companyId · tenantId ·              │
            │         subsystemUserId                     │
            └─────────────────┬──────────────────────────┘
                              │ POST /auth/sso
                              ▼
   ┌──────────────────────────────────────────────────────┐
   │  EX 參展廠商管理系統 (本 repo)                          │
   │  ┌──────────────┐  ┌──────────────────────────┐       │
   │  │ React + Vite │←→│ Node + Express + Prisma  │       │
   │  │ Tailwind     │  │ JWT · multer · zod       │       │
   │  │ HashRouter   │  │ Multi-tenant row-level   │       │
   │  └──────────────┘  └──────────┬───────────────┘       │
   │                                │                      │
   │                          ┌─────▼─────┐                │
   │                          │  MySQL 8  │                │
   │                          │  27 表    │                │
   │                          └───────────┘                │
   └──────────────────────────────────────────────────────┘
```

## 五大流程（對齊 PPT slides 7-15）

| # | 流程 | PPT slide | 後端 endpoint | 前端 page |
|---|---|---|---|---|
| 1 | 活動建立 + 廠商邀約 | 8 | POST /events / POST /vendors / POST /vendors/:id/invite | event/Import / Invite |
| 2 | 廠商註冊 + 登入 | 9 | POST /public/rsvp/:token + /vendors/:id/register | vendor/Rsvp / Invitation |
| 3 | 攤位配置（管理員 ↔ 廠商自選）| 10 | PATCH /events/:id/booth-self-selection<br>PATCH /vendors/:id/booth<br>PATCH /public/vendors/:id/booth-selection<br>POST /vendors/:id/booth-selection/{confirm,reject} | event/Booths / portal/VendorBooth |
| 4 | 文件須知 + 表單 | 11–12 | /notices /forms（含 showWhen 條件式） | event/Notices / Forms / portal/VendorForms |
| 5 | 設備申請 + 三態確認 | 13, 15 | /equipment/requests（7 階段狀態機）+ confirm/reconfirm | event/EquipmentCatalog / portal/VendorEquipment |

## 技術棧

| 層 | 技術 |
|---|---|
| 前端 | React 19 · Vite 5 · React Router 7 · Zustand 5 · Tailwind 3 |
| 後端 | Node.js 20 · Express 4 · Prisma 5 · zod · multer 2 · bcrypt · JWT |
| 資料庫 | MySQL 8 · 27 表 row-level multi-tenant（每張資源表帶 `tenant_id`）|
| 認證 | JWT (HS256, 7d) + 業主 Portal SSO 接口 (`POST /auth/sso`) |
| 部署 | dev: Docker Compose / prod: Nginx + PM2 + SSL（規劃中）|

## 目錄結構

```
exhibition-os/
├── README.md
├── docker-compose.yml         ← MySQL 8 + Adminer (dev)
├── vite.config.js             ← /api/* proxy → :7002
├── package.json               ← 前端
├── src/                       ← React frontend
│   ├── App.jsx
│   ├── lib/api.js             ← fetch wrapper + JWT 注入 + upload
│   ├── store/{auth,data,toast}.js
│   ├── components/
│   └── pages/
│       ├── Login / PortalLogin / SsoReceiver / PortalHome
│       ├── portal-admin/      ← 平台後台（租戶管理、子系統訂閱）
│       ├── admin/             ← super-admin（跨租戶）
│       ├── company/           ← 公司管理（成員、權限、SMTP、模板）
│       ├── event/             ← 活動管理者（13 個模組）
│       ├── portal/vendor*     ← 廠商後台
│       └── portal/decorator*  ← 裝潢廠商後台
└── server/                    ← Node backend
    ├── package.json
    ├── prisma/
    │   ├── schema.prisma      ← 27 表 schema
    │   ├── source-data.js     ← seed 來源資料
    │   └── seed.js            ← 一鍵 reseed (idempotent upsert)
    ├── scripts/b2-verify.mjs  ← multi-tenant 隔離測試
    └── src/
        ├── index.js
        ├── lib/{prisma,prisma-tenant,jwt,scope}.js
        ├── middleware/{auth,tenant,upload,error}.js
        └── routes/{auth,health,tenants,users,events,vendors,
                    notices,forms,equipment,decorators,settings,uploads}.js
```

## 開發環境設置

### 1. 啟動 MySQL（Docker）

```bash
docker compose up -d
```

容器：
- `ex-mysql` localhost:3306（user=ex / pass=ex / db=ex）
- `ex-adminer` localhost:8080（GUI）

### 2. 後端

```bash
cd server
npm install
npm run prisma:generate    # 產生 Prisma client
npx prisma db push         # 套用 schema
npm run seed               # 種子資料（27 collections）
npm run dev                # 啟動 :7002
```

驗證：
```bash
curl http://localhost:7002/healthz
# {"status":"ok","db":"ok"}
```

### 3. 前端

```bash
# 在專案根目錄
npm install
npm run dev                # vite :5173 → /api proxy → :7002
```

打開 http://localhost:5173/EXPO/

### 4. Demo 帳號（密碼一律 `demo1234`）

| Email | 角色 | 用途 |
|---|---|---|
| portal@exhibitos.com | portal-admin | Portal 平台管理（跨租戶）|
| admin@exhibitos.com | super-admin | EX 系統維運（跨租戶）|
| ming@agcnet.com.tw | company-admin | 群揚資通管理員 |
| yating@agcnet.com.tw | event-manager | 活動管理者（負責 e-1 / e-3）|
| wenhao@agcnet.com.tw | event-manager | 活動管理者（負責 e-2）|
| meiling@agcnet.com.tw | member | 一般成員 |

## 重要 npm scripts

### 前端（root）
| script | 用途 |
|---|---|
| `npm run dev` | vite dev server :5173 |
| `npm run build` | 產 production bundle |
| `npm run lint` | ESLint |
| `npm run deploy` | gh-pages 靜態部署 |

### 後端（server/）
| script | 用途 |
|---|---|
| `npm run dev` | node --watch :7002 |
| `npm run start` | production node |
| `npm run prisma:generate` | 產 Prisma client |
| `npm run prisma:migrate` | 創 migration |
| `npm run prisma:reset` | 砍掉重來 + 跑 seed |
| `npm run prisma:studio` | DB GUI |
| `npm run seed` | 跑 seed 不重設 DB |

## 安全模型

### 多租戶（Row-level）

每張資源表帶 `tenant_id`。`server/src/lib/prisma-tenant.js` 提供 Prisma extension，自動：
- read 操作（findFirst / findMany / count / aggregate / groupBy）→ where 加 `tenantId`
- create 操作（create / createMany）→ data 自動補 `tenantId`
- 跨租戶角色（portal-admin / super-admin）+ 未指定 tenantId → bypass

routes 用 `req.prisma`（中介自動掛載）即享受隔離保護。

### 認證

1. **EX 自帶登入**：`POST /auth/login` (email + password) → JWT (7d)
2. **業主 Portal SSO**：`POST /auth/sso` (Portal token)
   - 生產：env `PORTAL_SSO_PUBLIC_KEY` 設好 PEM → JWT RS256 驗章
   - dev：base64(JSON) 明文 token（demo 用）
   - 自動 provisioning：找不到 user 自動建（透過 external_id 映射）

### 檔案上傳

multer + local disk：`server/uploads/{tenantId}/{YYYY-MM}/{uuid}-{name}`

限制：≤ 10MB / 22 種副檔名白名單 / path traversal 防禦。

## 部署

詳見 [`DEPLOYMENT.md`](DEPLOYMENT.md)（VM 上線時的 Nginx + PM2 + SSL 設定）。

## 授權與商標

EventExpo Platform Architecture · 群揚資通內部專案
