import { Link, useParams, useNavigate, Navigate } from "react-router-dom";
import { useData } from "../../store/data";
import { SceneHead, Panel } from "../../components/Scene";
import { toast } from "../../store/toast";

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { companies, users, events, approveCompany, rejectCompany } = useData();

  const company = companies.find((c) => c.id === id);
  if (!company) return <Navigate to="/admin/companies" replace />;

  const admin = users.find((u) => u.id === company.adminUserId);
  const companyEvents = events.filter((e) => e.companyId === company.id);
  const members = users.filter((u) => u.companyId === company.id);

  return (
    <>
      <SceneHead
        tag="COMPANY DETAIL"
        title={company.name}
        desc={`統編 ${company.taxId} · ${company.industry} · ${company.size}`}
      />

      <div className="flex gap-2 mb-5">
        {company.status === "pending" && (
          <>
            <button className="btn btn-primary" onClick={() => {
              approveCompany(company.id);
              toast.success("已核准並啟用");
            }}>核准並啟用</button>
            <button className="btn btn-ghost" onClick={() => {
              if (confirm("確定要拒絕此申請？")) {
                rejectCompany(company.id);
                toast.info("已拒絕");
                navigate("/admin/companies");
              }
            }}>拒絕</button>
          </>
        )}
        <span className={`badge ${company.status === "active" ? "badge-green" : "badge-orange"} ml-auto`}>
          {company.status === "active" ? "啟用中" : "待審核"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Panel title="公司資料">
          <dl className="space-y-3 text-[14px]">
            {[
              ["公司名稱", company.name],
              ["統一編號", company.taxId],
              ["產業別", company.industry],
              ["公司規模", company.size],
              ["地址", company.address],
              ["電話", company.phone],
              ["建立日期", company.createdAt],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt style={{ color: "var(--text-tertiary)" }}>{k}</dt>
                <dd className="font-medium text-right">{v || "—"}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel title="最高管理者">
          {admin ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full grid place-items-center text-white font-display font-bold text-[16px]"
                  style={{ background: "var(--role-grad)" }}>
                  {admin.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-[15px]">{admin.name}</div>
                  <div className="text-[12px] font-display" style={{ color: "var(--text-tertiary)" }}>
                    {admin.title}
                  </div>
                </div>
              </div>
              <div className="text-[13px] font-display" style={{ color: "var(--text-secondary)" }}>
                {admin.email}
              </div>
            </>
          ) : (
            <div className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>尚未指派管理者</div>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">
        <Panel title={`成員 (${members.length})`}>
          {members.slice(0, 5).map((u) => (
            <div key={u.id} className="flex items-center gap-3 py-2.5"
              style={{ borderBottom: "1px solid var(--separator)" }}>
              <div className="w-8 h-8 rounded-full grid place-items-center text-white font-display font-bold text-[11px]"
                style={{ background: "var(--role-grad)" }}>
                {u.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium">{u.name}</div>
                <div className="text-[11px] font-display truncate" style={{ color: "var(--text-tertiary)" }}>{u.email}</div>
              </div>
            </div>
          ))}
        </Panel>

        <Panel title={`展覽活動 (${companyEvents.length})`}>
          {companyEvents.length === 0 ? (
            <div className="text-[13px] py-4" style={{ color: "var(--text-tertiary)" }}>尚無活動</div>
          ) : companyEvents.map((e) => (
            <div key={e.id} className="py-2.5" style={{ borderBottom: "1px solid var(--separator)" }}>
              <div className="text-[13px] font-medium">{e.name}</div>
              <div className="text-[11px] font-display" style={{ color: "var(--text-tertiary)" }}>
                {e.startDate} · {e.location}
              </div>
            </div>
          ))}
        </Panel>
      </div>

      <div className="mt-6">
        <Link to="/admin/companies" className="btn btn-ghost">← 返回企業列表</Link>
      </div>
    </>
  );
}
