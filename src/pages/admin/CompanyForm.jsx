import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../store/data";
import { SceneHead, Panel, Field, Input } from "../../components/Scene";
import { toast } from "../../store/toast";

const PLANS = [
  { id: "Starter",    price: 2980,  label: "Starter",    desc: "適合新創與小型團隊" },
  { id: "Business",   price: 8980,  label: "Business",   desc: "中型公司首選（推薦）" },
  { id: "Enterprise", price: 19800, label: "Enterprise", desc: "大型企業完整功能" },
];

const INDUSTRIES = ["資訊服務業", "電子製造業", "設計服務業", "批發零售業", "金融保險業", "其他"];
const SIZES = ["1–10 人", "10–50 人", "50–100 人", "100–500 人", "500+ 人"];

export default function CompanyForm() {
  const navigate = useNavigate();
  const createCompany = useData((s) => s.createCompany);
  const createMember = useData((s) => s.createMember);

  const [form, setForm] = useState({
    name: "",
    taxId: "",
    industry: INDUSTRIES[0],
    size: SIZES[2],
    address: "",
    phone: "",
    plan: "Business",
    adminName: "",
    adminTitle: "",
    adminEmail: "",
    adminPhone: "",
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.taxId || !form.adminEmail) {
      toast.error("請填寫必要欄位");
      return;
    }
    if (!/^\d{8}$/.test(form.taxId)) {
      toast.error("統一編號需為 8 碼數字");
      return;
    }

    const company = createCompany({
      name: form.name,
      taxId: form.taxId,
      industry: form.industry,
      size: form.size,
      address: form.address,
      phone: form.phone,
      plan: form.plan,
    });

    const admin = createMember({
      name: form.adminName,
      email: form.adminEmail,
      title: form.adminTitle,
      role: "company-admin",
      companyId: company.id,
    });

    useData.setState((s) => {
      const companies = s.companies.map((c) =>
        c.id === company.id ? { ...c, adminUserId: admin.id } : c
      );
      return { companies };
    });

    toast.success(`已建立企業：${company.name}`);
    navigate(`/admin/companies/${company.id}`);
  };

  return (
    <>
      <SceneHead
        tag="NEW COMPANY"
        title="建立新企業"
        desc="輸入企業基本資料並指派最高管理者，完成後可立即啟用帳號。"
      />
      <form onSubmit={submit}>
        <Panel title="公司基本資料">
          <div className="grid grid-cols-2 gap-x-6">
            <Field label="公司名稱 *"><input className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
              style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
              value={form.name} onChange={set("name")} placeholder="例：群揚資通股份有限公司" /></Field>
            <Field label="統一編號 *" hint="8 碼數字"><input className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
              style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
              value={form.taxId} onChange={set("taxId")} placeholder="12345678" /></Field>
            <Field label="產業別">
              <select className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
                value={form.industry} onChange={set("industry")}>
                {INDUSTRIES.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="公司規模">
              <select className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
                value={form.size} onChange={set("size")}>
                {SIZES.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="公司地址"><input className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
              style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
              value={form.address} onChange={set("address")} placeholder="台北市內湖區…" /></Field>
            <Field label="聯絡電話"><input className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
              style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
              value={form.phone} onChange={set("phone")} placeholder="02-xxxx-xxxx" /></Field>
          </div>
        </Panel>

        <Panel title="服務方案">
          <div className="grid grid-cols-3 gap-4">
            {PLANS.map((p) => {
              const sel = form.plan === p.id;
              return (
                <button type="button" key={p.id} onClick={() => setForm({ ...form, plan: p.id })}
                  className="p-5 rounded-xl text-left transition-all"
                  style={{
                    border: sel ? "2px solid var(--role-color)" : "1px solid var(--separator)",
                    background: sel ? "rgba(0,113,227,0.04)" : "var(--bg-tinted)",
                  }}>
                  <div className="text-[13px] font-display font-semibold mb-1">{p.label}</div>
                  <div className="text-2xl font-bold tracking-tight">
                    NT$ {p.price.toLocaleString()}
                    <span className="text-[12px] font-normal" style={{ color: "var(--text-tertiary)" }}>/月</span>
                  </div>
                  <div className="text-[12px] mt-1" style={{ color: "var(--text-tertiary)" }}>{p.desc}</div>
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel title="指派最高管理者">
          <div className="grid grid-cols-2 gap-x-6">
            <Field label="姓名 *"><input className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
              style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
              value={form.adminName} onChange={set("adminName")} placeholder="陳小明" /></Field>
            <Field label="職稱"><input className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
              style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
              value={form.adminTitle} onChange={set("adminTitle")} placeholder="資訊長 CIO" /></Field>
            <Field label="Email *"><input type="email" className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
              style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
              value={form.adminEmail} onChange={set("adminEmail")} placeholder="admin@company.com" /></Field>
            <Field label="行動電話"><input className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
              style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
              value={form.adminPhone} onChange={set("adminPhone")} placeholder="0912-xxx-xxx" /></Field>
          </div>
        </Panel>

        <div className="flex gap-2 justify-end mt-6">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>取消</button>
          <button type="submit" className="btn btn-primary">建立企業</button>
        </div>
      </form>
    </>
  );
}
