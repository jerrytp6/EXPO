import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { useData } from "../../store/data";
import { SceneHead, Panel, Field } from "../../components/Scene";
import { Modal } from "../../components/Modal";
import { toast } from "../../store/toast";

const TRIGGERS = [
  { key: "invitation",       label: "廠商邀約" },
  { key: "rsvp_accepted",    label: "RSVP 接受" },
  { key: "register_confirm", label: "註冊完成" },
  { key: "form_approved",    label: "表單審核通過" },
  { key: "form_rejected",    label: "表單審核退回" },
  { key: "reminder",         label: "繳交催繳" },
  { key: "pre_event_notice", label: "展前通知" },
  { key: "fee_review",       label: "費用審核（管理員）" },
  { key: "custom",           label: "自訂" },
];

// 客戶模組 #8「郵件通知模板」— 活動層級；可從租戶預設複製
export default function EventEmailTemplates() {
  const { eventId } = useParams();
  const user = useAuth((s) => s.user);
  const { emailTemplates, events, createEmailTemplate, updateEmailTemplate, deleteEmailTemplate, copyTenantTemplatesToEvent } = useData();
  const event = events.find((e) => e.id === eventId);
  const templates = (emailTemplates || []).filter((t) => t.scope === "event" && t.eventId === eventId);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ trigger: "custom", name: "", subject: "", body: "" });

  const triggerLabel = (key) => TRIGGERS.find((t) => t.key === key)?.label || key;

  const openNew = () => { setEditing(null); setForm({ trigger: "custom", name: "", subject: "", body: "" }); setOpen(true); };
  const openEdit = (t) => { setEditing(t); setForm({ trigger: t.trigger, name: t.name, subject: t.subject, body: t.body }); setOpen(true); };
  const submit = () => {
    if (!form.name || !form.subject) { toast.error("請填寫名稱與主旨"); return; }
    if (editing) { updateEmailTemplate(editing.id, form); toast.success("已更新"); }
    else { createEmailTemplate({ ...form, scope: "event", companyId: event?.companyId, eventId, isSystem: false }); toast.success("已新增"); }
    setOpen(false);
  };
  const remove = (t) => {
    if (!confirm(`確定刪除「${t.name}」？`)) return;
    deleteEmailTemplate(t.id);
    toast.info("已刪除");
  };
  const copyFromTenant = () => {
    if (!confirm("將從租戶預設模板複製一份到此活動？（現有活動模板不會被覆蓋，會新增）")) return;
    const clones = copyTenantTemplatesToEvent(event?.companyId, eventId);
    toast.success(`已複製 ${clones.length} 個模板`);
  };

  return (
    <>
      <SceneHead
        tag="EVENT EMAIL · 郵件模板"
        title={`${event?.name || "—"} 郵件通知模板`}
        desc="此活動專屬的郵件模板。建立活動時會自動從租戶預設複製一份；可隨時客製化。"
      />

      <div className="flex justify-end mb-4 gap-2">
        <button className="btn" onClick={copyFromTenant}>↺ 從租戶預設複製</button>
        <button className="btn btn-primary" onClick={openNew}>+ 新增模板</button>
      </div>

      <Panel>
        <div className="space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="border rounded-xl p-4" style={{ borderColor: "var(--separator)" }}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-ink-primary">{t.name}</span>
                    <span className="chip">{triggerLabel(t.trigger)}</span>
                  </div>
                  <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{t.subject}</div>
                  <div className="text-[12px] mt-1 line-clamp-2" style={{ color: "var(--text-tertiary)" }}>
                    {t.body.slice(0, 120)}{t.body.length > 120 ? "…" : ""}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="btn btn-sm" onClick={() => openEdit(t)}>編輯</button>
                  <button className="btn btn-sm" onClick={() => remove(t)} style={{ color: "var(--red)" }}>刪除</button>
                </div>
              </div>
            </div>
          ))}
          {templates.length === 0 && (
            <div className="text-center py-10 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
              尚無活動模板；可點「↺ 從租戶預設複製」快速建立。
            </div>
          )}
        </div>
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "編輯模板" : "新增模板"} width="720px">
        <Field label="觸發時機">
          <select className="input" value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })}>
            {TRIGGERS.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="模板名稱">
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="主旨">
          <input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        </Field>
        <Field label="內文">
          <textarea className="input" rows={10} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </Field>
        <div className="flex justify-end gap-2 mt-2">
          <button className="btn" onClick={() => setOpen(false)}>取消</button>
          <button className="btn btn-primary" onClick={submit}>{editing ? "儲存" : "新增"}</button>
        </div>
      </Modal>
    </>
  );
}
