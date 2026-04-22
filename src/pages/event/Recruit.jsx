import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useData } from "../../store/data";
import { SceneHead, Panel, DataRow, StatGrid } from "../../components/Scene";
import { toast } from "../../store/toast";

// 客戶模組 #2「廠商招展」— 邀約發送 + RSVP 回覆狀態總覽（對應 PDF p8-9）
const RSVP_LABEL = {
  accepted: { text: "同意參展",   cls: "chip-green" },
  declined: { text: "婉拒",       cls: "chip-red" },
  pending:  { text: "未回覆",     cls: "chip-orange" },
};

export default function Recruit() {
  const { eventId } = useParams();
  const { vendors, events, invitations, sendInvitations } = useData();
  const event = events.find((e) => e.id === eventId);
  const eventVendors = vendors.filter((v) => v.eventId === eventId);
  const eventInvitations = invitations.filter((i) => i.eventId === eventId);

  const stats = useMemo(() => {
    const total = eventVendors.length;
    const accepted = eventVendors.filter((v) => v.rsvpStatus === "accepted").length;
    const declined = eventVendors.filter((v) => v.rsvpStatus === "declined").length;
    const pending = eventVendors.filter((v) => !v.rsvpStatus || v.rsvpStatus === "pending").length;
    const registered = eventVendors.filter((v) => v.status === "registered").length;
    return [
      { label: "招展廠商數", value: total },
      { label: "同意參展", value: accepted, deltaColor: "var(--green)" },
      { label: "尚未回覆", value: pending, deltaColor: "var(--orange)" },
      { label: "完成註冊", value: registered, deltaColor: "var(--blue)" },
    ];
  }, [eventVendors]);

  const getRsvpLink = (vendorId) => {
    const inv = eventInvitations.find((i) => i.vendorId === vendorId) ||
      { token: `tkn-${vendorId}` };
    return `${window.location.origin}${window.location.pathname}#/rsvp/${inv.token}`;
  };

  const copyRsvp = (vendorId) => {
    const link = getRsvpLink(vendorId);
    navigator.clipboard.writeText(link).then(() => toast.success("邀約連結已複製"));
  };

  const resend = (vendorId) => {
    sendInvitations(eventId, [vendorId]);
    toast.success("已重發邀約（Demo 模擬）");
  };

  return (
    <>
      <SceneHead
        tag="RECRUIT · 廠商招展"
        title={`${event?.name || "—"} 招展管理`}
        desc="管理攤位招商：發送邀約信、追蹤 RSVP 回覆、重發邀請。"
      />

      <StatGrid stats={stats} />

      <Panel>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
            邀約信內會帶有「同意/婉拒」單次回覆連結；廠商點擊即可直接回覆（免登入）。
          </div>
          <Link to={`/event/${eventId}/import`} className="btn">批次匯入廠商</Link>
        </div>
        <DataRow
          header
          cols={[
            { content: "廠商",               w: "2fr" },
            { content: "邀約時間",           w: "1fr" },
            { content: "RSVP",               w: "1fr" },
            { content: "回覆時間 / 原因",     w: "1.5fr" },
            { content: "註冊狀態",           w: "1fr" },
            { content: "動作",               w: "1.5fr" },
          ]}
        />
        {eventVendors.map((v) => {
          const rsvp = RSVP_LABEL[v.rsvpStatus || "pending"];
          return (
            <DataRow
              key={v.id}
              cols={[
                {
                  content: (
                    <div>
                      <div className="font-medium">{v.company}</div>
                      <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                        {v.contact} · {v.email}
                      </div>
                    </div>
                  ),
                  w: "2fr",
                },
                { content: <span className="text-[12px]">{v.invitedAt?.slice(0, 10) || "—"}</span>, w: "1fr" },
                { content: <span className={`chip ${rsvp.cls}`}>{rsvp.text}</span>, w: "1fr" },
                {
                  content: (
                    <div className="text-[12px]">
                      {v.rsvpRespondedAt && <div>{v.rsvpRespondedAt}</div>}
                      {v.rsvpStatus === "declined" && v.reason && (
                        <div style={{ color: "var(--text-tertiary)" }} className="line-clamp-2">{v.reason}</div>
                      )}
                    </div>
                  ),
                  w: "1.5fr",
                },
                {
                  content: (
                    <span className={`chip ${
                      v.status === "registered" ? "chip-green" :
                      v.status === "invited"    ? "chip-blue" :
                      v.status === "declined"   ? "chip-red" :
                      v.status === "clicked"    ? "chip-orange" : ""
                    }`}>
                      {v.status === "registered" ? "已註冊" :
                       v.status === "invited"    ? "已邀約" :
                       v.status === "clicked"    ? "已點擊" :
                       v.status === "declined"   ? "婉拒" : v.status}
                    </span>
                  ),
                  w: "1fr",
                },
                {
                  content: (
                    <div className="flex gap-1">
                      <button className="btn btn-sm" onClick={() => copyRsvp(v.id)}>複製連結</button>
                      <button className="btn btn-sm" onClick={() => resend(v.id)}>重發邀約</button>
                    </div>
                  ),
                  w: "1.5fr",
                },
              ]}
            />
          );
        })}
        {eventVendors.length === 0 && (
          <div className="text-center py-10 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            尚未有廠商 — 請先批次匯入
          </div>
        )}
      </Panel>
    </>
  );
}
