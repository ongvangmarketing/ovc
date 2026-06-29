"use client";

import { useState } from "react";
import { Plus, Search, FolderKanban, Calendar, Users, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";

import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/app/actions/projects";

const statusConfig = {
  ACTIVE: { label: "Đang chạy", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  PLANNING: { label: "Lên kế hoạch", cls: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  ON_HOLD: { label: "Tạm dừng", cls: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  COMPLETED: { label: "Hoàn thành", cls: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
};

export function ProjectsClient() {
  const [search, setSearch] = useState("");

  const { data: fetchedProjects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });

  const projects = fetchedProjects.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    priority: p.priority,
    progress: 0, // Placeholder
    members: p.members?.length || 0,
    dueDate: p.dueDate ? new Date(p.dueDate) : undefined,
    color: p.color || "#3B82F6",
    taskCount: 0,
    completedTasks: 0,
  }));

  const filtered = projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dự án</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? "Đang tải..." : `${filtered.length} dự án trong hệ thống`}
          </p>
        </div>
        <button className="flex items-center gap-2 h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
          <Plus className="w-4 h-4" />
          Tạo dự án
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm dự án..."
          className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
        {filtered.map((project) => {
          const status = statusConfig[project.status as keyof typeof statusConfig];
          const isOverdue = Boolean(project.dueDate && project.dueDate < new Date() && project.status !== "COMPLETED");

          return (
            <div key={project.id} className="card-base p-5 hover:shadow-md transition-all duration-200 cursor-pointer group">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: project.color + "20" }}
                  >
                    <FolderKanban
                      className="w-4 h-4"
                      style={{ color: project.color }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <span className={cn("badge-status text-[10px] mt-0.5", status.cls)}>
                      {status.label}
                    </span>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted flex-shrink-0">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Tiến độ</span>
                  <span className="font-semibold text-foreground">{project.progress}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${project.progress}%`, backgroundColor: project.color }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{project.completedTasks}/{project.taskCount}</p>
                  <p className="text-[10px] text-muted-foreground">Tasks</p>
                </div>
                <div className="text-center border-x border-border">
                  <p className="text-sm font-bold text-foreground flex items-center justify-center gap-1">
                    <Users className="w-3 h-3" />
                    {project.members}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Thành viên</p>
                </div>
                <div className="text-center">
                  <p className={cn("text-sm font-bold flex items-center justify-center gap-1", isOverdue ? "text-red-500" : "text-foreground")}>
                    <Calendar className="w-3 h-3" />
                    {project.dueDate ? formatDate(project.dueDate, "dd/MM") : "-"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{isOverdue ? "Trễ hạn" : "Hạn chót"}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <div className="flex -space-x-1.5">
                  {Array.from({ length: Math.min(project.members, 4) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border-2 border-card flex items-center justify-center text-white text-[9px] font-bold"
                      style={{ backgroundColor: ["#F59E0B", "#3B82F6", "#10B981", "#8B5CF6"][i] ?? "#94A3B8" }}
                    >
                      {["N", "T", "H", "P"][i]}
                    </div>
                  ))}
                  {project.members > 4 && (
                    <div className="w-6 h-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[9px] text-muted-foreground font-bold">
                      +{project.members - 4}
                    </div>
                  )}
                </div>
                <span
                  className="text-xs font-medium px-2 py-1 rounded-full"
                  style={{ backgroundColor: project.color + "20", color: project.color }}
                >
                  {project.priority === "URGENT" ? "Khẩn" : project.priority === "HIGH" ? "Cao" : project.priority === "MEDIUM" ? "TB" : "Thấp"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
