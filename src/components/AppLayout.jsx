import { Navigate, Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useAuth, ROLE_NAMES } from "../store/auth";
import { useData } from "../store/data";
import { Icon } from "./Icon";
import { toast } from "../store/toast";

// 各角色的靜態側邊選單（對齊客戶 13 模組 + PDF 架構）
const MENU = {
  "super-admin": {
    dataRole: "super-admin",
    items: [
      { to: "/admin",               label: "儀表板",       icon: "activity", end: true },
      { to: "/admin/companies",     label: "租戶管理",     icon: "building" },
      { to: "/admin/companies/new", label: "建立租戶",     icon: "sparkles" },
    ],
  },
  "company-admin": {
    dataRole: "company-admin",
    items: [
      { to: "/company",                      label: "儀表板",         icon: "activity", end: true },
      { type: "divider", label: "活動" },
      { to: "/company/events",               label: "展覽活動",       icon: "calendar" },
      { to: "/company/events/new",           label: "建立活動",       icon: "sparkles" },
      { type: "divider", label: "帳號管理" },
      { to: "/company/members",              label: "成員帳號",       icon: "users" },
      { to: "/company/permissions",          label: "權限管理",       icon: "shield" },
      { to: "/company/vendor-accounts",      label: "參展廠商帳號",   icon: "user_check" },
      { to: "/company/decorator-accounts",   label: "裝潢廠商帳號",   icon: "tool" },
      { type: "divider", label: "郵件系統" },
      { to: "/company/email-templates",      label: "預設郵件模板",   icon: "mail" },
      { to: "/company/smtp",                 label: "郵件系統設定",   icon: "settings" },
    ],
  },
  "event-manager": {
    dataRole: "event-manager",
    items: [
      { to: "/event",            label: "我的活動",   icon: "calendar", end: true },
    ],
  },
  member: {
    dataRole: "company-admin",
    items: [
      { to: "/company",          label: "公司資訊",   icon: "building", end: true },
      { to: "/company/events",   label: "展覽活動",   icon: "calendar" },
    ],
  },
};

// 活動管理者進入特定活動時的子導覽（對齊 PDF 流程）
function getEventSubMenu(eventId) {
  const base = `/event/${eventId}`;
  return [
    { to: `${base}/vendors`,           label: "參展商管理",     icon: "users" },
    { to: `${base}/recruit`,           label: "廠商招展",       icon: "send" },
    { to: `${base}/import`,            label: "匯入廠商",       icon: "upload" },
    { to: `${base}/booths`,            label: "攤位配置",       icon: "building" },
    { to: `${base}/notices`,           label: "文件管理",       icon: "document" },
    { to: `${base}/forms`,             label: "表單管理",       icon: "check" },
    { to: `${base}/form-review`,       label: "表單審核",       icon: "shield" },
    { to: `${base}/equipment`,         label: "設備申請",       icon: "package" },
    { to: `${base}/pre-event`,         label: "展前通知",       icon: "bell" },
    { to: `${base}/email-templates`,   label: "郵件通知模板",   icon: "mail" },
    { to: `${base}/monitor`,           label: "即時監控",       icon: "activity" },
    { to: `${base}/submissions`,       label: "資料繳交（舊）", icon: "archive" },
  ];
}

