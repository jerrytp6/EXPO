import { useMemo, useState } from "react";
import { useData } from "../../store/data";
import { Modal } from "../../components/Modal";
import { toast } from "../../store/toast";
import { api } from "../../lib/api";

const fmtSize = (n) => n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`;

// 裝潢廠商端：代參展廠商上傳裝潢相關表單（allowDecoratorUpload=true）
// PDF p12「裝潢廠商入口」— 自行裝潢時的施工切結書 / 安全衛生承諾書 / 電力位置圖 等
export default function DecoratorForms({ decorator }) {
  const { vendors, events, decorationProjects, eventForms, formSubmissions, getFormsForVendor, submitForm } = useData();

  const servedVendors = decorationProjects
    .filter((p) => p.decoratorId === decorator.id)
    .map((p) => ({
      vendor: vendors.find((v) => v.id === p.vendorId),
      event: events.find((e) => e.id === p.eventId),
    }))
    .filter((x) => x.vendor && x.event);

  const [selectedVendorId, setSelectedVendorId] = useState(servedVendors[0]?.vendor.id || null);
  const selected = servedVendors.find((x) => x.vendor.id === selectedVendorId);

  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(null);
  const [signed, setSigned] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const r = await api.upload(file);
      setSigned(r);
      toast.success(`已上傳：${r.originalName}`);
    } catch (err) {
      toast.error(`上傳失敗：${err.body?.error || err.message}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // 取得此廠商在該活動可顯示的表單，並過濾「裝潢商可代上傳」
  const decoratorForms = useMemo(() => {
    if (!selected) return [];
    return getFormsForVendor(selected.event.id, selected.vendor.id).filter((f) => f.allowDecoratorUpload);
  }, [eventForms, selected]);

  const latestSub = (formId) => {
    if (!selected) return null;
    const subs = (formSubmissions || []).filter(
      (s) => s.eventId === selected.event.id && s.vendorId === selected.vendor.id && s.formId === formId
    );
    return subs.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0] || null;
  };

  const openUpload = (f) => {
    setTarget(f);
    setSigned(null);
    setOpen(true);
  };
  const submit = async () => {
    if (!signed) { toast.error("請先選擇檔案上傳"); return; }
    try {
      await submitForm(selected.event.id, selected.vendor.id, target.id, {
        fileName: signed.originalName,
        fileSize: fmtSize(signed.size),
        storedPath: signed.url,
        uploadedByRole: "decorator",
      });
      toast.success(`已代 ${selected.vendor.company} 上傳「${target.name}」`);
      setOpen(false);
    } catch (err) {
      toast.error(`送出失敗：${err.body?.error || err.message}`);
    }
  };

  const statusInfo = (sub) => {
    if (!sub) return { label: "待繳交", cls: "chip-orange" };
    const map = {
      submitted:   { label: "審核中", cls: "chip-blue" },
      approved:    { label: "已通過", cls: "chip-green" },
      rejected:    { label: "已退回", cls: "chip-red" },
      pending_fee_review: { label: "費用待審", cls: "chip-orange" },
    };
    return map[sub.status] || { label: sub.status, cls: "" };
  };

  if (servedVendors.length === 0) {
    return (
      <>
        <div className="mb-8">
          <div className="scene-tag">FORMS · 表單代簽</div>
          <h1 className="scene-title">代參展廠商上傳裝潢相關表單</h1>
        </div>
        <div className="panel text-center py-16">
          <div className="text-5xl mb-3">📭</div>
          <div className="text-[14px]" style={{ color: "var(--text-tertiary)" }}>
            目前沒有合作中的參展廠商
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <div className="scene-tag">FORMS · 表單代簽</div>
        <h1 className="scene-title">代參展廠商上傳裝潢相關表單</h1>
        <p className="scene-desc">
          此頁僅顯示主辦方允許「裝潢廠商可代上傳」的表單（如施工切結書、安全衛生承諾書、電力位置圖等）。
        </p>
      </div>

      {/* 廠商切換 */}
      <div className="panel mb-6">
        <div className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-tertiary)" }}>
          SWITCH CLIENT · 切換合作廠商
        </div>
        <div className="flex gap-2 flex-wrap">
          {servedVendors.map(({ vendor, event }) => (
            <button
              key={vendor.id}
              className={`btn ${selectedVendorId === vendor.id ? "btn-primary" : ""}`}
              onClick={() => setSelectedVendorId(vendor.id)}
            >
              <div className="text-left">
                <div className="font-medium text-[13px]">{vendor.company}</div>
                <div className="text-[10px] opacity-70">{event.name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 表單清單 */}
      <div className="space-y-3">
        {decoratorForms.map((f) => {
          const sub = latestSub(f.id);
          const st = statusInfo(sub);
          const canUpload = !sub || sub.status === "rejected";
          return (
            <div key={f.id} className="panel" style={{ padding: "20px 24px" }}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="chip">{f.category}</span>
                    {f.isRequired && <span className="chip chip-red">必繳</span>}
                    <span className="chip chip-blue">裝潢商可代上傳</span>
                    <span className={`chip ${st.cls}`}>{st.label}</span>
                  </div>
                  <div className="font-semibold text-[15px] mb-1">{f.name}</div>
                  <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                    截止日 {f.deadline || "—"} · 接受格式 {f.formats}
                  </div>
                  {sub && (
                    <div className="text-[12px] mt-2" style={{ color: sub.status === "rejected" ? "var(--red)" : "var(--text-secondary)" }}>
                      {sub.fileName && `已上傳：${sub.fileName}`}
                      {sub.uploadedByRole === "decorator" && sub.fileName && <span className="chip chip-purple ml-2">裝潢商代上傳</span>}
                      {sub.status === "rejected" && sub.feedback && <div className="mt-1">退回原因：{sub.feedback}</div>}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {f.templateFileName && (
                    <button className="btn btn-sm" onClick={() => toast.info(`範本檔由活動方提供：${f.templateFileName}`)}>
                      📎 範本說明
                    </button>
                  )}
                  {sub?.storedPath && (
                    <a className="btn btn-sm" href={api.fileUrl(sub.storedPath)} target="_blank" rel="noreferrer">
                      📥 下載已上傳
                    </a>
                  )}
                  {canUpload && (
                    <button className="btn btn-sm btn-primary" onClick={() => openUpload(f)}>
                      {sub?.status === "rejected" ? "重新上傳" : "代為上傳"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {decoratorForms.length === 0 && (
          <div className="panel text-center py-16">
            <div className="text-5xl mb-3">📄</div>
            <div className="text-[14px]" style={{ color: "var(--text-tertiary)" }}>
              目前此廠商的活動沒有開放裝潢商代上傳的表單
              {selected?.vendor.decorationMode !== "self" && (
                <div className="mt-2 text-[12px]">
                  （提示：施工相關表單通常僅在廠商選擇「自行裝潢」時才會出現）
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={`代上傳：${target?.name || ""}`} width="520px">
        <div className="mb-4 p-3 rounded-lg text-[13px]" style={{ background: "rgba(191,90,242,0.08)" }}>
          👷 您正在代「<b>{selected?.vendor.company}</b>」上傳此表單。上傳後將進入活動管理員審核流程。
        </div>
        <label className="block text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
          已簽章之 {target?.name}
        </label>
        <label className="block p-4 rounded-xl border-2 border-dashed text-center mb-4 cursor-pointer hover:bg-[var(--bg-tinted)]"
          style={{ borderColor: "var(--separator-strong)" }}>
          <div className="text-3xl mb-2">📄</div>
          {signed ? (
            <div className="text-[13px]">
              <div className="font-semibold">{signed.originalName}</div>
              <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{fmtSize(signed.size)} · 點擊重選</div>
            </div>
          ) : (
            <>
              <div className="text-[13px] font-medium mb-1">點擊或拖放選擇檔案</div>
              <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>接受 {target?.formats} · ≤ 10MB</div>
            </>
          )}
          <input type="file" accept={target?.formats} className="hidden" onChange={onPickFile} />
        </label>
        <div className="flex justify-end gap-2">
          <button className="btn" onClick={() => setOpen(false)}>取消</button>
          <button className="btn btn-primary" disabled={uploading} onClick={submit}>
            {uploading ? "上傳中…" : "送出上傳"}
          </button>
        </div>
      </Modal>
    </>
  );
}
