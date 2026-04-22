import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useData } from "../../store/data";
import { SceneHead, Panel, DataRow, Field } from "../../components/Scene";
import { Modal } from "../../components/Modal";
import { toast } from "../../store/toast";

const CATEGORIES = ["會場資訊", "進場", "費用", "裝潢", "配備", "設備", "議程", "須知", "展前", "申請", "其他"];

// 客戶模組 #5「文件管理」— PDF p11 須知（勾同意型）
export default function Notices() {
  const { eventId } = useParams();
  const { eventNotices, noticeAcknowledgments, vendors, events, createNotice, updateNotice, deleteNotice } = useData();
  const event = events.find((e) => e.id === eventId);
  const notices = (eventNotices || []).filter((n) => n.eventId === eventId).sort((a, b) => a.sortOrder - b.sortOrder);
  const eventVendors = vendors.filter((v) => v.eventId === eventId);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    category: "其他", title: "", content: "",
    requiresAck: true, allowDecoratorView: false, attachmentName: "",
    sortOrder: 0,
  });

  const ackStats = useMemo(() => {
    const total = eventVendors.length;
    return notices.reduce((acc, n) => {
      const ackedCount = (noticeAcknowledgments || []).filter(
        (a) => a.eventId === eventId && a.noticeId === n.id
      ).length;
      acc[n.id] = { acked: ackedCount, total };
      return acc;
    }, {});
  }, [notices, noticeAcknowledgments, eventVendors, eventId]);

  const openNew = () => {
    setEditing(null);
    setForm({ category: "其他", title: "", content: "", requiresAck: true, allowDecoratorView: false, attachmentName: "", sortOrder: notices.length + 1 });
    setOpen(true);
  };
  const openEdit = (n) => {
    setEditing(n);
    setForm({
      category: n.category, title: n.title, content: n.content,
      requiresAck: n.requiresAck, allowDecoratorView: n.allowDecoratorView,
      attachmentName: n.attachmentName || "", sortOrder: n.sortOrder,
    });
    setOpen(true);
  };
  const submit = () => {
    if (!form.title) { toast.error("請填寫標題"); return; }
    if (editing) {
      updateNotice(editing.id, form);
      toast.success("須知已更新");
    } else {
      createNotice({ ...form, eventId, attachmentName: form.attachmentName || null });
      toast.success("已新增須知");
    }
    setOpen(false);
  };
  const remove = (n) => {
    if (!confirm(`確定刪除「${n.title}」？`)) return;
    deleteNotice(n.id);
    toast.info("已刪除");
  };

  return (
    <>
      <SceneHead
        tag="NOTICES · 文件管理"
        title={`${event?.name || "—"} 文件須知`}
        desc="展覽須知文件；廠商登入後閱讀並勾選同意。裝潢廠商入口可設為可見（唯讀）。"
      />

      <div className="flex justify-end mb-4">
        <button className="btn btn-primary" onClick={openNew}>+ 新增須知</button>
      </div>

      <Panel>
        <DataRow
          header
          cols={[
            { content: "順序",           w: "0.5fr" },
            { content: "類別",           w: "0.8fr" },
            { content: "標題",           w: "2fr" },
            { content: "需勾選",         w: "0.6fr" },
            { content: "裝潢商可見",     w: "0.8fr" },
            { content: "附件",           w: "1.2fr" },
            { content: "勾選進度",       w: "1fr" },
            { content: "動作",           w: "1fr" },
          ]}
        />
        {notices.map((n) => {
          const { acked, total } = ackStats[n.id] || { acked: 0, total: 0 };
          return (
            <DataRow
              key={n.id}
              cols={[
                { content: <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>#{n.sortOrder}</span>, w: "0.5fr" },
                { content: <span className="chip">{n.category}</span>, w: "0.8fr" },
                {
                  content: (
                    <div>
                      <div className="font-medium text-ink-primary">{n.title}</div>
                      <div className="text-[12px] line-clamp-1" style={{ color: "var(--text-tertiary)" }}>
                        {n.content.slice(0, 60)}{n.content.length > 60 ? "…" : ""}
                      </div>
                    </div>
                  ),
                  w: "2fr",
                },
                {
                  content: n.requiresAck ? <span className="chip chip-blue">✓ 必勾</span> : <span className="chip">閱讀即可</span>,
                  w: "0.6fr",
                },
                {
                  content: n.allowDecoratorView ? <span className="chip chip-orange">可見</span> : <span className="chip">隱藏</span>,
                  w: "0.8fr",
                },
                {
                  content: n.attachmentName ? (
                    <span className="text-[12px] truncate">📎 {n.attachmentName}</span>
                  ) : (
                    <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>—</span>
                  ),
                  w: "1.2fr",
                },
                {
                  content: n.requiresAck ? (
                    <div>
                      <div className="text-[13px] font-medium">{acked}/{total}</div>
                      <div className="h-1.5 rounded-full mt-1" style={{ background: "var(--separator)" }}>
                        <div className="h-full rounded-full" style={{ width: `${total ? (acked / total * 100) : 0}%`, background: "var(--green)" }} />
                      </div>
                    </div>
                  ) : <span style={{ color: "var(--text-tertiary)" }}>—</span>,
                  w: "1fr",
                },
                {
                  content: (
                    <div className="flex gap-1">
                      <button className="btn btn-sm" onClick={() => openEdit(n)}>編輯</button>
                      <button className="btn btn-sm" onClick={() => remove(n)} style={{ color: "var(--red)" }}>刪除</button>
                    </div>
                  ),
                  w: "1fr",
                },
              ]}
            />
          );
        })}
        {notices.length === 0 && (
          <div className="text-center py-10 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            尚未建立任何須知
          </div>
        )}
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "編輯須知" : "新增須知"} width="680px">
        <div className="grid grid-cols-2 gap-4">
          <Field label="類別">
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="順序">
            <input className="input" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value || "0") })} />
          </Field>
        </div>
        <Field label="標題">
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="內容">
          <textarea className="input" rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </Field>
        <Field label="附件檔名（選填）" hint="Demo 模式：實際檔案略">
          <input className="input" value={form.attachmentName} onChange={(e) => setForm({ ...form, attachmentName: e.target.value })} placeholder="map.pdf" />
        </Field>
        <div className="flex items-center gap-6 mt-2">
          <label className="flex items-center gap-2 text-[14px]">
            <input type="checkbox" checked={form.requiresAck} onChange={(e) => setForm({ ...form, requiresAck: e.target.checked })} />
            廠商需勾選「同意」
          </label>
          <label className="flex items-center gap-2 text-[14px]">
            <input type="checkbox" checked={form.allowDecoratorView} onChange={(e) => setForm({ ...form, allowDecoratorView: e.target.checked })} />
            裝潢廠商入口可見（唯讀）
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button className="btn" onClick={() => setOpen(false)}>取消</button>
          <button className="btn btn-primary" onClick={submit}>{editing ? "儲存" : "新增"}</button>
        </div>
      </Modal>
    </>
  );
}
