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
  title = "Dự án",
  description = "Tất cả các dự án đang triển khai và đã hoàn thành của bạn.",
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
    <div className="w-full bg-white text-black selection:bg-black selection:text-white">
      <div className={`mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between ${compact ? 'px-0' : 'px-6 pt-10 md:px-12 max-w-[1440px] mx-auto'}`}>
        <div>
          <h2 className={compact ? "text-[24px] font-medium tracking-tight text-black" : "text-[40px] md:text-[48px] font-medium tracking-tighter leading-none text-black"}>{title}</h2>
          <p className="mt-3 text-[16px] text-gray-500 max-w-xl leading-relaxed">{description}</p>
        </div>
        <div className="flex items-center gap-4">
          {actionHref && (
            <Link href={actionHref} className="text-[14px] font-medium text-black hover:text-gray-500 transition-colors">
              Xem tất cả
            </Link>
          )}
          <div className="flex items-center rounded-full border border-[#eaeaea] bg-white p-1">
            <button 
              type="button" 
              onClick={() => setView("list")} 
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${view === "list" ? "bg-black text-white" : "text-gray-400 hover:text-black"}`}
              title="Danh sách"
            >
              <List className="h-4 w-4" />
            </button>
            <button 
              type="button" 
              onClick={() => setView("grid")} 
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${view === "grid" ? "bg-black text-white" : "text-gray-400 hover:text-black"}`}
              title="Lưới"
            >
              <Grid2X2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {!projects.length ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center p-12 text-center border-t border-[#eaeaea] max-w-[1440px] mx-auto">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <CalendarDays className="h-6 w-6 text-gray-300" />
          </div>
          <h3 className="text-[24px] font-medium tracking-tight text-black">Chưa có dự án nào</h3>
          <p className="mt-2 text-[16px] text-gray-500 max-w-sm">Danh sách dự án của bạn hiện đang trống.</p>
        </div>
      ) : (
        <div className={`grid gap-6 ${view === "grid" ? (compact ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-3") : "grid-cols-1"} ${compact ? 'px-0 pb-0' : 'px-6 pb-16 md:px-12 max-w-[1440px] mx-auto'}`}>
          {projects.map((project) => (
            <Link 
              key={project.id} 
              href={`/customer/projects/${project.id}`} 
              className={`group flex flex-col justify-between rounded-2xl border border-[#eaeaea] bg-white p-8 transition-colors hover:border-gray-300 ${view === "list" ? "sm:flex-row sm:items-center sm:gap-8" : ""}`}
            >
              <div className={view === "list" ? "flex-1" : ""}>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-50 text-[16px] font-medium text-black border border-[#eaeaea]">
                      {initials(project.name)}
                    </div>
                    <div>
                      <h3 className="text-[24px] font-medium tracking-tight text-black group-hover:text-gray-600 transition-colors leading-tight">{project.name}</h3>
                      <span className="mt-2 inline-block rounded-full border border-[#eaeaea] px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-black bg-white">
                        {project.statusLabel}
                      </span>
                    </div>
                  </div>
                </div>
                
                {view === "grid" && (
                  <p className="text-[15px] text-gray-500 line-clamp-2 h-11 mb-8">{project.description || "Không có mô tả dự án."}</p>
                )}
                
                <div className={`${view === "list" ? "mt-4" : ""}`}>
                  <div className="flex items-center justify-between text-[13px] font-medium text-gray-500 mb-2">
                    <span>Tiến độ</span>
                    <span className="text-black">{project.progress}%</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-[#eaeaea]">
                    <div className="h-full bg-black transition-all duration-500" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
              </div>

              <div className={`${view === "list" ? "mt-0 flex w-full max-w-sm flex-col justify-center border-l border-[#eaeaea] pl-8" : "mt-8 border-t border-[#eaeaea] pt-8"}`}>
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-1 block">Bắt đầu</span>
                    <strong className="block text-[15px] font-medium text-black">{project.startDate}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-1 block">Hạn chót</span>
                    <strong className="block text-[15px] font-medium text-black">{project.dueDate}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-1 block">Nhiệm vụ</span>
                    <strong className="block text-[15px] font-medium text-black">{project.taskCount}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-1 block">Ngân sách</span>
                    <strong className="block text-[15px] font-medium text-black line-clamp-1">{project.budget}</strong>
                  </div>
                </div>
                
                <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 border border-[#eaeaea] overflow-hidden">
                      {project.owner?.image ? <Image src={project.owner.image} alt="" width={32} height={32} /> : <UserRoundCheck className="h-4 w-4" />}
                    </div>
                    <span className="text-[13px] font-medium text-black line-clamp-1">{project.owner?.name || "Chưa gán"}</span>
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
    return <span className="text-[12px] italic text-gray-400">Không có</span>;
  }

  return (
    <div className="flex -space-x-2 overflow-hidden" title={`${followers.length} người theo dõi`}>
      {shown.map((member) => (
        <span key={member.id} aria-label={member.name} className="inline-block h-8 w-8 rounded-full border border-white overflow-hidden bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-medium">
          {member.image ? <Image src={member.image} alt="" width={32} height={32} /> : initials(member.name)}
        </span>
      ))}
      {more > 0 && (
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#eaeaea] text-[10px] font-medium text-black">
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
