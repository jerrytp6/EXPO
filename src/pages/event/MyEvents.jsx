import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { useData } from "../../store/data";
import { SceneHead, Panel } from "../../components/Scene";
import { Modal } from "../../components/Modal";
import { Icon } from "../../components/Icon";
import { toast } from "../../store/toast";

const EVENT_STAGES = [
  { id: "planning",   label: "規劃中", desc: "定義攤位規格、指派管理者", color: "#86868b" },
  { id: "recruiting", label: "招商中", desc: "匯入廠商、寄送邀請、產出參展名單", color: "#ff9f0a" },
  { id: "preparing",  label: "籌備中", desc: "確認文件繳交、攤位分配、裝潢管理", color: "#0071e3" },
];

function checkConditions(event, vendors) {
  const list = vendors.filter((v) => v.eventId === event.id);
  const idx = EVENT_STAGES.findIndex((s) => s.id === event.status);
  if (idx === 0) {
    // planning → recruiting: 需有攤位規格 + 管理者
    const checks = [
      { ok: event.boothTypes?.length > 0, label: "已定義攤位規格" },
      { ok: !!event.managerId, label: "已指派活動管理者" },
    ];
    return checks;
  }
  if (idx === 1) {
    // recruiting → preparing: 需有至少 1 家參展名單
    const confirmed = list.filter((v) => v.confirmStatus === "confirmed");
    return [
      { ok: list.length > 0, label: "已匯入廠商名單" },
      { ok: confirmed.length > 0, label: `已確認參展名單（${confirmed.length} 家）` },
    ];
  }
  return [];
}

export default function MyEvents() {
  const user = useAuth((s) => s.user);
  const { events, vendors, updateEvent } = useData();
  const [advanceModal, setAdvanceModal] = useState(null); // { event, direction: "forward"|"backward" }

  // 過濾：只顯示未過結束日的活動（自動歸檔）
  const today = new Date().toISOString().slice(0, 10);
  const myEvents = events.filter((e) => e.managerId === user.id && (!e.endDate || e.endDate >= today));

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
                  </div>
                  <div className="text-[13px] font-display mb-3" style={{ color: "var(--text-tertiary)" }}>
                    {e.startDate}{e.endDate !== e.startDate ? ` – ${e.endDate}` : ""} · {e.location}
                  </div>

                  {/* 狀態進度條 */}
                  {(() => {
                    const idx = EVENT_STAGES.findIndex((st) => st.id === e.status);
                    const current = EVENT_STAGES[idx];
                    const canForward = idx < EVENT_STAGES.length - 1;
                    const canBack = idx > 0;
                    return (
                      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl" style={{ background: "var(--bg-tinted)" }}>
                        <div className="flex gap-1 flex-1">
                          {EVENT_STAGES.map((stage, si) => (
                            <div key={stage.id} className="flex-1 flex flex-col items-center gap-1">
                              <div
                                className="w-full h-2 rounded-full"
                                style={{ background: si <= idx ? stage.color : "rgba(0,0,0,0.08)" }}
                              />
                              <span className="text-[10px] font-display" style={{ color: si === idx ? stage.color : "var(--text-tertiary)", fontWeight: si === idx ? 700 : 400 }}>
                                {stage.label}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {canBack && (
                            <button className="btn btn-ghost !py-1 !px-2 !text-[11px]"
                              onClick={() => setAdvanceModal({ event: e, direction: "backward" })}>
                              ← 回退
                            </button>
                          )}
                          {canForward && (
                            <button className="btn btn-primary !py-1 !px-2 !text-[11px]"
                              onClick={() => setAdvanceModal({ event: e, direction: "forward" })}>
                              推進 →
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}

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

      {/* 狀態推進/回退確認 Modal */}
      <Modal
        open={!!advanceModal}
        onClose={() => setAdvanceModal(null)}
        title={advanceModal?.direction === "forward" ? "推進活動狀態" : "回退活動狀態"}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setAdvanceModal(null)}>取消</button>
            <button className="btn btn-primary" onClick={() => {
              if (!advanceModal) return;
              const ev = advanceModal.event;
              const idx = EVENT_STAGES.findIndex((s) => s.id === ev.status);
              const targetIdx = advanceModal.direction === "forward" ? idx + 1 : idx - 1;
              const target = EVENT_STAGES[targetIdx];
              if (!target) return;
              updateEvent(ev.id, { status: target.id });
              toast.success(`「${ev.name}」狀態已變更為「${target.label}」`);
              setAdvanceModal(null);
            }}>
              確認變更
            </button>
          </>
        }
      >
        {advanceModal && (() => {
          const ev = advanceModal.event;
          const idx = EVENT_STAGES.findIndex((s) => s.id === ev.status);
          const from = EVENT_STAGES[idx];
          const targetIdx = advanceModal.direction === "forward" ? idx + 1 : idx - 1;
          const to = EVENT_STAGES[targetIdx];
          const conditions = advanceModal.direction === "forward" ? checkConditions(ev, vendors) : [];
          const allMet = conditions.every((c) => c.ok);
          return (
            <>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-pill text-[12px] font-display font-semibold"
                  style={{ background: from.color, color: "#fff" }}>
                  {from.label}
                </span>
                <span className="text-[16px]" style={{ color: "var(--text-tertiary)" }}>
                  {advanceModal.direction === "forward" ? "→" : "←"}
                </span>
                <span className="px-3 py-1 rounded-pill text-[12px] font-display font-semibold"
                  style={{ background: to.color, color: "#fff" }}>
                  {to.label}
                </span>
              </div>
              <p className="text-[13px] mb-3" style={{ color: "var(--text-secondary)" }}>
                {to.desc}
              </p>
              {conditions.length > 0 && (
                <div className="space-y-2 mb-2">
                  <div className="text-[11px] font-display font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                    推進條件檢查
                  </div>
                  {conditions.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-[12px]">
                      <span style={{ color: c.ok ? "var(--green)" : "var(--red)" }}>
                        {c.ok ? "✓" : "✗"}
                      </span>
                      <span style={{ color: c.ok ? "var(--text-primary)" : "var(--red)" }}>{c.label}</span>
                    </div>
                  ))}
                  {!allMet && (
                    <div className="text-[11px] mt-2 p-2 rounded-lg" style={{ background: "rgba(255,59,48,0.06)", color: "var(--red)" }}>
                      有未滿足的條件，仍可強制推進，但建議先完成上述項目。
                    </div>
                  )}
                </div>
              )}
              {advanceModal.direction === "backward" && (
                <div className="text-[12px] p-2 rounded-lg" style={{ background: "rgba(255,159,10,0.06)", color: "var(--orange)" }}>
                  回退不會刪除已有資料（廠商、攤位、文件），只是變更活動階段標記。
                </div>
              )}
            </>
          );
        })()}
      </Modal>
    </>
  );
}
