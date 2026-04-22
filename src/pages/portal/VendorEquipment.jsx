import { useMemo, useState } from "react";
import { useData } from "../../store/data";
import { Icon } from "../../components/Icon";
import { toast } from "../../store/toast";

// 廠商端：設備申請 — PDF p13
// 瀏覽目錄 → 選擇數量 → 產生 PDF → 下載簽章 → 上傳 + 匯款單 → 審核
export default function VendorEquipment({ vendor, event }) {
  const {
    eventEquipmentCatalog, equipmentRequests,
    createEquipmentRequest, updateEquipmentRequest,
  } = useData();

  const catalog = useMemo(
    () => (eventEquipmentCatalog || []).filter((c) => c.eventId === event.id),
    [eventEquipmentCatalog, event.id]
  );
  const myRequests = useMemo(
    () => (equipmentRequests || []).filter((r) => r.eventId === event.id && r.vendorId === vendor.id),
    [equipmentRequests, event.id, vendor.id]
  );
  const activeRequest = myRequests.find((r) => r.status !== "rejected") || null;

  const [cart, setCart] = useState(activeRequest?.items || []);
  const [step, setStep] = useState(
    activeRequest?.status === "pdf_generated" ? 2 :
    activeRequest?.status === "signed_uploaded" ? 3 :
    activeRequest?.status === "submitted" || activeRequest?.status === "approved" || activeRequest?.status === "paid" ? 4 : 1
  );

  const categories = useMemo(() => {
    const set = new Set(catalog.map((c) => c.category));
    return Array.from(set);
  }, [catalog]);
  const [activeCat, setActiveCat] = useState(categories[0] || "電力");

  const filtered = catalog.filter((c) => c.category === activeCat);

  const addToCart = (item) => {
    const existing = cart.find((c) => c.catalogId === item.id);
    if (existing) {
      setCart(cart.map((c) => c.catalogId === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { catalogId: item.id, qty: 1, spec: "" }]);
    }
    toast.success(`已加入：${item.name}`);
  };
  const updateQty = (catalogId, qty) => {
    if (qty <= 0) setCart(cart.filter((c) => c.catalogId !== catalogId));
    else setCart(cart.map((c) => c.catalogId === catalogId ? { ...c, qty } : c));
  };

  const total = cart.reduce((sum, c) => {
    const item = catalog.find((x) => x.id === c.catalogId);
    return sum + (item?.unitPrice || 0) * c.qty;
  }, 0);

  const submitRequest = () => {
    if (cart.length === 0) { toast.error("請至少加入一項設備"); return; }
    createEquipmentRequest(event.id, vendor.id, cart);
    toast.success("已建立設備申請單");
    setStep(2);
  };

  const generatePdf = () => {
    if (!activeRequest) return;
    updateEquipmentRequest(activeRequest.id, {
      status: "pdf_generated",
      pdfGeneratedAt: new Date().toISOString().slice(0, 10),
    });
    toast.success("PDF 已產生（Demo 模擬）");
    setStep(2);
  };
  const uploadSigned = () => {
    if (!activeRequest) return;
    updateEquipmentRequest(activeRequest.id, {
      status: "signed_uploaded",
      signedFileName: `${vendor.company}-設備申請-簽.pdf`,
    });
    toast.success("已上傳簽署檔");
    setStep(3);
  };
  const uploadPayment = () => {
    if (!activeRequest) return;
    updateEquipmentRequest(activeRequest.id, {
      status: "submitted",
      paymentProofFileName: `${vendor.company}-匯款單.jpg`,
    });
    toast.success("已上傳匯款單，等待管理員審核");
    setStep(4);
  };

  const STATUS_LABEL = {
    draft: "草稿",
    submitted: "待審核",
    pdf_generated: "PDF 已產生",
    signed_uploaded: "簽檔已上傳",
    paid: "已付款",
    approved: "已核可",
    rejected: "已退回",
  };

  return (
    <>
      <div className="mb-8">
        <div className="scene-tag">EQUIPMENT · 設備申請</div>
        <h1 className="scene-title">選擇設備 → 產生申請表 → 簽章 → 付款</h1>
        <p className="scene-desc">
          瀏覽設備目錄，加入需要的項目後提交申請。系統產生 PDF 後請印出簽章並回傳，含費用項目需附匯款單。
        </p>
      </div>

      {/* 步驟條 */}
      <div className="panel mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { n: 1, label: "選擇設備" },
            { n: 2, label: "產生 PDF" },
            { n: 3, label: "簽章上傳" },
            { n: 4, label: "匯款審核" },
          ].map((s, i, arr) => (
            <div key={s.n} className="flex items-center flex-1">
              <div className={`w-9 h-9 rounded-full grid place-items-center font-semibold text-[14px] ${
                step >= s.n ? "text-white" : ""
              }`}
                style={{
                  background: step >= s.n ? "var(--role-color)" : "var(--bg-tinted)",
                  color: step >= s.n ? "white" : "var(--text-tertiary)",
                }}>
                {step > s.n ? "✓" : s.n}
              </div>
              <div className={`ml-2 text-[13px] ${step === s.n ? "font-semibold" : ""}`}
                style={{ color: step >= s.n ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                {s.label}
              </div>
              {i < arr.length - 1 && (
                <div className="flex-1 h-0.5 mx-3" style={{ background: step > s.n ? "var(--role-color)" : "var(--separator)" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 已有申請單狀態 */}
      {activeRequest && (
        <div className="panel mb-6" style={{
          borderLeft: `4px solid ${activeRequest.status === "approved" ? "var(--green)" : "var(--role-color)"}`,
        }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-tertiary)" }}>
                CURRENT REQUEST
              </div>
              <div className="text-xl font-bold">
                申請單 #{activeRequest.id.slice(-6)} ·
                <span className="chip chip-blue ml-2">{STATUS_LABEL[activeRequest.status]}</span>
              </div>
              <div className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
                建立於 {activeRequest.createdAt} · 共 {activeRequest.items.length} 項 · 總金額 NT$ {activeRequest.totalAmount.toLocaleString()}
              </div>
            </div>
            <div className="flex gap-2">
              {activeRequest.status === "draft" && (
                <button className="btn btn-primary" onClick={generatePdf}>產生 PDF 申請表</button>
              )}
              {activeRequest.status === "pdf_generated" && (
                <>
                  <button className="btn" onClick={() => toast.info("Demo：下載 PDF")}>下載 PDF</button>
                  <button className="btn btn-primary" onClick={uploadSigned}>上傳已簽檔</button>
                </>
              )}
              {activeRequest.status === "signed_uploaded" && (
                <button className="btn btn-primary" onClick={uploadPayment}>上傳匯款單</button>
              )}
              {activeRequest.status === "approved" && (
                <span className="chip chip-green">✓ 審核已通過</span>
              )}
            </div>
          </div>
          {activeRequest.status === "pdf_generated" && (
            <div className="mt-3 p-3 rounded-lg text-[12px]" style={{ background: "rgba(0,113,227,0.08)" }}>
              💡 請下載 PDF → 列印簽章蓋章 → 回到此頁點「上傳已簽檔」
            </div>
          )}
        </div>
      )}

      {/* 目錄選擇（無申請單或 draft 時才顯示） */}
      {(!activeRequest || activeRequest.status === "draft") && (
        <>
          <div className="panel mb-6">
            <div className="flex gap-2 mb-4 flex-wrap">
              {categories.map((c) => (
                <button
                  key={c}
                  className={`btn ${activeCat === c ? "btn-primary" : ""}`}
                  onClick={() => setActiveCat(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((item) => {
                const inCart = cart.find((c) => c.catalogId === item.id);
                return (
                  <div key={item.id} className="border rounded-xl p-4" style={{ borderColor: "var(--separator)" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold mb-1">{item.name}</div>
                        <div className="text-[12px] mb-2" style={{ color: "var(--text-tertiary)" }}>
                          {item.spec}
                        </div>
                        <div className="text-[13px] font-medium" style={{ color: "var(--role-color)" }}>
                          NT$ {item.unitPrice.toLocaleString()} / {item.unit}
                        </div>
                      </div>
                      {inCart ? (
                        <div className="flex items-center gap-1">
                          <button className="btn btn-sm" onClick={() => updateQty(item.id, inCart.qty - 1)}>−</button>
                          <span className="font-semibold w-6 text-center">{inCart.qty}</span>
                          <button className="btn btn-sm" onClick={() => updateQty(item.id, inCart.qty + 1)}>+</button>
                        </div>
                      ) : (
                        <button className="btn btn-sm btn-primary" onClick={() => addToCart(item)}>加入</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 購物車 / 費用 */}
          <div className="panel" style={{ position: "sticky", bottom: 20 }}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Your Selection
                </div>
                <div className="text-[15px]">
                  共 <b>{cart.length}</b> 項品項 · 預估 <b style={{ color: "var(--role-color)" }}>NT$ {total.toLocaleString()}</b>
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={activeRequest ? generatePdf : submitRequest}
                disabled={cart.length === 0}
              >
                {activeRequest ? "產生 PDF 申請表" : "建立申請單"}
              </button>
            </div>

            {cart.length > 0 && (
              <div className="mt-4 space-y-2">
                {cart.map((c) => {
                  const item = catalog.find((x) => x.id === c.catalogId);
                  if (!item) return null;
                  return (
                    <div key={c.catalogId} className="flex items-center justify-between text-[13px] py-2 border-b" style={{ borderColor: "var(--separator)" }}>
                      <span>{item.name}</span>
                      <span className="font-medium">
                        × {c.qty} = NT$ {(item.unitPrice * c.qty).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
