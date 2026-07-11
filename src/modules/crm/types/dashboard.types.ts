export interface CrmQuickStats {
  conversionRate: number;
  thisMonthRevenue: number;
  revenueGrowth: number;
  avgValue: number;
  avgClosingTime: number;
  chartData: {
    conversion: any[];
    revenue: any[];
    expected: any[];
    avgValue: any[];
    closingTime: any[];
  };
}

export interface CrmDashboardData {
  totalCustomers: number;
  customerGrowth: number;
  totalCompanies: number;
  companyGrowth: number;
  totalOpenDeals: number;
  dealGrowth: number;
  expectedValue: number;
  expectedValueGrowth: number;
  closingSoonDeals: any[]; // Ideally mapped to specific Deal list type
  recentDeals: any[];
  recentActivities: any[];
  quickStats: CrmQuickStats;
}
