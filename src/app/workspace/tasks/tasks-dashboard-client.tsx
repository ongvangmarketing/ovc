"use client";

import { useMemo, useState } from "react";
import type { ElementType } from "react";
import Link from "next/link";
import { Activity, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, FolderKanban, LayoutList, Search, TimerReset, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDate, getInitials } from "@/lib/utils/format";

type TaskItem = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  startDate?: string | Date | null;
  dueDate?: string | Date | null;
  tags: string[];
  project: { id: string; name: string; color?: string | null; status?: string | null };
  assignee?: { id: string; name?: string | null; email?: string | null } | null;
  subtasks?: Array<{ id: string; status: string }>;
  comments?: Array<{ id: string }>;
  attachments?: Array<{ id: string }>;
};

const statusLabels: Record<string, string> = {
  BACKLOG: "Chưa bắt đầu",
  TODO: "Cần làm",
  IN_PROGRESS: "Đang làm",
  IN_REVIEW: "Đang duyệt",
  DONE: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const statusTone: Record<string, string> = {
  BACKLOG: "bg-zinc-100 text-zinc-700",
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  IN_REVIEW: "bg-amber-100 text-amber-700",
  DONE: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

function dateKey(value?: string | Date | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function isOverdue(task: TaskItem) {
  if (!task.dueDate || ["DONE", "CANCELLED"].includes(task.status)) return false;
  return new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);
}

export function TasksDashboardClient({ tasks, mode = "tasks" }: { tasks: TaskItem[]; mode?: "tasks" | "timeline" | "calendar" | "project" }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const filtered = useMemo(() => tasks.filter((task) => {
    const haystack = `${task.title} ${task.description || ""} ${task.project.name} ${task.assignee?.name || ""}`.toLowerCase();
    return haystack.includes(search.toLowerCase()) && (status === "ALL" || task.status === status);
  }), [tasks, search, status]);

  const stats = useMemo(() => ({
    total: tasks.length,
    doing: tasks.filter((task) => task.status === "IN_PROGRESS").length,
    done: tasks.filter((task) => task.status === "DONE").length,
    overdue: tasks.filter(isOverdue).length,
  }), [tasks]);

  const title = mode === "timeline" ? "Timeline công việc" : mode === "calendar" ? "Calendar công việc" : mode === "project" ? "Dashboard nhiệm vụ dự án" : "Dashboard công việc";
  const subtitle = mode === "timeline"
    ? "Theo dõi luồng việc theo mốc bắt đầu và hạn hoàn thành."
    : mode === "calendar"
      ? "Xem công việc theo lịch tháng để sắp xếp ưu tiên."
      : "Tổng hợp nhiệm vụ từ tất cả dự án trong workspace.";

  return (
    <div className="page-container bg-[#f7f9fd]">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <FolderKanban className="h-3.5 w-3.5" />
            Work OS
          </div>
          <h2 className="mt-2 text-2xl font-bold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Stat icon={LayoutList} label="Tổng nhiệm vụ" value={stats.total} tone="bg-primary/10 text-primary" />
        <Stat icon={Activity} label="Đang làm" value={stats.doing} tone="bg-blue-50 text-blue-600" />
        <Stat icon={CheckCircle2} label="Hoàn thành" value={stats.done} tone="bg-emerald-50 text-emerald-600" />
        <Stat icon={TimerReset} label="Quá hạn" value={stats.overdue} tone="bg-red-50 text-red-600" />
      </div>

      <div className="card-base p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-64 flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm nhiệm vụ, dự án, người làm..." className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20" />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20">
            <option value="ALL">Tất cả trạng thái</option>
            {Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
      </div>

      {mode === "timeline" ? <TimelineView tasks={filtered} /> : mode === "calendar" ? <CalendarView tasks={filtered} /> : <TaskList tasks={filtered} />}
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: ElementType; label: string; value: number; tone: string }) {
  return (
    <article className="stat-card">
      <div className="flex items-center justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", tone)}><Icon className="h-4 w-4" /></div>
        <strong className="text-2xl text-foreground">{value}</strong>
      </div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </article>
  );
}

function TaskList({ tasks }: { tasks: TaskItem[] }) {
  return (
    <div className="card-base overflow-hidden">
      <div className="divide-y divide-border">
        {tasks.map((task) => <TaskRow key={task.id} task={task} />)}
        {!tasks.length ? <Empty /> : null}
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: TaskItem }) {
  const doneSubtasks = task.subtasks?.filter((item) => item.status === "DONE").length || 0;
  return (
    <Link href={`/workspace/projects/${task.project.id}`} className="grid gap-4 p-4 transition-colors hover:bg-muted/50 lg:grid-cols-[1.4fr_180px_160px_140px] lg:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white" style={{ backgroundColor: task.project.color || "#F59E0B" }}>{getInitials(task.project.name)}</div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{task.title}</p>
          <p className="truncate text-xs text-muted-foreground">{task.project.name}</p>
        </div>
      </div>
      <span className={cn("badge-status w-fit", statusTone[task.status] || "bg-muted text-muted-foreground")}>{statusLabels[task.status] || task.status}</span>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <User className="h-4 w-4" />
        <span className="truncate">{task.assignee?.name || "Chưa gán"}</span>
      </div>
      <div className="text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5"><Clock3 className="h-4 w-4" />{task.dueDate ? formatDate(task.dueDate) : "Chưa đặt"}</div>
        <p className="mt-1 text-xs">{doneSubtasks}/{task.subtasks?.length || 0} việc con</p>
      </div>
    </Link>
  );
}

function TimelineView({ tasks }: { tasks: TaskItem[] }) {
  return (
    <div className="card-base p-5">
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <div key={task.id} className="grid gap-3 rounded-2xl border border-border p-4 lg:grid-cols-[120px_1fr_140px] lg:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</span>
              <span className="text-xs font-semibold text-muted-foreground">{task.startDate ? formatDate(task.startDate) : "Chưa bắt đầu"}</span>
            </div>
            <div>
              <p className="font-semibold text-foreground">{task.title}</p>
              <div className="mt-2 h-2 rounded-full bg-muted">
                <div className={cn("h-full rounded-full", task.status === "DONE" ? "bg-emerald-500" : task.status === "IN_PROGRESS" ? "bg-blue-500" : "bg-primary")} style={{ width: task.status === "DONE" ? "100%" : task.status === "IN_PROGRESS" ? "62%" : "28%" }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{task.project.name}</p>
            </div>
            <div className="text-sm text-muted-foreground">{task.dueDate ? formatDate(task.dueDate) : "Chưa có hạn"}</div>
          </div>
        ))}
        {!tasks.length ? <Empty /> : null}
      </div>
    </div>
  );
}

