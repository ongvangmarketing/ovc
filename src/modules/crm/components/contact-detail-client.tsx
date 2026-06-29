"use client";

import { useState, useTransition, type CSSProperties } from "react";
import Link from "next/link";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  ChevronDown,
  CircleAlert,
  Edit3,
  FilePlus2,
  Mail,
  Phone,
  ReceiptText,
  UserRound,
} from "lucide-react";

import { formatCurrency, formatDate } from "@/lib/utils/format";
import { sendPortalAccessEmailForContact } from "@/app/actions/crm";
import { cn } from "@/lib/utils/cn";
import { SelectBox } from "@/components/ui/select-box";

type MoneyValue = number | string | { toString(): string } | null | undefined;

type ContactDetail = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  type?: string | null;
  status?: string | null;
  priority?: string | null;
  source?: string | null;
  tags?: string[];
  notes?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  createdAt?: string | Date | null;
  company?: {
    id: string;
    name?: string | null;
    industry?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    customFields?: unknown | null;
  } | null;
  assignee?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  deals?: Array<{ id: string; title: string; value?: MoneyValue; createdAt?: string | Date | null }>;
  quotations?: Array<{ id: string; number: string; title?: string | null; total?: MoneyValue; status?: string; createdAt?: string | Date | null }>;
  contracts?: Array<{ id: string; number: string; title?: string | null; total?: MoneyValue; status?: string; createdAt?: string | Date | null }>;
  invoices?: Array<{
    id: string;
    number: string;
    title?: string | null;
    total?: MoneyValue;
    amountPaid?: MoneyValue;
    amountDue?: MoneyValue;
    status?: string;
    createdAt?: string | Date | null;
    payments?: Array<{
      id: string;
      amount?: MoneyValue;
      currency?: string;
      method?: string;
      status?: string;
      reference?: string | null;
      paidAt?: string | Date | null;
      createdAt?: string | Date | null;
    }>;
  }>;
  projects?: Array<{
    id: string;
    name: string;
    status?: string | null;
    priority?: string | null;
    dueDate?: string | Date | null;
    createdAt?: string | Date | null;
    tasks?: Array<{
      id: string;
      title: string;
      status?: string | null;
      priority?: string | null;
      dueDate?: string | Date | null;
      assignee?: { name?: string | null; email?: string | null } | null;
    }>;
  }>;
  tasks?: Array<{
    id: string;
    title: string;
    status?: string | null;
    priority?: string | null;
    dueDate?: string | Date | null;
    createdAt?: string | Date | null;
    assignee?: { name?: string | null; email?: string | null } | null;
    project?: { id: string; name: string; color?: string | null };
  }>;
  files?: Array<{
    id: string;
    name: string;
    url?: string | null;
    type?: string | null;
    mimeType?: string | null;
    size?: number | null;
    createdAt?: string | Date | null;
    uploader?: { name?: string | null; email?: string | null } | null;
    project?: { id: string; name: string };
    task?: { id: string; title: string };
  }>;
  activityLogs?: Array<{
    id: string;
    action?: string | null;
    entity?: string | null;
    entityId?: string | null;
    description?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt?: string | Date | null;
    user?: { name?: string | null; email?: string | null } | null;
  }>;
};

const detailTabs = [
  { id: "notes", label: "Ghi chú" },
  { id: "files", label: "Tệp tin" },
  { id: "activities", label: "Lịch sử hoạt động" },
  { id: "automation", label: "Tự động hóa" },
];

const financeTabs = [
  { id: "deals", label: "Cơ hội" },
  { id: "quotations", label: "Báo giá" },
  { id: "contracts", label: "Hợp đồng" },
  { id: "invoices", label: "Hóa đơn" },
  { id: "payments", label: "Thanh toán" },
];

const typeLabel: Record<string, string> = {
  LEAD: "Tiềm năng",
  PROSPECT: "Cơ hội",
  CUSTOMER: "Khách hàng",
  PARTNER: "Đối tác",
  VENDOR: "Nhà cung cấp",
};

const statusLabel: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Không hoạt động",
  BLOCKED: "Chặn",
};

const quotationStatusLabel: Record<string, string> = {
  DRAFT: "Bản nháp",
  SENT: "Đã gửi",
  VIEWED: "Đã xem",
  ACCEPTED: "Chấp nhận",
  REJECTED: "Từ chối",
  CONVERTED: "Đã chuyển đổi",
  EXPIRED: "Hết hạn",
};

