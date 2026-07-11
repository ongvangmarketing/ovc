"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  DollarSign,
  Layers3,
  UsersRound,
} from "lucide-react";
import { type ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { WorkspaceDashboardData } from "@/actions/dashboard";
import { formatCurrency } from "@/lib/utils/format";
import { SelectBox } from "@/components/ui/select-box";

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 26 } },
};

const taskColors = ["#111111", "#6b7280", "#16a34a", "#ef4444"];
const periodOptions = [
  { value: "7d", label: "7 ngày qua" },
  { value: "30d", label: "30 ngày qua" },
  { value: "3m", label: "3 tháng qua" },
  { value: "6m", label: "6 tháng qua" },
  { value: "12m", label: "12 tháng qua" },
];

function number(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function money(value: number) {
  return formatCurrency(value).replace(/\s/g, " ");
}

function taskValue(data: WorkspaceDashboardData, status: string) {
  return data.taskStatus.find((task) => task.status === status)?.value || 0;
}

export function DashboardContainer({ children }: { children: ReactNode }) {
  return <div className="min-h-full bg-[#fafafa]">{children}</div>;
}

export function WorkspaceDashboard({ data, dateFrom, dateTo, period }: { data: WorkspaceDashboardData; dateFrom?: string; dateTo?: string; period: "7d" | "30d" | "3m" | "6m" | "12m" }) {
  const totalProjects = data.projectStatus.reduce((sum, project) => sum + project.value, 0);
  const totalTasks = data.taskTotal;
  const doneTasks = taskValue(data, "DONE");
  const inProgressTasks = taskValue(data, "IN_PROGRESS");
  const todoTasks = taskValue(data, "TODO");
  const reviewTasks = taskValue(data, "IN_REVIEW");
  const completionRate = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const taskChart = [
    { label: "Đang thực hiện", value: inProgressTasks, color: "#000000" },
    { label: "Tạm dừng", value: todoTasks, color: "#6b7280" },
    { label: "Hoàn thành", value: doneTasks, color: "#16a34a" },
    { label: "Quá hạn", value: reviewTasks, color: "#ef4444" },
  ];
  const projectChartData = period.endsWith("d")
    ? data.projectDailyTrend.slice(-(period === "7d" ? 7 : 30))
    : data.projectTrend.slice(-Number(period.replace("m", "")));
  const activeProjects = projectChartData.reduce((sum, period) => sum + period.activeProjects, 0);

  return (
    <motion.div
      variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      initial="hidden"
      animate="show"
      className="space-y-6 p-4 sm:p-8 max-w-[1200px] mx-auto"
    >
      <motion.header variants={item} className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[#eaeaea] pb-8 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase w-fit">
              Workspace
            </span>
          </div>
          <h1 className="text-[32px] md:text-[44px] tracking-tight leading-[1.15] font-medium uppercase mb-3">
            Bàn làm việc
          </h1>
          <p className="text-[15px] text-gray-500 max-w-xl">
            Tổng quan hoạt động, doanh thu, khách hàng và tiến độ công việc.
          </p>
        </div>
        <form method="get" className="mt-4 grid w-full grid-cols-2 items-end gap-3 md:mt-0 md:w-auto md:grid-cols-none md:flex md:flex-wrap">
          <label className="min-w-0 text-[13px] font-medium text-gray-500">
            Từ ngày
            <input name="from" type="date" defaultValue={dateFrom} className="mt-2 block h-12 w-full min-w-0 rounded-md border border-[#eaeaea] bg-white px-3 text-[14px] text-black outline-none transition-colors hover:bg-gray-50 focus:border-black focus:ring-1 focus:ring-black md:h-9 md:min-w-[132px] md:text-[13px]" />
          </label>
          <label className="min-w-0 text-[13px] font-medium text-gray-500">
            Đến ngày
            <input name="to" type="date" defaultValue={dateTo} className="mt-2 block h-12 w-full min-w-0 rounded-md border border-[#eaeaea] bg-white px-3 text-[14px] text-black outline-none transition-colors hover:bg-gray-50 focus:border-black focus:ring-1 focus:ring-black md:h-9 md:min-w-[132px] md:text-[13px]" />
          </label>
          <label className="min-w-0 text-[13px] font-medium text-gray-500">
            Khoảng thời gian
            <input type="hidden" name="period" value={period} />
            <SelectBox ariaLabel="Khoảng thời gian toàn trang" value={period} onChange={(value) => {
              const params = new URLSearchParams(window.location.search);
              params.set("period", value);
              params.delete("from");
              params.delete("to");
              window.location.href = `${window.location.pathname}?${params.toString()}`;
            }} options={periodOptions} className="mt-2 h-12 w-full min-w-0 rounded-md border-[#eaeaea] text-[14px] focus:border-black focus:ring-black md:h-9 md:min-w-[160px] md:text-[13px]" />
          </label>
          <button type="submit" className="flex h-12 items-center justify-center gap-2 self-end rounded-md bg-black px-4 text-[14px] font-medium text-white transition-colors hover:bg-gray-800 md:h-9 md:text-[13px]">
            <CalendarDays className="h-4 w-4" /> Áp dụng
          </button>
        </form>
      </motion.header>

      <motion.section variants={item} className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        <KpiCard href="/workspace/projects" icon={<Layers3 />} label="Tổng số dự án" value={number(totalProjects)} change={12.5} />
        <KpiCard href="/workspace/tasks" icon={<ClipboardList />} label="Tổng số việc" value={number(totalTasks)} change={8.3} />
        <KpiCard href="/workspace/crm" icon={<UsersRound />} label="Khách hàng" value={number(data.kpis.customers.value)} change={15.7} />
        <KpiCard href="/workspace/finance" icon={<DollarSign />} label="Doanh thu (VND)" value={money(data.financeSummary.totalRevenue)} change={18.2} />
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
        <motion.article variants={item} className="rounded-2xl border border-[#eaeaea] bg-white p-6 sm:p-8">
          <div className="mb-8 border-b border-[#eaeaea] pb-6">
            <h2 className="text-[18px] font-medium tracking-tight text-black">Tiến độ hoạt động</h2>
            <div className="mt-6 flex flex-wrap items-center gap-10">
                <div className="flex items-center gap-4">
                  <span className="text-[24px] text-gray-400">↗</span>
                  <div>
                    <strong className="text-[18px] font-medium tracking-tight text-black">{data.projectOnTime.rate == null ? "—" : `${data.projectOnTime.rate}%`}</strong>
                    <span className="ml-2 text-[14px] text-gray-500">Dự án đúng hạn</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <UsersRound className="h-5 w-5 text-gray-400" />
                  <div className="flex items-baseline gap-2 whitespace-nowrap">
                    <strong className="text-[18px] font-medium tracking-tight text-black">{activeProjects}</strong>
                    <p className="text-[14px] text-gray-500">Dự án đang chạy</p>
                  </div>
                </div>
            </div>
          </div>
          <div className="mb-4 flex justify-end gap-6 text-[13px] font-medium text-gray-500">
            <span className="flex items-center gap-2"><i className="h-2 w-4 rounded-full bg-black" />Dự án mới</span>
            <span className="flex items-center gap-2"><i className="h-2 w-4 rounded-full bg-gray-300" />Dự án hoàn thành</span>
          </div>
          <div className="h-[310px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectChartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashBlack" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#000000" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#000000" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="dashGray" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#d1d5db" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#d1d5db" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eaeaea" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} width={36} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #eaeaea', boxShadow: 'none' }} />
                <Area type="monotone" dataKey="newProjects" name="Dự án mới" stroke="#111111" strokeWidth={2} fill="url(#dashBlack)" dot={{ r: 3, fill: '#111111' }} />
                <Area type="monotone" dataKey="completedProjects" name="Dự án hoàn thành" stroke="#16a34a" strokeWidth={2} fill="url(#dashGray)" dot={{ r: 3, fill: '#16a34a' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.article>

        <motion.article variants={item} className="rounded-2xl border border-[#eaeaea] bg-white p-6 sm:p-8">
          <h2 className="text-[18px] font-medium tracking-tight text-black">Trạng thái công việc</h2>
          <div className="mt-8 mb-6 pb-6 border-b border-[#eaeaea]">
            <strong className="block text-[34px] font-medium leading-none tracking-tighter text-black">{number(totalTasks)}</strong>
            <p className="mt-2 text-[14px] text-gray-500">Tổng số việc · <span className="font-medium text-black">{completionRate}%</span> đã hoàn thành</p>
          </div>
          <div className="grid items-center gap-8 sm:grid-cols-[180px_1fr] xl:grid-cols-1 2xl:grid-cols-[180px_1fr]">
            <div className="relative h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={taskChart} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={2}>
                    {taskChart.map((entry, index) => <Cell key={entry.label} fill={taskColors[index % taskColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #eaeaea', boxShadow: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <strong className="text-[24px] font-medium text-black">{number(totalTasks)}</strong>
                <span className="text-[14px] font-normal tracking-[-0.01em] text-gray-400">Tổng</span>
              </div>
            </div>
            <div className="space-y-4">
              {taskChart.map((entry) => (
                <div key={entry.label} className="flex items-center justify-between gap-3 text-[14px]">
                  <span className="flex items-center gap-3 text-black"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />{entry.label}</span>
                  <strong className="text-black font-medium">{entry.value} <span className="font-normal text-gray-400 ml-1">({totalTasks ? Math.round((entry.value / totalTasks) * 100) : 0}%)</span></strong>
                </div>
              ))}
            </div>
          </div>
          <Link href="/workspace/tasks" className="mt-8 flex h-9 w-full items-center justify-center rounded-md border border-[#eaeaea] bg-white text-[13px] font-medium text-black hover:bg-gray-50 transition-colors">Xem toàn bộ công việc →</Link>
        </motion.article>
      </section>

    </motion.div>
  );
}

function KpiCard({ href, icon, label, value, change }: { href: string; icon: ReactNode; label: string; value: string; change: number }) {
  return (
    <Link
      href={href}
      aria-label={`Xem ${label.toLocaleLowerCase("vi-VN")}`}
      className="group rounded-2xl border border-[#eaeaea] bg-white p-5 transition-all duration-300 hover:border-black hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black"
    >
      <article className="flex min-h-[120px] flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[13px] font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#eaeaea] bg-[#fafafa] text-gray-500 transition-colors group-hover:bg-white group-hover:text-black [&>svg]:h-4 [&>svg]:w-4">
            {icon}
          </span>
        </div>
        <div className="mt-4 flex flex-col items-start gap-2">
          <strong className="block whitespace-nowrap text-[32px] font-medium leading-none tracking-tight text-black">
            {value}
          </strong>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#eaeaea] bg-[#fafafa] px-2 py-0.5 text-[12px] font-medium text-gray-600 transition-colors group-hover:bg-white">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
            {change}%
          </span>
        </div>
      </article>
    </Link>
  );
}
