import { useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { useData } from "../../store/data";
import { SceneHead, Panel, StatGrid, Field } from "../../components/Scene";
import { Modal } from "../../components/Modal";
import { Icon } from "../../components/Icon";
import { toast } from "../../store/toast";

const STATUS_CFG = {
  none:      { label: "未繳",   cls: "bg-black/5 text-ink-tertiary",   icon: "—" },
  submitted: { label: "已繳待審", cls: "bg-blue-50 text-blue-600",     icon: "📄" },
  approved:  { label: "已審核", cls: "bg-green-50 text-green-700",     icon: "✓" },
  rejected:  { label: "退回",   cls: "bg-orange-50 text-orange-600",   icon: "✗" },
  overdue:   { label: "已逾期", cls: "bg-red-50 text-red-600",         icon: "!" },
};

export default function SubmissionOverview() {
  const { eventId } = useParams();
  const user = useAuth((s) => s.user);
  const {
    events,
    vendors,
    submissions,
    submissionLogs,
    reviewSubmission,
    sendReminder,
    getEventItems,
  } = useData();

  const event = events.find((e) => e.id === eventId);
  if (!event) return <Navigate to="/event" replace />;

  const items = getEventItems(eventId);
  const registeredVendors = vendors.filter((v) => v.eventId === eventId && v.status === "registered");

  const [filter, setFilter] = useState("all"); // all | missing | overdue | pending_review
  const [reviewModal, setReviewModal] = useState(null); // { submission, item, vendor }
  const [feedback, setFeedback] = useState("");
  const [logModal, setLogModal] = useState(null); // submissionId
  const [reminderVendors, setReminderVendors] = useState(new Set());
  const [reminderConfirmOpen, setReminderConfirmOpen] = useState(false);

  // 取得某廠商某項目的繳交狀態
  const getStatus = (vendorId, itemId) => {
    const sub = submissions.find(
      (s) => s.eventId === eventId && s.vendorId === vendorId && s.itemId === itemId
    );
    if (!sub) {
      const item = items.find((i) => i.id === itemId);
      if (item?.deadline && new Date(item.deadline) < new Date()) return { status: "overdue", sub: null };
      return { status: "none", sub: null };
    }
    return { status: sub.status, sub };
  };

  // 統計
  const totalCells = registeredVendors.length * items.filter((i) => i.required).length;
  const approvedCells = registeredVendors.reduce((sum, v) =>
    sum + items.filter((i) => i.required).filter((i) => getStatus(v.id, i.id).status === "approved").length,
    0
  );
  const pendingReview = submissions.filter((s) => s.eventId === eventId && s.status === "submitted").length;
  const overdueCells = registeredVendors.reduce((sum, v) =>
    sum + items.filter((i) => i.required).filter((i) => getStatus(v.id, i.id).status === "overdue" || getStatus(v.id, i.id).status === "none").length,
    0
  );

  // 過濾
  const filteredVendors = registeredVendors.filter((v) => {
    if (filter === "all") return true;
    if (filter === "missing") return items.some((i) => i.required && ["none", "overdue"].includes(getStatus(v.id, i.id).status));
    if (filter === "overdue") return items.some((i) => getStatus(v.id, i.id).status === "overdue");
    if (filter === "pending_review") return items.some((i) => getStatus(v.id, i.id).status === "submitted");
    return true;
  });

  const doReview = (status) => {
    if (!reviewModal) return;
    reviewSubmission(reviewModal.sub.id, status, feedback, user.name);
    toast.success(status === "approved" ? "已核准" : "已退回補件");
    setReviewModal(null);
    setFeedback("");
  };

  const toggleReminder = (vendorId) => {
    const next = new Set(reminderVendors);
    next.has(vendorId) ? next.delete(vendorId) : next.add(vendorId);
    setReminderVendors(next);
  };

  // 催繳明細（用於確認 Modal）
  const reminderDetails = Array.from(reminderVendors).map((vid) => {
    const v = registeredVendors.find((x) => x.id === vid);
    const missing = items.filter((i) => i.required && ["none", "overdue"].includes(getStatus(vid, i.id).status));
    return { vendor: v, missing };
  }).filter((d) => d.vendor && d.missing.length > 0);

  const openReminderConfirm = () => {
    if (reminderVendors.size === 0) { toast.error("請先勾選需催繳的廠商"); return; }
    if (reminderDetails.length === 0) { toast.info("所選廠商皆無缺件"); return; }
    setReminderConfirmOpen(true);
  };

  const confirmSendReminders = () => {
    reminderDetails.forEach((d) => {
      sendReminder(eventId, d.vendor.id, d.vendor.company, d.missing);
    });
    toast.success(`已發送 ${reminderDetails.length} 封催繳通知`);
    setReminderVendors(new Set());
    setReminderConfirmOpen(false);
  };

  // 審核歷史
  const logsForSub = logModal ? submissionLogs.filter((l) => l.submissionId === logModal) : [];

  return (
    <>
      <SceneHead
        tag={`EVENT · ${event.name}`}
        title="資料繳交管理"
        desc="一覽所有廠商的繳交狀態，逐項審核並催繳。"
      />

      {/* Tab 切換 */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "rgba(0,0,0,0.05)", display: "inline-flex" }}>
        <Link
          to={`/event/${eventId}/submissions`}
          className="px-4 py-2 rounded-lg text-[13px] font-display font-medium no-underline transition-colors"
          style={{ background: "var(--bg-elevated)", color: "var(--text-primary)", boxShadow: "var(--shadow-sm)" }}
        >
          進度總覽
        </Link>
        <Link
          to={`/event/${eventId}/submissions/config`}
          className="px-4 py-2 rounded-lg text-[13px] font-display font-medium no-underline transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          繳交設定
        </Link>
      </div>

      <StatGrid
        stats={[
          { label: "繳交完成率", value: totalCells > 0 ? `${Math.round((approvedCells / totalCells) * 100)}%` : "—", delta: `${approvedCells}/${totalCells}` },
          { label: "待審稿件", value: pendingReview, delta: pendingReview > 0 ? "需處理" : "無待辦", deltaColor: pendingReview > 0 ? "var(--orange)" : "var(--green)" },
          { label: "未繳/逾期", value: overdueCells, deltaColor: overdueCells > 0 ? "var(--red)" : undefined },
          { label: "已報名廠商", value: registeredVendors.length },
        ]}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 flex-wrap">
          {[
            ["all", `全部 (${registeredVendors.length})`],
            ["missing", "有缺件"],
            ["overdue", "有逾期"],
            ["pending_review", "有待審"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className="px-3 py-1.5 rounded-pill text-[12px] font-display transition-colors"
              style={
                filter === id
                  ? { background: "var(--role-color)", color: "#fff" }
                  : { background: "rgba(0,0,0,0.05)", color: "var(--text-secondary)" }
              }
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {reminderVendors.size > 0 && (
            <button className="btn btn-primary" onClick={openReminderConfirm}>
              <Icon name="send" className="icon w-4 h-4" />
              催繳 {reminderVendors.size} 家
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <Panel>
          <div className="py-12 text-center">
            <p className="text-[13px] mb-3" style={{ color: "var(--text-tertiary)" }}>
              此活動尚未設定繳交項目
            </p>
            <Link to={`/event/${eventId}/submissions/config`} className="btn btn-primary">
              前往設定 →
            </Link>
          </div>
        </Panel>
      ) : (
        <Panel className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg-tinted)" }}>
                  <th
                    className="sticky left-0 z-10 text-left px-4 py-3 font-display font-semibold text-[11px] uppercase tracking-wider"
                    style={{ color: "var(--text-tertiary)", background: "var(--bg-tinted)", minWidth: 200 }}
                  >
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reminderVendors.size === filteredVendors.length && filteredVendors.length > 0}
                        onChange={() => {
                          if (reminderVendors.size === filteredVendors.length) setReminderVendors(new Set());
                          else setReminderVendors(new Set(filteredVendors.map((v) => v.id)));
                        }}
                      />
                      廠商
                    </label>
                  </th>
                  {items.map((item) => {
                    const expired = item.deadline && new Date(item.deadline) < new Date();
                    return (
                      <th
                        key={item.id}
                        className="px-2 py-3 font-display font-semibold text-[10px] uppercase tracking-wider text-center"
                        style={{ color: "var(--text-tertiary)", minWidth: 90, maxWidth: 110 }}
                      >
                        <div className="truncate" title={item.name}>{item.name}</div>
                        {item.required && <div className="text-orange-500 text-[9px]">必填</div>}
                        {item.deadline && (
                          <div className="text-[9px] mt-0.5" style={{ color: expired ? "var(--red)" : "inherit" }}>
                            {item.deadline.slice(5)}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((v) => (
                  <tr key={v.id} className="hover:bg-black/[0.015]">
                    <td
                      className="sticky left-0 z-10 px-4 py-2.5"
                      style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--separator)" }}
                    >
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={reminderVendors.has(v.id)}
                          onChange={() => toggleReminder(v.id)}
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-[12px] truncate">{v.company}</div>
                          <div className="text-[10px] font-display" style={{ color: "var(--text-tertiary)" }}>
                            {v.boothNumber || "—"}
                          </div>
                        </div>
                      </label>
                    </td>
                    {items.map((item) => {
                      const { status, sub } = getStatus(v.id, item.id);
                      const cfg = STATUS_CFG[status] || STATUS_CFG.none;
                      return (
                        <td
                          key={item.id}
                          className="text-center px-1 py-2.5"
                          style={{ borderBottom: "1px solid var(--separator)" }}
                        >
                          <button
                            onClick={() => {
                              if (sub && sub.status === "submitted") {
                                setReviewModal({ sub, item, vendor: v });
                                setFeedback("");
                              } else if (sub) {
                                setLogModal(sub.id);
                              }
                            }}
                            className={`group/cell relative inline-flex items-center justify-center w-10 h-10 rounded-lg text-[13px] font-bold transition-all hover:scale-110 ${cfg.cls}`}
                          >
                            {cfg.icon}
                            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/cell:block z-50 w-56">
                              <div className="rounded-lg shadow-lg p-2.5 text-left text-[11px] font-normal leading-relaxed"
                                style={{ background: "var(--bg-elevated)", border: "1px solid var(--separator)", color: "var(--text-primary)" }}>
                                <div className="font-semibold text-[12px] mb-1 truncate">{v.company}</div>
                                <div style={{ color: "var(--text-secondary)" }}>{item.name}</div>
                                <div className="mt-1">狀態：<span className="font-medium">{cfg.label}</span></div>
                                {sub?.fileName && <div className="font-display truncate">檔案：{sub.fileName} ({sub.fileSize})</div>}
                                {sub?.submittedAt && <div className="font-display">繳交：{sub.submittedAt}</div>}
                                {sub?.reviewedBy && <div className="font-display">審核：{sub.reviewedBy} ({sub.reviewedAt})</div>}
                                {sub?.feedback && <div className="mt-1 italic" style={{ color: "var(--orange)" }}>「{sub.feedback}」</div>}
                              </div>
                              <div className="w-2 h-2 rotate-45 mx-auto -mt-1" style={{ background: "var(--bg-elevated)", border: "1px solid var(--separator)", borderTop: 0, borderLeft: 0 }} />
                            </div>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 flex gap-4 text-[11px] font-display" style={{ background: "var(--bg-tinted)", borderTop: "1px solid var(--separator)", color: "var(--text-tertiary)" }}>
            <span className="flex items-center gap-1"><span className={`inline-block w-4 h-4 rounded text-center ${STATUS_CFG.approved.cls}`}>✓</span>已審核</span>
            <span className="flex items-center gap-1"><span className={`inline-block w-4 h-4 rounded text-center ${STATUS_CFG.submitted.cls}`}>📄</span>待審</span>
            <span className="flex items-center gap-1"><span className={`inline-block w-4 h-4 rounded text-center ${STATUS_CFG.rejected.cls}`}>✗</span>退回</span>
            <span className="flex items-center gap-1"><span className={`inline-block w-4 h-4 rounded text-center ${STATUS_CFG.overdue.cls}`}>!</span>逾期</span>
            <span className="flex items-center gap-1"><span className={`inline-block w-4 h-4 rounded text-center ${STATUS_CFG.none.cls}`}>—</span>未繳</span>
          </div>
        </Panel>
      )}

      {/* 審核 Modal */}
      <Modal
        open={!!reviewModal}
        onClose={() => setReviewModal(null)}
        title="審核繳交資料"
        width="580px"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => doReview("rejected")}>
              退回補件
            </button>
            <button className="btn btn-primary" onClick={() => doReview("approved")}>
              核准通過
            </button>
          </>
        }
      >
        {reviewModal && (
          <>
            <div
              className="p-4 rounded-xl mb-4"
              style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
            >
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div>
                  <div className="text-[11px] font-display uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
                    廠商
                  </div>
                  <div className="font-semibold">{reviewModal.vendor.company}</div>
                </div>
                <div>
                  <div className="text-[11px] font-display uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
                    項目
                  </div>
                  <div className="font-semibold">{reviewModal.item.name}</div>
                </div>
                <div>
                  <div className="text-[11px] font-display uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
                    檔案名稱
                  </div>
                  <div className="font-display">{reviewModal.sub.fileName}</div>
                </div>
                <div>
                  <div className="text-[11px] font-display uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
                    檔案大小 / 繳交日
                  </div>
                  <div className="font-display">{reviewModal.sub.fileSize} · {reviewModal.sub.submittedAt}</div>
                </div>
              </div>
            </div>
            <Field label="審核意見（退回時建議填寫）">
              <textarea
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none min-h-[100px]"
                style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="例：解析度不足，請提供 300dpi 以上的版本。"
              />
            </Field>
          </>
        )}
      </Modal>

      {/* 歷史紀錄 Modal */}
      <Modal
        open={!!logModal}
        onClose={() => setLogModal(null)}
        title="審核歷史"
        footer={<button className="btn btn-ghost" onClick={() => setLogModal(null)}>關閉</button>}
      >
        {logModal && (() => {
          const sub = submissions.find((s) => s.id === logModal);
          const logs = submissionLogs.filter((l) => l.submissionId === logModal);
          return (
            <>
              {sub && (
                <div className="p-3 rounded-lg mb-3 text-[13px]" style={{ background: "var(--bg-tinted)" }}>
                  <strong>{sub.fileName}</strong> · {sub.fileSize}
                  {sub.feedback && (
                    <div className="mt-2 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                      回饋：{sub.feedback}
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-2">
                {logs.map((l) => (
                  <div key={l.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: "var(--bg-tinted)" }}>
                    <span className={`badge ${l.action === "approved" ? "badge-green" : l.action === "rejected" ? "badge-orange" : "badge-blue"}`}>
                      {l.action === "submitted" ? "繳交" : l.action === "approved" ? "核准" : "退回"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium">{l.by}</div>
                      {l.note && <div className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{l.note}</div>}
                    </div>
                    <span className="text-[11px] font-display" style={{ color: "var(--text-tertiary)" }}>{l.at}</span>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="text-[12px] text-center py-4" style={{ color: "var(--text-tertiary)" }}>無紀錄</div>
                )}
              </div>
            </>
          );
        })()}
      </Modal>

      {/* 催繳確認 Modal */}
      <Modal
        open={reminderConfirmOpen}
        onClose={() => setReminderConfirmOpen(false)}
        title="確認催繳"
        width="620px"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setReminderConfirmOpen(false)}>取消</button>
            <button className="btn btn-primary" onClick={confirmSendReminders}>
              <Icon name="send" className="icon w-4 h-4" />
              確認發送 {reminderDetails.length} 封
            </button>
          </>
        }
      >
        <p className="text-[13px] mb-4" style={{ color: "var(--text-secondary)" }}>
          以下廠商將收到催繳通知，列出各自缺少的必填項目：
        </p>
        <div className="max-h-[380px] overflow-auto space-y-3">
          {reminderDetails.map((d) => (
            <div key={d.vendor.id} className="p-3 rounded-xl" style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}>
              <div className="font-semibold text-[13px] mb-2">{d.vendor.company}</div>
              <div className="flex flex-wrap gap-1.5">
                {d.missing.map((item) => (
                  <span key={item.id} className="badge badge-orange">{item.name}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
