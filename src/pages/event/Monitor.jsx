import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useData } from "../../store/data";
import { SceneHead, Panel, StatGrid } from "../../components/Scene";
import { Icon } from "../../components/Icon";

function timeAgo(ts) {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return `${sec} 秒前`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} 分鐘前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小時前`;
  return `${Math.floor(hr / 24)} 天前`;
}

const ACTION = {
  clicked: { label: "點擊邀請連結", cls: "badge-blue", icon: "link" },
  registered: { label: "完成報名", cls: "badge-green", icon: "check" },
};

export default function Monitor() {
  const { eventId } = useParams();
  const { events, vendors, activities } = useData();
  const event = events.find((e) => e.id === eventId);
  const [tick, setTick] = useState(0);

  // 每 5 秒刷新時間顯示
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 5000);
    return () => clearInterval(t);
  }, []);

  if (!event) return <Navigate to="/event" replace />;

  const list = vendors.filter((v) => v.eventId === eventId);
  const total = list.length;
  const invited = list.filter((v) => v.invitedAt).length;
  const clicked = list.filter((v) => v.clickedAt).length;
  const registered = list.filter((v) => v.status === "registered").length;
  const declined = list.filter((v) => v.status === "declined").length;

  const recent = activities
    .filter((a) => a.eventId === eventId)
    .slice(0, 20);

  return (
    <>
      <SceneHead
        tag={`EVENT · ${event.name}`}
        title="即時參展狀態監控"
        desc="即時追蹤邀請回覆、報名進度與廠商動態。"
      />

      <StatGrid
        stats={[
          { label: "已邀請", value: invited },
          { label: "已點擊", value: clicked, delta: invited ? `${Math.round(clicked/invited*100)}%` : "—" },
          { label: "已報名", value: registered, delta: invited ? `${Math.round(registered/invited*100)}%` : "—" },
          { label: "已婉拒", value: declined, delta: invited ? `${Math.round(declined/invited*100)}%` : "—", deltaColor: "var(--red)" },
        ]}
      />

      <Panel
        title="最新動態"
        action={
          <span className="badge badge-green">
            <span className="live-dot" />Live
          </span>
        }
      >
        {recent.length === 0 ? (
          <div className="py-10 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            尚無活動紀錄 — 當廠商開信或報名時會顯示在這裡
          </div>
        ) : (
          recent.map((a) => {
            const vendor = vendors.find((v) => v.id === a.vendorId);
            if (!vendor) return null;
            const act = ACTION[a.action] || ACTION.clicked;
            return (
              <div key={a.id} className="flex items-center gap-3 py-3"
                style={{ borderBottom: "1px solid var(--separator)" }}>
                <div className="w-9 h-9 rounded-full grid place-items-center"
                  style={{ background: "var(--bg-tinted)" }}>
                  <Icon name={act.icon} className="icon w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="text-[13px] font-medium">{vendor.company}</span>
                  <span className={`badge ${act.cls} ml-2`}>{act.label}</span>
                </div>
                <span className="text-[12px] font-display" style={{ color: "var(--text-tertiary)" }}>
                  {timeAgo(a.at)}
                  <span className="hidden">{tick}</span>
                </span>
              </div>
            );
          })
        )}
      </Panel>
    </>
  );
}
