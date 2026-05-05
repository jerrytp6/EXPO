# Exhibition OS · Demo 演示腳本

對應 PPT《參展廠商流程規劃》16 頁與五大業務流程。約 12-18 分鐘可走完一輪。

---

## 0. 預備動作（demo 前 5 分鐘）

```bash
# 開三個 terminal（或一個 tmux 三 pane）

# 1) 確認 docker 容器
cd "/mnt/c/Users/jerry/Downloads/展覽/exhibition-os"
sg docker -c "docker compose up -d"
# ex-mysql / ex-adminer / ex-mailhog 都 healthy

# 2) 後端
cd server && npm run dev
# 看到「[ex-api] listening on http://localhost:7002」+「[pdf] CJK font loaded」

# 3) 前端
cd ..
npm run dev
# 看到「Local: http://localhost:5173/EXPO/」
```

**Demo 用 5 個瀏覽器分頁開好**：

| Tab | URL | 用途 |
|---|---|---|
| ① | <http://localhost:5173/EXPO/> | 主系統（會切角色） |
| ② | <http://localhost:5173/EXPO/#/portal-login> | Portal SSO 登入頁 |
| ③ | <http://localhost:8025> | **Mailhog**（看寄出的信） |
| ④ | <http://localhost:8080> | Adminer（必要時看 DB） |
| ⑤ | （空）當「廠商視角」用，邀約信點開 |

> **小道具**：手邊放一份 PDF 範例檔（隨便一份履歷／簡報都行）+ 一張匯款單 JPG，等下會用到。

---

## 1. 開場 — 平台架構 (1 min)

**對白：**
> 「這是展會營運平台的 EX 子系統。整個架構對應 PPT slide 2 — 業主 Portal 統一認證，下面三個子系統：CSM 會議秘書、EX 參展廠商、工讀生打卡。我們今天 demo 的是 **EX**，對應 slide 5 的完整流程。」

**Tab ②** → 顯示 Portal 登入頁（綠色 logo + 展會營運平台）

```
✓ 視覺：左下角 Demo 帳號「Portal 超管 / 租戶管理員 / 活動管理員」
✓ 重點：右上角的 SSO Token 6 欄位，業主 Portal 簽 token → /sso?token=xxx → 自動換 EX JWT
```

---

## 2. Portal 平台層（PPT slide 2-4）— 2 min

### 2.1 portal-admin 登入

**Tab ②** → 點「Portal 超管」快速登入

**預期：**
- 跳到 Portal 首頁，顯示 4 個子系統卡片（CSM / EX / 工讀生 / 商機）
- 上方深色橫條：「Portal Admin · 僅平台管理員可見 → 進入 Portal 管理後台」
- 點該按鈕

### 2.2 Portal 管理後台

**畫面：** 黑底側邊選單（區隔 EX 一般介面）

#### a) 儀表板
- 看到 3 個租戶（c-1 群揚資通 active / c-2 米兒設計 pending / c-3 天藍科技 pending）
- 子系統訂閱統計

#### b) 租戶管理
- **點某筆 pending → 「核准」**
- 該筆變 active
- 對白：「這就是 PPT slide 4『新客戶上線』第 1 步」

#### c) 子系統訂閱矩陣
- 矩陣：橫軸 = 子系統，縱軸 = 租戶
- **點 c-2 + EX 開通**
- 該格變綠
- 對白：「現在 c-2 已經能看到 EX 入口，下次他登入 portal 就會出現 EX 卡片」

### 2.3 切換到一般使用者

右上角「登出」→ 回 Portal 登入頁

---

## 3. 五大業務流程主軸（10-12 min）

### 3.1 活動建立（PPT slide 8）— 1 min

**Tab ②** → 用 `ming@agcnet.com.tw` (company-admin) 登入 → 進 EX

**畫面：** 紫色側邊選單

