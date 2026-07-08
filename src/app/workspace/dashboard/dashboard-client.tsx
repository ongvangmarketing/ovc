"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
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

import type { WorkspaceDashboardData } from "@/app/actions/dashboard";
import { formatCurrency } from "@/lib/utils/format";
import { SelectBox } from "@/components/ui/select-box";

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 26 } },
};

const taskColors = ["#000000", "#666666", "#16a34a", "#ef4444"];
const projectIconColors = ["#000000", "#333333", "#666666", "#999999"];
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

function activityHref(activity: WorkspaceDashboardData["activities"][number]) {
  const entityId = activity.id.replace(/^(payment|invoice|project)-/, "");
  if (activity.type === "payment") return `/workspace/finance/payments/${entityId}`;
  if (activity.type === "invoice") return `/workspace/finance/invoices/${entityId}`;
  return `/workspace/projects/${entityId}`;
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
  const overdueTasks = data.receivables.slice(0, 4);
  const completionRate = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const taskChart = [
    { label: "Đang thực hiện", value: inProgressTasks, color: "#000000" },
    { label: "Tạm dừng", value: todoTasks, color: "#666666" },
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
      className="space-y-6 p-4 sm:p-8 max-w-[1440px] mx-auto"
    >
      <motion.header variants={item} className="flex flex-wrap items-start justify-between gap-6 pb-4 border-b border-[#eaeaea]">
        <div>
          <h1 className="text-[32px] sm:text-[40px] font-medium tracking-tighter leading-none text-black">Tổng quan dự án</h1>
          <p className="mt-3 text-[15px] text-gray-500">Cập nhật tình hình hoạt động của doanh nghiệp</p>
        </div>
        <form method="get" className="grid w-full grid-cols-2 items-end gap-3 sm:w-auto sm:grid-cols-[145px_145px_155px_auto]">
          <label className="min-w-0 text-[11px] font-medium uppercase tracking-widest text-gray-400">
            Từ ngày
            <input name="from" type="date" defaultValue={dateFrom} className="mt-1.5 block h-10 w-full min-w-[132px] rounded-md border border-[#eaeaea] bg-white px-3 text-[13px] text-black outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" />
          </label>
          <label className="min-w-0 text-[11px] font-medium uppercase tracking-widest text-gray-400">
            Đến ngày
            <input name="to" type="date" defaultValue={dateTo} className="mt-1.5 block h-10 w-full min-w-[132px] rounded-md border border-[#eaeaea] bg-white px-3 text-[13px] text-black outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" />
          </label>
          <label className="col-span-2 min-w-0 text-[11px] font-medium uppercase tracking-widest text-gray-400 sm:col-span-1">
            Khoảng thời gian
            <input type="hidden" name="period" value={period} />
            <SelectBox ariaLabel="Khoảng thời gian toàn trang" value={period} onChange={(value) => {
              const params = new URLSearchParams(window.location.search);
              params.set("period", value);
              params.delete("from");
              params.delete("to");
              window.location.href = `${window.location.pathname}?${params.toString()}`;
            }} options={periodOptions} className="mt-1.5 h-10 w-full rounded-md border-[#eaeaea] text-[13px] focus:border-black focus:ring-black" />
          </label>
          <button type="submit" className="col-span-2 flex h-10 items-center justify-center gap-2 rounded-md bg-black px-4 text-[13px] font-medium text-white sm:col-span-1 hover:bg-gray-800 transition-colors">
            <CalendarDays className="h-4 w-4" /> Áp dụng
          </button>
        </form>
      </motion.header>

      <motion.section variants={item} className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        <KpiCard href="/workspace/projects" icon={<Layers3 />} label="Tổng số dự án" value={number(totalProjects)} change={12.5} />
        <KpiCard href="/workspace/tasks" icon={<ClipboardList />} label="Tổng số công việc" value={number(totalTasks)} change={8.3} />
        <KpiCard href="/workspace/crm" icon={<UsersRound />} label="Khách hàng" value={number(data.kpis.customers.value)} change={15.7} />
        <KpiCard href="/workspace/finance" icon={<DollarSign />} label="Doanh thu (VND)" value={money(data.financeSummary.totalRevenue)} change={18.2} />
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
        <motion.article variants={item} className="rounded-2xl border border-[#eaeaea] bg-white p-6 sm:p-8">
          <div className="mb-8 border-b border-[#eaeaea] pb-6">
            <h2 className="text-[20px] font-medium tracking-tight text-black">Tiến độ hoạt động</h2>
            <div className="mt-6 flex flex-wrap items-center gap-10">
                <div className="flex items-center gap-4">
                  <span className="text-[24px] text-gray-400">↗</span>
                  <div>
                    <strong className="text-[20px] font-medium text-black tracking-tight">{data.projectOnTime.rate == null ? "—" : `${data.projectOnTime.rate}%`}</strong>
                    <span className="ml-2 text-[14px] text-gray-500">Dự án đúng hạn</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <UsersRound className="h-5 w-5 text-gray-400" />
                  <div className="flex items-baseline gap-2 whitespace-nowrap">
                    <strong className="text-[20px] font-medium text-black tracking-tight">{activeProjects}</strong>
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
                    <stop offset="0%" stopColor="#000000" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#000000" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="dashGray" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#d1d5db" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#d1d5db" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eaeaea" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} width={36} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #eaeaea', boxShadow: 'none' }} />
                <Area type="monotone" dataKey="newProjects" name="Dự án mới" stroke="#000000" strokeWidth={2} fill="url(#dashBlack)" dot={{ r: 3, fill: '#000' }} />
                <Area type="monotone" dataKey="completedProjects" name="Dự án hoàn thành" stroke="#d1d5db" strokeWidth={2} fill="url(#dashGray)" dot={{ r: 3, fill: '#d1d5db' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.article>

        <motion.article variants={item} className="rounded-2xl border border-[#eaeaea] bg-white p-6 sm:p-8">
          <h2 className="text-[20px] font-medium tracking-tight text-black">Trạng thái công việc</h2>
          <div className="mt-8 mb-6 pb-6 border-b border-[#eaeaea]">
            <strong className="block text-[48px] font-medium tracking-tighter leading-none text-black">{number(totalTasks)}</strong>
            <p className="text-[14px] text-gray-500 mt-2">Tổng số công việc · <span className="text-black font-medium">{completionRate}%</span> đã hoàn thành</p>
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
                <span className="text-[12px] uppercase tracking-widest text-gray-400">Tổng</span>
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
          <Link href="/workspace/tasks" className="mt-8 flex h-10 w-full items-center justify-center rounded-md border border-[#eaeaea] bg-white text-[14px] font-medium text-black hover:bg-gray-50 transition-colors">Xem toàn bộ công việc →</Link>
        </motion.article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr_360px]">
        <motion.article variants={item} className="rounded-2xl border border-[#eaeaea] bg-white p-6">
          <SectionTitle title="Dự án gần đây" action="Xem tất cả" href="/workspace/projects" />
          <div className="mt-6 space-y-3">
            {data.activeProjects.slice(0, 4).map((project, index) => (
              <Link
                key={project.id}
                href={`/workspace/projects/${project.id}`}
                className="block rounded-xl border border-transparent px-3 py-4 transition-colors hover:border-[#eaeaea] hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-black border border-[#eaeaea]">
                    <Layers3 className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-black" title={project.name}>{project.name}</p>
                    <p className="mt-0.5 truncate text-[13px] text-gray-500">Cập nhật gần đây</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4 pl-[56px]">
                  <div className="h-1 min-w-0 flex-1 rounded-full bg-gray-100 overflow-hidden">
                    <i className="block h-full rounded-full bg-black transition-all" style={{ width: `${project.progress}%` }} />
                  </div>
                  <span className="w-10 shrink-0 text-right text-[12px] font-medium text-gray-500">{project.progress}%</span>
                  <span className="shrink-0 rounded-full border border-[#eaeaea] bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-black">Đang chạy</span>
                </div>
              </Link>
            ))}
          </div>
        </motion.article>

        <motion.article variants={item} className="rounded-2xl border border-[#eaeaea] bg-white p-6">
          <SectionTitle title="Công việc quá hạn" action="Xem chi tiết" href="/workspace/finance/invoices" />
          <div className="mt-6 divide-y divide-[#eaeaea]">
            {(overdueTasks.length ? overdueTasks : data.latestInvoices.slice(0, 4)).map((row, index) => (
              <Link key={row.id} href={`/workspace/finance/invoices/${row.id}`} className="grid grid-cols-[40px_1fr_auto] items-center gap-4 py-4 transition-colors hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black px-2 -mx-2 rounded-xl">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100"><AlertTriangle className="h-4 w-4" /></span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium text-black">{"number" in row ? row.number : row.customer}</p>
                  <p className="truncate text-[13px] text-gray-500 mt-0.5">Theo dõi xử lý công nợ / công việc</p>
                </div>
                <span className="text-[12px] font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">{(index + 1) * 2} ngày quá hạn</span>
              </Link>
            ))}
          </div>
        </motion.article>

        <motion.article variants={item} className="rounded-2xl border border-[#eaeaea] bg-white p-6 flex flex-col">
          <SectionTitle title="Lịch hôm nay" action="Toàn bộ lịch" href="/workspace/calendar" />
          <p className="mt-6 pb-4 border-b border-[#eaeaea] text-[12px] font-medium uppercase tracking-widest text-gray-400">Thứ Hai, 29/06/2026</p>
          <div className="mt-4 flex-1 space-y-2">
            {data.activities.slice(0, 4).map((activity, index) => (
              <Link key={activity.id} href={activityHref(activity)} className="grid grid-cols-[48px_8px_1fr] items-center gap-4 rounded-xl py-3 px-2 -mx-2 transition-colors hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black">
                <span className="text-[13px] font-medium text-gray-400">{["09:00", "11:00", "14:00", "16:00"][index]}</span>
                <i className="h-2 w-2 rounded-full bg-black" />
                <div>
                  <p className="line-clamp-1 text-[14px] font-medium text-black">{activity.title}</p>
                  <p className="line-clamp-1 text-[13px] text-gray-500 mt-0.5">{activity.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
          <button className="mt-6 h-10 w-full rounded-md bg-black text-[13px] font-medium text-white hover:bg-gray-800 transition-colors">
            Thêm lịch làm việc
          </button>
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
      className="group rounded-2xl border border-[#eaeaea] bg-white p-5 transition-all duration-300 hover:border-black focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black"
    >
      <article className="relative min-h-[120px] flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <p className="text-[12px] font-medium uppercase tracking-widest text-gray-500">{label}</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-black border border-[#eaeaea] transition-colors group-hover:bg-black group-hover:text-white [&>svg]:h-4 [&>svg]:w-4">
            {icon}
          </span>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <strong className="block text-[32px] sm:text-[40px] font-medium tracking-tighter leading-none text-black">
            {value}
          </strong>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-100">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
            {change}%
          </span>
        </div>
      </article>
    </Link>
  );
}

function SectionTitle({ title, action, href }: { title: string; action: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-[18px] font-medium tracking-tight text-black">{title}</h2>
      <Link href={href} className="text-[13px] font-medium text-gray-500 hover:text-black transition-colors">{action}</Link>
    </div>
  );
}
