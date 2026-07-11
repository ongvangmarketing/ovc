"use client";

import { useState } from "react";
import { CalendarDays, Flag, TimerReset, Trash2, UserPlus, FileText, ChevronRight, MessageSquare, X, Plus, CheckCircle2, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDate, getInitials } from "@/lib/utils/format";
import { SelectBox } from "@/components/ui/select-box";
import { Info } from "./common/stat-card";
import type { ProjectLite, TaskLite } from "../project-detail.types";

export function OverviewDashboard({
  project,
  tasks,
  progress,
  doneTasks,
  overdueTasks,
  taskStats,
  readOnly,
  ownerId,
  memberToAdd,
  isMemberSaving,
  availableToAdd,
  setMemberToAdd,
  handleAddMember,
  handleRemoveMember,
  openCreateTask,
  openEditTask,
  taskLists,
}: {
  project: ProjectLite;
  tasks: TaskLite[];
  progress: number;
  doneTasks: number;
  overdueTasks: number;
  timelinePhases: Array<{ id: string; title: string; start: string; end: string; status: string }>;
  taskStats: Array<{ id: string; title: string; tone: string; dot: string; count: number }>;
  taskLists: Array<{ id: string; name: string; color?: string | null }>;
  readOnly: boolean;
  ownerId: string;
  memberToAdd: string;
  isMemberSaving: boolean;
  availableToAdd: Array<{ userId: string; user?: { name?: string | null; email?: string | null } | null }>;
  setMemberToAdd: (val: string) => void;
  handleAddMember: () => void;
  handleRemoveMember: (val: string) => void;
  openCreateTask?: (columnId: string) => void;
  openEditTask?: (task: TaskLite) => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState<{ id: string; title: string } | null>(null);

  const pipelineStatuses = taskLists.map((list, index) => {
    return {
      id: list.id,
      title: list.name,
    };
  });

  const activeTasks = tasks.filter(t => t.status !== "DONE" && t.status !== "CANCELLED");
  const completedTasks = tasks.filter(t => t.status === "DONE" || t.status === "COMPLETED");

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
      {/* Main Content */}
      <div className="xl:col-span-2 space-y-8">
        
        {/* Project Summary - Customer Style */}
        <section className="rounded-xl border border-[#eaeaea] bg-white p-8">
          <h2 className="text-[18px] font-medium tracking-tight text-black mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-500" strokeWidth={1.5} />
            Tóm tắt dự án
          </h2>
          <p className="text-gray-500 text-[14px] leading-relaxed mb-6">
            {project.description || "Dự án đang trong quá trình triển khai. Các tài liệu và thông tin chi tiết sẽ được cập nhật liên tục bởi đội ngũ."}
          </p>
          
          <div className="flex flex-wrap gap-6 border-t border-[#eaeaea] pt-6">
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-1">Ngày bắt đầu</p>
              <p className="font-semibold text-black">{project.startDate ? formatDate(project.startDate) : "Chưa đặt"}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-1">Ngày dự kiến hoàn thành</p>
              <p className="font-semibold text-black">{project.dueDate ? formatDate(project.dueDate) : "Chưa đặt"}</p>
            </div>
          </div>
        </section>

        {/* Timeline (Pipeline) */}
        <section className="rounded-xl border border-[#eaeaea] bg-white p-8">
          <div className="mb-6">
            <h2 className="text-[18px] font-medium tracking-tight text-black">Timeline tổng quan</h2>
            <p className="text-[14px] text-gray-500 mt-1">Các giai đoạn và tiến độ thực thi dự án.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pipelineStatuses.map((phase, index) => {
              const count = tasks.filter(t => (t.taskListId || t.status) === phase.id).length;
              return (
                <div 
                  key={phase.id} 
                  onClick={() => setSelectedStatus(phase)}
                  className="relative rounded-xl border border-[#eaeaea] p-4 bg-white cursor-pointer transition-all group hover:border-black"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-50 border border-[#eaeaea] text-[11px] font-medium text-black">{index + 1}</span>
                    <span className="rounded-full px-2 py-0.5 text-[11px] font-medium border border-[#eaeaea] bg-gray-50 text-black">
                      {phase.title}
                    </span>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-[20px] font-medium tracking-tight text-black">{count}</p>
                      <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-1">Nhiệm vụ</p>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-white border border-[#eaeaea] flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white group-hover:border-black transition-colors">
                      <ChevronRight className="h-3 w-3" strokeWidth={2} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Active Tasks - Customer Style */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-medium tracking-tight text-black">Nhiệm vụ đang thực hiện ({activeTasks.length})</h2>
          </div>
          
          <div className="flex flex-col gap-3">
            {activeTasks.length > 0 ? (
              activeTasks.slice(0, 5).map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => openEditTask && openEditTask(task)}
                  className="group rounded-xl border border-[#eaeaea] bg-white p-4 transition-all hover:border-black cursor-pointer"
                >
                  <div className="flex flex-col gap-2.5">
                    <h3 className="text-[15px] font-medium text-black group-hover:text-gray-600 transition-colors leading-snug">{task.title}</h3>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className={cn(
                        "inline-flex items-center px-2 py-1 rounded-[6px] font-medium text-[11px] uppercase tracking-wide",
                        task.status === "IN_PROGRESS" ? "bg-gray-100 text-black" :
                        task.status === "IN_REVIEW" ? "bg-gray-100 text-black" :
                        "bg-gray-50 text-gray-500 border border-[#eaeaea]"
                      )}>
                        {pipelineStatuses.find(p => p.id === task.status)?.title || "Cần làm"}
                      </span>
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span className={task.dueDate && new Date(task.dueDate) < new Date() ? "text-[#ff3b30] font-medium" : ""}>
                          {task.dueDate ? formatDate(task.dueDate as string) : "Chưa có hạn"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">Tuyệt vời! Hiện không có nhiệm vụ nào đang tồn đọng.</p>
              </div>
            )}
          </div>
        </section>

      </div>
      
      {/* Sidebar */}
      <div className="space-y-6">
        
        {/* Stats Widget - Customer Style */}
        <div className="rounded-xl border border-[#eaeaea] bg-white p-6">
          <h3 className="font-bold text-black mb-4 text-[16px]">Thống kê</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-gray-50 p-4 border border-[#eaeaea]">
              <p className="text-[11px] font-medium text-gray-500 uppercase">Tổng Task</p>
              <p className="text-xl font-bold text-black mt-1">{tasks.length}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 border border-[#eaeaea]">
              <p className="text-[11px] font-medium text-gray-500 uppercase">Đã xong</p>
              <p className="text-xl font-bold text-black mt-1">{completedTasks.length}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-[13px] font-medium">
              <span className="text-gray-500">Tiến độ dự án</span>
              <span className="text-black font-bold">{progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#eaeaea] overflow-hidden">
              <div 
                className="h-full rounded-full bg-black transition-all duration-1000 ease-out" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Workload */}
        <section className="rounded-xl border border-[#eaeaea] bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-black text-[16px]">Workload</h3>
          </div>
          
          {!readOnly ? (
            <div className="mb-4 space-y-2">
              <SelectBox ariaLabel="Thêm người từ workspace" value={memberToAdd} onChange={setMemberToAdd} placeholder="Thêm thành viên" options={[{ value: "", label: "Thêm người từ workspace" }, ...availableToAdd.map((member) => ({ value: member.userId, label: member.user?.name || member.user?.email || "Thành viên" }))]} className="w-full" />
              <button onClick={handleAddMember} disabled={!memberToAdd || isMemberSaving} className="w-full flex justify-center items-center gap-2 rounded-lg bg-black py-2 px-4 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 transition-colors">
                <UserPlus className="h-4 w-4" /> Thêm người
              </button>
            </div>
          ) : null}
          
          <div className="space-y-3">
            {project.members?.map((member) => {
              const isOwner = member.userId === ownerId;
              const memberTasks = tasks.filter(t => t.assignee?.name === member.user?.name && t.status !== "DONE" && t.status !== "CANCELLED");
              return (
                <div key={member.userId} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg group">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                      {getInitials(member.user?.name || member.user?.email || "TV")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 leading-none">{member.user?.name || "Thành viên"}</p>
                      <span className="text-[11px] text-slate-500 mt-1 block">{memberTasks.length} tasks mở</span>
                    </div>
                  </div>
                  {!readOnly && !isOwner && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.userId)}
                      disabled={isMemberSaving}
                      className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
        
      </div>

      {/* Selected Status Modal */}
      {selectedStatus && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 backdrop-blur-sm p-4 sm:p-6">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
              <div>
                <h3 className="font-bold text-[15px] text-slate-900 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                  {selectedStatus.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{tasks.filter(t => (t.taskListId || t.status) === selectedStatus.id).length} nhiệm vụ</p>
              </div>
              <button onClick={() => setSelectedStatus(null)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-5 flex-1 space-y-3 bg-slate-50/50">
              {tasks.filter(t => (t.taskListId || t.status) === selectedStatus.id).map(task => (
                <div 
                  key={task.id}
                  onClick={() => {
                    setSelectedStatus(null);
                    openEditTask && openEditTask(task);
                  }}
                  className="group rounded-xl border border-slate-200 p-3.5 hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all bg-white"
                >
                  <h4 className="font-medium text-[14px] text-slate-800 mb-2.5 group-hover:text-indigo-600 line-clamp-2">{task.title}</h4>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                      {task.dueDate ? formatDate(task.dueDate as string) : "Chưa có hạn"}
                    </span>
                    {task.assignee?.name ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 max-w-[80px] truncate">{task.assignee.name}</span>
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-bold text-indigo-700" title={task.assignee.name}>
                          {getInitials(task.assignee.name)}
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-slate-300 text-slate-400 bg-slate-50">
                        <UserPlus className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {tasks.filter(t => t.status === selectedStatus.id).length === 0 && (
                <div className="text-center py-10 flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <ListTodo className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-[13px]">Không có công việc nào ở trạng thái này.</p>
                </div>
              )}
            </div>
            
            {!readOnly && openCreateTask && (
              <div className="p-4 border-t border-slate-100 bg-white">
                <button 
                  onClick={() => {
                    setSelectedStatus(null);
                    openCreateTask(selectedStatus.id);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 px-4 text-[13px] font-medium text-white hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Thêm công việc mới
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
