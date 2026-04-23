import { useMemo, useState } from "react";
import { useData } from "../../store/data";
import { ROLE_NAMES } from "../../store/auth";
import { SceneHead, Panel, DataRow, Field } from "../../components/Scene";
import { Modal } from "../../components/Modal";
import { toast } from "../../store/toast";

// Portal 跨租戶帳號管理：建立新帳號、指派租戶與角色
// 只限 EX 內部身份（portal-admin / super-admin / company-admin / event-manager / member）
const PORTAL_ROLES = ["portal-admin", "super-admin", "company-admin", "event-manager", "member"];

export default function PortalAccounts() {
  const { users, companies, createMember, updateMember, deleteMember } = useData();
  const [filterCompany, setFilterCompany] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", title: "", role: "member", companyId: "c-1" });

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (filterCompany !== "all" && u.companyId !== filterCompany) return false;
      if (filterRole !== "all" && u.role !== filterRole) return false;
      return true;
    });
  }, [users, filterCompany, filterRole]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", email: "", title: "", role: "member", companyId: companies[0]?.id || "" });
    setOpen(true);
  };
  const openEdit = (u) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, title: u.title || "", role: u.role, companyId: u.companyId || "" });
    setOpen(true);
  };
  const submit = () => {
    if (!form.name || !form.email) { toast.error("請填寫姓名與 Email"); return; }
    const payload = {
      ...form,
      companyId: (form.role === "portal-admin" || form.role === "super-admin") ? null : form.companyId,
    };
    if (editing) {
      updateMember(editing.id, payload);
      toast.success("已更新");
    } else {
      createMember(payload);
      toast.success(`已建立：${form.name}`);
    }
    setOpen(false);
  };
  const remove = (u) => {
    if (!confirm(`確定刪除「${u.name}」？`)) return;
    deleteMember(u.id);
    toast.info("已刪除");
  };

  return (
    <>
      <SceneHead
        tag="ACCOUNTS · 帳號管理"
        title="跨租戶帳號管理"
        desc="建立租戶管理員、活動管理員、一般成員；指派所屬租戶與角色。"
      />

      <Panel>
        <div className="flex gap-3 mb-4 flex-wrap">
          <select className="input max-w-xs" value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)}>
            <option value="all">所有租戶</option>
            <option value="">（平台 / 無租戶）</option>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="input max-w-xs" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">所有角色</option>
            {PORTAL_ROLES.map((r) => <option key={r} value={r}>{ROLE_NAMES[r]}</option>)}
          </select>
          <button className="btn btn-primary ml-auto" onClick={openNew}>+ 新增帳號</button>
        </div>

        <DataRow
          header
          cols={[
            { content: "姓名 / Email",   w: "2fr" },
            { content: "所屬租戶",       w: "1.4fr" },
            { content: "角色",           w: "1fr" },
            { content: "職稱",           w: "1.2fr" },
            { content: "動作",           w: "1fr" },
          ]}
        />
        {filtered.map((u) => {
          const co = companies.find((c) => c.id === u.companyId);
          return (
            <DataRow
              key={u.id}
              cols={[
                {
                  content: (
                    <div>
                      <div className="font-semibold">{u.name}</div>
                      <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>{u.email}</div>
                    </div>
                  ),
                  w: "2fr",
                },
                {
                  content: <span className="text-[13px]">{co ? co.name : (u.companyId ? u.companyId : "— 平台層")}</span>,
                  w: "1.4fr",
                },
                {
                  content: (
                    <span className={`chip ${
                      u.role === "portal-admin"  ? "chip-green" :
                      u.role === "super-admin"   ? "chip-blue" :
                      u.role === "company-admin" ? "chip-green" :
                      u.role === "event-manager" ? "chip-orange" : ""
                    }`}>
                      {ROLE_NAMES[u.role]}
                    </span>
                  ),
                  w: "1fr",
                },
                { content: <span className="text-[12px]">{u.title || "—"}</span>, w: "1.2fr" },
                {
                  content: (
                    <div className="flex gap-1">
                      <button className="btn btn-sm" onClick={() => openEdit(u)}>編輯</button>
                      <button className="btn btn-sm" onClick={() => remove(u)} style={{ color: "var(--red)" }}>刪除</button>
                    </div>
                  ),
                  w: "1fr",
                },
              ]}
            />
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            無符合條件的帳號
          </div>
        )}
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "編輯帳號" : "新增帳號"} width="560px">
        <div className="grid grid-cols-2 gap-4">
          <Field label="姓名 *">
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Email *">
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
        </div>
        <Field label="職稱">
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="角色 *">
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {PORTAL_ROLES.map((r) => <option key={r} value={r}>{ROLE_NAMES[r]}</option>)}
            </select>
          </Field>
          <Field label="所屬租戶" hint={form.role === "portal-admin" || form.role === "super-admin" ? "平台層角色無需指派租戶" : "必選"}>
            <select
              className="input"
              value={form.companyId}
              onChange={(e) => setForm({ ...form, companyId: e.target.value })}
              disabled={form.role === "portal-admin" || form.role === "super-admin"}
            >
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="flex justify-end gap-2">
          <button className="btn" onClick={() => setOpen(false)}>取消</button>
          <button className="btn btn-primary" onClick={submit}>{editing ? "儲存" : "建立"}</button>
        </div>
      </Modal>
    </>
  );
}
