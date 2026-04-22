import { useMemo, useState } from "react";
import { useAuth } from "../../store/auth";
import { useData } from "../../store/data";
import { SceneHead, Panel, DataRow } from "../../components/Scene";

const RSVP_LABEL = {
  accepted: { text: "已同意",   cls: "chip-green" },
  declined: { text: "已婉拒",   cls: "chip-red" },
  pending:  { text: "未回覆",   cls: "chip-orange" },
};

export default function VendorAccounts() {
  const user = useAuth((s) => s.user);
  const { vendors, events } = useData();
  const [search, setSearch] = useState("");
  const [filterEvent, setFilterEvent] = useState("all");

  const myEvents = useMemo(() => events.filter((e) => e.companyId === user.companyId), [events, user.companyId]);
  const myEventIds = useMemo(() => myEvents.map((e) => e.id), [myEvents]);

  // 所有本租戶活動的廠商 + 以公司為單位去重（同一家公司可能在多個活動）
  const rows = useMemo(() => {
    const inTenant = vendors.filter((v) => myEventIds.includes(v.eventId));
    const filtered = inTenant.filter((v) => {
      if (filterEvent !== "all" && v.eventId !== filterEvent) return false;
      if (search && !(
        v.company?.toLowerCase().includes(search.toLowerCase()) ||
        v.contact?.toLowerCase().includes(search.toLowerCase()) ||
        v.email?.toLowerCase().includes(search.toLowerCase())
      )) return false;
      return true;
    });
    return filtered;
  }, [vendors, myEventIds, filterEvent, search]);

  const eventName = (id) => events.find((e) => e.id === id)?.name || "—";

  return (
    <>
      <SceneHead
        tag="VENDOR ACCOUNTS"
        title="參展廠商帳號"
        desc="跨活動的參展廠商註冊資料總覽；同一家廠商在不同活動可能有獨立紀錄。"
      />

      <Panel>
        <div className="flex gap-3 mb-4 flex-wrap">
          <input
            className="input max-w-xs"
            placeholder="搜尋公司 / 聯絡人 / Email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input max-w-xs" value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)}>
            <option value="all">全部活動</option>
            {myEvents.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <div className="flex-1 text-right text-[12px] self-center" style={{ color: "var(--text-tertiary)" }}>
            共 {rows.length} 筆
          </div>
        </div>

        <DataRow
          header
          cols={[
            { content: "公司 / 聯絡人", w: "2fr" },
            { content: "所屬活動",      w: "1.5fr" },
            { content: "RSVP",         w: "0.8fr" },
            { content: "註冊狀態",      w: "1fr" },
            { content: "裝潢方式",      w: "1fr" },
            { content: "Email / 電話",  w: "1.6fr" },
          ]}
        />
        {rows.map((v) => {
          const rsvp = RSVP_LABEL[v.rsvpStatus || "pending"];
          return (
            <DataRow
              key={v.id}
              cols={[
                {
                  content: (
                    <div>
                      <div className="font-semibold text-ink-primary">{v.company}</div>
                      <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                        {v.contact} · 統編 {v.taxId}
                      </div>
                    </div>
                  ),
                  w: "2fr",
                },
                { content: eventName(v.eventId), w: "1.5fr" },
                {
                  content: <span className={`chip ${rsvp.cls}`}>{rsvp.text}</span>,
                  w: "0.8fr",
                },
                {
                  content: (
                    <span className={`chip ${
                      v.status === "registered" ? "chip-green" :
                      v.status === "declined"   ? "chip-red" :
                      v.status === "invited"    ? "chip-orange" : "chip-blue"
                    }`}>
                      {v.status === "registered" ? "已註冊" :
                       v.status === "invited"    ? "已邀約" :
                       v.status === "clicked"    ? "已點擊" :
                       v.status === "declined"   ? "婉拒" : v.status}
                    </span>
                  ),
                  w: "1fr",
                },
                {
                  content: v.decorationMode === "self" ? (
                    <span className="chip chip-purple">自行裝潢</span>
                  ) : v.decorationMode === "booth-vendor" ? (
                    <span className="chip chip-blue">攤位廠商</span>
                  ) : (
                    <span className="chip">未設定</span>
                  ),
                  w: "1fr",
                },
                {
                  content: (
                    <div>
                      <div className="text-[12px] truncate">{v.email}</div>
                      <div className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>{v.phone}</div>
                    </div>
                  ),
                  w: "1.6fr",
                },
              ]}
            />
          );
        })}
        {rows.length === 0 && (
          <div className="text-center py-10 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            無符合條件的廠商
          </div>
        )}
      </Panel>
    </>
  );
}
