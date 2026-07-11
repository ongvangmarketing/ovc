"use client";

import { useMemo, useState } from "react";
import { 
  Plus, 
  Search, 
  X,
  FolderDot,
  LayoutGrid,
  List as ListIcon
} from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { createProject, uploadProjectThumbnail } from "@/modules/projects/actions/project.actions";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDate, getInitials } from "@/lib/utils/format";

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string; border: string }> = {
  PLANNING: { label: "LÊN KẾ HOẠCH", dot: "bg-gray-400", bg: "bg-white", text: "text-gray-500", border: "border-[#eaeaea]" },
  ACTIVE: { label: "ĐANG TRIỂN KHAI", dot: "bg-blue-500", bg: "bg-white", text: "text-black", border: "border-black" },
  ON_HOLD: { label: "TẠM DỪNG", dot: "bg-amber-500", bg: "bg-white", text: "text-amber-700", border: "border-amber-200" },
  COMPLETED: { label: "HOÀN THÀNH", dot: "bg-emerald-500", bg: "bg-white", text: "text-emerald-700", border: "border-emerald-200" },
  CANCELLED: { label: "ĐÃ HỦY", dot: "bg-red-500", bg: "bg-white", text: "text-red-700", border: "border-red-200" },
};

const projectColors = ["#000000", "#333333", "#666666", "#0ea5e9", "#10B981", "#F59E0B", "#EF4444"];

type TaskLite = { status?: string | null };
type ProjectMemberLite = { userId: string };
type ProjectLite = {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  thumbnail?: string | null;
  status?: string | null;
  startDate?: string | Date | null;
  dueDate?: string | Date | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  ownerId?: string | null;
  owner?: { name?: string | null } | null;
  members?: ProjectMemberLite[];
  tasks?: TaskLite[];
  _count?: { tasks?: number };
};

function stripHtml(html?: string | null) {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ");
}

function getProgress(project: ProjectLite) {
  const tasks = project.tasks || [];
  const total = project._count?.tasks ?? tasks.length ?? 0;
  const done = tasks.filter((task) => task.status === "DONE").length;
  return total ? Math.round((done / total) * 100) : 0;
}

