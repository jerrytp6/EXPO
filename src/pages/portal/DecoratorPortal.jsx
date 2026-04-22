import { useState } from "react";
import { Navigate, useParams, Routes, Route, Link } from "react-router-dom";
import { useData } from "../../store/data";
import { PortalLayout } from "../../components/PortalLayout";
import { Icon } from "../../components/Icon";
import { toast } from "../../store/toast";
import DecoratorDashboard from "./DecoratorDashboard";
import DecoratorProject from "./DecoratorProject";
import DecoratorNotices from "./DecoratorNotices";
import DecoratorForms from "./DecoratorForms";

const VERIFIED_KEY = "exhibition-os.portal-verified";

function getVerified() {
  try { return JSON.parse(localStorage.getItem(VERIFIED_KEY) || "{}"); } catch { return {}; }
}
function setVerified(id) {
  const v = getVerified();
  v[id] = Date.now();
  localStorage.setItem(VERIFIED_KEY, JSON.stringify(v));
}

export default function DecoratorPortal() {
  const { decoratorId } = useParams();
  const { decorators } = useData();
  const decorator = decorators.find((d) => d.id === decoratorId);

  if (!decorator) return <Navigate to="/login" replace />;

  const alreadyVerified = !!getVerified()[decoratorId];
  const [verified, setVerifiedState] = useState(alreadyVerified);
  const [taxIdInput, setTaxIdInput] = useState("");

  if (!verified) {
    return (
      <div className="min-h-screen grid place-items-center p-8" style={{ background: "var(--bg)" }}>
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-11 h-11 rounded-xl grid place-items-center"
              style={{ background: "linear-gradient(135deg, #ff6a00, #ff2d92)" }}
            >
              <Icon name="shield" />
              <style>{`.grid .icon { stroke: white; }`}</style>
            </div>
            <div>
              <div className="font-display font-bold text-[15px]">Exhibition OS</div>
              <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>裝潢公司後台</div>
            </div>
          </div>

          <div className="panel">
            <h2 className="text-2xl font-bold tracking-tight mb-2">身份驗證</h2>
            <p className="text-[14px] mb-6" style={{ color: "var(--text-secondary)" }}>
              請輸入 <strong>{decorator.name}</strong> 的統一編號以登入後台。
            </p>
            <div className="mb-4">
              <label className="block text-[12px] font-display font-semibold uppercase tracking-wider mb-2"
                style={{ color: "var(--text-tertiary)" }}>統一編號（8 碼）</label>
              <input
                type="text" value={taxIdInput}
                onChange={(e) => setTaxIdInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                placeholder="請輸入統一編號"
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
                maxLength={8} autoFocus
              />
            </div>
            <button onClick={handleVerify}
              className="w-full py-3 rounded-xl text-white font-medium text-[14px]"
              style={{ background: "linear-gradient(135deg, #ff6a00, #ff2d92)" }}>
              驗證並登入
            </button>
            <div className="text-[11px] font-display mt-4 p-3 rounded-lg text-center"
              style={{ background: "var(--bg-tinted)", color: "var(--text-tertiary)" }}>
              提示：統編為貴公司的 8 碼編號。
              {decorator.taxId && <> 示範用統編：<code>{decorator.taxId}</code></>}
            </div>
          </div>

          <div className="text-center mt-6">
            <Link to="/login" className="text-[12px] font-display no-underline" style={{ color: "var(--text-tertiary)" }}>← 回到首頁</Link>
          </div>
        </div>
      </div>
    );
  }

  function handleVerify() {
    if (!decorator.taxId) {
      // 沒有設定統編的裝潢公司直接放行
      setVerified(decoratorId);
      setVerifiedState(true);
      return;
    }
    if (taxIdInput !== decorator.taxId) {
      toast.error("統一編號不正確");
      return;
    }
    setVerified(decoratorId);
    setVerifiedState(true);
    toast.success(`歡迎，${decorator.name}`);
  }

  const base = `/portal/decorator/${decoratorId}`;
  const menu = [
    { to: base,               label: "我的專案",   icon: "activity", end: true },
    { to: `${base}/notices`,  label: "展覽須知",   icon: "document" },
    { to: `${base}/forms`,    label: "表單代簽",   icon: "check" },
  ];

  return (
    <PortalLayout
      brand={{ name: decorator.name, subtitle: "裝潢公司後台", role: "decorator" }}
      user={{ name: decorator.contact || decorator.name, title: decorator.title || "設計師", company: decorator.name }}
      menu={menu}
      basePath={base}
    >
      <Routes>
        <Route index element={<DecoratorDashboard decorator={decorator} />} />
        <Route path="notices" element={<DecoratorNotices decorator={decorator} />} />
        <Route path="forms" element={<DecoratorForms decorator={decorator} />} />
        <Route path="project/:projectId" element={<DecoratorProject decorator={decorator} />} />
      </Routes>
    </PortalLayout>
  );
}
