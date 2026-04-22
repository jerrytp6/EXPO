import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useData } from "../../store/data";
import { SceneHead, Panel, DataRow, StatGrid, Field } from "../../components/Scene";
import { Modal } from "../../components/Modal";
import { Icon } from "../../components/Icon";
import { toast } from "../../store/toast";

const PAY_STATUS = { paid: { l: "已繳", c: "badge-green" }, unpaid: { l: "未繳", c: "badge-orange" } };

export default function Booths() {
  const { eventId } = useParams();
  const { events, vendors, assignBooth, updatePaymentStatus } = useData();
  const event = events.find((e) => e.id === eventId);

  const [editVendor, setEditVendor] = useState(null);
  const [form, setForm] = useState({ boothTypeId: "", boothNumber: "" });

  if (!event) return <Navigate to="/event" replace />;

  const boothTypes = event.boothTypes || [];
  const confirmed = vendors.filter((v) => v.eventId === eventId && v.confirmStatus === "confirmed");

  const getBt = (id) => boothTypes.find((b) => b.id === id);

  const openAssign = (v) => {
    setEditVendor(v);
    setForm({ boothTypeId: v.boothTypeId || "", boothNumber: v.boothNumber || "" });
  };
  const saveAssign = () => {
    if (!editVendor) return;
    assignBooth(editVendor.id, form.boothTypeId || null, form.boothNumber);
    toast.success(`已分配攤位給 ${editVendor.company}`);
    setEditVendor(null);
  };
  const togglePayment = (vendorId, field) => {
    const v = confirmed.find((x) => x.id === vendorId);
    if (!v) return;
    const current = v[field];
    updatePaymentStatus(vendorId, field, current === "paid" ? "unpaid" : "paid");
  };

  const assigned = confirmed.filter((v) => v.boothNumber);
  const totalRevenue = confirmed.reduce((sum, v) => sum + (getBt(v.boothTypeId)?.price || 0), 0);
  const collectedDeposit = confirmed.filter((v) => v.depositStatus === "paid").reduce((sum, v) => sum + Math.round((getBt(v.boothTypeId)?.price || 0) * 0.5), 0);

  return (
    <>
      <SceneHead
        tag={`EVENT · ${event.name}`}
        title="攤位分配與繳費"
        desc="為已確認參展的廠商分配攤位並追蹤繳費狀態。"
      />

      <StatGrid
        stats={[
          { label: "參展名單", value: confirmed.length },
          { label: "已分配攤位", value: assigned.length, delta: confirmed.length ? `${Math.round(assigned.length / confirmed.length * 100)}%` : "—" },
          { label: "預估攤位收入", value: `NT$ ${totalRevenue.toLocaleString()}` },
          { label: "訂金已收", value: `NT$ ${collectedDeposit.toLocaleString()}`, delta: `${confirmed.filter((v) => v.depositStatus === "paid").length} 家` },
        ]}
      />

      {/* 攤位規格總覽 */}
      <Panel title="攤位規格">
        <div className="grid grid-cols-3 gap-3">
          {boothTypes.map((bt) => {
            const used = confirmed.filter((v) => v.boothTypeId === bt.id).length;
            return (
              <div key={bt.id} className="p-4 rounded-xl" style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] font-semibold">{bt.name}</span>
                  <span className="text-[12px] font-display" style={{ color: "var(--text-tertiary)" }}>{bt.size}</span>
                </div>
                <div className="text-xl font-bold font-display tracking-tight mb-1">
                  NT$ {bt.price.toLocaleString()}
                </div>
                <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{bt.description}</div>
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid var(--separator)" }}>
                  <span className="text-[11px] font-display" style={{ color: "var(--text-tertiary)" }}>
                    已分配 {used} / {bt.capacity}
                  </span>
                  <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (used / bt.capacity) * 100)}%`, background: "var(--role-color)" }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* 付款資訊提示 */}
      <div className="p-4 rounded-xl mb-6 text-[12px]"
        style={{ background: "rgba(0,113,227,0.05)", border: "1px solid rgba(0,113,227,0.15)", color: "var(--text-secondary)" }}>
        <strong style={{ color: "var(--blue)" }}>付款須知：</strong>
        訂金（攤位費 50%）請於報名確認後 2 週內匯款；尾款請於展前 3 個月內繳清。
        匯款帳戶：群揚資通 / 台北富邦銀行（012）/ 帳號 7001-0234-5678。點擊「已繳/未繳」可切換狀態。
      </div>

      {/* 廠商攤位列表 */}
      <Panel title={`參展廠商 (${confirmed.length})`}>
        {confirmed.length === 0 ? (
          <div className="py-10 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            參展名單為空 — 請先到廠商管理加入廠商
          </div>
        ) : (
          <>
            <DataRow
              header
              cols={[
                { content: "公司 / 統編", w: "2fr" },
                { content: "攤位", w: "1.2fr" },
                { content: "編號", w: "0.7fr" },
                { content: "攤位費", w: "1fr" },
                { content: "訂金 (50%)", w: "1fr" },
                { content: "尾款 (50%)", w: "1fr" },
                { content: "", w: "0.6fr" },
              ]}
            />
            {confirmed.map((v) => {
              const bt = getBt(v.boothTypeId);
              const price = bt?.price || 0;
              const deposit = Math.round(price * 0.5);
              const balance = price - deposit;
              const dep = v.depositStatus ? PAY_STATUS[v.depositStatus] : null;
              const bal = v.balanceStatus ? PAY_STATUS[v.balanceStatus] : null;
              return (
                <DataRow
                  key={v.id}
                  cols={[
                    {
                      content: (
                        <div>
                          <div className="font-medium">{v.company}</div>
                          <div className="text-[11px] font-display" style={{ color: "var(--text-tertiary)" }}>{v.taxId}{v.preferredBoothTypeId ? ` · 意願：${getBt(v.preferredBoothTypeId)?.name || "—"}` : ""}</div>
                        </div>
                      ),
                      w: "2fr",
                    },
                    { content: bt ? <span className="badge badge-blue">{bt.name}</span> : <span style={{ color: "var(--text-tertiary)" }}>未分配</span>, w: "1.2fr" },
                    { content: <span className="font-display font-medium">{v.boothNumber || "—"}</span>, w: "0.7fr" },
                    { content: bt ? <span className="font-display text-[12px]">NT$ {price.toLocaleString()}</span> : "—", w: "1fr" },
                    {
                      content: bt ? (
                        <div>
                          <button className={`badge ${dep?.c || "badge-orange"} cursor-pointer`} onClick={() => togglePayment(v.id, "depositStatus")}>
                            {dep?.l || "未繳"}
                          </button>
                          <div className="text-[10px] font-display mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                            NT$ {deposit.toLocaleString()}
                          </div>
                        </div>
                      ) : <span style={{ color: "var(--text-tertiary)" }}>—</span>,
                      w: "1fr",
                    },
                    {
                      content: bt ? (
                        <div>
                          <button className={`badge ${bal?.c || "badge-orange"} cursor-pointer`} onClick={() => togglePayment(v.id, "balanceStatus")}>
                            {bal?.l || "未繳"}
                          </button>
                          <div className="text-[10px] font-display mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                            NT$ {balance.toLocaleString()}
                          </div>
                        </div>
                      ) : <span style={{ color: "var(--text-tertiary)" }}>—</span>,
                      w: "1fr",
                    },
                    {
                      content: (
                        <button className="btn btn-ghost !py-1 !text-xs" onClick={() => openAssign(v)}>
                          {v.boothNumber ? "修改" : "分配"}
                        </button>
                      ),
                      w: "0.6fr",
                    },
                  ]}
                />
              );
            })}
          </>
        )}
      </Panel>

      {/* 分配 Modal */}
      <Modal
        open={!!editVendor}
        onClose={() => setEditVendor(null)}
        title={editVendor ? `攤位分配 — ${editVendor.company}` : ""}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEditVendor(null)}>取消</button>
            <button className="btn btn-primary" onClick={saveAssign}>確認分配</button>
          </>
        }
      >
        {editVendor && (
          <>
            <Field label="攤位類型">
              <select className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
                value={form.boothTypeId} onChange={(e) => setForm({ ...form, boothTypeId: e.target.value })}>
                <option value="">請選擇</option>
                {boothTypes.map((bt) => (
                  <option key={bt.id} value={bt.id}>
                    {bt.name} · {bt.size} · NT$ {bt.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="攤位編號" hint="例：A-12">
              <input className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
                value={form.boothNumber} onChange={(e) => setForm({ ...form, boothNumber: e.target.value })}
                placeholder="A-12" />
            </Field>
          </>
        )}
      </Modal>
    </>
  );
}