export function ProjectsClient({ initialProjects }: { initialProjects: ProjectLite[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get("create") === "1");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", color: "#000000" });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return initialProjects.filter((project) => {
      const matchSearch = `${project.name} ${project.description || ""}`.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [initialProjects, search]);

  const activeCount = initialProjects.filter(p => p.status === "ACTIVE").length;

  const handleCreateProject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.name.trim()) return;
    setIsLoading(true);
    
    try {
      let thumbnailUrl = undefined;
      if (thumbnailFile) {
        const fileFormData = new FormData();
        fileFormData.append("file", thumbnailFile);
        thumbnailUrl = await uploadProjectThumbnail(fileFormData.get("file")) || undefined;
      }
      
      const res = await createProject({ ...formData, thumbnail: thumbnailUrl });
      if (res.success) {
        toast.success("Đã tạo dự án thành công");
        setIsModalOpen(false);
        router.push(`/workspace/projects/${res.id}`);
      } else {
        toast.error(res.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  const todayDate = new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  return (
    <div className="flex min-h-screen flex-col bg-white">
      
      <div className="max-w-[1200px] mx-auto w-full px-4 py-8 sm:px-8 sm:py-12">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[#eaeaea] pb-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase w-fit">
                Dự án
              </span>
              <span className="text-[13px] font-medium text-gray-500">{todayDate}</span>
            </div>
            <h1 className="mb-3 text-[32px] font-medium leading-[1.15] tracking-tight text-black md:text-[40px]">
              Quản lý <span className="text-gray-400">dự án.</span>
            </h1>
            <p className="text-[15px] text-gray-500 max-w-xl mt-4">
              Theo dõi tiến độ, nhiệm vụ và quản lý tất cả các dự án của bạn trên OVC.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 mt-4 md:mt-0">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Tổng dự án</span>
              <span className="text-[28px] font-medium text-black tracking-tight">{initialProjects.length}</span>
            </div>
            <div className="w-[1px] h-10 bg-[#eaeaea]"></div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Đang triển khai</span>
              <span className="text-[28px] font-medium text-black tracking-tight">{activeCount}</span>
            </div>
            <div className="w-[1px] h-10 bg-[#eaeaea] hidden sm:block"></div>
            <button onClick={() => setIsModalOpen(true)} className="hidden sm:inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800">
              <Plus className="h-4 w-4 mr-2" />
              Tạo mới
            </button>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="mb-8 flex flex-col justify-between rounded-2xl border border-[#eaeaea] bg-white px-2 py-1.5 shadow-sm md:flex-row md:items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Tìm tên dự án, mô tả..." 
              className="w-full bg-transparent pl-11 pr-4 py-2 text-[14px] text-black outline-none placeholder:text-gray-400" 
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 px-3 py-1.5 border-t md:border-t-0 md:border-l border-[#eaeaea]">
            <span className="text-[13px] text-gray-500 font-medium mr-2">Chế độ xem:</span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setViewMode("list")} 
                className={cn("flex items-center justify-center rounded-lg px-3 py-1.5 transition-all", viewMode === "list" ? "bg-black text-white" : "bg-white border border-[#eaeaea] text-gray-500 hover:bg-gray-50 hover:text-black")}
              >
                <ListIcon className="w-4 h-4 mr-1.5" strokeWidth={2} /> Danh sách
              </button>
              <button 
                onClick={() => setViewMode("grid")} 
                className={cn("flex items-center justify-center rounded-lg px-3 py-1.5 transition-all", viewMode === "grid" ? "bg-black text-white" : "bg-white border border-[#eaeaea] text-gray-500 hover:bg-gray-50 hover:text-black")}
              >
                <LayoutGrid className="w-4 h-4 mr-1.5" strokeWidth={2} /> Lưới
              </button>
            </div>
          </div>
        </div>

        {/* Project List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-lg border border-[#eaeaea] border-dashed">
            <FolderDot className="w-12 h-12 text-gray-200 mb-4" strokeWidth={1.5} />
            <h3 className="text-[16px] font-medium text-black mb-1">Không tìm thấy dự án</h3>
            <p className="text-[14px] text-gray-500">Thử thay đổi từ khóa tìm kiếm của bạn.</p>
          </div>
        ) : (
          <div className={cn(
            "grid gap-6",
            viewMode === "grid" ? "md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
          )}>
            {filtered.map((project) => (
              <ProjectStrictCard key={project.id} project={project} viewMode={viewMode} />
            ))}
          </div>
        )}

      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-white rounded-xl border border-[#eaeaea] shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-[#eaeaea] p-6">
                <h3 className="font-medium text-[20px] tracking-tight text-black">Tạo dự án mới</h3>
                <button onClick={() => setIsModalOpen(false)} className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-black transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleCreateProject} className="p-6 space-y-6">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-2 uppercase tracking-widest">Tên dự án *</label>
                  <input required autoFocus value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white border border-[#eaeaea] rounded-md px-3 py-2 text-[14px] text-black outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" placeholder="Tên dự án của bạn..." />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-2 uppercase tracking-widest">Mô tả</label>
                  <div className="border border-[#eaeaea] rounded-md overflow-hidden">
                    <TiptapEditor value={formData.description} onChange={(content) => setFormData({ ...formData, description: content })} placeholder="Mô tả ngắn gọn..." />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-2 uppercase tracking-widest">Màu nhận diện</label>
                  <div className="flex flex-wrap gap-3">
                    {projectColors.map((color) => (
                      <button key={color} type="button" onClick={() => setFormData({ ...formData, color })} className={cn("h-7 w-7 rounded-full transition-all border border-[#eaeaea]", formData.color === color ? "ring-2 ring-offset-2 ring-black scale-110" : "hover:scale-110")} style={{ backgroundColor: color }} aria-label={color} />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[#eaeaea]">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-md inline-flex items-center text-[13px] font-medium text-black bg-white border border-[#eaeaea] hover:bg-gray-50 transition-colors">Hủy</button>
                  <button type="submit" disabled={isLoading} className="px-5 py-2.5 rounded-md inline-flex items-center text-[13px] font-medium text-white bg-black hover:bg-gray-800 transition-colors disabled:opacity-60">{isLoading ? "Đang tạo..." : "Tạo dự án"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjectStrictCard({ project, viewMode }: { project: ProjectLite, viewMode: "grid" | "list" }) {
  const status = statusConfig[project.status || "ACTIVE"] ?? statusConfig.ACTIVE!;
  const progress = getProgress(project);
  
  return (
    <Link href={`/workspace/projects/${project.id}`} className={cn(
      "group flex flex-col justify-between rounded-[24px] border border-[#eaeaea] bg-white shadow-sm transition-colors hover:border-black focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black overflow-hidden",
      viewMode === "list" ? "sm:flex-row sm:items-stretch" : "h-full"
    )}>
      
      {/* Thumbnail Area */}
      <div className={cn(
        "relative shrink-0 overflow-hidden bg-gray-100",
        viewMode === "grid" ? "w-full aspect-[2/1] border-b border-[#eaeaea]" : "w-48 sm:w-56 border-b sm:border-b-0 sm:border-r border-[#eaeaea] aspect-[2/1] sm:aspect-auto"
      )}>
        {project.thumbnail && <Image src={project.thumbnail} alt={project.name} fill className="object-cover transition-all duration-500 group-hover:grayscale" />}
      </div>

      <div className={cn(
        "flex flex-col flex-1",
        viewMode === "list" ? "p-5 sm:flex-row sm:items-center sm:gap-5" : "p-5"
      )}>
        <div className={cn(viewMode === "list" ? "flex-1" : "")}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-[20px] font-medium tracking-tight text-black group-hover:text-gray-600 transition-colors leading-tight">{project.name}</h3>
              <span className="mt-2 inline-block rounded-md border border-[#eaeaea] px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-black bg-white">
                {status.label}
              </span>
            </div>
          </div>

          {/* Progress Section */}
          <div className={cn(viewMode === "list" ? "mt-4" : "")}>
            <div className="flex justify-between items-center text-[13px] font-medium text-gray-500 mb-2">
              <span>Tiến độ</span>
              <span className="text-black">{progress}%</span>
            </div>
            <div className="h-1 w-full bg-[#eaeaea] overflow-hidden rounded-full">
              <div className="h-full bg-black transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className={cn(
          viewMode === "list" ? "mt-5 flex w-full sm:mt-0 sm:max-w-xs flex-col justify-center sm:border-l sm:border-[#eaeaea] sm:pl-5" : "mt-5 border-t border-[#eaeaea] pt-5"
        )}>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-3">
            <div>
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-widest block mb-1">Bắt đầu</span>
              <strong className="block text-[15px] font-medium text-black">{project.startDate ? formatDate(project.startDate) : "Chưa cập nhật"}</strong>
            </div>
            <div>
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-widest block mb-1">Hạn chót</span>
              <strong className="block text-[15px] font-medium text-black">{project.dueDate ? formatDate(project.dueDate) : "Chưa cập nhật"}</strong>
            </div>
            <div>
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-widest block mb-1">Nhiệm vụ</span>
              <strong className="block text-[15px] font-medium text-black">{project._count?.tasks || 0}</strong>
            </div>
            <div>
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-widest block mb-1">Ngân sách</span>
              <strong className="block text-[15px] font-medium text-black">0 ₫</strong>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center border border-[#eaeaea] overflow-hidden text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <span className="text-[13px] font-medium text-black line-clamp-1">
                {project.owner?.name || "Chưa gán"}
              </span>
            </div>

            {project.members && project.members.length > 0 ? (
              <div className="flex -space-x-2">
                {Array.from({ length: Math.min(project.members.length, 3) }).map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border border-white bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-500 overflow-hidden">
                    U
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-[12px] font-medium text-gray-400 italic">Không có</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
