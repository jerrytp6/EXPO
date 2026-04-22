import { useData } from "../../store/data";
import { SceneHead, Panel } from "../../components/Scene";
import { Icon } from "../../components/Icon";

export default function VendorBooth({ vendor, event }) {
  const { events } = useData();
  const boothTypes = event?.boothTypes || [];
  const bt = boothTypes.find((b) => b.id === vendor.boothTypeId);

  const dep = vendor.depositStatus === "paid";
  const bal = vendor.balanceStatus === "paid";

  return (
    <>
      <SceneHead
        tag="BOOTH"
        title="展位資訊"
        desc={event ? `${event.name} · ${event.location}` : ""}
      />

      {!vendor.boothNumber && !bt ? (
        <Panel>
          <div className="py-10 text-center">
            <Icon name="building" className="icon mx-auto mb-3 w-10 h-10" style={{ stroke: "var(--text-tertiary)" }} />
            <h3 className="text-[17px] font-semibold mb-2">攤位尚未分配</h3>
            <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
              主辦方確認參展資格後將為您分配攤位，届時會在此頁顯示攤位資訊。
            </p>
          </div>
        </Panel>
      ) : (
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
