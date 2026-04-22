import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../store/data";
import { Icon } from "../../components/Icon";
import { toast } from "../../store/toast";

// PDF p12 條件表單關鍵：廠商註冊完後、進入活動前選擇裝潢方式
// 選完後影響表單頁的條件顯示（自行裝潢才出現 3 張特殊表單）
export default function ChooseMode({ vendor, event }) {
  const { setVendorDecorationMode } = useData();
  const navigate = useNavigate();
  const [hover, setHover] = useState(null);

  const choose = (mode) => {
    setVendorDecorationMode(vendor.id, mode);
    toast.success(mode === "self" ? "已選擇：自行裝潢" : "已選擇：攤位廠商裝潢");
    navigate(`/portal/vendor/${vendor.id}`, { replace: true });
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #fafafa 0%, #faf4ff 100%)" }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-11 h-11 rounded-xl grid place-items-center"
            style={{ background: "linear-gradient(135deg, #bf5af2, #5e5ce6)" }}>
            <Icon name="layers" />
            <style>{`.w-11 .icon { stroke: white; }`}</style>
          </div>
          <div>
            <div className="font-display font-bold text-[16px]">{vendor.company}</div>
            <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>{event?.name}</div>
          </div>
        </div>

        <div className="text-center mb-10">
          <div className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--role-color)" }}>
            SETUP · 參展前設定
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">請選擇您的裝潢方式</h1>
          <p className="text-[15px]" style={{ color: "var(--text-secondary)" }}>
            此選擇會影響您後續需要填寫的表單內容。選擇後仍可與活動管理員聯繫修改。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 卡片 1：攤位廠商裝潢 */}
          <button
            onClick={() => choose("booth-vendor")}
            onMouseEnter={() => setHover("booth-vendor")}
            onMouseLeave={() => setHover(null)}
            className="p-8 rounded-3xl text-left transition-all"
            style={{
              background: "var(--bg-elevated)",
              border: `2px solid ${hover === "booth-vendor" ? "#0071e3" : "var(--separator)"}`,
              boxShadow: hover === "booth-vendor" ? "0 20px 60px rgba(0,113,227,0.2)" : "var(--shadow-sm)",
              transform: hover === "booth-vendor" ? "translateY(-4px)" : "none",
            }}
          >
            <div className="w-14 h-14 rounded-2xl grid place-items-center mb-5"
              style={{ background: "linear-gradient(135deg, #0071e3, #5e5ce6)" }}>
              <Icon name="building" className="icon" />
              <style>{`button .rounded-2xl .icon { stroke: white; width: 28px; height: 28px; }`}</style>
            </div>
            <div className="font-bold text-2xl mb-2">攤位廠商裝潢</div>
            <div className="text-[14px] mb-4" style={{ color: "var(--text-secondary)" }}>
              由主辦方指定的攤位廠商負責設計與施工，包含基本隔間、桌椅、日光燈等標準配備。
            </div>
            <div className="space-y-1.5 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
              <div>✓ 免填施工切結書</div>
              <div>✓ 免填安全衛生承諾書</div>
              <div>✓ 免填電力位置圖</div>
              <div>✓ 省時省事、快速上手</div>
            </div>
            <div className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "#0071e3" }}>
              選擇此方案 →
            </div>
          </button>

          {/* 卡片 2：自行裝潢 */}
          <button
            onClick={() => choose("self")}
            onMouseEnter={() => setHover("self")}
            onMouseLeave={() => setHover(null)}
            className="p-8 rounded-3xl text-left transition-all"
            style={{
              background: "var(--bg-elevated)",
              border: `2px solid ${hover === "self" ? "#bf5af2" : "var(--separator)"}`,
              boxShadow: hover === "self" ? "0 20px 60px rgba(191,90,242,0.2)" : "var(--shadow-sm)",
              transform: hover === "self" ? "translateY(-4px)" : "none",
            }}
          >
            <div className="w-14 h-14 rounded-2xl grid place-items-center mb-5"
              style={{ background: "linear-gradient(135deg, #bf5af2, #5e5ce6)" }}>
              <Icon name="tool" className="icon" />
              <style>{`button .rounded-2xl .icon { stroke: white; width: 28px; height: 28px; }`}</style>
            </div>
            <div className="font-bold text-2xl mb-2">自行裝潢</div>
            <div className="text-[14px] mb-4" style={{ color: "var(--text-secondary)" }}>
              由您指定的裝潢廠商進場施工，可依公司品牌自由設計島型或客製展位。
            </div>
            <div className="space-y-1.5 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
              <div>⚠ 需填施工切結書（必繳）</div>
              <div>⚠ 需填安全衛生承諾書（必繳）</div>
              <div>⚠ 需提供電力位置圖</div>
              <div>✓ 展位設計完全自由客製</div>
            </div>
            <div className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "#bf5af2" }}>
              選擇此方案 →
            </div>
          </button>
        </div>

        <div className="text-center mt-8 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
          選擇後會進入廠商後台，可隨時在「公司檔案」中修改。
        </div>
      </div>
    </div>
  );
}
