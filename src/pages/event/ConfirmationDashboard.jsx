import { useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useData } from "../../store/data";
import { SceneHead, Panel, StatGrid, DataRow } from "../../components/Scene";

// G2：廠商確認進度儀表板（PPT slide 15 三態確認）
//   涵蓋三大類資源：notices（須知 ack）/ forms（三態）/ equipment（三態）
//   每位廠商在每個類別的完成度 + 整體統計
export default function ConfirmationDashboard() {
  const { eventId } = useParams();
  const {
    events, vendors,
    eventNotices, noticeAcknowledgments,
    eventForms, formSubmissions,
    equipmentRequests,
  } = useData();
  const event = events.find((e) => e.id === eventId);
  if (!event) return <Navigate to="/event" replace />;

  const [filter, setFilter] = useState("all"); // all / completed / partial / pending

  const eventVendors = useMemo(
    () => vendors.filter((v) => v.eventId === eventId && v.confirmStatus === "confirmed"),
    [vendors, eventId]
  );
  const notices = useMemo(() => eventNotices.filter((n) => n.eventId === eventId && n.requiresAck), [eventNotices, eventId]);
  const forms   = useMemo(() => eventForms.filter((f) => f.eventId === eventId && f.isRequired), [eventForms, eventId]);
  const reqs    = useMemo(() => equipmentRequests.filter((r) => r.eventId === eventId), [equipmentRequests, eventId]);

  // 每廠商各類別進度
  const rows = useMemo(() => {
    return eventVendors.map((v) => {
      // 1) Notices ack
      const requiredNotices = notices.filter((n) => {
        // 裝潢商唯讀 notice 對廠商可能不適用，但廠商也能看到 → 計算
        return true;
      });
      const ackedCount = requiredNotices.filter((n) =>
        noticeAcknowledgments.some((a) => a.vendorId === v.id && a.noticeId === n.id)
      ).length;

      // 2) Forms 三態
      const subsForVendor = formSubmissions.filter((s) => s.vendorId === v.id);
      const formsApplicable = forms.filter((f) => {
        if (!f.showWhen) return true;
        return v[f.showWhen.field] === f.showWhen.value;
      });
      let formsApproved = 0, formsConfirmed = 0, formsReconfirm = 0;
      formsApplicable.forEach((f) => {
        const sub = subsForVendor
          .filter((s) => s.formId === f.id)
          .sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""))[0];
        if (sub?.status === "approved") {
          formsApproved++;
          if (sub.vendorConfirmed && !sub.needsReconfirm) formsConfirmed++;
          if (sub.needsReconfirm) formsReconfirm++;
        }
      });

      // 3) Equipment 三態
      const reqsForVendor = reqs.filter((r) => r.vendorId === v.id);
      let equipApproved = 0, equipConfirmed = 0, equipReconfirm = 0;
      reqsForVendor.forEach((r) => {
        if (r.status === "approved" || r.status === "paid") {
          equipApproved++;
          if (r.vendorConfirmed && !r.needsReconfirm) equipConfirmed++;
          if (r.needsReconfirm) equipReconfirm++;
        }
      });

      // 整體完成度（百分比）
      const total = requiredNotices.length + formsApplicable.length + reqsForVendor.length;
      const done = ackedCount + formsConfirmed + equipConfirmed;
      const pct = total === 0 ? 100 : Math.round((done / total) * 100);

      return {
        vendor: v,
        notices: { total: requiredNotices.length, acked: ackedCount },
        forms: { total: formsApplicable.length, approved: formsApproved, confirmed: formsConfirmed, reconfirm: formsReconfirm },
        equip: { total: reqsForVendor.length, approved: equipApproved, confirmed: equipConfirmed, reconfirm: equipReconfirm },
        pct,
        hasReconfirm: formsReconfirm + equipReconfirm > 0,
      };
    });
  }, [eventVendors, notices, forms, reqs, formSubmissions, noticeAcknowledgments]);

  // 統計
  const stats = useMemo(() => {
    const totalVendors = rows.length;
    const fullyConfirmed = rows.filter((r) => r.pct === 100).length;
    const inProgress = rows.filter((r) => r.pct > 0 && r.pct < 100).length;
    const reconfirmCount = rows.filter((r) => r.hasReconfirm).length;
    return [
      { label: "廠商總數", value: totalVendors },
      { label: "全部已確認", value: fullyConfirmed, delta: totalVendors ? `${Math.round(fullyConfirmed/totalVendors*100)}%` : "—", deltaColor: "var(--green)" },
      { label: "進行中", value: inProgress, deltaColor: "var(--orange)" },
      { label: "待重新確認", value: reconfirmCount, delta: reconfirmCount > 0 ? "需處理" : "—", deltaColor: reconfirmCount > 0 ? "var(--red)" : undefined },
    ];
  }, [rows]);

  const filtered = rows.filter((r) => {
    if (filter === "completed") return r.pct === 100;
    if (filter === "partial") return r.pct > 0 && r.pct < 100;
    if (filter === "pending") return r.pct === 0;
    return true;
  });

  const Bar = ({ value, total, color = "var(--role-color)", warning = false }) => {
    const pct = total === 0 ? 0 : Math.round((value / total) * 100);
    return (
      <div className="text-[12px]">
        <div className="flex items-center justify-between mb-1">
          <span style={{ color: warning ? "var(--red)" : "var(--text-secondary)" }}>{value}/{total}</span>
          <span style={{ color: "var(--text-tertiary)" }} className="font-display">{total > 0 ? `${pct}%` : "—"}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--separator)" }}>
          <div className="h-full" style={{ width: `${pct}%`, background: warning ? "var(--red)" : color, transition: "width 0.3s" }} />
        </div>
      </div>
    );
  };

  return (
    <>
      <SceneHead
        tag={`EVENT · ${event.name}`}
        title="廠商確認進度"
        desc="即時追蹤所有參展廠商的須知確認、表單繳交與設備申請完成度（PPT slide 15 三態確認）。"
      />

      <StatGrid stats={stats} />

      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { k: "all",       label: `全部 ${rows.length}` },
          { k: "completed", label: `已完成 ${rows.filter(r => r.pct === 100).length}` },
          { k: "partial",   label: `進行中 ${rows.filter(r => r.pct > 0 && r.pct < 100).length}` },
          { k: "pending",   label: `未開始 ${rows.filter(r => r.pct === 0).length}` },
        ].map((t) => (
          <button key={t.k} className={`btn ${filter === t.k ? "btn-primary" : ""}`} onClick={() => setFilter(t.k)}>
            {t.label}
          </button>
        ))}
      </div>

      <Panel>
        <DataRow header cols={[
          { content: "廠商", w: "1.6fr" },
          { content: "整體進度", w: "1.4fr" },
          { content: "須知 ack", w: "1.2fr" },
          { content: "表單三態", w: "1.4fr" },
          { content: "設備三態", w: "1.4fr" },
          { content: "重新確認", w: "0.8fr" },
        ]} />
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            沒有符合條件的廠商
          </div>
        ) : filtered.map((r) => (
          <DataRow
            key={r.vendor.id}
            cols={[
              {
                content: (
                  <div>
                    <div className="font-medium text-[14px]">{r.vendor.company}</div>
                    <div className="text-[11px] font-display" style={{ color: "var(--text-tertiary)" }}>
                      {r.vendor.boothNumber || "未分配攤位"} · {r.vendor.contact || "—"}
                    </div>
                  </div>
                ),
                w: "1.6fr",
              },
              {
                content: (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-bold"
                        style={{ color: r.pct === 100 ? "var(--green)" : r.pct >= 50 ? "var(--orange)" : "var(--text-secondary)" }}>
                        {r.pct}%
                      </span>
                      {r.pct === 100 && <span className="chip chip-green">✓ 全部完成</span>}
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--separator)" }}>
                      <div className="h-full" style={{
                        width: `${r.pct}%`,
                        background: r.pct === 100 ? "var(--green)" : r.pct >= 50 ? "var(--orange)" : "var(--role-color)",
                        transition: "width 0.4s",
                      }} />
                    </div>
                  </div>
                ),
                w: "1.4fr",
              },
              { content: <Bar value={r.notices.acked} total={r.notices.total} />, w: "1.2fr" },
              {
                content: (
                  <div className="text-[12px]">
                    <div className="flex justify-between">
                      <span>已通過 <b>{r.forms.approved}</b>/{r.forms.total}</span>
                      <span style={{ color: "var(--green)" }}>確認 {r.forms.confirmed}</span>
                    </div>
                    {r.forms.reconfirm > 0 && (
                      <div className="text-[11px]" style={{ color: "var(--red)" }}>↺ 待重新確認 {r.forms.reconfirm}</div>
                    )}
                  </div>
                ),
                w: "1.4fr",
              },
              {
                content: (
                  <div className="text-[12px]">
                    <div className="flex justify-between">
                      <span>已核可 <b>{r.equip.approved}</b>/{r.equip.total}</span>
                      <span style={{ color: "var(--green)" }}>確認 {r.equip.confirmed}</span>
                    </div>
                    {r.equip.reconfirm > 0 && (
                      <div className="text-[11px]" style={{ color: "var(--red)" }}>↺ 待重新確認 {r.equip.reconfirm}</div>
                    )}
                  </div>
                ),
                w: "1.4fr",
              },
              {
                content: r.hasReconfirm
                  ? <span className="chip chip-red">↺ 需處理</span>
                  : <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>—</span>,
                w: "0.8fr",
              },
            ]}
          />
        ))}
      </Panel>
    </>
  );
}
