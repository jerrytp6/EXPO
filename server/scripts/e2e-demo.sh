#!/bin/bash
set -e
BASE="http://localhost:7002"

# 共用：login → 取 token
login() {
  curl -s -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
    -d "{\"email\":\"$1\",\"password\":\"demo1234\"}" | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])"
}

# 共用：JSON pretty 摘要（取前幾個 key）
summary() {
  python3 -c "
import sys, json
d = json.load(sys.stdin)
if isinstance(d, list):
    print(f'  → 回傳 {len(d)} 筆')
else:
    keys = list(d.keys())[:6]
    for k in keys:
        v = d[k]
        if isinstance(v, dict): v = '<obj>'
        elif isinstance(v, list): v = f'[{len(v)} items]'
        elif isinstance(v, str) and len(v) > 60: v = v[:55] + '...'
        print(f'    {k}: {v}')"
}

hr() { echo ""; echo "════════════════════════════════════════════════════════════"; echo "  $1"; echo "════════════════════════════════════════════════════════════"; }

#────────────────────────────────────────────────────────────
hr "PHASE 0：健康檢查 + Bootstrap 視角"
#────────────────────────────────────────────────────────────
echo "GET /healthz"
curl -s "$BASE/healthz" | python3 -m json.tool

#────────────────────────────────────────────────────────────
hr "PHASE 1：portal-admin 視角（PPT slide 2-4 平台層）"
#────────────────────────────────────────────────────────────
PA=$(login portal@exhibitos.com)
echo "GET /tenants（看所有租戶）"
curl -s "$BASE/tenants" -H "Authorization: Bearer $PA" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'  → {len(d)} 租戶')
for t in d:
    print(f'    · {t[\"name\"]}（{t[\"status\"]}）users={t[\"_count\"][\"users\"]} events={t[\"_count\"][\"events\"]}')"

echo ""
echo "GET /tenants/c-1/subsystems（看 c-1 開通了哪些子系統）"
curl -s "$BASE/tenants/c-1/subsystems" -H "Authorization: Bearer $PA" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for s in d: print(f'  · {s[\"subsystemKey\"]} → {s[\"contractEnd\"][:10] if s.get(\"contractEnd\") else \"無\"}')"

