import { Activity, Clock3, ListChecks, MoreHorizontal, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDate, getInitials } from "@/lib/utils/format";
import { columns, priorityConfig } from "../project-detail.mock";
import type { TaskLite } from "../project-detail.types";

export function KanbanBoard({
  tasks,
  readOnly,
  openCreateTask,
  handleDragStart,
  handleDrop,
}: {
  tasks: TaskLite[];
  readOnly: boolean;
  openCreateTask: (columnId: string) => void;
  handleDragStart: (event: React.DragEvent, taskId: string) => void;
  handleDrop: (event: React.DragEvent, statusId: string) => void;
}) {
  return (
    <div className="min-h-[560px] overflow-x-auto pb-2">
      <div className="flex min-w-max gap-4 items-start">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.id);
          return (
            <div key={column.id} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(event, column.id)} className={cn("flex flex-col rounded-2xl border p-3 w-80 max-h-[600px]", column.tone)}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("priority-dot", column.dot)} />
                  <h3 className="font-semibold text-foreground text-sm">{column.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-500 shadow-sm">{columnTasks.length}</span>
                  {!readOnly ? <button onClick={() => openCreateTask(column.id)} className="rounded-md p-1 text-muted-foreground hover:bg-white hover:text-foreground" aria-label="Thêm task">
                    <Plus className="h-4 w-4" />
                  </button> : null}
                </div>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto pr-1 pb-2">
                {columnTasks.map((task) => (
                  <div key={task.id} draggable={!readOnly} onDragStart={(event) => !readOnly && handleDragStart(event, task.id)} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-grab active:cursor-grabbing group">
                    <div className="flex justify-between items-start mb-2">
                      <span className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border", priorityConfig[task.priority || "MEDIUM"]?.cls)}>
                        {priorityConfig[task.priority || "MEDIUM"]?.label}
                      </span>
                      <button className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                    <h4 className="text-sm font-semibold leading-5 text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">{task.title}</h4>
                    {task.description ? <p className="mt-1 mb-3 line-clamp-2 text-xs text-muted-foreground">{task.description}</p> : null}
                    
                    <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold border border-white shadow-sm" title={task.assignee?.name || "Chưa gán"}>
                          {task.assignee ? getInitials(task.assignee.name || "") : "?"}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {(task.subtasks?.length ?? 0) > 0 && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                            <ListChecks className="w-3 h-3"/> {task.subtasks?.length}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className={cn("flex items-center gap-1 text-[10px] font-semibold", new Date(task.dueDate).getTime() < new Date().setHours(0,0,0,0) && task.status !== "DONE" ? "text-rose-500" : "text-slate-500")}>
                            <Clock3 className="w-3 h-3" />
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {!readOnly && (
                  <button onClick={() => openCreateTask(column.id)} className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 font-medium text-sm flex items-center justify-center gap-1 hover:border-indigo-300 hover:text-indigo-600 transition-colors bg-white/50 mt-2">
                    <Plus className="w-4 h-4" /> Thêm thẻ
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