- 左側「建立活動」
- 填：
  ```
  活動名稱：2026 智慧城市展
  類型：實體展覽
  日期：2026-09-15 ~ 2026-09-18
  地點：南港展覽館二館
  ```
- 「儲存」
- ✅ 跳到活動列表，看到新活動

**對白：** 「公司管理員建活動，剛剛是給後續活動管理者用的容器。」

### 3.2 進入活動 + 攤位類型 (1 min)

登出 → 用 `yating@agcnet.com.tw` (event-manager) 登入

**預期：**
- 看到 3 個原有活動 + 剛建的「智慧城市展」
- 點「**2026 台北國際電腦展**」（資料最豐富）

進到活動內側邊選單（13 個模組對齊 PPT slide 14）：
- 參展商管理 / 招展 / 匯入 / 攤位 / 文件 / 表單 / 審核 / 確認進度 / 設備 / 展前 / 模板 / 監控 / 繳交舊版

**點「攤位配置」**
- ✅ 上方 panel 切換「廠商自選 / 管理員分配」（PPT slide 10 開關）
- ✅ 下方表格 12 廠商 + 攤位狀態 + 訂金/尾款

**對白：** 「PPT slide 10 的開關功能 — 同一場活動可以選讓廠商自選攤位，或管理員分配。我們等下會展示自選流程。」

### 3.3 匯入廠商 + 邀約 (1.5 min)

側邊「匯入廠商」

- 上傳一個 CSV（或點「使用範例」）
- 預覽 → 確認匯入
- 跳到「廠商招展」（recruit）→ 列表勾選任一廠商 → **「寄送邀請」**
- ✅ Toast「已寄出邀約信」

**Tab ③ Mailhog →** 重新整理 → 收到一封：
```
From: EX 系統 (dev) <noreply@ex.local>
To: <廠商 email>
Subject: 【2026 台北國際電腦展】誠摯邀請您參展
Body: 內含 邀約 token URL
```

點開信 → 找 `reset-password` 之外那個含 `/invite/` 的連結

**對白：** 「PPT slide 8 完整對應 — 真實寄信，不是 demo 模擬。」

### 3.4 廠商端：RSVP + 自選攤位（PPT slide 9-10）— 2 min

**Tab ⑤ →** 貼剛剛 Mailhog 抓到的 invite URL 開啟（無痕視窗最佳）

**預期：** 廠商邀約頁
- 活動名稱 / 日期 / 地點
- 「同意」/「婉拒」按鈕

**點「同意」**
- 跳到註冊頁
- 填公司資料（地址、電話）+ 選裝潢方式（**self / booth-vendor**，PPT slide 12 條件式表單會用）
- 「完成註冊」
- 自動進到廠商後台

**廠商後台 → 「展位資訊」**
- 因為剛剛 yating 開過自選模式（如果你忘了，回去 tab ② 開一下），會看到攤位類型卡片
- 選「標準型」+ 填編號 A-99 → **「提交攤位選擇」**
- ✅ 顯示「審核中 - 待管理員確認」

**Tab ② 切回 yating →** 攤位配置 → 該廠商旁邊出現「廠商自選待確認」chip + 確認/退回按鈕
- 點「確認」
- ✅ 攤位變 confirmed

**對白：** 「PPT slide 10 的雙向流程完整 — 廠商自選提交 → pending → 管理員確認 → confirmed。」

### 3.5 表單管理 + 三態確認（PPT slide 12 + 15）— 2 min

廠商後台 → 「表單」

**重點看：**
- 12 張左右表單（依 decorationMode 條件式過濾，self 會多 3 張裝潢相關）
- 必繳 chip / 含費用 chip
- 找一張「攤位廠商參展切結書」

**點「上傳簽檔」**
- 點選擇檔案 → 真選一個 PDF
- ✅ 「已上傳：xxx.pdf」
- 點「送出」

**Tab ② yating 切「表單審核」**
- 找到該筆 → 「審核」
- 點「核可」+ 加備註
- ✅ Toast「已核可」

