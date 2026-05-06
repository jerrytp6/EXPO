import { Navigate, Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import { useAuth, ROLE_NAMES } from "../store/auth";
import { useData } from "../store/data";
import { Icon } from "./Icon";
import { toast } from "../store/toast";
import NotificationBell from "./NotificationBell";

// ─────────────────────────────────────────────────────────────────
// 各角色的選單（分組結構）
// item 形式：
//   { type: "item", to, label, icon, end? }
//   { type: "group", label, items: [...], defaultOpen? }
// ─────────────────────────────────────────────────────────────────

const MENU = {
  "super-admin": {
    dataRole: "super-admin",
    items: [
      { type: "item", to: "/admin",               label: "儀表板",     icon: "activity", end: true },
      { type: "item", to: "/admin/companies",     label: "租戶管理",   icon: "building" },
      { type: "item", to: "/admin/companies/new", label: "建立租戶",   icon: "sparkles" },
    ],
  },
  "company-admin": {
    dataRole: "company-admin",
    items: [
      { type: "item", to: "/company", label: "儀表板", icon: "activity", end: true },
      { type: "group", label: "活動", items: [
        { type: "item", to: "/company/events",     label: "展覽活動",   icon: "calendar" },
        { type: "item", to: "/company/events/new", label: "建立活動",   icon: "sparkles" },
      ]},
      { type: "group", label: "帳號管理", items: [
        { type: "item", to: "/company/members",            label: "成員帳號",     icon: "users" },
        { type: "item", to: "/company/permissions",        label: "權限管理",     icon: "shield" },
        { type: "item", to: "/company/vendor-accounts",    label: "參展廠商帳號", icon: "user_check" },
        { type: "item", to: "/company/decorator-accounts", label: "裝潢廠商帳號", icon: "tool" },
      ]},
      { type: "group", label: "郵件系統", items: [
        { type: "item", to: "/company/email-templates", label: "預設郵件模板", icon: "mail" },
        { type: "item", to: "/company/smtp",            label: "郵件系統設定", icon: "settings" },
      ]},
    ],
  },
  "event-manager": {
    dataRole: "event-manager",
    items: [
      { type: "item", to: "/event",            label: "我的活動", icon: "calendar", end: true },
      { type: "item", to: "/event/documents",  label: "文件範本庫", icon: "book" },
    ],
  },
  member: {
    dataRole: "company-admin",
    items: [
      { type: "item", to: "/company",        label: "公司資訊",   icon: "building", end: true },
      { type: "item", to: "/company/events", label: "展覽活動",   icon: "calendar" },
    ],
  },
};

// 進入特定活動內 — 五大流程分組（對齊 PPT slide 7-15）
// counts: { roster, pendingImport, pendingReview, equipPending } 動態 badge
function getEventMenu(eventId, counts = {}) {
  const base = `/event/${eventId}`;
  return [
    { type: "group", label: "概覽", defaultOpen: true, items: [
      { type: "item", to: `${base}/monitor`,      label: "即時監控",   icon: "activity" },
      { type: "item", to: `${base}/confirmation`, label: "確認進度",   icon: "check_circle" },
    ]},
    { type: "group", label: "廠商招展", defaultOpen: true, items: [
      { type: "item", to: `${base}/vendors`,  label: "參展商管理", icon: "users",      badge: counts.pendingImport },
      { type: "item", to: `${base}/roster`,   label: "參展名單",   icon: "user_check", badge: counts.roster, badgeAlways: true },
      { type: "item", to: `${base}/recruit`,  label: "廠商招展",   icon: "send" },
      { type: "item", to: `${base}/import`,   label: "匯入廠商",   icon: "upload" },
    ]},
    { type: "group", label: "攤位 / 文件 / 表單", defaultOpen: true, items: [
      { type: "item", to: `${base}/booths`,      label: "攤位配置",   icon: "building" },
      { type: "item", to: `${base}/notices`,     label: "文件須知",   icon: "document" },
      { type: "item", to: `${base}/forms`,       label: "表單管理",   icon: "clipboard" },
      { type: "item", to: `${base}/form-review`, label: "表單審核",   icon: "shield",   badge: counts.pendingReview },
    ]},
    { type: "group", label: "設備", items: [
      { type: "item", to: `${base}/equipment`, label: "設備申請", icon: "package", badge: counts.equipPending },
    ]},
    { type: "group", label: "通知", items: [
      { type: "item", to: `${base}/pre-event`,       label: "展前通知",     icon: "bell" },
      { type: "item", to: `${base}/email-templates`, label: "郵件通知模板", icon: "mail" },
    ]},
  ];
}

// 角色色 — 對應 data-role CSS（如果有 var(--role-color) 已定義就吃，沒有用 fallback）
const ROLE_COLOR = {
  "portal-admin":  "#bf5af2",
  "super-admin":   "#0071e3",
  "company-admin": "#5e5ce6",
  "event-manager": "#30d158",
  member:          "#8e8e93",
};

const ROLE_BADGE = {
  "portal-admin":  { bg: "rgba(191,90,242,0.12)", color: "#8e2bd4" },
  "super-admin":   { bg: "rgba(0,113,227,0.12)",  color: "#0050a8" },
  "company-admin": { bg: "rgba(94,92,230,0.12)",  color: "#3f3da8" },
  "event-manager": { bg: "rgba(48,209,88,0.12)",  color: "#1f8a3a" },
  member:          { bg: "rgba(142,142,147,0.18)", color: "#48484a" },
};

// ─────────────────────────────────────────────────────────────────
// 折疊群組
// ─────────────────────────────────────────────────────────────────
const COLLAPSE_KEY = "ex.sidebar.collapse";

function useCollapsedGroups() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(COLLAPSE_KEY) || "[]")); }
    catch { return new Set(); }
  });
  const toggle = (key) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      localStorage.setItem(COLLAPSE_KEY, JSON.stringify([...next]));
      return next;
    });
  };
  return { collapsed, toggle };
}

