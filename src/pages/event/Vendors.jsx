import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { useData } from "../../store/data";
import { SceneHead, Panel, DataRow, StatGrid } from "../../components/Scene";
import { Icon } from "../../components/Icon";
import { toast } from "../../store/toast";

const VENDOR_STATUS = {
  pending:    { label: "未寄送",     cls: "badge-gray" },
  invited:    { label: "已邀請",     cls: "badge-blue" },
  clicked:    { label: "已點擊連結", cls: "badge-orange" },
  registered: { label: "已報名",     cls: "badge-green" },
  declined:   { label: "已婉拒",     cls: "badge-gray" },
};

export default function Vendors() {
  const { eventId } = useParams();
  const user = useAuth((s) => s.user);
  const { events, vendors, confirmVendors } = useData();
  const event = events.find((e) => e.id === eventId);

  const [tab, setTab] = useState("roster"); // roster(參展名單) | pending(待匯入) | all(全部)
  const [selected, setSelected] = useState(new Set());

  if (!event) return <Navigate to="/event" replace />;

  const list = vendors.filter((v) => v.eventId === eventId);
  const roster = list.filter((v) => v.confirmStatus === "confirmed");
  const pendingConfirm = list.filter((v) => v.status === "registered" && !v.confirmStatus);

  const filtered =
    tab === "roster" ? roster :
    tab === "pending" ? pendingConfirm :
    list;

  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((v) => v.id)));
  };

  const addToRoster = (ids) => {
    confirmVendors(ids, "confirmed", user.name, "");
    toast.success(`已加入參展名單：${ids.length} 家`);
    setSelected(new Set());
    setTab("roster");
  };

  const removeFromRoster = (ids) => {
    confirmVendors(ids, null, null, "");
    toast.info(`已從參展名單移除：${ids.length} 家`);
    setSelected(new Set());
  };

  // CSV 匯出
  const exportCSV = () => {
    if (roster.length === 0) { toast.error("參展名單為空"); return; }
    const header = "公司名稱,統編,聯絡人,Email,電話,展位編號,確認日期";
    const rows = roster.map((v) =>
      [v.company, v.taxId, v.contact, v.email, v.phone, v.boothNumber || "", v.confirmedAt || ""].join(",")
    );
    const blob = new Blob(["\uFEFF" + [header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${event.name}-參展名單.csv`;
    a.click();
    toast.success(`已匯出 ${roster.length} 筆`);
  };

  // 在 pending tab 中，selected 裡未確認的
  const selectedPending = Array.from(selected).filter((id) => pendingConfirm.find((v) => v.id === id));
  // 在 roster tab 中，selected 裡已確認的
  const selectedRoster = Array.from(selected).filter((id) => roster.find((v) => v.id === id));

  return (
    <>
      <SceneHead
        tag={`EVENT · ${event.name}`}
        title="廠商管理"
        desc={`${event.startDate} · ${event.location}`}
      />

      <StatGrid
        stats={[
          { label: "總廠商數", value: list.length },
          { label: "已報名", value: list.filter((v) => v.status === "registered").length },
          { label: "參展名單", value: roster.length },
          { label: "待匯入", value: pendingConfirm.length, deltaColor: pendingConfirm.length > 0 ? "var(--orange)" : undefined, delta: pendingConfirm.length > 0 ? "需處理" : "—" },
        ]}
      />

      {/* Tab 切換 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(0,0,0,0.05)", display: "inline-flex" }}>
          {[
            { id: "roster",  label: `參展名單 (${roster.length})` },
            { id: "pending", label: `待匯入 (${pendingConfirm.length})` },
            { id: "all",     label: `全部 (${list.length})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSelected(new Set()); }}
              className="px-4 py-2 rounded-lg text-[13px] font-display font-medium transition-colors"
              style={tab === t.id
                ? { background: "var(--bg-elevated)", color: "var(--text-primary)", boxShadow: "var(--shadow-sm)" }
                : { color: "var(--text-secondary)" }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {tab === "roster" && (
            <button className="btn btn-ghost" onClick={exportCSV}>匯出 CSV</button>
          )}
          <Link to={`/event/${eventId}/import`} className="btn btn-ghost">匯入廠商</Link>
          <Link to={`/event/${eventId}/invite`} className="btn btn-ghost">寄送邀請</Link>
        </div>
      </div>

      {/* 待匯入 tab 的快速操作 */}
      {tab === "pending" && pendingConfirm.length > 0 && (
        <div className="flex items-center gap-3 p-3 mb-4 rounded-xl"
          style={{ background: "rgba(0,113,227,0.06)", border: "1px solid rgba(0,113,227,0.2)" }}>
          <Icon name="sparkles" className="icon w-4 h-4" style={{ stroke: "var(--blue)" }} />
          <span className="text-[13px]" style={{ color: "var(--blue)" }}>
            {selectedPending.length > 0
              ? `已選 ${selectedPending.length} 家`
              : `${pendingConfirm.length} 家已報名廠商待加入參展名單`}
          </span>
          <div className="flex gap-2 ml-auto">
            {selectedPending.length > 0 ? (
              <button className="btn btn-primary !py-1.5 !text-xs" onClick={() => addToRoster(selectedPending)}>
                加入參展名單
              </button>
            ) : (
              <button className="btn btn-primary !py-1.5 !text-xs"
                onClick={() => addToRoster(pendingConfirm.map((v) => v.id))}>
                全部加入參展名單
              </button>
            )}
          </div>
        </div>
      )}

      {/* roster tab 的批次移除 */}
      {tab === "roster" && selectedRoster.length > 0 && (
        <div className="flex items-center gap-3 p-3 mb-4 rounded-xl"
          style={{ background: "rgba(255,59,48,0.06)", border: "1px solid rgba(255,59,48,0.2)" }}>
          <span className="text-[13px]" style={{ color: "var(--red)" }}>
            已選 {selectedRoster.length} 家
          </span>
          <button className="btn btn-ghost !py-1.5 !text-xs ml-auto"
            onClick={() => { if (confirm(`確定將 ${selectedRoster.length} 家移出參展名單？`)) removeFromRoster(selectedRoster); }}>
            移出名單
          </button>
        </div>
      )}

      <Panel>
        <DataRow
          header
          cols={[
            { content: (
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={toggleAll} />
                <span>公司 / 統編</span>
              </label>
            ), w: "2.5fr" },
            { content: "聯絡人", w: "1fr" },
            { content: "Email", w: "1.8fr" },
            { content: "展位", w: "0.8fr" },
            { content: tab === "roster" ? "確認日期" : "報名狀態", w: "1fr" },
            { content: "", w: "0.8fr" },
          ]}
        />
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            {tab === "roster" ? "參展名單為空 — 請到「待匯入」將已報名廠商加入" :
             tab === "pending" ? "沒有待匯入的廠商" : "尚無任何廠商"}
          </div>
        ) : filtered.map((v) => {
          const st = VENDOR_STATUS[v.status] || VENDOR_STATUS.pending;
          return (
            <DataRow
              key={v.id}
              cols={[
                {
                  content: (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selected.has(v.id)} onChange={() => toggle(v.id)} />
                      <div>
                        <div className="font-medium">{v.company}</div>
                        <div className="text-[11px] font-display" style={{ color: "var(--text-tertiary)" }}>{v.taxId}</div>
                      </div>
                    </label>
                  ),
                  w: "2.5fr",
                },
                { content: v.contact, w: "1fr" },
                { content: <span className="font-display text-[12px]">{v.email}</span>, w: "1.8fr" },
                { content: <span className="font-display text-[12px]">{v.boothNumber || "—"}</span>, w: "0.8fr" },
                {
                  content: tab === "roster"
                    ? <span className="font-display text-[12px]">{v.confirmedAt || "—"}</span>
                    : <span className={`badge ${st.cls}`}>{st.label}</span>,
                  w: "1fr",
                },
                {
                  content: tab === "pending" ? (
                    <button className="btn btn-primary !py-1 !text-xs" onClick={() => addToRoster([v.id])}>
                      加入名單
                    </button>
                  ) : tab === "roster" ? (
                    <button className="btn btn-ghost !py-1 !text-xs"
                      onClick={() => { if (confirm(`移出「${v.company}」？`)) removeFromRoster([v.id]); }}>
                      移出
                    </button>
                  ) : v.status === "registered" && !v.confirmStatus ? (
                    <button className="btn btn-primary !py-1 !text-xs" onClick={() => addToRoster([v.id])}>
                      加入
                    </button>
                  ) : v.confirmStatus === "confirmed" ? (
                    <span className="badge badge-green">已確認</span>
                  ) : null,
                  w: "0.8fr",
                },
              ]}
            />
          );
        })}
      </Panel>
    </>
  );
}
