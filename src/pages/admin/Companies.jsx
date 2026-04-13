import { useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../../store/data";
import { SceneHead, Panel, DataRow } from "../../components/Scene";

export default function Companies() {
  const companies = useData((s) => s.companies);
  const [filter, setFilter] = useState("all");

  const filtered = companies.filter((c) => filter === "all" || c.status === filter);

  const filters = [
    { id: "all", label: `全部 (${companies.length})` },
    { id: "active", label: `啟用中 (${companies.filter(c => c.status === "active").length})` },
    { id: "pending", label: `待審核 (${companies.filter(c => c.status === "pending").length})` },
  ];

  return (
    <>
      <SceneHead
        tag="COMPANIES"
        title="企業管理"
        desc="檢視、核准、管理平台上所有企業帳號。"
      />
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="px-4 py-1.5 rounded-pill text-[13px] font-display transition-colors"
              style={
                filter === f.id
                  ? { background: "var(--role-color)", color: "#fff" }
                  : { background: "rgba(0,0,0,0.05)", color: "var(--text-secondary)" }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
        <Link to="/admin/companies/new" className="btn btn-primary">+ 建立新企業</Link>
      </div>

      <Panel>
        <DataRow
          header
          cols={[
            { content: "企業名稱", w: "2fr" },
            { content: "統編", w: "1fr" },
            { content: "產業", w: "1fr" },
            { content: "方案", w: "0.8fr" },
            { content: "狀態", w: "0.8fr" },
          ]}
        />
        {filtered.map((c) => (
          <DataRow
            key={c.id}
            cols={[
              {
                content: (
                  <Link to={`/admin/companies/${c.id}`} className="font-medium no-underline"
                    style={{ color: "var(--text-primary)" }}>
                    {c.name}
                  </Link>
                ),
                w: "2fr",
              },
              { content: <span className="font-display">{c.taxId}</span>, w: "1fr" },
              { content: c.industry, w: "1fr" },
              { content: <span className="badge badge-blue">{c.plan}</span>, w: "0.8fr" },
              {
                content: (
                  <span className={`badge ${c.status === "active" ? "badge-green" : "badge-orange"}`}>
                    {c.status === "active" ? "啟用中" : "待審核"}
                  </span>
                ),
                w: "0.8fr",
              },
            ]}
          />
        ))}
      </Panel>
    </>
  );
}
