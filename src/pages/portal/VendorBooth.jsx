import { useState } from "react";
import { useData } from "../../store/data";
import { SceneHead, Panel, Field } from "../../components/Scene";
import { toast } from "../../store/toast";

const TYPES = [
  { id: "standard", label: "標準攤位 (3x3m)" },
  { id: "island",   label: "島型攤位 (6x6m)" },
  { id: "premium",  label: "旗艦攤位 (9x6m+)" },
];

export default function VendorBooth({ vendor, event }) {
  const updateVendor = useData((s) => s.updateVendor);
  const [form, setForm] = useState({
    boothNumber: vendor.boothNumber || "",
    boothSize: vendor.boothSize || "",
    boothType: vendor.boothType || "standard",
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    updateVendor(vendor.id, form);
    toast.success("展位資訊已更新");
  };

  return (
    <>
      <SceneHead
        tag="BOOTH"
        title="展位資訊"
        desc={event ? `${event.name} · ${event.location}` : ""}
      />

      <form onSubmit={submit}>
        <Panel title="基本資料">
          <div className="grid grid-cols-2 gap-x-6">
            <Field label="展位編號" hint="若未配置，請聯繫主辦方">
              <input
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
                value={form.boothNumber}
                onChange={set("boothNumber")}
                placeholder="例：A-12"
              />
            </Field>
            <Field label="展位尺寸">
              <input
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
                value={form.boothSize}
                onChange={set("boothSize")}
                placeholder="例：6x6m"
              />
            </Field>
          </div>
          <Field label="展位類型">
            <div className="grid grid-cols-3 gap-3">
              {TYPES.map((t) => {
                const sel = form.boothType === t.id;
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setForm({ ...form, boothType: t.id })}
                    className="px-4 py-3 rounded-xl text-left text-[13px] transition-all"
                    style={{
                      border: sel ? "2px solid var(--role-color)" : "1px solid var(--separator)",
                      background: sel ? "rgba(191,90,242,0.06)" : "var(--bg-tinted)",
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </Field>
        </Panel>

        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary">儲存變更</button>
        </div>
      </form>
    </>
  );
}
