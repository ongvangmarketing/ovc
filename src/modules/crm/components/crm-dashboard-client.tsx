"use client";

import Link from "next/link";
import { 
  Users, Target, Briefcase, CircleDollarSign, 
  ArrowRight, Clock, Activity, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown,
  Inbox
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { 
  LineChart, Line
} from "recharts";

type SparklinePoint = {
  name: string;
  value: number;
};

type DealSummary = {
  id: string;
  title: string;
  status: string;
  value: number | string;
  currency: string;
  createdAt: string | Date;
  expectedClose?: string | Date | null;
  company?: { name?: string | null } | null;
  contact?: { firstName?: string | null } | null;
};

type ActivitySummary = {
  id: string;
  type: string;
  subject?: string | null;
  createdAt: string | Date;
};

type DashboardData = {
  totalCustomers: number;
  customerGrowth: number;
  totalCompanies: number;
  companyGrowth: number;
  totalOpenDeals: number;
  dealGrowth: number;
  expectedValue: number;
  expectedValueGrowth: number;
  closingSoonDeals: DealSummary[];
  recentDeals: DealSummary[];
  recentActivities: ActivitySummary[];
  quickStats: {
    conversionRate: number;
    thisMonthRevenue: number;
    revenueGrowth: number;
    avgValue: number;
    avgClosingTime: number;
    chartData: {
      conversion: SparklinePoint[];
      revenue: SparklinePoint[];
      expected: SparklinePoint[];
      avgValue: SparklinePoint[];
      closingTime: SparklinePoint[];
    }
  }
};

export function CRMDashboardClient({ data }: { data: DashboardData }) {
  const itemsPerPage = 4;
  
  const paginatedDeals = data.recentDeals.slice(0, itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-black';
      case 'WON': return 'bg-emerald-500';
      case 'LOST': return 'bg-red-500';
      case 'ON_HOLD': return 'bg-gray-400';
      default: return 'bg-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Đang mở';
      case 'WON': return 'Thành công';
      case 'LOST': return 'Thất bại';
      case 'ON_HOLD': return 'Tạm dừng';
      default: return status;
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase w-fit">
              CRM Analytics
            </span>
          </div>
          <h1 className="text-[32px] md:text-[44px] tracking-tight leading-[1.15] font-medium">
            <span className="text-black">Hiệu suất</span>{" "}
            <span className="text-gray-400">CRM.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-gray-500">
            Theo dõi pipeline, giá trị cơ hội và hoạt động chăm sóc khách hàng trong một giao diện gọn, rõ và tập trung vào dữ liệu.
          </p>
        </div>
        <Link href="/workspace/crm/deals/new" className="inline-flex h-10 items-center justify-center rounded-md bg-black px-5 text-[14px] font-medium text-white transition-colors hover:bg-gray-800">
          <span className="mr-2 text-[17px] leading-none">+</span> Tạo cơ hội
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Link href="/workspace/crm/contacts" className="block">
          <StatCard
            title="Tổng Khách hàng"
            value={data.totalCustomers}
            subtitle="Tất cả khách hàng (Customer)"
            growth={data.customerGrowth}
            icon={<Users className="h-4 w-4" />}
          />
        </Link>
        <Link href="/workspace/crm/companies" className="block">
          <StatCard
            title="Tổng Doanh nghiệp"
            value={data.totalCompanies}
            subtitle="Tất cả đối tác (Company)"
            growth={data.companyGrowth}
            icon={<Target className="h-4 w-4" />}
          />
        </Link>
        <Link href="/workspace/crm/deals" className="block">
          <StatCard
            title="Cơ hội đang mở"
            value={data.totalOpenDeals}
            subtitle="Pipeline hiện tại"
            growth={data.dealGrowth}
            icon={<Target className="h-4 w-4" />}
          />
        </Link>
        <Link href="/workspace/crm/deals" className="block">
          <StatCard
            title="Giá trị dự kiến (Mở)"
            value={`${formatCurrency(data.expectedValue, "VND")}`}
            subtitle="Tổng ngân sách"
            growth={data.expectedValueGrowth}
            icon={<CircleDollarSign className="h-4 w-4" />}
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left Column (2/3) */}
        <div className="flex flex-col gap-6 xl:col-span-2">
          
          {/* Closing Soon */}
          <section className="flex min-h-[220px] flex-col overflow-hidden rounded-2xl border border-[#eaeaea] bg-white">
            <div className="flex items-center justify-between gap-4 border-b border-[#eaeaea] px-5 py-4">
              <h2 className="flex items-center gap-2 text-[13px] font-medium text-black">
                <Clock className="h-4 w-4 text-gray-500" />
                Cơ hội sắp chốt (Closing Soon)
              </h2>
              <Link href="/workspace/crm/deals" className="inline-flex items-center gap-1 rounded-full border border-[#eaeaea] bg-white px-3 py-1 text-[11px] font-medium text-black transition-colors hover:bg-gray-50">
                Xem tất cả <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex-1 flex flex-col">
              {data.closingSoonDeals.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-[#eaeaea] bg-white">
                    <Inbox className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="text-[13px] font-medium text-black">Không có cơ hội nào sắp chốt</div>
                  <div className="mt-1 text-[12px] text-gray-500">Hiện tại chưa có cơ hội nào trong giai đoạn sắp chốt.</div>
                </div>
              ) : (
                <div className="divide-y divide-[#eaeaea]">
                  {data.closingSoonDeals.map(deal => (
                    <div key={deal.id} className="flex flex-col justify-between gap-3 px-5 py-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center">
                      <div className="flex-1 min-w-0">
                        <Link href={`/workspace/crm/deals/${deal.id}`} className="block truncate text-[13px] font-medium text-black hover:underline">
                          {deal.title}
                        </Link>
                        <div className="mt-1 flex items-center gap-2 text-[12px] text-gray-500">
                          <span className="truncate">{deal.company?.name || deal.contact?.firstName || 'Khách lẻ'}</span>
                          <span>•</span>
                          <span className="font-medium text-black">Chốt: {deal.expectedClose ? new Date(deal.expectedClose).toLocaleDateString('vi-VN') : 'N/A'}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-[13px] font-medium text-black">
                        {formatCurrency(Number(deal.value), deal.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Recent Deals */}
          <section className="flex min-h-[300px] flex-1 flex-col overflow-hidden rounded-2xl border border-[#eaeaea] bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-[#eaeaea] px-4 py-3 sm:px-5 sm:py-4">
              <h2 className="flex items-center gap-2 text-[13px] font-medium text-black">
                <Briefcase className="h-4 w-4 text-gray-500" />
                Cơ hội mới
              </h2>
              <select className="h-9 cursor-pointer rounded-md border border-[#eaeaea] bg-white px-3 text-[12px] text-black outline-none transition-colors hover:bg-gray-50 focus:border-black focus:ring-1 focus:ring-black">
                <option>Tất cả cơ hội</option>
                <option>Đang mở</option>
              </select>
            </div>
            
            <div className="flex-1 flex flex-col">
              {data.recentDeals.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                  <div className="text-[13px] text-gray-500">Chưa có cơ hội nào</div>
                </div>
              ) : (
                <>
                  <div className="flex-1 divide-y divide-[#eaeaea]">
                    {paginatedDeals.map(deal => (
                      <div key={deal.id} className="grid gap-3 px-4 py-3 transition-colors hover:bg-gray-50 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5 sm:py-4">
                        <div className="min-w-0">
                          <div className="mb-1 flex items-center gap-2">
                            <span className={`h-2 w-2 shrink-0 rounded-full ${getStatusColor(deal.status)}`}></span>
                            <Link href={`/workspace/crm/deals/${deal.id}`} className="min-w-0 truncate text-[13px] font-medium text-black hover:underline">
                              {deal.title}
                            </Link>
                          </div>
                          <div className="ml-4 flex min-w-0 items-center gap-1.5 text-[11px] text-gray-500">
                            <span className="shrink-0">{new Date(deal.createdAt).toLocaleDateString('vi-VN')}</span>
                            <span>•</span>
                            <span className="min-w-0 truncate">{deal.company?.name || deal.contact?.firstName || 'Khách lẻ'}</span>
                          </div>
                        </div>
                        <div className="ml-4 flex items-center justify-between gap-3 sm:ml-0 sm:justify-end">
                          <span className="rounded-full border border-[#eaeaea] bg-white px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-600">
                              {getStatusLabel(deal.status)}
                            </span>
                          <div className="shrink-0 text-right text-[13px] font-medium text-black">
                            {formatCurrency(Number(deal.value), deal.currency)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination Footer */}
                  <div className="flex items-center justify-between gap-3 border-t border-[#eaeaea] bg-gray-50/50 px-4 py-3 sm:px-5">
                    <div className="text-[11px] text-gray-500">
                      {paginatedDeals.length}/{data.recentDeals.length} cơ hội
                    </div>
                    <div className="flex items-center gap-2">
                      <select className="rounded-md border border-[#eaeaea] bg-white px-1.5 py-0.5 text-[11px] outline-none">
                        <option>10 / trang</option>
                      </select>
                      <div className="flex items-center gap-1">
                        <button className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 disabled:opacity-50" disabled>
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="flex h-6 w-6 items-center justify-center rounded-md border border-black bg-black text-[12px] font-medium text-white">
                          1
                        </button>
                        <button className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 disabled:opacity-50" disabled>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>

        {/* Right Column (1/3) */}
        <div className="flex flex-col gap-6">
          
          {/* Recent Activities */}
          <section className="flex h-[220px] flex-col overflow-hidden rounded-2xl border border-[#eaeaea] bg-white">
            <div className="flex items-center justify-between gap-4 border-b border-[#eaeaea] px-5 py-4">
              <h2 className="flex items-center gap-2 text-[13px] font-medium text-black">
                <Activity className="h-4 w-4 text-gray-500" />
                Hoạt động chăm sóc
              </h2>
              <Link href="#" className="inline-flex items-center gap-1 rounded-full border border-[#eaeaea] bg-white px-3 py-1 text-[11px] font-medium text-black transition-colors hover:bg-gray-50">
                Xem tất cả <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex-1 flex flex-col">
              {data.recentActivities.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-[#eaeaea] bg-white">
                    <Activity className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="text-[13px] font-medium text-black">Chưa có hoạt động nào</div>
                  <div className="mt-1 text-[12px] text-gray-500">Các hoạt động chăm sóc khách hàng sẽ hiển thị tại đây.</div>
                </div>
              ) : (
                <div className="divide-y divide-[#eaeaea] overflow-y-auto">
                  {data.recentActivities.map(activity => (
                    <div key={activity.id} className="px-5 py-3 transition-colors hover:bg-gray-50">
                      <div className="mb-1 flex items-start justify-between">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-black">
                          {activity.type}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(activity.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="line-clamp-1 text-[12px] text-gray-600">
                        {activity.subject || 'Ghi chú cuộc gọi / họp'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Quick Overview (Sparklines) */}
          <section className="flex-1 overflow-hidden rounded-2xl border border-[#eaeaea] bg-white">
            <div className="border-b border-[#eaeaea] bg-gray-50/50 px-5 py-4">
              <h2 className="text-[13px] font-medium text-black">
                Tổng quan nhanh
              </h2>
            </div>
            <div className="space-y-1 p-3">
              <QuickStatRow 
                icon={<Target className="h-4 w-4" />}
                title="Tỷ lệ chuyển đổi"
                subtitle="Cơ hội → Thành công"
                value={`${data.quickStats.conversionRate}%`}
                chartData={data.quickStats.chartData.conversion}
                chartColor="#000000"
              />
              <QuickStatRow 
                icon={<CircleDollarSign className="h-4 w-4" />}
                title="Doanh thu tháng này"
                subtitle={<GrowthText growth={data.quickStats.revenueGrowth} />}
                value={formatCurrency(data.quickStats.thisMonthRevenue, "VND")}
                chartData={data.quickStats.chartData.revenue}
                chartColor="#000000"
              />
              <QuickStatRow 
                icon={<Briefcase className="h-4 w-4" />}
                title="Doanh thu dự kiến"
                subtitle={<GrowthText growth={data.expectedValueGrowth} />}
                value={formatCurrency(data.expectedValue, "VND")}
                chartData={data.quickStats.chartData.expected}
                chartColor="#000000"
              />
              <QuickStatRow 
                icon={<CircleDollarSign className="h-4 w-4" />}
                title="Giá trị trung bình"
                subtitle="Trên mỗi cơ hội"
                value={formatCurrency(data.quickStats.avgValue, "VND")}
                chartData={data.quickStats.chartData.avgValue}
                chartColor="#000000"
              />
              <QuickStatRow 
                icon={<Clock className="h-4 w-4" />}
                title="Thời gian chốt trung bình"
                subtitle="Từ khi tạo đến khi chốt"
                value={`${data.quickStats.avgClosingTime} ngày`}
                chartData={data.quickStats.chartData.closingTime}
                chartColor="#000000"
              />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, growth, icon }: { title: string, value: string | number, subtitle?: string, growth: number, icon: React.ReactNode }) {
  return (
    <div className="group relative h-full overflow-hidden rounded-xl border border-[#eaeaea] bg-white p-5 transition-all duration-300 hover:border-black hover:bg-[#fafafa] active:scale-[0.98]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <p className="max-w-[120px] text-[13px] font-medium leading-snug text-gray-500">{title}</p>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-black transition-colors group-hover:border-black group-hover:bg-black group-hover:text-white">
          {icon}
        </div>
      </div>
      <div className="min-w-0">
        <div className="truncate text-[24px] font-medium leading-none tracking-tight text-black">{value}</div>
        <div className="mt-4 flex items-center text-[12px] font-medium">
          <GrowthText growth={growth} />
        </div>
      </div>
    </div>
  );
}

function GrowthText({ growth }: { growth: number }) {
  const isPositive = growth > 0;
  const isNeutral = growth === 0;
  
  if (isNeutral) {
    return <span className="flex items-center gap-1 text-gray-500"><TrendingUp className="h-3 w-3" /> 0%</span>;
  }
  
  return (
    <span className={`flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(growth)}%
    </span>
  );
}

function QuickStatRow({ 
  icon, title, subtitle, value, chartData, chartColor 
}: { 
  icon: React.ReactNode; title: string; subtitle: React.ReactNode; value: string; chartData: SparklinePoint[]; chartColor: string;
}) {
  return (
    <div className="flex items-center rounded-lg p-2 transition-colors hover:bg-gray-50">
      <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#eaeaea] bg-white text-black">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium text-black">{title}</div>
        <div className="truncate text-[10px] text-gray-500">{subtitle}</div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="w-24 truncate text-right text-[12px] font-medium text-black">{value}</div>
        <div className="h-8 w-16 shrink-0 opacity-80">
          <LineChart width={64} height={32} data={chartData}>
            <Line type="monotone" dataKey="value" stroke={chartColor} strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </div>
      </div>
    </div>
  );
}