const contractStatusLabel: Record<string, string> = {
  DRAFT: "Bản nháp",
  SENT: "Đã gửi",
  VIEWED: "Đã xem",
  SIGNED: "Đã ký",
  CANCELLED: "Đã hủy",
  CONVERTED: "Đã chuyển đổi",
};

const invoiceStatusLabel: Record<string, string> = {
  DRAFT: "Nháp",
  SENT: "Đã gửi",
  VIEWED: "Đã xem",
  PARTIAL: "Đặt cọc",
  PAID: "Đã thanh toán",
  OVERDUE: "Quá hạn",
  CANCELLED: "Đã hủy",
  REFUNDED: "Hoàn tiền",
};

const paymentStatusLabel: Record<string, string> = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang xử lý",
  COMPLETED: "Hoàn tất",
  FAILED: "Thất bại",
  REFUNDED: "Hoàn tiền",
  CANCELLED: "Đã hủy",
};

const paymentMethodLabel: Record<string, string> = {
  BANK_TRANSFER: "Chuyển khoản",
  CASH: "Tiền mặt",
  CARD: "Thẻ",
  MOMO: "MoMo",
  ZALOPAY: "ZaloPay",
  VNPAY: "VNPay",
  STRIPE: "Stripe",
  PAYPAL: "PayPal",
};

const statusTone: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  VIEWED: "bg-purple-100 text-purple-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  SIGNED: "bg-emerald-100 text-emerald-700",
  PAID: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PARTIAL: "bg-amber-100 text-amber-700",
  PENDING: "bg-amber-100 text-amber-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  CONVERTED: "bg-indigo-100 text-indigo-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-red-100 text-red-700",
  FAILED: "bg-red-100 text-red-700",
  OVERDUE: "bg-red-100 text-red-700",
  EXPIRED: "bg-orange-100 text-orange-700",
  REFUNDED: "bg-violet-100 text-violet-700",
};

function asNumber(value: MoneyValue) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function contactName(contact: ContactDetail) {
  return `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || contact.email || "Khách hàng";
}

function displayCustomerName(contact: ContactDetail) {
  return contact.company?.name || contactName(contact);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function shortText(value?: string | null) {
  if (!value) return "Đang cập nhật";
  return value.length > 42 ? `${value.slice(0, 42)}...` : value;
}

function formatFileSize(size?: number | null) {
  if (!size) return "Chưa rõ dung lượng";
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  if (size >= 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${size} B`;
}

function statusText(status?: string | null) {
  const labels: Record<string, string> = {
    PLANNING: "Lên kế hoạch",
    ACTIVE: "Đang làm",
    ON_HOLD: "Tạm dừng",
    COMPLETED: "Hoàn tất",
    CANCELLED: "Đã hủy",
    ARCHIVED: "Lưu trữ",
    BACKLOG: "Chờ xử lý",
    TODO: "Cần làm",
    IN_PROGRESS: "Đang làm",
    IN_REVIEW: "Đang duyệt",
    DONE: "Hoàn tất",
  };
  return labels[status || ""] || status || "Đang cập nhật";
}

function companyTaxCode(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const taxCode = (value as Record<string, unknown>).taxCode;
  return typeof taxCode === "string" ? taxCode : "";
}

function statusName(kind: "quotation" | "contract" | "invoice" | "payment", status?: string | null) {
  if (!status) return "Đang cập nhật";
  if (kind === "quotation") return quotationStatusLabel[status] || status;
  if (kind === "contract") return contractStatusLabel[status] || status;
  if (kind === "invoice") return invoiceStatusLabel[status] || status;
  return paymentStatusLabel[status] || status;
}

function StatusBadge({ kind, status }: { kind: "quotation" | "contract" | "invoice" | "payment"; status?: string | null }) {
  return (
    <span className={cn("badge-status text-xs font-medium", statusTone[status || ""] || "bg-slate-100 text-slate-600")}>
      {statusName(kind, status)}
    </span>
  );
}

