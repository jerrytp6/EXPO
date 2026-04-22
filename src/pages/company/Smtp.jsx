import { useState, useEffect } from "react";
import { useAuth } from "../../store/auth";
import { useData } from "../../store/data";
import { SceneHead, Panel, Field } from "../../components/Scene";
import { toast } from "../../store/toast";

export default function Smtp() {
  const user = useAuth((s) => s.user);
  const { smtpSettings, updateSmtpSettings, testSmtpConnection, byId } = useData();
  const cfg = smtpSettings?.find((s) => s.companyId === user.companyId) || null;

  const [form, setForm] = useState({
    host: "",
    port: 587,
    secure: "tls",
    username: "",
    passwordMasked: "",
    fromName: "",
    fromEmail: "",
    replyTo: "",
  });
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (cfg) setForm({
      host: cfg.host || "",
      port: cfg.port || 587,
      secure: cfg.secure || "tls",
      username: cfg.username || "",
      passwordMasked: cfg.passwordMasked || "",
      fromName: cfg.fromName || "",
      fromEmail: cfg.fromEmail || "",
      replyTo: cfg.replyTo || "",
    });
  }, [cfg?.companyId]);

  const save = () => {
    if (!form.host || !form.username) {
      toast.error("請至少填寫主機與帳號");
      return;
    }
    updateSmtpSettings(user.companyId, form);
    toast.success("SMTP 設定已儲存");
  };

  const doTest = async () => {
    setTesting(true);
    // 模擬延遲
    await new Promise((r) => setTimeout(r, 800));
    const ok = testSmtpConnection(user.companyId);
    setTesting(false);
    if (ok) toast.success("連線測試成功 ✅");
    else toast.error("連線測試失敗");
  };

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <SceneHead
        tag="SMTP"
        title="郵件系統設定"
        desc="設定租戶級的 SMTP Server，所有活動郵件皆由此寄出。"
      />

      <Panel title="SMTP 連線參數">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="SMTP 主機">
            <input className="input" value={form.host} onChange={(e) => update("host", e.target.value)} placeholder="smtp.gmail.com" />
          </Field>
          <Field label="埠號">
            <input className="input" type="number" value={form.port} onChange={(e) => update("port", parseInt(e.target.value || "0"))} />
          </Field>
          <Field label="加密方式">
            <select className="input" value={form.secure} onChange={(e) => update("secure", e.target.value)}>
              <option value="tls">TLS (STARTTLS)</option>
              <option value="ssl">SSL</option>
              <option value="none">無加密</option>
            </select>
          </Field>
          <Field label="帳號（Username）">
            <input className="input" value={form.username} onChange={(e) => update("username", e.target.value)} placeholder="noreply@company.com" />
          </Field>
          <Field label="密碼 / API Key" hint="Demo 模式：不會儲存真實密碼">
            <input className="input" type="password" value={form.passwordMasked} onChange={(e) => update("passwordMasked", e.target.value)} placeholder="●●●●●●●●" />
          </Field>
        </div>
      </Panel>

      <Panel title="寄件人資訊">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="寄件人名稱">
            <input className="input" value={form.fromName} onChange={(e) => update("fromName", e.target.value)} placeholder="群揚資通展覽服務" />
          </Field>
          <Field label="寄件人 Email">
            <input className="input" value={form.fromEmail} onChange={(e) => update("fromEmail", e.target.value)} placeholder="noreply@company.com" />
          </Field>
          <Field label="回覆地址 (Reply-To)">
            <input className="input" value={form.replyTo} onChange={(e) => update("replyTo", e.target.value)} placeholder="support@company.com" />
          </Field>
        </div>
      </Panel>

      <Panel title="測試與儲存">
        <div className="flex items-center gap-3 flex-wrap">
          <button className="btn btn-primary" onClick={save}>儲存設定</button>
          <button className="btn" onClick={doTest} disabled={testing}>
            {testing ? "測試中…" : "測試連線"}
          </button>
          {cfg?.testedAt && (
            <span className="text-[13px]" style={{ color: cfg.testStatus === "success" ? "var(--green)" : "var(--red)" }}>
              {cfg.testStatus === "success" ? "✅ 上次測試成功" : `❌ ${cfg.testError || "失敗"}`}
              <span style={{ color: "var(--text-tertiary)" }}> · {cfg.testedAt.slice(0, 16).replace("T", " ")}</span>
            </span>
          )}
        </div>
      </Panel>
    </>
  );
}
