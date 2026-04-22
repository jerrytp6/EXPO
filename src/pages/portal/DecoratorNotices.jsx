import { useMemo, useState } from "react";
import { useData } from "../../store/data";
import { Icon } from "../../components/Icon";

// 裝潢廠商端：須知唯讀（只看 allowDecoratorView=true 的項目）— PDF p11 標註
export default function DecoratorNotices({ decorator }) {
  const { vendors, events, decorationProjects, eventNotices } = useData();

  // 取得此裝潢商服務的廠商清單
  const servedProjects = decorationProjects.filter((p) => p.decoratorId === decorator.id);
  const servedVendors = servedProjects
    .map((p) => ({
      project: p,
      vendor: vendors.find((v) => v.id === p.vendorId),
      event: events.find((e) => e.id === p.eventId),
    }))
    .filter((x) => x.vendor && x.event);

  const [selectedVendorId, setSelectedVendorId] = useState(servedVendors[0]?.vendor.id || null);
  const selected = servedVendors.find((x) => x.vendor.id === selectedVendorId);
  const [currentNoticeId, setCurrentNoticeId] = useState(null);

  const visibleNotices = useMemo(() => {
    if (!selected) return [];
    return (eventNotices || [])
      .filter((n) => n.eventId === selected.event.id && n.allowDecoratorView)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [eventNotices, selected]);

  const current = currentNoticeId ? visibleNotices.find((n) => n.id === currentNoticeId) : null;

  if (servedVendors.length === 0) {
    return (
      <>
        <div className="mb-8">
          <div className="scene-tag">NOTICES · 展覽須知</div>
          <h1 className="scene-title">參展廠商分享的展覽須知</h1>
        </div>
        <div className="panel text-center py-16">
          <div className="text-5xl mb-3">📭</div>
          <div className="text-[14px]" style={{ color: "var(--text-tertiary)" }}>
            目前沒有合作中的參展廠商
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <div className="scene-tag">NOTICES · 展覽須知（唯讀）</div>
        <h1 className="scene-title">參展廠商分享的展覽須知</h1>
        <p className="scene-desc">
          此頁顯示主辦方允許裝潢廠商參閱的須知文件，您無法代廠商勾選同意。
        </p>
      </div>

      {/* 廠商切換 */}
      <div className="panel mb-6">
        <div className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-tertiary)" }}>
          SWITCH CLIENT · 切換合作廠商
        </div>
        <div className="flex gap-2 flex-wrap">
          {servedVendors.map(({ vendor, event }) => (
            <button
              key={vendor.id}
              className={`btn ${selectedVendorId === vendor.id ? "btn-primary" : ""}`}
              onClick={() => { setSelectedVendorId(vendor.id); setCurrentNoticeId(null); }}
            >
              <div className="text-left">
                <div className="font-medium text-[13px]">{vendor.company}</div>
                <div className="text-[10px] opacity-70">{event.name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 須知清單 */}
          <div className="md:col-span-1 space-y-2">
            {visibleNotices.map((n) => (
              <button
                key={n.id}
                onClick={() => setCurrentNoticeId(n.id)}
                className="w-full text-left p-4 rounded-xl transition-all"
                style={{
                  background: currentNoticeId === n.id ? "var(--bg-elevated)" : "transparent",
                  border: `1px solid ${currentNoticeId === n.id ? "var(--role-color)" : "var(--separator)"}`,
                }}
              >
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="chip">{n.category}</span>
                  <span className="chip chip-orange">唯讀</span>
                </div>
                <div className="font-medium text-[13px]">{n.title}</div>
              </button>
            ))}
            {visibleNotices.length === 0 && (
              <div className="text-center py-10 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                本廠商的活動沒有開放裝潢商查看的須知
              </div>
            )}
          </div>

          {/* 須知內容 */}
          <div className="md:col-span-2">
            {current ? (
              <div className="panel">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="chip">{current.category}</span>
                  <span className="chip chip-orange">唯讀（裝潢廠商視角）</span>
                </div>
                <h2 className="text-2xl font-bold mb-2 tracking-tight">{current.title}</h2>
                <div className="text-[12px] mb-5" style={{ color: "var(--text-tertiary)" }}>
                  發佈於 {current.publishedAt} · 屬於「{selected.vendor.company}」參展之活動
                </div>
                <div className="prose text-[14px] whitespace-pre-wrap" style={{ color: "var(--text-primary)", lineHeight: 1.7 }}>
                  {current.content}
                </div>
                {current.attachmentName && (
                  <div className="mt-6 p-4 rounded-xl" style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg grid place-items-center" style={{ background: "var(--role-color)" }}>
                        <Icon name="document" className="icon" />
                        <style>{`.w-10 .icon { stroke: white; }`}</style>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[13px] truncate">{current.attachmentName}</div>
                      </div>
                      <button className="btn btn-sm">下載</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="panel text-center py-16">
                <div className="text-5xl mb-3">📋</div>
                <div className="text-[14px]" style={{ color: "var(--text-tertiary)" }}>
                  請由左側選擇一項須知開始閱讀
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
