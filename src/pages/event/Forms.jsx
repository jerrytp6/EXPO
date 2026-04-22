import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useData } from "../../store/data";
import { SceneHead, Panel, DataRow, Field } from "../../components/Scene";
import { Modal } from "../../components/Modal";
import { toast } from "../../store/toast";

const CATEGORIES = ["切結書", "施工", "撤場", "行銷", "申請", "配備", "費用", "其他"];

// 客戶模組 #6「表單管理」— PDF p12 表單（下載-簽-上傳 + 條件顯示 + 計費審核）
export default function Forms() {
  const { eventId } = useParams();
  const { eventForms, formSubmissions, vendors, events, createForm, updateForm, deleteForm } = useData();
  const event = events.find((e) => e.id === eventId);
  const forms = (eventForms || []).filter((f) => f.eventId === eventId).sort((a, b) => a.sortOrder - b.sortOrder);
  const eventVendors = vendors.filter((v) => v.eventId === eventId);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    category: "其他", name: "", templateFileName: "", formats: ".pdf",
    isRequired: true, hasFee: false, skipOption: false,
    showWhenField: "none", showWhenValue: "",
    deadline: "", sortOrder: 0, allowDecoratorUpload: false,
  });

  const submissionStats = useMemo(() => {
    return forms.reduce((acc, f) => {
      const subs = (formSubmissions || []).filter((s) => s.eventId === eventId && s.formId === f.id);
      // 若同一廠商有多筆，取最新
      const byVendor = new Map();
      subs.forEach((s) => {
        const existing = byVendor.get(s.vendorId);
        if (!existing || s.submittedAt > existing.submittedAt) byVendor.set(s.vendorId, s);
      });
      const list = Array.from(byVendor.values());
      const approved = list.filter((s) => s.status === "approved").length;
      const pendingFee = list.filter((s) => s.status === "pending_fee_review").length;
      const submitted = list.filter((s) => s.status === "submitted").length;
      acc[f.id] = { approved, pendingFee, submitted, total: list.length, vendorTotal: eventVendors.length };
      return acc;
    }, {});
  }, [forms, formSubmissions, eventId, eventVendors]);

  const openNew = () => {
    setEditing(null);
    setForm({
      category: "其他", name: "", templateFileName: "", formats: ".pdf",
      isRequired: true, hasFee: false, skipOption: false,
      showWhenField: "none", showWhenValue: "",
      deadline: "", sortOrder: forms.length + 1, allowDecoratorUpload: false,
    });
    setOpen(true);
  };
  const openEdit = (f) => {
    setEditing(f);
    setForm({
      category: f.category, name: f.name, templateFileName: f.templateFileName || "", formats: f.formats,
      isRequired: f.isRequired, hasFee: f.hasFee, skipOption: f.skipOption,
      showWhenField: f.showWhen?.field || "none",
      showWhenValue: f.showWhen?.value || "",
      deadline: f.deadline || "", sortOrder: f.sortOrder,
      allowDecoratorUpload: f.allowDecoratorUpload || false,
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.name) { toast.error("請填寫表單名稱"); return; }
    const payload = {
      category: form.category,
      name: form.name,
      templateFileName: form.templateFileName || null,
      formats: form.formats || ".pdf",
      isRequired: form.isRequired,
      hasFee: form.hasFee,
      skipOption: form.skipOption,
      showWhen: form.showWhenField === "none" ? null : { field: form.showWhenField, value: form.showWhenValue },
      deadline: form.deadline,
      sortOrder: form.sortOrder,
      allowDecoratorUpload: form.allowDecoratorUpload,
    };
    if (editing) {
      updateForm(editing.id, payload);
      toast.success("表單已更新");
    } else {
      createForm({ ...payload, eventId });
      toast.success("已新增表單");
    }
    setOpen(false);
  };
  const remove = (f) => {
    if (!confirm(`確定刪除「${f.name}」？所有繳交紀錄也會一併刪除。`)) return;
    deleteForm(f.id);
    toast.info("已刪除");
  };

  return (
    <>
      <SceneHead
        tag="FORMS · 表單管理"
        title={`${event?.name || "—"} 表單管理`}
        desc="廠商下載 → 簽署 → 上傳審核。支援條件顯示（自行裝潢才出現）、費用審核分流、跳過選項。"
      />

      <div className="flex justify-end mb-4">
        <button className="btn btn-primary" onClick={openNew}>+ 新增表單</button>
      </div>

      <Panel>
        <DataRow
          header
          cols={[
            { content: "順序",     w: "0.4fr" },
            { content: "類別",     w: "0.7fr" },
            { content: "表單名稱", w: "2fr" },
            { content: "屬性",     w: "1.4fr" },
            { content: "截止日",   w: "0.9fr" },
            { content: "繳交進度", w: "1.2fr" },
            { content: "動作",     w: "0.9fr" },
          ]}
        />
        {forms.map((f) => {
          const s = submissionStats[f.id] || { approved: 0, pendingFee: 0, submitted: 0, total: 0, vendorTotal: 0 };
          return (
            <DataRow
              key={f.id}
              cols={[
                { content: <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>#{f.sortOrder}</span>, w: "0.4fr" },
                { content: <span className="chip">{f.category}</span>, w: "0.7fr" },
                {
                  content: (
                    <div>
                      <div className="font-medium text-ink-primary">{f.name}</div>
                      <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                        {f.templateFileName || "（無範本檔）"} · 接受 {f.formats}
                      </div>
                    </div>
                  ),
                  w: "2fr",
                },
                {
                  content: (
                    <div className="flex flex-wrap gap-1">
                      {f.isRequired && <span className="chip chip-red">必繳</span>}
                      {f.hasFee && <span className="chip chip-orange">含費用</span>}
                      {f.skipOption && <span className="chip">可跳過</span>}
                      {f.showWhen && <span className="chip chip-purple">條件：{f.showWhen.field}={f.showWhen.value}</span>}
                      {f.allowDecoratorUpload && <span className="chip chip-blue">裝潢商可上傳</span>}
                    </div>
                  ),
                  w: "1.4fr",
                },
                { content: <span className="text-[12px]">{f.deadline || "—"}</span>, w: "0.9fr" },
                {
                  content: (
                    <div className="text-[12px]">
                      <div>已通過 <b>{s.approved}</b> / 已繳 <b>{s.total}</b></div>
                      {s.pendingFee > 0 && <div style={{ color: "var(--orange)" }}>費用待審 {s.pendingFee}</div>}
                    </div>
                  ),
                  w: "1.2fr",
                },
                {
                  content: (
                    <div className="flex gap-1">
                      <button className="btn btn-sm" onClick={() => openEdit(f)}>編輯</button>
                      <button className="btn btn-sm" onClick={() => remove(f)} style={{ color: "var(--red)" }}>刪除</button>
                    </div>
                  ),
                  w: "0.9fr",
                },
              ]}
            />
          );
        })}
        {forms.length === 0 && (
          <div className="text-center py-10 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            尚未建立任何表單
          </div>
        )}
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "編輯表單" : "新增表單"} width="720px">
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
        <Field label="表單名稱">
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="攤位廠商參展切結書" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="範本檔名" hint="廠商可下載的空白表單">
            <input className="input" value={form.templateFileName} onChange={(e) => setForm({ ...form, templateFileName: e.target.value })} placeholder="切結書.pdf" />
          </Field>
          <Field label="接受格式">
            <input className="input" value={form.formats} onChange={(e) => setForm({ ...form, formats: e.target.value })} placeholder=".pdf,.jpg" />
          </Field>
        </div>
        <Field label="截止日期">
          <input className="input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        </Field>

        <div className="border rounded-xl p-4 mb-4" style={{ borderColor: "var(--separator)", background: "var(--bg-tinted)" }}>
          <div className="text-[12px] font-semibold mb-3" style={{ color: "var(--text-tertiary)" }}>審核 / 屬性</div>
          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-[14px]">
              <input type="checkbox" checked={form.isRequired} onChange={(e) => setForm({ ...form, isRequired: e.target.checked })} />
              必繳
            </label>
            <label className="flex items-center gap-2 text-[14px]">
              <input type="checkbox" checked={form.hasFee} onChange={(e) => setForm({ ...form, hasFee: e.target.checked })} />
              有費用須審（需上傳匯款單）
            </label>
            <label className="flex items-center gap-2 text-[14px]">
              <input type="checkbox" checked={form.skipOption} onChange={(e) => setForm({ ...form, skipOption: e.target.checked })} />
              允許廠商選「不需要」
            </label>
            <label className="flex items-center gap-2 text-[14px]">
              <input type="checkbox" checked={form.allowDecoratorUpload} onChange={(e) => setForm({ ...form, allowDecoratorUpload: e.target.checked })} />
              裝潢廠商可代為上傳
            </label>
          </div>
        </div>

        <div className="border rounded-xl p-4" style={{ borderColor: "var(--separator)", background: "var(--bg-tinted)" }}>
          <div className="text-[12px] font-semibold mb-3" style={{ color: "var(--text-tertiary)" }}>條件顯示</div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="條件欄位">
              <select className="input" value={form.showWhenField} onChange={(e) => setForm({ ...form, showWhenField: e.target.value })}>
                <option value="none">無條件（一律顯示）</option>
                <option value="decorationMode">廠商裝潢方式</option>
              </select>
            </Field>
            {form.showWhenField === "decorationMode" && (
              <Field label="條件值">
                <select className="input" value={form.showWhenValue} onChange={(e) => setForm({ ...form, showWhenValue: e.target.value })}>
                  <option value="">（請選擇）</option>
                  <option value="self">自行裝潢</option>
                  <option value="booth-vendor">攤位廠商裝潢</option>
                </select>
              </Field>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button className="btn" onClick={() => setOpen(false)}>取消</button>
          <button className="btn btn-primary" onClick={submit}>{editing ? "儲存" : "新增"}</button>
        </div>
      </Modal>
    </>
  );
}
