import { Link, useParams } from "react-router-dom";
import { useData } from "../../store/data";
import { SceneHead, Panel, StatGrid } from "../../components/Scene";
import { Icon } from "../../components/Icon";

const PROJECT_STATUS = {
  draft:     { label: "草擬中",   cls: "badge-gray" },
  designing: { label: "設計中",   cls: "badge-blue" },
  review:    { label: "待審稿",   cls: "badge-orange" },
  approved:  { label: "已核准",   cls: "badge-green" },
  building:  { label: "施工中",   cls: "badge-purple" },
  completed: { label: "已完成",   cls: "badge-green" },
};

export default function DecoratorDashboard({ decorator }) {
  const { decoratorId } = useParams();
  const { decorationProjects, vendors, events, designs } = useData();

  const projects = decorationProjects.filter((p) => p.decoratorId === decorator.id);

  const counts = {
    total: projects.length,
    designing: projects.filter((p) => p.status === "designing" || p.status === "review").length,
    approved: projects.filter((p) => p.status === "approved" || p.status === "building").length,
    completed: projects.filter((p) => p.status === "completed").length,
  };

  return (
    <>
      <SceneHead
        tag="DECORATOR DASHBOARD"
        title={`${decorator.name}`}
        desc="管理您正在執行的所有展位裝潢專案。"
      />

      <StatGrid
        stats={[
          { label: "進行中專案", value: counts.total },
          { label: "設計中", value: counts.designing },
          { label: "已核准", value: counts.approved },
          { label: "已完成", value: counts.completed },
        ]}
      />

      <Panel title="專案列表">
        {projects.length === 0 ? (
          <div className="py-12 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            目前沒有專案。當廠商邀請您並接受後，專案會出現在這裡。
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => {
              const vendor = vendors.find((v) => v.id === p.vendorId);
              const event = events.find((e) => e.id === p.eventId);
              const projectDesigns = designs.filter((d) => d.projectId === p.id);
              const latest = projectDesigns[projectDesigns.length - 1];
              const st = PROJECT_STATUS[p.status] || PROJECT_STATUS.draft;

              return (
                <Link
                  key={p.id}
                  to={`/portal/decorator/${decoratorId}/project/${p.id}`}
                  className="block p-4 rounded-xl no-underline transition-all hover:shadow-sm"
                  style={{
                    background: "var(--bg-tinted)",
                    border: "1px solid var(--separator)",
                    color: "inherit",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl grid place-items-center flex-shrink-0"
                      style={{ background: "var(--role-grad)" }}
                    >
                      <Icon name="building" className="icon" />
                      <style>{`a[href*="/project/"] .icon { stroke: white; }`}</style>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[15px] font-semibold">{vendor?.company}</h3>
                        <span className={`badge ${st.cls}`}>{st.label}</span>
                      </div>
                      <div
                        className="text-[12px] font-display mb-2"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {event?.name} · {vendor?.boothNumber || "未配置"} ·{" "}
                        {vendor?.boothSize || "—"}
                      </div>
                      <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                        {projectDesigns.length} 份設計稿
                        {latest && ` · 最新 ${latest.version}（${latest.status === "approved" ? "已核准" : latest.status === "pending" ? "待審" : latest.status === "rejected" ? "退回" : "—"}）`}
                      </div>
                    </div>
                    <Icon name="arrow_right" className="icon w-4 h-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Panel>
    </>
  );
}