**Tab ⑤ 廠商頁重新整理**
- 該表單變「已通過」+ 出現「**確認完成**」按鈕（PPT slide 15）
- 點「確認完成」
- ✅ 變「✓ 已確認」

**Tab ② yating →** 表單審核
- 該筆出現「↺ 觸發重新確認」按鈕
- **點它**
- ✅ Toast「已通知廠商重新確認」

**Tab ⑤ 廠商頁重新整理**
- 該表單變「待重新確認」狀態

**對白：** 「PPT slide 15 的三態確認 + 重新觸發機制 — 即使審核通過，主辦方仍可隨時要求廠商重新確認，這是這個流程的關鍵差異化點。」

#### 順便看 audit log

回 「表單審核」 → 點任一筆的 **📜 歷史**
- ✅ Modal 顯示時間軸：submitted → reviewed → vendor_confirmed → reconfirm_triggered

### 3.6 設備申請 + 真實 PDF（PPT slide 13）— 2 min

**Tab ⑤ 廠商 →** 「設備申請」

- 步驟條：選擇 → PDF → 簽章 → 匯款
- 切換類別（電力 / 網路 / 桌椅）→ 加 2-3 項到購物車
- 點「建立申請單」
- 點「**產生 PDF 申請表**」
- ✅ 自動開新視窗下載 PDF（A4，**真的 pdfkit 產生**，含中文）
- 點「上傳已簽檔」→ 真選一個 PDF（剛產生的或任意一個）
- 點「上傳匯款單」→ 真選一個 JPG
- ✅ status = submitted

**Tab ② yating →** 「設備申請」 (EquipmentCatalog → 申請案件 tab)
- 看到該筆 submitted
- 點「核可」
- ✅ status = approved

**對白：** 「PPT slide 13 的 7 階段狀態機 + 真實產 PDF + 真實上傳，不是模擬。」

### 3.7 確認進度 dashboard（PPT slide 15 收尾）— 1 min

側邊「**確認進度**」

**畫面：**
- 上方 4 個 stats：廠商總數 / 全部已確認 / 進行中 / 待重新確認
- 下方表格：每位廠商 × 4 欄進度（須知 / 表單 / 設備）
- 進度條：100% 綠 / 50%+ 橘 / <50% 一般
- 重新確認的廠商會有紅色 chip

**對白：** 「整場活動所有廠商的確認狀況一頁看完，PPT slide 15『狀態追蹤』的視覺化版本。」

### 3.8 即時通知 + Mailhog 三度對照 — 1 min

**右上角鈴鐺 🔔** → 應該有 1+ 紅點未讀

**對白：** 「即時通知，剛剛廠商提交表單和設備時，所有活動管理者的鈴鐺都即時亮起。」

點開 dropdown → 看通知時間軸

**Tab ③ Mailhog →** 重新整理
- 至少 4 封信：邀約 / 表單審核通知 / 設備審核通知 / 重新確認

---

## 4. 額外亮點（demo 後加分項，按需挑）

### 4.1 CSV 匯出 — 30 秒
「廠商管理」 → 「匯出 CSV」 → 用 Excel 開 → 17 欄含活動名 / 攤位 / 訂金狀態，**中文編碼正常**。

### 4.2 忘記密碼 — 30 秒
登出 → 點「忘記密碼？」 → 填 yating email → 寄出 → Tab ③ Mailhog 看到「重設密碼」信 → 點 reset url → 設新密碼 → 用新密碼登入。

### 4.3 寄信記錄表
ming 角色 → 「SMTP 設定」 → 下方「寄信記錄」面板看到剛剛全部寄出的信。

### 4.4 即時 SSE
Tab ② 切「即時監控」頁 → 在另一個瀏覽器/分頁觸發新邀約 → Monitor 頁 0.x 秒內出現新動態（不需 refresh）。

