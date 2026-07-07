"use client";

import { FunnelChart, Funnel, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { ArrowUpRight, TrendingUp, Users, Target, Activity } from "lucide-react";

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316', '#eab308', '#22c55e'];

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

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm relative overflow-hidden">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-sm font-medium text-gray-500">Tổng Leads</p>
               <h3 className="text-3xl font-bold text-gray-900 mt-1">{totalLeads}</h3>
             </div>
             <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
               <Users className="w-5 h-5" />
             </div>
           </div>
           <div className="mt-4 flex items-center text-sm">
             <span className="text-emerald-600 font-medium flex items-center"><TrendingUp className="w-4 h-4 mr-1"/> +12%</span>
             <span className="text-gray-400 ml-2">so với tháng trước</span>
           </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm relative overflow-hidden">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-sm font-medium text-gray-500">Tỷ lệ chuyển đổi</p>
               <h3 className="text-3xl font-bold text-gray-900 mt-1">
                 {conversionRate}%
               </h3>
             </div>
             <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
               <Target className="w-5 h-5" />
             </div>
           </div>
           <div className="mt-4 flex items-center text-sm">
             <span className="text-emerald-600 font-medium flex items-center"><TrendingUp className="w-4 h-4 mr-1"/> +5%</span>
             <span className="text-gray-400 ml-2">so với tháng trước</span>
           </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm relative overflow-hidden">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-sm font-medium text-gray-500">Điểm AI trung bình</p>
               <h3 className="text-3xl font-bold text-gray-900 mt-1">45</h3>
             </div>
             <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
               <Activity className="w-5 h-5" />
             </div>
           </div>
           <div className="mt-4 flex items-center text-sm">
             <span className="text-gray-500 font-medium flex items-center">Chất lượng Leads ổn định</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            Phễu chuyển đổi (Lead Funnel)
          </h3>
          <div className="grid min-h-[350px] gap-5 xl:grid-cols-[minmax(0,1fr)_180px]">
            <div className="h-[300px] min-w-0 xl:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart margin={{ top: 20, right: 16, bottom: 20, left: 16 }}>
                  <RechartsTooltip />
                  <Funnel dataKey="value" data={funnelData} isAnimationActive />
                </FunnelChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center gap-2">
              {funnelData.map((step, index) => (
                <div key={step.name} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: step.fill || COLORS[index % COLORS.length] }} />
                    <span className="min-w-0 flex-1 truncate text-xs font-semibold text-gray-700" title={step.name}>{step.name}</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-gray-950">{step.value.toLocaleString("vi-VN")}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Score Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-orange-50 flex items-center justify-center text-orange-600">
              <Activity className="w-4 h-4" />
            </div>
            Phân bổ điểm AI (Lead Quality)
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {scoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm lg:col-span-2">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Target className="w-4 h-4" />
            </div>
            Nguồn gốc Leads (Lead Sources)
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
                      paddingAngle={5}
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(((percent ?? 0) as number) * 100).toFixed(0)}%`}
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  </PieChart>
                </ResponsiveContainer>
             ) : (
                <div className="text-gray-400 text-sm italic">Chưa có đủ dữ liệu để vẽ biểu đồ</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
