import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Icon } from "../components/Icon";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("請輸入 Email"); return; }
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(err.body?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6"
      style={{ background: "linear-gradient(135deg, #f5f5f7 0%, #e8ecf5 100%)" }}>
      <div className="w-full max-w-[440px]">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl grid place-items-center"
            style={{ background: "linear-gradient(135deg, #30d158, #0bb850)" }}>
            <Icon name="layers" />
            <style>{`.w-12 .icon { stroke: white; width: 24px; height: 24px; }`}</style>
          </div>
          <div>
            <div className="font-bold text-[18px]">展會營運平台</div>
            <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>密碼重設</div>
          </div>
        </div>

        <div className="p-8 rounded-3xl"
          style={{ background: "white", boxShadow: "0 30px 80px rgba(0,0,0,0.08)" }}>
          {!sent ? (
            <>
              <h1 className="text-2xl font-bold mb-1">忘記密碼？</h1>
              <p className="text-[13px] mb-6" style={{ color: "var(--text-secondary)" }}>
                輸入您註冊的 Email，我們會寄送重設連結（1 小時內有效）
              </p>
              <form onSubmit={submit}>
                <label className="block text-[12px] font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "var(--text-tertiary)" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoFocus
                  className="input mb-4"
                />
                {error && (
                  <div className="p-3 rounded-lg mb-4 text-[13px]"
                    style={{ background: "rgba(255,59,48,0.08)", color: "var(--red)" }}>
                    {error}
                  </div>
                )}
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl text-white font-medium text-[14px]"
                  style={{
                    background: "linear-gradient(135deg, #30d158, #0bb850)",
                    opacity: loading ? 0.6 : 1,
                  }}>
                  {loading ? "處理中…" : "寄出重設連結"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full grid place-items-center mx-auto mb-4"
                style={{ background: "linear-gradient(135deg, #30d158, #0bb850)" }}>
                <Icon name="check" />
                <style>{`.grid .icon { stroke: white; stroke-width: 3; width: 32px; height: 32px; }`}</style>
              </div>
              <h2 className="text-xl font-bold text-center mb-2">重設信已寄出</h2>
              <p className="text-[14px] text-center" style={{ color: "var(--text-secondary)" }}>
                若 <b>{email}</b> 是已註冊的帳號，您將會在 1 分鐘內收到信件，
                請點擊信中連結（1 小時內有效）設定新密碼。
              </p>
              <p className="text-[12px] text-center mt-4" style={{ color: "var(--text-tertiary)" }}>
                沒收到？檢查垃圾信件夾，或聯繫管理員。
              </p>
            </>
          )}
          <div className="text-center mt-6 text-[12px]">
            <Link to="/portal-login" style={{ color: "#0071e3" }}>← 返回登入</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
