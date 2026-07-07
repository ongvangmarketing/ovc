"use client";

import { useState } from "react";
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

type DashboardData = {
  totalCustomers: number;
  customerGrowth: number;
  totalCompanies: number;
  companyGrowth: number;
  totalOpenDeals: number;
  dealGrowth: number;
  expectedValue: number;
  expectedValueGrowth: number;
  closingSoonDeals: any[];
  recentDeals: any[];
  recentActivities: any[];
  quickStats: {
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
    }
  }
};

export function CRMDashboardClient({ data }: { data: DashboardData }) {
  const [dealPage, setDealPage] = useState(1);
  const itemsPerPage = 4;
  
  const paginatedDeals = data.recentDeals.slice(0, itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-500';
      case 'WON': return 'bg-green-500';
      case 'LOST': return 'bg-red-500';
      case 'ON_HOLD': return 'bg-amber-500';
      default: return 'bg-slate-400';
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
    <div className="max-w-full space-y-4 overflow-x-hidden px-4 py-5 pb-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Bảng Tổng quan CRM</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">Theo dõi hoạt động kinh doanh và tiến độ các cơ hội.</p>
        </div>
        <Link href="/workspace/crm/deals/new" className="h-9 px-4 inline-flex items-center justify-center rounded bg-indigo-600 text-[13px] font-medium text-white hover:bg-indigo-700 transition shadow-sm">
          <span className="mr-1.5 text-lg leading-none">+</span> Tạo cơ hội
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <Link href="/workspace/crm/contacts" className="block">
          <StatCard
            title="Tổng Khách hàng"
            value={data.totalCustomers}
            subtitle="Tất cả khách hàng (Customer)"
            growth={data.customerGrowth}
            icon={<Users className="h-5 w-5 text-blue-500" />}
            bgColor="bg-blue-50"
          />
        </Link>
        <Link href="/workspace/crm/companies" className="block">
          <StatCard
            title="Tổng Doanh nghiệp"
            value={data.totalCompanies}
            subtitle="Tất cả đối tác (Company)"
            growth={data.companyGrowth}
            icon={<Target className="h-5 w-5 text-amber-500" />}
            bgColor="bg-amber-50"
          />
        </Link>
        <Link href="/workspace/crm/deals" className="block">
          <StatCard
            title="Cơ hội đang mở"
            value={data.totalOpenDeals}
            subtitle="Pipeline hiện tại"
            growth={data.dealGrowth}
            icon={<Target className="h-5 w-5 text-purple-500" />}
            bgColor="bg-purple-50"
          />
        </Link>
        <Link href="/workspace/crm/deals" className="block">
          <StatCard
            title="Giá trị dự kiến (Mở)"
            value={`${formatCurrency(data.expectedValue, "VND")}`}
            subtitle="Tổng ngân sách"
            growth={data.expectedValueGrowth}
            icon={<CircleDollarSign className="h-5 w-5 text-emerald-500" />}
            bgColor="bg-emerald-50"
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        {/* Left Column (2/3) */}
        <div className="xl:col-span-2 flex flex-col gap-3">
          
          {/* Closing Soon */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[220px]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-[13px]">
                <Clock className="h-4 w-4 text-orange-500" />
                Cơ hội sắp chốt (Closing Soon)
              </h2>
              <Link href="/workspace/crm/deals" className="text-[12px] text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium bg-indigo-50 px-2 py-1 rounded">
                Xem tất cả <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex-1 flex flex-col">
              {data.closingSoonDeals.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <Inbox className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="text-[13px] font-semibold text-slate-700">Không có cơ hội nào sắp chốt</div>
                  <div className="text-[12px] text-slate-500 mt-1">Hiện tại chưa có cơ hội nào trong giai đoạn sắp chốt.</div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.closingSoonDeals.map(deal => (
                    <div key={deal.id} className="p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-3">
                      <div className="flex-1 min-w-0">
                        <Link href={`/workspace/crm/deals/${deal.id}`} className="font-semibold text-slate-800 hover:text-indigo-600 truncate block text-[13px]">
                          {deal.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-[12px] text-slate-500">
                          <span className="truncate">{deal.company?.name || deal.contact?.firstName || 'Khách lẻ'}</span>
                          <span>•</span>
                          <span className="text-orange-600 font-medium">Chốt: {deal.expectedClose ? new Date(deal.expectedClose).toLocaleDateString('vi-VN') : 'N/A'}</span>
                        </div>
                      </div>
                      <div className="font-semibold text-slate-900 text-[13px] shrink-0">
                        {formatCurrency(Number(deal.value), deal.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Recent Deals */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-[13px]">
                <Briefcase className="h-4 w-4 text-indigo-500" />
                Cơ hội mới nhất (Recent Deals)
              </h2>
              <select className="text-[12px] border border-slate-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500 bg-white cursor-pointer">
                <option>Tất cả cơ hội</option>
                <option>Đang mở</option>
              </select>
            </div>
            
            <div className="flex-1 flex flex-col">
              {data.recentDeals.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="text-[13px] text-slate-500">Chưa có cơ hội nào</div>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-slate-100 flex-1">
                    {paginatedDeals.map(deal => (
                      <div key={deal.id} className="p-3 px-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="min-w-0 pr-4 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-2 h-2 rounded-full ${getStatusColor(deal.status)}`}></span>
                            <Link href={`/workspace/crm/deals/${deal.id}`} className="font-semibold text-slate-800 hover:text-indigo-600 truncate text-[13px]">
                              {deal.title}
                            </Link>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 ml-4">
                            <span>Tạo: {new Date(deal.createdAt).toLocaleDateString('vi-VN')}</span>
                            <span>•</span>
                            <span className="truncate">{deal.company?.name || deal.contact?.firstName || 'Khách lẻ'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="flex items-center gap-1.5 w-24">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600`}>
                              {getStatusLabel(deal.status)}
                            </span>
                          </div>
                          <div className="text-right font-semibold text-slate-900 text-[13px] w-24">
                            {formatCurrency(Number(deal.value), deal.currency)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination Footer */}
                  <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="text-[11px] text-slate-500">
                      Hiển thị 1 đến {paginatedDeals.length} của {data.recentDeals.length} cơ hội
                    </div>
                    <div className="flex items-center gap-2">
                      <select className="text-[11px] border border-slate-200 rounded px-1.5 py-0.5 outline-none bg-white">
                        <option>10 / trang</option>
                      </select>
                      <div className="flex items-center gap-1">
                        <button className="p-1 rounded text-slate-400 hover:bg-slate-200 disabled:opacity-50" disabled>
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 text-[12px] font-medium flex items-center justify-center border border-indigo-100">
                          1
                        </button>
                        <button className="p-1 rounded text-slate-400 hover:bg-slate-200 disabled:opacity-50" disabled>
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
        <div className="flex flex-col gap-3">
          
          {/* Recent Activities */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[220px]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-[13px]">
                <Activity className="h-4 w-4 text-emerald-500" />
                Hoạt động chăm sóc
              </h2>
              <Link href="#" className="text-[12px] text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium bg-indigo-50 px-2 py-1 rounded">
                Xem tất cả <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex-1 flex flex-col">
              {data.recentActivities.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <Activity className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="text-[13px] font-semibold text-slate-700">Chưa có hoạt động nào</div>
                  <div className="text-[12px] text-slate-500 mt-1">Các hoạt động chăm sóc khách hàng sẽ hiển thị tại đây.</div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 overflow-y-auto">
                  {data.recentActivities.map(activity => (
                    <div key={activity.id} className="p-3 px-4 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[11px] font-semibold text-slate-700">
                          {activity.type}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(activity.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="text-[12px] text-slate-600 line-clamp-1">
                        {activity.subject || 'Ghi chú cuộc gọi / họp'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Quick Overview (Sparklines) */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex-1">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-semibold text-slate-800 text-[13px]">
                Tổng quan nhanh
              </h2>
            </div>
            <div className="p-2 space-y-1">
              <QuickStatRow 
                icon={<Target className="w-4 h-4 text-blue-500" />}
                iconBg="bg-blue-100"
                title="Tỷ lệ chuyển đổi"
                subtitle="Cơ hội → Thành công"
                value={`${data.quickStats.conversionRate}%`}
                chartData={data.quickStats.chartData.conversion}
                chartColor="#3b82f6"
              />
              <QuickStatRow 
                icon={<CircleDollarSign className="w-4 h-4 text-green-500" />}
                iconBg="bg-green-100"
                title="Doanh thu tháng này"
                subtitle={<GrowthText growth={data.quickStats.revenueGrowth} />}
                value={formatCurrency(data.quickStats.thisMonthRevenue, "VND")}
                chartData={data.quickStats.chartData.revenue}
                chartColor="#22c55e"
              />
              <QuickStatRow 
                icon={<Briefcase className="w-4 h-4 text-purple-500" />}
                iconBg="bg-purple-100"
                title="Doanh thu dự kiến"
                subtitle={<GrowthText growth={data.expectedValueGrowth} />}
                value={formatCurrency(data.expectedValue, "VND")}
                chartData={data.quickStats.chartData.expected}
                chartColor="#a855f7"
              />
              <QuickStatRow 
                icon={<CircleDollarSign className="w-4 h-4 text-orange-500" />}
                iconBg="bg-orange-100"
                title="Giá trị trung bình"
                subtitle="Trên mỗi cơ hội"
                value={formatCurrency(data.quickStats.avgValue, "VND")}
                chartData={data.quickStats.chartData.avgValue}
                chartColor="#f97316"
              />
              <QuickStatRow 
                icon={<Clock className="w-4 h-4 text-blue-500" />}
                iconBg="bg-blue-100"
                title="Thời gian chốt trung bình"
                subtitle="Từ khi tạo đến khi chốt"
                value={`${data.quickStats.avgClosingTime} ngày`}
                chartData={data.quickStats.chartData.closingTime}
                chartColor="#3b82f6"
              />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, growth, icon, bgColor }: { title: string, value: string | number, subtitle?: string, growth: number, icon: React.ReactNode, bgColor: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-indigo-200 transition-colors relative overflow-hidden group h-full">
      <div className="flex justify-between items-start mb-2">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${bgColor} group-hover:scale-105 transition-transform`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-[13px] font-semibold text-slate-600">{title}</div>
        <div className="text-xl font-bold text-slate-900 tracking-tight mt-1 mb-1">{value}</div>
        <div className="flex items-center justify-between">
          <div className="text-[11px] text-slate-400">{subtitle}</div>
        </div>
        <div className="mt-2 flex items-center text-[11px] font-medium">
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
    return <span className="text-slate-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> 0% <span className="text-slate-400 font-normal">so với tháng trước</span></span>;
  }
  
  return (
    <span className={`flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(growth)}% 
      <span className="text-slate-400 font-normal ml-0.5">so với tháng trước</span>
    </span>
  );
}

function QuickStatRow({ 
  icon, iconBg, title, subtitle, value, chartData, chartColor 
}: { 
  icon: React.ReactNode; iconBg: string; title: string; subtitle: React.ReactNode; value: string; chartData: any[]; chartColor: string;
}) {
  return (
    <div className="flex items-center p-2 rounded hover:bg-slate-50 transition-colors">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg} mr-3`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-semibold text-slate-800">{title}</div>
        <div className="text-[10px] text-slate-500 truncate">{subtitle}</div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="font-bold text-[12px] text-slate-900 text-right w-24 truncate">{value}</div>
        <div className="w-16 h-8 opacity-80 shrink-0">
          <LineChart width={64} height={32} data={chartData}>
            <Line type="monotone" dataKey="value" stroke={chartColor} strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </div>
      </div>
    </div>
  );
}
