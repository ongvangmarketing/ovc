"use client";

import { useMemo, useState } from "react";
import type { ElementType } from "react";
import { Activity, ArrowLeft, BarChart3, CalendarDays, CheckCircle2, Clock3, Edit3, FileBox, FileUp, Flag, LayoutGrid, ListChecks, MessageSquare, MoreHorizontal, Paperclip, Plus, Tag, TimerReset, Trash2, User, UserPlus, Users, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import type { TaskStatus } from "@prisma/client";
import { addProjectMember, createTask, removeProjectMember, updateProjectOwner, updateTaskStatus } from "@/app/actions/projects";
import { cn } from "@/lib/utils/cn";
import { formatDate, getInitials } from "@/lib/utils/format";

const statusConfig: Record<string, { label: string; cls: string; dot: string }> = {
  PLANNING: { label: "Lên kế hoạch", cls: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  ACTIVE: { label: "Đang chạy", cls: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  ON_HOLD: { label: "Tạm dừng", cls: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  COMPLETED: { label: "Hoàn tất", cls: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  CANCELLED: { label: "Đã hủy", cls: "bg-red-100 text-red-700", dot: "bg-red-500" },
  ARCHIVED: { label: "Lưu trữ", cls: "bg-gray-100 text-gray-700", dot: "bg-gray-400" },
};
const fallbackStatus = statusConfig.ACTIVE as { label: string; cls: string; dot: string };

const priorityConfig: Record<string, { label: string; cls: string; dot: string }> = {
  LOW: { label: "Thấp", cls: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  MEDIUM: { label: "Vừa", cls: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  HIGH: { label: "Cao", cls: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  URGENT: { label: "Khẩn", cls: "bg-red-100 text-red-700", dot: "bg-red-500" },
};
const fallbackPriority = priorityConfig.MEDIUM as { label: string; cls: string; dot: string };

const columns = [
  { id: "BACKLOG", title: "Chưa bắt đầu", tone: "bg-zinc-50 border-zinc-200", dot: "bg-zinc-400" },
  { id: "TODO", title: "Cần làm", tone: "bg-slate-50 border-slate-200", dot: "bg-slate-400" },
  { id: "IN_PROGRESS", title: "Đang làm", tone: "bg-blue-50 border-blue-200", dot: "bg-blue-500" },
  { id: "IN_REVIEW", title: "Đang duyệt", tone: "bg-amber-50 border-amber-200", dot: "bg-amber-500" },
  { id: "DONE", title: "Hoàn tất", tone: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  { id: "CANCELLED", title: "Đã hủy", tone: "bg-red-50 border-red-200", dot: "bg-red-500" },
];

const baseTabs = [
  { id: "overview", label: "Tổng quan", icon: LayoutGrid },
  { id: "kanban", label: "Kanban", icon: CheckCircle2 },
  { id: "timeline", label: "Timeline", icon: BarChart3 },
  { id: "files", label: "Tập tin", icon: FileBox },
  { id: "discussion", label: "Trao đổi", icon: MessageSquare },
];

type TaskLite = {
  id: string;
  title: string;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  dueDate?: string | Date | null;
  startDate?: string | Date | null;
  tags?: string[];
  assignee?: { name?: string | null; image?: string | null } | null;
  subtasks?: Array<{ id: string; title: string; status?: string | null }>;
  comments?: Array<{ id: string; content: string; createdAt?: string | Date | null }>;
  attachments?: Array<{ id: string; name: string }>;
};

type ProjectLite = {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  status?: string | null;
  priority?: string | null;
  startDate?: string | Date | null;
  dueDate?: string | Date | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  members?: Array<{ id: string; userId: string; user?: { name?: string | null; email?: string | null } | null }>;
  availableMembers?: Array<{ userId: string; role?: string | null; user?: { name?: string | null; email?: string | null } | null }>;
  owner?: { id: string; name?: string | null; email?: string | null } | null;
  ownerId?: string | null;
  tasks?: TaskLite[];
  socialMarketingEnabled?: boolean;
  facebookProjectReport?: {
    pageEnabled: boolean;
    adsEnabled: boolean;
    pageExternalId: string;
    pageName: string;
    adAccountExternalId: string;
    adAccountName: string;
    adIds: string[];
    campaignIds: string[];
    pageTotals: { reach: number; impressions: number; engagements: number; leads: number };
    adsTotals: { spend: number; reach: number; impressions: number; clicks: number; leads: number };
    posts: Array<{ id: string; caption?: string | null; permalinkUrl?: string | null; publishedAt?: string | Date | null }>;
    pageDaily?: Array<{ date: string; reach: number; impressions: number; engagements: number; leads: number }>;
    adsDaily?: Array<{ date: string; spend: number; reach: number; impressions: number; clicks: number; leads: number }>;
    diagnostics?: { pageInsightRows: number; pagePostRows: number; adInsightRows: number };
  } | null;
};

export function ProjectDetailClient({ project }: { project: ProjectLite }) {
  const router = useRouter();
  const [tasks, setTasks] = useState(project.tasks || []);
  const [activeTab, setActiveTab] = useState("overview");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [reportSource, setReportSource] = useState<"all" | "page" | "ads">("all");
  const [reportRange, setReportRange] = useState<7 | 14 | 30>(30);
  const [targetColumnId, setTargetColumnId] = useState<TaskStatus>("TODO");
  const [memberToAdd, setMemberToAdd] = useState("");
  const [ownerId, setOwnerId] = useState(project.ownerId || project.owner?.id || "");
  const [isMemberSaving, setIsMemberSaving] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "TODO" as TaskStatus,
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    startDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    assigneeId: "",
    followerIds: [] as string[],
    tags: "",
    subtasks: [] as Array<{ id: string; title: string; done: boolean }>,
    subtaskDraft: "",
    attachmentNames: [] as string[],
  });

  const status = statusConfig[project.status || "ACTIVE"] || fallbackStatus;
  const priority = priorityConfig[project.priority || "MEDIUM"] || fallbackPriority;
  const tabs = project.socialMarketingEnabled ? [...baseTabs, { id: "report", label: "Báo cáo", icon: BarChart3 }] : baseTabs;
  const facebookReport = project.facebookProjectReport;
  const activeTabLabel = tabs.find((tab) => tab.id === activeTab)?.label || "Tổng quan";
  const doneTasks = tasks.filter((task) => task.status === "DONE").length;
  const progress = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const openTasks = tasks.length - doneTasks;
  const pageChartData = (facebookReport?.pageDaily || []).slice(-reportRange);
  const adsChartData = (facebookReport?.adsDaily || []).slice(-reportRange);
  const reportInsights = facebookReport ? buildReportInsights(facebookReport) : [];

  const taskStats = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      count: tasks.filter((task) => task.status === column.id).length,
    }));
  }, [tasks]);

  const timelinePhases = useMemo(() => {
    const datedTasks = tasks.filter((task) => task.startDate || task.dueDate).slice(0, 5);
    if (datedTasks.length) {
      return datedTasks.map((task) => ({
        id: task.id,
        title: task.title,
        start: task.startDate ? formatDate(task.startDate) : "Chưa đặt",
        end: task.dueDate ? formatDate(task.dueDate) : "Chưa đặt",
        status: columns.find((column) => column.id === task.status)?.title || "Cần làm",
      }));
    }

    return [
      {
        id: "project-phase",
        title: "Giai đoạn tổng",
        start: project.startDate ? formatDate(project.startDate) : "Chưa đặt",
        end: project.dueDate ? formatDate(project.dueDate) : "Chưa đặt",
        status: status.label,
      },
    ];
  }, [project.dueDate, project.startDate, status.label, tasks]);

  const availableToAdd = useMemo(() => {
    const activeIds = new Set(project.members?.map((member) => member.userId) || []);
    return (project.availableMembers || []).filter((member) => !activeIds.has(member.userId));
  }, [project.availableMembers, project.members]);

  const handleAddMember = async () => {
    if (!memberToAdd) return;
    setIsMemberSaving(true);
    const res = await addProjectMember(project.id, memberToAdd);
    if (res.success) {
      toast.success("Đã thêm người vào dự án");
      setMemberToAdd("");
      router.refresh();
    } else {
      toast.error(res.error || "Không thêm được người");
    }
    setIsMemberSaving(false);
  };

  const handleOwnerChange = async (nextOwnerId: string) => {
    setOwnerId(nextOwnerId);
    if (!nextOwnerId) return;
    setIsMemberSaving(true);
    const res = await updateProjectOwner(project.id, nextOwnerId);
    if (res.success) {
      toast.success("Đã cập nhật người chịu trách nhiệm");
      router.refresh();
    } else {
      toast.error(res.error || "Không cập nhật được người phụ trách");
    }
    setIsMemberSaving(false);
  };

  const handleRemoveMember = async (userId: string) => {
    if (userId === ownerId) {
      toast.error("Đổi người chịu trách nhiệm trước khi xóa người này.");
      return;
    }

    setIsMemberSaving(true);
    const res = await removeProjectMember(project.id, userId);
    if (res.success) {
      toast.success("Đã xóa người khỏi dự án");
      router.refresh();
    } else {
      toast.error(res.error || "Không xóa được người");
    }
    setIsMemberSaving(false);
  };

  const handleDragStart = (event: React.DragEvent, taskId: string) => {
    event.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = async (event: React.DragEvent, statusId: string) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("taskId");
    if (!taskId) return;
    const previousTasks = [...tasks];
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, status: statusId } : task));
    const res = await updateTaskStatus(taskId, project.id, statusId as TaskStatus);
    if (!res.success) {
      toast.error("Không cập nhật được trạng thái task");
      setTasks(previousTasks);
    }
  };

  const openCreateTask = (columnId = "TODO") => {
    setTargetColumnId(columnId as TaskStatus);
    setTaskForm({
      title: "",
      description: "",
      status: columnId as TaskStatus,
      priority: "MEDIUM",
      startDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      assigneeId: "",
      followerIds: [],
      tags: "",
      subtasks: [],
      subtaskDraft: "",
      attachmentNames: [],
    });
    setIsTaskModalOpen(true);
  };

  const handleCreateTask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!taskForm.title.trim()) return;
    setIsCreatingTask(true);
    const res = await createTask({
      projectId: project.id,
      title: taskForm.title,
      description: taskForm.description,
      status: taskForm.status || targetColumnId,
      priority: taskForm.priority,
      startDate: taskForm.startDate,
      dueDate: taskForm.dueDate,
      assigneeId: taskForm.assigneeId,
      followerIds: taskForm.followerIds,
      tags: taskForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      subtasks: taskForm.subtasks.filter((task) => task.title.trim()).map((task) => ({ title: task.title.trim(), done: task.done })),
      attachmentNames: taskForm.attachmentNames,
    });
    if (res.success && res.task) {
      toast.success("Đã tạo phân công");
      setTasks((current) => [...current, res.task]);
      setIsTaskModalOpen(false);
    } else {
      toast.error(res.error || "Không tạo được phân công");
    }
    setIsCreatingTask(false);
  };

  return (
    <div className="page-container">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="card-base relative overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1" style={{ backgroundColor: project.color || "#F59E0B" }} />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.14),transparent_55%)]" />
        <div className="relative border-b border-border p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <Link href="/workspace/projects" className="mt-1 rounded-lg border border-border bg-white/80 p-2 text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground" aria-label="Quay lại">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <motion.div
                initial={{ rotate: -8, scale: 0.92 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 240, damping: 18 }}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-sm"
                style={{ backgroundColor: project.color || "#F59E0B" }}
              >
                {getInitials(project.name)}
              </motion.div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold text-foreground">{project.name}</h2>
                  <span className={cn("badge-status", status.cls)}><span className={cn("priority-dot", status.dot)} />{status.label}</span>
                  <span className={cn("badge-status", priority.cls)}><span className={cn("priority-dot", priority.dot)} />{priority.label}</span>
                </div>
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{project.description || "Chưa có mô tả. Thêm brief, phạm vi và mục tiêu ở trang sửa dự án để team nắm nhanh bối cảnh."}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} onClick={() => openCreateTask()} className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Phân công
              </motion.button>
              <Link href={`/workspace/projects/${project.id}/edit`} className="flex h-9 items-center gap-2 rounded-lg border border-border bg-white/90 px-4 text-sm font-medium text-foreground shadow-sm hover:bg-muted">
                <Edit3 className="h-4 w-4" />
                Sửa dự án
              </Link>
            </div>
          </div>
        </div>

        <div className="relative grid gap-4 p-5 md:grid-cols-[1fr_280px]">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Tiến độ tổng</span>
              <span className="font-bold text-foreground">{progress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.65, ease: "easeOut" }}
                className="h-full rounded-full bg-primary"
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted px-2.5 py-1">Đang xem: {activeTabLabel}</span>
              <span className="rounded-full bg-muted px-2.5 py-1">{doneTasks}/{tasks.length} task hoàn tất</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <MiniMetric label="Tổng task" value={tasks.length} />
            <MiniMetric label="Còn mở" value={openTasks} />
            <MiniMetric label="Team" value={project.members?.length || 1} />
          </div>
        </div>
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.28 }}
        className="flex gap-2 overflow-x-auto rounded-2xl border border-border bg-white p-2 shadow-sm"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("relative flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-medium whitespace-nowrap transition-colors", isActive ? "text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              {isActive ? <motion.span layoutId="project-active-tab" className="absolute inset-0 rounded-xl bg-primary shadow-sm" transition={{ type: "spring", stiffness: 420, damping: 34 }} /> : null}
              <Icon className="relative h-4 w-4" />
              <span className="relative">{tab.label}</span>
            </button>
          );
        })}
        <button className="ml-auto rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Thêm">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </motion.div>

      {activeTab === "overview" ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="card-base p-5">
            <h3 className="mb-4 font-bold text-foreground">Bảng vận hành</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Info icon={CalendarDays} label="Ngày bắt đầu" value={project.startDate ? formatDate(project.startDate) : "Chưa đặt"} />
              <Info icon={Flag} label="Hạn hoàn thành" value={project.dueDate ? formatDate(project.dueDate) : "Chưa đặt"} />
              <Info icon={TimerReset} label="Cập nhật gần nhất" value={formatDate(project.updatedAt || project.createdAt)} />
              <Info icon={Users} label="Thành viên" value={`${project.members?.length || 1} người`} />
            </div>
            <div className="mt-5 rounded-2xl border border-border bg-muted/30 p-4">
              <p className="text-sm font-semibold text-foreground">Brief dự án</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{project.description || "Chưa có brief. Đây là nơi nên ghi mục tiêu, phạm vi triển khai, tiêu chí nghiệm thu và các ràng buộc quan trọng."}</p>
            </div>
          </div>
          <div className="card-base p-5">
            <h3 className="mb-4 font-bold text-foreground">Tình trạng phân công</h3>
            <div className="space-y-3">
              {taskStats.map((item) => (
                <div key={item.id} className="rounded-xl border border-border p-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-foreground"><span className={cn("priority-dot", item.dot)} />{item.title}</span>
                    <span className="font-bold">{item.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className={cn("h-full rounded-full", item.dot)} style={{ width: `${tasks.length ? (item.count / tasks.length) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card-base p-5 xl:col-span-2">
            <h3 className="mb-4 font-bold text-foreground">Timeline theo giai đoạn</h3>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {timelinePhases.map((phase, index) => (
                <div key={phase.id} className="relative rounded-2xl border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</span>
                    <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground">{phase.status}</span>
                  </div>
                  <p className="line-clamp-2 text-sm font-semibold text-foreground">{phase.title}</p>
                  <p className="mt-3 text-xs text-muted-foreground">{phase.start} - {phase.end}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card-base p-5 xl:col-span-2">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-foreground">Người tham gia</h3>
                <p className="mt-1 text-sm text-muted-foreground">Một người chịu trách nhiệm chính, nhiều người có thể follow dự án.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <select value={memberToAdd} onChange={(event) => setMemberToAdd(event.target.value)} className="h-9 min-w-56 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20">
                  <option value="">Thêm người từ workspace</option>
                  {availableToAdd.map((member) => (
                    <option key={member.userId} value={member.userId}>{member.user?.name || member.user?.email || "Thành viên"}</option>
                  ))}
                </select>
                <button onClick={handleAddMember} disabled={!memberToAdd || isMemberSaving} className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
                  <UserPlus className="h-4 w-4" />
                  Thêm
                </button>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
              <div className="rounded-2xl border border-border p-4">
                <Field label="Người chịu trách nhiệm">
                  <select value={ownerId} onChange={(event) => handleOwnerChange(event.target.value)} className="quote-input">
                    <option value="">Chọn owner dự án</option>
                    {(project.availableMembers || project.members || []).map((member) => (
                      <option key={member.userId} value={member.userId}>{member.user?.name || member.user?.email || "Thành viên"}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {project.members?.map((member) => {
                  const isOwner = member.userId === ownerId;
                  return (
                  <div key={member.userId} className="relative rounded-2xl border border-border p-4">
                    {!isOwner ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.userId)}
                        disabled={isMemberSaving}
                        className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        aria-label="Xóa người khỏi dự án"
                        title="Xóa khỏi dự án"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                      {getInitials(member.user?.name || member.user?.email || "TV")}
                    </div>
                    <p className="truncate text-sm font-semibold text-foreground">{member.user?.name || "Thành viên"}</p>
                    <p className="truncate text-xs text-muted-foreground">{member.user?.email}</p>
                    <span className={cn("mt-3 inline-flex rounded-full px-2 py-1 text-[11px] font-semibold", isOwner ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                      {isOwner ? "Chịu trách nhiệm" : "Follower"}
                    </span>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === "kanban" ? (
        <div className="min-h-[560px] overflow-x-auto pb-2">
          <div className="flex min-w-max gap-4">
            {columns.map((column) => {
              const columnTasks = tasks.filter((task) => task.status === column.id);
              return (
                <div key={column.id} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(event, column.id)} className={cn("flex h-[560px] w-80 flex-col rounded-2xl border p-3", column.tone)}>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn("priority-dot", column.dot)} />
                      <h3 className="font-semibold text-foreground">{column.title}</h3>
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-muted-foreground">{columnTasks.length}</span>
                    </div>
                    <button onClick={() => openCreateTask(column.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-white hover:text-foreground" aria-label="Thêm task">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                    {columnTasks.map((task) => (
                      <div key={task.id} draggable onDragStart={(event) => handleDragStart(event, task.id)} className="kanban-card">
                        <h4 className="text-sm font-semibold leading-5 text-foreground">{task.title}</h4>
                        {task.description ? <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{task.description}</p> : null}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {task.tags?.map((tag) => (
                            <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{tag}</span>
                          ))}
                        </div>
                        <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center justify-between gap-2">
                            <span className={cn("badge-status", priorityConfig[task.priority || "MEDIUM"]?.cls)}>{priorityConfig[task.priority || "MEDIUM"]?.label}</span>
                            <span className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5" />
                              {task.assignee?.name || "Chưa gán"}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            {task.startDate ? <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{formatDate(task.startDate)}</span> : null}
                            {task.dueDate ? <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{formatDate(task.dueDate)}</span> : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-2">
                            <span className="flex items-center gap-1"><ListChecks className="h-3.5 w-3.5" />{task.subtasks?.length || 0}</span>
                            <span className="flex items-center gap-1"><Paperclip className="h-3.5 w-3.5" />{task.attachments?.length || 0}</span>
                            <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" />{task.comments?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {activeTab === "report" ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <div className="card-base p-5">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-foreground">Báo cáo Facebook của dự án</h3>
                <p className="mt-1 text-sm text-muted-foreground">Dữ liệu lấy theo nguồn đã tick trong phần Sửa dự án.</p>
              </div>
              <Link href={`/workspace/projects/${project.id}/edit`} className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">Cấu hình nguồn</Link>
            </div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/20 p-3">
              <div className="flex rounded-xl bg-white p-1 shadow-sm">
                {(["all", "page", "ads"] as const).map((source) => (
                  <button
                    key={source}
                    type="button"
                    onClick={() => setReportSource(source)}
                    className={cn("rounded-lg px-3 py-2 text-sm font-medium transition", reportSource === source ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
                  >
                    {source === "all" ? "Tất cả" : source === "page" ? "Page" : "Ads"}
                  </button>
                ))}
              </div>
              <div className="flex rounded-xl bg-white p-1 shadow-sm">
                {([7, 14, 30] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setReportRange(range)}
                    className={cn("rounded-lg px-3 py-2 text-sm font-medium transition", reportRange === range ? "bg-slate-900 text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
                  >
                    {range} ngày
                  </button>
                ))}
              </div>
            </div>

            {!facebookReport?.pageEnabled && !facebookReport?.adsEnabled ? (
              <div className="empty-state">
                <BarChart3 className="h-10 w-10 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold text-foreground">Chưa bật nguồn report</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Vào Sửa dự án để tick Facebook Page hoặc Facebook Ads.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                {facebookReport.pageEnabled && reportSource !== "ads" ? (
                  <section className="rounded-2xl border border-border bg-muted/20 p-4">
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-foreground">Facebook Page</h4>
                        <p className="text-sm text-muted-foreground">{facebookReport.pageName || facebookReport.pageExternalId || "Chưa chọn Page"}</p>
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Page</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <ReportMetric label="Reach" value={facebookReport.pageTotals.reach} />
                      <ReportMetric label="Impression" value={facebookReport.pageTotals.impressions} />
                      <ReportMetric label="Engagement" value={facebookReport.pageTotals.engagements} />
                      <ReportMetric label="Lead" value={facebookReport.pageTotals.leads} />
                    </div>
                    <div className="mt-4 h-60 rounded-2xl bg-white p-3">
                      {pageChartData.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={pageChartData} margin={{ left: -18, right: 8, top: 12, bottom: 0 }}>
                            <defs>
                              <linearGradient id="pageReachFill" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.28} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
                            <YAxis tickLine={false} axisLine={false} fontSize={11} />
                            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                            <Area type="monotone" dataKey="reach" stroke="#3b82f6" fill="url(#pageReachFill)" strokeWidth={2} name="Reach" />
                            <Area type="monotone" dataKey="engagements" stroke="#10b981" fill="transparent" strokeWidth={2} name="Engagement" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <ChartEmpty message="Chưa có dữ liệu Page insight trong khoảng lọc." />
                      )}
                    </div>
                    <div className="mt-4 space-y-2">
                      {facebookReport.posts.map((post) => (
                        <a key={post.id} href={post.permalinkUrl || "#"} target="_blank" rel="noreferrer" className="block rounded-xl border border-border bg-white p-3 text-sm hover:bg-muted/40">
                          <span className="line-clamp-2 font-medium text-foreground">{post.caption || "Bài viết Facebook"}</span>
                          <span className="mt-1 block text-xs text-muted-foreground">{post.publishedAt ? formatDate(post.publishedAt) : "Chưa rõ ngày"}</span>
                        </a>
                      ))}
                      {!facebookReport.posts.length ? <p className="rounded-xl bg-white p-3 text-sm text-muted-foreground">Chưa có bài viết đã đồng bộ.</p> : null}
                    </div>
                  </section>
                ) : null}

                {facebookReport.adsEnabled && reportSource !== "page" ? (
                  <section className="rounded-2xl border border-border bg-muted/20 p-4">
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-foreground">Facebook Ads</h4>
                        <p className="text-sm text-muted-foreground">
                          {facebookReport.adAccountName || facebookReport.adAccountExternalId || "Chưa chọn Ad Account"} · {facebookReport.campaignIds.length} campaign, {facebookReport.adIds.length} ads
                        </p>
                      </div>
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">Ads</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <ReportMetric label="Chi tiêu" value={formatMoney(facebookReport.adsTotals.spend)} />
                      <ReportMetric label="Reach" value={facebookReport.adsTotals.reach} />
                      <ReportMetric label="Click" value={facebookReport.adsTotals.clicks} />
                      <ReportMetric label="Lead" value={facebookReport.adsTotals.leads} />
                      <ReportMetric label="Impression" value={facebookReport.adsTotals.impressions} className="col-span-2" />
                    </div>
                    <div className="mt-4 h-60 rounded-2xl bg-white p-3">
                      {adsChartData.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={adsChartData} margin={{ left: -18, right: 8, top: 12, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
                            <YAxis tickLine={false} axisLine={false} fontSize={11} />
                            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} formatter={(value, name) => name === "spend" ? formatMoney(Number(value)) : Number(value).toLocaleString("vi-VN")} />
                            <Bar dataKey="spend" name="Chi tiêu" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="leads" name="Lead" fill="#10b981" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <ChartEmpty message="Chưa có dữ liệu Ads trong khoảng lọc." />
                      )}
                    </div>
                  </section>
                ) : null}
                </div>
                <section className="rounded-2xl border border-border bg-white p-4">
                  <h4 className="mb-3 font-semibold text-foreground">Phân tích nhanh</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {reportInsights.map((item) => (
                      <div key={item} className="rounded-xl bg-muted/40 p-3 text-sm leading-6 text-muted-foreground">{item}</div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>

          <aside className="card-base p-5">
            <h3 className="mb-4 font-bold text-foreground">Nguồn đang bật</h3>
            <div className="space-y-3">
              <SourceRow label="Facebook Page" active={Boolean(facebookReport?.pageEnabled)} />
              <SourceRow label="Facebook Ads" active={Boolean(facebookReport?.adsEnabled)} />
            </div>
          </aside>
        </div>
      ) : null}

      {activeTab !== "overview" && activeTab !== "kanban" && activeTab !== "report" ? (
        <div className="empty-state card-base">
          <Tag className="h-10 w-10 text-muted-foreground" />
          <div>
            <h3 className="font-semibold text-foreground">Khu vực đang được hoàn thiện</h3>
            <p className="mt-1 text-sm text-muted-foreground">Tab này đã có chỗ trong UI để mở rộng timeline, file và trao đổi.</p>
          </div>
        </div>
      ) : null}

      <AnimatePresence>
        {isTaskModalOpen ? (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.96 }} transition={{ type: "spring", stiffness: 260, damping: 24 }} className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[8px] bg-white shadow-xl">
              <div className="quote-panel-header sticky top-0 z-10 bg-white">
                <div>
                  <h2>Thêm phân công</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Thiết lập người làm, timeline, tag và checklist cho task.</p>
                </div>
                <button onClick={() => setIsTaskModalOpen(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Đóng">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleCreateTask} className="space-y-5 overflow-y-auto p-5">
                <Field label="Tiêu đề">
                  <input required autoFocus value={taskForm.title} onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })} className="quote-input" />
                </Field>
                <Field label="Mô tả">
                  <textarea value={taskForm.description} onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })} className="quote-input min-h-[112px] resize-y" />
                </Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Trạng thái">
                    <select value={taskForm.status} onChange={(event) => setTaskForm({ ...taskForm, status: event.target.value as TaskStatus })} className="quote-input">
                      <option value="BACKLOG">Chưa bắt đầu</option>
                      <option value="TODO">Cần làm</option>
                      <option value="IN_PROGRESS">Đang làm</option>
                      <option value="IN_REVIEW">Đang duyệt</option>
                      <option value="DONE">Hoàn thành</option>
                      <option value="CANCELLED">Đã hủy</option>
                    </select>
                  </Field>
                  <Field label="Mức độ ưu tiên">
                    <select value={taskForm.priority} onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value as typeof taskForm.priority })} className="quote-input">
                      <option value="LOW">Thấp</option>
                      <option value="MEDIUM">Vừa</option>
                      <option value="HIGH">Cao</option>
                      <option value="URGENT">Khẩn</option>
                    </select>
                  </Field>
                  <Field label="Ngày bắt đầu">
                    <input type="date" value={taskForm.startDate} onChange={(event) => setTaskForm({ ...taskForm, startDate: event.target.value })} className="quote-input" />
                  </Field>
                  <Field label="Ngày kết thúc">
                    <input type="date" value={taskForm.dueDate} onChange={(event) => setTaskForm({ ...taskForm, dueDate: event.target.value })} className="quote-input" />
                  </Field>
                  <Field label="Người làm">
                    <select value={taskForm.assigneeId} onChange={(event) => setTaskForm({ ...taskForm, assigneeId: event.target.value })} className="quote-input">
                      <option value="">Chưa phân công</option>
                      {project.members?.map((member) => (
                        <option key={member.userId} value={member.userId}>{member.user?.name || member.user?.email || "Thành viên"}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Tag">
                    <input value={taskForm.tags} onChange={(event) => setTaskForm({ ...taskForm, tags: event.target.value })} placeholder="design, urgent, client" className="quote-input" />
                  </Field>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <UserPlus className="h-4 w-4 text-primary" />
                    Người theo dõi
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {project.members?.map((member) => (
                      <label key={member.userId} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted/60">
                        <input
                          type="checkbox"
                          checked={taskForm.followerIds.includes(member.userId)}
                          onChange={(event) => setTaskForm({
                            ...taskForm,
                            followerIds: event.target.checked
                              ? [...taskForm.followerIds, member.userId]
                              : taskForm.followerIds.filter((id) => id !== member.userId),
                          })}
                          className="rounded border-border"
                        />
                        {member.user?.name || member.user?.email || "Thành viên"}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <span className="mb-1.5 block text-[14px] font-light text-slate-600">Nhiệm vụ con</span>
                    <div className="rounded-[8px] border border-slate-200 bg-slate-50/60 p-3">
                      <div className="flex gap-2">
                        <input
                          value={taskForm.subtaskDraft}
                          onChange={(event) => setTaskForm({ ...taskForm, subtaskDraft: event.target.value })}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              const title = taskForm.subtaskDraft.trim();
                              if (!title) return;
                              setTaskForm({
                                ...taskForm,
                                subtaskDraft: "",
                                subtasks: [...taskForm.subtasks, { id: crypto.randomUUID(), title, done: false }],
                              });
                            }
                          }}
                          placeholder="Nhập nhiệm vụ con rồi Enter"
                          className="quote-input min-w-0 flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const title = taskForm.subtaskDraft.trim();
                            if (!title) return;
                            setTaskForm({
                              ...taskForm,
                              subtaskDraft: "",
                              subtasks: [...taskForm.subtasks, { id: crypto.randomUUID(), title, done: false }],
                            });
                          }}
                          className="quote-button quote-button-primary shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                          Thêm
                        </button>
                      </div>
                      <div className="mt-3 space-y-2">
                        {taskForm.subtasks.length ? taskForm.subtasks.map((subtask) => (
                          <div key={subtask.id} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                            <button
                              type="button"
                              onClick={() => setTaskForm({
                                ...taskForm,
                                subtasks: taskForm.subtasks.map((item) => item.id === subtask.id ? { ...item, done: !item.done } : item),
                              })}
                              className={cn("flex h-5 w-5 items-center justify-center rounded-full border transition-all", subtask.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-border bg-white text-transparent")}
                              aria-label="Đánh dấu hoàn thành"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </button>
                            <input
                              value={subtask.title}
                              onChange={(event) => setTaskForm({
                                ...taskForm,
                                subtasks: taskForm.subtasks.map((item) => item.id === subtask.id ? { ...item, title: event.target.value } : item),
                              })}
                              className={cn("min-w-0 flex-1 bg-transparent text-sm outline-none", subtask.done && "text-muted-foreground line-through")}
                            />
                            <button
                              type="button"
                              onClick={() => setTaskForm({ ...taskForm, subtasks: taskForm.subtasks.filter((item) => item.id !== subtask.id) })}
                              className="rounded-md p-1 text-muted-foreground hover:bg-white hover:text-foreground"
                              aria-label="Xóa nhiệm vụ con"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )) : (
                          <p className="rounded-lg bg-muted/40 px-3 py-4 text-center text-sm text-muted-foreground">Chưa có nhiệm vụ con</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Field label="Upload tệp">
                    <label className="quote-upload-zone min-h-28">
                      <span className="quote-upload-icon">
                        <FileUp className="h-5 w-5" />
                      </span>
                      <strong>Chọn tệp để đính kèm</strong>
                      <small>PDF, DOCX, XLSX, PNG, JPG.</small>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(event) => setTaskForm({
                          ...taskForm,
                          attachmentNames: Array.from(event.target.files || []).map((file) => file.name),
                        })}
                      />
                      {taskForm.attachmentNames.length ? <small>{taskForm.attachmentNames.length} tệp đã chọn</small> : null}
                    </label>
                  </Field>
                </div>
                <div className="quote-panel">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Activity className="h-4 w-4 text-primary" />
                    Log thao tác
                  </div>
                  <p className="text-sm text-muted-foreground">Khi lưu, hệ thống sẽ tạo log đầu tiên cho phân công này. Các cập nhật tiếp theo có thể nối vào khu vực trao đổi/log.</p>
                </div>
                <div className="flex justify-end gap-2 border-t border-border pt-4">
                  <button type="button" onClick={() => setIsTaskModalOpen(false)} className="quote-button quote-button-soft">Đóng</button>
                  <button type="submit" disabled={isCreatingTask} className="quote-button quote-button-primary disabled:opacity-60">{isCreatingTask ? "Đang lưu..." : "Lưu"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-muted/60 px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 font-bold text-foreground">{value}</p>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function ReportMetric({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl bg-white p-3", className)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold text-foreground">{typeof value === "number" ? value.toLocaleString("vi-VN") : value}</p>
    </div>
  );
}

function SourceRow({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border p-3">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>
        {active ? "Đang bật" : "Tắt"}
      </span>
    </div>
  );
}

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function buildReportInsights(report: NonNullable<ProjectLite["facebookProjectReport"]>) {
  const insights: string[] = [];
  const pageRows = report.diagnostics?.pageInsightRows || 0;
  const postRows = report.diagnostics?.pagePostRows || 0;
  const adRows = report.diagnostics?.adInsightRows || 0;

  if (report.pageEnabled) {
    if (!pageRows && !postRows) {
      insights.push("Page đang bật nhưng chưa có dữ liệu Page insight hoặc bài viết đã đồng bộ trong 30 ngày. Thường là chưa bấm đồng bộ Page, token thiếu quyền pages_read_engagement, hoặc Page chưa có dữ liệu trong khoảng lọc.");
    } else {
      insights.push(`Page đã có ${pageRows} dòng insight và ${postRows} bài viết. Engagement hiện là ${report.pageTotals.engagements.toLocaleString("vi-VN")}, reach ${report.pageTotals.reach.toLocaleString("vi-VN")}.`);
    }
  }

  if (report.adsEnabled) {
    const cpl = report.adsTotals.leads ? report.adsTotals.spend / report.adsTotals.leads : 0;
    const ctr = report.adsTotals.impressions ? (report.adsTotals.clicks / report.adsTotals.impressions) * 100 : 0;
    if (!adRows) {
      insights.push("Ads đang bật nhưng chưa có dòng insight trong khoảng lọc. Kiểm tra lại Ad Account/Ads ID hoặc chạy đồng bộ Facebook Ads.");
    } else {
      insights.push(`Ads có ${adRows} dòng insight, ${report.adsTotals.leads.toLocaleString("vi-VN")} lead, CTR ${ctr.toFixed(2)}%${cpl ? `, CPL khoảng ${formatMoney(cpl)}` : ""}.`);
    }
  }

  if (!insights.length) {
    insights.push("Chưa có nguồn dữ liệu để phân tích. Vào Sửa dự án để bật Page hoặc Ads.");
  }

  return insights;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[14px] font-light text-slate-600">{label}</span>
      {children}
    </label>
  );
}
