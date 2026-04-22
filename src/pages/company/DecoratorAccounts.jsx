import { useMemo } from "react";
import { useAuth } from "../../store/auth";
import { useData } from "../../store/data";
import { SceneHead, Panel, DataRow } from "../../components/Scene";

// 裝潢廠商帳號（允許 1 對多個參展廠商）— 客戶模組 #10
export default function DecoratorAccounts() {
  const user = useAuth((s) => s.user);
  const { decorators, vendors, events, decorationProjects } = useData();

  const myEvents = useMemo(() => events.filter((e) => e.companyId === user.companyId), [events, user.companyId]);
  const myEventIds = useMemo(() => myEvents.map((e) => e.id), [myEvents]);
  const myVendors = useMemo(() => vendors.filter((v) => myEventIds.includes(v.eventId)), [vendors, myEventIds]);

  // 某裝潢商服務的參展廠商清單（來自 decorationProjects 或 vendor.decoratorId）
  const vendorsOf = (decoratorId) => {
    const viaProjects = decorationProjects.filter((p) => p.decoratorId === decoratorId && myEventIds.includes(p.eventId));
    const viaVendorId = myVendors.filter((v) => v.decoratorId === decoratorId);
    const all = [...viaProjects.map((p) => myVendors.find((v) => v.id === p.vendorId)).filter(Boolean), ...viaVendorId];
    const uniq = [];
    all.forEach((v) => { if (v && !uniq.find((u) => u.id === v.id)) uniq.push(v); });
    return uniq;
  };

  // 過濾：只顯示有服務到本租戶廠商的裝潢商
  const inTenant = decorators.filter((d) => vendorsOf(d.id).length > 0);

  return (
    <>
      <SceneHead
        tag="DECORATOR ACCOUNTS"
        title="裝潢廠商帳號"
        desc="裝潢廠商註冊資料 · 允許 1 個裝潢廠商對應多個參展廠商。"
      />

      <Panel>
        <DataRow
          header
          cols={[
            { content: "裝潢廠商",         w: "2fr" },
            { content: "聯絡人",           w: "1fr" },
            { content: "服務廠商數",       w: "1fr" },
            { content: "服務中的參展廠商", w: "3fr" },
            { content: "狀態",             w: "0.8fr" },
          ]}
        />
        {inTenant.map((d) => {
          const served = vendorsOf(d.id);
          return (
            <DataRow
              key={d.id}
              cols={[
                {
                  content: (
                    <div>
                      <div className="font-semibold text-ink-primary">{d.name}</div>
                      <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                        統編 {d.taxId} · {d.email}
                      </div>
                    </div>
                  ),
                  w: "2fr",
                },
                {
                  content: (
                    <div>
                      <div className="text-[13px]">{d.contact}</div>
                      <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>{d.title}</div>
                    </div>
                  ),
                  w: "1fr",
                },
                {
                  content: <span className="chip chip-blue">{served.length} 家</span>,
                  w: "1fr",
                },
                {
                  content: (
                    <div className="flex flex-wrap gap-1.5">
                      {served.slice(0, 5).map((v) => (
                        <span key={v.id} className="chip chip-purple">{v.company}</span>
                      ))}
                      {served.length > 5 && (
                        <span className="chip">+{served.length - 5}</span>
                      )}
                    </div>
                  ),
                  w: "3fr",
                },
                {
                  content: (
                    <span className={`chip ${d.status === "active" ? "chip-green" : ""}`}>
                      {d.status === "active" ? "使用中" : "—"}
                    </span>
                  ),
                  w: "0.8fr",
                },
              ]}
            />
          );
        })}
        {inTenant.length === 0 && (
          <div className="text-center py-10 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            尚無裝潢廠商（需由參展廠商發出邀請後才會出現）
          </div>
        )}
      </Panel>
    </>
  );
}
