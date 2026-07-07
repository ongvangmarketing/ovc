"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, Users, FileText, ChevronRight, MessageSquare } from "lucide-react";
import { formatDate, statusClass, statusLabel, progressFromTasks } from "../../utils";

type CustomerProjectDetailProps = {
  project: any;
  baseHref: string;
};

export function CustomerProjectDetail({ project, baseHref }: CustomerProjectDetailProps) {
  const progress = progressFromTasks(project.tasks || []);
  const activeTasks = (project.tasks || []).filter((t: any) => t.status !== "DONE" && t.status !== "COMPLETED");
  const completedTasks = (project.tasks || []).filter((t: any) => t.status === "DONE" || t.status === "COMPLETED");
  
  const teamMembers = [
    project.owner,
    ...(project.members?.map((m: any) => m.user) || [])
  ].filter(Boolean);

  // Remove duplicates from teamMembers
  const uniqueTeam = Array.from(new Map(teamMembers.map(item => [item.id, item])).values());

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-8">
        <Link href={baseHref} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách dự án
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-black uppercase tracking-wider ${statusClass(project.status)}`}>
                {statusLabel(project.status)}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
          </div>
          
          <div className="flex flex-col gap-2 min-w-[200px]">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-slate-600">Tiến độ tổng</span>
              <span className="text-blue-600">{progress}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full rounded-full bg-blue-600 transition-all duration-1000 ease-out" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (Left Column) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Project Summary */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-400" />
              Tóm tắt dự án
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              {project.description || "Dự án đang trong quá trình triển khai. Các tài liệu và thông tin chi tiết sẽ được cập nhật liên tục bởi đội ngũ."}
            </p>
            
            <div className="flex flex-wrap gap-6 border-t border-slate-100 pt-5">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Ngày bắt đầu</p>
                <p className="font-semibold text-slate-900">{formatDate(project.startDate)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Ngày dự kiến hoàn thành</p>
                <p className="font-semibold text-slate-900">{formatDate(project.endDate)}</p>
              </div>
            </div>
          </section>

          {/* Active Tasks */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Nhiệm vụ đang thực hiện ({activeTasks.length})</h2>
              <Link href="/customer/tasks" className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                Xem tất cả <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="flex flex-col gap-3">
              {activeTasks.length > 0 ? (
                activeTasks.slice(0, 5).map((task: any) => (
                  <div key={task.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="mb-2">
                          <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${statusClass(task.status)}`}>
                            {statusLabel(task.status)}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900">{task.title}</h3>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 text-sm text-slate-500 shrink-0">
                        <div className="flex items-center gap-1.5 font-medium">
                          <CalendarDays className="h-4 w-4" />
                          <span className={task.dueDate && new Date(task.dueDate) < new Date() ? "text-red-600" : ""}>
                            {task.dueDate ? formatDate(task.dueDate) : "Chưa có"}
                          </span>
                        </div>
                        {task.comments?.length > 0 && (
                          <div className="flex items-center gap-1 font-bold text-slate-400">
                            <MessageSquare className="h-4 w-4" /> {task.comments.length}
                          </div>
                        )}
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

        {/* Sidebar (Right Column) */}
        <div className="space-y-6">
          
          {/* Stats Widget */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Thống kê</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-xs font-medium text-slate-500 uppercase">Tổng Task</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{project.tasks?.length || 0}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100">
                <p className="text-xs font-medium text-emerald-600 uppercase">Đã xong</p>
                <p className="text-2xl font-black text-emerald-700 mt-1">{completedTasks.length}</p>
              </div>
            </div>
          </div>

          {/* Team Widget */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-400" />
              Nhân sự phụ trách
            </h3>
            <div className="space-y-4">
              {uniqueTeam.map((user: any) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold overflow-hidden shrink-0">
                    {user.image ? (
                      <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      user.name?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{user.name || "Nhân sự"}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button className="w-full rounded-xl bg-blue-50 text-blue-700 py-2.5 text-sm font-bold hover:bg-blue-100 transition-colors">
                Liên hệ hỗ trợ
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
