import type { Metadata } from "next";
import { BarChart3, Megaphone } from "lucide-react";
import { formatCurrency, getCustomerPortalData } from "../portal-data";
import { PortalMissingContact, PortalShell } from "../portal-shell";
import { PortalAdsChart, PortalPageChart } from "./social-report-charts";

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
    <PortalShell active="reports" customerName={data.customerName} email={data.contact.email}>
      <section className="quote-detail-hero">
        <div className="quote-detail-title">
            <div className="quote-detail-icon"><BarChart3 className="h-6 w-6" /></div>
            <div>
            <h1>Báo cáo Social Marketing</h1>
            <p>Khách chỉ thấy Page hoặc Ads đã được bật trong từng dự án.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
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
        ) : data.socialReports.length ? <div className="mt-5 grid gap-4">
          {data.socialReports.map((report) => (
            <article key={report.projectId} className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-950">{report.projectName}</h3>
                  <p className="text-sm text-slate-500">{[report.pageEnabled ? "Facebook Page" : "", report.adsEnabled ? "Facebook Ads" : ""].filter(Boolean).join(" + ")}</p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {report.pageEnabled ? (
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <strong>Page: {report.pageName || report.pageExternalId || "Chưa chọn"}</strong>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Page</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <MiniMetric label="Reach" value={report.pageTotals.reach} />
                      <MiniMetric label="Impression" value={report.pageTotals.impressions} />
                      <MiniMetric label="Engagement" value={report.pageTotals.engagements} />
                    </div>
                    <PortalPageChart data={report.pageDaily} />
                    {report.posts.length ? (
                      <div className="mt-4 space-y-2">
                        {report.posts.map((post) => (
                          <a key={`${post.pageExternalId}-${post.publishedAt?.toString() || post.caption}`} href={post.permalinkUrl || "#"} className="block rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700" target="_blank" rel="noreferrer">
                            <span className="line-clamp-2">{post.caption || "Bài viết Facebook"}</span>
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {report.adsEnabled ? (
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <strong>Ads: {report.adAccountName || report.adAccountExternalId || "Chưa chọn account"}</strong>
                      <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">Ads</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <MiniMetric label="Spend" value={formatCurrency(report.adsTotals.spend)} />
                      <MiniMetric label="Reach" value={report.adsTotals.reach} />
                      <MiniMetric label="Lead" value={report.adsTotals.leads} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <MiniMetric label="Click" value={report.adsTotals.clicks} />
                      <MiniMetric label="Impression" value={report.adsTotals.impressions} />
                    </div>
                    <PortalAdsChart data={report.adsDaily} />
                    <p className="mt-3 text-xs text-slate-500">{report.adIds.length ? `${report.adIds.length} Ads ID` : "Lấy toàn bộ Ads đã đồng bộ trong Ad Account"} · {report.campaignIds.length} Campaign ID</p>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div> : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            Chưa có nguồn Facebook nào cho portal này. Cần gán dự án cho khách hàng <strong>{data.contact.email}</strong>, rồi vào Sửa dự án tick Facebook Page hoặc Facebook Ads.
          </div>
        )}
      </section>
    </PortalShell>
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

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-white p-3">
      <span className="text-xs text-slate-500">{label}</span>
      <strong className="mt-1 block text-slate-950">{typeof value === "number" ? value.toLocaleString("vi-VN") : value}</strong>
    </div>
  );
}
