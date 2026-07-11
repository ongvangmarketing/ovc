"use client";

import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, Edit3, Plus, Tag, X, FileUp, Activity, CheckCircle2, MessageSquare, Send as SendIcon, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import type { TaskStatus } from "@prisma/client";

import { addTaskComment, publicAddComment, publicUpdateTaskStatus, publicUpdateTaskColumn, addProjectMember, createTask, removeProjectMember, updateProjectOwner, updateTaskStatus, updateTaskDetails, updateTaskColumn, generateProjectShareToken, revokeProjectShareToken } from "@/modules/projects/actions/project.actions";
import { Link as LinkIcon, Trash2, Copy, Check, Ellipsis } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDate, getInitials } from "@/lib/utils/format";
import { SelectBox } from "@/components/ui/select-box";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

import type { ProjectLite } from "./project-detail.types";
import { baseTabs, columns, fallbackPriority, fallbackStatus, priorityConfig, statusConfig } from "./project-detail.mock";
import { OverviewDashboard } from "./components/overview-dashboard";
import { KanbanBoard } from "./components/kanban-board";
import { ProjectGanttView } from "./components/gantt-timeline";
import { FacebookReport } from "./components/facebook-report";
import { ContentOmniView } from "./components/content-omni-view";
import { MiniMetric } from "./components/common/stat-card";
import { ShareResourceModal } from "@/modules/core/components/role-permission/share-resource-modal";
import { Share2 } from "lucide-react";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[14px] font-light text-slate-600">{label}</span>
      {children}
    </label>
  );
}

