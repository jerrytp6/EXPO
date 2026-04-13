import { useState } from "react";
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
  pending:  { label: "待審核", cls: "badge-orange" },
  approved: { label: "已核准", cls: "badge-green" },
  rejected: { label: "已退回", cls: "badge-gray" },
  revising: { label: "修改中", cls: "badge-blue" },
};

export default function VendorDecoration({ vendor, event }) {
  const {
    decorationProjects,
    decorators,
    designs,
    messages,
    inviteDecorator,
    reviewDesign,
    sendMessage,
  } = useData();

  const project = decorationProjects.find((p) => p.vendorId === vendor.id);
  const decorator = project ? decorators.find((d) => d.id === project.decoratorId) : null;
  const projectDesigns = project ? designs.filter((d) => d.projectId === project.id) : [];
  const projectMessages = project
    ? messages.filter((m) => m.projectId === project.id).sort((a, b) => a.at - b.at)
    : [];

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ company: "", email: "", message: "" });
  const [feedbackFor, setFeedbackFor] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [newMsg, setNewMsg] = useState("");

  const submitInvite = () => {
    if (!inviteForm.company || !inviteForm.email) {
      toast.error("請填寫公司名稱與 Email");
      return;
    }
    const inv = inviteDecorator(vendor.id, inviteForm);
    toast.success(`邀請已建立`);
    setInviteOpen(false);
    setInviteForm({ company: "", email: "", message: "" });

    const link = `${window.location.origin}/decor-invite/${inv.token}`;
    navigator.clipboard?.writeText(link);
    toast.info("邀請連結已複製到剪貼簿");
  };

  const approve = (designId) => {
    reviewDesign(designId, "approved", feedbackText);
    toast.success("已核准設計稿");
    setFeedbackFor(null);
    setFeedbackText("");
  };
  const reject = (designId) => {
    reviewDesign(designId, "rejected", feedbackText);
    toast.info("已退回設計稿");
    setFeedbackFor(null);
    setFeedbackText("");
  };

  const send = () => {
    if (!newMsg.trim()) return;
    sendMessage(project.id, "vendor", vendor.contact || vendor.company, newMsg.trim());
    setNewMsg("");
  };

  // 沒有專案 → 邀請流程
  if (!project) {
    return (
      <>
        <SceneHead
          tag="DECORATION"
          title="裝潢管理"
          desc="邀請您信任的裝潢公司，共同打造完美展位。"
        />
        <Panel>
          <div className="text-center py-10">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-5 grid place-items-center"
              style={{ background: "linear-gradient(135deg, #ff6a00, #ff2d92)" }}
            >
              <Icon name="sparkles" className="icon" />
              <style>{`.text-center .icon { stroke: white; width: 32px; height: 32px; }`}</style>
            </div>
            <h3 className="text-[18px] font-bold mb-2">尚未指派裝潢公司</h3>
            <p className="text-[13px] mb-6 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
              發送專屬連結邀請您配合的裝潢公司，他們將會看到您的展位資訊並開始規劃設計。
            </p>
            <button className="btn btn-primary" onClick={() => setInviteOpen(true)}>
              + 邀請裝潢公司
            </button>
          </div>
        </Panel>

        <InviteModal
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          form={inviteForm}
          setForm={setInviteForm}
          onSubmit={submitInvite}
        />
      </>
    );
  }

  // 有專案 → 顯示專案 + 設計稿 + 訊息
  return (
    <>
      <SceneHead
        tag="DECORATION"
        title="裝潢管理"
        desc={`${decorator?.name || ""} · ${event?.name || ""}`}
      />

      <div className="grid grid-cols-3 gap-6">
        {/* 主區：專案 + 設計稿 */}
        <div className="col-span-2">
          <Panel title="專案資訊">
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-xl grid place-items-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #ff6a00, #ff2d92)" }}
              >
                <Icon name="sparkles" className="icon" />
                <style>{`.flex.items-start > div:first-child .icon { stroke: white; }`}</style>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[16px] font-semibold">{decorator?.name}</h3>
                  <span className={`badge ${PROJECT_STATUS[project.status]?.cls || "badge-gray"}`}>
                    {PROJECT_STATUS[project.status]?.label || project.status}
                  </span>
                </div>
                <div className="text-[12px] font-display" style={{ color: "var(--text-tertiary)" }}>
                  {decorator?.contact} · {decorator?.email} · {decorator?.phone}
                </div>
              </div>
            </div>
            {project.title && (
              <div
                className="p-3 rounded-lg text-[13px]"
                style={{ background: "var(--bg-tinted)", color: "var(--text-secondary)" }}
              >
                {project.title}
                {project.deadline && <> · 截止日期：{project.deadline}</>}
              </div>
            )}
          </Panel>

          <Panel title={`設計稿 (${projectDesigns.length})`}>
            {projectDesigns.length === 0 ? (
              <div className="py-8 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                裝潢公司尚未上傳任何設計稿
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
                      style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
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
                      <p className="text-[13px] mb-3" style={{ color: "var(--text-secondary)" }}>
                        {d.description}
                      </p>
                      {d.feedback && (
                        <div
                          className="p-2.5 rounded-lg text-[12px] mb-3"
                          style={{ background: "rgba(0,0,0,0.04)", color: "var(--text-secondary)" }}
                        >
                          <strong>回饋：</strong>
                          {d.feedback}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-display" style={{ color: "var(--text-tertiary)" }}>
                          上傳於 {d.uploadedAt}
                        </span>
                        {d.status === "pending" && (
                          <button
                            className="btn btn-primary !py-1 !text-xs"
                            onClick={() => {
                              setFeedbackFor(d.id);
                              setFeedbackText("");
                            }}
                          >
                            審核
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Panel>
        </div>

        {/* 側邊：訊息 */}
        <div className="col-span-1">
          <Panel title="訊息" className="!p-0 overflow-hidden">
            <div className="px-6 pt-5 pb-3" style={{ borderBottom: "1px solid var(--separator)" }}>
              <h3 className="text-[15px] font-semibold">與裝潢公司溝通</h3>
            </div>
            <div className="px-6 py-4 max-h-[420px] overflow-auto space-y-3">
              {projectMessages.length === 0 ? (
                <div className="text-[12px] text-center py-6" style={{ color: "var(--text-tertiary)" }}>
                  尚無訊息
                </div>
              ) : (
                projectMessages.map((m) => {
                  const mine = m.sender === "vendor";
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

      {/* 設計稿審核 modal */}
      <Modal
        open={!!feedbackFor}
        onClose={() => setFeedbackFor(null)}
        title="審核設計稿"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => reject(feedbackFor)}>
              退回修改
            </button>
            <button className="btn btn-primary" onClick={() => approve(feedbackFor)}>
              核准設計
            </button>
          </>
        }
      >
        <Field label="回饋意見（選填）">
          <textarea
            className="w-full px-4 py-3 rounded-xl text-[14px] outline-none min-h-[120px]"
            style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="若退回，請說明需要修改的部分…"
          />
        </Field>
      </Modal>
    </>
  );
}

function InviteModal({ open, onClose, form, setForm, onSubmit }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="邀請裝潢公司"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            取消
          </button>
          <button className="btn btn-primary" onClick={onSubmit}>
            產生邀請連結
          </button>
        </>
      }
    >
      <p className="text-[13px] mb-4" style={{ color: "var(--text-secondary)" }}>
        系統會產生專屬連結，您可以將連結傳給裝潢公司讓他們開啟並開始合作。
      </p>
      <Field label="裝潢公司名稱 *">
        <input
          className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
          style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          placeholder="例：築境空間設計"
        />
      </Field>
      <Field label="聯絡 Email *">
        <input
          type="email"
          className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
          style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="design@company.com"
        />
      </Field>
      <Field label="附帶訊息（選填）">
        <textarea
          className="w-full px-4 py-3 rounded-xl text-[14px] outline-none min-h-[80px]"
          style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="您好，我們想邀請貴公司協助本次展位裝潢…"
        />
      </Field>
    </Modal>
  );
}
