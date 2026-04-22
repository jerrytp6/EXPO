import { useMemo, useState } from "react";
import { useData } from "../../store/data";
import { Icon } from "../../components/Icon";
import { Modal } from "../../components/Modal";
import { toast } from "../../store/toast";

// 廠商端：表單下載-簽署-上傳 — PDF p12
// 支援條件顯示（自行裝潢才出現）、含費用時需上傳匯款單
export default function VendorForms({ vendor, event }) {
  const { eventForms, formSubmissions, getFormsForVendor, submitForm, confirmFormSubmission } = useData();

  const forms = useMemo(() => getFormsForVendor(event.id, vendor.id), [eventForms, event.id, vendor.id]);

  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(null);
  const [upload, setUpload] = useState({ fileName: "", fileSize: "", fee: "", paymentProofFileName: "", skip: false });

  // 取得某表單的最新繳交紀錄
  const latestSub = (formId) => {
    const subs = (formSubmissions || []).filter((s) => s.eventId === event.id && s.vendorId === vendor.id && s.formId === formId);
    return subs.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0] || null;
  };

  const openUpload = (f) => {
    setTarget(f);
    setUpload({ fileName: "", fileSize: "0.8 MB", fee: "", paymentProofFileName: "", skip: false });
    setOpen(true);
  };

  const submit = () => {
    if (upload.skip) {
      toast.success(`已回覆：不需要此項目`);
      setOpen(false);
      return;
    }
    if (!upload.fileName) { toast.error("請選擇檔案"); return; }
    if (target.hasFee && !upload.paymentProofFileName) { toast.error("含費用項目，請一併上傳匯款單"); return; }
    submitForm(event.id, vendor.id, target.id, {
      fileName: upload.fileName,
      fileSize: upload.fileSize || "0.8 MB",
      fee: target.hasFee ? parseInt(upload.fee || "0") : null,
      paymentProofFileName: target.hasFee ? upload.paymentProofFileName : null,
      uploadedByRole: "vendor",
    });
    toast.success(`已上傳：${target.name}`);
    setOpen(false);
  };

  const statusInfo = (sub, f) => {
    if (!sub) return { label: "待繳交", cls: "chip-orange", desc: f.isRequired ? "必繳項目" : "選填" };
    const map = {
      submitted:            { label: "審核中",       cls: "chip-blue",   desc: "管理員審核中" },
      pending_fee_review:   { label: "費用待審",     cls: "chip-orange", desc: `NT$ ${sub.fee?.toLocaleString()} 含匯款單` },
      approved:             { label: "已通過",       cls: "chip-green",  desc: sub.reviewedAt ? `於 ${sub.reviewedAt} 審核通過` : "" },
      rejected:             { label: "已退回",       cls: "chip-red",    desc: sub.feedback || "請重新繳交" },
    };
    return map[sub.status] || { label: sub.status, cls: "", desc: "" };
  };

  const stats = {
    total: forms.filter((f) => f.isRequired).length,
    done: forms.filter((f) => f.isRequired && latestSub(f.id)?.status === "approved").length,
  };
  const progress = stats.total ? Math.round((stats.done / stats.total) * 100) : 100;

  return (
    <>
      <div className="mb-8">
        <div className="scene-tag">FORMS · 表單簽署</div>
        <h1 className="scene-title">下載 → 簽署 → 上傳</h1>
        <p className="scene-desc">
          請逐項下載範本、用印或簽章後上傳。含費用項目需上傳匯款單，將由活動管理員審核。
        </p>
      </div>

      {/* 進度 */}
      <div className="panel mb-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-tertiary)" }}>
              REQUIRED FORMS PROGRESS
            </div>
            <div className="text-3xl font-bold">
              {stats.done} <span className="text-[18px]" style={{ color: "var(--text-tertiary)" }}>/ {stats.total} 必繳已通過</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold" style={{ color: progress === 100 ? "var(--green)" : "var(--role-color)" }}>
              {progress}%
            </div>
          </div>
        </div>
        <div className="h-2 rounded-full" style={{ background: "var(--separator)" }}>
          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: progress === 100 ? "var(--green)" : "var(--role-color)" }} />
        </div>

        {vendor.decorationMode && (
          <div className="mt-4 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            您目前的裝潢方式：
            <span className="chip ml-1">{vendor.decorationMode === "self" ? "自行裝潢" : "攤位廠商裝潢"}</span>
            {vendor.decorationMode === "self" && <span className="ml-2">（已顯示需額外填寫的施工相關表單）</span>}
          </div>
        )}
      </div>

      {/* 表單清單 */}
      <div className="space-y-3">
        {forms.map((f) => {
          const sub = latestSub(f.id);
          const st = statusInfo(sub, f);
          const canUpload = !sub || sub.status === "rejected";
          return (
            <div key={f.id} className="panel" style={{ padding: "20px 24px" }}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="chip">{f.category}</span>
                    {f.isRequired && <span className="chip chip-red">必繳</span>}
                    {f.hasFee && <span className="chip chip-orange">含費用</span>}
                    {f.skipOption && <span className="chip">可選擇不需要</span>}
                    <span className={`chip ${st.cls}`}>{st.label}</span>
                  </div>
                  <div className="font-semibold text-[15px] mb-1">{f.name}</div>
                  <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                    截止日 {f.deadline || "—"} · 接受格式 {f.formats}
                  </div>
                  {sub && (
                    <div className="text-[12px] mt-2" style={{ color: sub.status === "rejected" ? "var(--red)" : "var(--text-secondary)" }}>
                      {sub.status === "rejected" && "⚠ "}{st.desc}
                      {sub.fileName && <span> · 已上傳：{sub.fileName}</span>}
                    </div>
                  )}
                  {!sub && st.desc && <div className="text-[12px] mt-1" style={{ color: "var(--text-tertiary)" }}>{st.desc}</div>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {f.templateFileName && (
                    <button className="btn btn-sm" onClick={() => toast.info(`Demo：下載 ${f.templateFileName}`)}>
                      📎 下載範本
                    </button>
                  )}
                  {canUpload && (
                    <button className="btn btn-sm btn-primary" onClick={() => openUpload(f)}>
                      {sub?.status === "rejected" ? "重新上傳" : "上傳簽檔"}
                    </button>
                  )}
                  {sub?.status === "approved" && !sub.vendorConfirmed && (
                    <button
                      className="btn btn-sm"
                      onClick={() => { confirmFormSubmission(sub.id); toast.success("已確認完成"); }}
                      style={{ color: "var(--green)" }}
                    >
                      確認完成
                    </button>
                  )}
                  {sub?.status === "approved" && sub.vendorConfirmed && (
                    <span className="text-[12px]" style={{ color: "var(--green)" }}>✓ 已確認</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 上傳 Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title={`上傳：${target?.name || ""}`} width="560px">
        {target?.skipOption && (
          <div className="mb-4 p-4 rounded-xl flex items-start gap-3" style={{ background: "var(--bg-tinted)" }}>
            <input
              type="checkbox"
              id="skip"
              checked={upload.skip}
              onChange={(e) => setUpload({ ...upload, skip: e.target.checked })}
              className="mt-1"
            />
            <label htmlFor="skip" className="text-[14px]">
              <div className="font-medium">我不需要此項目</div>
              <div className="text-[12px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                例如：本次不延長場地使用；選此項後無需上傳
              </div>
            </label>
          </div>
        )}

        {!upload.skip && (
          <>
            <div className="mb-4">
              <label className="block text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
                已簽章之 {target?.name}
              </label>
              <div className="p-4 rounded-xl border-2 border-dashed text-center" style={{ borderColor: "var(--separator-strong)" }}>
                <div className="text-3xl mb-2">📄</div>
                <input
                  className="input"
                  placeholder="檔名（Demo 用）例：切結書-已簽.pdf"
                  value={upload.fileName}
                  onChange={(e) => setUpload({ ...upload, fileName: e.target.value })}
                />
                <div className="text-[11px] mt-2" style={{ color: "var(--text-tertiary)" }}>
                  接受格式：{target?.formats}
                </div>
              </div>
            </div>

            {target?.hasFee && (
              <div className="mb-4 p-4 rounded-xl" style={{ background: "rgba(255,159,10,0.08)", border: "1px solid rgba(255,159,10,0.25)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="chip chip-orange">💰 含費用</span>
                  <span className="text-[13px] font-semibold">請一併上傳匯款證明</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase mb-1" style={{ color: "var(--text-tertiary)" }}>
                      金額 NT$
                    </label>
                    <input
                      className="input"
                      type="number"
                      value={upload.fee}
                      onChange={(e) => setUpload({ ...upload, fee: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase mb-1" style={{ color: "var(--text-tertiary)" }}>
                      匯款單檔名
                    </label>
                    <input
                      className="input"
                      value={upload.paymentProofFileName}
                      onChange={(e) => setUpload({ ...upload, paymentProofFileName: e.target.value })}
                      placeholder="匯款單.jpg"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end gap-2 mt-2">
          <button className="btn" onClick={() => setOpen(false)}>取消</button>
          <button className="btn btn-primary" onClick={submit}>
            {upload.skip ? "回覆不需要" : "送出上傳"}
          </button>
        </div>
      </Modal>
    </>
  );
}
