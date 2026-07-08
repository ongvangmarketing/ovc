"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="flex flex-col border-l border-[#eaeaea] pl-4 py-1">
      <span className="text-[12px] font-medium text-gray-500">{label}</span>
      <strong className="mt-1 text-[20px] font-medium tracking-tight text-black leading-none">
        {typeof value === "number" ? value.toLocaleString("vi-VN") : value}
      </strong>
    </div>
  );
}

export function PortalReportsTabs({ reports }: { reports: SocialReport[] }) {
  const [activeTab, setActiveTab] = useState<"page" | "ads">("page");
  const pageReports = useMemo(() => reports.filter((report) => report.pageEnabled), [reports]);
  const adsReports = useMemo(() => reports.filter((report) => report.adsEnabled), [reports]);
  const activeReports = activeTab === "page" ? pageReports : adsReports;

  return (
    <div className="mt-2 font-sans">
      <nav className="flex items-center gap-6 border-b border-[#eaeaea] mb-8" aria-label="Loại report">
        <button 
          type="button" 
          className={cn(
            "pb-3 text-[14px] font-medium transition-colors relative",
            activeTab === "page" ? "text-black" : "text-gray-500 hover:text-black"
          )} 
          onClick={() => setActiveTab("page")}
        >
          Page Report <span className="ml-1.5 inline-flex h-5 items-center justify-center rounded-full bg-gray-100 px-2 text-[11px] text-gray-600">{pageReports.length}</span>
          {activeTab === "page" && (
            <motion.div layoutId="reports-tab-indicator" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-black rounded-t-full" />
          )}
        </button>
        <button 
          type="button" 
          className={cn(
            "pb-3 text-[14px] font-medium transition-colors relative",
            activeTab === "ads" ? "text-black" : "text-gray-500 hover:text-black"
          )} 
          onClick={() => setActiveTab("ads")}
        >
          Ads Report <span className="ml-1.5 inline-flex h-5 items-center justify-center rounded-full bg-gray-100 px-2 text-[11px] text-gray-600">{adsReports.length}</span>
          {activeTab === "ads" && (
            <motion.div layoutId="reports-tab-indicator" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-black rounded-t-full" />
          )}
        </button>
      </nav>

      <div className="grid gap-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid gap-6"
          >
        {activeReports.map((report) => (
          <article key={`${activeTab}-${report.projectId}`} className="rounded-xl border border-[#eaeaea] bg-white overflow-hidden shadow-sm">
            
            {/* Header of Report Card */}
            <div className="border-b border-[#eaeaea] bg-gray-50/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-[16px] font-medium tracking-tight text-black flex items-center gap-2">
                  {report.projectName}
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                    activeTab === "page" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                  )}>
                    {activeTab === "page" ? "Page" : "Ads"}
                  </span>
                </h3>
                <p className="text-[13px] text-gray-500 mt-1">
                  {activeTab === "page" ? `Page: ${report.pageName || report.pageExternalId || "Chưa chọn"}` : `Account: ${report.adAccountName || report.adAccountExternalId || "Chưa chọn"}`}
                </p>
              </div>
            </div>

            {activeTab === "page" ? (
              <div className="p-6">
                <div className="flex flex-wrap gap-x-8 gap-y-6 mb-8">
                  <MiniMetric label="Reach" value={report.pageTotals.reach} />
                  <MiniMetric label="Impressions" value={report.pageTotals.impressions} />
                  <MiniMetric label="Engagements" value={report.pageTotals.engagements} />
                </div>
                
                <div className="h-64 w-full mb-8">
                  <PortalPageChart data={report.pageDaily} />
                </div>
                
                {report.posts.length ? (
                  <div>
                    <h4 className="text-[14px] font-medium text-black mb-3 border-b border-[#eaeaea] pb-2">Top Bài Viết</h4>
                    <div className="space-y-2">
                      {report.posts.map((post) => (
                        <a key={`${post.pageExternalId}-${post.publishedAt?.toString() || post.caption}`} href={post.permalinkUrl || "#"} className="block group rounded-md p-3 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors" target="_blank" rel="noreferrer">
                          <span className="line-clamp-2 group-hover:text-black transition-colors">{post.caption || "Bài viết Facebook"}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="p-6">
                <div className="flex flex-wrap gap-x-8 gap-y-6 mb-8">
                  <MiniMetric label="Total Spend" value={formatCurrency(report.adsTotals.spend)} />
                  <MiniMetric label="Leads" value={report.adsTotals.leads} />
                  <MiniMetric label="Reach" value={report.adsTotals.reach} />
                  <MiniMetric label="Impressions" value={report.adsTotals.impressions} />
                  <MiniMetric label="Clicks" value={report.adsTotals.clicks} />
                </div>
                
                <div className="h-64 w-full mb-6">
                  <PortalAdsChart data={report.adsDaily} />
                </div>
                
                <div className="border-t border-[#eaeaea] pt-4 mt-2">
                  <p className="text-[12px] font-medium text-gray-500 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-orange-400"></span>
                    {report.adIds.length ? `${report.adIds.length} Ads ID` : "Toàn bộ Ads trong tài khoản"} 
                    <span className="text-gray-300">/</span> 
                    {report.campaignIds.length} Campaigns
                  </p>
                </div>
              </div>
            )}
          </article>
        ))}
        {!activeReports.length ? (
          <div className="rounded-md border border-dashed border-[#eaeaea] bg-gray-50 p-8 text-center">
            <p className="text-[14px] text-gray-500 font-medium">Chưa có dữ liệu {activeTab === "page" ? "Page Report" : "Ads Report"}.</p>
          </div>
        ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
