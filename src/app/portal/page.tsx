import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  CircleAlert,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  ReceiptText,
} from "lucide-react";

import {
  formatCurrency,
  formatDate,
  getCustomerPortalData,
  progressFromTasks,
  statusLabel,
} from "./portal-data";
import { PortalDebtDonut, PortalRevenueChart } from "./portal-dashboard-charts";
import { PortalFinanceTabs, PortalTaskKanban } from "./portal-dashboard-sections";
import { ProjectsView } from "./projects/projects-view";
import { PortalMissingContact, PortalShell } from "./portal-shell";

export const metadata: Metadata = {
  title: "Portal Khách hàng | Ong Vàng Workspace",
};

type MoneyValue = number | string | { toString(): string } | null | undefined;

function asNumber(value: MoneyValue) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

export default async function CustomerPortalPage() {
  const data = await getCustomerPortalData();

  if (!data.contact) {
    return <PortalMissingContact email={data.session.user.email} />;
  }

  const { contact, customerName, projects, tasks, quotations, contracts, invoices, payments, totals } = data;
  const activeContracts = contracts.filter((item) => ["ACTIVE", "SIGNED"].includes(item.status)).length;
  const invoiceDates = invoices.reduce<Date[]>((dates, item) => {
    if (!item.createdAt) return dates;
    const date = new Date(item.createdAt);
    if (Number.isNaN(date.getTime())) return dates;
    return [...dates, date];
  }, []);
  const newestInvoiceDate = invoiceDates.sort((a, b) => b.getTime() - a.getTime())[0] || new Date();
  const revenueMonths = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date(newestInvoiceDate.getFullYear(), newestInvoiceDate.getMonth() - (5 - index), 1);
    return { key: monthKey(date), label: monthLabel(date), value: 0 };
  });

  invoices.forEach((invoice) => {
    const date = invoice.createdAt ? new Date(invoice.createdAt) : null;
    if (!date || Number.isNaN(date.getTime())) return;
    const month = revenueMonths.find((item) => item.key === monthKey(date));
    if (month) month.value += asNumber(invoice.total);
  });

  const financeGroups = [
    {
      key: "quotations" as const,
      label: "Báo giá",
      items: quotations.map((item) => ({
        id: item.id,
        code: item.number,
        title: item.title,
        status: item.status,
        date: item.createdAt?.toISOString() || null,
        amount: asNumber(item.total),
        href: item.token ? `/document/${item.token}` : "/portal/finance",
      })),
    },
    {
      key: "contracts" as const,
      label: "Hợp đồng",
      items: contracts.map((item) => ({
        id: item.id,
        code: item.number,
        title: item.title,
        status: item.status,
        date: item.createdAt?.toISOString() || null,
        amount: asNumber(item.total),
        href: item.token ? `/document/${item.token}` : "/portal/finance",
      })),
    },
    {
      key: "invoices" as const,
      label: "Hóa đơn",
      items: invoices.map((item) => ({
        id: item.id,
        code: item.number,
        title: item.title || item.number,
        status: item.status,
        date: (item.dueDate || item.createdAt)?.toISOString() || null,
        amount: asNumber(item.total),
        href: item.token ? `/document/${item.token}` : "/portal/finance",
      })),
    },
    {
      key: "payments" as const,
      label: "Thanh toán",
      items: payments.map((item) => ({
        id: item.id,
        code: item.reference || item.id,
        title: `Hóa đơn ${item.invoice.number}`,
        status: item.status,
        date: (item.paidAt || item.createdAt)?.toISOString() || null,
        amount: asNumber(item.amount),
        href: "/portal/finance",
      })),
    },
  ];

  return (
    <PortalShell active="overview" customerName={customerName} email={contact.email}>
      <section className="quote-detail-hero">
        <div className="quote-detail-title">
          <div className="quote-detail-icon"><LayoutDashboard className="h-6 w-6" /></div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1>{customerName}</h1>
              <span className="quote-status quote-status-accepted">Customer Portal</span>
            </div>
            <p>Mã khách hàng: KH-{contact.id.slice(-3).toUpperCase()} · {contact.email || data.session.user.email}</p>
          </div>
        </div>
        <div className="quote-detail-actions">
          <Link href="/portal/finance" className="quote-detail-top-button"><CreditCard className="h-4 w-4" />Tài chính</Link>
          <Link href="/portal/projects" className="quote-detail-top-button"><FolderKanban className="h-4 w-4" />Dự án</Link>
        </div>
      </section>

      <section className="customer-kpi-grid">
        <PortalKpi icon={<ReceiptText className="h-5 w-5" />} tone="is-blue" label="Tổng doanh thu" value={formatCurrency(totals.totalInvoiced)} hint="Từ hóa đơn" />
        <PortalKpi icon={<CircleAlert className="h-5 w-5" />} tone="is-red" label="Công nợ hiện tại" value={formatCurrency(totals.totalDue)} hint="Cần theo dõi" />
        <PortalKpi icon={<BriefcaseBusiness className="h-5 w-5" />} tone="is-green" label="Hợp đồng" value={contracts.length} hint={`${activeContracts} đang hiệu lực`} />
        <PortalKpi icon={<BadgeDollarSign className="h-5 w-5" />} tone="is-orange" label="Báo giá" value={quotations.length} hint="Tổng số báo giá" />
      </section>

      <section className="quote-detail-summary">
        <div>
          <span>Khách hàng</span>
          <strong>{`${contact.firstName || ""} ${contact.lastName || ""}`.trim() || customerName}</strong>
          <p>{contact.phone || contact.mobile || "Chưa có số điện thoại"}</p>
          <p>{contact.email || "Chưa có email"}</p>
        </div>
        <div>
          <span>Công ty</span>
          <strong>{contact.company?.name || "Chưa gắn công ty"}</strong>
          <p>{contact.company?.email || contact.company?.phone || "Chưa có thông tin công ty"}</p>
        </div>
        <div>
          <span>Địa chỉ</span>
          <strong>{contact.address || contact.company?.address || "Chưa cập nhật"}</strong>
          <p>{[contact.city, contact.country].filter(Boolean).join(", ") || "Chưa cập nhật"}</p>
        </div>
        <div>
          <span>Ghi chú</span>
          <strong>{contact.notes || "Chưa có ghi chú"}</strong>
          <p>Nguồn: {contact.source || "other"}</p>
        </div>
      </section>

      <div className="quote-detail-layout">
        <main className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(260px,0.85fr)]">
            <PortalRevenueChart months={revenueMonths} totalRevenue={totals.totalInvoiced} />
            <PortalDebtDonut paidAmount={totals.totalPaid} dueAmount={totals.totalDue} />
          </div>

          <ProjectsView
            title="Dự án"
            description="Theo dõi nhanh tiến độ các dự án đang triển khai."
            actionHref="/portal/projects"
            compact
            projects={projects.slice(0, 4).map((project) => ({
              id: project.id,
              name: project.name,
              description: project.description,
              status: project.status,
              statusLabel: statusLabel(project.status),
              statusClass: statusLabel(project.status) === "Hoàn thành" ? "is-success" : "is-info",
              progress: progressFromTasks(project.tasks),
              startDate: formatDate(project.startDate),
              dueDate: formatDate(project.dueDate),
              budget: formatCurrency(project.budget),
              taskCount: project.tasks.length,
            }))}
          />

          <PortalTaskKanban tasks={tasks.map((task) => ({
            id: task.id,
            title: task.title,
            projectName: task.projectName,
            status: task.status,
            dueDate: task.dueDate?.toISOString() || null,
          }))} />

          <PortalFinanceTabs groups={financeGroups} />
        </main>

        <aside className="space-y-5">
          <section className="quote-detail-card">
            <h2>Thông tin nhanh</h2>
            <div className="quote-side-list">
              <div><span>Loại khách hàng</span><strong>{statusLabel(contact.type)}</strong></div>
              <div><span>Trạng thái</span><strong>{statusLabel(contact.status)}</strong></div>
              <div><span>Nguồn khách hàng</span><strong>{contact.source || "other"}</strong></div>
              <div><span>Ngày tạo</span><strong>{formatDate(contact.createdAt)}</strong></div>
            </div>
          </section>

          <section className="quote-detail-card">
            <h2>Giá trị & thanh toán</h2>
            <div className="quote-side-list">
              <div><span>Tổng doanh thu</span><strong>{formatCurrency(totals.totalInvoiced)}</strong></div>
              <div><span>Đã thu</span><strong>{formatCurrency(totals.totalPaid)}</strong></div>
              <div><span>Công nợ</span><strong>{formatCurrency(totals.totalDue)}</strong></div>
              <div><span>Hợp đồng</span><strong>{contracts.length}</strong></div>
              <div><span>Báo giá</span><strong>{quotations.length}</strong></div>
              <div><span>Dự án</span><strong>{projects.length}</strong></div>
              <div><span>Nhiệm vụ</span><strong>{tasks.length}</strong></div>
            </div>
          </section>

          <section className="quote-detail-card">
            <h2>Thao tác</h2>
            <div className="quote-side-actions">
              <Link href="/portal/finance" className="quote-detail-action"><CreditCard className="h-4 w-4" />Tài chính</Link>
              <Link href="/portal/projects" className="quote-detail-action"><FolderKanban className="h-4 w-4" />Dự án</Link>
              <Link href="/portal/tasks" className="quote-detail-action"><ReceiptText className="h-4 w-4" />Nhiệm vụ</Link>
              <Link href="/portal/account" className="quote-detail-action"><LayoutDashboard className="h-4 w-4" />Tài khoản</Link>
            </div>
          </section>
        </aside>
      </div>
    </PortalShell>
  );
}

function PortalKpi({ icon, tone, label, value, hint }: { icon: ReactNode; tone: string; label: string; value: ReactNode; hint: string }) {
  return (
    <div className="customer-kpi-card">
      <span className={`customer-kpi-icon ${tone}`}>{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{hint}</small>
      </div>
    </div>
  );
}
