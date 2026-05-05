import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../lib/api";
import { Icon } from "../../components/Icon";
import { toast } from "../../store/toast";

// 裝潢公司接受廠商邀請 — 公開頁，無需登入
// G1：改用 public token endpoint（/public/decor-invite/:token）
export default function DecoratorInvitation() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.get(`/public/decor-invite/${token}`)
      .then(setInvitation)
      .catch((err) => setError(err.body?.error || err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const accept = async () => {
    try {
      await api.post(`/public/decor-invite/${token}/respond`, { status: "accepted" });
      setInvitation((i) => ({ ...i, status: "accepted" }));
      setDone(true);
      toast.success("已接受邀請");
    } catch (err) {
      toast.error(`接受失敗：${err.body?.error || err.message}`);
    }
  };

  const decline = async () => {
    try {
      await api.post(`/public/decor-invite/${token}/respond`, { status: "declined" });
      setInvitation((i) => ({ ...i, status: "declined" }));
      toast.info("已記錄您的回覆");
    } catch (err) {
      toast.error(`回覆失敗：${err.body?.error || err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center p-8">
        <div className="text-[14px]" style={{ color: "var(--text-tertiary)" }}>載入中…</div>
      </div>
    );
  }
  if (error || !invitation) {
    return (
      <div className="min-h-screen grid place-items-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-2">邀請連結無效</h1>
          <p className="text-[14px] mb-6" style={{ color: "var(--text-secondary)" }}>
            {error === "expired" ? "此連結已過期。" : "此連結不存在或已過期。"}
          </p>
          <Link to="/login" className="btn btn-primary">回到首頁</Link>
        </div>
      </div>
    );
  }

  const event = invitation.event;
  const alreadyResponded = invitation.status !== "sent";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }} data-role="decorator">
      <div className="max-w-[720px] mx-auto p-6 md:p-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl grid place-items-center"
            style={{ background: "linear-gradient(135deg, #ff6a00, #ff2d92)" }}>
            <Icon name="sparkles" className="icon" />
            <style>{`.flex.items-center > div:first-child .icon { stroke: white; }`}</style>
          </div>
          <div>
            <div className="font-display font-bold text-[15px]">Exhibition OS</div>
            <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              裝潢公司合作邀請
            </div>
          </div>
        </div>

        <div className="rounded-3xl p-8 md:p-10 text-white relative overflow-hidden mb-6"
          style={{ background: "linear-gradient(135deg, #ff6a00 0%, #ff2d92 50%, #bf5af2 100%)" }}>
          <div className="text-[11px] font-display uppercase tracking-[0.2em] opacity-80 mb-3">
            Decoration Partnership Invitation
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            邀請您合作{invitation.decoratorCompany ? `（${invitation.decoratorCompany}）` : ""}
          </h1>
          <div className="text-[14px] font-display opacity-90">
            {event?.name} · {event?.startDate?.slice(0, 10)} · {event?.location}
          </div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="panel mb-6">
          <div className="text-[13px] font-display mb-2" style={{ color: "var(--text-tertiary)" }}>
            收件 Email：{invitation.decoratorEmail}
          </div>
          <p className="text-[15px] leading-relaxed mb-4">
            {invitation.message || "誠摯邀請貴公司協助本次展位設計與裝潢。"}
          </p>

          {alreadyResponded ? (
            <div className="p-3 rounded-lg text-[13px]"
              style={{
                background: invitation.status === "accepted" ? "rgba(48,209,88,0.08)" : "rgba(255,159,10,0.08)",
                color: invitation.status === "accepted" ? "#1f8a3a" : "#a06400",
              }}>
              {invitation.status === "accepted" ? "✓ 您已接受此邀請" : "您已回覆婉拒此邀請"}
            </div>
          ) : (
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={accept}>接受邀請 →</button>
              <button className="btn btn-ghost" onClick={decline}>婉拒</button>
            </div>
          )}
        </div>

        {done && (
          <div className="panel text-center py-8">
            <div className="w-20 h-20 rounded-full mx-auto mb-5 grid place-items-center"
              style={{ background: "linear-gradient(135deg, #ff6a00, #ff2d92)" }}>
              <Icon name="check" className="icon" />
              <style>{`.text-center .icon { stroke: white; width: 38px; height: 38px; }`}</style>
            </div>
            <h2 className="text-2xl font-bold mb-2 tracking-tight">已接受邀請！</h2>
            <p className="text-[14px] mb-4" style={{ color: "var(--text-secondary)" }}>
              活動管理員會在 EX 系統建立您的裝潢廠商帳號並分派專案。
            </p>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              如有問題請聯繫 {invitation.decoratorEmail}
            </p>
          </div>
        )}

        <div className="text-center mt-8 text-[11px] font-display"
          style={{ color: "var(--text-tertiary)" }}>
          Powered by Exhibition OS · 連結登入專屬頁面
        </div>
      </div>
    </div>
  );
}
