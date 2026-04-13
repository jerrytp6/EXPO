import { useState } from "react";
import { Navigate, useParams, Routes, Route, Link } from "react-router-dom";
import { useData } from "../../store/data";
import { PortalLayout } from "../../components/PortalLayout";
import { Icon } from "../../components/Icon";
import { toast } from "../../store/toast";
import VendorDashboard from "./VendorDashboard";
import VendorBooth from "./VendorBooth";
import VendorProfile from "./VendorProfile";
import VendorDecoration from "./VendorDecoration";
import VendorSubmissions from "./VendorSubmissions";

const VERIFIED_KEY = "exhibition-os.portal-verified";

function getVerified() {
  try { return JSON.parse(localStorage.getItem(VERIFIED_KEY) || "{}"); } catch { return {}; }
}
function setVerified(vendorId) {
  const v = getVerified();
  v[vendorId] = Date.now();
  localStorage.setItem(VERIFIED_KEY, JSON.stringify(v));
}

export default function VendorPortal() {
  const { vendorId } = useParams();
  const { vendors, events } = useData();
  const vendor = vendors.find((v) => v.id === vendorId);

  if (!vendor) return <Navigate to="/login" replace />;
  if (vendor.status !== "registered") return <Navigate to="/login" replace />;

  const alreadyVerified = !!getVerified()[vendorId];
  const [verified, setVerifiedState] = useState(alreadyVerified);
  const [taxIdInput, setTaxIdInput] = useState("");

  const event = events.find((e) => e.id === vendor.eventId);

  // ── 統編驗證閘門 ──
  if (!verified) {
    return (
      <div className="min-h-screen grid place-items-center p-8" style={{ background: "var(--bg)" }}>
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-11 h-11 rounded-xl grid place-items-center"
              style={{ background: "linear-gradient(135deg, #bf5af2, #5e5ce6)" }}
            >
              <Icon name="shield" />
              <style>{`.grid .icon { stroke: white; }`}</style>
            </div>
            <div>
              <div className="font-display font-bold text-[15px]">Exhibition OS</div>
              <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>參展廠商後台</div>
            </div>
          </div>

          <div className="panel">
            <h2 className="text-2xl font-bold tracking-tight mb-2">身份驗證</h2>
            <p className="text-[14px] mb-6" style={{ color: "var(--text-secondary)" }}>
              請輸入 <strong>{vendor.company}</strong> 的統一編號以登入後台。
            </p>

            <div className="mb-4">
              <label
                className="block text-[12px] font-display font-semibold uppercase tracking-wider mb-2"
                style={{ color: "var(--text-tertiary)" }}
              >
                統一編號（8 碼）
              </label>
              <input
                type="text"
                value={taxIdInput}
                onChange={(e) => setTaxIdInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                placeholder="請輸入統一編號"
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
                maxLength={8}
                autoFocus
              />
            </div>

            <button
              onClick={handleVerify}
              className="w-full py-3 rounded-xl text-white font-medium text-[14px]"
              style={{ background: "linear-gradient(135deg, #bf5af2, #5e5ce6)" }}
            >
              驗證並登入
            </button>

            <div
              className="text-[11px] font-display mt-4 p-3 rounded-lg text-center"
              style={{ background: "var(--bg-tinted)", color: "var(--text-tertiary)" }}
            >
              提示：此連結由主辦方透過確認信提供，統編為您公司的 8 碼編號。
            </div>
          </div>

          <div className="text-center mt-6">
            <Link to="/login" className="text-[12px] font-display no-underline" style={{ color: "var(--text-tertiary)" }}>
              ← 回到首頁
            </Link>
          </div>
        </div>
      </div>
    );
  }

  function handleVerify() {
    if (taxIdInput !== vendor.taxId) {
      toast.error("統一編號不正確");
      return;
    }
    setVerified(vendorId);
    setVerifiedState(true);
    toast.success(`歡迎，${vendor.company}`);
  }

  // ── 已驗證 → 正常後台 ──
  const base = `/portal/vendor/${vendorId}`;
  const menu = [
    { to: base,                  label: "儀表板",   icon: "activity", end: true },
    { to: `${base}/booth`,       label: "展位資訊", icon: "building" },
    { to: `${base}/profile`,     label: "公司檔案", icon: "user" },
    { to: `${base}/submissions`, label: "資料繳交", icon: "upload" },
    { to: `${base}/decoration`,  label: "裝潢管理", icon: "sparkles" },
  ];

  return (
    <PortalLayout
      brand={{
        name: vendor.company,
        subtitle: event?.name || "參展廠商",
        role: "vendor",
      }}
      user={{
        name: vendor.contact || vendor.company,
        title: "參展聯絡人",
        company: vendor.company,
      }}
      menu={menu}
      basePath={base}
    >
      <Routes>
        <Route index element={<VendorDashboard vendor={vendor} event={event} />} />
        <Route path="booth" element={<VendorBooth vendor={vendor} event={event} />} />
        <Route path="profile" element={<VendorProfile vendor={vendor} />} />
        <Route path="submissions" element={<VendorSubmissions vendor={vendor} event={event} />} />
        <Route path="decoration/*" element={<VendorDecoration vendor={vendor} event={event} />} />
      </Routes>
    </PortalLayout>
  );
}
