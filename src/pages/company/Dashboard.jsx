import { Link } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { useData } from "../../store/data";
import { SceneHead, Panel, StatGrid } from "../../components/Scene";
import { Icon } from "../../components/Icon";

export default function CompanyDashboard() {
  const user = useAuth((s) => s.user);
  const { companies, users, events, vendors } = useData();

  const company = companies.find((c) => c.id === user.companyId);
  const members = users.filter((u) => u.companyId === user.companyId);
  const myEvents = events.filter((e) => e.companyId === user.companyId);
  const myVendors = vendors.filter((v) => myEvents.find((e) => e.id === v.eventId));

  const STATUS_COLOR = {
    preparing: "badge-blue",
    inviting: "badge-orange",
    planning: "badge-gray",
  };
  const STATUS_LABEL = {
    preparing: "籌備中",
    inviting: "邀請中",
    planning: "規劃中",
  };

  return (
    <>
      <SceneHead
        tag="COMPANY DASHBOARD"
        title={company ? company.name : "公司儀表板"}
        desc="概覽您公司目前的成員、活動與業務指標。"
      />
      <StatGrid
        stats={[
          { label: "公司成員", value: members.length },
          { label: "進行中活動", value: myEvents.length },
          { label: "邀請廠商數", value: myVendors.length },
          { label: "已報名廠商", value: myVendors.filter((v) => v.status === "registered").length },
        ]}
      />
      <Panel
        title="即將舉辦的展覽"
        action={<Link to="/company/events/new" className="btn btn-primary">+ 建立活動</Link>}
      >
        {myEvents.length === 0 ? (
          <div className="py-10 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            尚未建立任何活動
          </div>
        ) : myEvents.map((e) => (
          <Link
            key={e.id}
            to={`/company/events`}
            className="flex items-center gap-4 p-4 rounded-xl mb-2 no-underline"
            style={{ background: "var(--bg-tinted)", color: "inherit" }}
          >
            <div className="w-11 h-11 rounded-xl grid place-items-center"
              style={{ background: "var(--role-grad)" }}>
              <Icon name="calendar" className="icon" />
              <style>{`a[href*="events"] > div:first-child .icon { stroke: white; }`}</style>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[14px]">{e.name}</div>
              <div className="text-[12px] font-display mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                {e.startDate}{e.endDate !== e.startDate ? ` – ${e.endDate}` : ""} · {e.location}
              </div>
            </div>
            <span className={`badge ${STATUS_COLOR[e.status] || "badge-gray"}`}>
              {STATUS_LABEL[e.status] || e.status}
            </span>
          </Link>
        ))}
      </Panel>
    </>
  );
}
