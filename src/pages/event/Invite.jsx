import { useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useData } from "../../store/data";
import { SceneHead, Panel, Field, DataRow } from "../../components/Scene";
import { Icon } from "../../components/Icon";
import { toast } from "../../store/toast";

export default function Invite() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { events, vendors, sendInvitations } = useData();
  const event = events.find((e) => e.id === eventId);

  const pendingVendors = vendors.filter((v) => v.eventId === eventId && (v.status === "pending" || !v.invitedAt));
  const [selected, setSelected] = useState(new Set(pendingVendors.map((v) => v.id)));

  if (!event) return <Navigate to="/event" replace />;

  const [subject, setSubject] = useState(`【誠摯邀請】${event.name}`);
  const [body, setBody] = useState(
    `親愛的合作夥伴您好，\n\n誠摯邀請貴公司參加 ${event.name}，活動將於 ${event.startDate} 在 ${event.location} 舉行。\n\n請點擊下方專屬連結確認報名，期待與您見面。\n\n— 群揚資通`
  );

  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const toggleAll = () => {
    if (selected.size === pendingVendors.length) setSelected(new Set());
    else setSelected(new Set(pendingVendors.map((v) => v.id)));
  };

  const send = () => {
    if (selected.size === 0) {
      toast.error("請至少選擇一家廠商");
      return;
    }
    sendInvitations(eventId, Array.from(selected));
    toast.success(`已寄送 ${selected.size} 封邀請信`);
    navigate(`/event/${eventId}/monitor`);
  };

  return (
    <>
      <SceneHead
        tag={`EVENT · ${event.name}`}
        title="寄送邀請函"
        desc="編輯郵件內容並選擇要寄送的廠商，系統會自動產生專屬報名連結。"
      />

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3">
          <Panel title="郵件內容">
            <Field label="主旨">
              <input className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
                value={subject} onChange={(e) => setSubject(e.target.value)} />
            </Field>
            <Field label="郵件內文">
              <textarea className="w-full px-4 py-3 rounded-xl text-[14px] outline-none min-h-[240px] font-mono"
                style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
                value={body} onChange={(e) => setBody(e.target.value)} />
            </Field>
          </Panel>
        </div>

        <div className="col-span-2">
          <Panel
            title={`選擇寄送對象 (${selected.size}/${pendingVendors.length})`}
            action={
              <button className="btn btn-ghost !py-1 !text-xs" onClick={toggleAll}>
                {selected.size === pendingVendors.length ? "全不選" : "全選"}
              </button>
            }
          >
            {pendingVendors.length === 0 ? (
              <div className="py-6 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                沒有待寄送的廠商
              </div>
            ) : (
              <div className="max-h-[280px] overflow-auto -mx-2 px-2">
                {pendingVendors.map((v) => {
                  const sel = selected.has(v.id);
                  return (
                    <label key={v.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer"
                      style={{ background: sel ? "rgba(0,113,227,0.05)" : "transparent" }}>
                      <input type="checkbox" checked={sel} onChange={() => toggle(v.id)} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium truncate">{v.company}</div>
                        <div className="text-[11px] font-display truncate" style={{ color: "var(--text-tertiary)" }}>
                          {v.email}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
            <button className="btn btn-primary w-full mt-4" onClick={send}>
              <Icon name="send" className="icon w-4 h-4" />
              立即寄送 {selected.size} 封
            </button>
          </Panel>
        </div>
      </div>
    </>
  );
}
