"use client";

import { useMemo, useState } from "react";
import type { ElementType } from "react";
import { Archive, CalendarDays, CheckCircle2, CircleDot, FolderKanban, Plus, Search, SlidersHorizontal, Sparkles, Users, X } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createProject } from "@/app/actions/projects";
import { cn } from "@/lib/utils/cn";
import { formatDate, getInitials } from "@/lib/utils/format";
import { ViewSwitcher } from "@/components/ui/view-switcher";

const statusConfig: Record<string, { label: string; cls: string; dot: string }> = {
  PLANNING: { label: "Lên kế hoạch", cls: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  ACTIVE: { label: "Đang chạy", cls: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  ON_HOLD: { label: "Tạm dừng", cls: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  COMPLETED: { label: "Hoàn tất", cls: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  CANCELLED: { label: "Đã hủy", cls: "bg-red-100 text-red-700", dot: "bg-red-500" },
  ARCHIVED: { label: "Lưu trữ", cls: "bg-gray-100 text-gray-700", dot: "bg-gray-400" },
};
const fallbackStatus = statusConfig.ACTIVE as { label: string; cls: string; dot: string };

const projectColors = ["#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EF4444", "#06B6D4", "#64748B"];

type TaskLite = {
  status?: string | null;
};

type ProjectMemberLite = {
  userId: string;
};

type ProjectLite = {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  status?: string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  members?: ProjectMemberLite[];
  tasks?: TaskLite[];
  _count?: { tasks?: number };
};

function getProgress(project: ProjectLite) {
  const tasks = project.tasks || [];
  const total = project._count?.tasks ?? tasks.length ?? 0;
  const done = tasks.filter((task) => task.status === "DONE").length;
  return total ? Math.round((done / total) * 100) : 0;
}

export function ProjectsClient({ initialProjects }: { initialProjects: ProjectLite[] }) {
  const router = useRouter();
  const [projects] = useState(initialProjects);
  const [view, setView] = useState<"card" | "list">("card");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", color: "#F59E0B" });

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      const matchSearch = `${project.name} ${project.description || ""}`.toLowerCase().includes(search.toLowerCase());
      const matchStatus = status === "ALL" || project.status === status;
      return matchSearch && matchStatus;
    });
  }, [projects, search, status]);

  const stats = useMemo(() => {
    const active = projects.filter((project) => project.status === "ACTIVE").length;
    const completed = projects.filter((project) => project.status === "COMPLETED").length;
    const tasks = projects.reduce((sum, project) => sum + (project._count?.tasks || 0), 0);
    const members = new Set(projects.flatMap((project) => project.members?.map((member) => member.userId) || [])).size;
    return { active, completed, tasks, members };
  }, [projects]);

  const handleCreateProject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.name.trim()) return;
    setIsLoading(true);
    const res = await createProject(formData);
    if (res.success) {
      toast.success("Đã tạo dự án thành công");
      setIsModalOpen(false);
      router.push(`/workspace/projects/${res.id}`);
    } else {
      toast.error(res.error || "Có lỗi xảy ra");
    }
    setIsLoading(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Project OS
          </div>
          <h2 className="mt-2 text-2xl font-bold text-foreground">Danh sách Dự án</h2>
          <p className="mt-1 text-sm text-muted-foreground">Theo dõi tiến độ, nguồn lực và trạng thái triển khai trong một màn hình.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Tạo dự án
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Stat icon={FolderKanban} label="Tổng dự án" value={projects.length} tone="text-primary bg-primary/10" />
        <Stat icon={CircleDot} label="Đang chạy" value={stats.active} tone="text-emerald-600 bg-emerald-50" />
        <Stat icon={CheckCircle2} label="Hoàn tất" value={stats.completed} tone="text-blue-600 bg-blue-50" />
        <Stat icon={Users} label="Nhân sự tham gia" value={stats.members || 0} tone="text-violet-600 bg-violet-50" />
      </div>

      <div className="card-base p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-64 flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên hoặc mô tả..." className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3">
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 bg-transparent text-sm text-foreground outline-none">
              <option value="ALL">Tất cả trạng thái</option>
              {Object.entries(statusConfig).map(([key, item]) => (
                <option key={key} value={key}>{item.label}</option>
              ))}
            </select>
          </div>
          <ViewSwitcher value={view} onChange={(value) => setView(value as "card" | "list")} options={["card", "list"]} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state card-base">
          <Archive className="h-10 w-10 text-muted-foreground" />
          <div>
            <h3 className="font-semibold text-foreground">Chưa có dự án phù hợp</h3>
            <p className="mt-1 text-sm text-muted-foreground">Thử đổi bộ lọc hoặc tạo một dự án mới.</p>
          </div>
        </div>
      ) : view === "card" ? (
        <div className="data-grid">
          {filtered.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      ) : (
        <div className="card-base overflow-hidden">
          <div className="divide-y divide-border">
            {filtered.map((project) => <ProjectRow key={project.id} project={project} />)}
          </div>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-border p-5">
                <div>
                  <h3 className="font-bold text-foreground">Tạo dự án mới</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Thiết lập không gian làm việc cho team.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Đóng">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleCreateProject} className="space-y-4 p-5">
                <Field label="Tên dự án">
                  <input required autoFocus value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20" placeholder="VD: Campaign ra mắt showroom" />
                </Field>
                <Field label="Mô tả">
                  <textarea value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} className="min-h-28 w-full rounded-lg border border-border p-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20" placeholder="Mục tiêu, phạm vi, ghi chú..." />
                </Field>
                <Field label="Màu nhận diện">
                  <div className="flex flex-wrap gap-2">
                    {projectColors.map((color) => (
                      <button key={color} type="button" onClick={() => setFormData({ ...formData, color })} className={cn("h-8 w-8 rounded-full border-2 transition-all", formData.color === color ? "border-slate-900 ring-2 ring-slate-200" : "border-white hover:scale-105")} style={{ backgroundColor: color }} aria-label={color} />
                    ))}
                  </div>
                </Field>
                <div className="flex justify-end gap-2 border-t border-border pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="h-9 rounded-lg border border-border px-4 text-sm font-medium text-muted-foreground hover:bg-muted">Hủy</button>
                  <button type="submit" disabled={isLoading} className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60">{isLoading ? "Đang tạo..." : "Tạo dự án"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: ElementType; label: string; value: number; tone: string }) {
  return (
    <article className="stat-card">
      <div className="flex items-center justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", tone)}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-2xl font-bold text-foreground">{value}</span>
      </div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </article>
  );
}