function FinanceTable({
  headers,
  empty,
  children,
}: {
  headers: string[];
  empty: string;
  children: React.ReactNode;
}) {
  const hasRows = Array.isArray(children) ? children.some(Boolean) : Boolean(children);

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="overflow-x-auto scrollable-x">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50/70">
              {headers.map((header, index) => (
                <th key={header} className={cn("px-4 py-3 text-xs font-medium text-muted-foreground", index >= headers.length - 2 ? "text-right" : "text-left")}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
        {!hasRows ? <div className="quote-detail-empty m-4">{empty}</div> : null}
      </div>
    </div>
  );
}

function FinanceTitleCell({ href, title, sub }: { href?: string; title: string; sub?: string }) {
  const titleNode = href ? (
    <Link href={href} className="text-sm font-semibold text-blue-600 hover:underline">
      {title}
    </Link>
  ) : (
    <strong className="text-sm font-semibold text-slate-900">{title}</strong>
  );

  return (
    <div className="min-w-0">
      {titleNode}
      {sub ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

function ProjectSummaryList({ projects }: { projects: NonNullable<ContactDetail["projects"]> }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <h2>Dự án</h2>
        <Link href="/workspace/projects" className="quote-detail-action">Xem tất cả</Link>
      </div>
      {projects.length ? (
        <div className="customer-project-list">
          {projects.slice(0, 4).map((project) => {
            const taskCount = project.tasks?.length || 0;
            const doneCount = project.tasks?.filter((task) => task.status === "DONE").length || 0;

            return (
              <Link key={project.id} href={`/workspace/projects/${project.id}`} className="customer-project-card">
                <span className="customer-project-dot" />
                <div className="customer-project-main">
                  <strong>{project.name}</strong>
                  <p>{project.dueDate ? `Hạn: ${formatDate(project.dueDate)}` : "Chưa có hạn hoàn thành"}</p>
                </div>
                <div className="customer-project-meta">
                  <span className="customer-project-status">{statusText(project.status)}</span>
                  <small>{doneCount}/{taskCount} việc</small>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="quote-detail-empty">Chưa có dự án cho khách hàng này.</div>
      )}
    </>
  );
}

function MiniList({
  title,
  empty,
  items,
  framed = true,
}: {
  title: string;
  empty: string;
  items: Array<{ id: string; title: string; sub?: string; right?: string; href?: string }>;
  framed?: boolean;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h2>{title}</h2>
        <button type="button" className="quote-detail-action">Xem tất cả</button>
      </div>
      <div className="finance-activity-list">
        {items.length ? items.map((item) => (
          <Link href={item.href || "#"} key={item.id} className="finance-activity-item">
            <span />
            <div>
              <strong>{shortText(item.title)}</strong>
              <p>{shortText(item.sub)}</p>
            </div>
            {item.right ? <time>{item.right}</time> : null}
          </Link>
        )) : <div className="quote-detail-empty">{empty}</div>}
      </div>
    </>
  );

  if (!framed) return content;

  return (
    <section className="quote-detail-card">
      {content}
    </section>
  );
}

export function ContactDetailClient({ contact }: { contact: ContactDetail }) {
  const [activeTab, setActiveTab] = useState("notes");
  const [activeFinanceTab, setActiveFinanceTab] = useState("deals");
  const [menuOpen, setMenuOpen] = useState(false);
  const [chartMetric, setChartMetric] = useState<"revenue" | "debt">("revenue");
  const [chartRange, setChartRange] = useState<"30d" | "3m" | "6m" | "12m">("6m");
  const [isPortalPending, startPortalTransition] = useTransition();
  const name = displayCustomerName(contact);
  const personalName = contactName(contact);
  const invoices = contact.invoices || [];
  const quotations = contact.quotations || [];
  const contracts = contact.contracts || [];
  const deals = contact.deals || [];
  const projects = contact.projects || [];
  const tasks = contact.tasks || [];
  const files = contact.files || [];
  const activityLogs = contact.activityLogs || [];
  const paymentTableRows = invoices.flatMap((invoice) =>
    (invoice.payments || []).map((payment) => ({
      ...payment,
      invoiceId: invoice.id,
      invoiceNumber: invoice.number,
      invoiceTitle: invoice.title,
    }))
  );
  const totalRevenue = invoices.reduce((sum, item) => sum + asNumber(item.total), 0);
  const paidAmount = invoices.reduce((sum, invoice) => {
    const paidByPayments = (invoice.payments || [])
      .filter((payment) => payment.status === "COMPLETED")
      .reduce((paymentSum, payment) => paymentSum + asNumber(payment.amount), 0);
    return sum + Math.max(asNumber(invoice.amountPaid), paidByPayments);
  }, 0);
  const currentDebt = invoices.reduce((sum, invoice) => {
    const due = asNumber(invoice.amountDue);
    if (due > 0) return sum + due;
    const paidByPayments = (invoice.payments || [])
      .filter((payment) => payment.status === "COMPLETED")
      .reduce((paymentSum, payment) => paymentSum + asNumber(payment.amount), 0);
    return sum + Math.max(asNumber(invoice.total) - Math.max(asNumber(invoice.amountPaid), paidByPayments), 0);
  }, 0);
  const invoiceDates = invoices.reduce<Date[]>((dates, item) => {
    if (!item.createdAt) return dates;
    const date = new Date(item.createdAt);
    if (Number.isNaN(date.getTime())) return dates;
    return [...dates, date];
  }, []);
  const newestInvoiceDate = invoiceDates.sort((a, b) => b.getTime() - a.getTime())[0] || new Date();
  const rangeCount = chartRange === "30d" ? 30 : Number(chartRange.replace("m", ""));
  const chartSeries = Array.from({ length: rangeCount }).map((_, index) => {
    const date = chartRange === "30d"
      ? new Date(newestInvoiceDate.getFullYear(), newestInvoiceDate.getMonth(), newestInvoiceDate.getDate() - (29 - index))
      : new Date(newestInvoiceDate.getFullYear(), newestInvoiceDate.getMonth() - (rangeCount - 1 - index), 1);
    return {
      key: chartRange === "30d" ? date.toISOString().slice(0, 10) : monthKey(date),
      label: chartRange === "30d" ? `${date.getDate()}/${date.getMonth() + 1}` : monthLabel(date),
      value: 0,
    };
  });
  invoices.forEach((invoice) => {
    const date = invoice.createdAt ? new Date(invoice.createdAt) : null;
    if (!date || Number.isNaN(date.getTime())) return;
    const key = chartRange === "30d" ? date.toISOString().slice(0, 10) : monthKey(date);
    const period = chartSeries.find((item) => item.key === key);
    if (period) period.value += asNumber(invoice.total);
  });
  const filteredInvoiceIds = new Set(invoices.filter((invoice) => {
    const date = invoice.createdAt ? new Date(invoice.createdAt) : null;
    if (!date || Number.isNaN(date.getTime())) return false;
    const key = chartRange === "30d" ? date.toISOString().slice(0, 10) : monthKey(date);
    return chartSeries.some((item) => item.key === key);
  }).map((invoice) => invoice.id));
  const rangeRevenue = invoices.filter((invoice) => filteredInvoiceIds.has(invoice.id)).reduce((sum, invoice) => sum + asNumber(invoice.total), 0);
  const rangePaid = invoices.filter((invoice) => filteredInvoiceIds.has(invoice.id)).reduce((sum, invoice) => sum + asNumber(invoice.amountPaid), 0);
  const rangeDebt = invoices.filter((invoice) => filteredInvoiceIds.has(invoice.id)).reduce((sum, invoice) => sum + asNumber(invoice.amountDue), 0);
  const rangePaidPercent = rangeRevenue ? Math.round((rangePaid / rangeRevenue) * 100) : 0;
  const maxRevenue = Math.max(...chartSeries.map((item) => item.value), 1);
  const hasRevenueData = chartSeries.some((item) => item.value > 0);
  const chartPoints = chartSeries.map((item, index) => {
    const x = 32 + index * (576 / Math.max(chartSeries.length - 1, 1));
    const y = 210 - (item.value / maxRevenue) * 170;
    return { ...item, x, y };
  });
  const chartPath = chartPoints.map((item, index) => `${index === 0 ? "M" : "L"} ${item.x} ${item.y}`).join(" ");
  const firstChartPoint = chartPoints[0];
  const lastChartPoint = chartPoints[chartPoints.length - 1];
  const chartAreaPath = firstChartPoint && lastChartPoint ? `${chartPath} L ${lastChartPoint.x} 220 L ${firstChartPoint.x} 220 Z` : "";
  const callHref = contact.phone || contact.mobile ? `tel:${contact.phone || contact.mobile}` : undefined;
  const mailHref = contact.email ? `mailto:${contact.email}` : undefined;
  const handlePortalAccess = () => {
    const password = window.prompt("Nhập mật khẩu Portal muốn cấp. Để trống để hệ thống tự sinh mật khẩu.");
    startPortalTransition(async () => {
      try {
        const result = await sendPortalAccessEmailForContact(contact.id, password || undefined);
        const generated = result.generatedPassword ? ` Mật khẩu tự sinh: ${result.generatedPassword}` : "";
        alert(`Đã cấp Portal và ghi email log cho ${result.email}.${generated}`);
      } catch (error) {
        alert(error instanceof Error ? error.message : "Không thể cấp Portal cho khách hàng.");
      }
    });
  };

  const actionItems = [
    { label: "Tạo báo giá", icon: <FilePlus2 className="h-4 w-4" />, href: `/workspace/finance/quotations/create?contactId=${contact.id}` },
    { label: "Tạo hóa đơn", icon: <ReceiptText className="h-4 w-4" />, href: `/workspace/finance/invoices/create?contactId=${contact.id}` },
    { label: "Tạo dự án", icon: <BriefcaseBusiness className="h-4 w-4" />, onClick: () => alert("Tính năng tạo dự án từ khách hàng đang phát triển.") },
    { label: isPortalPending ? "Đang cấp Portal" : "Cấp lại Portal", icon: <Mail className="h-4 w-4" />, onClick: handlePortalAccess },
  ];

  return (
    <div className="quote-detail-page">
      <header className="quote-detail-hero">
        <div className="quote-detail-title">
          <div className="quote-detail-icon">
            <UserRound className="h-7 w-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1>{name}</h1>
              <span className="quote-status quote-status-accepted">
                {typeLabel[contact.type || "CUSTOMER"] || "Khách hàng"}
              </span>
            </div>
            <p>
              Mã khách hàng: KH-{contact.id.slice(-3).toUpperCase()} · Nhóm: {(contact.company?.industry || contact.source || "business").toLowerCase()}
            </p>
          </div>
        </div>

        <div className="quote-detail-top-actions">
          <Link href={`/workspace/crm/contacts/${contact.id}/edit`} className="quote-detail-top-button">
            <Edit3 className="h-4 w-4" />
            Chỉnh sửa
          </Link>
          {callHref ? (
            <a href={callHref} className="quote-detail-top-button">
              <Phone className="h-4 w-4" />
              Gọi điện
            </a>
          ) : null}
          {mailHref ? (
            <a href={mailHref} className="quote-detail-top-button">
              <Mail className="h-4 w-4" />
              Gửi email
            </a>
          ) : null}
          <div className="relative">
            <button type="button" onClick={() => setMenuOpen((current) => !current)} className="quote-detail-more">
              <ChevronDown className="h-4 w-4" />
            </button>
            {menuOpen ? (
              <div className="quote-detail-menu">
                {actionItems.map((item) => item.href ? (
                  <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
                    {item.icon}
                    {item.label}
                  </Link>
                ) : (
                  <button key={item.label} type="button" onClick={() => { setMenuOpen(false); item.onClick?.(); }}>
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <section className="customer-kpi-grid">
        <div className="customer-kpi-card">
          <span className="customer-kpi-icon is-blue"><ReceiptText className="h-5 w-5" /></span>
          <div>
            <p>Tổng doanh thu</p>
            <strong>{formatCurrency(totalRevenue)}</strong>
            <small>Từ hóa đơn</small>
          </div>
        </div>
        <div className="customer-kpi-card">
          <span className="customer-kpi-icon is-red"><CircleAlert className="h-5 w-5" /></span>
          <div>
            <p>Công nợ hiện tại</p>
            <strong>{formatCurrency(currentDebt)}</strong>
            <small>Cần theo dõi</small>
          </div>
        </div>
        <div className="customer-kpi-card">
          <span className="customer-kpi-icon is-green"><BriefcaseBusiness className="h-5 w-5" /></span>
          <div>
            <p>Hợp đồng</p>
            <strong>{contracts.length}</strong>
            <small>{contracts.filter((item) => item.status === "ACTIVE" || item.status === "SIGNED").length} đang hiệu lực</small>
          </div>
        </div>
        <div className="customer-kpi-card">
          <span className="customer-kpi-icon is-orange"><BadgeDollarSign className="h-5 w-5" /></span>
          <div>
            <p>Báo giá</p>
            <strong>{quotations.length}</strong>
            <small>Tổng số báo giá</small>
          </div>
        </div>
      </section>

      <section className="quote-detail-summary">
        <div>
          <span>Khách hàng</span>
          <strong>{personalName}</strong>
          <p>{contact.phone || contact.mobile || "Chưa có số điện thoại"}</p>
          <p>{contact.email || "Chưa có email"}</p>
        </div>
        <div>
          <span>Công ty</span>
          <strong>{contact.company?.name || "Chưa gắn công ty"}</strong>
          <p>{[contact.company?.email, contact.company?.phone, companyTaxCode(contact.company?.customFields) ? `MST: ${companyTaxCode(contact.company?.customFields)}` : ""].filter(Boolean).join(" · ") || "Chưa có thông tin công ty"}</p>
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
          <div className="grid gap-5">
            <section className="quote-detail-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2>{chartMetric === "revenue" ? "Doanh thu theo thời gian" : "Công nợ theo trạng thái"}</h2>
                  <strong>{formatCurrency(chartMetric === "revenue" ? rangeRevenue : rangeDebt)}</strong>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <SelectBox ariaLabel="Loại biểu đồ khách hàng" value={chartMetric} onChange={(value) => setChartMetric(value as "revenue" | "debt")} options={[{ value: "revenue", label: "Doanh thu" }, { value: "debt", label: "Công nợ" }]} className="w-[118px]" />
                  <SelectBox ariaLabel="Thời gian biểu đồ khách hàng" value={chartRange} onChange={(value) => setChartRange(value as "30d" | "3m" | "6m" | "12m")} options={[{ value: "30d", label: "30 ngày" }, { value: "3m", label: "3 tháng" }, { value: "6m", label: "6 tháng" }, { value: "12m", label: "12 tháng" }]} className="w-[118px]" />
                </div>
              </div>
              {chartMetric === "revenue" ? <svg viewBox="0 0 640 260" className="customer-line-chart">
                <defs><linearGradient id={`customerRevenueFill-${contact.id}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity="0.22" /><stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" /></linearGradient></defs>
                {[40, 80, 120, 160, 200].map((y) => <line key={y} x1="0" x2="640" y1={y} y2={y} stroke="#e5eaf2" strokeDasharray="6 6" />)}
                {hasRevenueData ? <path d={chartAreaPath} fill={`url(#customerRevenueFill-${contact.id})`} /> : null}
                {hasRevenueData ? <path d={chartPath} fill="none" stroke="#f59e0b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" /> : null}
                {chartPoints.map((point) => (
                  <g key={point.key}>
                    {hasRevenueData ? <circle cx={point.x} cy={point.y} r="5" fill="#f59e0b" stroke="#fff" strokeWidth="3" /> : null}
                    {(chartSeries.length <= 12 || point.key === chartSeries[0]?.key || point.key === chartSeries.at(-1)?.key) ? <text x={point.x} y="248" textAnchor="middle">{point.label}</text> : null}
                  </g>
                ))}
                {!hasRevenueData ? <text x="320" y="130" textAnchor="middle" className="customer-chart-empty">Chưa có doanh thu trong kỳ</text> : null}
              </svg> : <div className="customer-donut-wrap">
                <div className="customer-donut" style={{ "--paid": `${rangeRevenue ? Math.max(12, rangePaidPercent) : 0}%` } as CSSProperties} />
                <div className="customer-donut-legend">
                  <span><i className="paid" />Đã thu: {formatCurrency(rangePaid)}</span>
                  <span><i className="debt" />Còn phải thu: {formatCurrency(rangeDebt)}</span>
                </div>
              </div>}
            </section>
          </div>

          <section className="quote-detail-card">
            <ProjectSummaryList projects={projects} />
          </section>

          <section className="quote-detail-card">
            <MiniList
              framed={false}
              title="Nhiệm vụ"
              empty="Chưa có nhiệm vụ theo dõi."
              items={tasks.slice(0, 6).map((item) => ({
                id: item.id,
                title: item.title,
                sub: [item.project?.name, item.assignee?.name, item.dueDate ? `Hạn: ${formatDate(item.dueDate)}` : ""].filter(Boolean).join(" · "),
                right: statusText(item.status),
                href: item.project?.id ? `/workspace/projects/${item.project.id}` : undefined,
              }))}
            />
          </section>

          <section className="quote-detail-card">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2>Tài chính</h2>
                <p className="mt-1 text-sm text-slate-500">Báo giá, hợp đồng, hóa đơn và thanh toán của khách hàng.</p>
              </div>
            </div>
            <nav className="quote-detail-tabs mb-4">
              {financeTabs.map((tab) => (
                <button key={tab.id} type="button" onClick={() => setActiveFinanceTab(tab.id)} className={activeFinanceTab === tab.id ? "active" : ""}>
                  {tab.label}
                </button>
              ))}
            </nav>
            {activeFinanceTab === "deals" ? (
              <FinanceTable headers={["Cơ hội", "Ngày tạo", "Giá trị"]} empty="Chưa có cơ hội.">
                {deals.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 table-row-hover">
                    <td className="px-4 py-3"><FinanceTitleCell title={item.title} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums">{formatCurrency(asNumber(item.value))}</td>
                  </tr>
                ))}
              </FinanceTable>
            ) : null}
            {activeFinanceTab === "quotations" ? (
              <FinanceTable headers={["Số Báo giá", "Trạng thái", "Ngày tạo", "Tổng tiền"]} empty="Chưa có báo giá.">
                {quotations.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 table-row-hover">
                    <td className="px-4 py-3">
                      <FinanceTitleCell href={`/workspace/finance/quotations/${item.id}`} title={item.number} sub={item.title || undefined} />
                    </td>
                    <td className="px-4 py-3"><StatusBadge kind="quotation" status={item.status} /></td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums">{formatCurrency(asNumber(item.total))}</td>
                  </tr>
                ))}
              </FinanceTable>
            ) : null}
            {activeFinanceTab === "contracts" ? (
              <FinanceTable headers={["Số HĐ", "Trạng thái", "Ngày tạo", "Tổng tiền"]} empty="Chưa có hợp đồng.">
                {contracts.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 table-row-hover">
                    <td className="px-4 py-3">
                      <FinanceTitleCell href={`/workspace/finance/contracts/${item.id}`} title={item.number} sub={item.title || undefined} />
                    </td>
                    <td className="px-4 py-3"><StatusBadge kind="contract" status={item.status} /></td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums">{formatCurrency(asNumber(item.total))}</td>
                  </tr>
                ))}
              </FinanceTable>
            ) : null}
            {activeFinanceTab === "invoices" ? (
              <FinanceTable headers={["Số HĐ", "Trạng thái", "Tổng tiền", "Còn lại"]} empty="Chưa có hóa đơn.">
                {invoices.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 table-row-hover">
                    <td className="px-4 py-3">
                      <FinanceTitleCell href={`/workspace/finance/invoices/${item.id}`} title={item.number} sub={item.title || formatDate(item.createdAt)} />
                    </td>
                    <td className="px-4 py-3"><StatusBadge kind="invoice" status={item.status} /></td>
                    <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums">{formatCurrency(asNumber(item.total))}</td>
                    <td className={cn("px-4 py-3 text-right text-sm tabular-nums", asNumber(item.amountDue) > 0 ? "text-slate-900" : "font-semibold text-emerald-600")}>
                      {asNumber(item.amountDue) > 0 ? formatCurrency(asNumber(item.amountDue)) : "Đã TT"}
                    </td>
                  </tr>
                ))}
              </FinanceTable>
            ) : null}
            {activeFinanceTab === "payments" ? (
              <FinanceTable headers={["Mã phiếu", "Hóa đơn", "Trạng thái", "Số tiền"]} empty="Chưa có thanh toán.">
                {paymentTableRows.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 table-row-hover">
                    <td className="px-4 py-3">
                      <FinanceTitleCell
                        href={`/workspace/finance/payments/${item.id}`}
                        title={item.reference || item.id.slice(-8).toUpperCase()}
                        sub={[paymentMethodLabel[item.method || ""] || item.method, formatDate(item.paidAt || item.createdAt)].filter(Boolean).join(" · ")}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/workspace/finance/invoices/${item.invoiceId}`} className="text-sm font-medium text-slate-900 hover:text-blue-600 hover:underline">
                        {item.invoiceNumber || "Không có mã"}
                      </Link>
                    </td>
                    <td className="px-4 py-3"><StatusBadge kind="payment" status={item.status} /></td>
                    <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums">{formatCurrency(asNumber(item.amount))}</td>
                  </tr>
                ))}
              </FinanceTable>
            ) : null}
          </section>

          <section className="quote-detail-card">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2>Theo dõi</h2>
                <p className="mt-1 text-sm text-slate-500">Ghi chú, tệp tin, lịch sử hoạt động và tự động hóa.</p>
              </div>
            </div>
            <nav className="quote-detail-tabs mb-4">
              {detailTabs.map((tab) => (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={activeTab === tab.id ? "active" : ""}>
                  {tab.label}
                </button>
              ))}
            </nav>
            {activeTab === "notes" ? (
              <>
                <h2>Ghi chú</h2>
                <div className="quote-detail-empty">{contact.notes || "Chưa có ghi chú."}</div>
              </>
            ) : null}
            {activeTab === "files" ? (
              <MiniList
                framed={false}
                title="Tệp tin từ dự án"
                empty="Chưa có tệp tin nào từ dự án hoặc nhiệm vụ."
                items={files.map((item) => ({
                  id: item.id,
                  title: item.name,
                  sub: [item.project?.name, item.task?.title, item.uploader?.name || item.uploader?.email, formatFileSize(item.size)].filter(Boolean).join(" · "),
                  right: formatDate(item.createdAt),
                  href: item.url || undefined,
                }))}
              />
            ) : null}
            {activeTab === "activities" ? (
              <MiniList
                framed={false}
                title="Lịch sử hoạt động"
                empty="Chưa có hoạt động."
                items={activityLogs.map((item) => ({
                  id: item.id,
                  title: item.description || `${item.action || "Hoạt động"} · ${item.entity || "Hệ thống"}`,
                  sub: [item.user?.name || item.user?.email, item.ipAddress, item.userAgent ? "Có thiết bị truy cập" : ""].filter(Boolean).join(" · ") || "Log hệ thống",
                  right: formatDate(item.createdAt),
                }))}
              />
            ) : null}
            {activeTab === "automation" ? (
              <>
                <h2>Tự động hóa</h2>
                <div className="quote-detail-empty">Tính năng đang phát triển.</div>
              </>
            ) : null}
          </section>
        </main>

        <aside className="space-y-5">
          <section className="quote-detail-card">
            <h2>Thông tin nhanh</h2>
            <div className="quote-side-list">
              <div><span>Loại khách hàng</span><strong>{typeLabel[contact.type || "CUSTOMER"] || contact.type}</strong></div>
              <div><span>Trạng thái</span><strong>{statusLabel[contact.status || "ACTIVE"] || contact.status}</strong></div>
              <div><span>Ngành nghề</span><strong>{contact.company?.industry || contact.department || "Đang cập nhật"}</strong></div>
              <div><span>Nguồn khách hàng</span><strong>{contact.source || "other"}</strong></div>
              <div><span>Người phụ trách</span><strong>{contact.assignee?.name || "Chưa gán"}</strong></div>
              <div><span>Ngày tạo</span><strong>{formatDate(contact.createdAt)}</strong></div>
            </div>
          </section>

          <section className="quote-detail-card">
            <h2>Giá trị & thanh toán</h2>
            <div className="quote-side-list">
              <div><span>Tổng doanh thu</span><strong>{formatCurrency(totalRevenue)}</strong></div>
              <div><span>Đã thu</span><strong>{formatCurrency(paidAmount)}</strong></div>
              <div><span>Công nợ</span><strong>{formatCurrency(currentDebt)}</strong></div>
              <div><span>Hợp đồng</span><strong>{contracts.length}</strong></div>
              <div><span>Báo giá</span><strong>{quotations.length}</strong></div>
              <div><span>Dự án</span><strong>{projects.length}</strong></div>
              <div><span>Nhiệm vụ</span><strong>{tasks.length}</strong></div>
            </div>
          </section>

          <section className="quote-detail-card">
            <h2>Thao tác</h2>
            <div className="quote-side-actions">
              <Link href={`/workspace/crm/contacts/${contact.id}/edit`} className="quote-detail-action"><Edit3 className="h-4 w-4" />Chỉnh sửa</Link>
              {callHref ? <a href={callHref} className="quote-detail-action"><Phone className="h-4 w-4" />Gọi điện</a> : null}
              {mailHref ? <a href={mailHref} className="quote-detail-action"><Mail className="h-4 w-4" />Gửi email</a> : null}
              {actionItems.map((item) => item.href ? (
                <Link key={item.label} href={item.href} className="quote-detail-action">{item.icon}{item.label}</Link>
              ) : (
                <button key={item.label} type="button" onClick={item.onClick} className="quote-detail-action">{item.icon}{item.label}</button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
