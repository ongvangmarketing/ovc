import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/require-auth";
import { CRMDashboardClient } from "@/modules/crm/components/crm-dashboard-client";

export const metadata: Metadata = { title: "Tổng quan CRM" };

// Mock data generator for sparklines (7 days)
const generateMockChartData = (baseValue: number, volatility: number = 0.2) => {
  return Array.from({ length: 7 }).map((_, i) => ({
    name: `Day ${i + 1}`,
    value: Math.max(0, baseValue + (Math.random() * 2 - 1) * baseValue * volatility)
  }));
};

import { CrmDashboardService } from "@/modules/crm/services/dashboard.service";

export default async function CRMPage() {
  const session = await requireAuth();
  const orgId = session.organizationId;

  const dashboardData = await CrmDashboardService.getDashboardData(orgId);

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans pb-20 animate-in fade-in duration-300">
      <CRMDashboardClient data={dashboardData} />
    </div>
  );
}
