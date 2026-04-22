import { Link } from "react-router-dom";
import { useData } from "../../store/data";
import { SceneHead, Panel, StatGrid, DataRow } from "../../components/Scene";
import { toast } from "../../store/toast";

export default function AdminDashboard() {
  const { companies, users, events, approveCompany, rejectCompany } = useData();

  const pending = companies.filter((c) => c.status === "pending");
  const active = companies.filter((c) => c.status === "active");

  const approve = (id, name) => {
    approveCompany(id);
    toast.success(`已核准：${name}`);
  };
  const reject = (id, name) => {
    if (!confirm(`確定要拒絕「${name}」的申請？`)) return;
    rejectCompany(id);
    toast.info(`已拒絕：${name}`);
  };

  return (
    <>
      <SceneHead
        tag="DASHBOARD"
        title="系統管理儀表板"
        desc="掌握平台所有企業帳號、開通進度與風險指標。"
      />
      <StatGrid
        stats={[
          { label: "已開通企業", value: active.length },
          { label: "待審核申請", value: pending.length, delta: pending.length > 0 ? "需處理" : "無待辦", deltaColor: pending.length > 0 ? "var(--orange)" : "var(--green)" },
          { label: "活躍展覽", value: events.length },
          { label: "平台使用者", value: users.length },
        ]}
      />

      <Panel
        title={`待審核的企業申請 (${pending.length})`}
        action={<Link to="/admin/companies" className="btn btn-ghost">查看所有企業</Link>}
      >
        {pending.length === 0 ? (
          <div className="py-10 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            目前沒有待審核的申請
          </div>
        ) : (
          <>
            <DataRow
              header
              cols={[
                { content: "企業名稱", w: "2fr" },
                { content: "統編", w: "1fr" },
                { content: "申請時間", w: "1fr" },
                { content: "動作", w: "1.2fr" },
              ]}
            />
            {pending.map((c) => (
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
                  { content: <span className="font-display">{c.createdAt}</span>, w: "1fr" },
                  {
                    content: (
                      <div className="flex gap-2">
                        <button className="btn btn-primary !py-1 !text-xs" onClick={() => approve(c.id, c.name)}>核准</button>
                        <button className="btn btn-ghost !py-1 !text-xs" onClick={() => reject(c.id, c.name)}>拒絕</button>
                      </div>
                    ),
                    w: "1.2fr",
                  },
                ]}
              />
            ))}
          </>
        )}
      </Panel>

      <Panel title="已開通企業">
        <DataRow
          header
          cols={[
            { content: "企業名稱", w: "2fr" },
            { content: "產業別", w: "1fr" },
            { content: "狀態", w: "1fr" },
            { content: "建立日期", w: "1fr" },
          ]}
        />
        {active.map((c) => (
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
              { content: c.industry, w: "1fr" },
              { content: <span className="badge badge-green">啟用中</span>, w: "1fr" },
              { content: <span className="font-display">{c.createdAt}</span>, w: "1fr" },
            ]}
          />
        ))}
      </Panel>
    </>
  );
}
