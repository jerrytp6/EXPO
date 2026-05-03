import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, ROLE_NAMES, ROLE_HOME } from "../store/auth";
import { Icon } from "../components/Icon";
import { toast } from "../store/toast";

const DEMO_ACCOUNTS = [
  { email: "admin@exhibitos.com",   name: "平台維運",    role: "super-admin",   color: "#0071e3" },
  { email: "ming@agcnet.com.tw",    name: "陳小明",      role: "company-admin", color: "#30d158" },
  { email: "yating@agcnet.com.tw",  name: "林雅婷",      role: "event-manager", color: "#ff9f0a" },
];

// 開發者直登 EX 系統（跳過 Portal）— 真實 API
export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("demo1234");

  const submit = async (e) => {
    e.preventDefault();
    const r = await login(email.trim(), password);
    if (!r.ok) {
      toast.error(r.error === "invalid_credentials" ? "帳號或密碼錯誤" : `登入失敗：${r.error}`);
      return;
    }
    toast.success(`歡迎回來，${r.user.name}`);
    navigate(ROLE_HOME[r.user.role] || "/");
  };

  const quickLogin = async (acct) => {
    const r = await login(acct.email, "demo1234");
    if (!r.ok) {
      toast.error(`快速登入失敗：${r.error}`);
      return;
    }
    toast.success(`已登入：${r.user.name}`);
    navigate(ROLE_HOME[r.user.role] || "/");
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0071e3 0%, #5e5ce6 50%, #bf5af2 100%)" }}>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur grid place-items-center">
              <Icon name="layers" />
              <style>{`.grid svg.icon { stroke: white; }`}</style>
            </div>
            <div>
              <div className="font-display font-bold text-lg">Exhibition OS</div>
              <div className="text-[12px] opacity-80">展覽營運平台</div>
            </div>
          </div>
        </div>
        <div className="relative z-10">
          <h1 className="text-5xl font-bold tracking-tight leading-tight mb-5">
            從建立企業<br />到廠商完成報名
          </h1>
          <p className="text-[15px] opacity-85 leading-relaxed max-w-md">
            一站式管理平台 — 支援超級管理員、公司管理者、活動執行者與廠商四種角色，串接完整的展覽營運流程。
          </p>
        </div>
        <div className="relative z-10 text-[12px] font-display opacity-70">
          © 2026 Exhibition OS · API build
        </div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold tracking-tight mb-2">登入您的帳號</h2>
          <p className="text-[14px] mb-8" style={{ color: "var(--text-secondary)" }}>
            輸入帳號密碼或選擇下方測試帳號（密碼 demo1234）
          </p>

          <Link
            to="/portal"
            className="w-full flex items-center gap-3 p-4 rounded-xl text-white font-medium mb-5 no-underline transition-all"
            style={{ background: "linear-gradient(135deg, #30d158, #0bb850)", boxShadow: "0 8px 24px rgba(48,209,88,0.25)" }}
          >
            <div className="w-10 h-10 rounded-lg grid place-items-center" style={{ background: "rgba(255,255,255,0.2)" }}>
              <Icon name="shield" />
              <style>{`a[href="#/portal"] .grid .icon { stroke: white; }`}</style>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[15px]">從展會營運平台登入</div>
              <div className="text-[12px] opacity-90">Portal SSO · 正式整合路徑</div>
            </div>
            <Icon name="arrow_right" className="icon w-5 h-5" />
          </Link>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: "var(--separator)" }} />
            <span className="text-[11px] font-display uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>
              開發者快速登入
            </span>
            <div className="flex-1 h-px" style={{ background: "var(--separator)" }} />
          </div>

          <form onSubmit={submit}>
            <label className="block text-[12px] font-display font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--text-tertiary)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full px-4 py-3 rounded-xl text-[14px] outline-none mb-3"
              style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
            />
            <label className="block text-[12px] font-display font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--text-tertiary)" }}>
              密碼
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-[14px] outline-none mb-4"
              style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
            />
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-white font-medium text-[14px]"
              style={{
                background: "linear-gradient(135deg, #0071e3, #5e5ce6)",
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}>
              {loading ? "登入中…" : "登入"}
            </button>
          </form>

          <div className="space-y-2 mt-5">
            {DEMO_ACCOUNTS.map((u) => (
              <button
                key={u.email}
                onClick={() => quickLogin(u)}
                disabled={loading}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:shadow-sm"
                style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
              >
                <div className="w-10 h-10 rounded-full grid place-items-center text-white font-display font-bold text-[14px]"
                  style={{ background: u.color }}>
                  {u.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium">{u.name}</div>
                  <div className="text-[12px] font-display" style={{ color: "var(--text-tertiary)" }}>
                    {u.email} · {ROLE_NAMES[u.role]}
                  </div>
                </div>
                <Icon name="arrow_right" className="icon w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
