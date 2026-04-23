import { useState } from "react";
import { useData } from "../../store/data";
import { SceneHead, Panel, DataRow, Field } from "../../components/Scene";
import { Modal } from "../../components/Modal";
import { toast } from "../../store/toast";

export default function PortalTenants() {
  const { companies, createCompany, approveCompany, rejectCompany } = useData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", taxId: "", industry: "", size: "", address: "", phone: "" });

  const submit = () => {
    if (!form.name || !form.taxId) { toast.error("請填寫公司名稱與統編"); return; }
    createCompany({ ...form, status: "active" }); // Portal 建立直接啟用
    toast.success(`已建立租戶：${form.name}`);
    setForm({ name: "", taxId: "", industry: "", size: "", address: "", phone: "" });
    setOpen(false);
  };

  const approve = (c) => {
    approveCompany(c.id);
    toast.success(`已核准：${c.name}`);
  };

  const remove = (c) => {
    if (!confirm(`確定刪除「${c.name}」？該租戶所有資料將被清除`)) return;
    rejectCompany(c.id);
    toast.info("已刪除");
  };

  return (
    <>
      <SceneHead
        tag="TENANTS · 租戶管理"
        title="租戶生命週期管理"
        desc="建立新租戶、審核企業註冊、停用與合約管理。"
      />

      <div className="flex justify-end mb-4">
        <button className="btn btn-primary" onClick={() => setOpen(true)}>+ 建立新租戶</button>
      </div>

      <Panel>
        <DataRow
          header
          cols={[
            { content: "租戶名稱",       w: "2fr" },
            { content: "統編",           w: "0.8fr" },
            { content: "產業 / 規模",    w: "1.2fr" },
            { content: "聯絡",           w: "1.2fr" },
            { content: "狀態",           w: "0.7fr" },
            { content: "建立日",         w: "0.8fr" },
            { content: "動作",           w: "1.4fr" },
          ]}
        />
        {companies.map((c) => (
          <DataRow
            key={c.id}
            cols={[
              {
                content: (
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>{c.address}</div>
                  </div>
                ),
                w: "2fr",
              },
              { content: <span className="text-[12px]">{c.taxId}</span>, w: "0.8fr" },
              {
                content: (
                  <div className="text-[12px]">
                    <div>{c.industry}</div>
                    <div style={{ color: "var(--text-tertiary)" }}>{c.size}</div>
                  </div>
                ),
                w: "1.2fr",
              },
              { content: <span className="text-[12px]">{c.phone}</span>, w: "1.2fr" },
              {
                content: (
                  <span className={`chip ${c.status === "active" ? "chip-green" : "chip-orange"}`}>
                    {c.status === "active" ? "啟用中" : "待審核"}
                  </span>
                ),
                w: "0.7fr",
              },
              { content: <span className="text-[12px]">{c.createdAt}</span>, w: "0.8fr" },
              {
                content: (
                  <div className="flex gap-1">
                    {c.status === "pending" && (
                      <button className="btn btn-sm btn-primary" onClick={() => approve(c)}>核准</button>
                    )}
                    <button className="btn btn-sm" onClick={() => remove(c)} style={{ color: "var(--red)" }}>刪除</button>
                  </div>
                ),
                w: "1.4fr",
              },
            ]}
          />
        ))}
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)} title="建立新租戶" width="560px">
        <Field label="公司名稱 *">
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例如：漢肯會議組" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="統一編號 *">
            <input className="input" value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} maxLength={8} />
          </Field>
          <Field label="聯絡電話">
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="產業">
            <input className="input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="資訊服務業" />
          </Field>
          <Field label="規模">
            <select className="input" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}>
              <option value="">請選擇</option>
              <option>1–10 人</option>
              <option>10–50 人</option>
              <option>50–100 人</option>
              <option>100–500 人</option>
              <option>500 人以上</option>
            </select>
          </Field>
        </div>
        <Field label="地址">
          <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </Field>
        <div className="p-3 rounded-lg text-[12px] mb-4" style={{ background: "rgba(0,113,227,0.08)", color: "var(--text-secondary)" }}>
          💡 建立後請到「子系統訂閱」為此租戶開通所需子系統，並至「帳號管理」建立該租戶的管理員帳號。
        </div>
        <div className="flex justify-end gap-2">
          <button className="btn" onClick={() => setOpen(false)}>取消</button>
          <button className="btn btn-primary" onClick={submit}>建立</button>
        </div>
      </Modal>
    </>
  );
}
