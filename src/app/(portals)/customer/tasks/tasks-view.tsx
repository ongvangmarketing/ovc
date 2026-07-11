"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChartGantt, Columns3, FolderKanban, X, Activity } from "lucide-react";

type TaskItem = {
  id: string;
  title: string;
  projectName: string;
  status: string;
  statusLabel: string;
  statusClass: string;
  startDate: string | null;
  dueDate: string | null;
  startLabel: string;
  dueLabel: string;
};

const columns = [
  { key: "TODO", label: "Cần làm" },
  { key: "IN_PROGRESS", label: "Đang làm" },
  { key: "IN_REVIEW", label: "Đang duyệt" },
  { key: "DONE", label: "Hoàn thành" },
];

export function TasksView({ tasks }: { tasks: TaskItem[] }) {
  const [view, setView] = useState<"kanban" | "gantt">("kanban");
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  
  const gantt = useMemo(() => {
    const dates = tasks.flatMap((task) => [task.startDate, task.dueDate]).filter(Boolean).map((value) => new Date(value as string).getTime());
    const min = dates.length ? Math.min(...dates) : 0;
    const max = dates.length ? Math.max(...dates) : min + 86400000;
    const range = Math.max(max - min, 86400000);
    return { min, range };
  }, [tasks]);

  return (
    <div className="bg-white min-h-screen text-black selection:bg-black selection:text-white pb-24 font-sans">
      {/* Vercel Header Section */}
      <div className="pt-16 pb-12 px-6 md:px-12 max-w-[1440px] mx-auto border-b border-[#eaeaea]">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="max-w-3xl">
            <h1 className="text-[40px] md:text-[56px] font-medium tracking-tighter leading-[1.05] text-black">
              Nhiệm vụ
            </h1>
            <p className="text-[18px] text-gray-500 max-w-2xl mt-4 tracking-tight leading-snug">
              Chuyển nhanh giữa bảng Kanban và lịch Gantt để theo dõi tiến độ công việc.
            </p>
          </div>
          
          <div className="flex items-center rounded-full border border-[#eaeaea] bg-white p-1 shrink-0">
            <button 
              type="button" 
              className={`flex h-10 items-center justify-center gap-2 rounded-full px-5 text-[14px] font-medium transition-colors ${view === "kanban" ? "bg-black text-white" : "text-gray-400 hover:text-black"}`}
              onClick={() => setView("kanban")}
            >
              <Columns3 className="h-4 w-4" /> Kanban
            </button>
            <button 
              type="button" 
              className={`flex h-10 items-center justify-center gap-2 rounded-full px-5 text-[14px] font-medium transition-colors ${view === "gantt" ? "bg-black text-white" : "text-gray-400 hover:text-black"}`}
              onClick={() => setView("gantt")}
            >
              <ChartGantt className="h-4 w-4" /> Gantt
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 max-w-[1440px] mx-auto pt-10">
        {view === "kanban" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {columns.map((column) => {
              const columnTasks = tasks.filter((task) => task.status === column.key);
              return (
                <div key={column.key} className="flex flex-col gap-4">
                  <header className="flex items-center justify-between border-b border-black pb-3">
                    <strong className="text-[14px] font-medium uppercase tracking-widest text-black">{column.label}</strong>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[11px] font-bold text-gray-500">
                      {columnTasks.length}
                    </span>
                  </header>
                  <div className="flex flex-col gap-4">
                    {columnTasks.map((task) => (
                      <article
                        key={task.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedTask(task)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedTask(task);
                          }
                        }}
                        className="group flex flex-col rounded-2xl border border-[#eaeaea] bg-white p-5 transition-colors hover:border-gray-300 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <h3 className="text-[16px] font-medium tracking-tight text-black group-hover:text-gray-600 transition-colors mb-1">{task.title}</h3>
                        <p className="text-[13px] text-gray-500 mb-6 line-clamp-1">{task.projectName}</p>
                        
                        <footer className="mt-auto flex items-center justify-between border-t border-[#eaeaea] pt-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest border border-transparent ${
                            task.status === "DONE" || task.status === "COMPLETED" ? "border-transparent bg-emerald-50 text-emerald-700" : 
                            "border-[#eaeaea] bg-white text-gray-600"
                          }`}>
                            {task.statusLabel}
                          </span>
                          <time className="text-[12px] font-medium text-gray-400 flex items-center gap-1.5">
                            <CalendarDays className="h-3 w-3" /> {task.dueLabel}
                          </time>
                        </footer>
                      </article>
                    ))}
                    {!columnTasks.length ? (
                      <div className="rounded-2xl border border-dashed border-[#eaeaea] bg-gray-50 p-6 text-center text-[13px] text-gray-400">
                        Trống
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#eaeaea] bg-gray-50 px-6 py-4">
              <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400 w-1/3">Nhiệm vụ</span>
              <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400 w-2/3">Tiến độ thời gian</span>
            </div>
            <div className="divide-y divide-[#eaeaea]">
              {tasks.map((task) => {
                const start = task.startDate ? new Date(task.startDate).getTime() : gantt.min;
                const end = task.dueDate ? new Date(task.dueDate).getTime() : start + 86400000;
                const left = Math.max(0, ((start - gantt.min) / gantt.range) * 100);
                const width = Math.max(4, ((Math.max(end, start + 86400000) - start) / gantt.range) * 100);
                return (
                  <div key={task.id} className="flex flex-col sm:flex-row sm:items-center px-6 py-5 hover:bg-gray-50/50 transition-colors group">
                    <div className="w-full sm:w-1/3 pr-6 mb-4 sm:mb-0">
                      <strong className="block text-[15px] font-medium text-black group-hover:text-gray-600 transition-colors line-clamp-1">{task.title}</strong>
                      <small className="block text-[13px] text-gray-500 mt-1 line-clamp-1">{task.projectName}</small>
                    </div>
                    <div className="w-full sm:w-2/3 relative h-10 bg-gray-50 rounded-lg overflow-hidden border border-[#eaeaea]">
                      <span 
                        className={`absolute top-0 bottom-0 m-1 rounded-md flex items-center px-3 text-[11px] font-medium uppercase tracking-widest whitespace-nowrap overflow-hidden ${
                          task.status === "DONE" || task.status === "COMPLETED" ? "bg-emerald-500 text-white" : 
                          "bg-black text-white"
                        }`} 
                        style={{ left: `${left}%`, width: `calc(${Math.min(width, 100 - left)}% - 8px)` }}
                        title={`${task.startLabel} - ${task.dueLabel}`}
                      >
                        {width > 15 && `${task.startLabel} - ${task.dueLabel}`}
                      </span>
                    </div>
                  </div>
                );
              })}
              {!tasks.length ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <Activity className="h-8 w-8 text-gray-300 mb-4" />
                  <p className="text-[15px] text-gray-500">Chưa có nhiệm vụ nào.</p>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {selectedTask ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-label={`Chi tiết ${selectedTask.title}`}>
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" aria-label="Đóng chi tiết nhiệm vụ" onClick={() => setSelectedTask(null)} />
          <section className="relative w-full max-w-lg rounded-2xl border border-[#eaeaea] bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <header className="flex items-start justify-between border-b border-[#eaeaea] p-6 bg-gray-50/50">
              <div>
                <span className={`mb-3 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-widest border border-transparent ${
                  selectedTask.status === "DONE" || selectedTask.status === "COMPLETED" ? "border-transparent bg-emerald-50 text-emerald-700" : 
                  "border-[#eaeaea] bg-white text-gray-600"
                }`}>
                  {selectedTask.statusLabel}
                </span>
                <h3 className="text-[24px] font-medium tracking-tight text-black leading-tight">{selectedTask.title}</h3>
              </div>
              <button 
                type="button" 
                aria-label="Đóng" 
                onClick={() => setSelectedTask(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#eaeaea] text-gray-500 hover:text-black hover:bg-gray-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="p-6">
              <div className="flex flex-col gap-6">
                <div>
                  <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-widest text-gray-400 mb-2">
                    <FolderKanban className="h-4 w-4" /> Dự án
                  </div>
                  <strong className="text-[16px] font-medium text-black">{selectedTask.projectName}</strong>
                </div>
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#eaeaea]">
                  <div>
                    <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-widest text-gray-400 mb-2">
                      <CalendarDays className="h-4 w-4" /> Bắt đầu
                    </div>
                    <strong className="text-[16px] font-medium text-black">{selectedTask.startLabel}</strong>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-widest text-gray-400 mb-2">
                      <CalendarDays className="h-4 w-4" /> Hoàn thành
                    </div>
                    <strong className="text-[16px] font-medium text-black">{selectedTask.dueLabel}</strong>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-[#eaeaea] flex justify-end">
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="rounded-full bg-black text-white px-6 py-2.5 text-[14px] font-medium hover:bg-gray-800 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
