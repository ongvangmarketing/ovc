"use client";

import { FunnelChart, Funnel, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Activity, TrendingDown, TrendingUp } from "lucide-react";

// Vercel Color Palette (Monochrome & stark)
const COLORS = ['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#EAEAEA', '#F5F5F5'];

type LeadChartDatum = {
  name: string;
  value: number;
  fill?: string;
};

export function LeadDashboardClient({
  funnelData,
  scoreData,
  sourceData,
  totalLeads
}: {
  funnelData: LeadChartDatum[];
  scoreData: LeadChartDatum[];
  sourceData: LeadChartDatum[];
  totalLeads: number;
}) {
  const convertedLeads = funnelData.at(-1)?.value ?? 0;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
  const dropRate = Math.max(0, 100 - conversionRate);

  return (
    <div className="space-y-6 font-sans">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        <div className="group rounded-xl border border-[#eaeaea] bg-white p-5 transition-all duration-300 hover:border-black hover:bg-[#fafafa] active:scale-[0.98]">
           <div className="mb-5 flex h-8 w-8 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-black transition-colors group-hover:border-black group-hover:bg-black group-hover:text-white">
             <TrendingUp className="h-4 w-4" />
           </div>
           <p className="text-[13px] font-medium text-gray-500">Tổng Leads</p>
           <h3 className="mt-3 text-[24px] font-medium tracking-tight text-black">{totalLeads}</h3>
           <p className="mt-3 text-[12px] font-medium text-gray-400">+12% tháng trước</p>
        </div>

        <div className="group rounded-xl border border-[#eaeaea] bg-white p-5 transition-all duration-300 hover:border-black hover:bg-[#fafafa] active:scale-[0.98]">
           <div className="mb-5 flex h-8 w-8 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-black transition-colors group-hover:border-black group-hover:bg-black group-hover:text-white">
             <TrendingUp className="h-4 w-4" />
           </div>
           <p className="text-[13px] font-medium text-gray-500">Chuyển đổi</p>
           <h3 className="mt-3 text-[24px] font-medium tracking-tight text-black">
             {conversionRate}%
           </h3>
           <p className="mt-3 text-[12px] font-medium text-gray-400">+5% tháng trước</p>
        </div>

        <div className="group rounded-xl border border-[#eaeaea] bg-white p-5 transition-all duration-300 hover:border-black hover:bg-[#fafafa] active:scale-[0.98]">
           <div className="mb-5 flex h-8 w-8 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-black transition-colors group-hover:border-black group-hover:bg-black group-hover:text-white">
             <TrendingDown className="h-4 w-4" />
           </div>
           <p className="text-[13px] font-medium text-gray-500">Tỷ lệ rớt</p>
           <h3 className="mt-3 text-[24px] font-medium tracking-tight text-black">{dropRate}%</h3>
           <p className="mt-3 text-[12px] font-medium text-gray-400">Chưa chuyển đổi</p>
        </div>
        
        <div className="group rounded-xl border border-[#eaeaea] bg-white p-5 transition-all duration-300 hover:border-black hover:bg-[#fafafa] active:scale-[0.98]">
           <div className="mb-5 flex h-8 w-8 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-black transition-colors group-hover:border-black group-hover:bg-black group-hover:text-white">
             <Activity className="h-4 w-4" />
           </div>
           <p className="text-[13px] font-medium text-gray-500">Điểm AI</p>
           <h3 className="mt-3 text-[24px] font-medium tracking-tight text-black">45</h3>
           <p className="mt-3 text-[12px] font-medium text-gray-400">Ổn định</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel Chart */}
        <div className="bg-white rounded-2xl border border-[#eaeaea] p-8 hover:border-gray-300 transition-colors duration-200">
          <h3 className="text-[24px] font-medium tracking-tight text-black mb-6">
            Phễu chuyển đổi
          </h3>
          <div className="grid min-h-[350px] gap-8 xl:grid-cols-[minmax(0,1fr)_180px]">
            <div className="h-[300px] min-w-0 xl:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart margin={{ top: 20, right: 16, bottom: 20, left: 16 }}>
                  <RechartsTooltip contentStyle={{borderRadius: '6px', border: '1px solid #eaeaea', fontSize: '14px', color: '#000', boxShadow: 'none'}} />
                  <Funnel dataKey="value" data={funnelData} isAnimationActive />
                </FunnelChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center gap-4">
              {funnelData.map((step, index) => (
                <div key={step.name} className="flex flex-col border-l border-[#eaeaea] pl-4 py-1">
                  <span className="text-[11px] lg:text-[12px] font-medium uppercase tracking-widest text-gray-400" title={step.name}>{step.name}</span>
                  <p className="mt-1 text-[20px] font-medium tracking-tight text-black">{step.value.toLocaleString("vi-VN")}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Score Bar Chart */}
        <div className="bg-white rounded-2xl border border-[#eaeaea] p-8 hover:border-gray-300 transition-colors duration-200">
          <h3 className="text-[24px] font-medium tracking-tight text-black mb-6">
            Phân bổ điểm AI
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} />
                <RechartsTooltip cursor={{fill: '#fafafa'}} contentStyle={{borderRadius: '6px', border: '1px solid #eaeaea', fontSize: '14px', color: '#000', boxShadow: 'none'}} />
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {scoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Pie Chart */}
        <div className="bg-white rounded-2xl border border-[#eaeaea] p-8 hover:border-gray-300 transition-colors duration-200 lg:col-span-2">
          <h3 className="text-[24px] font-medium tracking-tight text-black mb-6">
            Nguồn gốc Leads
          </h3>
          <div className="h-[300px] w-full flex items-center justify-center">
             {sourceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(((percent ?? 0) as number) * 100).toFixed(0)}%`}
                      stroke="none"
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{borderRadius: '6px', border: '1px solid #eaeaea', fontSize: '14px', color: '#000', boxShadow: 'none'}} />
                  </PieChart>
                </ResponsiveContainer>
             ) : (
                <div className="text-gray-400 text-[14px] italic">Chưa có đủ dữ liệu để vẽ biểu đồ</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
