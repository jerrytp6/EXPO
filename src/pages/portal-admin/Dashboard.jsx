import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useData } from "../../store/data";
import { SceneHead, Panel, StatGrid, DataRow } from "../../components/Scene";

const SUBSYSTEM_LABEL = {
  csm: "會議秘書", ex: "廠商管理", punch: "工讀生打卡", opportunity: "商機管理",
};

export default function PortalAdminDashboard() {
  const { companies, users, tenantSubsystems } = useData();

  const stats = useMemo(() => {
    const active = companies.filter((c) => c.status === "active").length;
    const pending = companies.filter((c) => c.status === "pending").length;
    const exSubs = (tenantSubsystems || []).filter((x) => x.subsystemKey === "ex").length;
    return [
      { label: "總租戶數",       value: companies.length },
      { label: "啟用中",          value: active, deltaColor: "var(--green)" },
      { label: "待審核",          value: pending, deltaColor: "var(--orange)" },
      { label: "EX 訂閱租戶",     value: exSubs, deltaColor: "var(--blue)" },
    ];
  }, [companies, tenantSubsystems]);

  // 每個租戶的訂閱狀況
  const tenantRows = useMemo(() => {
    return companies.map((c) => {
      const subs = (tenantSubsystems || []).filter((x) => x.companyId === c.id).map((x) => x.subsystemKey);
      const admin = users.find((u) => u.id === c.adminUserId);
      const userCount = users.filter((u) => u.companyId === c.id).length;
      return { company: c, subs, admin, userCount };
    });
  }, [companies, users, tenantSubsystems]);

  return (
    <>
      <SceneHead
        tag="PORTAL ADMIN"
        title="展會營運平台 · 管理後台"
        desc="租戶生命週期 · 子系統訂閱 · 跨租戶帳號管理"
      />

      <StatGrid stats={stats} />

      <Panel
        title="租戶清單"
        action={
          <Link to="/portal/admin/tenants" className="btn btn-primary">管理租戶</Link>
        }
      >
        <DataRow
          header
          cols={[
            { content: "租戶",         w: "2fr" },
            { content: "狀態",         w: "0.8fr" },
            { content: "管理員",       w: "1fr" },
            { content: "帳號數",       w: "0.6fr" },
            { content: "訂閱子系統",   w: "2fr" },
          ]}
        />
        {tenantRows.map(({ company, subs, admin, userCount }) => (
          <DataRow
            key={company.id}
            cols={[
              {
                content: (
                  <div>
                    <div className="font-semibold">{company.name}</div>
                    <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                      統編 {company.taxId} · {company.industry}
                    </div>
                  </div>
                ),
                w: "2fr",
              },
              {
                content: (
                  <span className={`chip ${company.status === "active" ? "chip-green" : "chip-orange"}`}>
                    {company.status === "active" ? "啟用中" : "待審核"}
                  </span>
                ),
                w: "0.8fr",
              },
              {
                content: admin ? (
                  <div className="text-[12px]">
                    <div>{admin.name}</div>
                    <div style={{ color: "var(--text-tertiary)" }}>{admin.email}</div>
                  </div>
                ) : <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>未指派</span>,
                w: "1fr",
              },
              { content: <span className="chip chip-blue">{userCount} 人</span>, w: "0.6fr" },
              {
                content: (
                  <div className="flex flex-wrap gap-1">
                    {subs.length === 0 && <span className="chip">未訂閱</span>}
                    {subs.map((s) => (
                      <span key={s} className="chip chip-purple">{SUBSYSTEM_LABEL[s] || s}</span>
                    ))}
                  </div>
                ),
                w: "2fr",
              },
            ]}
          />
        ))}
      </Panel>
    </>
  );
}
