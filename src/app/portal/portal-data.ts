import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { getOrganizationEntitlements, hasModule } from "@/lib/modules/entitlements";

export function formatCurrency(value: unknown) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatDate(value?: Date | string | null) {
  if (!value) return "Chưa cập nhật";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    ACTIVE: "Đang triển khai",
    COMPLETED: "Hoàn thành",
    ON_HOLD: "Tạm dừng",
    PLANNING: "Lên kế hoạch",
    TODO: "Cần làm",
    IN_PROGRESS: "Đang làm",
    IN_REVIEW: "Đang duyệt",
    DONE: "Hoàn thành",
    DRAFT: "Bản nháp",
    SENT: "Đã gửi",
    ACCEPTED: "Đã chấp nhận",
    SIGNED: "Đã ký",
    PARTIAL: "Đặt cọc",
    PAID: "Đã thanh toán",
    OVERDUE: "Quá hạn",
    PENDING: "Đang chờ",
  };
  return labels[status] || status;
}

export function statusClass(status: string) {
  if (["DONE", "COMPLETED", "PAID", "SIGNED", "ACCEPTED"].includes(status)) return "text-emerald-700 bg-emerald-50";
  if (["IN_PROGRESS", "SENT", "PARTIAL", "ACTIVE"].includes(status)) return "text-blue-700 bg-blue-50";
  if (["OVERDUE", "CANCELLED", "FAILED"].includes(status)) return "text-red-700 bg-red-50";
  return "text-orange-700 bg-orange-50";
}

