import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useData } from "../store/data";
import { ROLE_NAMES } from "../store/auth";
import { Icon } from "../components/Icon";

// Mock Portal SSO 統一認證平台首頁（對應客戶架構圖）
// SSO 登入後進到這頁 → 依租戶訂閱顯示 active 卡片 → 點擊進入對應子系統
// 目前僅「廠商管理系統」有實作（EX），其他卡片僅 placeholder
const SUBSYSTEMS = [
  { key: "csm",         name: "會議秘書系統",     icon: "calendar", color: "#ff9f0a" },
  { key: "ex",          name: "廠商管理系統",     icon: "package",  color: "#5e5ce6", linkable: true },
  { key: "punch",       name: "工讀生打卡系統",   icon: "package",  color: "#8e8e93" },
  { key: "opportunity", name: "商機管理系統",     icon: "package",  color: "#30d158" },
];

export default function PortalHome() {
  const navigate = useNavigate();
  const { users, companies, tenantSubsystems } = useData();
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

  // 當前租戶已訂閱的子系統 keys
  const subscribedKeys = (tenantSubsystems || [])
    .filter((x) => x.companyId === currentUser.companyId)
    .map((x) => x.subsystemKey);
  // portal-admin 或 super-admin 可看所有子系統（預覽用途）
  const seesAll = currentUser.role === "portal-admin" || currentUser.role === "super-admin";

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
    const subscribed = subscribedKeys.includes(sub.key) || seesAll;
    if (!subscribed) {
      alert(`您的租戶尚未訂閱「${sub.name}」，請聯繫 Portal 管理員開通`);
      return;
    }
    if (!sub.linkable) {
      alert(`${sub.name} 為子系統示範版，未實作完整登入流程（此 Demo 僅 EX 可用）`);
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

        {/* portal-admin 專屬：Portal 管理入口 */}
        {currentUser.role === "portal-admin" && (
          <div className="max-w-[1080px] mx-auto mb-8">
            <button
              onClick={() => navigate("/portal/admin")}
              className="w-full p-6 rounded-3xl text-left transition-all flex items-center gap-5 hover:shadow-lg"
              style={{
                background: "linear-gradient(135deg, #1d1d1f 0%, #48484a 100%)",
                color: "white",
              }}
            >
              <div className="w-14 h-14 rounded-2xl grid place-items-center"
                style={{ background: "rgba(255,255,255,0.15)" }}>
                <Icon name="shield" className="icon" />
                <style>{`button .w-14 .icon { stroke: white; width: 28px; height: 28px; }`}</style>
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-widest opacity-70 mb-1">
                  PORTAL ADMIN · 僅平台管理員可見
                </div>
                <div className="text-[20px] font-bold">進入 Portal 管理後台</div>
                <div className="text-[13px] opacity-80 mt-1">租戶管理 · 帳號管理 · 子系統訂閱管理</div>
              </div>
              <Icon name="arrow_right" className="icon w-6 h-6" />
            </button>
          </div>
        )}

        {/* 子系統卡片網格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-[1080px] mx-auto">
          {SUBSYSTEMS.map((sub) => {
            const subscribed = subscribedKeys.includes(sub.key) || seesAll;
            const isLinkable = sub.linkable && subscribed;
            return (
              <button
                key={sub.key}
                onClick={() => clickSubsystem(sub)}
                className="p-8 rounded-3xl transition-all"
                style={{
                  background: "white",
                  border: isLinkable ? "2px solid #5e5ce6" : "1px solid var(--separator)",
                  boxShadow: isLinkable ? "0 20px 60px rgba(94,92,230,0.15)" : "var(--shadow-sm)",
                  cursor: subscribed ? "pointer" : "not-allowed",
                  opacity: subscribed ? 1 : 0.55,
                }}
                onMouseEnter={(e) => {
                  if (isLinkable) e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                }}
              >
                <div
                  className="w-20 h-20 rounded-2xl grid place-items-center mx-auto mb-4"
                  style={{
                    background: subscribed
                      ? `linear-gradient(135deg, ${sub.color}, #bf5af2)`
                      : "rgba(0,0,0,0.04)",
                  }}
                >
                  <Icon name={sub.icon} className="icon" />
                  <style>{`button .w-20 .icon { stroke: ${subscribed ? "white" : sub.color}; width: 36px; height: 36px; stroke-width: 1.5; }`}</style>
                </div>
                <div className="text-center">
                  <div className="font-bold text-[16px]">{sub.name}</div>
                  {isLinkable && (
                    <div className="text-[11px] mt-1.5" style={{ color: "#5e5ce6" }}>
                      ● 進入系統
                    </div>
                  )}
                  {subscribed && !sub.linkable && (
                    <div className="text-[11px] mt-1.5" style={{ color: "var(--text-tertiary)" }}>
                      Demo 未實作
                    </div>
                  )}
                  {!subscribed && (
                    <div className="text-[11px] mt-1.5" style={{ color: "var(--text-tertiary)" }}>
                      未訂閱
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* 底部提示 */}
        <div className="text-center mt-12 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
          <div>以「{currentUser.name}」身份登入中 · 訂閱狀態依租戶「{currentCompany?.name || "無"}」而定</div>
          {seesAll && (
            <div className="mt-1">（{ROLE_NAMES[currentUser.role]} 身份可預覽全部子系統）</div>
          )}
        </div>
      </div>
    </div>
  );
}
