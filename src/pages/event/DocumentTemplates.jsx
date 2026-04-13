import { useState } from "react";
import { useData } from "../../store/data";
import { SceneHead, Panel, Field } from "../../components/Scene";
import { Modal } from "../../components/Modal";
import { Icon } from "../../components/Icon";
import { toast } from "../../store/toast";

const CATEGORIES = ["基本資料", "展位相關", "法規文件", "行銷素材", "其他"];

export default function DocumentTemplates() {
  const { documentTemplates, eventDocuments, submissions, events, createDocTemplate, updateDocTemplate, deleteDocTemplate } = useData();
  const templates = [...documentTemplates].sort((a, b) => a.sortOrder - b.sortOrder);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", category: CATEGORIES[0], required: true, formats: "" });

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    items: templates.filter((t) => t.category === cat),
  })).filter((g) => g.items.length > 0);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", category: CATEGORIES[0], required: true, formats: "" });
    setModalOpen(true);
  };
  const openEdit = (t) => {
    setEditing(t);
    setForm({ name: t.name, category: t.category, required: t.required, formats: t.formats });
    setModalOpen(true);
  };
  const submit = () => {
    if (!form.name.trim()) { toast.error("請輸入名稱"); return; }
    if (editing) { updateDocTemplate(editing.id, form); toast.success("已更新"); }
    else { createDocTemplate(form); toast.success("已新增"); }
    setModalOpen(false);
  };
  const remove = (t) => {
    const usedByEvents = eventDocuments.filter((ed) => ed.templateId === t.id);
    const hasSubs = submissions.some((s) => s.itemId === t.id);
    let msg = `確定刪除「${t.name}」？`;
    if (usedByEvents.length > 0) {
      const names = usedByEvents
        .map((ed) => events.find((e) => e.id === ed.eventId)?.name)
        .filter(Boolean);
      msg += `\n\n⚠ 此模板正被 ${usedByEvents.length} 場活動使用（${names.join("、")}）。`;
      if (hasSubs) msg += `\n⚠ 已有廠商繳交紀錄，刪除後相關紀錄不受影響但無法再新增。`;
      msg += `\n\n確定繼續？`;
    }
    if (!confirm(msg)) return;
    deleteDocTemplate(t.id);
    toast.info("已刪除");
  };

  return (
    <>
      <SceneHead
        tag="DOCUMENT LIBRARY"
        title="文件模板庫"
        desc="全域管理所有可繳交的文件類型。建立活動時從此處勾選即可。"
      />

      <div className="flex justify-between mb-5">
        <div className="text-[13px] font-display" style={{ color: "var(--text-tertiary)" }}>
          共 {templates.length} 個模板（{CATEGORIES.length} 類）
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ 新增模板</button>
      </div>

      {templates.length === 0 ? (
        <Panel>
          <div className="py-12 text-center">
            <Icon name="upload" className="icon mx-auto mb-3 w-10 h-10" style={{ stroke: "var(--text-tertiary)" }} />
            <h3 className="text-[17px] font-semibold mb-2">尚未建立文件模板</h3>
            <p className="text-[13px] mb-5" style={{ color: "var(--text-secondary)" }}>
              建立文件模板後，可在各活動中勾選需要的項目。
            </p>
            <button className="btn btn-primary" onClick={openNew}>+ 新增第一個模板</button>
          </div>
        </Panel>
      ) : (
        grouped.map((g) => (
          <Panel key={g.category} title={g.category}>
            <div className="space-y-2">
              {g.items.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-black/[0.02] transition-colors"
                  style={{ border: "1px solid var(--separator)" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium">{t.name}</span>
                      {t.required && <span className="badge badge-orange">預設必填</span>}
                    </div>
                    {t.formats && (
                      <div className="text-[11px] font-display mt-1" style={{ color: "var(--text-tertiary)" }}>
                        格式：{t.formats}
                      </div>
                    )}
                  </div>
                  <button className="btn btn-ghost !py-1 !text-xs" onClick={() => openEdit(t)}>編輯</button>
                  <button className="btn btn-ghost !py-1 !text-xs" onClick={() => remove(t)}>刪除</button>
                </div>
              ))}
            </div>
          </Panel>
        ))
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "編輯文件模板" : "新增文件模板"}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>取消</button>
            <button className="btn btn-primary" onClick={submit}>{editing ? "儲存" : "新增"}</button>
          </>
        }
      >
        <Field label="文件名稱 *">
          <input className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
            style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="例：公司 Logo（高解析）" />
        </Field>
        <div className="grid grid-cols-2 gap-x-4">
          <Field label="類別">
            <select className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
              style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
              value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="允許格式" hint="逗號分隔，空白不限">
            <input className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
              style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
              value={form.formats} onChange={(e) => setForm({ ...form, formats: e.target.value })}
              placeholder=".pdf,.png" />
          </Field>
        </div>
        <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer" style={{ background: "var(--bg-tinted)" }}>
          <input type="checkbox" checked={form.required}
            onChange={(e) => setForm({ ...form, required: e.target.checked })} />
          <span className="text-[13px] font-medium">預設為必填項目</span>
        </label>
      </Modal>
    </>
  );
}
