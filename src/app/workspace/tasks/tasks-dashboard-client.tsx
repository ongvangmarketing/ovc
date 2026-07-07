"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import type { Dispatch, ElementType, SetStateAction } from "react";
import Link from "next/link";
import { 
  Activity, 
  CalendarDays, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Clock3, 
  FolderKanban, 
  LayoutList, 
  Search, 
  TimerReset, 
  User,
  Plus,
  MoreHorizontal,
  AlignLeft
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDate, getInitials } from "@/lib/utils/format";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { updateTaskStatus } from "@/app/actions/projects";

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

const statusLabels: Record<string, { label: string, color: string }> = {
  BACKLOG: { label: "Backlog", color: "bg-slate-100 text-slate-700" },
  TODO: { label: "To Do", color: "bg-slate-100 text-slate-700" },
  IN_PROGRESS: { label: "In Progress", color: "bg-indigo-100 text-indigo-700" },
  IN_REVIEW: { label: "Review", color: "bg-amber-100 text-amber-700" },
  DONE: { label: "Done", color: "bg-emerald-100 text-emerald-700" },
};

const statusOrder = ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

function dateKey(value?: string | Date | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function isOverdue(task: TaskItem) {
  if (!task.dueDate || ["DONE", "CANCELLED"].includes(task.status)) return false;
  return new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);
}

