import type { Metadata } from "next";
import { BarChart3, Megaphone } from "lucide-react";
import { formatCurrency, getCustomerPortalData } from "../portal-data";
import { PortalMissingContact } from "../portal-shell";
import { PortalReportsTabs } from "./reports-tabs";

export const metadata: Metadata = {
  title: "Báo cáo | Portal Khách hàng",
};

export const dynamic = "force-dynamic";

export default async function PortalReportsPage() {
  const data = await getCustomerPortalData();

  if (!data.contact) {
    return <PortalMissingContact email={data.session.user.email} />;
  }

  const pageReach = data.socialReports.reduce((sum, report) => sum + report.pageTotals.reach, 0);
  const pageEngagement = data.socialReports.reduce((sum, report) => sum + report.pageTotals.engagements, 0);
  const adsSpend = data.socialReports.reduce((sum, report) => sum + report.adsTotals.spend, 0);
  const adsLeads = data.socialReports.reduce((sum, report) => sum + report.adsTotals.leads, 0);

  return (
    <div className="mx-auto max-w-[1440px] p-6 lg:p-8 animate-in fade-in duration-500 grid gap-5">
      <section className="quote-detail-hero">
        <div className="quote-detail-title">
            <div className="quote-detail-icon"><BarChart3 className="h-6 w-6" /></div>
            <div>
            <h1>Báo cáo Social Marketing</h1>
            <p>Khách chỉ thấy Page hoặc Ads đã được bật trong từng dự án.</p>
          </div>
        </div>
      </section>

      <section className="portal-metric-grid grid gap-4 lg:grid-cols-4">
        <ReportCard label="Page Reach" value={pageReach.toLocaleString("vi-VN")} />
        <ReportCard label="Page Engagement" value={pageEngagement.toLocaleString("vi-VN")} />
        <ReportCard label="Ads Spend" value={formatCurrency(adsSpend)} />
        <ReportCard label="Ads Lead" value={adsLeads.toLocaleString("vi-VN")} />
      </section>

      <section className="quote-detail-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-blue-600" />Facebook Report theo dự án</h2>
            <p className="mt-1 text-sm text-slate-500">Dữ liệu đọc từ nguồn Social đã gắn ở phần Sửa dự án.</p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">30 ngày gần nhất</span>
        </div>

        {!data.socialMarketingEnabled ? (
          <div className="mt-5 rounded-2xl border border-dashed border-orange-200 bg-orange-50 p-5 text-sm text-orange-800">
            Social Marketing chưa bật cho portal này, nên khách chưa thấy report Facebook.
          </div>
        ) : data.socialReports.length ? (
          <PortalReportsTabs reports={data.socialReports} />
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            Chưa có nguồn Facebook nào cho portal này. Cần gán dự án cho khách hàng <strong>{data.contact.email}</strong>, rồi vào Sửa dự án tick Facebook Page hoặc Facebook Ads.
          </div>
        )}
      </section>
    </div>
  );
}

function ReportCard({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="quote-detail-card">
      <span className="text-slate-500">{label}</span>
      <strong className={`mt-2 block text-xl ${danger ? "text-red-500" : "text-slate-950"}`}>{value}</strong>
    </div>
  );
}
