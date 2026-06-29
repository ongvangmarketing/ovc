"use server";

import { endOfMonth, format, startOfDay, startOfMonth, subDays, subMonths } from "date-fns";
import { InvoiceStatus } from "@prisma/client";

import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";

const MONEY_STATUSES: InvoiceStatus[] = [
  InvoiceStatus.SENT,
  InvoiceStatus.VIEWED,
  InvoiceStatus.PARTIAL,
  InvoiceStatus.PAID,
  InvoiceStatus.OVERDUE,
];
const OPEN_INVOICE_STATUSES: InvoiceStatus[] = [
  InvoiceStatus.SENT,
  InvoiceStatus.VIEWED,
  InvoiceStatus.PARTIAL,
  InvoiceStatus.OVERDUE,
];

function toNumber(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  if (typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return Number(value) || 0;
}

function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function contactName(contact?: { firstName: string; lastName: string; company?: { name: string } | null } | null) {
  if (!contact) return "Chưa gắn khách hàng";
  const name = `${contact.firstName} ${contact.lastName}`.trim();
  return name || contact.company?.name || "Chưa gắn khách hàng";
}

function progressFromCustomFields(value: unknown): number {
  if (!value || typeof value !== "object" || Array.isArray(value)) return 0;
  const maybeProgress = (value as Record<string, unknown>).progress;
  return Math.max(0, Math.min(100, Math.round(toNumber(maybeProgress))));
}

export type WorkspaceDashboardData = Awaited<ReturnType<typeof getWorkspaceDashboard>>;

export async function getWorkspaceDashboard(range?: { from: Date; to: Date }) {
  const session = await requireAuth();
  let orgId: string | undefined = session.organizationId;
  if (!orgId) {
    const membership = await db.organizationMember.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
      orderBy: { createdAt: "asc" },
    });
    orgId = membership?.organizationId ?? undefined;
  }
  if (!orgId) {
    const organization = await db.organization.findFirst({
      where: { slug: "ongvang" },
      select: { id: true },
    });
    orgId = organization?.id ?? undefined;
  }
  if (!orgId) {
    throw new Error("No active organization");
  }

  const now = new Date();
  const rangeStart = range?.from;
  const rangeEnd = range?.to;
  const createdAtRange = rangeStart && rangeEnd ? { gte: rangeStart, lte: rangeEnd } : undefined;
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const previousMonthStart = startOfMonth(subMonths(now, 1));
  const previousMonthEnd = endOfMonth(subMonths(now, 1));
  const sevenDays = Array.from({ length: 7 }, (_, index) => startOfDay(subDays(now, 6 - index)));
  const trendDays = Array.from({ length: 30 }, (_, index) => startOfDay(subDays(now, 29 - index)));
  const trendMonths = Array.from({ length: 12 }, (_, index) => startOfMonth(subMonths(now, 11 - index)));

  const [
    customers,
    previousCustomers,
    monthlyRevenue,
    previousMonthlyRevenue,
    paidThisMonth,
    paidPreviousMonth,
    receivable,
    previousReceivable,
    totalRevenue,
    totalPaid,
    totalTasks,
    taskStatus,
    projectStatus,
    completedProjectsWithDeadline,
    projectTrendRows,
    paymentsLast7Days,
    recentPayments,
    recentInvoices,
    recentProjects,
    activeProjects,
    latestInvoices,
    receivableInvoices,
    potentialCustomers,
  ] = await Promise.all([
    db.contact.count({ where: { organizationId: orgId, createdAt: createdAtRange } }),
    db.contact.count({ where: { organizationId: orgId, createdAt: { lt: previousMonthStart } } }),
    db.invoice.aggregate({
      where: {
        organizationId: orgId,
        status: { in: MONEY_STATUSES },
        issuedAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { total: true },
    }),
    db.invoice.aggregate({
      where: {
        organizationId: orgId,
        status: { in: MONEY_STATUSES },
        issuedAt: { gte: previousMonthStart, lte: previousMonthEnd },
      },
      _sum: { total: true },
    }),
    db.payment.aggregate({
      where: {
        organizationId: orgId,
        status: "COMPLETED",
        paidAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),
    db.payment.aggregate({
      where: {
        organizationId: orgId,
        status: "COMPLETED",
        paidAt: { gte: previousMonthStart, lte: previousMonthEnd },
      },
      _sum: { amount: true },
    }),
    db.invoice.aggregate({
      where: { organizationId: orgId, status: { in: OPEN_INVOICE_STATUSES } },
      _sum: { amountDue: true },
    }),
    db.invoice.aggregate({
      where: {
        organizationId: orgId,
        status: { in: OPEN_INVOICE_STATUSES },
        createdAt: { lt: monthStart },
      },
      _sum: { amountDue: true },
    }),
    db.invoice.aggregate({
      where: { organizationId: orgId, status: { in: MONEY_STATUSES }, issuedAt: createdAtRange },
      _sum: { total: true },
    }),
    db.payment.aggregate({
      where: { organizationId: orgId, status: "COMPLETED", paidAt: createdAtRange },
      _sum: { amount: true },
    }),
    db.task.count({ where: { project: { organizationId: orgId }, createdAt: createdAtRange } }),
    db.task.groupBy({
      by: ["status"],
      where: { project: { organizationId: orgId }, createdAt: createdAtRange },
      _count: { _all: true },
    }),
    db.project.groupBy({
      by: ["status"],
      where: { organizationId: orgId, createdAt: createdAtRange },
      _count: { _all: true },
    }),
    db.project.findMany({
      where: {
        organizationId: orgId,
        status: "COMPLETED",
        completedAt: { not: null },
        dueDate: { not: null },
        ...(rangeStart && rangeEnd ? { completedAt: { gte: rangeStart, lte: rangeEnd } } : {}),
      },
      select: { completedAt: true, dueDate: true },
    }),
    db.project.findMany({
      where: { organizationId: orgId, createdAt: { gte: trendMonths[0] } },
      select: { createdAt: true, completedAt: true, status: true },
      orderBy: { createdAt: "asc" },
    }),
    db.payment.findMany({
      where: {
        organizationId: orgId,
        status: "COMPLETED",
        paidAt: { gte: sevenDays[0] },
      },
      select: { amount: true, paidAt: true },
      orderBy: { paidAt: "asc" },
    }),
    db.payment.findMany({
      where: { organizationId: orgId },
      include: { invoice: { include: { contact: { include: { company: true } } } } },
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),
    db.invoice.findMany({
      where: { organizationId: orgId },
      include: { contact: { include: { company: true } } },
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),
    db.project.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true, status: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),
    db.project.findMany({
      where: { organizationId: orgId, status: { in: ["ACTIVE", "PLANNING"] } },
      select: { id: true, name: true, budget: true, status: true, customFields: true, updatedAt: true },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 6,
    }),
    db.invoice.findMany({
      where: { organizationId: orgId },
      include: { contact: { include: { company: true } } },
      orderBy: [{ issuedAt: "desc" }, { createdAt: "desc" }],
      take: 5,
    }),
    db.invoice.findMany({
      where: { organizationId: orgId, status: { in: OPEN_INVOICE_STATUSES } },
      include: { contact: { include: { company: true } } },
      orderBy: [{ amountDue: "desc" }, { dueDate: "asc" }],
      take: 5,
    }),
    db.contact.findMany({
      where: { organizationId: orgId, type: { in: ["LEAD", "PROSPECT"] } },
      include: { company: true },
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),
  ]);

  const totalRevenueValue = toNumber(totalRevenue._sum?.total);
  const totalPaidValue = toNumber(totalPaid._sum?.amount);
  const receivableValue = toNumber(receivable._sum?.amountDue);
  const monthlyRevenueValue = toNumber(monthlyRevenue._sum?.total);
  const paidThisMonthValue = toNumber(paidThisMonth._sum?.amount);
  const onTimeProjects = completedProjectsWithDeadline.filter(
    (project) => project.completedAt && project.dueDate && project.completedAt <= project.dueDate,
  ).length;
  const projectOnTimeRate = completedProjectsWithDeadline.length
    ? Math.round((onTimeProjects / completedProjectsWithDeadline.length) * 100)
    : null;
  const projectTrend = trendMonths.map((month) => {
    const key = format(month, "yyyy-MM");
    const created = projectTrendRows.filter((project) => format(project.createdAt, "yyyy-MM") === key).length;
    const completed = projectTrendRows.filter((project) => project.completedAt && format(project.completedAt, "yyyy-MM") === key).length;
    return {
      month: format(month, "MM/yyyy"),
      newProjects: created,
      completedProjects: completed,
      activeProjects: projectTrendRows.filter((project) => project.status === "ACTIVE" && format(project.createdAt, "yyyy-MM") === key).length,
    };
  });
  const projectDailyTrend = trendDays.map((day) => {
    const key = format(day, "yyyy-MM-dd");
    return {
      month: format(day, "dd/MM"),
      newProjects: projectTrendRows.filter((project) => format(project.createdAt, "yyyy-MM-dd") === key).length,
      completedProjects: projectTrendRows.filter((project) => project.completedAt && format(project.completedAt, "yyyy-MM-dd") === key).length,
      activeProjects: projectTrendRows.filter((project) => project.status === "ACTIVE" && format(project.createdAt, "yyyy-MM-dd") === key).length,
    };
  });

  const revenueSeries = sevenDays.map((day) => {
    const key = format(day, "yyyy-MM-dd");
    const total = paymentsLast7Days
      .filter((payment) => payment.paidAt && format(payment.paidAt, "yyyy-MM-dd") === key)
      .reduce((sum, payment) => sum + toNumber(payment.amount), 0);

    return {
      date: format(day, "dd/MM"),
      revenue: total,
    };
  });

  const activities = [
    ...recentPayments.map((payment) => ({
      id: `payment-${payment.id}`,
      type: "payment" as const,
      title: `${contactName(payment.invoice?.contact)} đã thanh toán`,
      subtitle: payment.invoice?.number ?? payment.reference ?? "Thanh toán",
      amount: toNumber(payment.amount),
      date: payment.paidAt ?? payment.updatedAt,
    })),
    ...recentInvoices.map((invoice) => ({
      id: `invoice-${invoice.id}`,
      type: "invoice" as const,
      title: `${invoice.number} được cập nhật`,
      subtitle: contactName(invoice.contact),
      amount: toNumber(invoice.total),
      date: invoice.updatedAt,
    })),
    ...recentProjects.map((project) => ({
      id: `project-${project.id}`,
      type: "project" as const,
      title: "Dự án được cập nhật",
      subtitle: project.name,
      amount: null,
      date: project.updatedAt,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  return {
    kpis: {
      customers: {
        value: customers,
        change: percentChange(customers, previousCustomers),
      },
      monthlyRevenue: {
        value: monthlyRevenueValue,
        change: percentChange(monthlyRevenueValue, toNumber(previousMonthlyRevenue._sum?.total)),
      },
      paidThisMonth: {
        value: paidThisMonthValue,
        change: percentChange(paidThisMonthValue, toNumber(paidPreviousMonth._sum?.amount)),
      },
      receivable: {
        value: receivableValue,
        change: percentChange(receivableValue, toNumber(previousReceivable._sum?.amountDue)),
      },
    },
    revenueSeries,
    taskTotal: totalTasks,
    taskStatus: taskStatus.map((item) => ({
      status: item.status,
      label:
        item.status === "DONE"
          ? "Hoàn thành"
          : item.status === "IN_PROGRESS"
            ? "Đang thực hiện"
            : item.status === "IN_REVIEW"
              ? "Đang duyệt"
              : item.status === "TODO"
                ? "Cần làm"
                : item.status,
      value: item._count._all,
    })),
    projectTrend,
    projectDailyTrend,
    projectOnTime: {
      rate: projectOnTimeRate,
      onTime: onTimeProjects,
      measured: completedProjectsWithDeadline.length,
    },
    projectStatus: projectStatus.map((item) => ({
      status: item.status,
      label:
        item.status === "COMPLETED"
          ? "Hoàn thành"
          : item.status === "ACTIVE"
            ? "Đang thực hiện"
            : item.status === "ON_HOLD"
              ? "Tạm dừng"
              : item.status === "PLANNING"
                ? "Chưa bắt đầu"
                : item.status,
      value: item._count._all,
    })),
    activities,
    activeProjects: activeProjects.map((project) => ({
      id: project.id,
      name: project.name,
      status: project.status,
      budget: toNumber(project.budget),
      updatedAt: project.updatedAt,
      progress: project.status === "ACTIVE" ? Math.max(1, progressFromCustomFields(project.customFields)) : 0,
    })),
    latestInvoices: latestInvoices.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      customer: contactName(invoice.contact),
      amount: toNumber(invoice.total),
      due: toNumber(invoice.amountDue),
      status: invoice.status,
      issuedAt: invoice.issuedAt ?? invoice.createdAt,
    })),
    receivables: receivableInvoices.map((invoice) => ({
      id: invoice.id,
      customer: contactName(invoice.contact),
      amount: toNumber(invoice.amountDue),
      dueDate: invoice.dueDate,
      updatedAt: invoice.updatedAt,
    })),
    potentialCustomers: potentialCustomers.map((contact) => ({
      id: contact.id,
      name: contactName(contact),
      company: contact.company?.name ?? contact.jobTitle ?? "Chưa có công ty",
      type: contact.type,
      updatedAt: contact.updatedAt,
    })),
    financeSummary: {
      totalRevenue: totalRevenueValue,
      totalPaid: totalPaidValue,
      receivable: receivableValue,
      remaining: Math.max(0, totalRevenueValue - totalPaidValue),
    },
  };
}

export async function getDashboardStats() {
  const dashboard = await getWorkspaceDashboard();

  return [
    {
      id: "revenue",
      label: "Doanh thu tháng này",
      value: dashboard.kpis.monthlyRevenue.value.toString(),
      change: dashboard.kpis.monthlyRevenue.change,
      trend: dashboard.kpis.monthlyRevenue.change >= 0 ? ("up" as const) : ("down" as const),
      color: "amber" as const,
    },
    {
      id: "contacts",
      label: "Khách hàng",
      value: dashboard.kpis.customers.value.toString(),
      change: dashboard.kpis.customers.change,
      trend: dashboard.kpis.customers.change >= 0 ? ("up" as const) : ("down" as const),
      color: "blue" as const,
    },
    {
      id: "invoices",
      label: "Công nợ phải thu",
      value: dashboard.kpis.receivable.value.toString(),
      change: dashboard.kpis.receivable.change,
      trend: dashboard.kpis.receivable.change >= 0 ? ("up" as const) : ("down" as const),
      color: "orange" as const,
    },
  ];
}