export function progressFromTasks(tasks: Array<{ status: string }>) {
  if (!tasks.length) return 0;
  return Math.round((tasks.filter((task) => task.status === "DONE").length / tasks.length) * 100);
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringArrayValue(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

export async function getCustomerPortalData() {
  const session = await requireAuth();

  if (session.user.role !== "CUSTOMER") {
    redirect("/workspace/dashboard");
  }

  const contactCandidates = await db.contact.findMany({
    where: {
      organizationId: session.organizationId,
      email: session.user.email,
      status: "ACTIVE",
    },
    include: { company: true },
    orderBy: { updatedAt: "desc" },
  });
  const realContacts = contactCandidates.filter((item) => item.source !== "portal-seed");
  const portalContacts = realContacts.length ? realContacts : contactCandidates;
  const contact = portalContacts[0] || null;

  if (!contact) {
    return { session, contact: null };
  }
  const contactIds = portalContacts.map((item) => item.id);

  const [entitlements, projects, quotations, contracts, invoices] = await Promise.all([
    getOrganizationEntitlements(session.organizationId),
    db.project.findMany({
      where: {
        organizationId: session.organizationId,
        OR: [
          { contactId: { in: contactIds } },
          { members: { some: { userId: session.user.id } } },
        ],
      },
      include: {
        owner: { select: { id: true, name: true, email: true, image: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true, image: true } } },
          orderBy: { joinedAt: "asc" },
        },
        tasks: { orderBy: [{ status: "asc" }, { dueDate: "asc" }] },
      },
      orderBy: { updatedAt: "desc" },
    }),
    db.quotation.findMany({
      where: { organizationId: session.organizationId, contactId: { in: contactIds } },
      include: { project: true },
      orderBy: { createdAt: "desc" },
    }),
    db.contract.findMany({
      where: { organizationId: session.organizationId, contactId: { in: contactIds } },
      include: { invoices: true },
      orderBy: { createdAt: "desc" },
    }),
    db.invoice.findMany({
      where: { organizationId: session.organizationId, contactId: { in: contactIds } },
      include: { payments: { orderBy: { paidAt: "desc" } }, project: true, contract: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const portalProjects = projects.filter((project) => objectValue(project.customFields).portalVisible === true);
  const portalProjectIds = new Set(portalProjects.map((project) => project.id));
  const tasks = portalProjects.flatMap((project) =>
    project.tasks.map((task) => ({ ...task, projectName: project.name })),
  );
  const customerName = contact.company?.name || `${contact.firstName} ${contact.lastName}`.trim() || session.user.name;
  const socialMarketingEnabled = hasModule(entitlements, "SOCIAL_MARKETING");
  const socialReports = socialMarketingEnabled ? await getPortalProjectSocialReports(session.organizationId, portalProjects) : [];
  const portalQuotations = quotations.filter((item) => !item.projectId || portalProjectIds.has(item.projectId));
  const portalInvoices = invoices.filter((item) => !item.projectId || portalProjectIds.has(item.projectId));
  const portalInvoiceIds = new Set(portalInvoices.map((invoice) => invoice.id));
  const portalContracts = contracts.filter((item) => item.invoices.some((invoice) => portalInvoiceIds.has(invoice.id)));
  const portalPayments = portalInvoices.flatMap((invoice) =>
    invoice.payments.map((payment) => ({ ...payment, invoice })),
  );
  const totalInvoiced = portalInvoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
  const totalPaid = portalInvoices.reduce((sum, invoice) => sum + Number(invoice.amountPaid || 0), 0);
  const totalDue = portalInvoices.reduce((sum, invoice) => sum + Number(invoice.amountDue || 0), 0);
  const activeProjects = portalProjects.filter((project) => ["ACTIVE", "PLANNING"].includes(project.status)).length;
  const openTasks = tasks.filter((task) => task.status !== "DONE").length;
  const paidPercent = totalInvoiced ? Math.round((totalPaid / totalInvoiced) * 100) : 0;

  return {
    session,
    contact,
    contacts: portalContacts,
    customerName,
    projects: portalProjects,
    tasks,
    quotations: portalQuotations,
    contracts: portalContracts,
    invoices: portalInvoices,
    payments: portalPayments,
    socialMarketingEnabled,
    socialReports,
    totals: {
      totalInvoiced,
      totalPaid,
      totalDue,
      activeProjects,
      openTasks,
      paidPercent,
    },
  };
}

async function getPortalProjectSocialReports(organizationId: string, projects: Array<{ id: string; name: string; customFields: unknown }>) {
  const reportConfigs = projects.map((project) => {
    const fields = objectValue(project.customFields);
    const facebookReport = objectValue(fields.facebookReport);
    const enabledSources = objectValue(facebookReport.enabledSources);
    const pageExternalId = typeof facebookReport.pageExternalId === "string" ? facebookReport.pageExternalId : "";
    const adAccountExternalId = typeof facebookReport.adAccountExternalId === "string" ? facebookReport.adAccountExternalId : "";
    const adIds = stringArrayValue(fields.facebookAdIds);
    const campaignIds = stringArrayValue(facebookReport.campaignIds);
    return {
      projectId: project.id,
      projectName: project.name,
      pageEnabled: Boolean(enabledSources.page ?? pageExternalId),
      adsEnabled: Boolean(enabledSources.ads ?? (adAccountExternalId || adIds.length || campaignIds.length)),
      pageExternalId,
      pageName: typeof facebookReport.pageName === "string" ? facebookReport.pageName : "",
      adAccountExternalId,
      adAccountName: typeof facebookReport.adAccountName === "string" ? facebookReport.adAccountName : "",
      adIds,
      campaignIds,
    };
  }).filter((config) => config.pageEnabled || config.adsEnabled);

  if (!reportConfigs.length) return [];

  const dateFrom = new Date();
  dateFrom.setUTCDate(dateFrom.getUTCDate() - 29);
  dateFrom.setUTCHours(0, 0, 0, 0);

  const pageIds = reportConfigs.map((item) => item.pageExternalId).filter(Boolean);
  const adIds = reportConfigs.flatMap((item) => item.adIds);
  const adAccountIds = reportConfigs.map((item) => item.adAccountExternalId).filter(Boolean);

  const [pageInsights, adInsights, posts] = await Promise.all([
    pageIds.length ? db.socialInsight.findMany({
      where: {
        organizationId,
        provider: "FACEBOOK",
        entityType: "PAGE",
        entityExternalId: { in: pageIds },
        dateStart: { gte: dateFrom },
        deletedAt: null,
      },
      select: { entityExternalId: true, dateStart: true, impressions: true, reach: true, clicks: true, leads: true },
    }) : [],
    (adIds.length || adAccountIds.length) ? db.socialInsight.findMany({
      where: {
        organizationId,
        provider: "FACEBOOK",
        entityType: "AD",
        OR: [
          ...(adIds.length ? [{ entityExternalId: { in: adIds } }] : []),
          ...(adAccountIds.length ? [{ adAccountExternalId: { in: adAccountIds } }] : []),
        ],
        dateStart: { gte: dateFrom },
        deletedAt: null,
      },
      select: { entityExternalId: true, adAccountExternalId: true, dateStart: true, spend: true, impressions: true, reach: true, clicks: true, leads: true },
    }) : [],
    pageIds.length ? db.socialPost.findMany({
      where: {
        organizationId,
        provider: "FACEBOOK",
        pageExternalId: { in: pageIds },
        publishedAt: { gte: dateFrom },
        deletedAt: null,
      },
      select: { pageExternalId: true, caption: true, permalinkUrl: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 12,
    }) : [],
  ]);

  return reportConfigs.map((config) => {
    const pageRows = pageInsights.filter((row) => row.entityExternalId === config.pageExternalId);
    const adRows = adInsights.filter((row) => (
      config.adIds.length ? config.adIds.includes(row.entityExternalId) : row.adAccountExternalId === config.adAccountExternalId
    ));
    const pageTotals = pageRows.reduce((sum, row) => ({
      reach: sum.reach + Number(row.reach),
      impressions: sum.impressions + Number(row.impressions),
      engagements: sum.engagements + Number(row.clicks),
      leads: sum.leads + Number(row.leads),
    }), { reach: 0, impressions: 0, engagements: 0, leads: 0 });
    const adsTotals = adRows.reduce((sum, row) => ({
      spend: sum.spend + Number(row.spend),
      reach: sum.reach + Number(row.reach),
      impressions: sum.impressions + Number(row.impressions),
      clicks: sum.clicks + Number(row.clicks),
      leads: sum.leads + Number(row.leads),
    }), { spend: 0, reach: 0, impressions: 0, clicks: 0, leads: 0 });
    const pageDaily = Array.from(pageRows.reduce((items, row) => {
      const key = row.dateStart.toISOString().slice(5, 10);
      const current = items.get(key) || { date: key, reach: 0, impressions: 0, engagements: 0, leads: 0 };
      current.reach += Number(row.reach);
      current.impressions += Number(row.impressions);
      current.engagements += Number(row.clicks);
      current.leads += Number(row.leads);
      items.set(key, current);
      return items;
    }, new Map<string, { date: string; reach: number; impressions: number; engagements: number; leads: number }>()).values());
    const adsDaily = Array.from(adRows.reduce((items, row) => {
      const key = row.dateStart.toISOString().slice(5, 10);
      const current = items.get(key) || { date: key, spend: 0, reach: 0, impressions: 0, clicks: 0, leads: 0 };
      current.spend += Number(row.spend);
      current.reach += Number(row.reach);
      current.impressions += Number(row.impressions);
      current.clicks += Number(row.clicks);
      current.leads += Number(row.leads);
      items.set(key, current);
      return items;
    }, new Map<string, { date: string; spend: number; reach: number; impressions: number; clicks: number; leads: number }>()).values());

    return {
      ...config,
      pageTotals,
      adsTotals,
      pageDaily,
      adsDaily,
      posts: posts.filter((post) => post.pageExternalId === config.pageExternalId).slice(0, 3),
    };
  });
}
