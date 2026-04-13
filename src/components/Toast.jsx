import { useToast } from "../store/toast";
import { Icon } from "./Icon";

const STYLES = {
  success: { bg: "rgba(48,209,88,0.12)", color: "#1f8a3a", icon: "check" },
  error:   { bg: "rgba(255,59,48,0.12)", color: "#b8241c", icon: "shield" },
  info:    { bg: "rgba(0,113,227,0.12)", color: "#0058b8", icon: "sparkles" },
};

export function ToastContainer() {
  const toasts = useToast((s) => s.toasts);
  const remove = useToast((s) => s.remove);
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => {
        const s = STYLES[t.type] || STYLES.info;
        return (
          <div
            key={t.id}
            onClick={() => remove(t.id)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg cursor-pointer scene-in"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--separator)" }}
          >
            <div className="w-7 h-7 rounded-full grid place-items-center flex-shrink-0" style={{ background: s.bg }}>
              <Icon name={s.icon} className="icon w-4 h-4" />
              <style>{`div[style*="${s.bg}"] .icon { stroke: ${s.color}; }`}</style>
            </div>
            <div className="text-[13px] font-medium text-ink-primary">{t.message}</div>
          </div>
        );
      })}
    </div>
  );
}
