// 共用的 scene 標題與面板元件
import { Icon } from "./Icon";

export function SceneHead({ tag, title, desc }) {
  return (
    <div className="mb-8">
      <div className="scene-tag">{tag}</div>
      <h1 className="scene-title text-ink-primary">{title}</h1>
      <p className="scene-desc">{desc}</p>
    </div>
  );
}

export function Panel({ title, action, children, className = "" }) {
  return (
    <div className={`panel mb-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-5">
          {title && (
            <h3 className="text-[17px] font-semibold text-ink-primary tracking-tight">
              {title}
            </h3>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatGrid({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((s) => (
        <div key={s.label} className="panel !p-5">
          <div
            className="text-[11px] font-display font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--text-tertiary)" }}
          >
            {s.label}
          </div>
          <div className="text-3xl font-bold text-ink-primary tracking-tight">
            {s.value}
          </div>
          {s.delta && (
            <div className="text-[12px] font-display mt-1" style={{ color: s.deltaColor || "var(--green)" }}>
              {s.delta}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function DataRow({ cols, header = false }) {
  return (
    <div
      className={`grid gap-4 px-4 py-3 items-center text-[13px] ${
        header ? "font-display font-semibold uppercase tracking-wider text-[11px]" : ""
      }`}
      style={{
        gridTemplateColumns: cols.map((c) => c.w || "1fr").join(" "),
        borderBottom: "1px solid var(--separator)",
        color: header ? "var(--text-tertiary)" : "var(--text-primary)",
      }}
    >
      {cols.map((c, i) => (
        <div key={i} className="min-w-0 truncate">
          {c.content}
        </div>
      ))}
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <div className="mb-5">
      <label className="block text-[12px] font-display font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
        {label}
      </label>
      {children}
      {hint && (
        <div className="text-[12px] mt-1.5" style={{ color: "var(--text-tertiary)" }}>
          {hint}
        </div>
      )}
    </div>
  );
}

export function Input({ value, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      defaultValue={value}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all"
      style={{
        background: "var(--bg-tinted)",
        border: "1px solid var(--separator)",
      }}
    />
  );
}

export function Timeline({ items }) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-3 top-2 bottom-2 w-px" style={{ background: "var(--separator)" }} />
      {items.map((it, i) => (
        <div key={i} className="relative mb-5 last:mb-0">
          <div
            className="absolute -left-[26px] top-1 w-3 h-3 rounded-full"
            style={{
              background: it.done ? "var(--green)" : it.active ? "var(--role-color)" : "var(--separator)",
              boxShadow: it.active ? "0 0 0 4px rgba(0,113,227,0.15)" : undefined,
            }}
          />
          <div className="text-[13px] font-medium text-ink-primary">{it.title}</div>
          <div className="text-[12px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            {it.meta}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CheckIcon() {
  return <Icon name="check" className="icon w-4 h-4" />;
}
