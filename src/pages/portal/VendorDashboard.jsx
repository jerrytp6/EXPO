import { Link } from "react-router-dom";
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

export default function VendorDashboard({ vendor, event }) {
  const { decorationProjects, decorators, designs } = useData();

  const project = decorationProjects.find((p) => p.vendorId === vendor.id);
  const decorator = project ? decorators.find((d) => d.id === project.decoratorId) : null;
  const projectDesigns = project ? designs.filter((d) => d.projectId === project.id) : [];
  const pendingReview = projectDesigns.filter((d) => d.status === "pending").length;

  const daysUntil = event
    ? Math.ceil((new Date(event.startDate) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <>
      <SceneHead
        tag="VENDOR DASHBOARD"
        title={`歡迎，${vendor.contact || vendor.company}`}
        desc={event ? `${event.name} · 距離開展還有 ${Math.max(daysUntil, 0)} 天` : "展覽資訊"}
      />

      {/* 參展確認狀態 */}
      {vendor.confirmStatus === "confirmed" ? (
        <div className="p-3 rounded-xl mb-6 flex items-center gap-2 text-[13px]"
          style={{ background: "rgba(48,209,88,0.08)", border: "1px solid rgba(48,209,88,0.3)", color: "#1f8a3a" }}>
          <Icon name="check" className="icon w-4 h-4" />
          <strong>已確認參展</strong>
          <span className="font-display ml-1">（{vendor.confirmedAt}）</span>
        </div>
      ) : (
        <div className="p-3 rounded-xl mb-6 flex items-center gap-2 text-[13px]"
          style={{ background: "rgba(0,113,227,0.06)", border: "1px solid rgba(0,113,227,0.2)", color: "var(--blue)" }}>
          <Icon name="activity" className="icon w-4 h-4" />
          <span>報名已完成，請靜候主辦方確認參展名單。</span>
        </div>
      )}

      <StatGrid
        stats={[
          { label: "展位編號", value: vendor.boothNumber || "未配置" },
          { label: "展位類型", value: { standard: "標準", island: "島型", premium: "旗艦" }[vendor.boothType] || "—" },
          { label: "裝潢狀態", value: project ? PROJECT_STATUS[project.status]?.label || "—" : "未指派" },
          { label: "待審設計稿", value: pendingReview, deltaColor: pendingReview > 0 ? "var(--orange)" : undefined, delta: pendingReview > 0 ? "需處理" : "無待辦" },
        ]}
      />

      <div className="grid grid-cols-2 gap-6">
        <Panel title="展覽資訊">
          {event ? (
            <dl className="space-y-3 text-[14px]">
              {[
                ["活動名稱", event.name],
                ["類型", event.type],
                ["日期", `${event.startDate}${event.endDate !== event.startDate ? ` – ${event.endDate}` : ""}`],
                ["地點", event.location],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt style={{ color: "var(--text-tertiary)" }}>{k}</dt>
                  <dd className="font-medium text-right">{v}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>找不到活動資料</div>
          )}
        </Panel>

        <Panel
          title="裝潢專案"
          action={
            <Link to="decoration" className="btn btn-ghost !py-1 !text-xs">
              查看 →
            </Link>
          }
        >
          {project && decorator ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-11 h-11 rounded-xl grid place-items-center"
                  style={{ background: "linear-gradient(135deg, #ff6a00, #ff2d92)" }}
                >
                  <Icon name="sparkles" className="icon" />
                  <style>{`.panel .icon { stroke: white; }`}</style>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[14px] truncate">{decorator.name}</div>
                  <div className="text-[11px] font-display" style={{ color: "var(--text-tertiary)" }}>
                    {decorator.contact} · {decorator.email}
                  </div>
                </div>
                <span className={`badge ${PROJECT_STATUS[project.status]?.cls || "badge-gray"}`}>
                  {PROJECT_STATUS[project.status]?.label || project.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div>
                  <div className="text-[11px] font-display uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                    設計稿版本
                  </div>
                  <div className="text-xl font-bold">{projectDesigns.length}</div>
                </div>
                <div>
                  <div className="text-[11px] font-display uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                    最新版
                  </div>
                  <div className="text-xl font-bold">
                    {projectDesigns[projectDesigns.length - 1]?.version || "—"}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-4">
              <div className="text-[13px] mb-3" style={{ color: "var(--text-tertiary)" }}>
                尚未指派裝潢公司
              </div>
              <Link to="decoration" className="btn btn-primary !py-1.5 !text-xs">
                + 邀請裝潢公司
              </Link>
            </div>
          )}
        </Panel>
      </div>

      <Panel title="籌備檢核清單">
        <div className="space-y-2">
          {[
            ["完成展位資料填寫", !!vendor.boothNumber],
            ["上傳公司簡介與產品", !!vendor.profile],
            ["指派裝潢公司", !!project],
            ["確認設計稿", project && projectDesigns.some((d) => d.status === "approved")],
            ["確認展位編號與布展時間", false],
          ].map(([label, done]) => (
            <div
              key={label}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: "var(--bg-tinted)" }}
            >
              <div
                className="w-5 h-5 rounded grid place-items-center flex-shrink-0"
                style={{ background: done ? "var(--green)" : "rgba(0,0,0,0.08)" }}
              >
                {done && <Icon name="check" className="icon w-3 h-3" style={{ stroke: "white" }} />}
              </div>
              <span
                className="text-[13px]"
                style={{ color: done ? "var(--text-primary)" : "var(--text-secondary)" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
