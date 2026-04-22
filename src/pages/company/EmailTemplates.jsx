import { useState } from "react";
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

export default function EmailTemplates() {
  const user = useAuth((s) => s.user);
  const { emailTemplates, createEmailTemplate, updateEmailTemplate, deleteEmailTemplate } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ trigger: "custom", name: "", subject: "", body: "" });

  const tenantTpls = (emailTemplates || []).filter(
    (t) => t.scope === "tenant" && t.companyId === user.companyId
  );

  const triggerLabel = (key) => TRIGGERS.find((t) => t.key === key)?.label || key;

  const openNew = () => {
    setEditing(null);
    setForm({ trigger: "custom", name: "", subject: "", body: "" });
    setOpen(true);
  };
  const openEdit = (t) => {
    setEditing(t);
    setForm({ trigger: t.trigger, name: t.name, subject: t.subject, body: t.body });
    setOpen(true);
  };
  const submit = () => {
    if (!form.name || !form.subject) { toast.error("請填寫名稱與主旨"); return; }
    if (editing) {
      updateEmailTemplate(editing.id, form);
      toast.success("模板已更新");
    } else {
      createEmailTemplate({ ...form, scope: "tenant", companyId: user.companyId, eventId: null, isSystem: false });
      toast.success("已新增預設模板");
    }
    setOpen(false);
  };
  const remove = (t) => {
    if (t.isSystem) { toast.error("系統內建模板不可刪除"); return; }
    if (!confirm(`確定刪除「${t.name}」？`)) return;
    deleteEmailTemplate(t.id);
    toast.info("已刪除");
  };

  return (
    <>
      <SceneHead
        tag="EMAIL TEMPLATES"
        title="預設郵件模板"
        desc="租戶層通用模板；建立新活動時將自動複製為活動模板。"
      />
      <div className="flex justify-end mb-4">
        <button className="btn btn-primary" onClick={openNew}>+ 新增模板</button>
      </div>

      <Panel>
        <div className="space-y-3">
          {tenantTpls.map((t) => (
            <div key={t.id} className="border rounded-xl p-4" style={{ borderColor: "var(--separator)" }}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-ink-primary">{t.name}</span>
                    <span className="px-2 py-0.5 rounded text-[11px]" style={{ background: "var(--bg-tinted)", color: "var(--text-secondary)" }}>
                      {triggerLabel(t.trigger)}
                    </span>
                    {t.isSystem && (
                      <span className="px-2 py-0.5 rounded text-[11px]" style={{ background: "rgba(48,209,88,0.1)", color: "#1f8a3a" }}>
                        系統
                      </span>
                    )}
                  </div>
                  <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{t.subject}</div>
                  <div className="text-[12px] mt-1 line-clamp-2" style={{ color: "var(--text-tertiary)" }}>
                    {t.body.slice(0, 120)}{t.body.length > 120 ? "…" : ""}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="btn btn-sm" onClick={() => openEdit(t)}>編輯</button>
                  {!t.isSystem && (
                    <button className="btn btn-sm" onClick={() => remove(t)} style={{ color: "var(--red)" }}>刪除</button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {tenantTpls.length === 0 && (
            <div className="text-center py-10 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
              尚無預設模板
            </div>
          )}
        </div>
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "編輯模板" : "新增預設模板"} width="720px">
        <Field label="觸發時機">
          <select className="input" value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })}>
            {TRIGGERS.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="模板名稱">
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="主旨" hint="可用變數：{{event.name}}、{{vendor.contact}}、{{vendor.company}}">
          <input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        </Field>
        <Field label="內文" hint="支援多行；換行用 \n">
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
