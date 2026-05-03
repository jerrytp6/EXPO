# 部署指引（DEPLOYMENT）

C1 階段：客戶提供 VM 後依此文件上線。對應 PPT 技術架構頁的「Nginx + PM2 + SSL」三件套。

## 拓撲

```
                    ┌─────────────────┐
   外部使用者 ─────→ │ HTTPS :443       │
                    │ Nginx (反向代理) │
                    └─────┬───────┬───┘
                          │       │
              ┌───────────┘       └─────────┐
              │                             │
              ▼                             ▼
       ┌──────────────┐              ┌──────────────┐
       │ 靜態 SPA     │              │ Node API     │
       │ /var/www/ex  │              │ PM2 :7002    │
       │ (前端 dist)  │              │ /api/* 路由  │
       └──────────────┘              └──────┬───────┘
                                            │
                                            ▼
                                    ┌──────────────┐
                                    │  MySQL :3306 │
                                    │  (本機 or RDS)│
                                    └──────────────┘
```

## VM 規格建議

| 項目 | 最低 | 建議 |
|---|---|---|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| 磁碟 | 40 GB SSD | 100 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| Node | 20 LTS | 20 LTS |
| MySQL | 8.0 | 8.0 |

`uploads/` 視預期上傳量，每位廠商平均 10-20 個檔案 × 2-5MB → 每場展覽 30 廠商約 1.5-3GB。

## 上線步驟

### 0. 系統依賴

```bash
sudo apt update
sudo apt install -y nodejs npm mysql-server-8.0 nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

### 1. MySQL 設置

```bash
sudo mysql_secure_installation
sudo mysql <<'SQL'
CREATE DATABASE ex CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ex'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON ex.* TO 'ex'@'localhost';
FLUSH PRIVILEGES;
SQL
```

### 2. 部署程式碼

```bash
# 取得程式碼
sudo mkdir -p /opt/ex && sudo chown $USER:$USER /opt/ex
cd /opt/ex
git clone <repo-url> .

# 後端
cd server
npm ci --omit=dev
cp .env.example .env
# 編輯 .env：DATABASE_URL / JWT_SECRET / PORTAL_SSO_PUBLIC_KEY
npx prisma generate
npx prisma migrate deploy   # 套用 migration（不是 db push）
npm run seed                # 首次部署需要；之後升版不要再跑

