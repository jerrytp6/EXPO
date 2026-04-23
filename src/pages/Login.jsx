import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, ROLE_NAMES, ROLE_HOME } from "../store/auth";
import { useData } from "../store/data";
import { Icon } from "../components/Icon";
import { toast } from "../store/toast";

export default function Login() {
  const navigate = useNavigate();
  const loginByEmail = useAuth((s) => s.loginByEmail);
  const loginAs = useAuth((s) => s.loginAs);
  const users = useData((s) => s.users);
  const [email, setEmail] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (loginByEmail(email)) {
      const u = JSON.parse(localStorage.getItem("exhibition-os.auth.v1"));
      toast.success(`歡迎回來，${u.name}`);
      navigate(ROLE_HOME[u.role] || "/");
    } else {
      toast.error("找不到此 Email");
    }
  };

  const quickLogin = (userId) => {
    if (loginAs(userId)) {
      const u = users.find((x) => x.id === userId);
      toast.success(`已登入：${u.name}`);
      navigate(ROLE_HOME[u.role] || "/");
    }
  };

  const demoUsers = [
    { id: "u-sa-1", color: "#0071e3" },
    { id: "u-ca-1", color: "#30d158" },
    { id: "u-em-1", color: "#ff9f0a" },
  ];

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left: brand */}
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
          © 2026 Exhibition OS · Demo build
        </div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Right: login form */}
      <div className="flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold tracking-tight mb-2">登入您的帳號</h2>
          <p className="text-[14px] mb-8" style={{ color: "var(--text-secondary)" }}>
            輸入 Email 或選擇下方測試帳號快速體驗
          </p>

          {/* Portal SSO 入口（正式使用路徑）*/}
          <Link
            to="/portal"
            className="w-full flex items-center gap-3 p-4 rounded-xl text-white font-medium mb-5 no-underline transition-all"
            style={{ background: "linear-gradient(135deg, #30d158, #0bb850)", boxShadow: "0 8px 24px rgba(48,209,88,0.25)" }}
          >
            <div className="w-10 h-10 rounded-lg grid place-items-center"
              style={{ background: "rgba(255,255,255,0.2)" }}>
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
              className="w-full px-4 py-3 rounded-xl text-[14px] outline-none mb-4"
              style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
            />
            <button type="submit" className="w-full py-3 rounded-xl text-white font-medium text-[14px]"
              style={{ background: "linear-gradient(135deg, #0071e3, #5e5ce6)" }}>
              登入
            </button>
          </form>

          <div className="space-y-2 mt-5">
            {demoUsers.map(({ id, color }) => {
              const u = users.find((x) => x.id === id);
              if (!u) return null;
              return (
                <button
                  key={id}
                  onClick={() => quickLogin(id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:shadow-sm"
                  style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
                >
                  <div className="w-10 h-10 rounded-full grid place-items-center text-white font-display font-bold text-[14px]"
                    style={{ background: color }}>
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
              );
            })}
          </div>

          <div className="mt-8 pt-6 text-[12px] font-display space-y-2"
            style={{ color: "var(--text-tertiary)", borderTop: "1px solid var(--separator)" }}>
            <div className="text-center pt-2">— 體驗其他角色 —</div>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/invite/tkn-acer-2026"
                className="text-center px-3 py-2 rounded-lg no-underline"
                style={{ background: "var(--bg-tinted)", color: "var(--text-secondary)" }}>
                📨 廠商邀請信
              </Link>
              <Link to="/portal/vendor/v-1"
                className="text-center px-3 py-2 rounded-lg no-underline"
                style={{ background: "var(--bg-tinted)", color: "var(--text-secondary)" }}>
                🏢 廠商後台
              </Link>
              <Link to="/decor-invite/dtkn-mtk-zhuying"
                className="text-center px-3 py-2 rounded-lg no-underline"
                style={{ background: "var(--bg-tinted)", color: "var(--text-secondary)" }}>
                ✨ 裝潢邀請
              </Link>
              <Link to="/portal/decorator/d-1"
                className="text-center px-3 py-2 rounded-lg no-underline"
                style={{ background: "var(--bg-tinted)", color: "var(--text-secondary)" }}>
                🎨 裝潢後台
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