// ─────────────────────────────────────────────────────────────────
// 渲染 menu items / groups
// ─────────────────────────────────────────────────────────────────
function MenuItems({ items, location, collapsed, toggle, onNav }) {
  return items.map((it, idx) => {
    if (it.type === "group") {
      const isCollapsed = collapsed.has(it.label) && !it.defaultOpen ? true
                        : collapsed.has(it.label) ? true : false;
      // 群組內是否有 active item → 群組 header 高亮
      const hasActive = it.items.some((sub) => location.pathname.startsWith(sub.to));
      return (
        <div key={`g-${idx}`} className="mb-1">
          <button
            onClick={() => toggle(it.label)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[10px] font-display font-semibold uppercase tracking-[0.12em] transition-colors"
            style={{
              color: hasActive ? "var(--role-color, #5e5ce6)" : "var(--text-tertiary)",
            }}
          >
            <span>{it.label}</span>
            <Icon
              name={isCollapsed ? "chevron_right" : "chevron_down"}
              className="icon w-3.5 h-3.5"
            />
          </button>
          {!isCollapsed && (
            <div className="space-y-0.5 mt-0.5">
              {it.items.map((sub) => (
                <NavItem key={sub.to} item={sub} onNav={onNav} />
              ))}
            </div>
          )}
        </div>
      );
    }
    return <NavItem key={it.to} item={it} onNav={onNav} />;
  });
}

function NavItem({ item, onNav }) {
  // badge 顯示規則：badgeAlways=true 永遠顯示；否則只有 > 0 才顯示
  const showBadge = item.badgeAlways || (item.badge != null && item.badge > 0);
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNav}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors`
      }
      style={({ isActive }) => ({
        background: isActive ? "var(--bg-elevated)" : "transparent",
        color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
        fontWeight: isActive ? 600 : 400,
        boxShadow: isActive ? "var(--shadow-sm)" : undefined,
        borderLeft: isActive ? "2px solid var(--role-color, #5e5ce6)" : "2px solid transparent",
      })}
    >
      <Icon name={item.icon || "home"} className="icon w-4 h-4 shrink-0" />
      <span className="truncate flex-1">{item.label}</span>
      {showBadge && (
        <span className="shrink-0 min-w-[20px] h-[18px] px-1.5 rounded-full text-[11px] font-display font-semibold grid place-items-center"
          style={{
            background: item.badgeAlways ? "var(--bg-tinted)" : "rgba(255,159,10,0.15)",
            color: item.badgeAlways ? "var(--text-tertiary)" : "var(--orange)",
          }}>
          {item.badge}
        </span>
      )}
    </NavLink>
  );
}

// ─────────────────────────────────────────────────────────────────
// User avatar + dropdown
// ─────────────────────────────────────────────────────────────────
function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const badge = ROLE_BADGE[user.role] || ROLE_BADGE.member;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors"
        style={{
          background: open ? "var(--bg-elevated)" : "transparent",
          border: "1px solid transparent",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-tinted)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = open ? "var(--bg-elevated)" : "transparent"; }}
      >
        <div className="w-9 h-9 rounded-full grid place-items-center text-white font-bold text-[13px] shrink-0"
          style={{ background: ROLE_COLOR[user.role] || "#5e5ce6" }}>
          {user.name?.[0] || "?"}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[13px] font-semibold truncate">{user.name}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{ background: badge.bg, color: badge.color }}>
              {ROLE_NAMES[user.role]}
            </span>
          </div>
        </div>
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 right-0 rounded-xl py-1 z-50"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--separator)", boxShadow: "var(--shadow-lg)" }}>
          <div className="px-3 py-2 border-b" style={{ borderColor: "var(--separator)" }}>
            <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>{user.email}</div>
            {user.title && <div className="text-[12px] mt-0.5">{user.title}</div>}
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-[var(--bg-tinted)]"
            style={{ color: "var(--red)" }}
          >
            <Icon name="log_out" className="icon w-4 h-4" />
            登出
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// AppLayout 主元件
// ─────────────────────────────────────────────────────────────────
export function AppLayout({ children }) {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const { events } = useData();
  const { collapsed, toggle } = useCollapsedGroups();
  const [mobileOpen, setMobileOpen] = useState(false);

  const cfg = user ? MENU[user.role] : null;
  const vendors = useData((s) => s.vendors);
  const formSubmissions = useData((s) => s.formSubmissions);
  const equipmentRequests = useData((s) => s.equipmentRequests);

  // 偵測活動 context
  const eventMatch = location.pathname.match(/^\/event\/([^/]+)\//);
  const activeEventId = eventMatch?.[1];
  const activeEvent = activeEventId ? events.find((e) => e.id === activeEventId) : null;

  // 活動內 sidebar 的動態 badge counts
  const counts = useMemo(() => {
    if (!activeEventId) return {};
    const evVendors = vendors.filter((v) => v.eventId === activeEventId);
    return {
      roster: evVendors.filter((v) => v.confirmStatus === "confirmed").length,
      pendingImport: evVendors.filter((v) => v.status === "registered" && !v.confirmStatus).length,
      pendingReview: formSubmissions.filter((s) =>
        s.eventId === activeEventId && (s.status === "submitted" || s.status === "pending_fee_review")
      ).length,
      equipPending: equipmentRequests.filter((r) =>
        r.eventId === activeEventId && r.status === "submitted"
      ).length,
    };
  }, [activeEventId, vendors, formSubmissions, equipmentRequests]);

  // event-manager 進入活動 → 顯示活動子選單
  const inEvent = user?.role === "event-manager" && activeEventId && activeEvent;
  const menuItems = useMemo(() => {
    if (inEvent) return getEventMenu(activeEventId, counts);
    return cfg?.items || [];
  }, [inEvent, activeEventId, cfg, counts]);

  // 群組初始展開狀態：defaultOpen 不在 collapsed 才算展開
  // （第一次進來時若 group.defaultOpen=true，且 user 沒手動折過，就展開）
  useEffect(() => {
    menuItems.forEach((it) => {
      if (it.type === "group" && it.defaultOpen && !collapsed.has(it.label)) {
        // 不需 set，因為 default 是展開
      }
    });
  }, [menuItems]); // eslint-disable-line

  // bootstrap data
  const bootstrap = useData((s) => s.bootstrap);
  useEffect(() => {
    if (user && events.length === 0) bootstrap(user);
  }, [user]); // eslint-disable-line

  useEffect(() => {
    if (cfg) document.documentElement.setAttribute("data-role", cfg.dataRole);
    return () => document.documentElement.removeAttribute("data-role");
  }, [cfg]);

  if (!user) {
    return <Navigate to="/portal-login" replace state={{ from: location.pathname }} />;
  }

  const handleLogout = () => {
    logout();
    toast.info("已登出");
    navigate("/portal-login", { replace: true });
  };

  const onNavClick = () => setMobileOpen(false);

  return (
    <div className="min-h-screen">
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 p-2 rounded-lg lg:hidden"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--separator)" }}
      >
        <Icon name="menu_burger" className="icon w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[260px] flex flex-col z-50 py-4 transition-transform lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{
          background: "var(--bg-sidebar)",
          borderRight: "1px solid var(--separator)",
        }}
      >
        {/* Logo / 頂部 */}
        <Link to={cfg?.items?.[0]?.to || "/"}
          className="flex items-center gap-3 px-5 pb-4 mb-2 no-underline"
          style={{ borderBottom: "1px solid var(--separator)" }}>
          <div className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
            style={{ background: "var(--role-grad, linear-gradient(135deg,#5e5ce6,#bf5af2))", boxShadow: "var(--shadow-sm)" }}>
            <Icon name="layers" />
            <style>{`aside .w-9 .icon { stroke: white; width: 18px; height: 18px; }`}</style>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-[15px] tracking-tight truncate" style={{ color: "var(--text-primary)" }}>
              Exhibition OS
            </span>
            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              {ROLE_NAMES[user.role]}
            </span>
          </div>
          {/* mobile close */}
          <button onClick={(e) => { e.preventDefault(); setMobileOpen(false); }}
            className="ml-auto p-1 lg:hidden">
            <Icon name="x_close" className="icon w-4 h-4" />
          </button>
        </Link>

        {/* Breadcrumb（活動 context）*/}
        {inEvent && (
          <div className="mx-3 mb-3 p-2.5 rounded-lg"
            style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}>
            <Link to="/event"
              className="flex items-center gap-1 text-[11px] mb-1 no-underline hover:opacity-80"
              style={{ color: "var(--text-tertiary)" }}>
              <Icon name="arrow_left" className="icon w-3 h-3" />
              我的活動
            </Link>
            <div className="text-[13px] font-semibold leading-tight truncate" title={activeEvent.name}>
              {activeEvent.name}
            </div>
            <div className="text-[10px] font-display mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              {activeEvent.location || "—"}
            </div>
          </div>
        )}

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <MenuItems items={menuItems} location={location} collapsed={collapsed} toggle={toggle} onNav={onNavClick} />
        </nav>

        {/* User dropdown */}
        <div className="px-3 pt-3" style={{ borderTop: "1px solid var(--separator)" }}>
          <UserMenu user={user} onLogout={handleLogout} />
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-[260px] min-h-screen min-w-0">
        <header
          className="h-16 sticky top-0 z-30 flex items-center justify-between px-6 lg:px-10"
          style={{
            background: "rgba(245, 245, 247, 0.85)",
            backdropFilter: "saturate(180%) blur(20px)",
            WebkitBackdropFilter: "saturate(180%) blur(20px)",
            borderBottom: "1px solid var(--separator)",
          }}
        >
          <div className="flex items-center gap-2.5 text-[13px] font-display ml-12 lg:ml-0" style={{ color: "var(--text-secondary)" }}>
            <Link to={cfg?.items?.[0]?.to || "/"} className="no-underline" style={{ color: "inherit" }}>
              Exhibition OS
            </Link>
            <span>/</span>
            <strong className="font-semibold" style={{ color: "var(--text-primary)" }}>
              {ROLE_NAMES[user.role]}
            </strong>
            {inEvent && (
              <>
                <span>/</span>
                <span className="truncate max-w-[280px]">{activeEvent.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-display font-medium"
              style={{ background: "rgba(48, 209, 88, 0.1)", color: "#1f8a3a" }}>
              <span className="live-dot" />
              Live
            </span>
          </div>
        </header>
        <div className="px-6 lg:px-10 pt-8 pb-20 max-w-[1280px]">{children}</div>
      </main>
    </div>
  );
}
