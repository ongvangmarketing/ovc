"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  const [view, setView] = useState<"list" | "grid">("list");

  return (
    <section className="quote-detail-card">
      <div className="portal-section-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {actionHref ? <Link href={actionHref} className="quote-detail-action">Xem tất cả</Link> : null}
          <div className="portal-view-toggle" aria-label="Kiểu hiển thị">
            <button type="button" aria-label="Hiển thị danh sách" className={view === "list" ? "active" : ""} onClick={() => setView("list")} title="Danh sách"><List className="h-4 w-4" /></button>
            <button type="button" aria-label="Hiển thị dạng lưới" className={view === "grid" ? "active" : ""} onClick={() => setView("grid")} title="Lưới"><Grid2X2 className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
      <div className={`portal-projects-view is-${view}${compact ? " is-compact" : ""}`}>
        {projects.map((project) => (
          <article key={project.id} className="portal-project-item">
            <div className="portal-project-accent" />
            <div className="portal-project-content">
              <div className="portal-project-title">
                <div className="portal-project-heading">
                  <div className="portal-project-avatar">{initials(project.name)}</div>
                  <div>
                    <strong>{project.name}</strong>
                    <p>{project.description || "Chưa có mô tả."}</p>
                  </div>
                </div>
                <span className={project.statusClass}>{project.statusLabel}</span>
              </div>
              <div className="portal-project-progress">
                <div><i style={{ width: `${project.progress}%` }} /></div>
                <strong>{project.progress}%</strong>
              </div>
              <div className="portal-project-details">
                <span><CalendarDays />Bắt đầu<strong>{project.startDate}</strong></span>
                <span><Clock3 />Hạn hoàn thành<strong>{project.dueDate}</strong></span>
                <span><CircleCheckBig />Nhiệm vụ<strong>{project.taskCount}</strong></span>
                <span><WalletCards />Ngân sách<strong>{project.budget}</strong></span>
              </div>
              <div className="portal-project-people">
                <div className="portal-project-owner">
                  <UserRoundCheck className="h-4 w-4" />
                  <span>Phụ trách</span>
                  <strong>{project.owner?.name || "Chưa gán"}</strong>
                </div>
                <div className="portal-project-followers">
                  <UsersRound className="h-4 w-4" />
                  <span>Đang follow</span>
                  <AvatarStack followers={project.followers || []} />
                </div>
              </div>
            </div>
          </article>
        ))}
        {!projects.length ? <div className="quote-detail-empty">Chưa có dự án nào.</div> : null}
      </div>
    </section>
  );
}

function AvatarStack({ followers }: { followers: NonNullable<ProjectItem["followers"]> }) {
  const shown = followers.slice(0, 4);
  const more = Math.max(followers.length - shown.length, 0);

  return (
    <div className="portal-avatar-stack" title={`${followers.length} người theo dõi`}>
      {shown.map((member) => (
        <span key={member.id} aria-label={member.name}>
          {member.image ? <Image src={member.image} alt="" width={30} height={30} /> : initials(member.name)}
        </span>
      ))}
      {more ? <span>+{more}</span> : null}
      {!followers.length ? <em>Chưa có</em> : null}
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
