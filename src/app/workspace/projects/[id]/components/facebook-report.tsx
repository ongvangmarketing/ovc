import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import { ChartEmpty, ReportMetric, SourceRow } from "./common/stat-card";
import type { ProjectLite } from "../project-detail.types";

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function buildReportInsights(report: NonNullable<ProjectLite["facebookProjectReport"]>) {
  const insights: string[] = [];
  const pageRows = report.diagnostics?.pageInsightRows || 0;
  const postRows = report.diagnostics?.pagePostRows || 0;
  const adRows = report.diagnostics?.adInsightRows || 0;

  if (report.pageEnabled) {
    if (!pageRows && !postRows) {
      insights.push("Page đang bật nhưng chưa có dữ liệu Page insight hoặc bài viết đã đồng bộ trong 30 ngày. Thường là chưa bấm đồng bộ Page, token thiếu quyền pages_read_engagement, hoặc Page chưa có dữ liệu trong khoảng lọc.");
    } else {
      insights.push(`Page đã có ${pageRows} dòng insight và ${postRows} bài viết. Engagement hiện là ${report.pageTotals.engagements.toLocaleString("vi-VN")}, reach ${report.pageTotals.reach.toLocaleString("vi-VN")}.`);
    }
  }

  if (report.adsEnabled) {
    const cpl = report.adsTotals.leads ? report.adsTotals.spend / report.adsTotals.leads : 0;
    const ctr = report.adsTotals.impressions ? (report.adsTotals.clicks / report.adsTotals.impressions) * 100 : 0;
    if (!adRows) {
      insights.push("Ads đang bật nhưng chưa có dòng insight trong khoảng lọc. Kiểm tra lại Ad Account/Ads ID hoặc chạy đồng bộ Facebook Ads.");
    } else {
      insights.push(`Ads có ${adRows} dòng insight, ${report.adsTotals.leads.toLocaleString("vi-VN")} lead, CTR ${ctr.toFixed(2)}%${cpl ? `, CPL khoảng ${formatMoney(cpl)}` : ""}.`);
    }
  }

  if (!insights.length) {
    insights.push("Chưa có nguồn dữ liệu để phân tích. Vào Sửa dự án để bật Page hoặc Ads.");
  }

  return insights;
}

