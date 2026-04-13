import { useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useData } from "../../store/data";
import { SceneHead, Panel, DataRow } from "../../components/Scene";
import { Icon } from "../../components/Icon";
import { toast } from "../../store/toast";

// 簡易 CSV parser —— 支援標頭 company,taxId,contact,email,phone
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    const row = {};
    headers.forEach((h, i) => (row[h] = cols[i] || ""));
    return row;
  });
}

export default function ImportVendors() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { events, importVendors } = useData();
  const event = events.find((e) => e.id === eventId);
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");

  if (!event) return <Navigate to="/event" replace />;

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseCSV(String(reader.result));
        if (parsed.length === 0) {
          toast.error("檔案為空或格式錯誤");
          return;
        }
        setRows(parsed);
        toast.success(`解析成功：${parsed.length} 筆`);
      } catch {
        toast.error("無法解析檔案");
      }
    };
    reader.readAsText(file);
  };

  const useSample = () => {
    const sample = [
      { company: "仁寶電腦", taxId: "04541302", contact: "劉家華", email: "jiahua@compal.com", phone: "02-87978588" },
      { company: "和碩聯合",   taxId: "97176270", contact: "黃佩珊", email: "peishan@pegatron.com", phone: "02-88797000" },
      { company: "廣達電腦",   taxId: "86700978", contact: "林建成", email: "jiancheng@quanta.com", phone: "03-3272345" },
      { company: "英業達",     taxId: "04118201", contact: "吳秀英", email: "xiuying@inventec.com", phone: "02-28815151" },
    ];
    setRows(sample);
    setFileName("sample-vendors.csv");
    toast.info("已載入示範資料");
  };

  const submit = () => {
    if (rows.length === 0) {
      toast.error("請先選擇檔案");
      return;
    }
    importVendors(eventId, rows);
    toast.success(`成功匯入 ${rows.length} 家廠商`);
    navigate(`/event/${eventId}/vendors`);
  };

  return (
    <>
      <SceneHead
        tag={`EVENT · ${event.name}`}
        title="匯入廠商名單"
        desc="上傳 CSV 檔案，系統會自動解析並預覽資料。欄位：company, taxId, contact, email, phone"
      />

      <Panel>
        <label className="block">
          <div className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer hover:bg-black/[0.02] transition-colors"
            style={{ borderColor: "var(--separator-strong)", background: "var(--bg-tinted)" }}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 grid place-items-center"
              style={{ background: "var(--role-grad)" }}>
              <Icon name="upload" className="icon" />
              <style>{`label > div > div:first-child .icon { stroke: white; }`}</style>
            </div>
            <div className="text-[17px] font-semibold mb-1">
              {fileName || "點擊或拖曳 CSV 檔案"}
            </div>
            <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
              最大 10MB · UTF-8 編碼
            </div>
          </div>
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} />
        </label>
        <div className="mt-4 text-center">
          <button type="button" className="btn btn-ghost" onClick={useSample}>
            或載入示範資料
          </button>
        </div>
      </Panel>

      {rows.length > 0 && (
        <Panel title={`預覽 (${rows.length} 筆)`}
          action={<button className="btn btn-primary" onClick={submit}>匯入 {rows.length} 筆</button>}>
          <DataRow
            header
            cols={[
              { content: "公司", w: "2fr" },
              { content: "統編", w: "1fr" },
              { content: "聯絡人", w: "1fr" },
              { content: "Email", w: "2fr" },
            ]}
          />
          {rows.slice(0, 10).map((r, i) => (
            <DataRow
              key={i}
              cols={[
                { content: <span className="font-medium">{r.company}</span>, w: "2fr" },
                { content: <span className="font-display text-[12px]">{r.taxId}</span>, w: "1fr" },
                { content: r.contact, w: "1fr" },
                { content: <span className="font-display text-[12px]">{r.email}</span>, w: "2fr" },
              ]}
            />
          ))}
          {rows.length > 10 && (
            <div className="px-4 py-3 text-[12px] font-display" style={{ color: "var(--text-tertiary)" }}>
              … 還有 {rows.length - 10} 筆
            </div>
          )}
        </Panel>
      )}
    </>
  );
}
