import { useEffect, useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { useAuth, ROLE_HOME } from "../store/auth";
import { Icon } from "../components/Icon";

// SSO 接收點：/sso?token=xxx
// Portal 產生 token 後跳轉進來，本頁解析 token 自動登入並導向角色 home
export default function SsoReceiver() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const loginBySsoToken = useAuth((s) => s.loginBySsoToken);
  const [result, setResult] = useState(null);
  const [targetPath, setTargetPath] = useState(null);

  useEffect(() => {
    if (!token) {
      setResult({ ok: false, error: "缺少 token" });
      return;
    }
    const r = loginBySsoToken(token);
    setResult(r);
    if (r.ok) {
      const target = ROLE_HOME[r.user.role] || "/";
      setTimeout(() => setTargetPath(target), 600);
    }
  }, [token, loginBySsoToken]);

  if (targetPath) return <Navigate to={targetPath} replace />;

  return (
    <div className="min-h-screen grid place-items-center p-6" style={{ background: "var(--bg)" }}>
      <div className="text-center max-w-md">
        {result?.ok === true && (
          <>
            <div className="w-16 h-16 rounded-full grid place-items-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #30d158, #0bb850)" }}>
              <Icon name="check" className="icon" />
              <style>{`.grid .icon { stroke: white; stroke-width: 3; width: 32px; height: 32px; }`}</style>
            </div>
            <h1 className="text-2xl font-bold mb-2">SSO 驗證成功</h1>
            <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
              歡迎 <b>{result.user.name}</b>，正在進入 EX 參展廠商管理系統…
            </p>
          </>
        )}
        {result?.ok === false && (
          <>
            <div className="w-16 h-16 rounded-full grid place-items-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #ff3b30, #d70015)" }}>
              <span className="text-white text-3xl">✕</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">SSO 驗證失敗</h1>
            <p className="text-[14px] mb-6" style={{ color: "var(--text-secondary)" }}>
              {result.error}
            </p>
            <a href="#/portal" className="btn btn-primary">返回 Portal</a>
          </>
        )}
        {!result && (
          <div className="text-[14px]" style={{ color: "var(--text-tertiary)" }}>
            正在驗證 SSO token…
          </div>
        )}
      </div>
    </div>
  );
}
