"use client";

import { useMemo, useState } from "react";

import { PortalAdsChart, PortalPageChart } from "./social-report-charts";

type SocialReport = {
  projectId: string;
  projectName: string;
  pageEnabled: boolean;
  adsEnabled: boolean;
  pageName?: string | null;
  pageExternalId?: string | null;
  adAccountName?: string | null;
  adAccountExternalId?: string | null;
  campaignIds: string[];
  adIds: string[];
  pageTotals: { reach: number; impressions: number; engagements: number };
  adsTotals: { spend: number; reach: number; impressions: number; clicks: number; leads: number };
  pageDaily: Array<{ date: string; reach: number; impressions: number; engagements: number; leads: number }>;
  adsDaily: Array<{ date: string; spend: number; reach: number; impressions: number; clicks: number; leads: number }>;
  posts: Array<{ pageExternalId?: string | null; publishedAt?: Date | string | null; caption?: string | null; permalinkUrl?: string | null }>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-white p-3">
      <span className="text-xs text-slate-500">{label}</span>
      <strong className="mt-1 block text-slate-950">{typeof value === "number" ? value.toLocaleString("vi-VN") : value}</strong>
    </div>
  );
}

export function PortalReportsTabs({ reports }: { reports: SocialReport[] }) {
  const [activeTab, setActiveTab] = useState<"page" | "ads">("page");
  const pageReports = useMemo(() => reports.filter((report) => report.pageEnabled), [reports]);
  const adsReports = useMemo(() => reports.filter((report) => report.adsEnabled), [reports]);
  const activeReports = activeTab === "page" ? pageReports : adsReports;

  return (
    <div className="mt-5">
      <nav className="portal-finance-tabs" aria-label="Loại report">
        <button type="button" className={activeTab === "page" ? "active" : ""} onClick={() => setActiveTab("page")}>
          Page Report <span>{pageReports.length}</span>
        </button>
        <button type="button" className={activeTab === "ads" ? "active" : ""} onClick={() => setActiveTab("ads")}>
          Ads Report <span>{adsReports.length}</span>
        </button>
      </nav>

      <div className="mt-4 grid gap-4">
        {activeReports.map((report) => (
          <article key={`${activeTab}-${report.projectId}`} className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-950">{report.projectName}</h3>
                <p className="text-sm text-slate-500">{activeTab === "page" ? "Facebook Page" : "Facebook Ads"}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${activeTab === "page" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>
                {activeTab === "page" ? "Page" : "Ads"}
              </span>
            </div>

            {activeTab === "page" ? (
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="mb-3">
                  <strong>Page: {report.pageName || report.pageExternalId || "Chưa chọn"}</strong>
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
            ) : (
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="mb-3">
                  <strong>Ads: {report.adAccountName || report.adAccountExternalId || "Chưa chọn account"}</strong>
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
            )}
          </article>
        ))}
        {!activeReports.length ? <div className="quote-detail-empty">Chưa có dữ liệu {activeTab === "page" ? "Page" : "Ads"}.</div> : null}
      </div>
    </div>
  );
}
