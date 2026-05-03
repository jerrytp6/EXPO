# EX API（後端）

Node.js + Express + Prisma + MySQL，對應 PPT「技術架構」頁的後端 / 資料庫層。

## 開發環境

### 1. 啟動 MySQL（Docker Compose，於專案根目錄）

```bash
docker compose up -d
```

- MySQL: `localhost:3306` / user `ex` / pass `ex` / db `ex`
- Adminer GUI: <http://localhost:8080>

### 2. 安裝依賴

```bash
cd server
npm install
```

### 3. 初始化 schema 與 seed

```bash
npm run prisma:migrate    # 第一次會跳問 migration 名稱，輸入 init
npm run seed              # 寫入 1 租戶 + 5 帳號
```

### 4. 啟動 API

```bash
npm run dev               # 對外 :7002
```

健康檢查：<http://localhost:7002/healthz>

## 登入測試

```bash
curl -X POST http://localhost:7002/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ming@agcnet.com.tw","password":"demo1234"}'
```

預期回傳 `{ token, user }`。

帶 token 取得自己資料：

```bash
curl http://localhost:7002/auth/me -H "Authorization: Bearer <token>"
```

## 帳號（預設密碼一律 `demo1234`）

| Email | 角色 | 租戶 |
|---|---|---|
| portal@exhibitos.com | portal-admin | （跨租戶） |
| admin@exhibitos.com | super-admin | （跨租戶） |
| ming@agcnet.com.tw | company-admin | 群揚資通 |
| yating@agcnet.com.tw | event-manager | 群揚資通 |
| meiling@agcnet.com.tw | member | 群揚資通 |

## 路線

- **A1**（目前）：骨架 + 登入 + JWT + 角色 + 租戶上下文
- A2：完整 schema（events / vendors / forms / equipment …）
- A3：~40 CRUD endpoints
- A4：前端 axios + 改寫 store
- B1：seed.js 全部資料移植
- B2：Prisma extension 自動 inject `tenantId`
- B3：multer 檔案上傳
- B4：業主 Portal SSO 接口（`/auth/sso`）
- C1：Nginx + PM2 + SSL（VM 上線時）
