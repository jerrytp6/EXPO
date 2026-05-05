import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { useData } from "../../store/data";
import { SceneHead, Panel, DataRow, StatGrid } from "../../components/Scene";
import { toast } from "../../store/toast";
import { api } from "../../lib/api";

// 參展名單頁 — 從 Vendors.jsx 拆出來，獨立顯示已加入名單的廠商
export default function Roster() {
  const { eventId } = useParams();
  const user = useAuth((s) => s.user);
  const { events, vendors, confirmVendors } = useData();
  const event = events.find((e) => e.id === eventId);

  const [selected, setSelected] = useState(new Set());

  if (!event) return <Navigate to="/event" replace />;

  const list = vendors.filter((v) => v.eventId === eventId);
  const roster = list.filter((v) => v.confirmStatus === "confirmed");
  const pendingConfirm = list.filter((v) => v.status === "registered" && !v.confirmStatus);

  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const toggleAll = () => {
    if (selected.size === roster.length) setSelected(new Set());
    else setSelected(new Set(roster.map((v) => v.id)));
  };

  const removeFromRoster = (ids) => {
    confirmVendors(ids, null, null, "");
    toast.info(`已從參展名單移除：${ids.length} 家`);
    setSelected(new Set());
  };

  const exportCSV = async () => {
    if (roster.length === 0) { toast.error("參展名單為空"); return; }
    try {
      await api.download(
        `/vendors/export.csv?eventId=${eventId}&confirmStatus=confirmed`,
        `${event.name}-參展名單.csv`,
      );
      toast.success(`已匯出 ${roster.length} 筆`);
    } catch (err) {
      toast.error(`匯出失敗：${err.body?.error || err.message}`);
    }
  };

  const selectedRoster = Array.from(selected).filter((id) => roster.find((v) => v.id === id));

  return (
    <>
      <SceneHead
        tag={`EVENT · ${event.name}`}
        title="參展名單"
        desc={`${event.startDate} · ${event.location} · 已確認加入的廠商清單`}
      />

      <StatGrid
        stats={[
          { label: "參展名單", value: roster.length },
          { label: "已分配攤位", value: roster.filter((v) => v.boothNumber).length, delta: roster.length ? `${Math.round(roster.filter((v) => v.boothNumber).length / roster.length * 100)}%` : "—" },
          { label: "訂金已收", value: roster.filter((v) => v.depositStatus === "paid").length, deltaColor: "var(--green)" },
          { label: "待匯入", value: pendingConfirm.length, delta: pendingConfirm.length > 0 ? "需處理" : "—", deltaColor: pendingConfirm.length > 0 ? "var(--orange)" : undefined },
        ]}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
          共 <b>{roster.length}</b> 家確認參展
        </div>
        <div className="flex gap-2">
          <Link to={`/event/${eventId}/vendors`} className="btn btn-ghost">廠商管理 →</Link>
          <button className="btn btn-ghost" onClick={exportCSV}>📊 匯出 CSV</button>
        </div>
      </div>

      {selectedRoster.length > 0 && (
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
                  checked={selected.size === roster.length && roster.length > 0}
                  onChange={toggleAll} />
                <span>公司 / 統編</span>
              </label>
            ), w: "2.5fr" },
            { content: "聯絡人", w: "1fr" },
            { content: "Email", w: "1.8fr" },
            { content: "展位", w: "0.8fr" },
            { content: "確認日期", w: "1fr" },
            { content: "", w: "0.8fr" },
          ]}
        />
        {roster.length === 0 ? (
          <div className="py-10 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            參展名單為空 —{" "}
            <Link to={`/event/${eventId}/vendors`} style={{ color: "var(--blue)" }}>到廠商管理 → 待匯入</Link>{" "}
            將已報名廠商加入
          </div>
        ) : roster.map((v) => (
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
              { content: <span className="font-display text-[12px]">{v.confirmedAt?.slice(0, 10) || "—"}</span>, w: "1fr" },
              {
                content: (
                  <button className="btn btn-ghost !py-1 !text-xs"
                    onClick={() => { if (confirm(`移出「${v.company}」？`)) removeFromRoster([v.id]); }}>
                    移出
                  </button>
                ),
                w: "0.8fr",
              },
            ]}
          />
        ))}
      </Panel>
    </>
  );
}
