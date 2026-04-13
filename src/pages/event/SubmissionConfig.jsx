import { useParams, Navigate, Link } from "react-router-dom";

import { useData } from "../../store/data";
import { SceneHead, Panel } from "../../components/Scene";
import { Icon } from "../../components/Icon";
import { toast } from "../../store/toast";

const CATEGORIES = ["基本資料", "展位相關", "法規文件", "行銷素材", "其他"];

export default function SubmissionConfig() {
  const { eventId } = useParams();
  const {
    events,
    documentTemplates,
    eventDocuments,
    toggleEventDocument,
    setEventDocDeadline,
    setEventDocRequired,
    bulkToggleEventDocs,
  } = useData();

  const event = events.find((e) => e.id === eventId);
  if (!event) return <Navigate to="/event" replace />;

  const templates = [...documentTemplates].sort((a, b) => a.sortOrder - b.sortOrder);
  const enabled = new Set(
    eventDocuments.filter((ed) => ed.eventId === eventId).map((ed) => ed.templateId)
  );
  const getEventDoc = (tid) =>
    eventDocuments.find((ed) => ed.eventId === eventId && ed.templateId === tid);
  const getDeadline = (tid) => getEventDoc(tid)?.deadline || "";
  const getRequired = (tid, tplDefault) => {
    const ed = getEventDoc(tid);
    if (!ed) return tplDefault;
    return ed.required !== null && ed.required !== undefined ? ed.required : tplDefault;
  };
  const isRequiredOverridden = (tid) => {
    const ed = getEventDoc(tid);
    return ed && ed.required !== null && ed.required !== undefined;
  };
  const cycleRequired = (tid, tplDefault) => {
    if (!isRequiredOverridden(tid)) {
      setEventDocRequired(eventId, tid, !tplDefault);
    } else {
      setEventDocRequired(eventId, tid, null);
    }
  };

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    items: templates.filter((t) => t.category === cat),
  })).filter((g) => g.items.length > 0);

  const selectAll = () => {
    bulkToggleEventDocs(eventId, templates.map((t) => t.id), true);
    toast.success("已全選");
  };
  const deselectAll = () => {
    bulkToggleEventDocs(eventId, templates.map((t) => t.id), false);
    toast.info("已全部取消");
  };
  const selectRequired = () => {
    const requiredIds = templates.filter((t) => t.required).map((t) => t.id);
    bulkToggleEventDocs(eventId, requiredIds, true);
    toast.success(`已勾選 ${requiredIds.length} 項必填`);
  };

  return (
    <>
      <SceneHead
        tag={`EVENT · ${event.name}`}
        title="資料繳交管理"
        desc="從文件模板庫勾選本次活動需要的繳交項目，並設定各項截止日。"
      />

      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "rgba(0,0,0,0.05)", display: "inline-flex" }}>
        <Link
          to={`/event/${eventId}/submissions`}
          className="px-4 py-2 rounded-lg text-[13px] font-display font-medium no-underline transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          進度總覽
        </Link>
        <Link
          to={`/event/${eventId}/submissions/config`}
          className="px-4 py-2 rounded-lg text-[13px] font-display font-medium no-underline transition-colors"
          style={{ background: "var(--bg-elevated)", color: "var(--text-primary)", boxShadow: "var(--shadow-sm)" }}
        >
          繳交設定
        </Link>
      </div>

      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={selectAll}>全選</button>
          <button className="btn btn-ghost" onClick={selectRequired}>僅必填</button>
          <button className="btn btn-ghost" onClick={deselectAll}>全不選</button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-display" style={{ color: "var(--text-tertiary)" }}>
            已選 <strong className="text-ink-primary">{enabled.size}</strong> / {templates.length} 項
          </span>
          <Link to="/event/documents" className="btn btn-ghost">
            管理模板庫 →
          </Link>
        </div>
      </div>

      {templates.length === 0 ? (
        <Panel>
          <div className="py-12 text-center">
            <p className="text-[13px] mb-3" style={{ color: "var(--text-tertiary)" }}>
              文件模板庫為空，請先建立模板。
            </p>
            <Link to="/event/documents" className="btn btn-primary">前往建立 →</Link>
          </div>
        </Panel>
      ) : (
        grouped.map((g) => {
          const groupIds = g.items.map((i) => i.id);
          const allChecked = groupIds.every((id) => enabled.has(id));
          const someChecked = groupIds.some((id) => enabled.has(id));
          return (
            <Panel key={g.category}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                      onChange={() => bulkToggleEventDocs(eventId, groupIds, !allChecked)}
                    />
                    <span className="text-[15px] font-semibold">{g.category}</span>
                  </label>
                  <span className="text-[12px] font-display" style={{ color: "var(--text-tertiary)" }}>
                    {groupIds.filter((id) => enabled.has(id)).length}/{groupIds.length}
                  </span>
                </div>
                {someChecked && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-display" style={{ color: "var(--text-tertiary)" }}>
                      本類統一截止日：
                    </span>
                    <input
                      type="date"
                      className="px-3 py-1.5 rounded-lg text-[12px] outline-none"
                      style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
                      onChange={(e) => {
                        const d = e.target.value;
                        if (!d) return;
                        groupIds.filter((id) => enabled.has(id)).forEach((id) => {
                          setEventDocDeadline(eventId, id, d);
                        });
                        toast.success(`${g.category}：已統一設定截止日 ${d}`);
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {g.items.map((t) => {
                  const checked = enabled.has(t.id);
                  const deadline = getDeadline(t.id);
                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-4 p-3 rounded-xl transition-all"
                      style={{
                        border: checked ? "1px solid var(--role-color)" : "1px solid var(--separator)",
                        background: checked ? "rgba(255,159,10,0.03)" : "var(--bg-tinted)",
                        opacity: checked ? 1 : 0.7,
                      }}
                    >
                      <label className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleEventDocument(eventId, t.id, !checked)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium">{t.name}</span>
                          </div>
                          {t.formats && (
                            <div className="text-[11px] font-display mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                              {t.formats}
                            </div>
                          )}
                        </div>
                      </label>

                      {checked && (
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {/* 必填 toggle */}
                          <button
                            type="button"
                            onClick={() => cycleRequired(t.id, t.required)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-display font-medium transition-all"
                            style={{
                              background: isRequiredOverridden(t.id) ? "rgba(255,159,10,0.12)" : "rgba(0,0,0,0.04)",
                              border: isRequiredOverridden(t.id) ? "1px solid rgba(255,159,10,0.4)" : "1px solid transparent",
                              color: getRequired(t.id, t.required)
                                ? "var(--orange)"
                                : "var(--text-tertiary)",
                            }}
                            title={isRequiredOverridden(t.id)
                              ? `已覆寫（模板預設：${t.required ? "必填" : "選填"}），點擊回歸預設`
                              : `繼承模板預設（${t.required ? "必填" : "選填"}），點擊覆寫`}
                          >
                            {getRequired(t.id, t.required) ? "必填" : "選填"}
                            {isRequiredOverridden(t.id) && (
                              <span className="text-[9px] opacity-70">覆寫</span>
                            )}
                          </button>

                          {/* 截止日 */}
                          <input
                            type="date"
                            className="px-3 py-1.5 rounded-lg text-[12px] outline-none"
                            style={{ background: "var(--bg-elevated)", border: "1px solid var(--separator)" }}
                            value={deadline}
                            onChange={(e) => setEventDocDeadline(eventId, t.id, e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Panel>
          );
        })
      )}
    </>
  );
}
