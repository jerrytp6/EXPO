import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useData } from "../../store/data";
import { SceneHead, Panel, DataRow, Field, StatGrid } from "../../components/Scene";
import { Modal } from "../../components/Modal";
import { toast } from "../../store/toast";

const CATEGORIES = ["電力", "網路", "展示器材", "桌椅家具", "燈光音響", "其他"];

// PDF p13「設備申請」— 管理端目錄維護 + 申請案件檢視
export default function EquipmentCatalog() {
  const { eventId } = useParams();
  const {
    eventEquipmentCatalog, equipmentRequests, events,
    createEquipmentItem, updateEquipmentItem, deleteEquipmentItem, reviewEquipmentRequest,
  } = useData();
  const event = events.find((e) => e.id === eventId);
  const catalog = (eventEquipmentCatalog || []).filter((c) => c.eventId === eventId);
  const requests = (equipmentRequests || []).filter((r) => r.eventId === eventId);

  const [tab, setTab] = useState("catalog"); // catalog | requests
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ category: "電力", name: "", spec: "", unit: "組", unitPrice: 0, stock: 0 });

  const stats = useMemo(() => {
    const totalItems = catalog.length;
    const totalRevenue = requests.filter((r) => r.status === "approved").reduce((s, r) => s + (r.totalAmount || 0), 0);
    const pending = requests.filter((r) => r.status === "submitted" || r.status === "pdf_generated").length;
    return [
      { label: "設備品項數", value: totalItems },
      { label: "申請案件", value: requests.length },
      { label: "待審案件", value: pending, deltaColor: "var(--orange)" },
      { label: "已核可金額", value: `NT$ ${totalRevenue.toLocaleString()}`, deltaColor: "var(--green)" },
    ];
  }, [catalog, requests]);

  const openNew = () => { setEditing(null); setForm({ category: "電力", name: "", spec: "", unit: "組", unitPrice: 0, stock: 0 }); setOpen(true); };
  const openEdit = (i) => { setEditing(i); setForm({ category: i.category, name: i.name, spec: i.spec, unit: i.unit, unitPrice: i.unitPrice, stock: i.stock }); setOpen(true); };
  const submit = () => {
    if (!form.name) { toast.error("請填寫品項名稱"); return; }
    if (editing) { updateEquipmentItem(editing.id, form); toast.success("已更新"); }
    else { createEquipmentItem({ ...form, eventId }); toast.success("已新增"); }
    setOpen(false);
  };
  const remove = (i) => {
    if (!confirm(`確定刪除「${i.name}」？`)) return;
    deleteEquipmentItem(i.id);
    toast.info("已刪除");
  };

  const approveReq = (id) => { reviewEquipmentRequest(id, "approved", "", "活動管理員"); toast.success("已核可"); };
  const rejectReq = (id) => {
    const reason = prompt("退回原因：");
    if (reason === null) return;
    reviewEquipmentRequest(id, "rejected", reason, "活動管理員");
    toast.info("已退回");
  };

  return (
    <>
      <SceneHead
        tag="EQUIPMENT · 設備申請"
        title={`${event?.name || "—"} 設備申請管理`}
        desc="維護設備目錄；審核廠商的設備申請單。"
      />

      <StatGrid stats={stats} />

      <div className="flex gap-2 mb-4">
        <button className={`btn ${tab === "catalog" ? "btn-primary" : ""}`} onClick={() => setTab("catalog")}>設備目錄</button>
        <button className={`btn ${tab === "requests" ? "btn-primary" : ""}`} onClick={() => setTab("requests")}>申請案件</button>
      </div>

      {tab === "catalog" && (
        <>
          <div className="flex justify-end mb-3">
            <button className="btn btn-primary" onClick={openNew}>+ 新增設備</button>
          </div>
          <Panel>
            <DataRow
              header
              cols={[
                { content: "類別",   w: "0.7fr" },
                { content: "品項",   w: "2fr" },
                { content: "規格",   w: "1.4fr" },
                { content: "單位",   w: "0.5fr" },
                { content: "單價",   w: "0.8fr" },
                { content: "庫存",   w: "0.6fr" },
                { content: "動作",   w: "0.8fr" },
              ]}
            />
            {catalog.map((i) => (
              <DataRow
                key={i.id}
                cols={[
                  { content: <span className="chip">{i.category}</span>, w: "0.7fr" },
                  { content: <span className="font-medium">{i.name}</span>, w: "2fr" },
                  { content: <span className="text-[12px]">{i.spec}</span>, w: "1.4fr" },
                  { content: i.unit, w: "0.5fr" },
                  { content: <span className="font-medium">NT$ {i.unitPrice.toLocaleString()}</span>, w: "0.8fr" },
                  { content: <span className="text-[12px]">{i.stock}</span>, w: "0.6fr" },
                  {
                    content: (
                      <div className="flex gap-1">
                        <button className="btn btn-sm" onClick={() => openEdit(i)}>編輯</button>
                        <button className="btn btn-sm" onClick={() => remove(i)} style={{ color: "var(--red)" }}>刪除</button>
                      </div>
                    ),
                    w: "0.8fr",
                  },
                ]}
              />
            ))}
            {catalog.length === 0 && <div className="text-center py-10 text-[13px]" style={{ color: "var(--text-tertiary)" }}>尚未建立設備目錄</div>}
          </Panel>
        </>
      )}

      {tab === "requests" && (
        <Panel>
          <DataRow
            header
            cols={[
              { content: "廠商",       w: "1.5fr" },
              { content: "品項數",     w: "0.6fr" },
              { content: "總金額",     w: "0.8fr" },
              { content: "狀態",       w: "1.2fr" },
              { content: "繳交檔案",   w: "1.4fr" },
              { content: "動作",       w: "1.2fr" },
            ]}
          />
          {requests.map((r) => {
            const vendor = useData.getState().vendors.find((v) => v.id === r.vendorId);
            const statusLabel = {
              draft: "草稿", submitted: "待審", pdf_generated: "已產 PDF",
              signed_uploaded: "已上傳簽檔", paid: "已付款", approved: "已核可", rejected: "已退回",
            }[r.status] || r.status;
            const statusCls = {
              approved: "chip-green", rejected: "chip-red",
              submitted: "chip-orange", pdf_generated: "chip-blue",
              draft: "",
            }[r.status] || "";
            return (
              <DataRow
                key={r.id}
                cols={[
                  {
                    content: (
                      <div>
                        <div className="font-medium">{vendor?.company || "—"}</div>
                        <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                          {vendor?.contact} · {r.createdAt}
                        </div>
                      </div>
                    ),
                    w: "1.5fr",
                  },
                  { content: <span className="text-[13px]">{r.items.length} 項</span>, w: "0.6fr" },
                  { content: <span className="font-medium">NT$ {r.totalAmount.toLocaleString()}</span>, w: "0.8fr" },
                  { content: <span className={`chip ${statusCls}`}>{statusLabel}</span>, w: "1.2fr" },
                  {
                    content: (
                      <div className="text-[12px]">
                        {r.signedFileName && <div>📎 {r.signedFileName}</div>}
                        {r.paymentProofFileName && <div>💰 {r.paymentProofFileName}</div>}
                        {!r.signedFileName && !r.paymentProofFileName && <span style={{ color: "var(--text-tertiary)" }}>—</span>}
                      </div>
                    ),
                    w: "1.4fr",
                  },
                  {
                    content: (r.status === "submitted" || r.status === "signed_uploaded") ? (
                      <div className="flex gap-1">
                        <button className="btn btn-sm btn-primary" onClick={() => approveReq(r.id)}>核可</button>
                        <button className="btn btn-sm" onClick={() => rejectReq(r.id)} style={{ color: "var(--red)" }}>退回</button>
                      </div>
                    ) : <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>—</span>,
                    w: "1.2fr",
                  },
                ]}
              />
            );
          })}
          {requests.length === 0 && <div className="text-center py-10 text-[13px]" style={{ color: "var(--text-tertiary)" }}>尚無申請案件</div>}
        </Panel>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "編輯設備" : "新增設備"} width="560px">
        <div className="grid grid-cols-2 gap-4">
          <Field label="類別">
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="單位">
            <input className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          </Field>
        </div>
        <Field label="品項名稱">
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="110V 單相電源 15A" />
        </Field>
        <Field label="規格">
          <input className="input" value={form.spec} onChange={(e) => setForm({ ...form, spec: e.target.value })} placeholder="110V / 15A / 單相" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="單價 NT$">
            <input className="input" type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: parseInt(e.target.value || "0") })} />
          </Field>
          <Field label="可提供庫存">
            <input className="input" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value || "0") })} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <button className="btn" onClick={() => setOpen(false)}>取消</button>
          <button className="btn btn-primary" onClick={submit}>{editing ? "儲存" : "新增"}</button>
        </div>
      </Modal>
    </>
  );
}
