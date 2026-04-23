import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useData } from "../store/data";
import { ROLE_NAMES } from "../store/auth";
import { Icon } from "../components/Icon";

// Portal SSO 統一認證平台 — 登入畫面
// 驗證通過後將 userId 存入 portal-mock-user，轉跳 /portal 顯示子系統列表
// Mock：輸入 email 即可登入（任何密碼都接受）；或用快速登入按鈕
export default function PortalLogin() {
  const navigate = useNavigate();
  const { users, companies } = useData();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setError("");
    const user = users.find((u) => u.email?.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      setError("找不到此帳號");
      return;
    }
    if (!password) {
      setError("請輸入密碼");
      return;
    }
    localStorage.setItem("portal-mock-user", user.id);
    navigate("/portal", { replace: true });
  };

  const quickLogin = (userId) => {
    localStorage.setItem("portal-mock-user", userId);
    navigate("/portal", { replace: true });
  };

  const demoUsers = [
    { id: "u-ca-1", label: "租戶管理員" },
    { id: "u-em-1", label: "活動管理員" },
    { id: "u-sa-1", label: "平台維運" },
  ];

  return (
    <div className="min-h-screen grid place-items-center p-6"
      style={{ background: "linear-gradient(135deg, #f5f5f7 0%, #e8ecf5 100%)" }}>
      <div className="w-full max-w-[440px]">

        {/* Branding */}
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

        {/* Login Card */}
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

            {error && (
              <div className="p-3 rounded-lg mb-4 text-[13px]"
                style={{ background: "rgba(255,59,48,0.08)", color: "var(--red)" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-medium text-[14px]"
              style={{ background: "linear-gradient(135deg, #30d158, #0bb850)" }}
            >
              登入
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: "var(--separator)" }} />
            <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>
              Demo 快速登入
            </span>
            <div className="flex-1 h-px" style={{ background: "var(--separator)" }} />
          </div>

          <div className="space-y-2">
            {demoUsers.map(({ id, label }) => {
              const u = users.find((x) => x.id === id);
              if (!u) return null;
              const co = companies.find((c) => c.id === u.companyId);
              return (
                <button
                  key={id}
                  onClick={() => quickLogin(id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:shadow-sm"
                  style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
                >
                  <div className="w-9 h-9 rounded-full grid place-items-center text-white font-bold text-[13px]"
                    style={{ background: "linear-gradient(135deg, #5e5ce6, #bf5af2)" }}>
                    {u.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium">{u.name} <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>· {label}</span></div>
                    <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {u.email}
                    </div>
                  </div>
                  <Icon name="arrow_right" className="icon w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-6 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
          Demo 模式：任意密碼皆可登入 · 正式版需串 Portal API
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
