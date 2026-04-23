import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useData } from "../store/data";
import { ROLE_NAMES } from "../store/auth";
import { Icon } from "../components/Icon";

// Mock Portal SSO 統一認證平台首頁（對應客戶架構圖）
// SSO 登入後進到這頁 → 點「廠商管理系統」卡片 → 帶 token 跳進 EX
// 其他子系統（CSM / 打卡 / 商機）為 placeholder
const SUBSYSTEMS = [
  { key: "csm",        name: "會議秘書系統",     status: "disabled", icon: "calendar", color: "#ff9f0a" },
  { key: "ex",         name: "廠商管理系統",     status: "active",   icon: "package",  color: "#5e5ce6" },
  { key: "punch",      name: "工讀生打卡系統",    status: "disabled", icon: "package",  color: "#8e8e93" },
  { key: "opportunity",name: "商機管理系統",     status: "disabled", icon: "package",  color: "#30d158" },
  { key: "settings",   name: "系統設定",          status: "disabled", icon: "settings", color: "#6e6e73" },
];

export default function PortalHome() {
  const navigate = useNavigate();
  const { users, companies } = useData();
  const [now, setNow] = useState(new Date());

  // 每分鐘更新時鐘
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(t);
  }, []);

  // 從 Portal 認證 state 讀取當前使用者
  const currentUserId = localStorage.getItem("portal-mock-user");
  const currentUser = users.find((u) => u.id === currentUserId);
  const currentCompany = companies.find((c) => c.id === currentUser?.companyId);

  // 未通過 Portal 認證 → 轉跳 SSO 登入畫面
  if (!currentUser) return <Navigate to="/portal-login" replace />;

  const logout = () => {
    localStorage.removeItem("portal-mock-user");
    navigate("/portal-login", { replace: true });
  };

  // 產生 mock SSO token（base64 encoded JSON payload）
  const generateToken = (user) => {
    const payload = {
      portalUserId: `portal-${user.id}`,
      username: user.email,
      role: user.role,
      companyId: user.companyId,
      tenantId: user.companyId, // 在此 mock 模型中 tenantId = companyId
      subsystemUserId: user.id,
      iat: Date.now(),
    };
    return btoa(JSON.stringify(payload));
  };

  const enterEx = () => {
    if (!currentUser) return;
    const token = generateToken(currentUser);
    navigate(`/sso?token=${token}`);
  };

  const clickSubsystem = (sub) => {
    if (sub.status === "disabled") {
      alert(`${sub.name} 尚未上線（此為 EX 展覽系統 Demo）`);
      return;
    }
    if (sub.key === "ex") enterEx();
  };

  // 日期時間格式
  const dateStr = `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, "0")}月${String(now.getDate()).padStart(2, "0")}日`;
  const weekDays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <div className="min-h-screen" style={{ background: "#f5f5f7" }}>
      <div className="max-w-[1280px] mx-auto px-8 py-10">
        {/* 標題 */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold tracking-tight mb-3" style={{ letterSpacing: "-0.03em" }}>
            系統架構總覽
          </h1>
          <p className="text-[16px]" style={{ color: "var(--text-tertiary)" }}>
            展會營運平台提供子系統廠商管理系統多租戶認證登入
          </p>
        </div>

        {/* Portal 頂部條 */}
        <div
          className="rounded-2xl mb-8 px-6 py-4 flex items-center justify-between flex-wrap gap-3"
          style={{ background: "rgba(255,255,255,0.7)", border: "1px solid var(--separator)", backdropFilter: "blur(10px)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg grid place-items-center"
              style={{ background: "linear-gradient(135deg, #30d158, #0bb850)" }}>
              <Icon name="layers" />
              <style>{`.w-9 .icon { stroke: white; width: 18px; height: 18px; }`}</style>
            </div>
            <span className="font-bold text-[16px]">展會營運平台</span>
          </div>

          <div className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
            {dateStr} {weekDays[now.getDay()]} {timeStr}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-[13px]">
              <div className="font-semibold">{currentCompany?.name || "EX 維運"}</div>
              <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                {currentUser.name} · {ROLE_NAMES[currentUser.role]}
              </div>
            </div>

            <div
              className="w-10 h-10 rounded-full grid place-items-center text-white font-bold"
              style={{ background: "linear-gradient(135deg, #5e5ce6, #bf5af2)" }}
            >
              {currentUser.name[0]}
            </div>

            <button
              onClick={logout}
              className="text-[12px] px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(0,0,0,0.05)", color: "var(--text-secondary)" }}
              title="登出 Portal"
            >
              登出
            </button>
          </div>
        </div>

        {/* 子系統卡片網格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-[1080px] mx-auto">
          {SUBSYSTEMS.map((sub) => (
            <button
              key={sub.key}
              onClick={() => clickSubsystem(sub)}
              className="p-8 rounded-3xl transition-all"
              style={{
                background: "white",
                border: sub.status === "active" ? "2px solid #5e5ce6" : "1px solid var(--separator)",
                boxShadow: sub.status === "active" ? "0 20px 60px rgba(94,92,230,0.15)" : "var(--shadow-sm)",
                cursor: sub.status === "disabled" ? "not-allowed" : "pointer",
                opacity: sub.status === "disabled" ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (sub.status === "active") e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
              }}
            >
              <div
                className="w-20 h-20 rounded-2xl grid place-items-center mx-auto mb-4"
                style={{
                  background: sub.status === "active"
                    ? `linear-gradient(135deg, ${sub.color}, #bf5af2)`
                    : "rgba(0,0,0,0.04)",
                }}
              >
                <Icon name={sub.icon} className="icon" />
                <style>{`button .w-20 .icon { stroke: ${sub.status === "active" ? "white" : sub.color}; width: 36px; height: 36px; stroke-width: 1.5; }`}</style>
              </div>
              <div className="text-center">
                <div className="font-bold text-[16px]">{sub.name}</div>
                {sub.status === "active" && (
                  <div className="text-[11px] mt-1.5" style={{ color: "#5e5ce6" }}>
                    ● 進入系統
                  </div>
                )}
                {sub.status === "disabled" && (
                  <div className="text-[11px] mt-1.5" style={{ color: "var(--text-tertiary)" }}>
                    尚未上線
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* 底部提示 */}
        <div className="text-center mt-12 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
          <div>以「{currentUser.name}」身份登入中 · 點擊「廠商管理系統」卡片進入 EX</div>
        </div>
      </div>
    </div>
  );
}
