import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useData } from "../../store/data";
import { Icon } from "../../components/Icon";
import { toast } from "../../store/toast";

// 裝潢公司接受廠商邀請 — 公開頁，無需登入
export default function DecoratorInvitation() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { decoratorInvitations, vendors, events, acceptDecoratorInvitation } = useData();

  const invitation = decoratorInvitations.find((i) => i.token === token);

  const [step, setStep] = useState("open"); // open / form / done
  const [form, setForm] = useState({
    name: invitation?.decoratorCompany || "",
    taxId: "",
    contact: "",
    title: "",
    email: invitation?.decoratorEmail || "",
    phone: "",
    address: "",
  });

  if (!invitation) {
    return (
      <div className="min-h-screen grid place-items-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-2">邀請連結無效</h1>
          <p className="text-[14px] mb-6" style={{ color: "var(--text-secondary)" }}>
            此連結不存在或已過期。
          </p>
          <Link to="/login" className="btn btn-primary">
            回到首頁
          </Link>
        </div>
      </div>
    );
  }

  const vendor = vendors.find((v) => v.id === invitation.fromVendorId);
  const event = events.find((e) => e.id === invitation.eventId);
  const alreadyAccepted = invitation.status === "accepted";

  const submit = () => {
    if (!form.name || !form.contact || !form.email) {
      toast.error("請填寫公司名稱、聯絡人與 Email");
      return;
    }
    const result = acceptDecoratorInvitation(token, form);
    if (!result) {
      toast.error("接受邀請失敗");
      return;
    }
    toast.success("已成功接受邀請");
    setStep("done");
    setTimeout(() => {
      navigate(`/portal/decorator/${result.decorator.id}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }} data-role="decorator">
      <div className="max-w-[720px] mx-auto p-6 md:p-12">
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-11 h-11 rounded-xl grid place-items-center"
            style={{ background: "linear-gradient(135deg, #ff6a00, #ff2d92)" }}
          >
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

        {/* Hero */}
        <div
          className="rounded-3xl p-8 md:p-10 text-white relative overflow-hidden mb-6 scene-in"
          style={{ background: "linear-gradient(135deg, #ff6a00 0%, #ff2d92 50%, #bf5af2 100%)" }}
        >
          <div className="text-[11px] font-display uppercase tracking-[0.2em] opacity-80 mb-3">
            Decoration Partnership Invitation
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {vendor?.company} 邀請您合作
          </h1>
          <div className="text-[14px] font-display opacity-90">
            {event?.name} · {event?.startDate} · {event?.location}
          </div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        </div>

        {/* 邀請訊息 */}
        <div className="panel mb-6 scene-in">
          <div className="text-[13px] font-display mb-2" style={{ color: "var(--text-tertiary)" }}>
            來自 · {vendor?.company}（{vendor?.contact}）
          </div>
          <p className="text-[15px] leading-relaxed mb-4">
            {invitation.message ||
              `您好，我們是 ${vendor?.company}，將參加 ${event?.name}，誠摯邀請貴公司協助本次展位設計與裝潢。`}
          </p>

          {vendor && (
            <div
              className="grid grid-cols-3 gap-3 p-4 rounded-xl mb-5"
              style={{ background: "var(--bg-tinted)" }}
            >
              <div>
                <div
                  className="text-[10px] font-display uppercase tracking-wider"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  展位編號
                </div>
                <div className="text-[15px] font-bold mt-1">{vendor.boothNumber || "待配置"}</div>
              </div>
              <div>
                <div
                  className="text-[10px] font-display uppercase tracking-wider"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  尺寸
                </div>
                <div className="text-[15px] font-bold mt-1">{vendor.boothSize || "—"}</div>
              </div>
              <div>
                <div
                  className="text-[10px] font-display uppercase tracking-wider"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  類型
                </div>
                <div className="text-[15px] font-bold mt-1">
                  {{ standard: "標準", island: "島型", premium: "旗艦" }[vendor.boothType] || "—"}
                </div>
              </div>
            </div>
          )}

          {alreadyAccepted && (
            <div
              className="p-3 rounded-lg text-[13px] mb-4"
              style={{ background: "rgba(48,209,88,0.08)", color: "#1f8a3a" }}
            >
              此邀請已被接受。
            </div>
          )}

          {step === "open" && !alreadyAccepted && (
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={() => setStep("form")}>
                接受邀請 →
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => toast.info("已記錄您的回覆")}
              >
                婉拒
              </button>
            </div>
          )}
        </div>

        {/* 表單 */}
        {step === "form" && !alreadyAccepted && (
          <div className="panel scene-in">
            <h2 className="text-[17px] font-semibold mb-1">填寫公司資料</h2>
            <p className="text-[13px] mb-5" style={{ color: "var(--text-secondary)" }}>
              請提供貴公司資料，完成後即可進入專案後台。
            </p>

            <div className="grid grid-cols-2 gap-x-4">
              {[
                ["name", "公司名稱 *"],
                ["taxId", "統一編號"],
                ["contact", "聯絡人 *"],
                ["title", "職稱"],
                ["email", "Email *"],
                ["phone", "電話"],
              ].map(([k, label]) => (
                <div key={k} className="mb-4">
                  <label
                    className="block text-[12px] font-display font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {label}
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                    style={{
                      background: "var(--bg-tinted)",
                      border: "1px solid var(--separator)",
                    }}
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  />
                </div>
              ))}
              <div className="mb-4 col-span-2">
                <label
                  className="block text-[12px] font-display font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  公司地址
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                  style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <button className="btn btn-primary" onClick={submit}>
                確認接受並進入後台
              </button>
              <button className="btn btn-ghost" onClick={() => setStep("open")}>
                返回
              </button>
            </div>
          </div>
        )}

        {(step === "done" || alreadyAccepted) && (
          <div className="panel scene-in text-center py-8">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-5 grid place-items-center"
              style={{ background: "linear-gradient(135deg, #ff6a00, #ff2d92)" }}
            >
              <Icon name="check" className="icon" />
              <style>{`.text-center .icon { stroke: white; width: 38px; height: 38px; }`}</style>
            </div>
            <h2 className="text-2xl font-bold mb-2 tracking-tight">合作建立完成！</h2>
            <p className="text-[14px] mb-4" style={{ color: "var(--text-secondary)" }}>
              {step === "done" ? "正在前往專案後台…" : "您已接受此邀請"}
            </p>
          </div>
        )}

        <div
          className="text-center mt-8 text-[11px] font-display"
          style={{ color: "var(--text-tertiary)" }}
        >
          Powered by Exhibition OS · 連結登入專屬頁面
        </div>
      </div>
    </div>
  );
}
