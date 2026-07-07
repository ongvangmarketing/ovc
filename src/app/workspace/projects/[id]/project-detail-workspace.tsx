"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Edit3, Plus, Tag, X, FileUp, Activity, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import type { TaskStatus } from "@prisma/client";

import { addProjectMember, createTask, removeProjectMember, updateProjectOwner, updateTaskStatus } from "@/app/actions/projects";
import { cn } from "@/lib/utils/cn";
import { formatDate, getInitials } from "@/lib/utils/format";
import { SelectBox } from "@/components/ui/select-box";

import type { ProjectLite } from "./project-detail.types";
import { baseTabs, columns, fallbackPriority, fallbackStatus, priorityConfig, statusConfig } from "./project-detail.mock";
import { OverviewDashboard } from "./components/overview-dashboard";
import { KanbanBoard } from "./components/kanban-board";
import { ProjectGanttView } from "./components/gantt-timeline";
import { FacebookReport } from "./components/facebook-report";
import { MiniMetric } from "./components/common/stat-card";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[14px] font-light text-slate-600">{label}</span>
      {children}
    </label>
  );
}

export function ProjectDetailWorkspace({
  project,
  baseHref = "/workspace/projects",
  readOnly = false,
}: {
  project: ProjectLite;
  baseHref?: string;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState(project.tasks || []);
  const [activeTab, setActiveTab] = useState("overview");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  
  // States for Report
  const [reportSource, setReportSource] = useState<"all" | "page" | "ads">("all");
  const [reportRange, setReportRange] = useState<7 | 14 | 30>(30);
  
  // States for Task Creation
  const [targetColumnId, setTargetColumnId] = useState<TaskStatus>("TODO");
  
  // States for Member Management
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
  const tabs = project.socialMarketingEnabled ? [...baseTabs, { id: "report", label: "Báo cáo", icon: Activity }] : baseTabs;
  const activeTabLabel = tabs.find((tab) => tab.id === activeTab)?.label || "Tổng quan";
  
  // Derived metrics
  const doneTasks = tasks.filter((task) => task.status === "DONE").length;
  const progress = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const openTasks = tasks.length - doneTasks;
  const overdueTasks = tasks.filter((task) => {
    if (!task.dueDate || ["DONE", "CANCELLED"].includes(task.status || "TODO")) return false;
    return new Date(task.dueDate as string|Date).getTime() < new Date().setHours(0, 0, 0, 0);
  }).length;

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
        start: task.startDate ? formatDate(task.startDate as string|Date) : "Chưa đặt",
        end: task.dueDate ? formatDate(task.dueDate as string|Date) : "Chưa đặt",
        status: columns.find((column) => column.id === task.status)?.title || "Cần làm",
      }));
    }

    return [
      {
        id: "project-phase",
        title: "Giai đoạn tổng",
        start: project.startDate ? formatDate(project.startDate as string|Date) : "Chưa đặt",
        end: project.dueDate ? formatDate(project.dueDate as string|Date) : "Chưa đặt",
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
    if (readOnly) return;
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
      startDate: taskForm.startDate ? new Date(taskForm.startDate).toISOString() : undefined,
      dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : undefined,
      assigneeId: taskForm.assigneeId,
      followerIds: taskForm.followerIds,
      tags: taskForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      subtasks: taskForm.subtasks.filter((task) => task.title.trim()).map((task) => ({ title: task.title.trim(), done: task.done })),
      attachmentNames: taskForm.attachmentNames,
    });
    if (res.success && res.task) {
      toast.success("Đã tạo phân công");
      setTasks((current) => [...current, res.task as any]);
      setIsTaskModalOpen(false);
    } else {
      toast.error(res.error || "Không tạo được phân công");
    }
    setIsCreatingTask(false);
  };

  return (
    <div className="project-detail-page flex min-h-0 min-w-0 max-w-full flex-1 flex-col gap-6 overflow-x-hidden p-6 max-[760px]:gap-4 max-[760px]:px-7 max-[760px]:py-4">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="card-base relative max-w-full overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1" style={{ backgroundColor: project.color || "#F59E0B" }} />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.14),transparent_55%)]" />
        <div className="relative border-b border-border p-5 max-[760px]:p-4">
          <div className="flex flex-wrap items-start justify-between gap-4 max-[760px]:grid max-[760px]:grid-cols-1">
            <div className="flex min-w-0 items-start gap-4 max-[760px]:grid max-[760px]:w-full max-[760px]:grid-cols-[auto_auto_minmax(0,1fr)] max-[760px]:gap-3">
              <Link href={baseHref} className="mt-1 rounded-lg border border-border bg-white/80 p-2 text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground" aria-label="Quay lại">
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
                  <h2 className="text-2xl font-bold text-foreground max-[760px]:text-xl">{project.name}</h2>
                  <span className={cn("badge-status", status.cls)}><span className={cn("priority-dot", status.dot)} />{status.label}</span>
                  <span className={cn("badge-status", priority.cls)}><span className={cn("priority-dot", priority.dot)} />{priority.label}</span>
                </div>
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground max-[760px]:break-words">{project.description || "Chưa có mô tả. Thêm brief, phạm vi và mục tiêu ở trang sửa dự án để team nắm nhanh bối cảnh."}</p>
              </div>
            </div>
            {!readOnly ? <div className="flex flex-wrap gap-2">
              <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} onClick={() => openCreateTask()} className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Phân công
              </motion.button>
              <Link href={`/workspace/projects/${project.id}/edit`} className="flex h-9 items-center gap-2 rounded-lg border border-border bg-white/90 px-4 text-sm font-medium text-foreground shadow-sm hover:bg-muted">
                <Edit3 className="h-4 w-4" />
                Sửa dự án
              </Link>
            </div> : null}
          </div>
        </div>

        <div className="relative grid gap-4 p-5 md:grid-cols-[1fr_280px] max-[760px]:grid-cols-1 max-[760px]:p-4">
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
          <div className="grid grid-cols-3 gap-2 text-center max-[760px]:grid-cols-2">
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
        className="flex max-w-full gap-2 overflow-x-auto rounded-2xl border border-border bg-white p-2 shadow-sm"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("relative flex h-9 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-medium whitespace-nowrap transition-colors", isActive ? "text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              {isActive ? <motion.span layoutId="project-active-tab" className="absolute inset-0 rounded-xl bg-primary shadow-sm" transition={{ type: "spring", stiffness: 420, damping: 34 }} /> : null}
              <Icon className="relative h-4 w-4" />
              <span className="relative">{tab.label}</span>
            </button>
          );
        })}
      </motion.div>

      {activeTab === "overview" && (
        <OverviewDashboard
          project={project}
          tasks={tasks}
          progress={progress}
          doneTasks={doneTasks}
          overdueTasks={overdueTasks}
          timelinePhases={timelinePhases}
          taskStats={taskStats}
          readOnly={readOnly}
          ownerId={ownerId}
          memberToAdd={memberToAdd}
          isMemberSaving={isMemberSaving}
          availableToAdd={availableToAdd}
          setMemberToAdd={setMemberToAdd}
          handleAddMember={handleAddMember}
          handleRemoveMember={handleRemoveMember}
        />
      )}

      {activeTab === "kanban" && (
        <KanbanBoard
          tasks={tasks}
          readOnly={readOnly}
          openCreateTask={openCreateTask}
          handleDragStart={handleDragStart}
          handleDrop={handleDrop}
        />
      )}

      {activeTab === "timeline" && (
        <ProjectGanttView tasks={tasks} />
      )}

      {activeTab === "report" && (
        <FacebookReport
          project={project}
          reportSource={reportSource}
          reportRange={reportRange}
          readOnly={readOnly}
          setReportSource={setReportSource}
          setReportRange={setReportRange}
        />
      )}

      {activeTab !== "overview" && activeTab !== "kanban" && activeTab !== "timeline" && activeTab !== "report" ? (
        <div className="empty-state card-base p-10 text-center flex items-center justify-center flex-col">
          <Tag className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-foreground text-lg">Khu vực đang được hoàn thiện</h3>
          <p className="mt-1 text-sm text-muted-foreground">Tab này đã có chỗ trong UI để mở rộng timeline, file và trao đổi.</p>
        </div>
      ) : null}

      <AnimatePresence>
        {isTaskModalOpen ? (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/45 p-6 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.96 }} transition={{ type: "spring", stiffness: 260, damping: 24 }} className="flex max-h-[88vh] w-full max-w-[min(60vw,920px)] min-w-[min(92vw,680px)] flex-col overflow-hidden rounded-[8px] bg-white shadow-xl max-[760px]:max-w-[calc(100vw-2rem)] max-[760px]:min-w-0">
              <div className="quote-panel-header sticky top-0 z-10 bg-white px-4 py-3">
                <div>
                  <h2>Thêm phân công</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Thiết lập người làm, timeline, tag và checklist cho task.</p>
                </div>
                <button onClick={() => setIsTaskModalOpen(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Đóng">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleCreateTask} className="space-y-4 overflow-y-auto p-4">
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
                    <SelectBox ariaLabel="Chọn người làm" value={taskForm.assigneeId} onChange={(assigneeId) => setTaskForm({ ...taskForm, assigneeId })} placeholder="Chưa phân công" options={[{ value: "", label: "Chưa phân công" }, ...(project.members || []).map((member) => ({ value: member.userId, label: member.user?.name || member.user?.email || "Thành viên" }))]} className="w-full" />
                  </Field>
                  <Field label="Tag">
                    <input value={taskForm.tags} onChange={(event) => setTaskForm({ ...taskForm, tags: event.target.value })} placeholder="design, urgent, client" className="quote-input" />
                  </Field>
                </div>
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.85fr)]">
                  <div>
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
                  <div className="rounded-xl border border-border bg-white p-3">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Plus className="h-4 w-4 text-primary" />
                      Người theo dõi
                    </div>
                    <div className="grid gap-2">
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
                          <span className="min-w-0 truncate">{member.user?.name || member.user?.email || "Thành viên"}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
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