function ProjectCard({ project }: { project: ProjectLite }) {
  const status = statusConfig[project.status || "ACTIVE"] || fallbackStatus;
  const progress = getProgress(project);
  const taskCount = project._count?.tasks || 0;
  return (
    <Link href={`/workspace/projects/${project.id}`} className="card-base group overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white" style={{ backgroundColor: project.color || "#F59E0B" }}>
            {getInitials(project.name)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">{project.name}</h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{project.description || "Chưa có mô tả dự án"}</p>
          </div>
        </div>
        <span className={cn("badge-status shrink-0", status.cls)}><span className={cn("priority-dot", status.dot)} />{status.label}</span>
      </div>
      <div className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">Tiến độ</span>
            <span className="font-semibold text-foreground">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/50 p-3 text-xs">
          <Metric label="Tasks" value={taskCount} />
          <Metric label="Team" value={project.members?.length || 1} />
          <Metric label="Cập nhật" value={formatDate(project.updatedAt || project.createdAt)} />
        </div>
      </div>
    </Link>
  );
}

function ProjectRow({ project }: { project: ProjectLite }) {
  const status = statusConfig[project.status || "ACTIVE"] || fallbackStatus;
  const progress = getProgress(project);
  return (
    <Link href={`/workspace/projects/${project.id}`} className="grid gap-4 p-4 transition-colors hover:bg-muted/50 md:grid-cols-[1.4fr_160px_180px_130px] md:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <div className="h-10 w-1 rounded-full" style={{ backgroundColor: project.color || "#F59E0B" }} />
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-foreground">{project.name}</h3>
          <p className="truncate text-xs text-muted-foreground">{project.description || "Chưa có mô tả"}</p>
        </div>
      </div>
      <span className={cn("badge-status w-fit", status.cls)}><span className={cn("priority-dot", status.dot)} />{status.label}</span>
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
        <span className="w-9 text-right text-xs font-semibold text-foreground">{progress}%</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarDays className="h-3.5 w-3.5" />
        {formatDate(project.updatedAt || project.createdAt)}
      </div>
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