export function ProjectDetailWorkspace({
  project: initialProject,
  baseHref = "/workspace/projects",
  readOnly = false,
  guestMode = false,
  guestShareToken,
}: {
  project: ProjectLite;
  baseHref?: string;
  readOnly?: boolean;
  guestMode?: boolean;
  guestShareToken?: string;
}) {
  // Safe deep clone to handle any Decimal or non-serializable objects from Prisma
  const safeProject = useMemo(() => JSON.parse(JSON.stringify(initialProject)) as ProjectLite, [initialProject]);
  const project = safeProject;
  const router = useRouter();
  const [tasks, setTasks] = useState(project.tasks || []);
  const [activeTab, setActiveTab] = useState("overview");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTaskEditing, setIsTaskEditing] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  useEffect(() => {
    if (guestMode) {
      const saved = localStorage.getItem("ongvang_guest_name");
      if (saved) setGuestName(saved);
    }
  }, [guestMode]);
  const [commentingTaskId, setCommentingTaskId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareToken, setShareToken] = useState(project.shareToken);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // States for Report
  const [reportSource, setReportSource] = useState<"all" | "page" | "ads">("all");
  const [reportRange, setReportRange] = useState<7 | 14 | 30>(30);
  
  // States for Task Creation
  const [targetColumnId, setTargetColumnId] = useState<TaskStatus>("TODO");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  
  // States for Member Management
  const [memberToAdd, setMemberToAdd] = useState("");
  const [ownerId, setOwnerId] = useState(project.ownerId || project.owner?.id || "");
  const [isMemberSaving, setIsMemberSaving] = useState(false);
  
  const [taskLists, setTaskLists] = useState(
    project.taskLists?.length 
      ? project.taskLists 
      : [
          { id: "TODO", name: "Cần làm", order: 1000 },
          { id: "IN_PROGRESS", name: "Đang làm", order: 2000 },
          { id: "IN_REVIEW", name: "Đang duyệt", order: 3000 },
          { id: "DONE", name: "Hoàn tất", order: 4000 },
        ]
  );
  
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "TODO" as TaskStatus,
    taskListId: "" as string,
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    startDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    assigneeId: "",
    followerIds: [] as string[],
    tags: "",
    subtasks: [] as Array<{ id: string; title: string; done: boolean }>,
    subtaskDraft: "",
    attachmentNames: [] as string[],
    comments: [] as Array<any>,
    commentDraft: "",
  });

  const status = statusConfig[project.status || "ACTIVE"] || fallbackStatus;
  const priority = priorityConfig[project.priority || "MEDIUM"] || fallbackPriority;
  const tabs = project.socialMarketingEnabled 
    ? [...baseTabs, { id: "calendar", label: "Lịch nội dung", icon: Calendar }, { id: "report", label: "Báo cáo", icon: Activity }] 
    : baseTabs;
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
    return taskLists.map((list) => ({
      id: list.id,
      title: list.name,
      tone: "bg-slate-50 border-slate-200",
      dot: list.color || "bg-slate-400",
      count: tasks.filter((task) => (task.taskListId || task.status) === list.id).length,
    }));
  }, [tasks, taskLists]);

  const timelinePhases = useMemo(() => {
    const datedTasks = tasks.filter((task) => task.startDate || task.dueDate).slice(0, 5);
    if (datedTasks.length) {
      return datedTasks.map((task) => ({
        id: task.id,
        title: task.title,
        start: task.startDate ? formatDate(task.startDate as string|Date) : "Chưa đặt",
        end: task.dueDate ? formatDate(task.dueDate as string|Date) : "Chưa đặt",
        status: taskLists.find((list) => list.id === (task.taskListId || task.status))?.name || "Cần làm",
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

  
  const handleGenerateShareToken = async () => {
    const res = await generateProjectShareToken(project.id);
    if (res.success && res.token) {
      setShareToken(res.token);
      toast.success("Đã tạo link chia sẻ");
    } else {
      toast.error(res.error || "Không thể tạo link chia sẻ");
    }
  };

  const handleRevokeShareToken = async () => {
    if (!confirm("Bạn có chắc chắn muốn vô hiệu hóa link này? Khách hàng sẽ không thể truy cập được nữa.")) return;
    const res = await revokeProjectShareToken(project.id);
    if (res.success) {
      setShareToken(null);
      toast.success("Đã thu hồi link chia sẻ");
    } else {
      toast.error(res.error || "Không thể thu hồi link chia sẻ");
    }
  };

  const copyShareLink = () => {
    if (!shareToken) return;
    const url = `${window.location.origin}/share/p/${shareToken}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success("Đã copy link");
    setTimeout(() => setCopiedLink(false), 2000);
  };

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

  const handleDrop = async (event: React.DragEvent, columnId: string) => {
    event.preventDefault();
    if (readOnly) return;
    const taskId = event.dataTransfer.getData("taskId");
    if (!taskId) return;
    const previousTasks = [...tasks];
    
    // We check if it's a default TaskStatus column or a TaskList custom column.
    // If it's a default one (TODO, IN_PROGRESS...), we update status.
    // If it's a cuid (custom taskList), we update taskListId.
    const isDefaultStatus = ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"].includes(columnId);
    
    setTasks((current) => current.map((task) => task.id === taskId ? { 
      ...task, 
      status: isDefaultStatus ? columnId : task.status,
      taskListId: columnId 
    } : task));
    
    // We call an action to update column using the newly created updateTaskColumn
    let res;
    if (guestMode && guestShareToken) { res = await publicUpdateTaskColumn(guestShareToken, taskId, columnId); } else { res = await updateTaskColumn(taskId, project.id, columnId); }
    
    // Also if it's a default status, we should update the status enum
    if (isDefaultStatus) {
      if (guestMode && guestShareToken) { await publicUpdateTaskStatus(guestShareToken, taskId, columnId as TaskStatus); } else { await updateTaskStatus(taskId, project.id, columnId as TaskStatus); }
    }
    
    if (!res.success) {
      toast.error("Không cập nhật được trạng thái task");
      setTasks(previousTasks);
    }
  };

  const openAddTask = (statusId: string) => {
    if (readOnly) return;
    setEditingTaskId(null);
    setIsTaskEditing(true);
    setTaskForm({
      title: "",
      description: "",
      status: statusId as any,
      taskListId: "",
      priority: "MEDIUM",
      startDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      assigneeId: "",
      followerIds: [],
      tags: "",
      subtasks: [],
      subtaskDraft: "",
      attachmentNames: [],
      comments: [],
      commentDraft: "",
    });
    setIsTaskModalOpen(true);
  };

  const openEditTask = (task: any) => {
    setEditingTaskId(task.id);
    setIsTaskEditing(false); // Open in view mode by default
    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "TODO",
      taskListId: task.taskListId || "",
      priority: task.priority || "MEDIUM",
      startDate: (task.startDate ? new Date(task.startDate).toISOString().split("T")[0] : "") as string,
      dueDate: (task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "") as string,
      assigneeId: task.assigneeId || "",
      followerIds: task.followers?.map((f: any) => f.userId) || [],
      tags: task.tags?.join(", ") || "",
      subtasks: task.subtasks || [],
      subtaskDraft: "",
      attachmentNames: task.attachments?.map((a: any) => a.name) || [],
      comments: task.comments || [],
      commentDraft: "",
    });
    setIsTaskModalOpen(true);
  };

  
  const handleSendComment = async () => {
    if (!editingTaskId || !taskForm.commentDraft.trim()) return;
    let currentGuestName = guestName;
    
    if (guestMode && !currentGuestName) {
      const name = window.prompt("Vui lòng nhập tên của bạn để bình luận:");
      if (!name || !name.trim()) return;
      currentGuestName = name.trim();
      setGuestName(currentGuestName);
      localStorage.setItem("ongvang_guest_name", currentGuestName);
    }

    setCommentingTaskId(editingTaskId);
    let res;
    if (guestMode && guestShareToken) {
      res = await publicAddComment(guestShareToken, editingTaskId, currentGuestName, taskForm.commentDraft.trim());
    } else {
      res = await addTaskComment(editingTaskId, taskForm.commentDraft.trim());
    }

    if (res.success && res.comment) {
      setTaskForm(prev => ({
        ...prev,
        commentDraft: "",
        comments: [res.comment, ...prev.comments]
      }));
    } else {
      toast.error(res.error || "Lỗi khi gửi bình luận");
    }
    setCommentingTaskId(null);
  };

  const handleCreateTask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!taskForm.title.trim()) return;
    setIsCreatingTask(true);
    
    if (editingTaskId) {
      const res = await updateTaskDetails(editingTaskId, project.id, {
        title: taskForm.title,
        description: taskForm.description,
        status: taskForm.status,
        taskListId: taskForm.taskListId || null,
        priority: taskForm.priority,
        startDate: taskForm.startDate ? new Date(taskForm.startDate).toISOString() : undefined,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : undefined,
        assigneeId: taskForm.assigneeId,
        tags: taskForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        subtasks: taskForm.subtasks.filter((task) => task.title.trim()).map((task) => ({ title: task.title.trim(), done: task.done })),
      });
      if (res.success && res.task) {
        toast.success("Đã cập nhật phân công");
        setTasks((current) => current.map((t) => t.id === editingTaskId ? res.task as any : t));
        setIsTaskModalOpen(false);
      } else {
        toast.error(res.error || "Không cập nhật được phân công");
      }
    } else {
      const res = await createTask({
        projectId: project.id,
        title: taskForm.title,
        description: taskForm.description,
        status: taskForm.status || targetColumnId,
        taskListId: taskForm.taskListId || null,
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
    }
    setIsCreatingTask(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      <div className={cn("mx-auto w-full px-4 py-8 sm:px-8 sm:py-12 animate-in fade-in duration-300 flex flex-col flex-1", guestMode ? "max-w-[1200px]" : "max-w-[1200px]")}>
        <div className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[#eaeaea] pb-8 shrink-0">
          <div>
            {!guestMode && (
              <div className="flex items-center gap-3 mb-6">
                <Link href={baseHref} className="text-gray-400 hover:text-black transition-colors flex items-center gap-1 text-[13px] font-medium">
                  <ArrowLeft className="w-4 h-4" />
                  Dự án
                </Link>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase w-fit">
                  Chi tiết
                </span>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <h1 className="text-[32px] md:text-[44px] tracking-tight leading-[1.15] font-medium uppercase text-black">{project.name}</h1>
              <span className={cn("px-2 py-0.5 text-[10px] font-medium rounded-md flex items-center gap-1.5 border border-[#eaeaea] bg-white text-black")}><span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />{status.label}</span>
              <span className={cn("px-2 py-0.5 text-[10px] font-medium rounded-md flex items-center gap-1.5 border border-[#eaeaea] bg-white text-black")}><span className={cn("w-1.5 h-1.5 rounded-full", priority.dot)} />{priority.label}</span>
            </div>
          </div>
          
          {!readOnly ? (
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              {guestMode ? null : (
                <button onClick={() => setIsShareModalOpen(true)} className="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-[#eaeaea] bg-white text-[13px] font-medium text-black hover:bg-gray-50 transition-colors">
                  <Share2 className="h-4 w-4 text-gray-500" />
                  Phân quyền
                </button>
              )}
              {guestMode ? null : <Link href={`/workspace/projects/${project.id}/edit`} className="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-[#eaeaea] bg-white text-[13px] font-medium text-black hover:bg-gray-50 transition-colors">
                <Edit3 className="h-4 w-4" />
                Sửa dự án
              </Link>}
              {guestMode ? null : <button onClick={() => openAddTask("TODO")} className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-black text-[13px] font-medium text-white hover:bg-gray-800 transition-colors">
                <Plus className="h-4 w-4" />
                Phân công
              </button>}
              
              {guestMode ? null : (
                <div className="relative">
                  <button onClick={() => setMenuOpen(!menuOpen)} className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-[#eaeaea] bg-white text-black hover:bg-gray-50 transition-colors">
                    <Ellipsis className="h-4 w-4" />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-[#eaeaea] bg-white p-1.5 shadow-sm z-50">
                      {!shareToken ? (
                        <button
                        onClick={() => { setMenuOpen(false); handleGenerateShareToken(); }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <LinkIcon className="h-3.5 w-3.5 text-indigo-500" /> Tạo link chia sẻ
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => { setMenuOpen(false); copyShareLink(); }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Copy className="h-3.5 w-3.5 text-slate-400" /> Copy link
                        </button>
                        <button
                          onClick={() => { setMenuOpen(false); handleRevokeShareToken(); }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Thu hồi link
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="flex w-full items-center gap-5 overflow-x-auto hide-scrollbar border-b border-[#eaeaea] pb-0 mb-10 sm:gap-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex shrink-0 items-center gap-2 whitespace-nowrap pb-4 text-[14px] font-medium transition-colors border-b-2 -mb-[2px]", isActive ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black")}>
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && (
        <OverviewDashboard
          project={project}
          tasks={tasks}
          taskLists={taskLists}
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
          openCreateTask={openAddTask}
          openEditTask={openEditTask}
        />
      )}

      {activeTab === "kanban" && (
        <KanbanBoard
          tasks={tasks}
          taskLists={taskLists}
          projectId={project.id}
          readOnly={readOnly}
          openCreateTask={openAddTask}
          openEditTask={openEditTask}
          handleDragStart={handleDragStart}
          handleDrop={handleDrop}
        />
      )}

      {activeTab === "calendar" && (
        <ContentOmniView
          projectId={project.id}
          contentPlans={project.contentPlans || []}
          readOnly={readOnly}
          guestMode={guestMode}
          guestShareToken={guestShareToken}
        />
      )}

      {activeTab === "timeline" && (
        <ProjectGanttView tasks={tasks} openEditTask={openEditTask} />
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
        <div className="empty-state border border-slate-200 bg-slate-50 rounded-xl p-10 text-center flex items-center justify-center flex-col">
          <Tag className="h-10 w-10 text-slate-400 mb-4" />
          <h3 className="font-semibold text-slate-900 text-[15px]">Khu vực đang được hoàn thiện</h3>
          <p className="mt-1 text-sm text-slate-500">Tab này đã có chỗ trong UI để mở rộng timeline, file và trao đổi.</p>
        </div>
      ) : null}

      <AnimatePresence>
        {isTaskModalOpen ? (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/80 p-4 sm:p-5 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.96 }} transition={{ type: "spring", stiffness: 260, damping: 24 }} className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-[#eaeaea]">
              <div className="px-6 py-5 sticky top-0 z-10 bg-white border-b border-[#eaeaea] flex justify-between items-center">
                <div>
                  <h2 className="text-[20px] font-medium tracking-tight text-black">{editingTaskId ? (isTaskEditing ? "Sửa phân công" : "Chi tiết phân công") : "Thêm phân công"}</h2>
                  <span className="text-[14px] text-gray-500">{editingTaskId ? (isTaskEditing ? "Cập nhật chi tiết phân công." : "Xem thông tin phân công.") : "Thiết lập người làm, timeline, tag và checklist cho task."}</span>
                </div>
                <div className="flex items-center gap-2">
                  {editingTaskId && !isTaskEditing && !readOnly && (
                    <button type="button" onClick={() => setIsTaskEditing(true)} className="rounded-md bg-black px-4 py-2 text-[13px] font-medium text-white hover:bg-gray-800 transition-colors">
                      Sửa
                    </button>
                  )}
                  <button type="button" onClick={() => setIsTaskModalOpen(false)} className="rounded-full bg-gray-50 p-2 text-gray-400 hover:bg-gray-100 hover:text-black transition-colors" aria-label="Đóng">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleCreateTask} className="flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {/* Basic Info */}
                  <div className="space-y-5">
                    <Field label="Tiêu đề">
                      {isTaskEditing ? (
                        <input required autoFocus value={taskForm.title} onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })} className="w-full bg-white border border-[#eaeaea] rounded-md px-3 py-2 text-[14px] text-black outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" />
                      ) : (
                        <div className="text-[15px] text-black font-medium py-1">{taskForm.title}</div>
                      )}
                    </Field>
                    
                    <div className="grid gap-4 md:grid-cols-1 mb-8">
                      <Field label="Mô tả">
                        {isTaskEditing ? (
                          <TiptapEditor 
                            value={taskForm.description} 
                            onChange={(val) => setTaskForm({ ...taskForm, description: val })} 
                          />
                        ) : (
                          <div className="text-[14px] text-gray-700 min-h-[60px] prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: taskForm.description || '<span class="text-gray-400 italic">Không có mô tả</span>' }} />
                        )}
                      </Field>
                    </div>
                  </div>

                  {/* Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-gray-50/50 rounded-xl border border-gray-100">
                    <Field label="Người làm">
                      <select value={taskForm.assigneeId} onChange={(event) => setTaskForm({ ...taskForm, assigneeId: event.target.value })} className="w-full bg-white border border-[#eaeaea] rounded-md px-3 py-2 text-[14px] text-black outline-none focus:border-black transition-colors appearance-none">
                        <option value="">Chưa phân công</option>
                        {project.members?.map(m => (
                          <option key={m.userId} value={m.userId}>{m.user?.name || "Thành viên"}</option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Trạng thái">
                      <select value={taskForm.status} onChange={(event) => setTaskForm({ ...taskForm, status: event.target.value as TaskStatus })} className="w-full bg-white border border-[#eaeaea] rounded-md px-3 py-2 text-[14px] text-black outline-none focus:border-black transition-colors appearance-none">
                        <option value="TODO">Cần làm</option>
                        <option value="IN_PROGRESS">Đang làm</option>
                        <option value="IN_REVIEW">Đang duyệt</option>
                        <option value="DONE">Hoàn tất</option>
                        <option value="CANCELLED">Hủy bỏ</option>
                      </select>
                    </Field>

                    <Field label="Cột Kanban">
                      <select value={taskForm.taskListId} onChange={(event) => setTaskForm({ ...taskForm, taskListId: event.target.value })} className="w-full bg-white border border-[#eaeaea] rounded-md px-3 py-2 text-[14px] text-black outline-none focus:border-black transition-colors appearance-none">
                        {taskLists.map(list => (
                          <option key={list.id} value={list.id}>{list.name}</option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Ưu tiên">
                      <select value={taskForm.priority} onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value as any })} className="w-full bg-white border border-[#eaeaea] rounded-md px-3 py-2 text-[14px] text-black outline-none focus:border-black transition-colors appearance-none">
                        <option value="LOW">Thấp</option>
                        <option value="MEDIUM">Vừa</option>
                        <option value="HIGH">Cao</option>
                        <option value="URGENT">Khẩn cấp</option>
                      </select>
                    </Field>

                    <Field label="Bắt đầu">
                      <input type="date" value={taskForm.startDate} onChange={(event) => setTaskForm({ ...taskForm, startDate: event.target.value })} className="w-full bg-white border border-[#eaeaea] rounded-md px-3 py-2 text-[14px] text-black outline-none focus:border-black transition-colors" />
                    </Field>

                    <Field label="Kết thúc">
                      <input type="date" value={taskForm.dueDate} onChange={(event) => setTaskForm({ ...taskForm, dueDate: event.target.value })} className="w-full bg-white border border-[#eaeaea] rounded-md px-3 py-2 text-[14px] text-black outline-none focus:border-black transition-colors" />
                    </Field>
                  </div>

                  {/* Advanced */}
                  <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
                    {/* Subtasks */}
                    <div>
                      <span className="mb-2 block text-[13px] font-medium text-slate-700">Nhiệm vụ con</span>
                      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                        <div className="flex gap-2 mb-3">
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
                            placeholder="Nhập task con rồi Enter..."
                            className="quote-input text-sm min-w-0 flex-1"
                          />
                        </div>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {taskForm.subtasks.length ? taskForm.subtasks.map((subtask) => (
                            <div key={subtask.id} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 border border-slate-100 group">
                              <button
                                type="button"
                                onClick={() => setTaskForm({
                                  ...taskForm,
                                  subtasks: taskForm.subtasks.map((item) => item.id === subtask.id ? { ...item, done: !item.done } : item),
                                })}
                                className={cn("text-slate-400 hover:text-green-600 transition-colors", subtask.done && "text-green-500")}
                              >
                                <CheckCircle2 className="h-2.5 w-2.5" />
                              </button>
                              <input
                                value={subtask.title}
                                onChange={(event) => setTaskForm({
                                  ...taskForm,
                                  subtasks: taskForm.subtasks.map((item) => item.id === subtask.id ? { ...item, title: event.target.value } : item),
                                })}
                                className={cn("min-w-0 flex-1 bg-transparent text-sm outline-none", subtask.done && "text-slate-400 line-through")}
                              />
                              <button
                                type="button"
                                onClick={() => setTaskForm({ ...taskForm, subtasks: taskForm.subtasks.filter((item) => item.id !== subtask.id) })}
                                className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )) : (
                            <p className="text-center text-[13px] text-slate-400 py-2">Chưa có nhiệm vụ con</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Followers & Upload */}
                    <div className="space-y-5">
                      <div>
                        <span className="mb-2 block text-[13px] font-medium text-slate-700">Người theo dõi</span>
                        <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm max-h-32 overflow-y-auto">
                          {project.members?.map((member) => (
                            <label key={member.userId} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50 transition-colors">
                              <input
                                type="checkbox"
                                checked={taskForm.followerIds.includes(member.userId)}
                                onChange={(event) => setTaskForm({
                                  ...taskForm,
                                  followerIds: event.target.checked
                                    ? [...taskForm.followerIds, member.userId]
                                    : taskForm.followerIds.filter((id) => id !== member.userId),
                                })}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                              />
                              <span className="min-w-0 truncate text-[13px] text-slate-700">{member.user?.name || member.user?.email || "Thành viên"}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      {isTaskEditing && (
                        <label className="quote-upload-zone py-3 min-h-[72px]">
                          <span className="quote-upload-icon mb-1">
                            <FileUp className="h-4 w-4" />
                          </span>
                          <strong className="text-[13px]">Đính kèm tệp</strong>
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(event) => setTaskForm({
                              ...taskForm,
                              attachmentNames: Array.from(event.target.files || []).map((file) => file.name),
                            })}
                          />
                          {taskForm.attachmentNames.length ? <small className="text-[11px]">{taskForm.attachmentNames.length} tệp đã chọn</small> : null}
                        </label>
                      )}
                    </div>
                  </div>

                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-[#eaeaea] flex justify-end gap-3 rounded-b-2xl">
                  <button type="button" onClick={() => {
                    if (isTaskEditing && editingTaskId) {
                      setIsTaskEditing(false); // cancel edit
                    } else {
                      setIsTaskModalOpen(false); // close modal
                    }
                  }} className="inline-flex h-9 items-center justify-center rounded-md border border-[#eaeaea] bg-white px-4 text-[13px] font-medium text-black transition-colors hover:bg-gray-50">Hủy bỏ</button>
                  
                  <button type="submit" disabled={isCreatingTask} className="inline-flex h-9 items-center justify-center rounded-md bg-black px-4 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50">
                    {isCreatingTask ? "Đang xử lý..." : (editingTaskId ? "Cập nhật" : "Tạo phân công")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      </div>

      {isShareModalOpen && (
        <ShareResourceModal
          resourceType="PROJECT"
          resourceId={project.id}
          resourceName={project.name}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  );
}
