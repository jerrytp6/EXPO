import { useState } from "react";
import { useData } from "../../store/data";
import { SceneHead, Panel, Field } from "../../components/Scene";
import { Modal } from "../../components/Modal";
import { Icon } from "../../components/Icon";
import { toast } from "../../store/toast";

const STATUS_STYLE = {
  none:      { label: "未繳交",  cls: "badge-gray",   color: "var(--text-tertiary)" },
  submitted: { label: "已繳待審", cls: "badge-blue",  color: "var(--blue)" },
  approved:  { label: "已審核通過", cls: "badge-green", color: "var(--green)" },
  rejected:  { label: "退回補件", cls: "badge-orange", color: "var(--orange)" },
  overdue:   { label: "已逾期",  cls: "badge-gray",   color: "var(--red)" },
};

function daysUntil(deadline) {
  if (!deadline) return null;
  const d = Math.ceil((new Date(deadline) - new Date()) / 86400000);
  return d;
}

export default function VendorSubmissions({ vendor, event }) {
  const { submissions, submitFile, reminders, getEventItems } = useData();
  const items = getEventItems(vendor.eventId);

  const [uploadItem, setUploadItem] = useState(null);
  const [fileName, setFileName] = useState("");

  // 某項的繳交狀態
  const getItemStatus = (itemId) => {
    const sub = submissions.find(
      (s) => s.eventId === vendor.eventId && s.vendorId === vendor.id && s.itemId === itemId
    );
    if (!sub) {
      const item = items.find((i) => i.id === itemId);
      if (item?.deadline && new Date(item.deadline) < new Date()) return { status: "overdue", sub: null };
      return { status: "none", sub: null };
    }
    return { status: sub.status, sub };
  };

  const required = items.filter((i) => i.required);
  const approvedCount = required.filter((i) => getItemStatus(i.id).status === "approved").length;
  const progress = required.length > 0 ? Math.round((approvedCount / required.length) * 100) : 0;

  // 催繳提醒
  const myReminders = (reminders || []).filter(
    (r) => r.eventId === vendor.eventId && r.vendorId === vendor.id
  );
  const latestReminder = myReminders[myReminders.length - 1];

  // 退回的項目
  const rejectedItems = items.filter((i) => getItemStatus(i.id).status === "rejected");

  const grouped = [
    ...new Set(items.map((i) => i.category)),
  ].map((cat) => ({ category: cat, items: items.filter((i) => i.category === cat) }));

  const handleUpload = () => {
    if (!fileName.trim()) {
      toast.error("請輸入檔案名稱");
      return;
    }
    submitFile(vendor.eventId, vendor.id, uploadItem.id, {
      fileName: fileName.trim(),
      fileSize: `${(Math.random() * 8 + 0.5).toFixed(1)} MB`,
      submittedBy: vendor.contact || vendor.company,
    });
    toast.success(`已繳交：${uploadItem.name}`);
    setUploadItem(null);
    setFileName("");
  };

  return (
    <>
      <SceneHead
        tag="SUBMISSIONS"
        title="資料繳交"
        desc={event ? `${event.name} · 必填 ${required.length} 項` : ""}
      />

      {/* 進度條 */}
      <Panel>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[14px] font-semibold">繳交進度</div>
          <div className="text-[13px] font-display font-bold" style={{ color: progress === 100 ? "var(--green)" : "var(--text-primary)" }}>
            {progress}%（{approvedCount}/{required.length} 必填項已通過）
          </div>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background: progress === 100 ? "var(--green)" : "var(--role-grad)",
            }}
          />
        </div>
        {latestReminder && (
          <div
            className="mt-3 p-3 rounded-lg flex items-center gap-2 text-[12px]"
            style={{ background: "rgba(255,59,48,0.08)", color: "var(--red)" }}
          >
            <Icon name="mail" className="icon w-4 h-4" />
            <span>
              主辦方已於 {new Date(latestReminder.sentAt).toLocaleString("zh-TW", { month: "numeric", day: "numeric" })} 催繳以下項目：
              {latestReminder.items.join("、")}
            </span>
          </div>
        )}
      </Panel>

      {/* 退回項目釘頂 */}
      {rejectedItems.length > 0 && (
        <div
          className="p-4 rounded-xl mb-6"
          style={{ background: "rgba(255,59,48,0.06)", border: "1px solid rgba(255,59,48,0.3)" }}
        >
          <div className="flex items-center gap-2 mb-3 text-[13px] font-semibold" style={{ color: "var(--red)" }}>
            <Icon name="shield" className="icon w-4 h-4" />
            有 {rejectedItems.length} 項需要重新繳交
          </div>
          <div className="space-y-2">
            {rejectedItems.map((item) => {
              const { sub } = getItemStatus(item.id);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white"
                  style={{ border: "1px solid rgba(255,59,48,0.2)" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium">{item.name}</div>
                    {sub?.feedback && (
                      <div className="text-[12px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                        審核意見：{sub.feedback}
                      </div>
                    )}
                  </div>
                  <button
                    className="btn btn-primary !py-1 !text-xs flex-shrink-0"
                    onClick={() => { setUploadItem(item); setFileName(""); }}
                  >
                    重新上傳
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 項目清單 */}
      {grouped.map((g) => (
        <Panel key={g.category} title={g.category}>
          <div className="space-y-2">
            {g.items.map((item) => {
              const { status, sub } = getItemStatus(item.id);
              const st = STATUS_STYLE[status] || STATUS_STYLE.none;
              const days = daysUntil(item.deadline);
              const urgent = days !== null && days >= 0 && days <= 7 && status !== "approved";
              const expired = days !== null && days < 0 && status !== "approved";

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl transition-colors"
                  style={{
                    border: urgent ? "1px solid var(--orange)" : expired ? "1px solid var(--red)" : "1px solid var(--separator)",
                    background: urgent ? "rgba(255,159,10,0.04)" : expired ? "rgba(255,59,48,0.03)" : "var(--bg-tinted)",
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[14px] font-medium">{item.name}</span>
                        {item.required && <span className="badge badge-orange">必填</span>}
                        <span className={`badge ${st.cls}`}>{st.label}</span>
                      </div>
                      <div className="flex gap-4 text-[11px] font-display" style={{ color: "var(--text-tertiary)" }}>
                        {item.formats && <span>格式：{item.formats}</span>}
                        {item.deadline && (
                          <span style={{ color: expired ? "var(--red)" : urgent ? "var(--orange)" : "inherit" }}>
                            截止：{item.deadline}
                            {days !== null && days >= 0 && ` (剩 ${days} 天)`}
                            {expired && " (已逾期)"}
                          </span>
                        )}
                      </div>

                      {/* 已繳交資訊 */}
                      {sub && (
                        <div className="mt-2 p-2.5 rounded-lg text-[12px]" style={{ background: "rgba(0,0,0,0.03)" }}>
                          <div className="flex items-center gap-2">
                            <Icon name="upload" className="icon w-3.5 h-3.5" />
                            <span className="font-display">{sub.fileName}</span>
                            <span style={{ color: "var(--text-tertiary)" }}>({sub.fileSize})</span>
                            <span className="ml-auto font-display" style={{ color: "var(--text-tertiary)" }}>
                              {sub.submittedAt}
                            </span>
                          </div>
                          {sub.feedback && (
                            <div
                              className="mt-2 p-2 rounded-lg text-[12px]"
                              style={{ background: "rgba(255,159,10,0.08)", color: "var(--text-secondary)" }}
                            >
                              <strong>審核意見：</strong>{sub.feedback}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 動作按鈕 */}
                    <div className="flex-shrink-0">
                      {(status === "none" || status === "overdue") && (
                        <button
                          className="btn btn-primary !py-1.5 !text-xs"
                          onClick={() => { setUploadItem(item); setFileName(""); }}
                        >
                          上傳
                        </button>
                      )}
                      {status === "rejected" && (
                        <button
                          className="btn btn-primary !py-1.5 !text-xs"
                          onClick={() => { setUploadItem(item); setFileName(""); }}
                        >
                          重新上傳
                        </button>
                      )}
                      {status === "submitted" && (
                        <span className="text-[11px] font-display" style={{ color: "var(--blue)" }}>
                          審核中…
                        </span>
                      )}
                      {status === "approved" && (
                        <Icon name="check" className="icon w-5 h-5" style={{ stroke: "var(--green)" }} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      ))}

      {items.length === 0 && (
        <Panel>
          <div className="py-12 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            主辦方尚未設定繳交項目。
          </div>
        </Panel>
      )}

      {/* 上傳 Modal */}
      <Modal
        open={!!uploadItem}
        onClose={() => setUploadItem(null)}
        title={`上傳：${uploadItem?.name || ""}`}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setUploadItem(null)}>取消</button>
            <button className="btn btn-primary" onClick={handleUpload}>確認繳交</button>
          </>
        }
      >
        {uploadItem && (
          <>
            <div className="text-[13px] mb-4" style={{ color: "var(--text-secondary)" }}>
              {uploadItem.formats && <>允許格式：<strong>{uploadItem.formats}</strong><br /></>}
              {uploadItem.deadline && <>截止日期：<strong>{uploadItem.deadline}</strong></>}
            </div>
            <div
              className="border-2 border-dashed rounded-2xl p-8 text-center mb-4"
              style={{ borderColor: "var(--separator-strong)", background: "var(--bg-tinted)" }}
            >
              <Icon name="upload" className="icon mx-auto mb-3 w-8 h-8" />
              <div className="text-[13px] font-medium">
                {fileName || "模擬上傳（請輸入檔案名稱）"}
              </div>
              <div className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                實際系統會接上檔案上傳 API
              </div>
            </div>
            <Field label="檔案名稱（模擬）">
              <input
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="例：company-logo-4k.png"
              />
            </Field>
          </>
        )}
      </Modal>
    </>
  );
}
