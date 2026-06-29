"use server";

import { db } from "@/lib/db";
import { assertLicensedModule } from "@/lib/modules/guards";
import { getOrganizationEntitlements, hasModule } from "@/lib/modules/entitlements";
import { encryptSocialToken } from "@/modules/social-marketing/security/token-crypto";

const requireProjectsSession = () => assertLicensedModule("PROJECTS");
import { revalidatePath } from "next/cache";
import { Prisma, ProjectStatus, Priority, TaskStatus } from "@prisma/client";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Có lỗi xảy ra";
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringArrayValue(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

function listFromText(value: string) {
  return Array.from(new Set(value.split(/[\s,;]+/).map((item) => item.trim()).filter(Boolean)));
}

function tokenEnvelopeExists(value: unknown) {
  const token = objectValue(value);
  return Boolean(token.ciphertext && token.iv && token.authTag);
}

async function getProjectFacebookAdReport(organizationId: string, projectId: string, customFields: unknown) {
  const fields = objectValue(customFields);
  const facebookReport = objectValue(fields.facebookReport);
  const enabledSources = objectValue(facebookReport.enabledSources);
  const adAccountExternalId = typeof facebookReport.adAccountExternalId === "string" ? facebookReport.adAccountExternalId : "";
  const adsEnabled = Boolean(enabledSources.ads ?? (adAccountExternalId || stringArrayValue(fields.facebookAdIds).length > 0 || stringArrayValue(facebookReport.campaignIds).length > 0));
  const adIds = adsEnabled ? stringArrayValue(fields.facebookAdIds) : [];
  if (!adIds.length) {
    return { adIds, totals: { spend: 0, reach: 0, impressions: 0, clicks: 0, leads: 0 }, ads: [] };
  }

  const dateFrom = new Date();
  dateFrom.setUTCDate(dateFrom.getUTCDate() - 29);
  dateFrom.setUTCHours(0, 0, 0, 0);

  const [insights, ads] = await Promise.all([
    db.socialInsight.findMany({
      where: {
        organizationId,
        provider: "FACEBOOK",
        entityType: "AD",
        ...(adIds.length ? { entityExternalId: { in: adIds } } : {}),
        ...(adAccountExternalId ? { adAccountExternalId } : {}),
        dateStart: { gte: dateFrom },
        deletedAt: null,
      },
      select: { spend: true, reach: true, impressions: true, clicks: true, leads: true },
    }),
    db.socialAd.findMany({
      where: { organizationId, provider: "FACEBOOK", externalId: { in: adIds }, deletedAt: null },
      select: { externalId: true, name: true, status: true },
    }),
  ]);

  const totals = insights.reduce((sum, row) => ({
    spend: sum.spend + Number(row.spend),
    reach: sum.reach + Number(row.reach),
    impressions: sum.impressions + Number(row.impressions),
    clicks: sum.clicks + Number(row.clicks),
    leads: sum.leads + Number(row.leads),
  }), { spend: 0, reach: 0, impressions: 0, clicks: 0, leads: 0 });

  return { adIds, totals, ads };
}

async function getProjectFacebookReport(organizationId: string, customFields: unknown) {
  const fields = objectValue(customFields);
  const facebookReport = objectValue(fields.facebookReport);
  const enabledSources = objectValue(facebookReport.enabledSources);
  const pageExternalId = typeof facebookReport.pageExternalId === "string" ? facebookReport.pageExternalId : "";
  const pageName = typeof facebookReport.pageName === "string" ? facebookReport.pageName : "";
  const adAccountExternalId = typeof facebookReport.adAccountExternalId === "string" ? facebookReport.adAccountExternalId : "";
  const adAccountName = typeof facebookReport.adAccountName === "string" ? facebookReport.adAccountName : "";
  const configuredAdIds = stringArrayValue(fields.facebookAdIds);
  const configuredCampaignIds = stringArrayValue(facebookReport.campaignIds);
  const pageEnabled = Boolean(enabledSources.page ?? pageExternalId);
  const adsEnabled = Boolean(enabledSources.ads ?? (adAccountExternalId || configuredAdIds.length > 0 || configuredCampaignIds.length > 0));
  const adIds = adsEnabled ? configuredAdIds : [];
  const campaignIds = adsEnabled ? configuredCampaignIds : [];
  const emptyTotals = { spend: 0, reach: 0, impressions: 0, clicks: 0, leads: 0, engagements: 0 };

  if (!pageEnabled && !adsEnabled) {
    return {
      pageEnabled,
      adsEnabled,
      pageExternalId,
      pageName,
      adAccountExternalId,
      adAccountName,
      adIds,
      campaignIds,
      pageTotals: emptyTotals,
      adsTotals: emptyTotals,
      posts: [],
      pageDaily: [],
      adsDaily: [],
      diagnostics: { pageInsightRows: 0, pagePostRows: 0, adInsightRows: 0 },
    };
  }

  const dateFrom = new Date();
  dateFrom.setUTCDate(dateFrom.getUTCDate() - 29);
  dateFrom.setUTCHours(0, 0, 0, 0);

  const [pageInsights, adInsights, posts] = await Promise.all([
    pageEnabled && pageExternalId ? db.socialInsight.findMany({
      where: { organizationId, provider: "FACEBOOK", entityType: "PAGE", entityExternalId: pageExternalId, dateStart: { gte: dateFrom }, deletedAt: null },
      orderBy: { dateStart: "asc" },
      select: { dateStart: true, reach: true, impressions: true, clicks: true, leads: true },
    }) : [],
    adsEnabled ? db.socialInsight.findMany({
      where: {
        organizationId,
        provider: "FACEBOOK",
        entityType: "AD",
        ...(adIds.length ? { entityExternalId: { in: adIds } } : {}),
        ...(adAccountExternalId ? { adAccountExternalId } : {}),
        dateStart: { gte: dateFrom },
        deletedAt: null,
      },
      orderBy: { dateStart: "asc" },
      select: { dateStart: true, spend: true, reach: true, impressions: true, clicks: true, leads: true },
    }) : [],
    pageEnabled && pageExternalId ? db.socialPost.findMany({
      where: { organizationId, provider: "FACEBOOK", pageExternalId, publishedAt: { gte: dateFrom }, deletedAt: null },
      select: { id: true, caption: true, permalinkUrl: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 5,
    }) : [],
  ]);

  const pageTotals = pageInsights.reduce((sum, row) => ({
    ...sum,
    reach: sum.reach + Number(row.reach),
    impressions: sum.impressions + Number(row.impressions),
    engagements: sum.engagements + Number(row.clicks),
    leads: sum.leads + Number(row.leads),
  }), emptyTotals);
  const adsTotals = adInsights.reduce((sum, row) => ({
    ...sum,
    spend: sum.spend + Number(row.spend),
    reach: sum.reach + Number(row.reach),
    impressions: sum.impressions + Number(row.impressions),
    clicks: sum.clicks + Number(row.clicks),
    leads: sum.leads + Number(row.leads),
  }), emptyTotals);

  const pageDaily = pageInsights.map((row) => ({
    date: row.dateStart.toISOString().slice(5, 10),
    reach: Number(row.reach),
    impressions: Number(row.impressions),
    engagements: Number(row.clicks),
    leads: Number(row.leads),
  }));
  const adsDaily = adInsights.map((row) => ({
    date: row.dateStart.toISOString().slice(5, 10),
    spend: Number(row.spend),
    reach: Number(row.reach),
    impressions: Number(row.impressions),
    clicks: Number(row.clicks),
    leads: Number(row.leads),
  }));

  return {
    pageEnabled,
    adsEnabled,
    pageExternalId,
    pageName,
    adAccountExternalId,
    adAccountName,
    adIds,
    campaignIds,
    pageTotals,
    adsTotals,
    posts,
    pageDaily,
    adsDaily,
    diagnostics: {
      pageInsightRows: pageInsights.length,
      pagePostRows: posts.length,
      adInsightRows: adInsights.length,
    },
  };
}

export async function getProjects() {
  const session = await requireProjectsSession();
  try {
    const projects = await db.project.findMany({
      where: { organizationId: session.organizationId, isArchived: false },
      include: {
        members: { include: { user: true } },
        _count: { select: { tasks: true } }
      },
      orderBy: { updatedAt: "desc" }
    });
    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function getProjectTasksDashboard() {
  const session = await requireProjectsSession();
  try {
    return db.task.findMany({
      where: {
        project: {
          organizationId: session.organizationId,
          isArchived: false,
        },
        parentId: null,
      },
      include: {
        project: { select: { id: true, name: true, color: true, status: true } },
        assignee: { select: { id: true, name: true, email: true, image: true } },
        subtasks: { select: { id: true, title: true, status: true }, orderBy: { order: "asc" } },
        comments: { select: { id: true }, take: 1 },
        attachments: { select: { id: true } },
      },
      orderBy: [
        { dueDate: "asc" },
        { updatedAt: "desc" },
      ],
    });
  } catch (error) {
    console.error("Error fetching project tasks dashboard:", error);
    return [];
  }
}

export async function getProjectById(id: string) {
  const session = await requireProjectsSession();
  try {
    const entitlements = await getOrganizationEntitlements(session.organizationId);
    const socialMarketingEnabled = hasModule(entitlements, "SOCIAL_MARKETING");
    const project = await db.project.findFirst({
      where: { id, organizationId: session.organizationId },
      include: {
        owner: true,
        members: { include: { user: true } },
        organization: {
          include: {
            members: { include: { user: true }, orderBy: { joinedAt: "desc" } },
          },
        },
        taskLists: { orderBy: { order: "asc" } },
        tasks: {
          include: {
            assignee: true,
            subtasks: { orderBy: { order: "asc" } },
            comments: { orderBy: { createdAt: "desc" }, take: 5 },
            attachments: true,
          },
          orderBy: { order: "asc" }
        }
      }
    });
    if (!project) return null;

    const customFields = objectValue(project.customFields);
    const facebookReport = objectValue(customFields.facebookReport);
    const pages = socialMarketingEnabled
      ? await db.socialProviderAsset.findMany({
        where: {
          organizationId: session.organizationId,
          provider: "FACEBOOK",
          assetType: "PAGE",
          deletedAt: null,
        },
        select: { id: true, externalId: true, name: true, avatarUrl: true, selected: true },
        orderBy: { name: "asc" },
      })
      : [];
    const adAccounts = socialMarketingEnabled
      ? await db.socialProviderAsset.findMany({
        where: {
          organizationId: session.organizationId,
          provider: "FACEBOOK",
          assetType: "AD_ACCOUNT",
          deletedAt: null,
        },
        select: { id: true, externalId: true, name: true, currency: true, timezone: true, selected: true },
        orderBy: { name: "asc" },
      })
      : [];
    const customerContacts = await db.contact.findMany({
      where: { organizationId: session.organizationId, status: "ACTIVE" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        source: true,
        company: { select: { name: true } },
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 200,
    });
    const uniqueCustomerContacts = Array.from(
      customerContacts.reduce((items, contact) => {
        const name = contact.company?.name || `${contact.firstName} ${contact.lastName}`.trim() || contact.email || "Khách hàng";
        const key = `${contact.email || ""}::${contact.company?.name || name}`.toLowerCase();
        const current = items.get(key);
        if (!current || current.source === "portal-seed") items.set(key, { ...contact, displayName: name });
        return items;
      }, new Map<string, (typeof customerContacts)[number] & { displayName: string }>()).values(),
    );

    return {
      ...project,
      portalVisible: customFields.portalVisible === true,
      availableMembers: project.organization.members.map((member) => ({
        userId: member.userId,
        role: member.role,
        user: member.user,
      })),
      customerContacts: uniqueCustomerContacts.map((contact) => ({
        id: contact.id,
        name: contact.displayName,
        email: contact.email,
      })),
      socialMarketingEnabled,
      facebookPages: pages,
      facebookAdAccounts: adAccounts,
      facebookReportSetup: socialMarketingEnabled ? {
        enabledSources: objectValue(facebookReport.enabledSources),
        pageExternalId: typeof facebookReport.pageExternalId === "string" ? facebookReport.pageExternalId : "",
        pageName: typeof facebookReport.pageName === "string" ? facebookReport.pageName : "",
        adAccountExternalId: typeof facebookReport.adAccountExternalId === "string" ? facebookReport.adAccountExternalId : "",
        adAccountName: typeof facebookReport.adAccountName === "string" ? facebookReport.adAccountName : "",
        pageTokenSaved: tokenEnvelopeExists(facebookReport.pageToken),
        adsTokenSaved: tokenEnvelopeExists(facebookReport.adsToken),
        campaignIds: stringArrayValue(facebookReport.campaignIds),
        adIds: stringArrayValue(customFields.facebookAdIds),
      } : null,
      facebookProjectReport: socialMarketingEnabled ? await getProjectFacebookReport(session.organizationId, project.customFields) : null,
      facebookAdReport: await getProjectFacebookAdReport(session.organizationId, project.id, project.customFields),
      organization: undefined,
    };
  } catch (error) {
    console.error("Error fetching project by id:", error);
    return null;
  }
}

export async function createProject(data: { name: string, description?: string, color?: string }) {
  const session = await requireProjectsSession();
  try {
    const project = await db.project.create({
      data: {
        organizationId: session.organizationId,
        ownerId: session.userId,
        name: data.name,
        description: data.description,
        color: data.color || "#3b82f6",
        // Default task lists for Kanban
        taskLists: {
          create: [
            { name: "To Do", order: 0, color: "#94a3b8" },
            { name: "In Progress", order: 1, color: "#3b82f6" },
            { name: "Review", order: 2, color: "#f59e0b" },
            { name: "Done", order: 3, color: "#10b981" },
          ]
        }
      }
    });
    
    // Add owner as a member
    await db.projectMember.create({
      data: {
        projectId: project.id,
        userId: session.userId,
        role: "OWNER" // Make sure this enum matches Prisma Schema
      }
    });
    
    revalidatePath("/workspace/projects");
    return { success: true, id: project.id };
  } catch (error: unknown) {
    console.error("Error creating project:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateProject(id: string, data: {
  name: string;
  description?: string;
  color?: string;
  status?: ProjectStatus;
  priority?: Priority;
  startDate?: string | null;
  dueDate?: string | null;
  budget?: string | number | null;
  ownerId?: string | null;
  contactId?: string | null;
  portalVisible?: boolean;
}) {
  const session = await requireProjectsSession();
  try {
    const project = await db.project.findFirst({
      where: { id, organizationId: session.organizationId },
      select: { id: true, customFields: true },
    });

    if (!project) {
      return { success: false, error: "Không tìm thấy dự án hoặc bạn không có quyền sửa." };
    }

    await db.project.update({
      where: { id: project.id },
      data: {
        name: data.name,
        description: data.description || null,
        color: data.color || "#F59E0B",
        status: data.status || "ACTIVE",
        priority: data.priority || "MEDIUM",
        startDate: data.startDate ? new Date(data.startDate) : null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        budget: data.budget ? String(data.budget) : null,
        ownerId: data.ownerId || undefined,
        contactId: data.contactId || null,
        customFields: {
          ...objectValue(project.customFields),
          portalVisible: Boolean(data.contactId && data.portalVisible),
        },
      },
    });

    revalidatePath("/workspace/projects");
    revalidatePath(`/workspace/projects/${id}`);
    revalidatePath(`/workspace/projects/${id}/edit`);
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating project:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function addProjectMember(projectId: string, userId: string, role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER" = "MEMBER") {
  const session = await requireProjectsSession();
  try {
    const project = await db.project.findFirst({
      where: { id: projectId, organizationId: session.organizationId },
      select: { id: true },
    });
    if (!project) {
      return { success: false, error: "Không tìm thấy dự án." };
    }

    const orgMember = await db.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: session.organizationId, userId } },
      select: { userId: true },
    });
    if (!orgMember) {
      return { success: false, error: "Người này chưa thuộc workspace." };
    }

    await db.projectMember.upsert({
      where: { projectId_userId: { projectId, userId } },
      update: { role },
      create: { projectId, userId, role },
    });

    revalidatePath(`/workspace/projects/${projectId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("Error adding project member:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateProjectOwner(projectId: string, ownerId: string) {
  const session = await requireProjectsSession();
  try {
    const result = await db.project.updateMany({
      where: { id: projectId, organizationId: session.organizationId },
      data: { ownerId },
    });
    if (!result.count) {
      return { success: false, error: "Không tìm thấy dự án." };
    }

    await db.projectMember.upsert({
      where: { projectId_userId: { projectId, userId: ownerId } },
      update: { role: "OWNER" },
      create: { projectId, userId: ownerId, role: "OWNER" },
    });

    revalidatePath(`/workspace/projects/${projectId}`);
    revalidatePath(`/workspace/projects/${projectId}/edit`);
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating project owner:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function removeProjectMember(projectId: string, userId: string) {
  const session = await requireProjectsSession();
  try {
    const project = await db.project.findFirst({
      where: { id: projectId, organizationId: session.organizationId },
      select: { id: true, ownerId: true },
    });
    if (!project) {
      return { success: false, error: "Không tìm thấy dự án." };
    }
    if (project.ownerId === userId) {
      return { success: false, error: "Không thể xóa người đang chịu trách nhiệm chính." };
    }

    await db.projectMember.deleteMany({
      where: { projectId, userId },
    });

    await db.task.updateMany({
      where: { projectId, assigneeId: userId },
      data: { assigneeId: null },
    });

    revalidatePath(`/workspace/projects/${projectId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("Error removing project member:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateProjectFacebookAds(projectId: string, adIdsText: string) {
  const session = await requireProjectsSession();
  try {
    const project = await db.project.findFirst({
      where: { id: projectId, organizationId: session.organizationId },
      select: { id: true, customFields: true },
    });
    if (!project) {
      return { success: false, error: "Không tìm thấy dự án." };
    }

    const adIds = adIdsText
      .split(/[\s,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    await db.project.update({
      where: { id: projectId },
      data: {
        customFields: {
          ...objectValue(project.customFields),
          facebookAdIds: Array.from(new Set(adIds)),
        },
      },
    });

    revalidatePath(`/workspace/projects/${projectId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating project Facebook Ads:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateProjectSocialReportSetup(projectId: string, data: {
  enablePage: boolean;
  enableAds: boolean;
  pageExternalId?: string;
  pageAccessToken?: string;
  adsAccessToken?: string;
  adAccountExternalId?: string;
  campaignIdsText?: string;
  adIdsText?: string;
}) {
  const session = await requireProjectsSession();
  try {
    const entitlements = await getOrganizationEntitlements(session.organizationId);
    if (!hasModule(entitlements, "SOCIAL_MARKETING")) {
      return { success: false, error: "Module Social Marketing chưa được kích hoạt." };
    }

    const project = await db.project.findFirst({
      where: { id: projectId, organizationId: session.organizationId },
      select: { id: true, customFields: true },
    });
    if (!project) {
      return { success: false, error: "Không tìm thấy dự án." };
    }

    const page = data.pageExternalId
      ? await db.socialProviderAsset.findFirst({
        where: {
          organizationId: session.organizationId,
          provider: "FACEBOOK",
          assetType: "PAGE",
          externalId: data.pageExternalId,
          deletedAt: null,
        },
        select: { externalId: true, name: true },
      })
      : null;
    const adAccount = data.adAccountExternalId
      ? await db.socialProviderAsset.findFirst({
        where: {
          organizationId: session.organizationId,
          provider: "FACEBOOK",
          assetType: "AD_ACCOUNT",
          externalId: data.adAccountExternalId,
          deletedAt: null,
        },
        select: { externalId: true, name: true },
      })
      : null;

    const fields = objectValue(project.customFields);
    const currentReport = objectValue(fields.facebookReport);
    const nextReport: Record<string, unknown> = {
      ...currentReport,
      enabledSources: {
        page: data.enablePage,
        ads: data.enableAds,
      },
      pageExternalId: data.enablePage ? (page?.externalId || data.pageExternalId || "") : "",
      pageName: data.enablePage ? (page?.name || "") : "",
      adAccountExternalId: data.enableAds ? (adAccount?.externalId || data.adAccountExternalId || "") : "",
      adAccountName: data.enableAds ? (adAccount?.name || "") : "",
      campaignIds: data.enableAds ? listFromText(data.campaignIdsText || "") : [],
      updatedAt: new Date().toISOString(),
    };

    if (data.pageAccessToken?.trim()) {
      nextReport.pageToken = encryptSocialToken(data.pageAccessToken.trim());
    } else if (!data.enablePage) {
      delete nextReport.pageToken;
    }

    if (data.adsAccessToken?.trim()) {
      nextReport.adsToken = encryptSocialToken(data.adsAccessToken.trim());
    } else if (!data.enableAds) {
      delete nextReport.adsToken;
    }

    await db.project.update({
      where: { id: projectId },
      data: {
        customFields: {
          ...fields,
          facebookAdIds: data.enableAds ? listFromText(data.adIdsText || "") : [],
          facebookReport: nextReport as Prisma.InputJsonObject,
        } satisfies Prisma.InputJsonObject,
      },
    });

    revalidatePath("/workspace/projects", "layout");
    revalidatePath(`/workspace/projects/${projectId}`);
    revalidatePath(`/workspace/projects/${projectId}/edit`);
    revalidatePath("/portal", "layout");
    revalidatePath("/portal/reports");
    return {
      success: true,
      setup: {
        enabledSources: nextReport.enabledSources,
        pageExternalId: nextReport.pageExternalId,
        pageName: nextReport.pageName,
        adAccountExternalId: nextReport.adAccountExternalId,
        adAccountName: nextReport.adAccountName,
        campaignIds: nextReport.campaignIds,
        adIds: data.enableAds ? listFromText(data.adIdsText || "") : [],
      },
    };
  } catch (error: unknown) {
    console.error("Error updating project social report setup:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function createTask(data: {
  projectId: string;
  title: string;
  description?: string;
  listId?: string;
  status?: TaskStatus;
  priority?: Priority;
  startDate?: string | null;
  dueDate?: string | null;
  assigneeId?: string | null;
  tags?: string[];
  followerIds?: string[];
  subtasks?: Array<{ title: string; done?: boolean }>;
  attachmentNames?: string[];
}) {
  const session = await requireProjectsSession();
  try {
    const task = await db.task.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        creatorId: session.userId,
        status: data.status || "TODO",
        priority: data.priority || "MEDIUM",
        startDate: data.startDate ? new Date(data.startDate) : null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assigneeId: data.assigneeId || null,
        tags: data.tags || [],
        customFields: {
          followerIds: data.followerIds || [],
          attachmentNames: data.attachmentNames || [],
        },
        taskListId: data.listId,
        order: Date.now(), // Simple ordering
        subtasks: data.subtasks?.length
          ? {
              create: data.subtasks.map((subtask, index) => ({
                projectId: data.projectId,
                title: subtask.title,
                creatorId: session.userId,
                status: subtask.done ? "DONE" : "TODO",
                priority: data.priority || "MEDIUM",
                order: index,
              })),
            }
          : undefined,
        comments: {
          create: {
            userId: session.userId,
            content: `Đã tạo phân công ở trạng thái ${data.status || "TODO"}`,
          },
        },
      },
      include: { assignee: true, subtasks: true, comments: true },
    });
    revalidatePath(`/workspace/projects/${data.projectId}`);
    return { success: true, task };
  } catch (error: unknown) {
    console.error("Error creating task:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateTaskDetails(taskId: string, projectId: string, data: {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  startDate?: string | null;
  dueDate?: string | null;
  assigneeId?: string | null;
  tags?: string[];
  followerIds?: string[];
  attachmentNames?: string[];
  subtasks?: Array<{ id?: string; title: string; done?: boolean }>;
}) {
  const session = await requireProjectsSession();
  try {
    const existing = await db.task.findFirst({
      where: { id: taskId, project: { organizationId: session.organizationId }, projectId },
      select: { id: true },
    });

    if (!existing) {
      return { success: false, error: "Không tìm thấy phân công." };
    }

    const task = await db.$transaction(async (tx) => {
      await tx.task.update({
        where: { id: taskId },
        data: {
          title: data.title,
          description: data.description || null,
          status: data.status || "TODO",
          priority: data.priority || "MEDIUM",
          startDate: data.startDate ? new Date(data.startDate) : null,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          assigneeId: data.assigneeId || null,
          tags: data.tags || [],
          customFields: {
            followerIds: data.followerIds || [],
            attachmentNames: data.attachmentNames || [],
          },
        },
      });

      for (const subtask of data.subtasks || []) {
        if (!subtask.title.trim()) continue;

        if (subtask.id) {
          await tx.task.updateMany({
            where: { id: subtask.id, parentId: taskId, projectId },
            data: { title: subtask.title.trim(), status: subtask.done ? "DONE" : "TODO" },
          });
        } else {
          await tx.task.create({
            data: {
              projectId,
              parentId: taskId,
              title: subtask.title.trim(),
              creatorId: session.userId,
              status: subtask.done ? "DONE" : "TODO",
              priority: data.priority || "MEDIUM",
              order: Date.now(),
            },
          });
        }
      }

      await tx.taskComment.create({
        data: {
          taskId,
          userId: session.userId,
          content: `Đã cập nhật phân công sang trạng thái ${data.status || "TODO"}`,
        },
      });

      return tx.task.findUnique({
        where: { id: taskId },
        include: {
          assignee: true,
          subtasks: { orderBy: { order: "asc" } },
          comments: { orderBy: { createdAt: "desc" }, take: 5 },
          attachments: true,
        },
      });
    });

    revalidatePath(`/workspace/projects/${projectId}`);
    return { success: true, task };
  } catch (error: unknown) {
    console.error("Error updating task details:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateTaskStatus(taskId: string, projectId: string, newStatus: TaskStatus, newListId?: string) {
  await requireProjectsSession();
  try {
    await db.task.update({
      where: { id: taskId },
      data: { 
        status: newStatus,
        taskListId: newListId || undefined
      }
    });
    revalidatePath(`/workspace/projects/${projectId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating task:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}