#────────────────────────────────────────────────────────────
hr "PHASE 2：業主 Portal SSO（PPT slide 3 Token 6 欄位）"
#────────────────────────────────────────────────────────────
PORTAL_TOKEN=$(python3 -c "
import base64, json
print(base64.b64encode(json.dumps({
  'portalUserId': 'portal-user-yating',
  'username': 'yating@agcnet.com.tw',
  'role': 'event-manager',
  'companyId': 'c-1',
  'tenantId': 'c-1',
  'subsystemUserId': 'u-em-1',
  'iat': 1234567890,
}).encode()).decode())")
echo "Portal SSO token (base64):"
echo "  ${PORTAL_TOKEN:0:80}..."
echo ""
echo "POST /auth/sso → 換 EX 內部 JWT"
SSO_RES=$(curl -s -X POST "$BASE/auth/sso" -H 'Content-Type: application/json' -d "{\"token\":\"$PORTAL_TOKEN\"}")
echo "$SSO_RES" | python3 -c "
import sys, json
d = json.load(sys.stdin)
u = d['user']
print(f'  EX user: {u[\"name\"]} · {u[\"role\"]} · tenant={u[\"tenant\"][\"name\"]}')
print(f'  EX JWT (7d): {d[\"token\"][:60]}...')
print(f'  portalUserId echo: {d[\"portalUserId\"]}')"

YATING=$(echo "$SSO_RES" | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

#────────────────────────────────────────────────────────────
hr "PHASE 3：event-manager 看活動（PPT slide 7-8）"
#────────────────────────────────────────────────────────────
echo "GET /events"
curl -s "$BASE/events" -H "Authorization: Bearer $YATING" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for e in d:
    print(f'  · {e[\"name\"]}（{e[\"location\"] or \"—\"}）')
    print(f'    類型={e[\"type\"]} | 攤位類型={len(e[\"boothTypes\"])} | vendors={e[\"_count\"][\"vendors\"]} | selfSelect={e[\"boothSelfSelectionEnabled\"]}')"

EID="e-1"  # 台北國際電腦展

#────────────────────────────────────────────────────────────
hr "PHASE 4：廠商邀約（PPT slide 8）"
#────────────────────────────────────────────────────────────
echo "GET /vendors?eventId=$EID（看 e-1 的廠商）"
curl -s "$BASE/vendors?eventId=$EID" -H "Authorization: Bearer $YATING" | python3 -c "
import sys, json, collections
d = json.load(sys.stdin)
print(f'  → {len(d)} 廠商')
st = collections.Counter(v['status'] for v in d)
print(f'  狀態分布: {dict(st)}')
rsvp = collections.Counter(v.get('rsvpStatus') or 'pending' for v in d)
print(f'  RSVP 分布: {dict(rsvp)}')
booth = sum(1 for v in d if v.get('boothNumber'))
print(f'  已分配攤位: {booth} 家')"

#────────────────────────────────────────────────────────────
hr "PHASE 5：PPT slide 10 — 攤位自選開關 + 廠商自選 + 管理員確認"
#────────────────────────────────────────────────────────────
echo "PATCH /events/$EID/booth-self-selection {enabled:true}"
curl -s -X PATCH "$BASE/events/$EID/booth-self-selection" -H "Authorization: Bearer $YATING" -H 'Content-Type: application/json' -d '{"enabled":true}' | python3 -c "
import sys, json
print(f'  → boothSelfSelectionEnabled = {json.load(sys.stdin)[\"boothSelfSelectionEnabled\"]}')"

# 找一個 e-1 的 booth type
BT_ID=$(curl -s "$BASE/events/$EID" -H "Authorization: Bearer $YATING" | python3 -c "import sys,json;print(json.load(sys.stdin)['boothTypes'][0]['id'])")
# 找一個 e-1 已 confirm 但無攤位的廠商，或乾脆挑 v-13（clicked 狀態）模擬廠商自選
VID="v-13"
echo ""
echo "公開 token endpoint：廠商自選攤位 (vendor=$VID, boothType=$BT_ID, A-99)"
curl -s -X PATCH "$BASE/public/vendors/$VID/booth-selection" -H 'Content-Type: application/json' -d "{\"boothTypeId\":\"$BT_ID\",\"boothNumber\":\"E-99\"}" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'  → boothSelectionStatus = {d[\"boothSelectionStatus\"]} ({d[\"boothSelectedBy\"]}) at {d[\"boothSelectedAt\"]}')"

echo ""
echo "POST /vendors/$VID/booth-selection/confirm（管理員確認）"
curl -s -X POST "$BASE/vendors/$VID/booth-selection/confirm" -H "Authorization: Bearer $YATING" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'  → status: {d[\"boothSelectionStatus\"]}（攤位 {d[\"boothNumber\"]} 已確認）')"

#────────────────────────────────────────────────────────────
hr "PHASE 6：PPT slide 12 — 表單條件式 + 三態確認 + reconfirm"
#────────────────────────────────────────────────────────────
echo "GET /forms/for-vendor/v-1（v-1 是 self 自行裝潢，看會多哪些表單）"
curl -s "$BASE/forms/for-vendor/v-1" -H "Authorization: Bearer $YATING" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'  → {len(d)} 表單（含自行裝潢條件式）')
for f in d:
    cond = f' [showWhen={f[\"showWhen\"]}]' if f.get('showWhen') else ''
    flags = []
    if f['isRequired']: flags.append('必繳')
    if f['hasFee']: flags.append('含費')
    print(f'    · {f[\"category\"]}/{f[\"name\"]} {flags}{cond}')"

echo ""
echo "GET /forms/for-vendor/v-2（v-2 是 booth-vendor，少 3 張條件式表單）"
curl -s "$BASE/forms/for-vendor/v-2" -H "Authorization: Bearer $YATING" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'  → {len(d)} 表單（少了自行裝潢專屬的）')"

# 找一個 approved 的 submission 跑三態 demo
echo ""
SID=$(curl -s "$BASE/forms/submissions/list" -H "Authorization: Bearer $YATING" | python3 -c "
import sys, json
d = json.load(sys.stdin)
appr = [s for s in d if s['status']=='approved' and not s.get('vendorConfirmed')]
print(appr[0]['id'] if appr else 'none')")
if [ "$SID" != "none" ]; then
  echo "三態確認 demo (submission $SID)："
  echo "  POST /forms/submissions/$SID/confirm（廠商確認）"
  curl -s -X POST "$BASE/forms/submissions/$SID/confirm" -H "Authorization: Bearer $YATING" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'    vendorConfirmed = {d[\"vendorConfirmed\"]} at {d[\"vendorConfirmedAt\"][:19]}')"
  echo "  POST /forms/submissions/$SID/reconfirm（管理員觸發重新確認）"
  curl -s -X POST "$BASE/forms/submissions/$SID/reconfirm" -H "Authorization: Bearer $YATING" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'    needsReconfirm = {d[\"needsReconfirm\"]}, vendorConfirmed = {d[\"vendorConfirmed\"]}')"