function CalendarView({ tasks }: { tasks: TaskItem[] }) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const todayKey = dateKey(new Date());
  const monthLabel = cursor.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  const startOffset = (monthStart.getDay() + 6) % 7;
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - startOffset);
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });

  const goMonth = (step: number) => {
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + step, 1));
  };

  const goToday = () => {
    const now = new Date();
    setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  return (
    <section className="card-base overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold capitalize text-foreground">{monthLabel}</h3>
            <p className="text-xs text-muted-foreground">{formatDate(monthStart)} - {formatDate(monthEnd)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => goMonth(-1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Tháng trước">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={goToday} className="h-9 rounded-lg border border-border px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
            Hôm nay
          </button>
          <button type="button" onClick={() => goMonth(1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Tháng sau">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-xs font-semibold uppercase text-muted-foreground">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
          <div key={day} className="border-r border-border px-2 py-3 last:border-r-0">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7">
        {days.map((day) => {
          const key = dateKey(day);
          const inMonth = day.getMonth() === cursor.getMonth();
          const dayTasks = tasks.filter((task) => dateKey(task.dueDate) === key || dateKey(task.startDate) === key);
          return (
            <div key={key} className={cn("min-h-36 border-b border-r border-border p-2 last:border-r-0 md:min-h-40", !inMonth && "bg-muted/25 text-muted-foreground")}>
              <div className="mb-2 flex items-center justify-between">
                <span className={cn("flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold", key === todayKey ? "bg-primary text-white" : inMonth ? "text-foreground" : "text-muted-foreground")}>
                  {day.getDate()}
                </span>
                {dayTasks.length ? <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">{dayTasks.length}</span> : null}
              </div>
              <div className="space-y-1.5">
                {dayTasks.slice(0, 4).map((task) => (
                  <Link
                    key={task.id}
                    href={`/workspace/projects/${task.project.id}`}
                    className="block rounded-lg border border-border bg-white px-2 py-1.5 text-xs shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: task.project.color || "#F59E0B" }} />
                      <span className="truncate font-semibold text-foreground">{task.title}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{task.project.name}</p>
                  </Link>
                ))}
                {dayTasks.length > 4 ? (
                  <span className="block rounded-lg bg-muted px-2 py-1 text-center text-[11px] font-semibold text-muted-foreground">+{dayTasks.length - 4} việc nữa</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Empty() {
  return <div className="p-10 text-center text-sm text-muted-foreground">Chưa có nhiệm vụ phù hợp.</div>;
}