export function FacebookReport({
  project,
  reportSource,
  reportRange,
  readOnly,
  setReportSource,
  setReportRange,
}: {
  project: ProjectLite;
  reportSource: "all" | "page" | "ads";
  reportRange: 7 | 14 | 30;
  readOnly: boolean;
  setReportSource: (val: "all" | "page" | "ads") => void;
  setReportRange: (val: 7 | 14 | 30) => void;
}) {
  const facebookReport = project.facebookProjectReport;
  const pageChartData = (facebookReport?.pageDaily || []).slice(-reportRange);
  const adsChartData = (facebookReport?.adsDaily || []).slice(-reportRange);
  const reportInsights = facebookReport ? buildReportInsights(facebookReport) : [];

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="card-base p-5">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-foreground">Báo cáo Facebook của dự án</h3>
            <p className="mt-1 text-sm text-muted-foreground">Dữ liệu lấy theo nguồn đã tick trong phần Sửa dự án.</p>
          </div>
          {!readOnly ? <Link href={`/workspace/projects/${project.id}/edit`} className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">Cấu hình nguồn</Link> : null}
        </div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/20 p-3">
          <div className="flex rounded-xl bg-white p-1 shadow-sm">
            {(["all", "page", "ads"] as const).map((source) => (
              <button
                key={source}
                type="button"
                onClick={() => setReportSource(source)}
                className={cn("rounded-lg px-3 py-2 text-sm font-medium transition", reportSource === source ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
              >
                {source === "all" ? "Tất cả" : source === "page" ? "Page" : "Ads"}
              </button>
            ))}
          </div>
          <div className="flex rounded-xl bg-white p-1 shadow-sm">
            {([7, 14, 30] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setReportRange(range)}
                className={cn("rounded-lg px-3 py-2 text-sm font-medium transition", reportRange === range ? "bg-slate-900 text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
              >
                {range} ngày
              </button>
            ))}
          </div>
        </div>

        {!facebookReport?.pageEnabled && !facebookReport?.adsEnabled ? (
          <div className="empty-state">
            <BarChart3 className="h-10 w-10 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-foreground">Chưa bật nguồn report</h3>
              <p className="mt-1 text-sm text-muted-foreground">Vào Sửa dự án để tick Facebook Page hoặc Facebook Ads.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
            {facebookReport.pageEnabled && reportSource !== "ads" ? (
              <section className="rounded-2xl border border-border bg-muted/20 p-4">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-foreground">Facebook Page</h4>
                    <p className="text-sm text-muted-foreground">{facebookReport.pageName || facebookReport.pageExternalId || "Chưa chọn Page"}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Page</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <ReportMetric label="Reach" value={facebookReport.pageTotals.reach} />
                  <ReportMetric label="Impression" value={facebookReport.pageTotals.impressions} />
                  <ReportMetric label="Engagement" value={facebookReport.pageTotals.engagements} />
                  <ReportMetric label="Lead" value={facebookReport.pageTotals.leads} />
                </div>
                <div className="mt-4 h-60 rounded-2xl bg-white p-3">
                  {pageChartData.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={pageChartData} margin={{ left: -18, right: 8, top: 12, bottom: 0 }}>
                        <defs>
                          <linearGradient id="pageReachFill" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.28} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
                        <YAxis tickLine={false} axisLine={false} fontSize={11} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                        <Area type="monotone" dataKey="reach" stroke="#3b82f6" fill="url(#pageReachFill)" strokeWidth={2} name="Reach" />
                        <Area type="monotone" dataKey="engagements" stroke="#10b981" fill="transparent" strokeWidth={2} name="Engagement" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <ChartEmpty message="Chưa có dữ liệu Page insight trong khoảng lọc." />
                  )}
                </div>
                <div className="mt-4 space-y-2">
                  {facebookReport.posts.map((post) => (
                    <a key={post.id} href={post.permalinkUrl || "#"} target="_blank" rel="noreferrer" className="block rounded-xl border border-border bg-white p-3 text-sm hover:bg-muted/40">
                      <span className="line-clamp-2 font-medium text-foreground">{post.caption || "Bài viết Facebook"}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{post.publishedAt ? formatDate(post.publishedAt as Date) : "Chưa rõ ngày"}</span>
                    </a>
                  ))}
                  {!facebookReport.posts.length ? <p className="rounded-xl bg-white p-3 text-sm text-muted-foreground">Chưa có bài viết đã đồng bộ.</p> : null}
                </div>
              </section>
            ) : null}

            {facebookReport.adsEnabled && reportSource !== "page" ? (
              <section className="rounded-2xl border border-border bg-muted/20 p-4">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-foreground">Facebook Ads</h4>
                    <p className="text-sm text-muted-foreground">
                      {facebookReport.adAccountName || facebookReport.adAccountExternalId || "Chưa chọn Ad Account"} · {facebookReport.campaignIds.length} campaign, {facebookReport.adIds.length} ads
                    </p>
                  </div>
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">Ads</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <ReportMetric label="Chi tiêu" value={formatMoney(facebookReport.adsTotals.spend)} />
                  <ReportMetric label="Reach" value={facebookReport.adsTotals.reach} />
                  <ReportMetric label="Click" value={facebookReport.adsTotals.clicks} />
                  <ReportMetric label="Lead" value={facebookReport.adsTotals.leads} />
                  <ReportMetric label="Impression" value={facebookReport.adsTotals.impressions} className="col-span-2" />
                </div>
                <div className="mt-4 h-60 rounded-2xl bg-white p-3">
                  {adsChartData.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={adsChartData} margin={{ left: -18, right: 8, top: 12, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
                        <YAxis tickLine={false} axisLine={false} fontSize={11} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} formatter={(value: any, name: any) => name === "spend" ? formatMoney(Number(value)) : Number(value).toLocaleString("vi-VN")} />
                        <Bar dataKey="spend" name="Chi tiêu" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="leads" name="Lead" fill="#10b981" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ChartEmpty message="Chưa có dữ liệu Ads trong khoảng lọc." />
                  )}
                </div>
              </section>
            ) : null}
            </div>
            <section className="rounded-2xl border border-border bg-white p-4">
              <h4 className="mb-3 font-semibold text-foreground">Phân tích nhanh</h4>
              <div className="grid gap-3 md:grid-cols-2">
                {reportInsights.map((item) => (
                  <div key={item} className="rounded-xl bg-muted/40 p-3 text-sm leading-6 text-muted-foreground">{item}</div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      <aside className="card-base p-5">
        <h3 className="mb-4 font-bold text-foreground">Nguồn đang bật</h3>
        <div className="space-y-3">
          <SourceRow label="Facebook Page" active={Boolean(facebookReport?.pageEnabled)} />
          <SourceRow label="Facebook Ads" active={Boolean(facebookReport?.adsEnabled)} />
        </div>
      </aside>
    </div>
  );
}
