import { useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { useData } from "../store/data";
import { Icon } from "../components/Icon";

// Portal 管理後台共用版型（與 EX AppLayout 分開，視覺區隔）
export function PortalAdminLayout({ children }) {
  const navigate = useNavigate();
  const { user: currentUser, logout: doLogout } = useAuth();

  // 登入後拉資料（companies / users 等）
  const bootstrap = useData((s) => s.bootstrap);
  const companies = useData((s) => s.companies);
  useEffect(() => {
    if (currentUser && companies.length === 0) bootstrap(currentUser);
  }, [currentUser]);

  const menu = [
    { to: "/portal/admin",             label: "儀表板",       icon: "activity", end: true },
    { to: "/portal/admin/tenants",     label: "租戶管理",     icon: "building" },
    { to: "/portal/admin/accounts",    label: "帳號管理",     icon: "users" },
    { to: "/portal/admin/subsystems",  label: "子系統訂閱",   icon: "package" },
  ];

  const logout = () => {
    doLogout();
    navigate("/portal-login", { replace: true });
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0c" }}>
      <aside
        className="fixed top-0 left-0 bottom-0 w-[260px] flex flex-col z-40 py-6"
        style={{ background: "#1d1d1f", borderRight: "1px solid rgba(255,255,255,0.1)", color: "white" }}
      >
        <div className="flex items-center gap-3 px-5 pb-6 mb-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="w-9 h-9 rounded-[10px] grid place-items-center"
            style={{ background: "linear-gradient(135deg, #30d158, #0bb850)", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
            <Icon name="shield" />
            <style>{`aside .w-9 .icon { stroke: white; width: 18px; height: 18px; }`}</style>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-[14px] tracking-tight truncate">展會營運平台</span>
            <span className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
              Portal 管理後台
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4">
          <div className="text-[11px] font-semibold uppercase tracking-widest px-3 pb-2"
            style={{ color: "rgba(255,255,255,0.4)" }}>
            Menu
          </div>
          <div className="flex flex-col gap-0.5">
            {menu.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all no-underline text-[13px] ${
                    isActive
                      ? "bg-white/10 text-white font-medium"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon name={it.icon} className="icon w-[18px] h-[18px]" />
                <span>{it.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="px-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex items-center gap-3 p-3 rounded-xl mb-2"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <div className="w-9 h-9 rounded-full grid place-items-center text-white font-bold text-[13px]"
              style={{ background: "linear-gradient(135deg, #30d158, #0bb850)" }}>
              {currentUser?.name?.[0] || "P"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate">{currentUser?.name || "Portal"}</div>
              <div className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.5)" }}>
                Portal 超管
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to="/portal"
              className="flex-1 text-[12px] py-2 rounded-lg text-center no-underline"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" }}
            >
              返回首頁
            </Link>
            <button
              onClick={logout}
              className="flex-1 text-[12px] py-2 rounded-lg"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" }}
            >
              登出
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-[260px] min-h-screen min-w-0" style={{ background: "#f5f5f7", color: "var(--text-primary)" }}>
        <header
          className="h-16 sticky top-0 z-30 flex items-center justify-between px-10"
          style={{
            background: "rgba(245, 245, 247, 0.85)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--separator)",
          }}
        >
          <div className="flex items-center gap-2.5 text-[13px]" style={{ color: "var(--text-secondary)" }}>
            <Link to="/portal/admin" className="no-underline" style={{ color: "inherit" }}>
              Portal Admin
            </Link>
            <span>/</span>
            <strong className="text-ink-primary font-semibold">租戶與子系統管理</strong>
          </div>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: "rgba(48, 209, 88, 0.1)", color: "#1f8a3a" }}>
            <span className="live-dot" /> Portal Live
          </span>
        </header>
        <div className="px-10 pt-8 pb-20 max-w-[1280px]">{children}</div>
      </main>
    </div>
  );
}
