import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useData } from "../../store/data";
import { SceneHead, Panel, Field } from "../../components/Scene";
import { Modal } from "../../components/Modal";
import { Icon } from "../../components/Icon";
import { toast } from "../../store/toast";

const PROJECT_STATUS = {
  draft:     { label: "草擬中",   cls: "badge-gray" },
  designing: { label: "設計中",   cls: "badge-blue" },
  review:    { label: "待審稿",   cls: "badge-orange" },
  approved:  { label: "已核准",   cls: "badge-green" },
  building:  { label: "施工中",   cls: "badge-purple" },
  completed: { label: "已完成",   cls: "badge-green" },
};

const DESIGN_STATUS = {
  pending:  { label: "待客戶審核", cls: "badge-orange" },
  approved: { label: "已核准",     cls: "badge-green" },
  rejected: { label: "已退回",     cls: "badge-gray" },
  revising: { label: "修改中",     cls: "badge-blue" },
};

export default function DecoratorProject({ decorator }) {
  const { decoratorId, projectId } = useParams();
  const {
    decorationProjects,
    vendors,
    events,
    designs,
    messages,
    uploadDesign,
    sendMessage,
    updateProject,
  } = useData();

  const project = decorationProjects.find((p) => p.id === projectId);
  if (!project) return <Navigate to={`/portal/decorator/${decoratorId}`} replace />;

  const vendor = vendors.find((v) => v.id === project.vendorId);
  const event = events.find((e) => e.id === project.eventId);
  const projectDesigns = designs.filter((d) => d.projectId === project.id);
  const projectMessages = messages
    .filter((m) => m.projectId === project.id)
    .sort((a, b) => a.at - b.at);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [newMsg, setNewMsg] = useState("");

  const submit = () => {
    if (!form.title) {
      toast.error("請輸入設計稿標題");
      return;
    }
    uploadDesign(project.id, form);
    toast.success("設計稿已上傳");
    setForm({ title: "", description: "" });
    setUploadOpen(false);
  };

  const send = () => {
    if (!newMsg.trim()) return;
    sendMessage(project.id, "decorator", decorator.contact || decorator.name, newMsg.trim());
    setNewMsg("");
  };

  const markBuilding = () => {
    updateProject(project.id, { status: "building" });
    toast.success("專案已進入施工階段");
  };
  const markCompleted = () => {
    updateProject(project.id, { status: "completed" });
    toast.success("專案已標記為完成");
  };

  return (
    <>
      <div className="mb-4">
        <Link
          to={`/portal/decorator/${decoratorId}`}
          className="text-[12px] font-display no-underline"
          style={{ color: "var(--text-tertiary)" }}
        >
          ← 返回專案列表
        </Link>
      </div>

      <SceneHead
        tag={`PROJECT · ${project.id.toUpperCase()}`}
        title={vendor?.company || "專案"}
        desc={`${event?.name || ""} · ${event?.startDate || ""} · ${event?.location || ""}`}
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Panel
            title="專案資訊"
            action={
              <span className={`badge ${PROJECT_STATUS[project.status]?.cls}`}>
                {PROJECT_STATUS[project.status]?.label || project.status}
              </span>
            }
          >
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                ["展位編號", vendor?.boothNumber || "待配置"],
                ["展位尺寸", vendor?.boothSize || "—"],
                [
                  "展位類型",
                  { standard: "標準", island: "島型", premium: "旗艦" }[vendor?.boothType] || "—",
                ],
              ].map(([k, v]) => (
                <div key={k} className="p-3 rounded-lg" style={{ background: "var(--bg-tinted)" }}>
                  <div
                    className="text-[10px] font-display uppercase tracking-wider"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {k}
                  </div>
                  <div className="text-[16px] font-bold mt-1">{v}</div>
                </div>
              ))}
            </div>

            {vendor?.profile && (
              <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                <div
                  className="text-[11px] font-display uppercase tracking-wider mb-1"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  客戶簡介
                </div>
                {vendor.profile}
              </div>
            )}

            <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: "1px solid var(--separator)" }}>
              {project.status === "approved" && (
                <button className="btn btn-primary" onClick={markBuilding}>
                  開始施工
                </button>
              )}
              {project.status === "building" && (
                <button className="btn btn-primary" onClick={markCompleted}>
                  標記為完成
                </button>
              )}
              <button className="btn btn-primary !ml-auto" onClick={() => setUploadOpen(true)}>
                + 上傳設計稿
              </button>
            </div>
          </Panel>

          <Panel title={`設計稿 (${projectDesigns.length})`}>
            {projectDesigns.length === 0 ? (
              <div className="py-8 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                尚未上傳任何設計稿
              </div>
            ) : (
              <div className="space-y-3">
                {projectDesigns
                  .slice()
                  .reverse()
                  .map((d) => (
                    <div
                      key={d.id}
                      className="p-4 rounded-xl"
                      style={{
                        background: "var(--bg-tinted)",
                        border: "1px solid var(--separator)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-[13px]">{d.version}</span>
                          <span className="text-[14px] font-semibold">{d.title}</span>
                        </div>
                        <span className={`badge ${DESIGN_STATUS[d.status]?.cls || "badge-gray"}`}>
                          {DESIGN_STATUS[d.status]?.label || d.status}
                        </span>
                      </div>
                      {d.description && (
                        <p className="text-[13px] mb-3" style={{ color: "var(--text-secondary)" }}>
                          {d.description}
                        </p>
                      )}
                      {d.feedback && (
                        <div
                          className="p-2.5 rounded-lg text-[12px] mb-2"
                          style={{
                            background:
                              d.status === "approved"
                                ? "rgba(48,209,88,0.08)"
                                : "rgba(255,159,10,0.08)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <strong>客戶回饋：</strong>
                          {d.feedback}
                        </div>
                      )}
                      <div
                        className="text-[11px] font-display"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        上傳於 {d.uploadedAt}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="col-span-1">
          <Panel title="客戶資訊" className="!mb-4">
            <div className="text-[14px] font-semibold mb-1">{vendor?.company}</div>
            <div className="text-[12px] font-display mb-3" style={{ color: "var(--text-tertiary)" }}>
              統編 {vendor?.taxId}
            </div>
            <div className="space-y-1.5 text-[12px]" style={{ color: "var(--text-secondary)" }}>
              <div>聯絡人：{vendor?.contact}</div>
              <div className="font-display">{vendor?.email}</div>
              <div className="font-display">{vendor?.phone}</div>
            </div>
          </Panel>

          <Panel title="訊息" className="!p-0 overflow-hidden">
            <div className="px-6 py-4 max-h-[360px] overflow-auto space-y-3">
              {projectMessages.length === 0 ? (
                <div className="text-[12px] text-center py-6" style={{ color: "var(--text-tertiary)" }}>
                  尚無訊息
                </div>
              ) : (
                projectMessages.map((m) => {
                  const mine = m.sender === "decorator";
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className="max-w-[80%] px-3 py-2 rounded-xl text-[13px]"
                        style={
                          mine
                            ? { background: "var(--role-color)", color: "#fff" }
                            : { background: "var(--bg-tinted)", color: "var(--text-primary)" }
                        }
                      >
                        <div
                          className="text-[10px] font-display mb-0.5 opacity-70"
                          style={{ color: mine ? "#fff" : "var(--text-tertiary)" }}
                        >
                          {m.senderName}
                        </div>
                        {m.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div
              className="px-4 py-3 flex gap-2"
              style={{ borderTop: "1px solid var(--separator)", background: "var(--bg-tinted)" }}
            >
              <input
                className="flex-1 px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--separator)" }}
                placeholder="輸入訊息…"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button className="btn btn-primary !py-2 !px-3" onClick={send}>
                <Icon name="send" className="icon w-4 h-4" />
              </button>
            </div>
          </Panel>
        </div>
      </div>

      {/* 上傳設計稿 modal */}
      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="上傳設計稿"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setUploadOpen(false)}>
              取消
            </button>
            <button className="btn btn-primary" onClick={submit}>
              送出審核
            </button>
          </>
        }
      >
        <p className="text-[13px] mb-4" style={{ color: "var(--text-secondary)" }}>
          系統會自動產生版本號，並通知廠商審核。
        </p>
        <Field label="設計稿標題 *">
          <input
            className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
            style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="例：細部材質與燈光配置"
          />
        </Field>
        <Field label="設計說明">
          <textarea
            className="w-full px-4 py-3 rounded-xl text-[14px] outline-none min-h-[100px]"
            style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="說明本版設計的重點與調整內容…"
          />
        </Field>
      </Modal>
    </>
  );
}
