import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const projects = [
  {
    id: "1",
    name: "Website tái thiết kế OngVang.com",
    progress: 78,
    status: "active",
    members: 4,
    dueDate: "15/07/2026",
    color: "#F59E0B",
  },
  {
    id: "2",
    name: "App di động Khóa học",
    progress: 45,
    status: "active",
    members: 6,
    dueDate: "30/08/2026",
    color: "#3B82F6",
  },
  {
    id: "3",
    name: "Hệ thống CRM nội bộ",
    progress: 92,
    status: "review",
    members: 3,
    dueDate: "01/07/2026",
    color: "#10B981",
  },
  {
    id: "4",
    name: "Automation Marketing Flows",
    progress: 23,
    status: "planning",
    members: 2,
    dueDate: "15/09/2026",
    color: "#8B5CF6",
  },
  {
    id: "5",
    name: "Khóa học React Advanced",
    progress: 61,
    status: "active",
    members: 2,
    dueDate: "20/07/2026",
    color: "#EC4899",
  },
];

const statusConfig = {
  active: { label: "Đang chạy", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  review: { label: "Review", cls: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" },
  planning: { label: "Lên kế hoạch", cls: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
};

export function ProjectProgress() {
  return (
    <div className="card-base p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Tiến độ dự án</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Cập nhật mới nhất</p>
        </div>
        <Link
          href="/workspace/projects"
          className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          Xem tất cả <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {projects.map((project) => {
          const status = statusConfig[project.status as keyof typeof statusConfig];
          return (
            <div key={project.id} className="group p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-150 cursor-pointer">
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {project.name}
                  </p>
                </div>
                <span className={cn("badge-status flex-shrink-0 text-[10px]", status.cls)}>
                  {status.label}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${project.progress}%`, backgroundColor: project.color }}
                  />
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground tabular-nums flex-shrink-0">
                  <span className="font-medium text-foreground">{project.progress}%</span>
                  <span>·</span>
                  <span>{project.members} người</span>
                  <span>·</span>
                  <span>Hạn {project.dueDate}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
