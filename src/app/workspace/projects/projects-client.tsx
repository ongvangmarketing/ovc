"use client";

import { useMemo, useState } from "react";
import type { ElementType } from "react";
import { 
  Archive, 
  CalendarDays, 
  CheckCircle2, 
  CircleDot, 
  FolderKanban, 
  Plus, 
  Search, 
  Sparkles, 
  Users, 
  X,
  AlignLeft,
  LayoutGrid,
  Columns3,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { createProject } from "@/app/actions/projects";
import { cn } from "@/lib/utils/cn";
import { formatDate, getInitials } from "@/lib/utils/format";

const statusConfig: Record<string, { label: string; cls: string; dot: string }> = {
  PLANNING: { label: "Lên kế hoạch", cls: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  ACTIVE: { label: "Đang chạy", cls: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-500" },
  ON_HOLD: { label: "Tạm dừng", cls: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  COMPLETED: { label: "Hoàn tất", cls: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  CANCELLED: { label: "Đã hủy", cls: "bg-red-50 text-red-700", dot: "bg-red-500" },
};

const statusOrder = ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"];
const fallbackStatus = { label: "Đang chạy", cls: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-500" };

const projectColors = ["#4F46E5", "#0ea5e9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#64748B"];

type TaskLite = { status?: string | null };
type ProjectMemberLite = { userId: string };
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
  const searchParams = useSearchParams();
  const [projects] = useState(initialProjects);
  const [view, setView] = useState<"board" | "list" | "grid">("grid");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get("create") === "1");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", color: "#4F46E5" });

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
    <div className="flex min-h-[calc(100vh-64px)] flex-col bg-slate-50/50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-5 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 truncate text-lg font-semibold tracking-tight text-slate-900">
              <FolderKanban className="h-5 w-5 shrink-0 text-indigo-500" />
              Quản lý Dự án
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">Theo dõi tiến độ, nguồn lực và trạng thái triển khai.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-indigo-500 px-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-600">
            <Plus className="h-4 w-4" />
            Tạo dự án mới
          </button>
        </div>
        
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
          <StatCard icon={FolderKanban} label="Tổng dự án" value={projects.length} tone="bg-indigo-50 text-indigo-600" />
          <StatCard icon={CircleDot} label="Đang chạy" value={stats.active} tone="bg-blue-50 text-blue-600" />
          <StatCard icon={CheckCircle2} label="Hoàn tất" value={stats.completed} tone="bg-emerald-50 text-emerald-600" />
          <StatCard icon={Users} label="Nhân sự tham gia" value={stats.members || 0} tone="bg-violet-50 text-violet-600" />
        </div>
      </header>

      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          
          <div className="flex flex-col gap-3 border-b border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm dự án..." className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white" />
              </div>
              <div className="flex min-w-0 gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-1">
                {(["ALL", ...statusOrder]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={cn(
                      "whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                      status === s ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {s === "ALL" ? "Tất cả" : statusConfig[s]?.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button onClick={() => setView("grid")} className={cn("p-1.5 rounded-md flex items-center", view==="grid" ? "bg-white shadow-sm text-indigo-600":"text-slate-500")}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setView("board")} className={cn("p-1.5 rounded-md flex items-center", view==="board" ? "bg-white shadow-sm text-indigo-600":"text-slate-500")}><Columns3 className="w-4 h-4" /></button>
              <button onClick={() => setView("list")} className={cn("p-1.5 rounded-md flex items-center", view==="list" ? "bg-white shadow-sm text-indigo-600":"text-slate-500")}><AlignLeft className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-slate-50">
            {filtered.length === 0 ? (
              <div className="m-3 flex h-56 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-center">
                <Sparkles className="w-8 h-8 text-slate-300 mb-3" />
                <h3 className="text-base font-medium text-slate-900">Không tìm thấy dự án</h3>
              </div>
            ) : view === "grid" ? (
              <div className="grid gap-3 p-3 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((project) => <ProjectCard key={project.id} project={project} />)}
              </div>
            ) : view === "list" ? (
              <div className="m-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="divide-y divide-slate-100">
                  {filtered.map((project) => <ProjectRow key={project.id} project={project} />)}
                </div>
              </div>
            ) : (
              // BOARD VIEW
              <div className="flex h-full items-start gap-3 overflow-x-auto p-3">
                {statusOrder.map((s) => {
                  const list = filtered.filter(p => p.status === s);
                  return (
                    <div key={s} className="flex max-h-full w-72 shrink-0 flex-col rounded-lg border border-slate-200 bg-slate-100/50 shadow-sm">
                      <div className="sticky top-0 flex items-center justify-between rounded-t-lg border-b border-slate-200 bg-white/70 p-2.5">
                        <div className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                          <span className={cn("w-2 h-2 rounded-full", statusConfig[s]?.dot)}></span>
                          {statusConfig[s]?.label}
                        </div>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs font-bold rounded-full">{list.length}</span>
                      </div>
                      <div className="flex-1 space-y-2 overflow-y-auto p-2.5">
                        {list.map(project => (
                          <ProjectBoardCard key={project.id} project={project} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <div>
                  <h3 className="font-bold text-slate-900">Tạo dự án mới</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Thiết lập không gian làm việc cho team.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateProject} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên dự án *</label>
                  <input required autoFocus value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="VD: Chiến dịch ra mắt sản phẩm mới" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[100px] resize-none" placeholder="Mục tiêu, phạm vi, ghi chú..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Màu nhận diện</label>
                  <div className="flex flex-wrap gap-2">
                    {projectColors.map((color) => (
                      <button key={color} type="button" onClick={() => setFormData({ ...formData, color })} className={cn("h-8 w-8 rounded-full border-2 transition-all", formData.color === color ? "border-slate-800 ring-2 ring-slate-200" : "border-transparent hover:scale-110")} style={{ backgroundColor: color }} aria-label={color} />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Hủy</button>
                  <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl transition-colors shadow-sm disabled:opacity-60">{isLoading ? "Đang tạo..." : "Tạo dự án"}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: ElementType; label: string; value: number; tone: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div className="min-w-0">
        <div className="truncate text-xs font-medium text-slate-500">{label}</div>
        <div className="text-xl font-semibold leading-tight text-slate-900">{value}</div>
      </div>
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", tone)}>
        <Icon className="h-4 w-4" />
        </div>
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectLite }) {
  const status = statusConfig[project.status || "ACTIVE"] || fallbackStatus;
  const progress = getProgress(project);
  const taskCount = project._count?.tasks || 0;
  
  return (
    <Link href={`/workspace/projects/${project.id}`} className="group block rounded-lg border border-slate-200 bg-white p-3 transition-all hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm" style={{ backgroundColor: project.color || "#4F46E5" }}>
          {getInitials(project.name)}
        </div>
        <span className={cn("px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border flex items-center gap-1.5", status.cls)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
          {status.label}
        </span>
      </div>
      <h3 className="truncate font-semibold text-slate-900 transition-colors group-hover:text-indigo-600">{project.name}</h3>
      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{project.description || "Chưa có mô tả"}</p>
      
      <div className="mt-3 space-y-3">
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-medium text-slate-500">Tiến độ ({progress}%)</span>
            <span className="font-semibold text-slate-700">{taskCount} tasks</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
        
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex -space-x-2">
            {Array.from({ length: Math.min(project.members?.length || 1, 3) }).map((_, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                U
              </div>
            ))}
          </div>
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <CalendarDays className="w-3 h-3" /> {formatDate(project.updatedAt || project.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function ProjectBoardCard({ project }: { project: ProjectLite }) {
  const progress = getProgress(project);
  return (
    <Link href={`/workspace/projects/${project.id}`} className="group block rounded-lg border border-slate-200 bg-white p-3 transition-all hover:border-indigo-300 hover:shadow-md">
      <div className="mb-2.5 flex items-center gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white" style={{ backgroundColor: project.color || "#4F46E5" }}>
          {getInitials(project.name)}
        </div>
        <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">{project.name}</h4>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-3">
        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between items-center text-xs text-slate-500">
        <span className="font-medium">{progress}%</span>
        <span>{project._count?.tasks || 0} tasks</span>
      </div>
    </Link>
  );
}

function ProjectRow({ project }: { project: ProjectLite }) {
  const status = statusConfig[project.status || "ACTIVE"] || fallbackStatus;
  const progress = getProgress(project);
  return (
    <Link href={`/workspace/projects/${project.id}`} className="flex items-center gap-3 p-3 transition-colors hover:bg-slate-50">
      <div className="h-9 w-1 shrink-0 rounded-full" style={{ backgroundColor: project.color || "#4F46E5" }} />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-900 truncate">{project.name}</h3>
        <p className="text-xs text-slate-500 truncate mt-0.5">{project.description || "Chưa có mô tả"}</p>
      </div>
      <div className="w-32 hidden md:block">
        <span className={cn("px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border inline-flex items-center gap-1.5", status.cls)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
          {status.label}
        </span>
      </div>
      <div className="w-32 hidden sm:block">
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-semibold text-slate-600 w-8 text-right">{progress}%</span>
        </div>
      </div>
      <div className="w-24 text-right text-xs text-slate-500 hidden lg:block">
        {formatDate(project.updatedAt || project.createdAt)}
      </div>
      <button className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg transition-colors">
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </Link>
  );
}
