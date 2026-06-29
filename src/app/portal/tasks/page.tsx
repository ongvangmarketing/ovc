import type { Metadata } from "next";
import { ClipboardList } from "lucide-react";
import { formatDate, getCustomerPortalData, statusClass, statusLabel } from "../portal-data";
import { PortalMissingContact, PortalShell } from "../portal-shell";
import { TasksView } from "./tasks-view";

export const metadata: Metadata = {
  title: "Nhiệm vụ | Portal Khách hàng",
};

export default async function PortalTasksPage() {
  const data = await getCustomerPortalData();

  if (!data.contact) {
    return <PortalMissingContact email={data.session.user.email} />;
  }

  return (
    <PortalShell active="tasks" customerName={data.customerName} email={data.contact.email}>
      <section className="quote-detail-hero">
        <div className="quote-detail-title">
          <div className="quote-detail-icon"><ClipboardList className="h-6 w-6" /></div>
          <div>
            <h1>Nhiệm vụ</h1>
            <p>Dashboard tiến độ công việc đang mở và đã hoàn thành</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <Metric label="Tổng nhiệm vụ" value={data.tasks.length} />
        <Metric label="Đang mở" value={data.totals.openTasks} />
        <Metric label="Đang làm" value={data.tasks.filter((task) => task.status === "IN_PROGRESS").length} />
        <Metric label="Hoàn thành" value={data.tasks.filter((task) => task.status === "DONE").length} />
      </section>

      <TasksView tasks={data.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        projectName: task.projectName,
        status: task.status,
        statusLabel: statusLabel(task.status),
        statusClass: statusClass(task.status),
        startDate: task.startDate?.toISOString() || null,
        dueDate: task.dueDate?.toISOString() || null,
        startLabel: formatDate(task.startDate),
        dueLabel: formatDate(task.dueDate),
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
