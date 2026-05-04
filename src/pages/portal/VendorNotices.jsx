import { useMemo, useState } from "react";
import { useData } from "../../store/data";
import { Icon } from "../../components/Icon";
import { toast } from "../../store/toast";
import { api } from "../../lib/api";

// 廠商端：文件須知（閱讀 + 勾選同意）— PDF p11
export default function VendorNotices({ vendor, event }) {
  const { eventNotices, noticeAcknowledgments, acknowledgeNotice, getNoticesForVendor } = useData();
  const [selected, setSelected] = useState(null);

  const notices = useMemo(
    () => getNoticesForVendor(event.id, vendor.id),
    [eventNotices, noticeAcknowledgments, event.id, vendor.id]
  );

  const current = selected ? notices.find((n) => n.id === selected) : null;

  const confirmAck = (n) => {
    acknowledgeNotice(event.id, vendor.id, n.id);
    toast.success(`已確認：${n.title}`);
  };

  const requiredCount = notices.filter((n) => n.requiresAck).length;
  const ackedCount = notices.filter((n) => n.requiresAck && n.acknowledged).length;
  const progress = requiredCount ? Math.round((ackedCount / requiredCount) * 100) : 100;

  return (
    <>
      <div className="mb-8">
        <div className="scene-tag">NOTICES · 須知文件</div>
        <h1 className="scene-title">閱讀並確認展覽須知</h1>
        <p className="scene-desc">
          請逐項閱讀以下須知，標示為「必勾」的項目需勾選同意後才能完成準備工作。
        </p>
      </div>

      {/* 進度條 */}
      <div className="panel mb-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-tertiary)" }}>
              ACKNOWLEDGMENT PROGRESS
            </div>
            <div className="text-3xl font-bold">
              {ackedCount} <span className="text-[18px]" style={{ color: "var(--text-tertiary)" }}>/ {requiredCount} 項已確認</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold" style={{ color: progress === 100 ? "var(--green)" : "var(--role-color)" }}>
              {progress}%
            </div>
          </div>
        </div>
        <div className="h-2 rounded-full" style={{ background: "var(--separator)" }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, background: progress === 100 ? "var(--green)" : "var(--role-color)" }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 左側：須知清單 */}
        <div className="md:col-span-1 space-y-2">
          {notices.map((n) => (
            <button
              key={n.id}
              onClick={() => setSelected(n.id)}
              className="w-full text-left p-4 rounded-xl transition-all"
              style={{
                background: selected === n.id ? "var(--bg-elevated)" : "transparent",
                border: `1px solid ${selected === n.id ? "var(--role-color)" : "var(--separator)"}`,
                boxShadow: selected === n.id ? "var(--shadow-sm)" : "none",
              }}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  {n.acknowledged ? (
                    <div className="w-5 h-5 rounded-full grid place-items-center" style={{ background: "var(--green)" }}>
                      <Icon name="check" className="icon" />
                      <style>{`button .grid .icon { stroke: white; stroke-width: 3; width: 12px; height: 12px; }`}</style>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2" style={{ borderColor: "var(--separator-strong)" }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="chip">{n.category}</span>
                    {n.requiresAck && <span className="chip chip-blue">必勾</span>}
                  </div>
                  <div className="font-medium text-[13px] truncate">{n.title}</div>
                </div>
              </div>
            </button>
          ))}
          {notices.length === 0 && (
            <div className="text-center py-10 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
              目前無任何須知
            </div>
          )}
        </div>

        {/* 右側：須知內容 */}
        <div className="md:col-span-2">
          {current ? (
            <div className="panel">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="chip">{current.category}</span>
                {current.requiresAck && <span className="chip chip-blue">必勾同意</span>}
                {current.acknowledged && <span className="chip chip-green">✓ 已確認</span>}
              </div>
              <h2 className="text-2xl font-bold mb-2 tracking-tight">{current.title}</h2>
              <div className="text-[12px] mb-5" style={{ color: "var(--text-tertiary)" }}>
                發佈於 {current.publishedAt}
                {current.acknowledged && ` · 您於 ${current.acknowledgedAt} 確認`}
              </div>

              <div className="prose text-[14px] whitespace-pre-wrap mb-6" style={{ color: "var(--text-primary)", lineHeight: 1.7 }}>
                {current.content}
              </div>

              {current.attachmentName && (
                <div className="p-4 rounded-xl mb-6" style={{ background: "var(--bg-tinted)", border: "1px solid var(--separator)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg grid place-items-center" style={{ background: "var(--role-color)" }}>
                      <Icon name="document" className="icon" />
                      <style>{`.w-10 .icon { stroke: white; }`}</style>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[13px] truncate">{current.attachmentName}</div>
                      <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>點擊下載附件</div>
                    </div>
                    {current.attachmentPath ? (
                      <a className="btn btn-sm" href={api.fileUrl(current.attachmentPath)} target="_blank" rel="noreferrer">下載</a>
                    ) : (
                      <button className="btn btn-sm" onClick={() => toast.info("此須知無附件檔（請看正文）")}>下載</button>
                    )}
                  </div>
                </div>
              )}

              {current.requiresAck && (
                <div className="border-t pt-5" style={{ borderColor: "var(--separator)" }}>
                  {current.acknowledged ? (
                    <div className="text-center p-4 rounded-xl" style={{ background: "rgba(48,209,88,0.08)" }}>
                      <div className="text-3xl mb-1">✅</div>
                      <div className="font-semibold" style={{ color: "var(--green)" }}>已確認同意</div>
                      <div className="text-[12px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                        {current.acknowledgedAt}
                      </div>
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary w-full py-3"
                      onClick={() => confirmAck(current)}
                    >
                      我已閱讀並同意本須知內容
                    </button>
                  )}
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
    </>
  );
}
