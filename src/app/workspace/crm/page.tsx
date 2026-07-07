import type { Metadata } from "next";
import { db } from "@/lib/db";
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

export default async function CRMPage() {
  const session = await requireAuth();
  const orgId = session.organizationId;

  // Get current date and 30 days ago for growth calculation
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Fetch counts
  const [
    totalCustomers,
    totalCompanies,
    totalOpenDeals,
    dealStats,
    
    // Last month stats for growth
    lastMonthCustomers,
    lastMonthCompanies,
    lastMonthOpenDeals,
    lastMonthDealStats,
    
    // For quick stats
    totalWonDeals,
    allDealsCount,
    thisMonthWonStats,
    lastMonthWonStats
  ] = await Promise.all([
    db.contact.count({ where: { organizationId: orgId, type: "CUSTOMER" } }),
    db.contact.count({ where: { organizationId: orgId, type: "LEAD" } }),
    db.deal.count({ where: { organizationId: orgId, status: "OPEN" } }),
    db.deal.aggregate({
      where: { organizationId: orgId, status: "OPEN" },
      _sum: { value: true }
    }),
    
    db.contact.count({ where: { organizationId: orgId, type: "CUSTOMER", createdAt: { lt: thirtyDaysAgo } } }),
    db.contact.count({ where: { organizationId: orgId, type: "LEAD", createdAt: { lt: thirtyDaysAgo } } }),
    db.deal.count({ where: { organizationId: orgId, status: "OPEN", createdAt: { lt: thirtyDaysAgo } } }),
    db.deal.aggregate({
      where: { organizationId: orgId, status: "OPEN", createdAt: { lt: thirtyDaysAgo } },
      _sum: { value: true }
    }),
    
    db.deal.count({ where: { organizationId: orgId, status: "WON" } }),
    db.deal.count({ where: { organizationId: orgId } }),
    db.deal.aggregate({
      where: { organizationId: orgId, status: "WON", createdAt: { gte: thirtyDaysAgo } },
      _sum: { value: true }
    }),
    db.deal.aggregate({
      where: { organizationId: orgId, status: "WON", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      _sum: { value: true }
    })
  ]);

  const expectedValue = dealStats._sum.value?.toNumber() || 0;
  const lastMonthExpectedValue = lastMonthDealStats._sum.value?.toNumber() || 0;
  
  // Calculate growth percentages
  const calcGrowth = (current: number, past: number) => past === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - past) / past) * 100);

  const customerGrowth = calcGrowth(totalCustomers, lastMonthCustomers);
  const companyGrowth = calcGrowth(totalCompanies, lastMonthCompanies);
  const dealGrowth = calcGrowth(totalOpenDeals, lastMonthOpenDeals);
  const expectedValueGrowth = calcGrowth(expectedValue, lastMonthExpectedValue);

  // Fetch lists
  const [closingSoonDeals, recentDeals, recentActivities] = await Promise.all([
    db.deal.findMany({
      where: { 
        organizationId: orgId, 
        status: "OPEN",
        expectedClose: { not: null, gte: now }
      },
      orderBy: { expectedClose: "asc" },
      take: 4,
      include: { contact: true, company: true }
    }),
    db.deal.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { contact: true, company: true }
    }),
    db.contactActivity.findMany({
      where: { contact: { organizationId: orgId } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { contact: true }
    })
  ]);

  // Calculate quick stats
  const conversionRate = allDealsCount > 0 ? Math.round((totalWonDeals / allDealsCount) * 100) : 0;
  const thisMonthRevenue = thisMonthWonStats._sum.value?.toNumber() || 0;
  const lastMonthRevenue = lastMonthWonStats._sum.value?.toNumber() || 0;
  const revenueGrowth = calcGrowth(thisMonthRevenue, lastMonthRevenue);
  
  const avgValue = allDealsCount > 0 ? Math.round((expectedValue + thisMonthRevenue) / allDealsCount) : 65000000;
  const avgClosingTime = 45; // Mock data as it requires complex query to diff closedAt - createdAt

  const dashboardData = {
    totalCustomers,
    customerGrowth,
    totalCompanies,
    companyGrowth,
    totalOpenDeals,
    dealGrowth,
    expectedValue,
    expectedValueGrowth,
    closingSoonDeals: JSON.parse(JSON.stringify(closingSoonDeals)),
    recentDeals: JSON.parse(JSON.stringify(recentDeals)),
    recentActivities: JSON.parse(JSON.stringify(recentActivities)),
    quickStats: {
      conversionRate,
      thisMonthRevenue,
      revenueGrowth,
      avgValue,
      avgClosingTime,
      chartData: {
        conversion: generateMockChartData(conversionRate, 0.1),
        revenue: generateMockChartData(thisMonthRevenue, 0.3),
        expected: generateMockChartData(expectedValue, 0.2),
        avgValue: generateMockChartData(avgValue, 0.1),
        closingTime: generateMockChartData(avgClosingTime, 0.05),
      }
    }
  };

  return (
    <div className="crm-dashboard">
      <CRMDashboardClient data={dashboardData} />
    </div>
  );
}
