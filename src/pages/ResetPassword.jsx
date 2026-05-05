import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { Icon } from "../components/Icon";

const ERR_LABEL = {
  invalid_or_expired_token: "重設連結已過期或無效，請重新申請",
  wrong_token_purpose: "Token 用途不符",
  user_not_found: "找不到對應帳號",
  token_already_used: "此重設連結已使用過，請重新申請",
};

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (pw1.length < 6) { setError("密碼至少需要 6 個字元"); return; }
    if (pw1 !== pw2) { setError("兩次輸入的密碼不一致"); return; }
    setLoading(true);
    try {
      const r = await api.post("/auth/reset-password", { token, newPassword: pw1 });
      setDone(r.email);
    } catch (err) {
      setError(ERR_LABEL[err.body?.error] || err.body?.error || err.message);
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
            <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>設定新密碼</div>
          </div>
        </div>

        <div className="p-8 rounded-3xl"
          style={{ background: "white", boxShadow: "0 30px 80px rgba(0,0,0,0.08)" }}>
          {!token ? (
            <div className="text-center">
              <div className="text-3xl mb-2">⚠️</div>
              <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>缺少 token</p>
              <Link to="/forgot-password" className="text-[13px]" style={{ color: "#0071e3" }}>重新申請重設</Link>
            </div>
          ) : done ? (
            <>
              <div className="w-16 h-16 rounded-full grid place-items-center mx-auto mb-4"
                style={{ background: "linear-gradient(135deg, #30d158, #0bb850)" }}>
                <Icon name="check" />
                <style>{`.grid .icon { stroke: white; stroke-width: 3; width: 32px; height: 32px; }`}</style>
              </div>
              <h2 className="text-xl font-bold text-center mb-2">密碼已更新</h2>
              <p className="text-[14px] text-center" style={{ color: "var(--text-secondary)" }}>
                帳號 <b>{done}</b> 的密碼已重設成功，請使用新密碼登入。
              </p>
              <button onClick={() => navigate("/portal-login", { replace: true })}
                className="w-full mt-6 py-3 rounded-xl text-white font-medium text-[14px]"
                style={{ background: "linear-gradient(135deg, #30d158, #0bb850)" }}>
                返回登入
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1">設定新密碼</h1>
              <p className="text-[13px] mb-6" style={{ color: "var(--text-secondary)" }}>
                請輸入新密碼（至少 6 個字元）
              </p>
              <form onSubmit={submit}>
                <label className="block text-[12px] font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "var(--text-tertiary)" }}>新密碼</label>
                <input type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} className="input mb-3" autoFocus />
                <label className="block text-[12px] font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "var(--text-tertiary)" }}>再次輸入</label>
                <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} className="input mb-4" />
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
                  {loading ? "處理中…" : "確認重設"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
