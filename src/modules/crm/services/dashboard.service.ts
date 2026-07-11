import { CrmDashboardRepository } from "../repositories/dashboard.repository";
import { CrmDashboardData } from "../types/dashboard.types";

// Mock data generator for sparklines (7 days)
const generateMockChartData = (baseValue: number, volatility: number = 0.2) => {
  return Array.from({ length: 7 }).map((_, i) => ({
    name: `Day ${i + 1}`,
    value: Math.max(0, baseValue + (Math.random() * 2 - 1) * baseValue * volatility)
  }));
};

export class CrmDashboardService {
  static getAIContext(orgId: string) {
    return CrmDashboardRepository.getAIContext(orgId, new Date());
  }

  static async getDashboardData(orgId: string): Promise<CrmDashboardData> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      totalCustomers,
      totalCompanies,
      totalOpenDeals,
      dealStats,
      lastMonthCustomers,
      lastMonthCompanies,
      lastMonthOpenDeals,
      lastMonthDealStats,
      totalWonDeals,
      allDealsCount,
      thisMonthWonStats,
      lastMonthWonStats
    ] = await CrmDashboardRepository.getDashboardCounts(orgId, thirtyDaysAgo, sixtyDaysAgo);

    const expectedValue = dealStats._sum.value?.toNumber() || 0;
    const lastMonthExpectedValue = lastMonthDealStats._sum.value?.toNumber() || 0;
    
    // Calculate growth percentages
    const calcGrowth = (current: number, past: number) => past === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - past) / past) * 100);

    const customerGrowth = calcGrowth(totalCustomers, lastMonthCustomers);
    const companyGrowth = calcGrowth(totalCompanies, lastMonthCompanies);
    const dealGrowth = calcGrowth(totalOpenDeals, lastMonthOpenDeals);
    const expectedValueGrowth = calcGrowth(expectedValue, lastMonthExpectedValue);

    const [closingSoonDeals, recentDeals, recentActivities] = await CrmDashboardRepository.getDashboardLists(orgId, now);

    // Calculate quick stats
    const conversionRate = allDealsCount > 0 ? Math.round((totalWonDeals / allDealsCount) * 100) : 0;
    const thisMonthRevenue = thisMonthWonStats._sum.value?.toNumber() || 0;
    const lastMonthRevenue = lastMonthWonStats._sum.value?.toNumber() || 0;
    const revenueGrowth = calcGrowth(thisMonthRevenue, lastMonthRevenue);
    
    const avgValue = allDealsCount > 0 ? Math.round((expectedValue + thisMonthRevenue) / allDealsCount) : 65000000;
    const avgClosingTime = 45; // Mock data

    return {
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
  }
}
