import type { Metadata } from "next";
import { FolderKanban, ReceiptText } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate, getCustomerPortalData, progressFromTasks, statusLabel } from "../portal-data";
import { ProjectsView } from "./projects-view";

export const metadata: Metadata = {
  title: "Dự án | Customer Portal",
};

export default async function CustomerProjectsPage() {
  const data = await getCustomerPortalData();

  if (!data.contact) {
    return null;
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8 animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm lg:flex-row lg:items-center">
        <div className="flex items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 shadow-sm shrink-0">
            <FolderKanban className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý Dự án</h1>
            <p className="mt-1 text-sm text-slate-500">Theo dõi tiến độ, nhiệm vụ và ngân sách các dự án của bạn.</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng dự án</div>
            <div className="text-lg font-bold text-slate-900">{data.projects.length}</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Đang triển khai</div>
            <div className="text-lg font-bold text-blue-600">{data.totals.activeProjects}</div>
          </div>
        </div>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <ProjectsView projects={data.projects.map((project) => ({
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          statusLabel: statusLabel(project.status),
          statusClass: project.status === "COMPLETED" ? "is-success" : "is-info",
          progress: progressFromTasks(project.tasks),
          startDate: formatDate(project.startDate),
          dueDate: formatDate(project.dueDate),
          budget: formatCurrency(project.budget),
          taskCount: project.tasks.length,
          owner: project.owner ? { name: project.owner.name || project.owner.email || "Người phụ trách", email: project.owner.email, image: project.owner.image } : null,
          followers: project.members.map((member) => ({
            id: member.userId,
            name: member.user.name || member.user.email || "Follower",
            email: member.user.email,
            image: member.user.image,
            role: member.role,
          })),
        }))} />
      </div>
    </div>
  );
}
