import { useMemo } from "react";
import { useData } from "../../store/data";
import { SceneHead, Panel } from "../../components/Scene";
import { Icon } from "../../components/Icon";
import { toast } from "../../store/toast";

const SUBSYSTEMS = [
  { key: "csm",         name: "會議秘書系統",     icon: "calendar", color: "#ff9f0a" },
  { key: "ex",          name: "廠商管理系統",     icon: "package",  color: "#5e5ce6" },
  { key: "punch",       name: "工讀生打卡系統",   icon: "package",  color: "#8e8e93" },
  { key: "opportunity", name: "商機管理系統",     icon: "package",  color: "#30d158" },
];

// 子系統訂閱矩陣：橫軸=子系統、縱軸=租戶
export default function PortalSubsystems() {
  const { companies, tenantSubsystems, toggleTenantSubsystem } = useData();

  const activeCompanies = companies.filter((c) => c.status === "active");

  const isActive = (companyId, key) => {
    return !!(tenantSubsystems || []).find((x) => x.companyId === companyId && x.subsystemKey === key);
  };

  const toggle = (company, sub) => {
    const current = isActive(company.id, sub.key);
    toggleTenantSubsystem(company.id, sub.key, !current);
    toast.success(`${current ? "已停用" : "已開通"}：${company.name} - ${sub.name}`);
  };

  // 每個子系統的訂閱租戶數
  const subStats = useMemo(() => {
    return SUBSYSTEMS.reduce((acc, s) => {
      acc[s.key] = (tenantSubsystems || []).filter((x) => x.subsystemKey === s.key).length;
      return acc;
    }, {});
  }, [tenantSubsystems]);

  return (
    <>
      <SceneHead
        tag="SUBSYSTEMS · 子系統訂閱"
        title="租戶子系統訂閱管理"
        desc="為每個租戶開通或停用個別子系統；此設定決定租戶登入 Portal 後看到的卡片。"
      />

      {/* 子系統統計 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {SUBSYSTEMS.map((s) => (
          <div key={s.key} className="panel !p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg grid place-items-center"
                style={{ background: `${s.color}15` }}>
                <Icon name={s.icon} className="icon" />
                <style>{`.grid .icon { stroke: currentColor; }`}</style>
              </div>
              <div>
                <div className="font-semibold text-[14px]">{s.name}</div>
                <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  {subStats[s.key]} / {activeCompanies.length} 租戶訂閱
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Panel title="訂閱矩陣">
        <div className="overflow-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--separator)" }}>
                <th className="text-left py-3 px-2 font-semibold uppercase text-[11px] tracking-wider"
                  style={{ color: "var(--text-tertiary)", minWidth: 220 }}>
                  租戶
                </th>
                {SUBSYSTEMS.map((s) => (
                  <th key={s.key}
                    className="text-center py-3 px-2 font-semibold uppercase text-[11px] tracking-wider"
                    style={{ color: "var(--text-tertiary)", minWidth: 130 }}>
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeCompanies.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--separator)" }}>
                  <td className="py-3 px-2">
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {c.taxId} · {c.industry}
                    </div>
                  </td>
                  {SUBSYSTEMS.map((s) => {
                    const active = isActive(c.id, s.key);
                    return (
                      <td key={s.key} className="text-center py-3 px-2">
                        <button
                          onClick={() => toggle(c, s)}
                          className="px-4 py-2 rounded-lg text-[12px] font-medium transition-all"
                          style={{
                            background: active ? `${s.color}15` : "transparent",
                            color: active ? s.color : "var(--text-tertiary)",
                            border: active ? `1px solid ${s.color}40` : "1px dashed var(--separator-strong)",
                          }}
                        >
                          {active ? "✓ 已訂閱" : "+ 開通"}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {activeCompanies.length === 0 && (
                <tr>
                  <td colSpan={SUBSYSTEMS.length + 1} className="text-center py-10" style={{ color: "var(--text-tertiary)" }}>
                    尚無啟用中的租戶
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="text-[12px] mt-4" style={{ color: "var(--text-tertiary)" }}>
        💡 啟用 / 停用會即時反映到該租戶使用者登入 Portal 後看到的卡片數量。
      </div>
    </>
  );
}
