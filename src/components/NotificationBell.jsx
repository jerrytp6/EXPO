import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getToken } from "../lib/api";
import { Icon } from "./Icon";

function timeAgo(ts) {
  const t = typeof ts === "number" ? ts : new Date(ts).getTime();
  const sec = Math.floor((Date.now() - t) / 1000);
  if (sec < 60) return `${sec}s 前`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} 分鐘前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小時前`;
  return `${Math.floor(hr / 24)} 天前`;
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const dropdownRef = useRef(null);

  const refresh = async () => {
    try {
      const r = await api.get("/notifications");
      setItems(r.items);
      setUnread(r.unreadCount);
    } catch { /* silent */ }
  };

  useEffect(() => {
    refresh();
    // SSE 即時推（複用 /audit/stream，多了 event:notification）
    const token = getToken();
    if (!token) return;
    const es = new EventSource(`/api/audit/stream?token=${encodeURIComponent(token)}`);
    es.addEventListener("notification", (ev) => {
      try {
        const n = JSON.parse(ev.data);
        setItems((prev) => [n, ...prev].slice(0, 30));
        setUnread((u) => u + 1);
      } catch {}
    });
    return () => es.close();
  }, []);

  // 點外面關閉
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const markRead = async (id) => {
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
    setUnread((u) => Math.max(0, u - 1));
    api.post(`/notifications/${id}/read`).catch(() => {});
  };

  const markAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
    setUnread(0);
    api.post("/notifications/mark-all-read").catch(() => {});
  };

  const click = (n) => {
    if (!n.readAt) markRead(n.id);
    if (n.link) {
      navigate(n.link);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg transition-colors"
        style={{ background: open ? "var(--bg-tinted)" : "transparent" }}
        title="通知"
      >
        <Icon name="bell" className="icon w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white grid place-items-center"
            style={{ background: "var(--red)" }}>
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px] rounded-2xl z-50"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--separator)", boxShadow: "var(--shadow-lg)" }}>
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--separator)" }}>
            <span className="font-semibold">通知 {unread > 0 && <span className="ml-1 text-[12px]" style={{ color: "var(--red)" }}>({unread} 未讀)</span>}</span>
            {unread > 0 && (
              <button onClick={markAll} className="text-[12px]" style={{ color: "var(--blue)" }}>全部標為已讀</button>
            )}
          </div>
          <div className="max-h-[480px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-12 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                尚無通知
              </div>
            ) : items.map((n) => (
              <button
                key={n.id}
                onClick={() => click(n)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[var(--bg-tinted)] transition-colors"
                style={{ borderBottom: "1px solid var(--separator)", background: !n.readAt ? "rgba(0,113,227,0.04)" : undefined }}
              >
                {!n.readAt && (
                  <span className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ background: "var(--blue)" }} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate">{n.title}</div>
                  {n.body && (
                    <div className="text-[12px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                      {n.body}
                    </div>
                  )}
                  <div className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                    {timeAgo(n.createdAt)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
