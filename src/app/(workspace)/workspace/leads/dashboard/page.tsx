import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/require-auth";
import { LeadService } from "@/modules/leads/services/lead.service";
import { LeadDashboardClient } from "./dashboard-client";

export const metadata: Metadata = { title: "Báo cáo Leads | Vercel UI" };

export default async function LeadDashboardPage() {
  const session = await requireAuth();
  const orgId = session.organizationId;

  const leads = await LeadService.getLeadsDataForDashboard(orgId);

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
    { name: "Tổng số", value: totalValid, fill: "#000000" },
    { name: "Đã liên hệ", value: touched, fill: "#333333" },
    { name: "Đánh giá", value: qualified, fill: "#666666" },
    { name: "Đã chốt", value: converted, fill: "#999999" }
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
    { name: "0-10đ", value: score0_10 },
    { name: "11-20đ", value: score11_20 },
    { name: "21-40đ", value: score21_40 },
    { name: ">40đ", value: score40_plus },
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
    <div className="min-h-screen bg-[#fafafa] text-black font-sans pb-20 animate-in fade-in duration-300">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-8">
        
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase w-fit">
              Thống kê
            </span>
          </div>
          <h1 className="text-[32px] md:text-[44px] tracking-tight leading-[1.15] font-medium">
            <span className="text-black">Hiệu suất</span>{" "}
            <span className="text-gray-400">nguồn Lead.</span>
          </h1>
          <p className="text-[15px] text-gray-500 leading-relaxed mt-5 max-w-2xl">
            Tổng quan phễu dữ liệu, tỷ lệ chuyển đổi và đánh giá chất lượng nguồn khách hàng tiềm năng.
          </p>
        </div>

        <div>
          <LeadDashboardClient 
            funnelData={funnelData} 
            scoreData={scoreData} 
            sourceData={sourceData} 
            totalLeads={totalLeads}
          />
        </div>
      </div>
    </div>
  );
}
