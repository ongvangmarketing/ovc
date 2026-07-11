"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, Users, FileText, ChevronRight, MessageSquare, Activity, CheckSquare } from "lucide-react";
import { formatDate, statusClass, statusLabel, progressFromTasks } from "../../utils";
import { useSession } from "@/lib/auth/client";
import { TaskDetailModal } from "../../tasks/TaskDetailModal";

type CustomerProjectDetailProps = {
  project: any;
  baseHref: string;
};

export function CustomerProjectDetail({ project, baseHref }: CustomerProjectDetailProps) {
  const { data: session } = useSession();
  const [selectedTask, setSelectedTask] = useState<any>(null);

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
    <div className="bg-white min-h-screen text-black selection:bg-black selection:text-white pb-24 font-sans">
      
      {/* Vercel Header Section */}
      <div className="pt-10 pb-12 px-6 md:px-12 max-w-[1440px] mx-auto border-b border-[#eaeaea]">
        <div className="mb-8">
          <Link href={baseHref} className="inline-flex items-center gap-2 text-[14px] font-medium text-gray-500 hover:text-black transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách dự án
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-widest border border-transparent ${statusClass(project.status)}`}>
                {statusLabel(project.status)}
              </span>
            </div>
            <h1 className="text-[40px] md:text-[56px] font-medium tracking-tighter leading-[1.05] text-black">
              {project.name}
            </h1>
          </div>
          
          <div className="flex flex-col gap-3 min-w-[280px]">
            <div className="flex justify-between text-[14px] font-medium text-gray-500">
              <span>Tiến độ hoàn thành</span>
              <span className="text-black">{progress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#eaeaea] overflow-hidden">
              <div 
                className="h-full rounded-full bg-black transition-all duration-1000 ease-out" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 max-w-[1440px] mx-auto pt-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Main Content (Left Column) - 8 Cols */}
          <div className="xl:col-span-8 space-y-8">
            
            {/* Project Summary */}
            <section className="rounded-2xl border border-[#eaeaea] bg-white p-8 md:p-10">
              <h2 className="text-[20px] font-medium tracking-tight text-black mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                Tóm tắt dự án
              </h2>
              <p className="text-[16px] text-gray-500 leading-relaxed mb-8 max-w-2xl">
                {project.description || "Dự án đang trong quá trình triển khai. Các tài liệu và thông tin chi tiết sẽ được cập nhật liên tục bởi đội ngũ."}
              </p>
              
              <div className="flex flex-wrap gap-8 border-t border-[#eaeaea] pt-8">
                <div>
                  <p className="text-[12px] font-medium text-gray-400 uppercase tracking-widest mb-2">Bắt đầu</p>
                  <p className="text-[16px] font-medium text-black">{formatDate(project.startDate)}</p>
                </div>
                <div>
                  <p className="text-[12px] font-medium text-gray-400 uppercase tracking-widest mb-2">Hạn chót</p>
                  <p className="text-[16px] font-medium text-black">{formatDate(project.endDate)}</p>
                </div>
              </div>
            </section>

            {/* Active Tasks */}
            <section className="pt-8 border-t border-[#eaeaea]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <h2 className="text-[24px] font-medium tracking-tight text-black">Nhiệm vụ ({activeTasks.length})</h2>
                <Link href="/customer/tasks" className="text-[14px] font-medium text-black hover:text-gray-500 transition-colors flex items-center gap-1">
                  Xem tất cả <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              
              <div className="grid gap-4">
                {activeTasks.length > 0 ? (
                  activeTasks.slice(0, 5).map((task: any) => (
                    <div 
                      key={task.id} 
                      onClick={() => setSelectedTask(task)}
                      className="rounded-2xl border border-[#eaeaea] bg-white p-6 transition-colors hover:border-gray-300 group cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div>
                          <div className="mb-3">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-widest border border-transparent ${statusClass(task.status)}`}>
                              {statusLabel(task.status)}
                            </span>
                          </div>
                          <h3 className="text-[18px] font-medium tracking-tight text-black group-hover:text-gray-600 transition-colors">{task.title}</h3>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="flex items-center gap-2 text-[14px] text-gray-500">
                            <CalendarDays className="h-4 w-4" />
                            <span className={task.dueDate && new Date(task.dueDate) < new Date() ? "text-orange-500 font-medium" : ""}>
                              {task.dueDate ? formatDate(task.dueDate) : "Chưa có"}
                            </span>
                          </div>
                          {task.comments?.length > 0 && (
                            <div className="flex items-center gap-1 text-[13px] font-medium text-gray-400 mt-1">
                              <MessageSquare className="h-4 w-4" /> {task.comments.length}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-[#eaeaea] bg-white py-16 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="h-6 w-6 text-gray-300" />
                    </div>
                    <p className="text-[18px] font-medium tracking-tight text-black">Tuyệt vời!</p>
                    <p className="text-[15px] text-gray-500 mt-1">Hiện không có nhiệm vụ nào đang tồn đọng.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar (Right Column) - 4 Cols */}
          <div className="xl:col-span-4 space-y-8">
            
            {/* Stats Widget */}
            <div className="rounded-2xl border border-[#eaeaea] bg-white p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <Activity className="w-32 h-32" />
              </div>
              <h3 className="text-[18px] font-medium tracking-tight text-gray-500 mb-8 relative z-10">Thống kê</h3>
              <div className="grid gap-6 relative z-10">
                <div>
                  <p className="text-[14px] text-gray-500 mb-2 uppercase tracking-wider">Tổng nhiệm vụ</p>
                  <p className="text-[36px] font-medium tracking-tighter text-black leading-none">{project.tasks?.length || 0}</p>
                </div>
                
                <div className="w-full h-[1px] bg-[#eaeaea]"></div>
                
                <div>
                  <p className="text-[14px] text-gray-500 mb-2 uppercase tracking-wider">Đã hoàn thành</p>
                  <p className="text-[36px] font-medium tracking-tighter text-black leading-none">{completedTasks.length}</p>
                </div>
              </div>
            </div>

            {/* Team Widget */}
            <div className="rounded-2xl border border-[#eaeaea] bg-white p-6 md:p-8">
              <h3 className="text-[18px] font-medium tracking-tight text-gray-500 mb-6 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Nhân sự phụ trách
              </h3>
              <div className="space-y-5">
                {uniqueTeam.map((user: any) => (
                  <div key={user.id} className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-50 border border-[#eaeaea] flex items-center justify-center text-black font-medium text-[16px] overflow-hidden shrink-0">
                      {user.image ? (
                        <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                      ) : (
                        user.name?.charAt(0).toUpperCase() || "U"
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[16px] font-medium tracking-tight text-black truncate">{user.name || "Nhân sự"}</p>
                      <p className="text-[13px] text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-[#eaeaea]">
                <button className="w-full rounded-full bg-black text-white py-3 text-[14px] font-medium hover:bg-gray-800 transition-colors">
                  Liên hệ hỗ trợ
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          currentUser={session?.user}
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </div>
  );
}
