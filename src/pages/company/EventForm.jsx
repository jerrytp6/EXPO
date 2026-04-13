import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { useData } from "../../store/data";
import { SceneHead, Panel, Field } from "../../components/Scene";
import { toast } from "../../store/toast";

const TYPES = ["實體展覽", "論壇", "線上展覽", "混合型"];

export default function EventForm() {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const { users, createEvent } = useData();

  const managers = users.filter((u) => u.companyId === user.companyId && (u.role === "event-manager" || u.role === "company-admin"));

  const [form, setForm] = useState({
    name: "",
    type: "實體展覽",
    startDate: "",
    endDate: "",
    location: "",
    description: "",
    managerId: "",
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.startDate || !form.location) {
      toast.error("請填寫必要欄位");
      return;
    }
    const event = createEvent({
      ...form,
      endDate: form.endDate || form.startDate,
      companyId: user.companyId,
      managerId: form.managerId || null,
    });
    toast.success(`已建立活動：${event.name}`);
    navigate("/company/events");
  };

  return (
    <>
      <SceneHead
        tag="NEW EVENT"
        title="建立展覽活動"
        desc="設定展覽基本資訊、時程與管理者。"
      />
      <form onSubmit={submit}>
        <Panel title="活動基本資料">
          <div className="grid grid-cols-2 gap-x-6">
            <Field label="活動名稱 *"><input className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
              style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
              value={form.name} onChange={set("name")} placeholder="2026 台北國際電腦展" /></Field>
            <Field label="活動類型">
              <select className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
                value={form.type} onChange={set("type")}>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="開始日期 *"><input type="date" className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
              style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
              value={form.startDate} onChange={set("startDate")} /></Field>
            <Field label="結束日期"><input type="date" className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
              style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
              value={form.endDate} onChange={set("endDate")} /></Field>
            <Field label="活動地點 *"><input className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
              style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
              value={form.location} onChange={set("location")} placeholder="TWTC 南港展覽館" /></Field>
            <Field label="活動管理者">
              <select className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
                value={form.managerId} onChange={set("managerId")}>
                <option value="">稍後指派</option>
                {managers.map((m) => <option key={m.id} value={m.id}>{m.name} · {m.title}</option>)}
              </select>
            </Field>
          </div>
          <Field label="活動描述">
            <textarea className="w-full px-4 py-3 rounded-xl text-[14px] outline-none min-h-[100px]"
              style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
              value={form.description} onChange={set("description")}
              placeholder="簡述活動目的與特色…" />
          </Field>
        </Panel>
        <div className="flex gap-2 justify-end">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>取消</button>
          <button type="submit" className="btn btn-primary">建立活動</button>
        </div>
      </form>
    </>
  );
}
