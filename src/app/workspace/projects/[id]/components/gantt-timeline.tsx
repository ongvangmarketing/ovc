import { cn } from "@/lib/utils/cn";
import type { TaskLite } from "../project-detail.types";

export function ProjectGanttView({ tasks }: { tasks: TaskLite[] }) {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1); 
  const daysInView = 60; 
  
  const dates = Array.from({ length: daysInView }).map((_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  const dateKey = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <div className="h-[560px] flex flex-col bg-white overflow-hidden rounded-2xl border border-border">
      <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
        <div className="w-64 shrink-0 border-r border-slate-200 p-3 font-semibold text-sm text-slate-700 flex items-center">
          Tên nhiệm vụ
        </div>
        <div className="flex-1 overflow-x-auto flex scrollbar-hide">
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
          const tStart = task.startDate ? new Date(task.startDate as string|Date) : new Date(now);
          const tEnd = task.dueDate ? new Date(task.dueDate as string|Date) : new Date(tStart.getTime() + 86400000 * 3);
          
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
        {tasks.length === 0 && (
           <div className="p-8 text-center text-sm text-slate-500">Chưa có nhiệm vụ nào trong dự án này.</div>
        )}
      </div>
    </div>
  );
}
