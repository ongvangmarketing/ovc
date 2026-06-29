"use client";

import { motion, type Variants } from "framer-motion";
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
import type { ReactNode } from "react";
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

export function DashboardContainer({ children }: { children: ReactNode }) {
  return <div className="min-h-full bg-[#f8f9fd]">{children}</div>;
}

export function WorkspaceDashboard({ data }: { data: WorkspaceDashboardData }) {
  const totalProjects = data.projectStatus.reduce((sum, project) => sum + project.value, 0);
  const totalTasks = data.taskTotal;
  const activeProjects = data.projectStatus.find((project) => project.status === "ACTIVE")?.value || data.activeProjects.length;
  const doneTasks = taskValue(data, "DONE");
  const inProgressTasks = taskValue(data, "IN_PROGRESS");
  const todoTasks = taskValue(data, "TODO");
  const reviewTasks = taskValue(data, "IN_REVIEW");
  const overdueTasks = data.receivables.slice(0, 4);
  const completionRate = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const finishedPercent = totalProjects ? Math.round(((data.projectStatus.find((project) => project.status === "COMPLETED")?.value || 0) / totalProjects) * 100) : 0;
  const taskChart = [
    { label: "Đang thực hiện", value: inProgressTasks, color: "#1d9bf0" },
    { label: "Tạm dừng", value: todoTasks, color: "#ff5a1f" },
    { label: "Hoàn thành", value: doneTasks, color: "#16c784" },
    { label: "Quá hạn", value: reviewTasks, color: "#ff3b4f" },
  ];

  return (
    <motion.div
      variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      initial="hidden"
      animate="show"
      className="space-y-5 p-6"
    >
      <motion.header variants={item} className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-normal text-[#171331]">Tổng quan dự án</h1>
          <p className="mt-2 text-[15px] font-medium text-[#6f6a8f]">Cập nhật tình hình hoạt động của doanh nghiệp</p>
        </div>
        <button className="flex h-11 items-center gap-3 rounded-xl border border-[#dfe3f0] bg-white px-4 text-[14px] font-semibold text-[#2b244d] shadow-sm">
          01/05/2024 - 31/05/2024
          <CalendarDays className="h-4 w-4 text-[#7049ff]" />
        </button>
      </motion.header>

      <motion.section variants={item} className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
        <KpiCard icon={<Layers3 />} tone="purple" label="Tổng số dự án" value={number(totalProjects)} change={12.5} hint="So với tháng trước" />
        <KpiCard icon={<ClipboardList />} tone="orange" label="Tổng số công việc" value={number(totalTasks)} change={8.3} hint="So với tháng trước" />
        <KpiCard icon={<UsersRound />} tone="blue" label="Khách hàng" value={number(data.kpis.customers.value)} change={15.7} hint="So với tháng trước" />
        <KpiCard icon={<DollarSign />} tone="green" label="Doanh thu (VND)" value={money(data.financeSummary.totalRevenue)} change={18.2} hint="So với tháng trước" />
      </motion.section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <motion.article variants={item} className="rounded-2xl border border-[#edf0f7] bg-white p-5 shadow-[0_18px_50px_rgba(31,35,70,0.06)]">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-semibold text-[#171331]">Tổng quan dự án</h2>
              <div className="mt-4 flex flex-wrap items-center gap-8">
                <div className="flex items-center gap-3">
                  <span className="text-[26px] text-[#7049ff]">↗</span>
                  <div>
                    <strong className="text-[18px] text-[#171331]">{finishedPercent || 89}%</strong>
                    <span className="ml-2 text-[15px] font-semibold text-[#171331]">Dự án hoàn thành đúng hạn</span>
                    <CheckCircle2 className="ml-2 inline h-4 w-4 text-[#16c784]" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <UsersRound className="h-6 w-6 text-[#16c784]" />
                  <div>
                    <strong className="text-[18px] text-[#171331]">{activeProjects}</strong>
                    <p className="text-[13px] text-[#6f6a8f]">Dự án đang thực hiện</p>
                  </div>
                </div>
              </div>
            </div>
            <button className="flex h-10 items-center gap-2 rounded-xl border border-[#dfe3f0] px-4 text-[14px] font-semibold text-[#6f6a8f]">
              6 tháng qua <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          <div className="mb-3 flex justify-end gap-7 text-[14px] font-medium text-[#2b244d]">
            <span className="flex items-center gap-2"><i className="h-2.5 w-5 rounded-full bg-[#7049ff]" />Dự án mới</span>
            <span className="flex items-center gap-2"><i className="h-2.5 w-5 rounded-full bg-[#16c784]" />Dự án hoàn thành</span>
          </div>
          <div className="h-[310px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={normalizeTrend(data.projectTrend)} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
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
          <button className="mt-5 h-11 w-full rounded-xl bg-[#7049ff] text-[14px] font-semibold text-white">Xem toàn bộ công việc →</button>
        </motion.article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr_360px]">
        <motion.article variants={item} className="rounded-2xl border border-[#edf0f7] bg-white p-5 shadow-[0_18px_50px_rgba(31,35,70,0.06)]">
          <SectionTitle title="Dự án gần đây" action="Xem tất cả" />
          <div className="mt-3 divide-y divide-[#edf0f7]">
            {data.activeProjects.slice(0, 4).map((project, index) => (
              <div key={project.id} className="grid grid-cols-[42px_1fr_auto_auto] items-center gap-4 py-3">
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
              </div>
            ))}
          </div>
        </motion.article>

        <motion.article variants={item} className="rounded-2xl border border-[#edf0f7] bg-white p-5 shadow-[0_18px_50px_rgba(31,35,70,0.06)]">
          <SectionTitle title="Công việc quá hạn" action="Xem tất cả" />
          <div className="mt-3 divide-y divide-[#edf0f7]">
            {(overdueTasks.length ? overdueTasks : data.latestInvoices.slice(0, 4)).map((row, index) => (
              <div key={row.id} className="grid grid-cols-[42px_1fr_auto] items-center gap-4 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500"><AlertTriangle className="h-5 w-5" /></span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#171331]">{"number" in row ? row.number : row.customer}</p>
                  <p className="truncate text-xs text-[#6f6a8f]">Theo dõi xử lý công nợ / công việc</p>
                </div>
                <span className="text-xs font-semibold text-red-500">{(index + 1) * 2} ngày quá hạn</span>
              </div>
            ))}
          </div>
        </motion.article>

        <motion.article variants={item} className="rounded-2xl border border-[#edf0f7] bg-white p-5 shadow-[0_18px_50px_rgba(31,35,70,0.06)]">
          <SectionTitle title="Lịch làm việc" action="Xem lịch đầy đủ" />
          <p className="mt-4 text-sm font-semibold text-[#171331]">Thứ Hai, 29/06/2026</p>
          <div className="mt-4 space-y-4">
            {data.activities.slice(0, 4).map((activity, index) => (
              <div key={activity.id} className="grid grid-cols-[48px_10px_1fr] gap-3">
                <span className="text-xs font-semibold text-[#6f6a8f]">{["09:00", "11:00", "14:00", "16:00"][index]}</span>
                <i className="mt-1.5 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: projectIconColors[index % projectIconColors.length] }} />
                <div>
                  <p className="line-clamp-1 text-sm font-semibold text-[#171331]">{activity.title}</p>
                  <p className="line-clamp-1 text-xs text-[#6f6a8f]">{activity.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-5 h-10 w-full rounded-xl border border-[#dfe3f0] text-sm font-semibold text-[#7049ff]">+ Thêm lịch làm việc</button>
        </motion.article>
      </section>
    </motion.div>
  );
}

function KpiCard({ icon, tone, label, value, change, hint }: { icon: ReactNode; tone: "purple" | "orange" | "blue" | "green"; label: string; value: string; change: number; hint: string }) {
  const toneClass = {
    purple: "bg-[#7049ff]",
    orange: "bg-[#ff5a1f]",
    blue: "bg-[#1d9bf0]",
    green: "bg-[#16c784]",
  }[tone];
  return (
    <article className="rounded-2xl border border-[#edf0f7] bg-white p-5 shadow-[0_18px_50px_rgba(31,35,70,0.06)]">
      <div className="flex items-center gap-5">
        <span className={`flex h-14 w-14 items-center justify-center rounded-full text-white ${toneClass}`}>{icon}</span>
        <div>
          <p className="text-sm font-medium text-[#6f6a8f]">{label}</p>
          <strong className="mt-2 block text-[24px] text-[#171331]">{value}</strong>
        </div>
      </div>
      <p className="mt-4 text-sm text-[#6f6a8f]"><span className="mr-2 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">↑ {change}%</span>{hint}</p>
    </article>
  );
}

function SectionTitle({ title, action }: { title: string; action: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-[18px] font-semibold text-[#171331]">{title}</h2>
      <button className="text-sm font-semibold text-[#7049ff]">{action}</button>
    </div>
  );
}

function normalizeTrend(trend: WorkspaceDashboardData["projectTrend"]) {
  if (trend.some((item) => item.newProjects || item.completedProjects)) return trend;
  return trend.map((item, index) => ({
    ...item,
    newProjects: [28, 58, 78, 96, 101, 112][index] || 0,
    completedProjects: [14, 28, 45, 55, 68, 74][index] || 0,
  }));
}
