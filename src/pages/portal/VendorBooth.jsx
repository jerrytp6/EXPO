import { useState } from "react";
import { useData } from "../../store/data";
import { SceneHead, Panel, Field } from "../../components/Scene";
import { Icon } from "../../components/Icon";
import { toast } from "../../store/toast";

export default function VendorBooth({ vendor, event }) {
  const { vendors, vendorSelectBooth } = useData();
  const boothTypes = event?.boothTypes || [];
  const bt = boothTypes.find((b) => b.id === vendor.boothTypeId);

  const dep = vendor.depositStatus === "paid";
  const bal = vendor.balanceStatus === "paid";

  const selfSelect = !!event?.boothSelfSelectionEnabled;
  const status = vendor.boothSelectionStatus
    || (vendor.boothNumber && vendor.boothTypeId ? "confirmed" : null);

  const [pickTypeId, setPickTypeId] = useState("");
  const [pickNumber, setPickNumber] = useState("");

  // 計算各類型「他人已使用 / pending 占用」的編號 — 同類型同編號不能重複
  const eventVendors = vendors.filter((v) => v.eventId === event?.id && v.id !== vendor.id);
  const occupiedNumbers = (typeId) =>
    eventVendors
      .filter((v) => v.boothTypeId === typeId && v.boothNumber)
      .map((v) => v.boothNumber);

  const submitSelection = () => {
    if (!pickTypeId) { toast.error("請選擇攤位類型"); return; }
    if (!pickNumber.trim()) { toast.error("請填寫期望的攤位編號"); return; }
    if (occupiedNumbers(pickTypeId).includes(pickNumber.trim())) {
      toast.error("此編號已被其他廠商選用，請改填其他編號");
      return;
    }
    vendorSelectBooth(vendor.id, pickTypeId, pickNumber.trim());
    toast.success("已提交攤位選擇，等待管理員確認");
  };

  // 廠商自選模式 + 待挑選（無選擇 或 從未確認）→ 顯示挑選介面
  const showPicker = selfSelect && status !== "confirmed" && status !== "pending";
  // 廠商自選模式 + 已提交待管理員確認 → 顯示等待狀態
  const showPending = selfSelect && status === "pending";

  return (
    <>
      <SceneHead
        tag="BOOTH"
        title="展位資訊"
        desc={event ? `${event.name} · ${event.location}` : ""}
      />

      {showPicker && (
        <>
          <div className="panel mb-6" style={{
            background: "rgba(175,82,222,0.06)",
            border: "1px solid rgba(175,82,222,0.25)",
          }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name="building" className="icon w-5 h-5" style={{ stroke: "var(--purple, #af52de)" }} />
              <span className="text-[14px] font-semibold">本活動開放廠商自選攤位</span>
            </div>
            <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
              請從下方選擇攤位類型並填寫期望的攤位編號，提交後將由活動管理員確認。
            </p>
          </div>

          <Panel title="選擇攤位類型">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {boothTypes.map((b) => {
                const used = occupiedNumbers(b.id).length;
                const remaining = Math.max(0, (b.capacity || 0) - used);
                const selected = pickTypeId === b.id;
                const full = remaining <= 0;
                return (
                  <button
                    key={b.id}
                    type="button"
                    disabled={full}
                    onClick={() => setPickTypeId(b.id)}
                    className="text-left p-4 rounded-xl"
                    style={{
                      background: selected ? "rgba(0,113,227,0.08)" : "var(--bg-tinted)",
                      border: `1px solid ${selected ? "var(--role-color)" : "var(--separator)"}`,
                      opacity: full ? 0.5 : 1,
                      cursor: full ? "not-allowed" : "pointer",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[14px] font-semibold">{b.name}</span>
                      <span className="text-[12px] font-display" style={{ color: "var(--text-tertiary)" }}>{b.size}</span>
                    </div>
                    <div className="text-xl font-bold font-display tracking-tight mb-1">
                      NT$ {b.price.toLocaleString()}
                    </div>
                    <div className="text-[12px] mb-2" style={{ color: "var(--text-secondary)" }}>{b.description}</div>
                    <div className="text-[11px] font-display" style={{ color: full ? "var(--red)" : "var(--text-tertiary)" }}>
                      {full ? "已額滿" : `剩餘 ${remaining} / ${b.capacity}`}
                    </div>
                  </button>
                );
              })}
            </div>

            {pickTypeId && (
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--separator)" }}>
                <Field label="期望的攤位編號" hint="例：A-12（由您與其他廠商區分位置；提交後管理員會確認最終編號）">
                  <input
                    className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                    style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
                    value={pickNumber}
                    onChange={(e) => setPickNumber(e.target.value)}
                    placeholder="A-12"
                  />
                </Field>
                {occupiedNumbers(pickTypeId).length > 0 && (
                  <div className="text-[12px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                    已被使用：{occupiedNumbers(pickTypeId).join("、")}
                  </div>
                )}
                <div className="flex justify-end mt-4">
                  <button className="btn btn-primary" onClick={submitSelection}>提交攤位選擇</button>
                </div>
              </div>
            )}
          </Panel>
        </>
      )}

      {showPending && (
        <Panel>
          <div className="py-8 text-center">
            <Icon name="activity" className="icon mx-auto mb-3 w-10 h-10" style={{ stroke: "var(--orange)" }} />
            <h3 className="text-[17px] font-semibold mb-2">攤位選擇審核中</h3>
            <p className="text-[13px] mb-4" style={{ color: "var(--text-secondary)" }}>
              您已選擇 <b>{bt?.name || "—"}</b> · 編號 <b className="font-display">{vendor.boothNumber}</b>，等待活動管理員確認。
            </p>
            <span className="chip chip-orange">PENDING — 待管理員確認</span>
          </div>
        </Panel>
      )}

      {!showPicker && !showPending && status !== "confirmed" && (
        <Panel>
          <div className="py-10 text-center">
            <Icon name="building" className="icon mx-auto mb-3 w-10 h-10" style={{ stroke: "var(--text-tertiary)" }} />
            <h3 className="text-[17px] font-semibold mb-2">攤位尚未分配</h3>
            <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
              主辦方確認參展資格後將為您分配攤位，届時會在此頁顯示攤位資訊。
            </p>
          </div>
        </Panel>
      )}

      {status === "confirmed" && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              ["攤位編號", vendor.boothNumber || "待分配"],
              ["攤位類型", bt?.name || "—"],
              ["面積", bt?.size || "—"],
            ].map(([k, v]) => (
              <div key={k} className="panel !p-5">
                <div className="text-[11px] font-display font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "var(--text-tertiary)" }}>{k}</div>
                <div className="text-2xl font-bold tracking-tight">{v}</div>
              </div>
            ))}
          </div>

          {bt && (
            <Panel title="攤位規格說明">
              <div className="grid grid-cols-2 gap-4 text-[14px]">
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-tertiary)" }}>類型</span>
                  <span className="font-medium">{bt.name}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-tertiary)" }}>面積</span>
                  <span className="font-medium">{bt.size}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-tertiary)" }}>攤位費用</span>
                  <span className="font-medium font-display">NT$ {bt.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-tertiary)" }}>說明</span>
                  <span className="font-medium">{bt.description}</span>
                </div>
              </div>
            </Panel>
          )}

          <Panel title="繳費狀態">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl" style={{
                background: dep ? "rgba(48,209,88,0.06)" : "rgba(255,159,10,0.06)",
                border: `1px solid ${dep ? "rgba(48,209,88,0.3)" : "rgba(255,159,10,0.3)"}`,
              }}>
                <div className="text-[12px] font-display uppercase tracking-wider mb-1"
                  style={{ color: "var(--text-tertiary)" }}>訂金</div>
                <div className="flex items-center gap-2">
                  <Icon name={dep ? "check" : "activity"} className="icon w-5 h-5"
                    style={{ stroke: dep ? "var(--green)" : "var(--orange)" }} />
                  <span className="text-[15px] font-semibold"
                    style={{ color: dep ? "var(--green)" : "var(--orange)" }}>
                    {dep ? "已繳納" : "待繳納"}
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-xl" style={{
                background: bal ? "rgba(48,209,88,0.06)" : "rgba(255,159,10,0.06)",
                border: `1px solid ${bal ? "rgba(48,209,88,0.3)" : "rgba(255,159,10,0.3)"}`,
              }}>
                <div className="text-[12px] font-display uppercase tracking-wider mb-1"
                  style={{ color: "var(--text-tertiary)" }}>尾款</div>
                <div className="flex items-center gap-2">
                  <Icon name={bal ? "check" : "activity"} className="icon w-5 h-5"
                    style={{ stroke: bal ? "var(--green)" : "var(--orange)" }} />
                  <span className="text-[15px] font-semibold"
                    style={{ color: bal ? "var(--green)" : "var(--orange)" }}>
                    {bal ? "已繳納" : "待繳納"}
                  </span>
                </div>
              </div>
            </div>
          </Panel>
        </>
      )}
    </>
  );
}
