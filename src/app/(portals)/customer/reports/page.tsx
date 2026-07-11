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
    <div className="mx-auto max-w-[1500px] px-6 py-12 lg:px-8 animate-in fade-in duration-500 font-sans">
      
      {/* Vercel Header */}
      <section className="mb-12">
        <h1 className="text-[56px] font-medium tracking-tight text-black leading-tight">
          Báo cáo Social Marketing
        </h1>
        <p className="mt-4 text-[16px] text-gray-500 max-w-2xl">
          Theo dõi mức độ tương tác và ngân sách quảng cáo của tất cả các chiến dịch trong dự án. Khách hàng chỉ xem được Page hoặc Ads đã được bật.
        </p>
      </section>

      {/* Vercel Metrics Grid */}
      <section className="grid gap-4 lg:grid-cols-4 mb-16">
        <ReportCard label="Page Reach" value={pageReach.toLocaleString("vi-VN")} />
        <ReportCard label="Page Engagement" value={pageEngagement.toLocaleString("vi-VN")} />
        <ReportCard label="Ads Spend" value={formatCurrency(adsSpend)} />
        <ReportCard label="Ads Lead" value={adsLeads.toLocaleString("vi-VN")} />
      </section>

      {/* Vercel Content Section */}
      <section className="border-t border-[#eaeaea] pt-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-[24px] font-medium tracking-tight text-black flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Chi tiết Facebook Report
            </h2>
            <p className="mt-1 text-[14px] text-gray-500">Dữ liệu đọc từ nguồn Social đã gắn ở phần Sửa dự án.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-[13px] font-medium text-black">30 ngày gần nhất</span>
          </div>
        </div>

        {!data.socialMarketingEnabled ? (
          <div className="rounded-md border border-[#eaeaea] bg-gray-50 p-6 flex flex-col items-center justify-center text-center">
            <p className="text-[14px] font-medium text-black">Tính năng chưa được kích hoạt</p>
            <p className="mt-1 text-[13px] text-gray-500">Social Marketing chưa bật cho portal này, nên khách chưa thấy report Facebook.</p>
          </div>
        ) : data.socialReports.length ? (
          <PortalReportsTabs reports={data.socialReports} />
        ) : (
          <div className="rounded-md border border-[#eaeaea] bg-gray-50 p-6 flex flex-col items-center justify-center text-center">
            <p className="text-[14px] font-medium text-black">Chưa có nguồn dữ liệu</p>
            <p className="mt-1 text-[13px] text-gray-500 max-w-md">
              Cần gán dự án cho khách hàng <strong className="text-black font-semibold">{data.contact.email}</strong>, rồi vào Sửa dự án tick Facebook Page hoặc Facebook Ads.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function ReportCard({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-xl border border-[#eaeaea] bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <span className="text-[13px] font-medium text-gray-500">{label}</span>
      <strong className={`mt-2 block text-[32px] font-medium tracking-tight ${danger ? "text-red-500" : "text-black"}`}>
        {value}
      </strong>
    </div>
  );
}