export function AppLayout({ children }) {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const { events } = useData();

  const cfg = user ? MENU[user.role] : null;

  // 偵測是否在特定活動內（/event/:eventId/...）
  const eventMatch = location.pathname.match(/^\/event\/([^/]+)\//);
  const activeEventId = eventMatch?.[1];
  const activeEvent = activeEventId ? events.find((e) => e.id === activeEventId) : null;

  const menuItems = useMemo(() => {
    if (user?.role === "event-manager" && activeEventId && activeEvent) {
      return [
        { to: "/event", label: "← 我的活動", icon: "arrow_left", end: true },
        { to: "/event/documents", label: "文件管理", icon: "upload" },
        { type: "divider", label: activeEvent.name },
        ...getEventSubMenu(activeEventId),
      ];
    }
    return cfg?.items || [];
  }, [user?.role, activeEventId, activeEvent, cfg]);

  useEffect(() => {
    if (cfg) document.documentElement.setAttribute("data-role", cfg.dataRole);
    return () => document.documentElement.removeAttribute("data-role");
  }, [cfg]);

  // 登入後一次拉所有資料（A4 起改用 API）
  const bootstrap = useData((s) => s.bootstrap);
  useEffect(() => {
    if (user && events.length === 0) {
      bootstrap(user);
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/portal-login" replace state={{ from: location.pathname }} />;
  }

  const handleLogout = () => {
    logout();
    toast.info("已登出");
    navigate("/portal-login", { replace: true });
  };

  return (
    <div className="min-h-screen">
      <aside
        className="fixed top-0 left-0 bottom-0 w-[260px] flex flex-col z-40 py-6"
        style={{ background: "var(--bg-sidebar)", borderRight: "1px solid var(--separator)" }}
      >
        <div className="flex items-center gap-3 px-5 pb-6 mb-4"
          style={{ borderBottom: "1px solid var(--separator)" }}>
          <div className="w-9 h-9 rounded-[10px] grid place-items-center"
            style={{ background: "var(--role-grad)", boxShadow: "0 4px 12px rgba(0,0,0,0.18)" }}>
            <Icon name="layers" />
            <style>{`aside > div:first-child .icon { stroke: white; }`}</style>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-[15px] tracking-tight">Exhibition OS</span>
            <span className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              {ROLE_NAMES[user.role]}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 overflow-y-auto">
          <div className="text-[11px] font-semibold uppercase tracking-widest font-display px-3 pb-2"
            style={{ color: "var(--text-tertiary)" }}>
            Menu
          </div>
          <div className="flex flex-col gap-0.5">
            {menuItems.map((it, idx) =>
              it.type === "divider" ? (
                <div key={`div-${idx}`} className="pt-4 pb-2 px-3">
                  <div className="text-[11px] font-semibold uppercase tracking-widest font-display truncate"
                    style={{ color: "var(--role-color)" }}>
                    {it.label}
                  </div>
                </div>
              ) : (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all relative no-underline text-[13px] ${
                    isActive
                      ? "bg-white shadow-sm text-ink-primary font-medium"
                      : "text-ink-secondary hover:bg-black/5 hover:text-ink-primary"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-[3px] h-[20px] rounded-r"
                        style={{ background: "var(--role-color)" }} />
                    )}
                    <Icon name={it.icon} className="icon w-[18px] h-[18px]" />
                    <span>{it.label}</span>
                  </>
                )}
              </NavLink>
              )
            )}
          </div>
        </nav>

        <div className="px-5 pt-4" style={{ borderTop: "1px solid var(--separator)" }}>
          <div className="flex items-center gap-3 p-3 rounded-xl mb-2"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--separator)" }}>
            <div className="w-9 h-9 rounded-full grid place-items-center text-white font-display font-bold text-[13px]"
              style={{ background: "var(--role-grad)" }}>
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate">{user.name}</div>
              <div className="text-[11px] font-display truncate" style={{ color: "var(--text-tertiary)" }}>
                {user.title || user.email}
              </div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full text-[12px] font-display py-2 rounded-lg transition-colors hover:bg-black/5"
            style={{ color: "var(--text-tertiary)" }}>
            登出
          </button>
        </div>
      </aside>

      <main className="ml-[260px] min-h-screen min-w-0">
        <header
          className="h-16 sticky top-0 z-30 flex items-center justify-between px-10"
          style={{
            background: "rgba(245, 245, 247, 0.85)",
            backdropFilter: "saturate(180%) blur(20px)",
            WebkitBackdropFilter: "saturate(180%) blur(20px)",
            borderBottom: "1px solid var(--separator)",
          }}
        >
          <div className="flex items-center gap-2.5 text-[13px] font-display" style={{ color: "var(--text-secondary)" }}>
            <Link to={cfg.items[0].to} className="no-underline hover:text-ink-primary"
              style={{ color: "inherit" }}>Exhibition OS</Link>
            <span>/</span>
            <strong className="text-ink-primary font-semibold">{ROLE_NAMES[user.role]}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-display font-medium"
              style={{ background: "rgba(48, 209, 88, 0.1)", color: "#1f8a3a" }}>
              <span className="live-dot" />
              Live
            </span>
          </div>
        </header>
        <div className="px-10 pt-8 pb-20 max-w-[1280px]">{children}</div>
      </main>
    </div>
  );
}
