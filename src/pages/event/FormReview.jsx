import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useData } from "../../store/data";
import { SceneHead, Panel, DataRow, StatGrid } from "../../components/Scene";
import { Modal } from "../../components/Modal";
import { toast } from "../../store/toast";

// 表單繳交審核頁 — 管理員側；對應 PDF p15 三態確認
// 廠商繳交 → 管理員審核 → 通過 → 廠商確認 → 管理員可觸發重新確認
export default function FormReview() {
  const { eventId } = useParams();
  const { eventForms, formSubmissions, vendors, events, reviewFormSubmission, triggerReconfirm } = useData();
  const event = events.find((e) => e.id === eventId);

  const forms = (eventForms || []).filter((f) => f.eventId === eventId);
  const subs = (formSubmissions || []).filter((s) => s.eventId === eventId);
  const eventVendors = vendors.filter((v) => v.eventId === eventId);

  const [filter, setFilter] = useState("all"); // all / submitted / pending_fee_review / approved / rejected
  const [reviewOpen, setReviewOpen] = useState(false);
  const [target, setTarget] = useState(null);
  const [decision, setDecision] = useState({ status: "approved", feedback: "" });

  const filtered = filter === "all" ? subs : subs.filter((s) => s.status === filter);

  const stats = useMemo(() => {
    return [
      { label: "總繳交", value: subs.length },
      { label: "待審",   value: subs.filter((s) => s.status === "submitted" || s.status === "pending_fee_review").length, deltaColor: "var(--orange)" },
      { label: "通過",   value: subs.filter((s) => s.status === "approved").length, deltaColor: "var(--green)" },
      { label: "退回",   value: subs.filter((s) => s.status === "rejected").length, deltaColor: "var(--red)" },
    ];
  }, [subs]);

  const openReview = (s) => {
    setTarget(s);
    setDecision({ status: "approved", feedback: "" });
    setReviewOpen(true);
  };

  const confirmReview = () => {
    if (decision.status === "rejected" && !decision.feedback.trim()) {
      toast.error("退回時請填寫原因");
      return;
    }
    reviewFormSubmission(target.id, decision.status, decision.feedback, "活動管理員");
    toast.success(decision.status === "approved" ? "已核可" : "已退回");
    setReviewOpen(false);
  };

  const triggerReconfirmAction = (s) => {
    if (!confirm("觸發重新確認會要求廠商重新檢視此項目，確定執行？")) return;
    triggerReconfirm(s.id);
    toast.success("已通知廠商重新確認");
  };

  const statusLabel = (s) => ({
    submitted:          { label: "待審核",    cls: "chip-blue" },
    pending_fee_review: { label: "費用待審",  cls: "chip-orange" },
    approved:           { label: "已通過",    cls: "chip-green" },
    rejected:           { label: "已退回",    cls: "chip-red" },
  }[s] || { label: s, cls: "" });

  return (
    <>
      <SceneHead
        tag="FORM REVIEW · 表單審核"
        title={`${event?.name || "—"} 表單繳交審核`}
        desc="審核廠商繳交的表單；可核可、退回或觸發廠商重新確認（三態確認機制）。"
      />

      <StatGrid stats={stats} />

      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { k: "all",                label: `全部 ${subs.length}` },
          { k: "submitted",          label: `待審 ${subs.filter(s => s.status === "submitted").length}` },
          { k: "pending_fee_review", label: `費用待審 ${subs.filter(s => s.status === "pending_fee_review").length}` },
          { k: "approved",           label: `通過 ${subs.filter(s => s.status === "approved").length}` },
          { k: "rejected",           label: `退回 ${subs.filter(s => s.status === "rejected").length}` },
        ].map((t) => (
          <button key={t.k} className={`btn ${filter === t.k ? "btn-primary" : ""}`} onClick={() => setFilter(t.k)}>
            {t.label}
          </button>
        ))}
      </div>

      <Panel>
        <DataRow
          header
          cols={[
            { content: "廠商 / 表單",     w: "2fr" },
            { content: "繳交",           w: "1fr" },
            { content: "狀態",           w: "1fr" },
            { content: "費用 / 匯款",    w: "1fr" },
            { content: "廠商確認",       w: "1.2fr" },
            { content: "動作",           w: "1.6fr" },
          ]}
        />
        {filtered.map((s) => {
          const vendor = eventVendors.find((v) => v.id === s.vendorId);
          const form = forms.find((f) => f.id === s.formId);
          const st = statusLabel(s.status);
          return (
            <DataRow
              key={s.id}
              cols={[
                {
                  content: (
                    <div>
                      <div className="font-medium text-ink-primary">{vendor?.company || "—"}</div>
                      <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                        📄 {form?.name || "—"}
                        {s.uploadedByRole === "decorator" && <span className="chip chip-purple ml-2" style={{ fontSize: 10 }}>裝潢商代上傳</span>}
                      </div>
                    </div>
                  ),
                  w: "2fr",
                },
                {
                  content: (
                    <div className="text-[12px]">
                      <div>{s.submittedAt}</div>
                      <div style={{ color: "var(--text-tertiary)" }}>📎 {s.fileName}</div>
                    </div>
                  ),
                  w: "1fr",
                },
                { content: <span className={`chip ${st.cls}`}>{st.label}</span>, w: "1fr" },
                {
                  content: s.fee ? (
                    <div className="text-[12px]">
                      <div className="font-medium">NT$ {s.fee.toLocaleString()}</div>
                      {s.paymentProofFileName && <div style={{ color: "var(--text-tertiary)" }}>💰 {s.paymentProofFileName}</div>}
                    </div>
                  ) : <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>—</span>,
                  w: "1fr",
                },
                {
                  content: s.status === "approved" ? (
                    s.vendorConfirmed ? (
                      <div className="text-[12px]">
                        <span className="chip chip-green">✓ 已確認</span>
                        <div className="mt-1" style={{ color: "var(--text-tertiary)" }}>{s.vendorConfirmedAt}</div>
                      </div>
                    ) : s.needsReconfirm ? (
                      <span className="chip chip-orange">待重新確認</span>
                    ) : (
                      <span className="chip">待廠商確認</span>
                    )
                  ) : (
                    <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>—</span>
                  ),
                  w: "1.2fr",
                },
                {
                  content: (
                    <div className="flex gap-1 flex-wrap">
                      {(s.status === "submitted" || s.status === "pending_fee_review") && (
                        <button className="btn btn-sm btn-primary" onClick={() => openReview(s)}>審核</button>
                      )}
                      {s.status === "approved" && s.vendorConfirmed && (
                        <button className="btn btn-sm" onClick={() => triggerReconfirmAction(s)} style={{ color: "var(--orange)" }}>
                          ↺ 觸發重新確認
                        </button>
                      )}
                      {s.status === "rejected" && s.feedback && (
                        <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }} title={s.feedback}>
                          退回原因：{s.feedback.slice(0, 20)}{s.feedback.length > 20 ? "…" : ""}
                        </span>
                      )}
                    </div>
                  ),
                  w: "1.6fr",
                },
              ]}
            />
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            沒有符合條件的繳交紀錄
          </div>
        )}
      </Panel>

      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title="審核繳交" width="560px">
        {target && (
          <>
            <div className="mb-4 p-4 rounded-xl" style={{ background: "var(--bg-tinted)" }}>
              <div className="text-[12px] font-semibold mb-2" style={{ color: "var(--text-tertiary)" }}>審核項目</div>
              <div className="font-medium mb-1">
                {eventVendors.find(v => v.id === target.vendorId)?.company} — {forms.find(f => f.id === target.formId)?.name}
              </div>
              <div className="text-[13px]">
                📎 {target.fileName}
                {target.fee && <span className="ml-3">💰 NT$ {target.fee.toLocaleString()}</span>}
              </div>
              {target.paymentProofFileName && (
                <div className="text-[12px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                  匯款單：{target.paymentProofFileName}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                className="p-4 rounded-xl text-left"
                style={{
                  background: decision.status === "approved" ? "rgba(48,209,88,0.1)" : "var(--bg-tinted)",
                  border: `2px solid ${decision.status === "approved" ? "var(--green)" : "transparent"}`,
                }}
                onClick={() => setDecision({ ...decision, status: "approved" })}
              >
                <div className="text-2xl mb-1">✅</div>
                <div className="font-semibold">核可通過</div>
              </button>
              <button
                className="p-4 rounded-xl text-left"
                style={{
                  background: decision.status === "rejected" ? "rgba(255,59,48,0.08)" : "var(--bg-tinted)",
                  border: `2px solid ${decision.status === "rejected" ? "var(--red)" : "transparent"}`,
                }}
                onClick={() => setDecision({ ...decision, status: "rejected" })}
              >
                <div className="text-2xl mb-1">🔄</div>
                <div className="font-semibold">退回修正</div>
              </button>
            </div>

            <label className="block text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
              {decision.status === "rejected" ? "退回原因（必填）" : "審核備註（選填）"}
            </label>
            <textarea
              className="input"
              rows={4}
              value={decision.feedback}
              onChange={(e) => setDecision({ ...decision, feedback: e.target.value })}
              placeholder={decision.status === "rejected" ? "請詳述需修正之處…" : "內部記錄用"}
            />

            <div className="flex justify-end gap-2 mt-4">
              <button className="btn" onClick={() => setReviewOpen(false)}>取消</button>
              <button className="btn btn-primary" onClick={confirmReview}>
                確認{decision.status === "approved" ? "核可" : "退回"}
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
