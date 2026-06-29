"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  DollarSign,
  Layers3,
  UsersRound,
} from "lucide-react";
import { useState, type ReactNode } from "react";
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

const taskColors = ["#1d9bf0", "#ff5a1f", "#16c784", "#ff3b4f"];
const projectIconColors = ["#7049ff", "#16c784", "#ff5a1f", "#1d9bf0"];

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
  return <div className="min-h-full bg-[#f8f9fd]">{children}</div>;
}

export function WorkspaceDashboard({ data, dateFrom, dateTo }: { data: WorkspaceDashboardData; dateFrom?: string; dateTo?: string }) {
  const [trendRange, setTrendRange] = useState<"7d" | "30d" | "3m" | "6m" | "12m">("6m");
  const totalProjects = data.projectStatus.reduce((sum, project) => sum + project.value, 0);
  const totalTasks = data.taskTotal;
  const doneTasks = taskValue(data, "DONE");
  const inProgressTasks = taskValue(data, "IN_PROGRESS");
  const todoTasks = taskValue(data, "TODO");
  const reviewTasks = taskValue(data, "IN_REVIEW");
  const overdueTasks = data.receivables.slice(0, 4);
  const completionRate = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const taskChart = [
    { label: "Đang thực hiện", value: inProgressTasks, color: "#1d9bf0" },
    { label: "Tạm dừng", value: todoTasks, color: "#ff5a1f" },
    { label: "Hoàn thành", value: doneTasks, color: "#16c784" },
    { label: "Quá hạn", value: reviewTasks, color: "#ff3b4f" },
  ];
  const projectChartData = trendRange.endsWith("d")
    ? data.projectDailyTrend.slice(-(trendRange === "7d" ? 7 : 30))
    : data.projectTrend.slice(-Number(trendRange.replace("m", "")));
  const activeProjects = projectChartData.reduce((sum, period) => sum + period.activeProjects, 0);

  return (
    <motion.div
      variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      initial="hidden"
      animate="show"
      className="space-y-5 p-4 sm:p-6"
    >
      <motion.header variants={item} className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold tracking-normal text-[#171331] sm:text-[28px]">Tổng quan dự án</h1>
          <p className="mt-2 text-[15px] font-medium text-[#6f6a8f]">Cập nhật tình hình hoạt động của doanh nghiệp</p>
        </div>
        <form method="get" className="flex flex-wrap items-end gap-2 rounded-xl border border-[#dfe3f0] bg-white p-2 shadow-sm">
          <label className="text-[11px] font-medium text-[#6f6a8f]">
            Từ ngày
            <input name="from" type="date" defaultValue={dateFrom} className="mt-1 block h-9 rounded-lg border border-[#dfe3f0] px-2 text-[13px] font-semibold text-[#2b244d] outline-none focus:border-[#7049ff]" />
          </label>
          <label className="text-[11px] font-medium text-[#6f6a8f]">
            Đến ngày
            <input name="to" type="date" defaultValue={dateTo} className="mt-1 block h-9 rounded-lg border border-[#dfe3f0] px-2 text-[13px] font-semibold text-[#2b244d] outline-none focus:border-[#7049ff]" />
          </label>
          <button type="submit" className="flex h-9 items-center gap-2 rounded-lg bg-[#7049ff] px-3 text-[13px] font-semibold text-white">
            <CalendarDays className="h-4 w-4" /> Áp dụng
          </button>
        </form>
      </motion.header>

      <motion.section variants={item} className="grid grid-cols-2 gap-3 sm:gap-5 2xl:grid-cols-4">
        <KpiCard href="/workspace/projects" icon={<Layers3 />} tone="purple" label="Tổng số dự án" value={number(totalProjects)} change={12.5} />
        <KpiCard href="/workspace/tasks" icon={<ClipboardList />} tone="orange" label="Tổng số công việc" value={number(totalTasks)} change={8.3} />
        <KpiCard href="/workspace/crm" icon={<UsersRound />} tone="blue" label="Khách hàng" value={number(data.kpis.customers.value)} change={15.7} />
        <KpiCard href="/workspace/finance" icon={<DollarSign />} tone="green" label="Doanh thu (VND)" value={money(data.financeSummary.totalRevenue)} change={18.2} />
      </motion.section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <motion.article variants={item} className="rounded-2xl border border-[#edf0f7] bg-white p-5 shadow-[0_18px_50px_rgba(31,35,70,0.06)]">
          <div className="mb-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[20px] font-semibold text-[#171331]">Tổng quan dự án</h2>
              <SelectBox ariaLabel="Khoảng thời gian biểu đồ" value={trendRange} onChange={(value) => setTrendRange(value as "7d" | "30d" | "3m" | "6m" | "12m")} options={[{ value: "7d", label: "7 ngày qua" }, { value: "30d", label: "30 ngày qua" }, { value: "3m", label: "3 tháng qua" }, { value: "6m", label: "6 tháng qua" }, { value: "12m", label: "12 tháng qua" }]} className="h-10 w-[145px] rounded-xl text-[13px] sm:text-[14px]" />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-8">
                <div className="flex items-center gap-3">
                  <span className="text-[26px] text-[#7049ff]">↗</span>
                  <div>
                    <strong className="text-[18px] text-[#171331]">{data.projectOnTime.rate == null ? "—" : `${data.projectOnTime.rate}%`}</strong>
                    <span className="ml-2 text-[15px] font-semibold text-[#171331]">Dự án hoàn thành đúng hạn</span>
                    <CheckCircle2 className="ml-2 inline h-4 w-4 text-[#16c784]" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <UsersRound className="h-6 w-6 text-[#16c784]" />
                  <div className="flex items-baseline gap-2 whitespace-nowrap">
                    <strong className="text-[18px] text-[#171331]">{activeProjects}</strong>
                    <p className="text-[13px] text-[#6f6a8f]">Dự án đang thực hiện</p>
                  </div>
                </div>
            </div>
          </div>
          <div className="mb-3 flex justify-end gap-7 text-[14px] font-medium text-[#2b244d]">
            <span className="flex items-center gap-2"><i className="h-2.5 w-5 rounded-full bg-[#7049ff]" />Dự án mới</span>
            <span className="flex items-center gap-2"><i className="h-2.5 w-5 rounded-full bg-[#16c784]" />Dự án hoàn thành</span>
          </div>
          <div className="h-[310px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectChartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashPurple" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#7049ff" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#7049ff" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="dashGreen" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#16c784" stopOpacity={0.24} />
                    <stop offset="100%" stopColor="#16c784" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#edf0f7" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#8a849f", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#8a849f", fontSize: 12 }} width={36} />
                <Tooltip />
                <Area type="monotone" dataKey="newProjects" name="Dự án mới" stroke="#7049ff" strokeWidth={2.5} fill="url(#dashPurple)" dot={{ r: 3 }} />
                <Area type="monotone" dataKey="completedProjects" name="Dự án hoàn thành" stroke="#16c784" strokeWidth={2.5} fill="url(#dashGreen)" dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.article>

        <motion.article variants={item} className="rounded-2xl border border-[#edf0f7] bg-white p-5 shadow-[0_18px_50px_rgba(31,35,70,0.06)]">
          <h2 className="text-[20px] font-semibold text-[#171331]">Trạng thái công việc</h2>
          <strong className="mt-5 block text-[30px] text-[#171331]">{number(totalTasks)}</strong>
          <p className="text-sm text-[#6f6a8f]">Tổng số công việc · {completionRate}% đã hoàn thành</p>
          <div className="mt-5 grid items-center gap-5 sm:grid-cols-[180px_1fr] xl:grid-cols-1 2xl:grid-cols-[180px_1fr]">
            <div className="relative h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={taskChart} dataKey="value" innerRadius={58} outerRadius={78} paddingAngle={3}>
                    {taskChart.map((entry, index) => <Cell key={entry.label} fill={taskColors[index % taskColors.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <strong className="text-[24px] text-[#171331]">{number(totalTasks)}</strong>
                <span className="text-sm text-[#6f6a8f]">Tổng số</span>
              </div>
            </div>
            <div className="space-y-3">
              {taskChart.map((entry) => (
                <div key={entry.label} className="flex items-center justify-between gap-3 text-[14px]">
                  <span className="flex items-center gap-2 text-[#2b244d]"><i className="h-3 w-3 rounded" style={{ backgroundColor: entry.color }} />{entry.label}</span>
                  <strong className="text-[#171331]">{entry.value} <span className="font-normal text-[#8a849f]">({totalTasks ? Math.round((entry.value / totalTasks) * 100) : 0}%)</span></strong>
                </div>
              ))}
            </div>
          </div>
          <Link href="/workspace/tasks" className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-[#7049ff] text-[14px] font-semibold text-white">Xem toàn bộ công việc →</Link>
        </motion.article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr_360px]">
        <motion.article variants={item} className="rounded-2xl border border-[#edf0f7] bg-white p-5 shadow-[0_18px_50px_rgba(31,35,70,0.06)]">
          <SectionTitle title="Dự án gần đây" action="Xem tất cả" href="/workspace/projects" />
          <div className="mt-3 divide-y divide-[#edf0f7]">
            {data.activeProjects.slice(0, 4).map((project, index) => (
              <Link key={project.id} href={`/workspace/projects/${project.id}`} className="grid grid-cols-[42px_1fr_auto_auto] items-center gap-4 py-3 transition-colors hover:bg-[#f8f9fd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7049ff]">
                <span className="flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ backgroundColor: projectIconColors[index % projectIconColors.length] }}><Layers3 className="h-5 w-5" /></span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#171331]">{project.name}</p>
                  <p className="truncate text-xs text-[#6f6a8f]">Cập nhật gần đây</p>
                </div>
                <div className="hidden w-24 items-center gap-2 sm:flex">
                  <div className="h-1.5 flex-1 rounded-full bg-[#edf0f7]"><i className="block h-full rounded-full bg-[#7049ff]" style={{ width: `${project.progress}%` }} /></div>
                  <span className="text-xs font-semibold text-[#6f6a8f]">{project.progress}%</span>
                </div>
                <span className="text-xs font-semibold text-[#16c784]">Đang thực hiện</span>
              </Link>
            ))}
          </div>
        </motion.article>

        <motion.article variants={item} className="rounded-2xl border border-[#edf0f7] bg-white p-5 shadow-[0_18px_50px_rgba(31,35,70,0.06)]">
          <SectionTitle title="Công việc quá hạn" action="Xem tất cả" href="/workspace/finance/invoices" />
          <div className="mt-3 divide-y divide-[#edf0f7]">
            {(overdueTasks.length ? overdueTasks : data.latestInvoices.slice(0, 4)).map((row, index) => (
              <Link key={row.id} href={`/workspace/finance/invoices/${row.id}`} className="grid grid-cols-[42px_1fr_auto] items-center gap-4 py-3 transition-colors hover:bg-[#f8f9fd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7049ff]">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500"><AlertTriangle className="h-5 w-5" /></span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#171331]">{"number" in row ? row.number : row.customer}</p>
                  <p className="truncate text-xs text-[#6f6a8f]">Theo dõi xử lý công nợ / công việc</p>
                </div>
                <span className="text-xs font-semibold text-red-500">{(index + 1) * 2} ngày quá hạn</span>
              </Link>
            ))}
          </div>
        </motion.article>

        <motion.article variants={item} className="rounded-2xl border border-[#edf0f7] bg-white p-5 shadow-[0_18px_50px_rgba(31,35,70,0.06)]">
          <SectionTitle title="Lịch làm việc" action="Xem lịch đầy đủ" href="/workspace/calendar" />
          <p className="mt-4 text-sm font-semibold text-[#171331]">Thứ Hai, 29/06/2026</p>
          <div className="mt-4 space-y-4">
            {data.activities.slice(0, 4).map((activity, index) => (
              <Link key={activity.id} href={activityHref(activity)} className="grid grid-cols-[48px_10px_1fr] gap-3 rounded-lg transition-colors hover:bg-[#f8f9fd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7049ff]">
                <span className="text-xs font-semibold text-[#6f6a8f]">{["09:00", "11:00", "14:00", "16:00"][index]}</span>
                <i className="mt-1.5 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: projectIconColors[index % projectIconColors.length] }} />
                <div>
                  <p className="line-clamp-1 text-sm font-semibold text-[#171331]">{activity.title}</p>
                  <p className="line-clamp-1 text-xs text-[#6f6a8f]">{activity.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
          <button className="mt-5 h-10 w-full rounded-xl border border-[#dfe3f0] text-sm font-semibold text-[#7049ff]">+ Thêm lịch làm việc</button>
        </motion.article>
      </section>
    </motion.div>
  );
}

function KpiCard({ href, icon, tone, label, value, change }: { href: string; icon: ReactNode; tone: "purple" | "orange" | "blue" | "green"; label: string; value: string; change: number }) {
  const toneClass = {
    purple: "bg-[#7049ff]",
    orange: "bg-[#ff5a1f]",
    blue: "bg-[#1d9bf0]",
    green: "bg-[#16c784]",
  }[tone];
  return (
    <Link
      href={href}
      aria-label={`Xem ${label.toLocaleLowerCase("vi-VN")}`}
      className="group rounded-2xl border border-[#edf0f7] bg-white p-3 shadow-[0_18px_50px_rgba(31,35,70,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-[#7049ff]/30 hover:shadow-[0_20px_55px_rgba(31,35,70,0.11)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7049ff] sm:p-5"
    >
      <article className="relative min-h-[118px] pr-1 sm:min-h-[138px]">
        <div className="min-w-0 pr-2">
          <p className="text-xs font-medium text-[#6f6a8f] sm:text-sm">{label}</p>
          <strong className="mt-1 block break-words text-[18px] leading-tight text-[#171331] sm:mt-2 sm:text-[24px]">{value}</strong>
        </div>
        <span className={`absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform group-hover:scale-105 sm:h-12 sm:w-12 ${toneClass}`}>{icon}</span>
        <span className="absolute bottom-1 left-0 inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-600 sm:bottom-2 sm:text-xs">↑ {change}%</span>
      </article>
    </Link>
  );
}

function SectionTitle({ title, action, href }: { title: string; action: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-[18px] font-semibold text-[#171331]">{title}</h2>
      <Link href={href} className="text-sm font-semibold text-[#7049ff] hover:underline">{action}</Link>
    </div>
  );
}