export function TasksDashboardClient({ tasks, mode = "tasks" }: { tasks: TaskItem[]; mode?: "tasks" | "timeline" | "calendar" | "project" }) {
  const [taskRows, setTaskRows] = useState(tasks);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    setTaskRows(tasks);
  }, [tasks]);

  const filtered = useMemo(() => taskRows.filter((task) => {
    const haystack = `${task.title} ${task.description || ""} ${task.project.name} ${task.assignee?.name || ""}`.toLowerCase();
    return haystack.includes(search.toLowerCase()) && (statusFilter === "ALL" || task.status === statusFilter);
  }), [taskRows, search, statusFilter]);

  const stats = useMemo(() => ({
    total: taskRows.length,
    doing: taskRows.filter((task) => task.status === "IN_PROGRESS").length,
    done: taskRows.filter((task) => task.status === "DONE").length,
    overdue: taskRows.filter(isOverdue).length,
  }), [taskRows]);

  const title = mode === "timeline" ? "Gantt Timeline" : mode === "calendar" ? "Lịch làm việc" : mode === "project" ? "Nhiệm vụ Dự án" : "Quản lý Nhiệm vụ";
  const subtitle = mode === "timeline"
    ? "Theo dõi tiến độ dự án trên biểu đồ Gantt trực quan."
    : mode === "calendar"
      ? "Lịch trình công việc hàng ngày của bạn."
      : "Sắp xếp công việc với bảng Kanban, kéo thẻ để đổi trạng thái.";

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-slate-50/50">
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <FolderKanban className="w-6 h-6 text-indigo-500" />
              {title}
            </h1>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          </div>
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Tạo nhiệm vụ
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Stat icon={LayoutList} label="Tổng nhiệm vụ" value={stats.total} tone="bg-slate-100 text-slate-700" />
          <Stat icon={Activity} label="Đang làm" value={stats.doing} tone="bg-indigo-50 text-indigo-600" />
          <Stat icon={CheckCircle2} label="Hoàn thành" value={stats.done} tone="bg-emerald-50 text-emerald-600" />
          <Stat icon={TimerReset} label="Quá hạn" value={stats.overdue} tone="bg-rose-50 text-rose-600" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm công việc..." className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 transition-all w-full" />
            </div>
            
            {mode !== "calendar" && mode !== "timeline" && (
              <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 overflow-x-auto">
                <button onClick={() => setStatusFilter("ALL")} className={cn("px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap", statusFilter === "ALL" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900")}>Tất cả</button>
                {statusOrder.map((s) => (
                  <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap", statusFilter === s ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900")}>
                    {statusLabels[s]?.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto bg-slate-50/50">
            {mode === "timeline" ? (
              <GanttView tasks={filtered} />
            ) : mode === "calendar" ? (
              <IOSCalendarView tasks={filtered} />
            ) : (
              <KanbanView tasks={filtered} onTasksChange={setTaskRows} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: ElementType; label: string; value: number; tone: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-xs font-medium text-slate-500 mt-0.5">{label}</div>
      </div>
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", tone)}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// KANBAN VIEW
// -------------------------------------------------------------
function KanbanView({ tasks, onTasksChange }: { tasks: TaskItem[]; onTasksChange: Dispatch<SetStateAction<TaskItem[]>> }) {
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTask(tasks.find((task) => task.id === String(event.active.id)) || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const taskId = String(event.active.id);
    const nextStatus = String(event.over?.id || "");
    const task = tasks.find((item) => item.id === taskId);
    if (!task || !statusOrder.includes(nextStatus) || task.status === nextStatus) return;

    onTasksChange((current) =>
      current.map((item) => item.id === taskId ? { ...item, status: nextStatus } : item)
    );

    const result = await updateTaskStatus(task.id, task.project.id, nextStatus as any);
    if (!result.success) {
      onTasksChange((current) =>
        current.map((item) => item.id === taskId ? { ...item, status: task.status } : item)
      );
      alert("Không cập nhật được trạng thái công việc.");
    }
  };

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex h-full gap-4 p-4 overflow-x-auto items-start">
          {statusOrder.map((status) => {
            const list = tasks.filter(t => t.status === status);
            const config = statusLabels[status] || { label: status, color: "bg-slate-100 text-slate-700" };
            return (
              <TaskColumn key={status} status={status} config={config} count={list.length}>
                {list.map(task => (
                  <TaskKanbanCard key={task.id} task={task} onOpen={() => setSelectedTask(task)} />
                ))}
                <button className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 font-medium text-sm flex items-center justify-center gap-1 hover:border-indigo-300 hover:text-indigo-600 transition-colors bg-white/50">
                  <Plus className="w-4 h-4" /> Thêm thẻ
                </button>
              </TaskColumn>
            );
          })}
        </div>
        <DragOverlay>
          {activeTask ? <TaskCardContent task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
      {selectedTask ? <TaskQuickModal task={selectedTask} onClose={() => setSelectedTask(null)} /> : null}
    </>
  );
}

function TaskColumn({ status, config, count, children }: { status: string; config: { label: string; color: string }; count: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div ref={setNodeRef} className={cn("w-80 shrink-0 flex flex-col max-h-full rounded-2xl p-2 transition-colors", isOver && "bg-indigo-50 ring-2 ring-indigo-200")}>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
          <span className={cn("w-2 h-2 rounded-full", config.color.split(" ")[0])} />
          {config.label}
        </h3>
        <span className="text-xs font-bold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-full">{count}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">{children}</div>
    </div>
  );
}

function TaskKanbanCard({ task, onOpen }: { task: TaskItem; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = { transform: CSS.Translate.toString(transform) };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onOpen} className={cn(isDragging && "opacity-40")}>
      <TaskCardContent task={task} />
    </div>
  );
}

function TaskCardContent({ task }: { task: TaskItem }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group">
      <div className="flex justify-between items-start mb-2">
        <span className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border", task.priority === "HIGH" ? "bg-rose-50 text-rose-600 border-rose-200" : task.priority === "MEDIUM" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-slate-50 text-slate-600 border-slate-200")}>
          {task.priority}
        </span>
        <button className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <h4 className="font-semibold text-slate-900 text-sm mb-1 leading-snug group-hover:text-indigo-600 transition-colors">{task.title}</h4>
      <p className="text-xs text-slate-500 mb-4 line-clamp-2">{task.project.name}</p>
      
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold border border-white shadow-sm" title={task.assignee?.name || "Chưa gán"}>
            {task.assignee ? getInitials(task.assignee.name || "") : "?"}
          </div>
        </div>
        {task.dueDate && (
          <div className={cn("flex items-center gap-1 text-xs font-medium", isOverdue(task) ? "text-rose-500" : "text-slate-500")}>
            <Clock3 className="w-3.5 h-3.5" />
            {new Date(task.dueDate).toLocaleDateString("vi-VN", { month: "short", day: "numeric" })}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskQuickModal({ task, onClose }: { task: TaskItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <span className={cn("inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase", task.priority === "HIGH" ? "bg-rose-50 text-rose-600 border-rose-200" : task.priority === "MEDIUM" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-slate-50 text-slate-600 border-slate-200")}>{task.priority}</span>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">{task.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{task.project.name}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <ChevronRight className="h-4 w-4 rotate-45" />
          </button>
        </div>
        <div className="space-y-4 px-5 py-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Trạng thái</div>
              <div className="mt-1 font-semibold text-slate-900">{statusLabels[task.status]?.label || task.status}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Hạn xử lý</div>
              <div className="mt-1 font-semibold text-slate-900">{task.dueDate ? formatDate(new Date(task.dueDate)) : "Chưa đặt"}</div>
            </div>
          </div>
          {task.description ? <p className="whitespace-pre-wrap text-slate-600">{task.description}</p> : null}
        </div>
        <div className="flex justify-end border-t border-slate-100 px-5 py-4">
          <button onClick={onClose} className="h-9 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800">Đóng</button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// GANTT VIEW
// -------------------------------------------------------------
function GanttView({ tasks }: { tasks: TaskItem[] }) {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
  const daysInView = 60; // Render 60 days
  
  const dates = Array.from({ length: daysInView }).map((_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
        <div className="w-64 shrink-0 border-r border-slate-200 p-3 font-semibold text-sm text-slate-700 flex items-center">
          Tên nhiệm vụ
        </div>
        <div className="flex-1 overflow-x-auto flex">
          {dates.map((d, i) => (
            <div key={i} className="w-10 shrink-0 border-r border-slate-200 flex flex-col items-center justify-center py-2">
              <span className="text-[10px] text-slate-500 uppercase">{d.toLocaleDateString("vi-VN", { weekday: "short" })}</span>
              <span className={cn("text-xs font-bold mt-0.5", dateKey(d) === dateKey(now) ? "bg-indigo-500 text-white w-5 h-5 rounded-full flex items-center justify-center" : "text-slate-900")}>
                {d.getDate()}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {tasks.map(task => {
          const tStart = task.startDate ? new Date(task.startDate) : new Date(now);
          const tEnd = task.dueDate ? new Date(task.dueDate) : new Date(tStart.getTime() + 86400000 * 3);
          
          let startIndex = Math.floor((tStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          let duration = Math.floor((tEnd.getTime() - tStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          
          if (startIndex < 0) {
            duration += startIndex;
            startIndex = 0;
          }
          
          const isDone = task.status === "DONE";
          
          return (
            <div key={task.id} className="flex border-b border-slate-100 hover:bg-slate-50 transition-colors group">
              <div className="w-64 shrink-0 border-r border-slate-200 p-3 flex flex-col justify-center bg-white group-hover:bg-slate-50 z-10 sticky left-0">
                <span className="text-sm font-medium text-slate-900 truncate">{task.title}</span>
                <span className="text-xs text-slate-500 truncate mt-0.5">{task.project.name}</span>
              </div>
              <div className="flex-1 relative min-h-[50px] overflow-hidden flex">
                {dates.map((_, i) => (
                  <div key={i} className="w-10 shrink-0 border-r border-slate-100/50" />
                ))}
                
                {startIndex >= 0 && startIndex < daysInView && (
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 h-6 rounded-md shadow-sm border border-black/5 flex items-center px-2 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden"
                    style={{ 
                      left: `${startIndex * 40}px`, 
                      width: `${Math.min(duration, daysInView - startIndex) * 40 - 4}px`,
                      backgroundColor: isDone ? "#10B981" : "#4F46E5"
                    }}
                  >
                    <span className="text-[10px] font-bold text-white truncate drop-shadow-sm">{task.title}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// IPHONE-STYLE CALENDAR VIEW
// -------------------------------------------------------------
function IOSCalendarView({ tasks }: { tasks: TaskItem[] }) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });

  const [selectedDate, setSelectedDate] = useState<Date>(cursor);

  const monthLabel = cursor.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const startOffset = (monthStart.getDay() + 6) % 7; // Start on Monday
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

  const selectedDateKey = dateKey(selectedDate);
  const todayKey = dateKey(new Date());

  const selectedTasks = useMemo(() => {
    return tasks.filter(t => {
      const d1 = dateKey(t.startDate);
      const d2 = dateKey(t.dueDate);
      return d1 === selectedDateKey || d2 === selectedDateKey;
    });
  }, [tasks, selectedDateKey]);

  return (
    <div className="h-full flex flex-col md:flex-row bg-white rounded-xl overflow-hidden">
      {/* Calendar Grid (Top on mobile, Left on Desktop) */}
      <div className="w-full md:w-[380px] shrink-0 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col bg-slate-50/50">
        <header className="flex items-center justify-between p-4 bg-white">
          <h3 className="text-lg font-bold capitalize text-slate-900">{monthLabel}</h3>
          <div className="flex items-center gap-1">
            <button onClick={() => goMonth(-1)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"><ChevronLeft className="w-5 h-5"/></button>
            <button onClick={() => { const now = new Date(); setCursor(now); setSelectedDate(now); }} className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-colors">Hôm nay</button>
            <button onClick={() => goMonth(1)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"><ChevronRight className="w-5 h-5"/></button>
          </div>
        </header>

        <div className="p-4 bg-white">
          <div className="grid grid-cols-7 mb-2 text-center text-[10px] font-bold uppercase text-slate-400">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => <div key={day}>{day}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-y-2">
            {days.map((day, i) => {
              const key = dateKey(day);
              const isSelected = key === selectedDateKey;
              const isToday = key === todayKey;
              const inMonth = day.getMonth() === cursor.getMonth();
              const hasTask = tasks.some(t => dateKey(t.dueDate) === key || dateKey(t.startDate) === key);

              return (
                <div key={i} className="flex justify-center items-center h-10 relative cursor-pointer group" onClick={() => setSelectedDate(day)}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                    isSelected ? (isToday ? "bg-indigo-600 text-white shadow-md" : "bg-slate-900 text-white shadow-md") :
                    isToday ? "text-indigo-600 font-bold" :
                    inMonth ? "text-slate-800 group-hover:bg-slate-100" : "text-slate-400"
                  )}>
                    {day.getDate()}
                  </div>
                  {hasTask && !isSelected && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-slate-300" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Agenda List (Bottom on mobile, Right on Desktop) */}
      <div className="flex-1 flex flex-col bg-slate-100/50">
        <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10 flex items-center gap-3">
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-slate-500 uppercase">{selectedDate.toLocaleDateString("vi-VN", { weekday: "short" })}</span>
            <span className="text-2xl font-bold text-slate-900 leading-none mt-0.5">{selectedDate.getDate()}</span>
          </div>
          <div className="w-px h-8 bg-slate-200 mx-2" />
          <div>
            <h3 className="font-semibold text-slate-900">Lịch trình trong ngày</h3>
            <p className="text-xs text-slate-500">{selectedTasks.length} nhiệm vụ</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedDateKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {selectedTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-slate-300">
                    <CalendarDays className="w-8 h-8" />
                  </div>
                  <h4 className="font-medium text-slate-900">Trống lịch</h4>
                  <p className="text-sm text-slate-500 mt-1">Không có công việc nào trong ngày này.</p>
                </div>
              ) : (
                selectedTasks.map(task => (
                  <div key={task.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex gap-4 relative overflow-hidden group">
                    <div className={cn("absolute left-0 top-0 bottom-0 w-1", statusLabels[task.status]?.color.split(" ")[0])} />
                    <div className="w-12 shrink-0 flex flex-col items-center pt-1">
                      <span className="text-xs font-bold text-slate-800">
                        {task.dueDate ? new Date(task.dueDate).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "All-day"}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold mt-1 uppercase">
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                      <p className="text-sm text-slate-500 mt-1 truncate">{task.project.name}</p>
                      
                      <div className="flex items-center gap-3 mt-3">
                        <span className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border", statusLabels[task.status]?.color)}>
                          {statusLabels[task.status]?.label}
                        </span>
                        {task.assignee && (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {task.assignee.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
