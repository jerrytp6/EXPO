import { useState } from "react";
import { useAuth, ROLE_NAMES } from "../../store/auth";
import { useData } from "../../store/data";
import { SceneHead, Panel } from "../../components/Scene";
import { Modal } from "../../components/Modal";
import { Icon } from "../../components/Icon";
import { toast } from "../../store/toast";

// ── 權限定義 ──
const PERM_GROUPS = [
  {
    group: "成員管理",
    icon: "users",
    perms: [
      { key: "members.view",        label: "檢視成員" },
      { key: "members.invite",      label: "邀請成員" },
      { key: "members.edit",        label: "編輯成員" },
      { key: "members.remove",      label: "移除成員" },
      { key: "members.permissions", label: "管理權限" },
    ],
  },
  {
    group: "展覽活動",
    icon: "calendar",
    perms: [
      { key: "events.view",   label: "檢視活動" },
      { key: "events.create", label: "建立活動" },
      { key: "events.edit",   label: "編輯活動" },
      { key: "events.delete", label: "刪除活動" },
      { key: "events.assign", label: "指派管理者" },
    ],
  },
  {
    group: "廠商管理",
    icon: "building",
    perms: [
      { key: "vendors.view",    label: "檢視廠商" },
      { key: "vendors.import",  label: "匯入廠商" },
      { key: "vendors.invite",  label: "寄送邀請" },
      { key: "vendors.monitor", label: "即時監控" },
    ],
  },
  {
    group: "裝潢管理",
    icon: "sparkles",
    perms: [
      { key: "decoration.view",   label: "檢視裝潢" },
      { key: "decoration.manage", label: "管理裝潢" },
    ],
  },
  {
    group: "數據分析",
    icon: "activity",
    perms: [
      { key: "analytics.view",   label: "檢視分析" },
      { key: "analytics.export", label: "匯出報告" },
    ],
  },
  {
    group: "公司設定",
    icon: "shield",
    perms: [
      { key: "settings.company", label: "公司資料" },
      { key: "settings.billing", label: "帳務計費" },
    ],
  },
];

const EDITABLE_ROLES = ["company-admin", "event-manager", "member"];
const ALL_PERM_KEYS = PERM_GROUPS.flatMap((g) => g.perms.map((p) => p.key));

