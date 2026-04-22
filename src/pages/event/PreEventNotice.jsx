import { useState } from "react";
import { useParams } from "react-router-dom";
import { useData } from "../../store/data";
import { SceneHead, Panel, Field, DataRow } from "../../components/Scene";
import { Modal } from "../../components/Modal";
import { toast } from "../../store/toast";

const AUDIENCE = [
  { key: "all",        label: "所有廠商" },
  { key: "registered", label: "已註冊" },
  { key: "confirmed",  label: "已確認參展" },
];
const CHANNELS = [
  { key: "email",  label: "Email" },
  { key: "portal", label: "廠商入口" },
  { key: "sms",    label: "SMS" },
];

// 客戶模組 #7「展前通知」— PDF「佈展/進場指引」
export default function PreEventNotice() {
  const { eventId } = useParams();
  const { preEventNotices, events, createPreEventNotice, updatePreEventNotice, deletePreEventNotice, sendPreEventNotice } = useData();
  const event = events.find((e) => e.id === eventId);
  const list = (preEventNotices || []).filter((p) => p.eventId === eventId);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "", content: "", audience: "registered", channels: ["email", "portal"], scheduledAt: "", attachments: [],
  });

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", content: "", audience: "registered", channels: ["email", "portal"], scheduledAt: "", attachments: [] });
    setOpen(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title, content: p.content, audience: p.audience,
      channels: p.channels || ["email"], scheduledAt: p.scheduledAt || "", attachments: p.attachments || [],
    });
    setOpen(true);
  };
  const submit = () => {
    if (!form.title || !form.content) { toast.error("請填寫標題與內容"); return; }
    if (editing) { updatePreEventNotice(editing.id, form); toast.success("已更新"); }
    else { createPreEventNotice({ ...form, eventId, status: form.scheduledAt ? "scheduled" : "draft", sentAt: null }); toast.success("已建立"); }
    setOpen(false);
  };
  const send = (p) => {
    if (!confirm(`確定立即發送「${p.title}」？`)) return;
    sendPreEventNotice(p.id);
    toast.success("已發送（Demo 模擬）");
  };
  const remove = (p) => {
    if (!confirm(`確定刪除「${p.title}」？`)) return;
    deletePreEventNotice(p.id);
    toast.info("已刪除");
  };

  const toggleChannel = (k) => {
    setForm((f) => ({
      ...f,
      channels: f.channels.includes(k) ? f.channels.filter((c) => c !== k) : [...f.channels, k],
    }));
  };

  const statusLabel = (s) => ({ draft: "草稿", scheduled: "已排程", sent: "已發送" }[s] || s);
  const statusCls = (s) => ({ draft: "", scheduled: "chip-blue", sent: "chip-green" }[s] || "");

  return (
    <>
      <SceneHead
        tag="PRE-EVENT · 展前通知"
        title={`${event?.name || "—"} 展前通知`}
        desc="佈展/進場指引；可排程發送給已註冊或已確認參展的廠商。"
      />

      <div className="flex justify-end mb-4">
        <button className="btn btn-primary" onClick={openNew}>+ 新增通知</button>
      </div>

      <Panel>
        <DataRow
          header
          cols={[
            { content: "標題",       w: "2fr" },
            { content: "對象",       w: "0.8fr" },
            { content: "管道",       w: "1fr" },
            { content: "排程時間",   w: "1.3fr" },
            { content: "狀態",       w: "0.7fr" },
            { content: "動作",       w: "1.4fr" },
          ]}
        />
        {list.map((p) => (
          <DataRow
            key={p.id}
            cols={[
              {
                content: (
                  <div>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-[12px] line-clamp-1" style={{ color: "var(--text-tertiary)" }}>
                      {p.content.slice(0, 80)}{p.content.length > 80 ? "…" : ""}
                    </div>
                  </div>
                ),
                w: "2fr",
              },
              { content: <span className="chip">{AUDIENCE.find((a) => a.key === p.audience)?.label}</span>, w: "0.8fr" },
              {
                content: (
                  <div className="flex gap-1 flex-wrap">
                    {(p.channels || []).map((c) => (
                      <span key={c} className="chip chip-blue">{CHANNELS.find((x) => x.key === c)?.label || c}</span>
                    ))}
                  </div>
                ),
                w: "1fr",
              },
              { content: <span className="text-[12px]">{p.scheduledAt || "—"}</span>, w: "1.3fr" },
              { content: <span className={`chip ${statusCls(p.status)}`}>{statusLabel(p.status)}</span>, w: "0.7fr" },
              {
                content: (
                  <div className="flex gap-1">
                    {p.status !== "sent" && (
                      <>
                        <button className="btn btn-sm btn-primary" onClick={() => send(p)}>立即發送</button>
                        <button className="btn btn-sm" onClick={() => openEdit(p)}>編輯</button>
                      </>
                    )}
                    <button className="btn btn-sm" onClick={() => remove(p)} style={{ color: "var(--red)" }}>刪除</button>
                  </div>
                ),
                w: "1.4fr",
              },
            ]}
          />
        ))}
        {list.length === 0 && <div className="text-center py-10 text-[13px]" style={{ color: "var(--text-tertiary)" }}>尚無展前通知</div>}
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "編輯通知" : "新增展前通知"} width="640px">
        <Field label="標題">
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="展前 7 日重要通知" />
        </Field>
        <Field label="內容">
          <textarea className="input" rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="發送對象">
            <select className="input" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
              {AUDIENCE.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
            </select>
          </Field>
          <Field label="排程時間" hint="留空代表建立為草稿">
            <input className="input" type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
          </Field>
        </div>
        <Field label="發送管道">
          <div className="flex gap-4">
            {CHANNELS.map((c) => (
              <label key={c.key} className="flex items-center gap-2 text-[14px]">
                <input type="checkbox" checked={form.channels.includes(c.key)} onChange={() => toggleChannel(c.key)} />
                {c.label}
              </label>
            ))}
          </div>
        </Field>
        <div className="flex justify-end gap-2 mt-2">
          <button className="btn" onClick={() => setOpen(false)}>取消</button>
          <button className="btn btn-primary" onClick={submit}>{editing ? "儲存" : "建立"}</button>
        </div>
      </Modal>
    </>
  );
}
