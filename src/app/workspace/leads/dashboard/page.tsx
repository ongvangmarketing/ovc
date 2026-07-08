import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { LeadDashboardClient } from "./dashboard-client";
import { Activity } from "lucide-react";

export const metadata: Metadata = { title: "Tổng quan Lead" };

export default async function LeadDashboardPage() {
  const session = await requireAuth();
  const orgId = session.organizationId;

  const leads = await db.lead.findMany({
    where: { organizationId: orgId },
    select: { status: true, score: true, utmSource: true }
  });

  const totalLeads = leads.length;
  
  // Calculate Funnel Metrics
  const statusCount = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const newCount = statusCount['NEW'] || 0;
  const contactedCount = statusCount['CONTACTED'] || 0;
  const qualifiedCount = statusCount['QUALIFIED'] || 0;
  const convertedCount = statusCount['CONVERTED'] || 0;
  const spamCount = statusCount['SPAM'] || 0;
  const duplicateCount = statusCount['DUPLICATE'] || 0;

  // Funnel needs to be descending. We'll simulate progression:
  // Step 1: All raw leads (excluding spam/duplicate)
  const totalValid = newCount + contactedCount + qualifiedCount + convertedCount;
  // Step 2: Leads that have been touched (contacted + qualified + converted)
  const touched = contactedCount + qualifiedCount + convertedCount;
  // Step 3: Qualified (qualified + converted)
  const qualified = qualifiedCount + convertedCount;
  // Step 4: Converted
  const converted = convertedCount;

  const funnelData = [
    { name: "Tổng số (Đã lọc Spam)", value: totalValid, fill: "#6366f1" },
    { name: "Đã liên hệ", value: touched, fill: "#8b5cf6" },
    { name: "Đánh giá Tiềm năng", value: qualified, fill: "#d946ef" },
    { name: "Đã Chuyển đổi", value: converted, fill: "#10b981" }
  ].filter(d => d.value > 0).sort((a, b) => b.value - a.value);

  // Calculate Score Distribution
  let score0_10 = 0, score11_20 = 0, score21_40 = 0, score40_plus = 0;
  leads.forEach(l => {
    if (l.score <= 10) score0_10++;
    else if (l.score <= 20) score11_20++;
    else if (l.score <= 40) score21_40++;
    else score40_plus++;
  });

  const scoreData = [
    { name: "0-10đ (Lạnh)", value: score0_10 },
    { name: "11-20đ (Ấm)", value: score11_20 },
    { name: "21-40đ (Nóng)", value: score21_40 },
    { name: ">40đ (Chốt ngay)", value: score40_plus },
  ];

  // Calculate Source Distribution
  const sourceCount = leads.reduce((acc, lead) => {
    let source = lead.utmSource || "Thủ công / Khác";
    if (source.length > 20) source = source.substring(0, 20) + "..."; // truncate long source names
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sourceData = Object.entries(sourceCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // top 5 sources

  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-[15px] font-medium text-gray-950 flex items-center gap-2">
          <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center border border-indigo-200">
            <Activity className="h-5 w-5 text-indigo-700" />
          </div>
          Báo cáo & Phân tích Leads
        </h1>
      </div>

      <LeadDashboardClient 
        funnelData={funnelData} 
        scoreData={scoreData} 
        sourceData={sourceData} 
        totalLeads={totalLeads}
      />
    </div>
  );
}