# 前端
cd ..
npm ci
npm run build               # 產 dist/
```

### 3. PM2 啟動後端

建 `/opt/ex/server/ecosystem.config.cjs`：

```js
module.exports = {
  apps: [{
    name: "ex-api",
    script: "src/index.js",
    cwd: "/opt/ex/server",
    instances: 2,                  // cluster mode（依 CPU 調整）
    exec_mode: "cluster",
    env_production: {
      NODE_ENV: "production",
      PORT: 7002,
    },
    error_file: "/var/log/pm2/ex-api-err.log",
    out_file: "/var/log/pm2/ex-api-out.log",
    max_memory_restart: "500M",
  }],
};
```

```bash
cd /opt/ex/server
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup systemd       # 跟著系統開機
```

驗證：
```bash
curl http://localhost:7002/healthz
# {"status":"ok","db":"ok"}
```

### 4. Nginx 反向代理

`/etc/nginx/sites-available/ex.conf`：

```nginx
server {
    listen 80;
    server_name ex.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ex.example.com;

    # SSL（由 certbot 自動填）
    ssl_certificate     /etc/letsencrypt/live/ex.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ex.example.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 12m;        # 配合 multer 10MB 上限

    # 前端 SPA
    root /opt/ex/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 靜態快取
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API 代理（重寫 /api/* → 後端 / 對應）
    location /api/ {
        proxy_pass http://127.0.0.1:7002/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_read_timeout 60s;
    }

    # 上傳檔案下載（直接由 Nginx serve 不經 Node 較快）
    # 注意：MVP 階段 /files 沒做 auth，生產建議加 auth_request 或改走 /api/files 經 Node
    location /files/ {
        alias /opt/ex/server/uploads/;
        expires 1d;
        add_header Cache-Control "private, max-age=86400";
    }

    # 安全 headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
```

啟用：
```bash
sudo ln -s /etc/nginx/sites-available/ex.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL（Let's Encrypt）

```bash
sudo certbot --nginx -d ex.example.com
# 自動排程 renewal：sudo systemctl status certbot.timer
```

如果客戶提供自有憑證：
```bash
sudo cp client.crt /etc/ssl/ex/fullchain.pem
sudo cp client.key /etc/ssl/ex/privkey.pem
sudo chmod 600 /etc/ssl/ex/privkey.pem
# 修改 nginx ssl_certificate / ssl_certificate_key 路徑
```

### 6. 防火牆

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp     # SSH
sudo ufw enable
# 不要對外開 3306（MySQL）/ 7002（Node）— 只走 Nginx
```

## 環境變數清單

`server/.env`（生產）：

```ini
PORT=7002
DATABASE_URL="mysql://ex:STRONG_PASSWORD@localhost:3306/ex"
JWT_SECRET="<隨機 64 字元，e.g. openssl rand -base64 48>"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="https://ex.example.com"

# 業主 Portal SSO（生產必填）
PORTAL_SSO_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...PEM...\n-----END PUBLIC KEY-----"
PORTAL_SSO_ISSUER="https://portal.example.com"
```

⚠️ **JWT_SECRET 必須改**！dev 預設值（`dev-secret-do-not-use-in-production`）絕不能用在生產。

## 升版流程

```bash
cd /opt/ex
git pull

# 後端
cd server
npm ci --omit=dev
npx prisma generate
npx prisma migrate deploy   # 跑新 migration
pm2 reload ex-api

# 前端
cd ..
npm ci
npm run build
# Nginx 直接吃新的 dist/，不用 reload
```

## 備份策略

| 對象 | 頻率 | 命令 |
|---|---|---|
| MySQL | 每日 | `mysqldump -uex -p ex > /backup/ex_$(date +\%Y\%m\%d).sql` |
| uploads/ | 每日 | `rsync -av /opt/ex/server/uploads/ /backup/uploads/` |
| 設定 | 一次性 | `nginx.conf` / `ecosystem.config.cjs` / `.env` 入 secret manager |

排程：`crontab -e`：
```cron
0 3 * * * mysqldump -uex -pPASSWORD ex | gzip > /backup/ex_$(date +\%Y\%m\%d).sql.gz
0 3 * * * rsync -av /opt/ex/server/uploads/ /backup/uploads/
0 0 * * 0 find /backup -name "ex_*.sql.gz" -mtime +30 -delete
```

## 監控檢核

| 項目 | 命令 / 監控 |
|---|---|
| API 健康 | `curl https://ex.example.com/api/healthz` |
| PM2 狀態 | `pm2 status` |
| Nginx 日誌 | `/var/log/nginx/access.log` `/var/log/nginx/error.log` |
| MySQL 連線數 | `mysql -e "SHOW PROCESSLIST"` |
| 磁碟（uploads） | `df -h /opt/ex/server/uploads` |
| SSL 到期 | `certbot certificates` |

## Roll-back

```bash
cd /opt/ex
git log --oneline -10              # 找上版 commit
git checkout <previous-commit>

cd server
npm ci --omit=dev
# 若 schema 有變動，要手動 down migration（Prisma migrate 沒 down）
pm2 reload ex-api

cd ..
npm ci && npm run build
```

> 重大 schema 改動建議分兩段：先 deploy 雙寫版本，數據遷移完成後才下舊欄位。

## 業主 Portal SSO 整合

收到業主提供的：
1. **Portal 公鑰**（PEM 格式）→ 寫進 `PORTAL_SSO_PUBLIC_KEY` env
2. **Portal issuer URL** → 寫進 `PORTAL_SSO_ISSUER` env（可選）
3. **SSO 跳轉 URL** → 業主端配置成 `https://ex.example.com/sso?token={portal_jwt}`

驗證鏈路：

1. 使用者在業主 Portal 完成登入
2. Portal 為使用者簽 JWT（payload 含 `portalUserId / username / role / companyId / tenantId / subsystemUserId`）
3. Portal 跳轉 `https://ex.example.com/sso?token=<JWT>`
4. EX 前端 SsoReceiver 收到 token → POST `/api/auth/sso`
5. EX 後端 `jwt.verify(token, PORTAL_SSO_PUBLIC_KEY, { algorithms: ["RS256"] })`
6. 用 `external_id` 映射本地 tenant 與 user（自動 provisioning）
7. 簽 EX 內部 JWT → 前端存到 localStorage
8. 跳轉到對應角色 home

開通新租戶流程（PPT slide 4）：

1. Portal 建立租戶（給 `portal-tenant-id`）
2. Portal 開通 EX 子系統 → callback 通知 EX 端：`POST /api/tenants` body 帶 `externalId: "portal-tenant-id"`（**TODO：尚未實作 callback endpoint，目前手動建**）
3. Portal 為租戶建立 admin 使用者 → 第一次 SSO 登入會自動 provisioning EX user
