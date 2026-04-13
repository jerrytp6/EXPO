import { useState } from "react";
import { useData } from "../../store/data";
import { SceneHead, Panel, Field } from "../../components/Scene";
import { toast } from "../../store/toast";

export default function VendorProfile({ vendor }) {
  const updateVendor = useData((s) => s.updateVendor);
  const [form, setForm] = useState({
    company: vendor.company,
    contact: vendor.contact || "",
    email: vendor.email || "",
    phone: vendor.phone || "",
    profile: vendor.profile || "",
    products: (vendor.products || []).join("\n"),
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    updateVendor(vendor.id, {
      ...form,
      products: form.products
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean),
    });
    toast.success("公司檔案已更新");
  };

  return (
    <>
      <SceneHead
        tag="COMPANY PROFILE"
        title="公司檔案"
        desc="維護您在展覽中對外展示的公司介紹與產品。"
      />
      <form onSubmit={submit}>
        <Panel title="聯絡資訊">
          <div className="grid grid-cols-2 gap-x-6">
            <Field label="公司名稱">
              <input
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
                value={form.company}
                onChange={set("company")}
              />
            </Field>
            <Field label="聯絡人">
              <input
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
                value={form.contact}
                onChange={set("contact")}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
                value={form.email}
                onChange={set("email")}
              />
            </Field>
            <Field label="電話">
              <input
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
                value={form.phone}
                onChange={set("phone")}
              />
            </Field>
          </div>
        </Panel>

        <Panel title="公司介紹">
          <Field label="簡介" hint="將顯示於您的展位頁面與展覽手冊">
            <textarea
              className="w-full px-4 py-3 rounded-xl text-[14px] outline-none min-h-[120px]"
              style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
              value={form.profile}
              onChange={set("profile")}
              placeholder="簡述貴公司的業務、特色、優勢…"
            />
          </Field>
          <Field label="主推產品" hint="每行一項">
            <textarea
              className="w-full px-4 py-3 rounded-xl text-[14px] outline-none min-h-[100px] font-mono"
              style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
              value={form.products}
              onChange={set("products")}
              placeholder={"產品 A\n產品 B"}
            />
          </Field>
        </Panel>

        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary">儲存變更</button>
        </div>
      </form>
    </>
  );
}
