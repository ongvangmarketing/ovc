"use client";

import { useMemo, useState, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
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
  Share2
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDate, getInitials } from "@/lib/utils/format";
import { ShareResourceModal } from "@/modules/core/components/role-permission/share-resource-modal";
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
import { updateTaskStatus } from "@/modules/projects/actions/project.actions";

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

const statusLabels: Record<string, { label: string, dot: string }> = {
  BACKLOG: { label: "Backlog", dot: "bg-gray-400" },
  TODO: { label: "To Do", dot: "bg-gray-400" },
  IN_PROGRESS: { label: "In Progress", dot: "bg-blue-500" },
  IN_REVIEW: { label: "Review", dot: "bg-amber-500" },
  DONE: { label: "Done", dot: "bg-emerald-500" },
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

  const title = mode === "timeline" ? "Gantt Timeline," : mode === "calendar" ? "Lịch trình" : mode === "project" ? "Nhiệm vụ dự án," : "Quản lý công việc,";
  const subtitle = mode === "timeline"
    ? "theo dõi và giám sát tiến độ dự án."
    : mode === "calendar"
      ? "và công việc hàng ngày."
      : "sắp xếp nhiệm vụ.";

  const todayDate = new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-8 sm:py-12">
        {/* Top Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[#eaeaea] pb-8">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="w-fit rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                {mode === "project" ? "Dự án" : "Công việc"}
              </span>
              <span className="text-[13px] font-medium text-gray-500">{todayDate}</span>
            </div>
            <h1 className="mb-3 text-[32px] font-medium leading-[1.15] tracking-tight text-black md:text-[40px]">
              {title} <span className="text-gray-400">{subtitle}</span>
            </h1>
          </div>
          
          <div className="mt-4 flex flex-wrap items-center gap-6 md:mt-0">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Tổng</span>
              <span className="text-[28px] font-medium tracking-tight text-black">{stats.total}</span>
            </div>
            <div className="h-10 w-[1px] bg-[#eaeaea]"></div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Hoàn thành</span>
              <span className="text-[28px] font-medium tracking-tight text-black">{stats.done}</span>
            </div>
            <div className="h-10 w-[1px] bg-[#eaeaea]"></div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Quá hạn</span>
              <span className={cn("text-[28px] font-medium tracking-tight", stats.overdue > 0 ? "text-rose-600" : "text-black")}>{stats.overdue}</span>
            </div>
            <div className="hidden h-10 w-[1px] bg-[#eaeaea] sm:block"></div>
            <button className="hidden h-10 items-center justify-center rounded-full bg-black px-5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 sm:inline-flex">
              <Plus className="mr-2 h-4 w-4" />
              Tạo mới
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="mb-4 flex flex-col justify-between rounded-2xl border border-[#eaeaea] bg-white px-2 py-1.5 shadow-sm md:flex-row md:items-center">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Tìm công việc, dự án..." 
                className="w-full bg-transparent pl-11 pr-4 py-2 text-[14px] text-black outline-none placeholder:text-gray-400" 
              />
            </div>
            
            {mode !== "calendar" && mode !== "timeline" && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-t md:border-t-0 md:border-l border-[#eaeaea]">
                <span className="text-[13px] text-gray-500 font-medium mr-2">Trạng thái:</span>
                <div className="flex overflow-x-auto">
                  <button onClick={() => setStatusFilter("ALL")} className={cn("whitespace-nowrap rounded-lg border px-4 py-1.5 text-[13px] font-medium transition-colors", statusFilter === "ALL" ? "bg-black text-white border-black" : "bg-white text-gray-600 border-transparent hover:bg-gray-50")}>Tất cả</button>
                  {statusOrder.map((s) => (
                    <button key={s} onClick={() => setStatusFilter(s)} className={cn("whitespace-nowrap rounded-lg border px-4 py-1.5 text-[13px] font-medium transition-colors", statusFilter === s ? "bg-black text-white border-black" : "bg-white text-gray-600 border-transparent hover:bg-gray-50")}>
                      {statusLabels[s]?.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto bg-white pt-4">
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
        <div className="flex h-full gap-6 p-6 overflow-x-auto items-start">
          {statusOrder.map((status) => {
            const list = tasks.filter(t => t.status === status);
            const config = statusLabels[status] || { label: status, dot: "bg-gray-400" };
            return (
              <TaskColumn key={status} status={status} config={config} count={list.length}>
                {list.map(task => (
                  <TaskKanbanCard key={task.id} task={task} onOpen={() => setSelectedTask(task)} />
                ))}
                <button className="w-full py-2.5 rounded-lg border border-dashed border-[#eaeaea] text-gray-500 font-medium text-[13px] flex items-center justify-center gap-2 hover:border-black hover:text-black transition-colors bg-white">
                  <Plus className="w-4 h-4" /> Thêm nhiệm vụ
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

function TaskColumn({ status, config, count, children }: { status: string; config: { label: string; dot: string }; count: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div ref={setNodeRef} className={cn("w-[320px] shrink-0 flex flex-col max-h-full rounded-xl transition-colors", isOver && "bg-gray-100/50 ring-1 ring-[#eaeaea]")}>
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-medium text-black flex items-center gap-2 text-[14px]">
          <span className={cn("w-2 h-2 rounded-full", config.dot)} />
          {config.label}
        </h3>
        <span className="text-[12px] font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full border border-[#eaeaea]">{count}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pb-4 px-1">{children}</div>
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
    <div className="bg-white p-5 rounded-xl border border-[#eaeaea] shadow-sm hover:border-black transition-colors cursor-pointer group">
      <div className="flex justify-between items-start mb-3">
        <span className={cn(
          "rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest bg-white", 
          task.priority === "HIGH" || task.priority === "URGENT" ? "text-rose-600 border-[#eaeaea]" : 
          task.priority === "MEDIUM" ? "text-blue-600 border-[#eaeaea]" : 
          "text-gray-600 border-[#eaeaea]"
        )}>
          {task.priority}
        </span>
        <button className="text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <h4 className="font-medium text-black text-[14px] leading-snug mb-1.5">{task.title}</h4>
      <p className="text-[12px] text-gray-500 mb-4 line-clamp-1">{task.project.name}</p>
      
      <div className="flex items-center justify-between pt-4 border-t border-[#eaeaea]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-[10px] font-semibold border border-[#eaeaea]" title={task.assignee?.name || "Chưa gán"}>
            {task.assignee ? getInitials(task.assignee.name || "") : "?"}
          </div>
        </div>
        {task.dueDate && (
          <div className={cn("flex items-center gap-1.5 text-[12px] font-medium", isOverdue(task) ? "text-rose-600" : "text-gray-500")}>
            <Clock3 className="w-3.5 h-3.5" />
            {new Date(task.dueDate).toLocaleDateString("vi-VN", { month: "short", day: "numeric" })}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskQuickModal({ task, onClose }: { task: TaskItem; onClose: () => void }) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[#eaeaea] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#eaeaea] px-6 py-5">
          <div>
            <span className="inline-flex rounded-md border border-[#eaeaea] px-2 py-0.5 text-[10px] font-semibold uppercase text-gray-600 bg-gray-50">
              {task.priority}
            </span>
            <h3 className="mt-3 text-[20px] font-medium tracking-tight text-black">{task.title}</h3>
            <p className="mt-1 text-[13px] text-gray-500">{task.project.name}</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-black transition-colors">
            <ChevronRight className="h-4 w-4 rotate-45" />
          </button>
        </div>
        <div className="space-y-6 px-6 py-5 text-[14px]">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#eaeaea] p-4 bg-gray-50/50">
              <div className="text-[12px] text-gray-500 font-medium uppercase tracking-wider">Trạng thái</div>
              <div className="mt-1.5 font-medium text-black flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full", statusLabels[task.status]?.dot || "bg-gray-400")} />
                {statusLabels[task.status]?.label || task.status}
              </div>
            </div>
            <div className="rounded-xl border border-[#eaeaea] p-4 bg-gray-50/50">
              <div className="text-[12px] text-gray-500 font-medium uppercase tracking-wider">Hạn xử lý</div>
              <div className="mt-1.5 font-medium text-black">{task.dueDate ? formatDate(new Date(task.dueDate)) : "Chưa đặt"}</div>
            </div>
          </div>
          {task.description ? <p className="whitespace-pre-wrap text-gray-600 leading-relaxed">{task.description}</p> : null}
        </div>
        <div className="flex justify-end gap-3 border-t border-[#eaeaea] px-6 py-4 bg-gray-50 rounded-b-2xl">
          <button onClick={() => setIsShareModalOpen(true)} className="h-9 flex items-center gap-2 rounded-md bg-white border border-[#eaeaea] px-4 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors shadow-sm">
            <Share2 className="h-4 w-4 text-gray-500" />
            Phân quyền
          </button>
          <button onClick={onClose} className="h-9 rounded-md bg-black px-5 text-[13px] font-medium text-white hover:bg-gray-800 transition-colors shadow-sm">
            Đóng
          </button>
        </div>
      </div>

      {isShareModalOpen && (
        <ShareResourceModal
          resourceType="TASK"
          resourceId={task.id}
          resourceName={task.title}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
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
      <div className="flex border-b border-[#eaeaea] bg-white sticky top-0 z-10">
        <div className="w-64 shrink-0 border-r border-[#eaeaea] p-4 font-medium text-[13px] text-gray-500 flex items-center uppercase tracking-wider">
          Tên nhiệm vụ
        </div>
        <div className="flex-1 overflow-x-auto flex">
          {dates.map((d, i) => (
            <div key={i} className="w-10 shrink-0 border-r border-[#eaeaea] flex flex-col items-center justify-center py-2.5">
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{d.toLocaleDateString("vi-VN", { weekday: "short" })}</span>
              <span className={cn("text-[12px] font-medium mt-1 w-5 h-5 rounded-full flex items-center justify-center", dateKey(d) === dateKey(now) ? "bg-black text-white" : "text-black")}>
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
            <div key={task.id} className="flex border-b border-[#eaeaea] hover:bg-gray-50 transition-colors group">
              <div className="w-64 shrink-0 border-r border-[#eaeaea] p-3 flex flex-col justify-center bg-white group-hover:bg-gray-50 z-10 sticky left-0 transition-colors">
                <span className="text-[13px] font-medium text-black truncate">{task.title}</span>
                <span className="text-[11px] text-gray-500 truncate mt-1">{task.project.name}</span>
              </div>
              <div className="flex-1 relative min-h-[52px] overflow-hidden flex">
                {dates.map((_, i) => (
                  <div key={i} className="w-10 shrink-0 border-r border-[#eaeaea]/50" />
                ))}
                
                {startIndex >= 0 && startIndex < daysInView && (
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 h-6 rounded-md flex items-center px-2 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden border border-black/5"
                    style={{ 
                      left: `${startIndex * 40 + 2}px`, 
                      width: `${Math.min(duration, daysInView - startIndex) * 40 - 4}px`,
                      backgroundColor: isDone ? "#111111" : "#0070F3"
                    }}
                  >
                    <span className="text-[10px] font-medium text-white truncate">{task.title}</span>
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
// IPHONE-STYLE CALENDAR VIEW -> VERCEL STYLE
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
    <div className="h-full flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Calendar Grid */}
      <div className="w-full md:w-[400px] shrink-0 border-b md:border-b-0 md:border-r border-[#eaeaea] flex flex-col bg-white">
        <header className="flex items-center justify-between p-6 bg-white border-b border-[#eaeaea]">
          <h3 className="text-[18px] font-medium capitalize text-black tracking-tight">{monthLabel}</h3>
          <div className="flex items-center gap-1">
            <button onClick={() => goMonth(-1)} className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-md transition-colors"><ChevronLeft className="w-4 h-4"/></button>
            <button onClick={() => { const now = new Date(); setCursor(now); setSelectedDate(now); }} className="text-[12px] font-medium text-black hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors border border-[#eaeaea]">Hôm nay</button>
            <button onClick={() => goMonth(1)} className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-md transition-colors"><ChevronRight className="w-4 h-4"/></button>
          </div>
        </header>

        <div className="p-6 bg-white">
          <div className="grid grid-cols-7 mb-4 text-center text-[11px] font-medium uppercase text-gray-400 tracking-wider">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => <div key={day}>{day}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-y-3">
            {days.map((day, i) => {
              const key = dateKey(day);
              const isSelected = key === selectedDateKey;
              const isToday = key === todayKey;
              const inMonth = day.getMonth() === cursor.getMonth();
              const hasTask = tasks.some(t => dateKey(t.dueDate) === key || dateKey(t.startDate) === key);

              return (
                <div key={i} className="flex justify-center items-center h-10 relative cursor-pointer group" onClick={() => setSelectedDate(day)}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-[14px] transition-all",
                    isSelected ? "bg-black text-white font-medium shadow-sm" :
                    isToday ? "text-black border border-black font-medium" :
                    inMonth ? "text-black group-hover:bg-gray-100" : "text-gray-300"
                  )}>
                    {day.getDate()}
                  </div>
                  {hasTask && !isSelected && <div className="absolute bottom-0 w-1 h-1 rounded-full bg-black/40" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Agenda List */}
      <div className="flex-1 flex flex-col bg-gray-50/30">
        <div className="p-6 border-b border-[#eaeaea] bg-white sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h3 className="text-[18px] font-medium text-black tracking-tight flex items-center gap-2">
              {selectedDate.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}
            </h3>
            <p className="text-[13px] text-gray-500 mt-1">{selectedTasks.length} nhiệm vụ</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedDateKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {selectedTasks.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-12 h-12 bg-white border border-[#eaeaea] rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 shadow-sm">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <h4 className="text-[15px] font-medium text-black tracking-tight">Trống lịch</h4>
                  <p className="text-[13px] text-gray-500 mt-2">Không có công việc nào trong ngày này.</p>
                </div>
              ) : (
                selectedTasks.map(task => (
                  <div key={task.id} className="bg-white rounded-xl p-5 border border-[#eaeaea] shadow-sm flex gap-5 relative overflow-hidden hover:border-black transition-colors group">
                    <div className={cn("absolute left-0 top-0 bottom-0 w-1", statusLabels[task.status]?.dot)} />
                    <div className="w-14 shrink-0 flex flex-col items-center justify-center border-r border-[#eaeaea] pr-4">
                      <span className="text-[12px] font-medium text-black">
                        {task.dueDate ? new Date(task.dueDate).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "All-day"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-[14px] font-medium text-black leading-snug">{task.title}</h4>
                          <p className="text-[12px] text-gray-500 mt-1 truncate">{task.project.name}</p>
                        </div>
                        <span className={cn(
                          "rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest bg-white",
                          task.priority === "HIGH" || task.priority === "URGENT" ? "border-[#eaeaea] text-rose-600" :
                          task.priority === "MEDIUM" ? "border-[#eaeaea] text-blue-600" :
                          "border-[#eaeaea] text-gray-600"
                        )}>
                          {task.priority}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-4">
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-black bg-gray-100 px-2.5 py-1 rounded-md border border-[#eaeaea]">
                          <span className={cn("w-1.5 h-1.5 rounded-full", statusLabels[task.status]?.dot)} />
                          {statusLabels[task.status]?.label}
                        </span>
                        {task.assignee && (
                          <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-600">
                            <User className="w-3.5 h-3.5 text-gray-400" />
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
