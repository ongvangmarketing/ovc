import { CalendarDays, Flag, TimerReset, Trash2, UserPlus, Users } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDate, getInitials } from "@/lib/utils/format";
import { SelectBox } from "@/components/ui/select-box";
import { Info } from "./common/stat-card";
import type { ProjectLite, TaskLite } from "../project-detail.types";

export function OverviewDashboard({
  project,
  tasks,
  progress,
  doneTasks,
  overdueTasks,
  timelinePhases,
  taskStats,
  readOnly,
  ownerId,
  memberToAdd,
  isMemberSaving,
  availableToAdd,
  setMemberToAdd,
  handleAddMember,
  handleRemoveMember,
}: {
  project: ProjectLite;
  tasks: TaskLite[];
  progress: number;
  doneTasks: number;
  overdueTasks: number;
  timelinePhases: Array<{ id: string; title: string; start: string; end: string; status: string }>;
  taskStats: Array<{ id: string; title: string; tone: string; dot: string; count: number }>;
  readOnly: boolean;
  ownerId: string;
  memberToAdd: string;
  isMemberSaving: boolean;
  availableToAdd: Array<{ userId: string; user?: { name?: string | null; email?: string | null } | null }>;
  setMemberToAdd: (val: string) => void;
  handleAddMember: () => void;
  handleRemoveMember: (val: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="xl:col-span-2 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-base p-4 border-l-4 border-l-indigo-500">
            <p className="text-xs text-muted-foreground font-medium mb-1">Tiến độ dự án</p>
            <p className="text-2xl font-bold text-foreground">{progress}%</p>
            <p className="text-xs text-muted-foreground mt-1">{doneTasks} / {tasks.length} tasks</p>
          </div>
          <div className="card-base p-4 border-l-4 border-l-amber-500">
            <p className="text-xs text-muted-foreground font-medium mb-1">Task Đang làm</p>
            <p className="text-2xl font-bold text-foreground">{tasks.filter(t => t.status === "IN_PROGRESS").length}</p>
            <p className="text-xs text-muted-foreground mt-1">Đang thực thi</p>
          </div>
          <div className="card-base p-4 border-l-4 border-l-rose-500">
            <p className="text-xs text-muted-foreground font-medium mb-1">Cảnh báo (Quá hạn)</p>
            <p className="text-2xl font-bold text-rose-600">{overdueTasks}</p>
            <p className="text-xs text-muted-foreground mt-1">Cần xử lý ngay</p>
          </div>
          <div className="card-base p-4 border-l-4 border-l-emerald-500">
            <p className="text-xs text-muted-foreground font-medium mb-1">Tình trạng</p>
            <p className={cn("text-lg font-bold mt-1", overdueTasks > 0 ? "text-rose-600" : "text-emerald-600")}>
              {overdueTasks > 0 ? "Rủi ro" : "Ổn định"}
            </p>
          </div>
        </div>

        <div className="card-base p-5">
          <h3 className="mb-4 font-bold text-foreground">Timeline tổng quan</h3>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5 max-[760px]:grid-cols-1">
            {timelinePhases.map((phase, index) => (
              <div key={phase.id} className="relative rounded-2xl border border-border p-4 bg-muted/20">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</span>
                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-slate-500 shadow-sm border border-slate-100">{phase.status}</span>
                </div>
                <p className="line-clamp-2 text-sm font-semibold text-foreground">{phase.title}</p>
                <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{phase.start} - {phase.end}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card-base p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-foreground flex items-center gap-2"><Users className="h-5 w-5 text-indigo-500"/> Nguồn lực & Workload</h3>
              <p className="mt-1 text-sm text-muted-foreground">Phân bổ lượng tasks chưa hoàn thành theo từng thành viên.</p>
            </div>
            {!readOnly ? <div className="flex flex-wrap gap-2">
              <SelectBox ariaLabel="Thêm người từ workspace" value={memberToAdd} onChange={setMemberToAdd} placeholder="Thêm thành viên" options={[{ value: "", label: "Thêm người từ workspace" }, ...availableToAdd.map((member) => ({ value: member.userId, label: member.user?.name || member.user?.email || "Thành viên" }))]} className="min-w-48" />
              <button onClick={handleAddMember} disabled={!memberToAdd || isMemberSaving} className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
                <UserPlus className="h-4 w-4" />
                Thêm
              </button>
            </div> : null}
          </div>
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {project.members?.map((member) => {
              const isOwner = member.userId === ownerId;
              const memberTasks = tasks.filter(t => t.assignee?.name === member.user?.name && t.status !== "DONE" && t.status !== "CANCELLED");
              return (
                <div key={member.userId} className="relative rounded-2xl border border-border p-4 bg-white hover:shadow-md transition-shadow group">
                  {!readOnly && !isOwner ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.userId)}
                      disabled={isMemberSaving}
                      className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Xóa người khỏi dự án"
                      title="Xóa khỏi dự án"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary shrink-0">
                      {getInitials(member.user?.name || member.user?.email || "TV")}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{member.user?.name || "Thành viên"}</p>
                      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold mt-1", isOwner ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600")}>
                        {isOwner ? "Owner" : "Member"}
                      </span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Workload:</span>
                    <span className={cn("font-bold text-xs px-2 py-0.5 rounded-full", memberTasks.length > 5 ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-700")}>{memberTasks.length} tasks mở</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="card-base p-5">
          <h3 className="mb-4 font-bold text-foreground">Phân bổ trạng thái</h3>
          <div className="space-y-3">
            {taskStats.map((item) => (
              <div key={item.id} className="rounded-xl border border-border p-3 bg-muted/10">
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
        <div className="card-base p-5">
          <h3 className="mb-4 font-bold text-foreground">Brief & Cài đặt</h3>
          <div className="space-y-3">
            <Info icon={CalendarDays} label="Ngày bắt đầu" value={project.startDate ? formatDate(project.startDate) : "Chưa đặt"} />
            <Info icon={Flag} label="Hạn hoàn thành" value={project.dueDate ? formatDate(project.dueDate) : "Chưa đặt"} />
            <Info icon={TimerReset} label="Cập nhật gần nhất" value={formatDate(project.updatedAt || project.createdAt)} />
          </div>
          <div className="mt-4 rounded-xl border border-border bg-slate-50 p-4">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Ghi chú dự án</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{project.description || "Chưa có brief chi tiết. Cập nhật tại phần Sửa dự án để mọi người cùng nắm."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
