import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, ROLE_HOME } from "../store/auth";
import { Icon } from "../components/Icon";

// Portal SSO 統一認證平台 — 登入畫面
// A4.1 後改用真實 API：POST /auth/login → JWT
const DEMO_ACCOUNTS = [
  { email: "portal@exhibitos.com",  label: "Portal 超管",   role: "portal-admin" },
  { email: "ming@agcnet.com.tw",    label: "租戶管理員",    role: "company-admin" },
  { email: "yating@agcnet.com.tw",  label: "活動管理員",    role: "event-manager" },
];

export default function PortalLogin() {
  const navigate = useNavigate();
  const { login, loading, error: authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("請輸入帳號與密碼");
      return;
    }
    const r = await login(email.trim(), password);
    if (!r.ok) {
      setError(r.error === "invalid_credentials" ? "帳號或密碼錯誤" : `登入失敗：${r.error}`);
      return;
    }
    navigate(ROLE_HOME[r.user.role] || "/portal", { replace: true });
  };

  const quickLogin = async (acct) => {
    setError("");
    const r = await login(acct.email, "demo1234");
    if (!r.ok) {
      setError(`快速登入失敗：${r.error}`);
      return;
    }
    navigate(ROLE_HOME[r.user.role] || "/portal", { replace: true });
  };

  return (
    <div className="min-h-screen grid place-items-center p-6"
      style={{ background: "linear-gradient(135deg, #f5f5f7 0%, #e8ecf5 100%)" }}>
      <div className="w-full max-w-[440px]">

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl grid place-items-center"
            style={{ background: "linear-gradient(135deg, #30d158, #0bb850)", boxShadow: "0 8px 24px rgba(48,209,88,0.25)" }}>
            <Icon name="layers" />
            <style>{`.w-12 .icon { stroke: white; width: 24px; height: 24px; }`}</style>
          </div>
          <div>
            <div className="font-bold text-[18px] tracking-tight">展會營運平台</div>
            <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Portal SSO · 統一認證
            </div>
          </div>
        </div>

        <div
          className="p-8 rounded-3xl"
          style={{
            background: "white",
            boxShadow: "0 30px 80px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.04)",
            border: "1px solid var(--separator)",
          }}
        >
          <h1 className="text-2xl font-bold mb-1 tracking-tight">登入您的帳號</h1>
          <p className="text-[13px] mb-6" style={{ color: "var(--text-secondary)" }}>
            使用您在展會營運平台的帳號密碼登入
          </p>

          <form onSubmit={submit}>
            <label className="block text-[12px] font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--text-tertiary)" }}>
              帳號（Email）
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoFocus
              className="input mb-4"
            />

            <label className="block text-[12px] font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--text-tertiary)" }}>
              密碼
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input mb-2"
            />

            <div className="flex items-center justify-between text-[12px] mb-4">
              <label className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                <input type="checkbox" /> 記住我
              </label>
              <a href="#" className="no-underline" style={{ color: "#0071e3" }} onClick={(e) => e.preventDefault()}>
                忘記密碼？
              </a>
            </div>

            {(error || authError) && (
              <div className="p-3 rounded-lg mb-4 text-[13px]"
                style={{ background: "rgba(255,59,48,0.08)", color: "var(--red)" }}>
                {error || authError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-medium text-[14px]"
              style={{
                background: "linear-gradient(135deg, #30d158, #0bb850)",
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "登入中…" : "登入"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: "var(--separator)" }} />
            <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>
              Demo 快速登入（密碼 demo1234）
            </span>
            <div className="flex-1 h-px" style={{ background: "var(--separator)" }} />
          </div>

          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((acct) => (
              <button
                key={acct.email}
                onClick={() => quickLogin(acct)}
                disabled={loading}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:shadow-sm"
                style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
              >
                <div className="w-9 h-9 rounded-full grid place-items-center text-white font-bold text-[13px]"
                  style={{ background: "linear-gradient(135deg, #5e5ce6, #bf5af2)" }}>
                  {acct.label[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium">
                    {acct.label}
                  </div>
                  <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {acct.email}
                  </div>
                </div>
                <Icon name="arrow_right" className="icon w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="text-center mt-6 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
          後端 API：<code>:7002</code> · 預設密碼 <code>demo1234</code>
        </div>

        <div className="text-center mt-2 text-[11px]">
          <Link to="/login" className="no-underline" style={{ color: "var(--text-tertiary)" }}>
            開發者直接登入 EX 系統 →
          </Link>
        </div>
      </div>
    </div>
  );
}