export default function Permissions() {
  const user = useAuth((s) => s.user);
  const {
    users,
    permissions,
    memberPermOverrides,
    setRolePermission,
    setRolePermissions,
    setMemberPermOverride,
    getEffectivePermission,
  } = useData();

  const [tab, setTab] = useState("roles"); // roles | members
  const [memberModal, setMemberModal] = useState(null); // userId
  const members = users.filter((u) => u.companyId === user.companyId);

  // ── 角色矩陣 helpers ──
  const getRolePerm = (role, key) => {
    const k = `${user.companyId}::${role}`;
    return permissions?.[k]?.[key] ?? false;
  };

  const toggleRolePerm = (role, key) => {
    if (role === "company-admin" && key === "members.permissions") {
      toast.error("公司管理者必須保留權限管理能力");
      return;
    }
    const current = getRolePerm(role, key);
    setRolePermission(user.companyId, role, key, !current);
  };

  const applyPreset = (role, preset) => {
    const perms = {};
    ALL_PERM_KEYS.forEach((k) => {
      if (preset === "full") perms[k] = true;
      else if (preset === "readonly") perms[k] = k.endsWith(".view");
      else if (preset === "none") perms[k] = false;
    });
    // 保護 company-admin 的 permissions
    if (role === "company-admin") perms["members.permissions"] = true;
    setRolePermissions(user.companyId, role, perms);
    toast.success(`已套用預設：${preset === "full" ? "完整權限" : preset === "readonly" ? "僅檢視" : "全部關閉"}`);
  };

  // ── 成員覆寫 helpers ──
  const selectedMember = memberModal ? members.find((m) => m.id === memberModal) : null;
  const getOverride = (userId, key) => memberPermOverrides?.[userId]?.[key];
  const hasOverride = (userId, key) => memberPermOverrides?.[userId] && key in memberPermOverrides[userId];

  const cycleMemberPerm = (userId, role, key) => {
    const ov = getOverride(userId, key);
    const roleDef = getRolePerm(role, key);
    if (!hasOverride(userId, key)) {
      // 無覆寫 → 覆寫為相反值
      setMemberPermOverride(userId, key, !roleDef);
    } else {
      // 有覆寫 → 移除覆寫（回歸角色預設）
      setMemberPermOverride(userId, key, undefined);
    }
  };

  return (
    <>
      <SceneHead
        tag="PERMISSIONS"
        title="權限矩陣管理"
        desc="設定每個角色的預設權限，或為個別成員自訂覆寫。"
      />

      {/* Tab 切換 */}
      <div className="flex gap-2 mb-6">
        {[
          { id: "roles", label: "依角色設定" },
          { id: "members", label: "依成員設定" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-5 py-2 rounded-pill text-[13px] font-display font-medium transition-colors"
            style={
              tab === t.id
                ? { background: "var(--role-color)", color: "#fff" }
                : { background: "rgba(0,0,0,0.05)", color: "var(--text-secondary)" }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════ 角色模式 ═══════════ */}
      {tab === "roles" && (
        <Panel>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-[13px]" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th
                    className="text-left py-3 pr-4 font-display font-semibold text-[11px] uppercase tracking-wider sticky left-0 bg-white z-10"
                    style={{ color: "var(--text-tertiary)", minWidth: 200 }}
                  >
                    權限項目
                  </th>
                  {EDITABLE_ROLES.map((role) => (
                    <th key={role} className="text-center py-3 px-2" style={{ minWidth: 130 }}>
                      <div className="font-display font-semibold text-[12px] mb-1">
                        {ROLE_NAMES[role]}
                      </div>
                      <div className="flex gap-1 justify-center">
                        <button
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: "rgba(48,209,88,0.1)", color: "#1f8a3a" }}
                          onClick={() => applyPreset(role, "full")}
                        >
                          全開
                        </button>
                        <button
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: "rgba(0,113,227,0.1)", color: "#0058b8" }}
                          onClick={() => applyPreset(role, "readonly")}
                        >
                          僅檢視
                        </button>
                        <button
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: "rgba(0,0,0,0.06)", color: "var(--text-tertiary)" }}
                          onClick={() => applyPreset(role, "none")}
                        >
                          全關
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERM_GROUPS.map((g) => (
                  <GroupRows
                    key={g.group}
                    group={g}
                    roles={EDITABLE_ROLES}
                    getRolePerm={getRolePerm}
                    toggleRolePerm={toggleRolePerm}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* ═══════════ 成員模式 ═══════════ */}
      {tab === "members" && (
        <Panel title="公司成員">
          <div className="space-y-2">
            {members.map((m) => {
              const overrideCount = Object.keys(memberPermOverrides?.[m.id] || {}).length;
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-4 p-4 rounded-xl transition-colors hover:bg-black/[0.02] cursor-pointer"
                  style={{ border: "1px solid var(--separator)" }}
                  onClick={() => setMemberModal(m.id)}
                >
                  <div
                    className="w-10 h-10 rounded-full grid place-items-center text-white font-display font-bold text-[13px]"
                    style={{ background: "var(--role-grad)" }}
                  >
                    {m.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[14px]">
                      {m.name}
                      {m.id === user.id && (
                        <span className="badge badge-blue ml-2">我</span>
                      )}
                    </div>
                    <div
                      className="text-[12px] font-display"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {m.email} · {ROLE_NAMES[m.role]}
                    </div>
                  </div>
                  {overrideCount > 0 && (
                    <span className="badge badge-orange">
                      {overrideCount} 項覆寫
                    </span>
                  )}
                  <Icon name="arrow_right" className="icon w-4 h-4" />
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {/* 成員權限覆寫 Modal */}
      <Modal
        open={!!memberModal}
        onClose={() => setMemberModal(null)}
        title={selectedMember ? `${selectedMember.name} — 權限覆寫` : ""}
        width="680px"
        footer={
          <button className="btn btn-ghost" onClick={() => setMemberModal(null)}>
            關閉
          </button>
        }
      >
        {selectedMember && (
          <>
            <div
              className="text-[12px] font-display p-3 rounded-lg mb-4"
              style={{ background: "var(--bg-tinted)", color: "var(--text-secondary)" }}
            >
              預設角色：<strong>{ROLE_NAMES[selectedMember.role]}</strong>。
              下方可以為此成員個別開啟/關閉特定權限。
              <strong style={{ color: "var(--orange)" }}> 橘色</strong> 表示已覆寫角色預設。
              點擊切換：覆寫 ↔ 回歸預設。
            </div>
            <div className="max-h-[480px] overflow-auto">
              {PERM_GROUPS.map((g) => (
                <div key={g.group} className="mb-4">
                  <div
                    className="text-[11px] font-display font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {g.group}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {g.perms.map((p) => {
                      const roleDef = getRolePerm(selectedMember.role, p.key);
                      const hasOv = hasOverride(selectedMember.id, p.key);
                      const ov = getOverride(selectedMember.id, p.key);
                      const effective = hasOv ? ov : roleDef;

                      return (
                        <button
                          key={p.key}
                          onClick={() =>
                            cycleMemberPerm(
                              selectedMember.id,
                              selectedMember.role,
                              p.key
                            )
                          }
                          className="flex items-center gap-2.5 p-2.5 rounded-lg text-left text-[12px] transition-all"
                          style={{
                            background: hasOv
                              ? "rgba(255,159,10,0.08)"
                              : "var(--bg-tinted)",
                            border: hasOv
                              ? "1px solid rgba(255,159,10,0.4)"
                              : "1px solid var(--separator)",
                          }}
                        >
                          <ToggleSwitch on={effective} />
                          <div className="flex-1 min-w-0">
                            <div
                              className="font-medium"
                              style={{
                                color: effective
                                  ? "var(--text-primary)"
                                  : "var(--text-tertiary)",
                              }}
                            >
                              {p.label}
                            </div>
                            {hasOv && (
                              <div
                                className="text-[10px] font-display mt-0.5"
                                style={{ color: "var(--orange)" }}
                              >
                                已覆寫（角色預設：{roleDef ? "開" : "關"}）
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>
    </>
  );
}

// ── 群組列 ──
function GroupRows({ group, roles, getRolePerm, toggleRolePerm }) {
  return (
    <>
      <tr>
        <td
          colSpan={1 + roles.length}
          className="pt-5 pb-2 text-[11px] font-display font-bold uppercase tracking-wider sticky left-0 bg-white"
          style={{
            color: "var(--text-tertiary)",
            borderBottom: "1px solid var(--separator)",
          }}
        >
          <div className="flex items-center gap-2">
            <Icon name={group.icon} className="icon w-4 h-4" />
            {group.group}
          </div>
        </td>
      </tr>
      {group.perms.map((p) => (
        <tr key={p.key} className="hover:bg-black/[0.015]">
          <td
            className="py-2.5 pr-4 sticky left-0 bg-white"
            style={{ borderBottom: "1px solid var(--separator)" }}
          >
            {p.label}
          </td>
          {roles.map((role) => {
            const on = getRolePerm(role, p.key);
            return (
              <td
                key={role}
                className="text-center py-2.5 px-2"
                style={{ borderBottom: "1px solid var(--separator)" }}
              >
                <button
                  onClick={() => toggleRolePerm(role, p.key)}
                  className="mx-auto"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <ToggleSwitch on={on} />
                </button>
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}

// ── Toggle Switch ──
function ToggleSwitch({ on }) {
  return (
    <div
      className="w-9 h-5 rounded-full flex items-center transition-colors flex-shrink-0"
      style={{
        background: on ? "var(--green)" : "rgba(0,0,0,0.12)",
        padding: "2px",
      }}
    >
      <div
        className="w-4 h-4 rounded-full bg-white shadow-sm transition-transform"
        style={{
          transform: on ? "translateX(16px)" : "translateX(0px)",
        }}
      />
    </div>
  );
}
