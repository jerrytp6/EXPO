import { useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Icon } from "./Icon";

// 廠商與裝潢公司共用的後台版型 — token-based 訪問
export function PortalLayout({
  brand,        // { name, subtitle, role: "vendor" | "decorator" }
  user,         // { name, title, company }
  menu,         // [{ to, label, icon, end }]
  basePath,     // /portal/vendor/:id
  children,
}) {
  const navigate = useNavigate();

  useEffect(() => {
    // vendor → 紫 · decorator → 橘粉；其他 fallback
    document.documentElement.setAttribute(
      "data-role",
      brand.role === "vendor" || brand.role === "decorator" ? brand.role : "company-admin"
    );
    return () => document.documentElement.removeAttribute("data-role");
  }, [brand.role]);

  return (
    <div className="min-h-screen">
      <aside
        className="fixed top-0 left-0 bottom-0 w-[260px] flex flex-col z-40 py-6"
        style={{ background: "var(--bg-sidebar)", borderRight: "1px solid var(--separator)" }}
      >
        <div
          className="flex items-center gap-3 px-5 pb-6 mb-4"
          style={{ borderBottom: "1px solid var(--separator)" }}
        >
          <div
            className="w-9 h-9 rounded-[10px] grid place-items-center"
            style={{ background: "var(--role-grad)", boxShadow: "0 4px 12px rgba(0,0,0,0.18)" }}
          >
            <Icon name={brand.role === "vendor" ? "building" : "sparkles"} />
            <style>{`aside > div:first-child .icon { stroke: white; }`}</style>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-display font-bold text-[15px] tracking-tight truncate">
              {brand.name}
            </span>
            <span className="text-[11px] mt-0.5 truncate" style={{ color: "var(--text-tertiary)" }}>
              {brand.subtitle}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4">
          <div
            className="text-[11px] font-semibold uppercase tracking-widest font-display px-3 pb-2"
            style={{ color: "var(--text-tertiary)" }}
          >
            Menu
          </div>
          <div className="flex flex-col gap-0.5">
            {menu.map((it) => (
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
                      <span
                        className="absolute -left-4 top-1/2 -translate-y-1/2 w-[3px] h-[20px] rounded-r"
                        style={{ background: "var(--role-color)" }}
                      />
                    )}
                    <Icon name={it.icon} className="icon w-[18px] h-[18px]" />
                    <span>{it.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="px-5 pt-4" style={{ borderTop: "1px solid var(--separator)" }}>
          <div
            className="flex items-center gap-3 p-3 rounded-xl mb-2"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--separator)" }}
          >
            <div
              className="w-9 h-9 rounded-full grid place-items-center text-white font-display font-bold text-[13px]"
              style={{ background: "var(--role-grad)" }}
            >
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate">{user.name}</div>
              <div className="text-[11px] font-display truncate" style={{ color: "var(--text-tertiary)" }}>
                {user.title || user.company}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="w-full text-[12px] font-display py-2 rounded-lg transition-colors hover:bg-black/5"
            style={{ color: "var(--text-tertiary)" }}
          >
            離開後台
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
          <div
            className="flex items-center gap-2.5 text-[13px] font-display"
            style={{ color: "var(--text-secondary)" }}
          >
            <Link to={basePath} className="no-underline hover:text-ink-primary" style={{ color: "inherit" }}>
              Exhibition OS
            </Link>
            <span>/</span>
            <strong className="text-ink-primary font-semibold">
              {brand.role === "vendor" ? "參展廠商後台" : "裝潢公司後台"}
            </strong>
          </div>
          <span
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-display font-medium"
            style={{ background: "rgba(48, 209, 88, 0.1)", color: "#1f8a3a" }}
          >
            <span className="live-dot" />
            Live
          </span>
        </header>
        <div className="px-10 pt-8 pb-20 max-w-[1280px]">{children}</div>
      </main>
    </div>
  );
}
