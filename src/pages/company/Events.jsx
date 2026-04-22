import { Link } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { useData } from "../../store/data";
import { SceneHead, Panel, DataRow } from "../../components/Scene";
import { toast } from "../../store/toast";

const STATUS = {
  planning: { label: "規劃中", cls: "badge-gray" },
  recruiting: { label: "招商中", cls: "badge-orange" },
  preparing: { label: "籌備中", cls: "badge-blue" },
};

export default function CompanyEvents() {
  const user = useAuth((s) => s.user);
  const { events, users, vendors, deleteEvent, updateEvent } = useData();

  const myEvents = events.filter((e) => e.companyId === user.companyId);

  const assign = (eventId, managerId) => {
    updateEvent(eventId, { managerId });
    toast.success("已指派管理者");
  };

  const remove = (e) => {
    if (!confirm(`確定刪除活動「${e.name}」？相關廠商資料也會一併刪除。`)) return;
    deleteEvent(e.id);
    toast.info("已刪除");
  };

  const managers = users.filter((u) => u.companyId === user.companyId && (u.role === "event-manager" || u.role === "company-admin"));

  return (
    <>
      <SceneHead
        tag="EVENTS"
        title="展覽活動"
        desc="管理公司所有展覽活動、指派活動負責人。"
      />
      <div className="flex justify-end mb-4">
        <Link to="/company/events/new" className="btn btn-primary">+ 建立活動</Link>
      </div>
      <Panel>
        <DataRow
          header
          cols={[
            { content: "活動名稱", w: "2.5fr" },
            { content: "日期", w: "1.3fr" },
            { content: "廠商", w: "0.8fr" },
            { content: "管理者", w: "1.5fr" },
            { content: "狀態", w: "1fr" },
            { content: "", w: "0.8fr" },
          ]}
        />
        {myEvents.map((e) => {
          const st = STATUS[e.status] || STATUS.planning;
          const count = vendors.filter((v) => v.eventId === e.id).length;
          return (
            <DataRow
              key={e.id}
              cols={[
                {
                  content: (
                    <div>
                      <div className="font-medium">{e.name}</div>
                      <div className="text-[11px] font-display" style={{ color: "var(--text-tertiary)" }}>{e.location}</div>
                    </div>
                  ),
                  w: "2.5fr",
                },
                {
                  content: <span className="font-display text-[12px]">
                    {e.startDate}{e.endDate !== e.startDate ? ` – ${e.endDate}` : ""}
                  </span>,
                  w: "1.3fr",
                },
                { content: <span className="font-display">{count}</span>, w: "0.8fr" },
                {
                  content: (
                    <select value={e.managerId || ""} onChange={(ev) => assign(e.id, ev.target.value || null)}
                      className="px-2 py-1 rounded-lg text-[12px] outline-none w-full"
                      style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}>
                      <option value="">未指派</option>
                      {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  ),
                  w: "1.5fr",
                },
                { content: <span className={`badge ${st.cls}`}>{st.label}</span>, w: "1fr" },
                {
                  content: (
                    <button className="btn btn-ghost !py-1 !text-xs" onClick={() => remove(e)}>刪除</button>
                  ),
                  w: "0.8fr",
                },
              ]}
            />
          );
        })}
      </Panel>
    </>
  );
}
