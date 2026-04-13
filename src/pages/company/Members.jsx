import { useState } from "react";
import { useAuth, ROLE_NAMES } from "../../store/auth";
import { useData } from "../../store/data";
import { SceneHead, Panel, DataRow, Field } from "../../components/Scene";
import { Modal } from "../../components/Modal";
import { toast } from "../../store/toast";

const ROLES = ["member", "event-manager", "company-admin"];

export default function Members() {
  const user = useAuth((s) => s.user);
  const { users, createMember, updateMember, deleteMember } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", title: "", role: "member" });

  const members = users.filter((u) => u.companyId === user.companyId);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", email: "", title: "", role: "member" });
    setOpen(true);
  };
  const openEdit = (u) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, title: u.title || "", role: u.role });
    setOpen(true);
  };

  const submit = () => {
    if (!form.name || !form.email) {
      toast.error("請填寫姓名與 Email");
      return;
    }
    if (editing) {
      updateMember(editing.id, form);
      toast.success(`已更新：${form.name}`);
    } else {
      createMember({ ...form, companyId: user.companyId });
      toast.success(`已新增成員：${form.name}`);
    }
    setOpen(false);
  };

  const remove = (u) => {
    if (u.id === user.id) {
      toast.error("無法刪除自己");
      return;
    }
    if (!confirm(`確定移除「${u.name}」？`)) return;
    deleteMember(u.id);
    toast.info(`已移除：${u.name}`);
  };

  return (
    <>
      <SceneHead
        tag="MEMBERS"
        title="成員管理"
        desc="新增或調整公司成員的角色與權限。"
      />
      <div className="flex justify-end mb-4">
        <button className="btn btn-primary" onClick={openNew}>+ 新增成員</button>
      </div>
      <Panel>
        <DataRow
          header
          cols={[
            { content: "姓名 / Email", w: "2fr" },
            { content: "角色", w: "1.2fr" },
            { content: "職稱", w: "1fr" },
            { content: "動作", w: "1fr" },
          ]}
        />
        {members.map((u) => (
          <DataRow
            key={u.id}
            cols={[
              {
                content: (
                  <div>
                    <div className="font-medium">{u.name}{u.id === user.id && <span className="badge badge-blue ml-2">我</span>}</div>
                    <div className="text-[11px] font-display" style={{ color: "var(--text-tertiary)" }}>{u.email}</div>
                  </div>
                ),
                w: "2fr",
              },
              { content: <span className="badge badge-gray">{ROLE_NAMES[u.role]}</span>, w: "1.2fr" },
              { content: u.title || "—", w: "1fr" },
              {
                content: (
                  <div className="flex gap-2">
                    <button className="btn btn-ghost !py-1 !text-xs" onClick={() => openEdit(u)}>編輯</button>
                    <button className="btn btn-ghost !py-1 !text-xs" onClick={() => remove(u)}>移除</button>
                  </div>
                ),
                w: "1fr",
              },
            ]}
          />
        ))}
      </Panel>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "編輯成員" : "新增成員"}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>取消</button>
            <button className="btn btn-primary" onClick={submit}>{editing ? "儲存" : "新增"}</button>
          </>
        }
      >
        <Field label="姓名 *"><input className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
          style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Email *"><input type="email" className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
          style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="職稱"><input className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
          style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
          value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="角色">
          <select className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
            style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}
            value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {ROLES.map((r) => <option key={r} value={r}>{ROLE_NAMES[r]}</option>)}
          </select>
        </Field>
      </Modal>
    </>
  );
}