### 4.5 權限細粒度
ming 角色 → 「權限管理」 → 切到 `event-manager` → 關掉「events.delete」 → yating 嘗試刪活動 → 403。

### 4.6 業主 Portal SSO 模擬
（如果業主問「上線怎麼整合？」）回 Portal 頁 → 用 portal-admin 登入 → 點 EX 卡片 → 看 URL `/sso?token=...` → 解析 base64 看到 6 欄位（與 PPT slide 3 完全對齊）。

---

## 5. 收尾話術（給業務／PM）

### 5.1 已涵蓋的（強調）

✓ **PPT 16 頁全對齊**
✓ **5 大業務流程**完整跑通（PPT slide 7）
✓ **真實後端**（不是純前端 demo）：MySQL + Express + Prisma
✓ **真實寄信**（dev 用 Mailhog，生產換 SMTP 即可）
✓ **真實檔案上傳 + 中文 PDF**
✓ **多租戶隔離**（換租戶角色看到的資料完全不同）
✓ **稽核軌跡**（活動 + 表單 + 寄信全紀錄）
✓ **3 種寄信策略**（Email + In-app 鈴鐺 + SSE 即時推）

### 5.2 上線前剩 2 件（誠實揭露）

1. **業主提供 VM** → 1 天上 Nginx + PM2 + SSL（DEPLOYMENT.md 寫好了）
2. **業主提供 Portal 公鑰** → 5 分鐘設定 SSO 真實對接

### 5.3 後續可選增強

- MFA / 2FA（合規或客戶要求才做）
- 多語系英文版（海外擴張時）
- Portal callback webhook（業主協調好 schema 才做）

---

## 6. 備援腳本（如果什麼東西當掉）

| 症狀 | 急救 |
|---|---|
| 後端不通 | `cd server && pkill -f "node.*src/index"; npm run dev` |
| Mailhog 沒信 | 確認 `docker ps` 有 ex-mailhog；`server/.env` 有 `SMTP_DEV_HOST=localhost` |
| 前端進去白屏 | F12 看 Console；通常是 token 過期，登出重登 |
| 資料看起來壞了 | `cd server && npm run prisma:reset && npm run seed` 重置 |
| 想清空寄信記錄 | 進 Mailhog UI 點「Delete all messages」 |

---

## 7. 角色帳號速查（密碼一律 `demo1234`）

| Email | 角色 | 用來展示 |
|---|---|---|
| portal@exhibitos.com | portal-admin | 平台層 / 跨租戶 |
| admin@exhibitos.com | super-admin | EX 系統維運 |
| ming@agcnet.com.tw | company-admin | 公司管理（建活動 / 模板 / SMTP） |
| **yating@agcnet.com.tw** | event-manager | **主軸 demo** — 活動 13 模組 |
| wenhao@agcnet.com.tw | event-manager | 同 tenant 第二位活管（看通知共享） |
| meiling@agcnet.com.tw | member | 一般成員（限 view） |

廠商不在 user 表內，是透過 token 進廠商 portal（沒密碼）。

---

## 8. Demo 時間表（建議 15 分鐘版本）

| 段 | 時間 | 重點 |
|---|---|---|
| 開場 + Portal | 2 min | 平台架構 + portal-admin 後台 |
| 活動建立 | 1 min | company-admin 建活動 |
| 廠商邀約 | 1.5 min | 匯入 + 寄信 + Mailhog 對照 |
| 廠商 RSVP + 自選攤位 | 2 min | 廠商視角 + 雙向確認 |
| 表單三態確認 | 2 min | 上傳 + 審核 + ↺ 重新觸發 |
| 設備 + PDF | 2 min | 7 階段 + 真實產 PDF |
| 確認進度 + 通知 | 1.5 min | dashboard + 鈴鐺 |
| 收尾 + Q&A | 3 min | 強調已完成 / 誠實揭露未完成 |

> 小技巧：每切換頁面前停 2 秒讓觀眾看清楚 URL 變化。

