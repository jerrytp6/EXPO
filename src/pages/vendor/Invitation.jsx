import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useData } from "../../store/data";
import { Icon } from "../../components/Icon";
import { toast } from "../../store/toast";

// 公開邀請頁面 — 完全不需登入，由 token 驅動
// 流程：open → verify → confirm → done
export default function VendorInvitation() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { invitations, events, vendors, markVendorClicked, registerVendor } = useData();

  const invitation = invitations.find((i) => i.token === token);

  // 步驟：open / verify / confirm / done
  const [step, setStep] = useState("open");
  const [taxIdInput, setTaxIdInput] = useState("");
  const [form, setForm] = useState({ contact: "", title: "", phone: "", email: "" });

  useEffect(() => {
    if (invitation) markVendorClicked(invitation.vendorId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!invitation) {
    return (
      <div className="min-h-screen grid place-items-center p-8">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-5 grid place-items-center bg-red-50">
            <Icon name="shield" className="icon text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">邀請連結無效</h1>
          <p className="text-[14px] mb-6" style={{ color: "var(--text-secondary)" }}>
            此邀請連結不存在或已過期，請聯繫主辦單位。
          </p>
          <Link to="/login" className="btn btn-primary">回到首頁</Link>
        </div>
      </div>
    );
  }

  const event = events.find((e) => e.id === invitation.eventId);
  const vendor = vendors.find((v) => v.id === invitation.vendorId);

  // 若已報名過，直接顯示完成頁
  useEffect(() => {
    if (vendor?.status === "registered") setStep("done");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendor?.status]);

  const verify = () => {
    if (taxIdInput !== vendor.taxId) {
      toast.error("統一編號不正確");
      return;
    }
    toast.success("驗證成功");
    setStep("confirm");
  };

  const submit = () => {
    if (!form.contact || !form.email) {
      toast.error("請填寫聯絡人與 Email");
      return;
    }
    registerVendor(vendor.id, {
      contact: form.contact,
      title: form.title,
      phone: form.phone,
      email: form.email,
    });
    toast.success("報名成功！");
    setStep("done");
  };


  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-[720px] mx-auto p-6 md:p-12">
        {/* Brand header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl grid place-items-center"
            style={{ background: "linear-gradient(135deg, #bf5af2, #5e5ce6)" }}>
            <Icon name="layers" className="icon" />
            <style>{`.flex.items-center > div:first-child .icon { stroke: white; }`}</style>
          </div>
          <div>
            <div className="font-display font-bold text-[15px]">Exhibition OS</div>
            <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>展覽報名專屬頁面</div>
          </div>
        </div>

        {/* Hero card — 展覽邀請 */}
        <div className="rounded-3xl p-8 md:p-10 text-white relative overflow-hidden mb-6 scene-in"
          style={{ background: "linear-gradient(135deg, #bf5af2 0%, #5e5ce6 50%, #0071e3 100%)" }}>
          <div className="text-[11px] font-display uppercase tracking-[0.2em] opacity-80 mb-3">
            Exhibition Invitation
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{event.name}</h1>
          <div className="text-[14px] font-display opacity-90">
            {event.startDate}{event.endDate !== event.startDate ? ` – ${event.endDate}` : ""} · {event.location}
          </div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        </div>

        {/* 致 ...  */}
        <div className="panel mb-6 scene-in">
          <div className="text-[13px] font-display mb-2" style={{ color: "var(--text-tertiary)" }}>
            致 · {vendor.company}
          </div>
          <p className="text-[15px] leading-relaxed mb-5">
            親愛的合作夥伴您好，誠摯邀請貴公司參加 <strong>{event.name}</strong>。
            {event.description || "這將是一次聚集業界領袖與創新者的重要活動。"}
          </p>

          {step === "open" && (
            <button className="btn btn-primary" onClick={() => setStep("verify")}>
              開始報名 →
            </button>
          )}
        </div>

        {/* Step: verify */}
        {step === "verify" && (
          <div className="panel scene-in">
            <h2 className="text-[17px] font-semibold mb-1">身份驗證</h2>
            <p className="text-[13px] mb-5" style={{ color: "var(--text-secondary)" }}>
              請輸入貴公司統一編號以驗證身份。
            </p>
            <input
              type="text"
              value={taxIdInput}
              onChange={(e) => setTaxIdInput(e.target.value)}
              placeholder="8 碼統一編號"
              className="w-full px-4 py-3 rounded-xl text-[14px] outline-none mb-4"
              style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
            />
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={verify}>驗證</button>
              <button className="btn btn-ghost" onClick={() => setStep("open")}>返回</button>
            </div>
            <div className="text-[11px] font-display mt-4 p-3 rounded-lg"
              style={{ background: "var(--bg-tinted)", color: "var(--text-tertiary)" }}>
              💡 提示：示範帳號的統編為 <code>{vendor.taxId}</code>
            </div>
          </div>
        )}

        {/* Step: confirm */}
        {step === "confirm" && (
          <div className="panel scene-in">
            <h2 className="text-[17px] font-semibold mb-1">確認報名資料</h2>
            <p className="text-[13px] mb-5" style={{ color: "var(--text-secondary)" }}>
              請確認公司資料並填寫聯絡人資訊。
            </p>

            <div className="rounded-xl p-4 mb-5"
              style={{ background: "rgba(48,209,88,0.08)", border: "1px solid rgba(48,209,88,0.3)" }}>
              <div className="flex items-center gap-2 text-[13px] font-medium mb-2" style={{ color: "#1f8a3a" }}>
                <Icon name="check" className="icon w-4 h-4" />
                驗證成功
              </div>
              <div className="text-[14px] font-semibold">{vendor.company}</div>
              <div className="text-[12px] font-display" style={{ color: "var(--text-tertiary)" }}>
                統編 {vendor.taxId}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4">
              {[
                ["contact", "聯絡人姓名 *"],
                ["title", "職稱"],
                ["email", "Email *"],
                ["phone", "行動電話"],
              ].map(([k, label]) => (
                <div key={k} className="mb-4">
                  <label className="block text-[12px] font-display font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "var(--text-tertiary)" }}>{label}</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                    style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <button className="btn btn-primary" onClick={submit}>確認報名</button>
              <button className="btn btn-ghost" onClick={() => setStep("verify")}>返回</button>
            </div>
          </div>
        )}

        {/* Step: done */}
        {step === "done" && (
          <div className="panel scene-in">
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full mx-auto mb-5 grid place-items-center"
                style={{ background: "linear-gradient(135deg, #bf5af2, #5e5ce6)" }}>
                <Icon name="sparkles" className="icon" />
                <style>{`.text-center .icon { stroke: white; width: 38px; height: 38px; }`}</style>
              </div>
              <h2 className="text-2xl font-bold mb-2 tracking-tight">報名成功！</h2>
              <p className="text-[14px] mb-2" style={{ color: "var(--text-secondary)" }}>
                感謝 <strong>{vendor.company}</strong> 報名參加 {event.name}
              </p>
            </div>

            {/* 模擬確認信已寄出 */}
            <div className="rounded-xl p-4 mb-4"
              style={{ background: "rgba(48,209,88,0.08)", border: "1px solid rgba(48,209,88,0.3)" }}>
              <div className="flex items-center gap-2 text-[13px] font-semibold mb-2" style={{ color: "#1f8a3a" }}>
                <Icon name="mail" className="icon w-4 h-4" />
                確認信已寄出
              </div>
              <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                系統已將報名確認信寄至 <strong className="font-display">{vendor.email}</strong>，
                信件內含您的活動網站連結與後續操作說明。
              </p>
            </div>

            {/* 活動網站連結 */}
            <div className="rounded-xl p-4 mb-4"
              style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}>
              <div className="text-[11px] font-display uppercase tracking-wider mb-2"
                style={{ color: "var(--text-tertiary)" }}>
                您的活動網站（廠商後台）
              </div>
              <div className="flex items-center gap-3">
                <Icon name="link" className="icon w-5 h-5" />
                <div className="flex-1 font-display text-[13px] truncate">
                  {window.location.origin}/portal/vendor/{vendor.id}
                </div>
                <button className="btn btn-ghost !py-1 !text-xs" onClick={() => {
                  navigator.clipboard?.writeText(`${window.location.origin}/portal/vendor/${vendor.id}`);
                  toast.success("已複製連結");
                }}>複製</button>
              </div>
              <div className="text-[11px] font-display mt-2" style={{ color: "var(--text-tertiary)" }}>
                首次登入需輸入公司統一編號驗證身份
              </div>
            </div>

            <div className="space-y-2 text-[13px] mb-5" style={{ color: "var(--text-secondary)" }}>
              <div className="flex gap-2">
                <Icon name="check" className="icon w-4 h-4 mt-0.5" style={{ stroke: "var(--green)" }} />
                登入後台上傳公司簡介、產品資料
              </div>
              <div className="flex gap-2">
                <Icon name="check" className="icon w-4 h-4 mt-0.5" style={{ stroke: "var(--green)" }} />
                繳交主辦方要求的各項文件
              </div>
              <div className="flex gap-2">
                <Icon name="check" className="icon w-4 h-4 mt-0.5" style={{ stroke: "var(--green)" }} />
                邀請裝潢公司協助展位設計
              </div>
              <div className="flex gap-2">
                <Icon name="check" className="icon w-4 h-4 mt-0.5" style={{ stroke: "var(--green)" }} />
                活動前一週會通知展位編號與布展時間
              </div>
            </div>
            <Link
              to={`/portal/vendor/${vendor.id}`}
              className="btn btn-primary w-full justify-center"
            >
              立即進入廠商後台 →
            </Link>
          </div>
        )}

        <div className="text-center mt-8 text-[11px] font-display" style={{ color: "var(--text-tertiary)" }}>
          Powered by Exhibition OS · 若有問題請聯繫主辦單位
        </div>
      </div>
    </div>
  );
}
