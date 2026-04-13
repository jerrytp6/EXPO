import { Link } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { useData } from "../../store/data";
import { SceneHead, Panel } from "../../components/Scene";
import { Icon } from "../../components/Icon";

export default function MyEvents() {
  const user = useAuth((s) => s.user);
  const { events, vendors } = useData();

  const myEvents = events.filter((e) => e.managerId === user.id);

  const statLabel = (e) => {
    const vs = vendors.filter((v) => v.eventId === e.id);
    const total = vs.length;
    const clicked = vs.filter((v) => v.clickedAt).length;
    const registered = vs.filter((v) => v.status === "registered").length;
    return { total, clicked, registered };
  };

  return (
    <>
      <SceneHead
        tag="MY EVENTS"
        title="我負責的活動"
        desc="您目前負責執行的展覽活動清單。"
      />

      {myEvents.length === 0 ? (
        <Panel>
          <div className="py-12 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            目前沒有被指派的活動。請聯繫公司管理者指派。
          </div>
        </Panel>
      ) : (
        myEvents.map((e) => {
          const s = statLabel(e);
          const rate = s.total > 0 ? Math.round((s.registered / s.total) * 100) : 0;
          return (
            <Panel key={e.id}>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl grid place-items-center flex-shrink-0"
                  style={{ background: "var(--role-grad)" }}>
                  <Icon name="calendar" className="icon" />
                  <style>{`.panel > div > div:first-child .icon { stroke: white; }`}</style>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-[18px] font-bold tracking-tight">{e.name}</h3>
                    <span className="badge badge-orange">{e.status}</span>
                  </div>
                  <div className="text-[13px] font-display mb-4" style={{ color: "var(--text-tertiary)" }}>
                    {e.startDate}{e.endDate !== e.startDate ? ` – ${e.endDate}` : ""} · {e.location}
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 mb-4"
                    style={{ borderTop: "1px solid var(--separator)" }}>
                    {[
                      ["邀請廠商", s.total],
                      ["已點擊", s.clicked],
                      ["已報名", `${s.registered} (${rate}%)`],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div className="text-[11px] font-display uppercase tracking-wider"
                          style={{ color: "var(--text-tertiary)" }}>{k}</div>
                        <div className="text-xl font-bold">{v}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Link to={`/event/${e.id}/vendors`} className="btn btn-primary">管理廠商</Link>
                    <Link to={`/event/${e.id}/import`} className="btn btn-ghost">匯入</Link>
                    <Link to={`/event/${e.id}/invite`} className="btn btn-ghost">寄送邀請</Link>
                    <Link to={`/event/${e.id}/monitor`} className="btn btn-ghost">即時監控</Link>
                    <Link to={`/event/${e.id}/submissions`} className="btn btn-ghost">資料繳交</Link>
                  </div>
                </div>
              </div>
            </Panel>
          );
        })
      )}
    </>
  );
}
