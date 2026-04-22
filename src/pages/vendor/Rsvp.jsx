import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useData } from "../../store/data";
import { Icon } from "../../components/Icon";

// RSVP 邀約回覆公開頁 — PDF p8「發出邀約信，郵件內含活動內容及是否參加選項」
// 對應路由 /rsvp/:token（無需登入）
export default function Rsvp() {
  const { token } = useParams();
  const { invitations, vendors, events, rsvpResponses, respondRsvp } = useData();

  const inv = invitations.find((i) => i.token === token);
  // 兼容種子資料中預設的 token 格式
  const vendor = inv ? vendors.find((v) => v.id === inv.vendorId)
                     : vendors.find((v) => `tkn-${v.id}` === token || token?.includes(v.id));
  const event = vendor ? events.find((e) => e.id === vendor.eventId) : null;
  const existing = (rsvpResponses || []).find((r) => r.token === token);

  const [choice, setChoice] = useState(existing?.response || null);
  const [reason, setReason] = useState(existing?.reason || "");
  const [submitted, setSubmitted] = useState(!!existing);

  if (!vendor || !event) {
    return (
      <div className="min-h-screen grid place-items-center p-6" style={{ background: "var(--bg)" }}>
        <div className="panel max-w-md w-full text-center">
          <div className="text-5xl mb-4">🔗</div>
          <h1 className="text-2xl font-bold mb-2">連結無效或已失效</h1>
          <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
            這個邀約連結不存在或已過期，請聯繫主辦方重新寄送邀約。
          </p>
          <Link to="/" className="btn mt-6 inline-flex">回到首頁</Link>
        </div>
      </div>
    );
  }

  const submit = (r) => {
    if (r === "declined" && !reason.trim()) {
      if (!confirm("您尚未填寫婉拒原因，確定送出？")) return;
    }
    respondRsvp(token, r, reason.trim());
    setChoice(r);
    setSubmitted(true);
  };

  const change = () => {
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #fafafa 0%, #f0f4ff 100%)" }}>
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-11 h-11 rounded-xl grid place-items-center"
            style={{ background: "linear-gradient(135deg, #0071e3, #5e5ce6)" }}>
            <Icon name="layers" />
            <style>{`.w-11 .icon { stroke: white; }`}</style>
          </div>
          <div>
            <div className="font-display font-bold text-[16px]">Exhibition OS</div>
            <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>參展邀約回覆</div>
          </div>
        </div>

        {/* 活動資訊卡 */}
        <div className="panel mb-6" style={{ borderLeft: "4px solid var(--blue)" }}>
          <div className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--blue)" }}>
            PARTICIPATION INVITATION · 參展邀約
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">{event.name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[14px] mb-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>日期</div>
              <div className="font-medium">{event.startDate} ~ {event.endDate}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>地點</div>
              <div className="font-medium">{event.location}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>類型</div>
              <div className="font-medium">{event.type}</div>
            </div>
          </div>
          <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>{event.description}</p>
        </div>

        {/* 受邀者資訊 */}
        <div className="panel mb-6">
          <div className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-tertiary)" }}>
            INVITED · 受邀廠商
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="text-xl font-bold">{vendor.company}</div>
              <div className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                收件人：{vendor.contact} · {vendor.email}
              </div>
            </div>
          </div>
        </div>

        {/* 已回覆狀態 */}
        {submitted && (
          <div className="panel text-center" style={{
            background: choice === "accepted" ? "rgba(48,209,88,0.08)" : "rgba(255,59,48,0.06)",
            borderLeft: `4px solid ${choice === "accepted" ? "var(--green)" : "var(--red)"}`,
          }}>
            <div className="text-5xl mb-3">{choice === "accepted" ? "✅" : "📭"}</div>
            <h2 className="text-2xl font-bold mb-2">
              {choice === "accepted" ? "感謝您同意參展！" : "已收到您的婉拒回覆"}
            </h2>
            <p className="text-[14px] mb-4" style={{ color: "var(--text-secondary)" }}>
              {choice === "accepted"
                ? "我們已寄出註冊登入連結到您的信箱，請依指示完成參展資料登錄。"
                : "感謝您撥冗回覆，期待未來合作機會。"}
            </p>
            {choice === "declined" && existing?.reason && (
              <div className="text-[13px] p-3 rounded-lg inline-block" style={{ background: "var(--bg-tinted)", color: "var(--text-secondary)" }}>
                婉拒原因：{existing.reason}
              </div>
            )}
            <div className="mt-6">
              <button className="btn" onClick={change}>變更我的回覆</button>
            </div>
          </div>
        )}

        {/* 選擇按鈕 */}
        {!submitted && (
          <div className="panel">
            <h3 className="text-lg font-semibold mb-4">您是否參加本次展覽？</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => submit("accepted")}
                className="p-6 rounded-2xl text-left transition-all hover:shadow-md"
                style={{
                  border: `2px solid ${choice === "accepted" ? "var(--green)" : "var(--separator)"}`,
                  background: choice === "accepted" ? "rgba(48,209,88,0.08)" : "var(--bg-elevated)",
                }}
              >
                <div className="text-2xl mb-2">✅</div>
                <div className="font-bold text-lg mb-1">同意參展</div>
                <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                  確認出席，我們將寄送註冊登入連結給您
                </div>
              </button>
              <button
                onClick={() => setChoice("declined")}
                className="p-6 rounded-2xl text-left transition-all hover:shadow-md"
                style={{
                  border: `2px solid ${choice === "declined" ? "var(--red)" : "var(--separator)"}`,
                  background: choice === "declined" ? "rgba(255,59,48,0.06)" : "var(--bg-elevated)",
                }}
              >
                <div className="text-2xl mb-2">📭</div>
                <div className="font-bold text-lg mb-1">婉拒參展</div>
                <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                  今年度暫不參展
                </div>
              </button>
            </div>

            {choice === "declined" && (
              <div className="mt-4">
                <label className="block text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
                  婉拒原因（選填）
                </label>
                <textarea
                  className="input"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="例如：今年度展覽計畫已排滿／預算未核定／公司組織調整…"
                />
                <button
                  className="btn btn-primary mt-3"
                  onClick={() => submit("declined")}
                >
                  確認婉拒並送出
                </button>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-8 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
          此連結為主辦方寄發，單次有效；若誤點請忽略此郵件。
        </div>
      </div>
    </div>
  );
}
