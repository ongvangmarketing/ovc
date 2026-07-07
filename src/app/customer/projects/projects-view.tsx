"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency, formatDate, statusLabel } from "../utils";
import { CalendarDays, CircleCheckBig, Clock3, Grid2X2, List, UserRoundCheck, UsersRound, WalletCards } from "lucide-react";

type ProjectItem = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  statusLabel: string;
  statusClass: string;
  progress: number;
  startDate: string;
  dueDate: string;
  budget: string;
  taskCount: number;
  owner?: { name: string; email?: string | null; image?: string | null } | null;
  followers?: Array<{ id: string; name: string; email?: string | null; image?: string | null; role?: string }>;
};

export function ProjectsView({
  projects,
  title = "Danh sách dự án",
  description = "Chọn cách hiển thị phù hợp để theo dõi dự án.",
  actionHref,
  compact = false,
}: {
  projects: ProjectItem[];
  title?: string;
  description?: string;
  actionHref?: string;
  compact?: boolean;
}) {
  const [view, setView] = useState<"list" | "grid">("grid");

  return (
    <div className="w-full">
      <div className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${compact ? 'px-0' : 'px-6 pt-6'}`}>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          {actionHref && (
            <Link href={actionHref} className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              Xem tất cả
            </Link>
          )}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button 
              type="button" 
              onClick={() => setView("list")} 
              className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${view === "list" ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-900"}`}
              title="Danh sách"
            >
              <List className="h-4 w-4" />
            </button>
            <button 
              type="button" 
              onClick={() => setView("grid")} 
              className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${view === "grid" ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-900"}`}
              title="Lưới"
            >
              <Grid2X2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {!projects.length ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center p-8 text-center bg-slate-50 border-t border-slate-100">
          <CalendarDays className="mb-4 h-12 w-12 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900">Chưa có dự án nào</h3>
          <p className="mt-1 text-sm text-slate-500">Bạn chưa có dự án nào trong danh sách này.</p>
        </div>
      ) : (
        <div className={`grid gap-6 ${view === "grid" ? (compact ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-3") : "grid-cols-1"} ${compact ? 'px-0 pb-0' : 'px-6 pb-6'}`}>
          {projects.map((project) => (
            <Link 
              key={project.id} 
              href={`/customer/projects/${project.id}`} 
              className={`group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-md ${view === "list" ? "sm:flex-row sm:items-center sm:gap-6" : ""}`}
            >
              <div className={view === "list" ? "flex-1" : ""}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl font-bold text-blue-600 ring-1 ring-blue-100">
                      {initials(project.name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{project.name}</h3>
                      <span className={`mt-1 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        ['COMPLETED', 'DONE'].includes(project.status) ? 'bg-emerald-100 text-emerald-700' : 
                        ['ACTIVE', 'IN_PROGRESS'].includes(project.status) ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {project.statusLabel}
                      </span>
                    </div>
                  </div>
                </div>
                
                {view === "grid" && (
                  <p className="mt-4 text-sm text-slate-500 line-clamp-2 h-10">{project.description || "Chưa có mô tả."}</p>
                )}
                
                <div className={`mt-6 ${view === "list" ? "mt-4" : ""}`}>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500">Tiến độ dự án</span>
                    <span className="text-emerald-600 font-bold">{project.progress}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
              </div>

              <div className={`${view === "list" ? "mt-0 flex w-full max-w-sm flex-col justify-center border-l border-slate-100 pl-6" : "mt-6 border-t border-slate-100 pt-6"}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-slate-400"><CalendarDays className="h-3 w-3" /> Ngày bắt đầu</span>
                    <strong className="mt-1 block text-sm text-slate-900">{project.startDate}</strong>
                  </div>
                  <div>
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-slate-400"><Clock3 className="h-3 w-3" /> Hạn chót</span>
                    <strong className="mt-1 block text-sm text-slate-900">{project.dueDate}</strong>
                  </div>
                  <div>
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-slate-400"><CircleCheckBig className="h-3 w-3" /> Nhiệm vụ</span>
                    <strong className="mt-1 block text-sm text-slate-900">{project.taskCount}</strong>
                  </div>
                  <div>
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-slate-400"><WalletCards className="h-3 w-3" /> Ngân sách</span>
                    <strong className="mt-1 block text-sm text-slate-900 line-clamp-1">{project.budget}</strong>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 ring-1 ring-slate-200 overflow-hidden">
                      {project.owner?.image ? <Image src={project.owner.image} alt="" width={24} height={24} /> : <UserRoundCheck className="h-3 w-3" />}
                    </div>
                    <span className="text-xs font-medium text-slate-600 line-clamp-1">{project.owner?.name || "Chưa gán"}</span>
                  </div>
                  <AvatarStack followers={project.followers || []} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function AvatarStack({ followers }: { followers: NonNullable<ProjectItem["followers"]> }) {
  const shown = followers.slice(0, 4);
  const more = Math.max(followers.length - shown.length, 0);

  if (!followers.length) {
    return <span className="text-xs italic text-slate-400">Không có</span>;
  }

  return (
    <div className="flex -space-x-2 overflow-hidden" title={`${followers.length} người theo dõi`}>
      {shown.map((member) => (
        <span key={member.id} aria-label={member.name} className="inline-block h-6 w-6 rounded-full ring-2 ring-white overflow-hidden bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold">
          {member.image ? <Image src={member.image} alt="" width={24} height={24} /> : initials(member.name)}
        </span>
      ))}
      {more > 0 && (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 ring-2 ring-white text-[9px] font-bold text-slate-500">
          +{more}
        </span>
      )}
    </div>
  );
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "DA";
}
