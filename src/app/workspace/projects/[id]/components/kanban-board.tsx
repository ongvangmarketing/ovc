import { useState } from "react";
import { Clock3, ListChecks, MoreHorizontal, Plus, Settings2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDate, getInitials } from "@/lib/utils/format";
import { priorityConfig } from "../project-detail.mock";
import type { TaskListLite, TaskLite } from "../project-detail.types";
import { createTaskList, deleteTaskList, updateTaskList } from "@/app/actions/projects";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function KanbanBoard({
  tasks,
  taskLists,
  projectId,
  readOnly,
  openCreateTask,
  openEditTask,
  handleDragStart,
  handleDrop,
}: {
  tasks: TaskLite[];
  taskLists: TaskListLite[];
  projectId: string;
  readOnly: boolean;
  openCreateTask: (columnId: string) => void;
  openEditTask: (task: TaskLite) => void;
  handleDragStart: (event: React.DragEvent, taskId: string) => void;
  handleDrop: (event: React.DragEvent, statusId: string) => void;
}) {
  const router = useRouter();
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleCreateList = async () => {
    if (!newListName.trim()) return setIsAddingList(false);
    setLoading(true);
    try {
      await createTaskList(projectId, newListName.trim());
      setNewListName("");
      setIsAddingList(false);
      router.refresh();
      toast.success("Đã thêm cột mới");
    } catch (e: any) {
      toast.error("Không thể tạo cột");
    }
    setLoading(false);
  };

  const handleUpdateList = async (listId: string) => {
    if (!editingListName.trim()) return setEditingListId(null);
    setLoading(true);
    try {
      await updateTaskList(listId, editingListName.trim());
      setEditingListId(null);
      router.refresh();
      toast.success("Đã đổi tên cột");
    } catch (e: any) {
      toast.error("Không thể đổi tên cột");
    }
    setLoading(false);
  };

  const handleDeleteList = async (listId: string) => {
    const listTasks = tasks.filter(t => (t.taskListId || t.status) === listId);
    if (listTasks.length > 0) {
      toast.error("Không thể xóa cột đang có phân công.");
      return;
    }
    if (!confirm("Bạn có chắc chắn muốn xóa cột này?")) return;
    
    setLoading(true);
    try {
      await deleteTaskList(listId);
      router.refresh();
      toast.success("Đã xóa cột");
    } catch (e: any) {
      toast.error(e.message || "Không thể xóa cột");
    }
    setLoading(false);
    setActiveMenuId(null);
  };

  return (
    <div className="min-h-[560px] overflow-x-auto pb-2" onClick={() => setActiveMenuId(null)}>
      <div className="flex min-w-max gap-4 items-start">
        {taskLists.map((list) => {
          // If task doesn't have taskListId, we fallback to status. So we match against list.id
          const listTasks = tasks.filter((task) => (task.taskListId || task.status) === list.id);
          const tone = "bg-[#f2f2f7] border-transparent";
          const dot = "bg-slate-400";
          
          return (
            <div key={list.id} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(event, list.id)} className={cn("flex flex-col rounded-2xl border p-3 w-80 max-h-[600px]", tone)}>
              <div className="mb-3 flex items-center justify-between relative group/header">
                {editingListId === list.id ? (
                  <input
                    type="text"
                    value={editingListName}
                    onChange={(e) => setEditingListName(e.target.value)}
                    onBlur={() => handleUpdateList(list.id)}
                    onKeyDown={(e) => e.key === "Enter" && handleUpdateList(list.id)}
                    className="w-full text-sm font-semibold p-1 rounded border-2 border-indigo-500 outline-none"
                    autoFocus
                    disabled={loading}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className={cn("priority-dot", list.color || dot)} />
                    <h3 className="font-semibold text-foreground text-sm">{list.name}</h3>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-500 shadow-sm">{listTasks.length}</span>
                  {!readOnly && (
                    <div className="relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === list.id ? null : list.id); }} 
                        className="rounded-md p-1 text-muted-foreground hover:bg-slate-200 hover:text-foreground opacity-0 group-hover/header:opacity-100 transition-opacity focus:opacity-100"
                        aria-label="Tùy chọn cột"
                      >
                        <Settings2 className="h-4 w-4" />
                      </button>
                      
                      {activeMenuId === list.id && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingListId(list.id); setEditingListName(list.name); setActiveMenuId(null); }}
                            className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            Đổi tên
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteList(list.id); }}
                            className="w-full text-left px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 flex items-center justify-between"
                          >
                            Xóa cột <Trash2 className="w-3 h-3"/>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {!readOnly ? <button onClick={() => openCreateTask(list.id)} className="rounded-md p-1 text-muted-foreground hover:bg-white hover:text-foreground" aria-label="Thêm task">
                    <Plus className="h-4 w-4" />
                  </button> : null}
                </div>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto pr-1 pb-2">
                {listTasks.map((task) => (
                  <div key={task.id} onClick={() => !readOnly && openEditTask(task)} draggable={!readOnly} onDragStart={(event) => !readOnly && handleDragStart(event, task.id)} className="bg-white p-4 rounded-[16px] border border-[#e5e5ea] shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-indigo-300 transition-all cursor-grab active:cursor-grabbing group">
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
                  <button onClick={() => openCreateTask(list.id)} className="w-full py-2.5 rounded-[12px] border border-dashed border-[#d1d1d6] text-slate-500 font-medium text-sm flex items-center justify-center gap-1 hover:border-indigo-300 hover:text-indigo-600 transition-colors mt-2 bg-transparent hover:bg-white/50">
                    <Plus className="w-4 h-4" /> Thêm thẻ
                  </button>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Add List Button */}
        {!readOnly && (
          <div className="w-80 flex-shrink-0">
            {isAddingList ? (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-sm">
                <input
                  type="text"
                  placeholder="Nhập tên cột..."
                  className="w-full text-sm p-2 rounded-lg border-2 border-indigo-500 outline-none"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateList();
                    if (e.key === "Escape") setIsAddingList(false);
                  }}
                  autoFocus
                  disabled={loading}
                />
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={handleCreateList} disabled={loading} className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">Lưu</button>
                  <button onClick={() => setIsAddingList(false)} disabled={loading} className="px-3 py-1.5 text-slate-500 text-sm hover:bg-slate-200 rounded-lg">Hủy</button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAddingList(true)} 
                className="w-full flex items-center gap-2 p-4 rounded-2xl border border-dashed border-slate-300 text-slate-500 font-medium hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Thêm cột mới
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