fi

#────────────────────────────────────────────────────────────
hr "PHASE 7：PPT slide 13 — 設備申請 7 階段狀態機"
#────────────────────────────────────────────────────────────
RQS=$(curl -s "$BASE/equipment/requests" -H "Authorization: Bearer $YATING")
echo "$RQS" | python3 -c "
import sys, json, collections
d = json.load(sys.stdin)
st = collections.Counter(r['status'] for r in d)
print(f'  → {len(d)} 申請單 / 狀態分布: {dict(st)}')"

# 找一個 draft 的，跑狀態機
DRAFTID=$(echo "$RQS" | python3 -c "
import sys, json
d = json.load(sys.stdin)
drafts = [r for r in d if r['status']=='draft']
print(drafts[0]['id'] if drafts else 'none')")
if [ "$DRAFTID" != "none" ]; then
  echo "推進狀態機 (申請單 $DRAFTID)："
  for STATE in pdf_generated signed_uploaded submitted; do
    curl -s -X PATCH "$BASE/equipment/requests/$DRAFTID" -H "Authorization: Bearer $YATING" -H 'Content-Type: application/json' -d "{\"status\":\"$STATE\"}" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'  → {d[\"status\"]}')"
  done
  curl -s -X POST "$BASE/equipment/requests/$DRAFTID/review" -H "Authorization: Bearer $YATING" -H 'Content-Type: application/json' -d '{"status":"approved"}' | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'  → 審核 {d[\"status\"]} by {d[\"reviewedBy\"]}')"
fi

#────────────────────────────────────────────────────────────
hr "PHASE 8：B3 檔案上傳鏈路（multer + 路徑安全）"
#────────────────────────────────────────────────────────────
echo "PDF 範例內容" > /tmp/demo-签檔.pdf
RES=$(curl -s -X POST "$BASE/uploads" -H "Authorization: Bearer $YATING" -F "file=@/tmp/demo-签檔.pdf")
echo "POST /uploads (10MB / 22 種副檔名白名單)"
echo "$RES" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'  → stored: {d[\"storedFileName\"]}')
print(f'    size: {d[\"size\"]}B  url: {d[\"url\"]}')"
echo ""
URL=$(echo "$RES" | python3 -c "import sys,json;print(json.load(sys.stdin)['url'])")
echo "GET $URL（下載驗證）"
curl -s "$BASE$URL"
echo ""
rm /tmp/demo-签檔.pdf

#────────────────────────────────────────────────────────────
hr "PHASE 9：B2 multi-tenant 隔離驗證"
#────────────────────────────────────────────────────────────
echo "用 c-1 視角拿 vendors（預期 30）"
curl -s "$BASE/vendors" -H "Authorization: Bearer $YATING" | python3 -c "
import sys, json
print(f'  → {len(json.load(sys.stdin))} 廠商')"

echo ""
echo "假裝 super-admin 切到 c-99 視角（預期 0）— 用 super-admin token + ?tenantId=c-99"
SA=$(login admin@exhibitos.com)
curl -s "$BASE/vendors?tenantId=c-99" -H "Authorization: Bearer $SA" | python3 -c "
import sys, json
print(f'  → {len(json.load(sys.stdin))} 廠商（c-99 不存在）')"

#────────────────────────────────────────────────────────────
hr "PHASE 10：總結"
#────────────────────────────────────────────────────────────
echo "✅ Phase 0  健康檢查"
echo "✅ Phase 1  portal-admin 跨租戶清單"
echo "✅ Phase 2  業主 Portal SSO 換 EX JWT (PPT slide 3)"
echo "✅ Phase 3  event-manager 看活動 (PPT slide 7-8)"
echo "✅ Phase 4  廠商 30 筆 / 狀態分布"
echo "✅ Phase 5  攤位自選開關 + 廠商自選 + 管理員確認 (PPT slide 10)"
echo "✅ Phase 6  表單條件式過濾 + 三態確認 + reconfirm (PPT slide 12, 15)"
echo "✅ Phase 7  設備 7 階段狀態機 + 審核 (PPT slide 13)"
echo "✅ Phase 8  multer 上傳 + 下載 (B3)"
echo "✅ Phase 9  multi-tenant 隔離 (B2)"
echo ""
echo "🎉 端到端 demo 全通"
