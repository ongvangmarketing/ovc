import type { Metadata } from "next";
import { FolderKanban } from "lucide-react";
import { formatCurrency, formatDate, getCustomerPortalData, progressFromTasks, statusClass, statusLabel } from "../portal-data";
import { PortalMissingContact, PortalShell } from "../portal-shell";
import { ProjectsView } from "./projects-view";

export const metadata: Metadata = {
  title: "Dự án | Portal Khách hàng",
};

export default async function PortalProjectsPage() {
  const data = await getCustomerPortalData();

  if (!data.contact) {
    return <PortalMissingContact email={data.session.user.email} />;
  }

  return (
    <PortalShell active="projects" customerName={data.customerName} email={data.contact.email}>
      <section className="quote-detail-hero">
        <div className="quote-detail-title">
          <div className="quote-detail-icon"><FolderKanban className="h-6 w-6" /></div>
          <div>
            <h1>Dự án</h1>
            <p>Theo dõi tiến độ, nhiệm vụ và ngân sách dự án của {data.customerName}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Metric label="Tổng dự án" value={data.projects.length} />
        <Metric label="Đang triển khai" value={data.totals.activeProjects} />
        <Metric label="Tổng nhiệm vụ" value={data.tasks.length} />
      </section>

      <ProjectsView projects={data.projects.map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        statusLabel: statusLabel(project.status),
        statusClass: statusClass(project.status),
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
    </PortalShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="quote-detail-card">
      <span className="text-slate-500">{label}</span>
      <strong className="mt-2 block text-2xl text-slate-950">{value}</strong>
    </div>
  );
}
