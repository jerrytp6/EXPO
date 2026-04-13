import { useEffect } from "react";

export function Modal({ open, onClose, title, children, footer, width = "520px" }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full scene-in"
        style={{ maxWidth: width, border: "1px solid var(--separator)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="px-6 py-5" style={{ borderBottom: "1px solid var(--separator)" }}>
            <h3 className="text-[17px] font-semibold tracking-tight">{title}</h3>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="px-6 py-4 flex justify-end gap-2" style={{ borderTop: "1px solid var(--separator)" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
