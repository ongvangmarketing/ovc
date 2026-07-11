import { getTenantDb } from "@/lib/db";

export class CrmDashboardRepository {
  static async getAIContext(orgId: string, now: Date) {
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const nextDayStart = new Date(tomorrowStart);
    nextDayStart.setDate(nextDayStart.getDate() + 1);
    const staleThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [contactsWithFollowUps, staleContacts, closingDeals] = await Promise.all([
      getTenantDb(orgId).contact.findMany({
        where: {
          organizationId: orgId,
          activities: {
            some: {
              completedAt: null,
              dueAt: { gte: todayStart, lt: nextDayStart },
            },
          },
        },
        take: 50,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          type: true,
          priority: true,
          assignee: { select: { id: true, name: true } },
          activities: {
            where: {
              completedAt: null,
              dueAt: { gte: todayStart, lt: nextDayStart },
            },
            orderBy: { dueAt: "asc" },
            select: {
              id: true,
              type: true,
              subject: true,
              dueAt: true,
            },
          },
        },
      }),
      getTenantDb(orgId).contact.findMany({
        where: {
          organizationId: orgId,
          status: "ACTIVE",
          OR: [{ lastContactAt: null }, { lastContactAt: { lt: staleThreshold } }],
        },
        orderBy: [{ priority: "desc" }, { updatedAt: "asc" }],
        take: 30,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          type: true,
          priority: true,
          lastContactAt: true,
          assignee: { select: { id: true, name: true } },
        },
      }),
      getTenantDb(orgId).deal.findMany({
        where: { organizationId: orgId, status: "OPEN", expectedClose: { gte: todayStart, lt: nextDayStart } },
        orderBy: { expectedClose: "asc" },
        take: 30,
        select: {
          id: true,
          title: true,
          value: true,
          expectedClose: true,
          contact: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
    ]);
    const followUps = contactsWithFollowUps
      .flatMap((contact) =>
        contact.activities.map((activity) => ({
          ...activity,
          contact: {
            id: contact.id,
            firstName: contact.firstName,
            lastName: contact.lastName,
            type: contact.type,
            priority: contact.priority,
            assignee: contact.assignee,
          },
        })),
      )
      .sort((a, b) => (a.dueAt?.getTime() ?? 0) - (b.dueAt?.getTime() ?? 0))
      .slice(0, 50);

    return {
      timezone: "Asia/Ho_Chi_Minh",
      today: todayStart.toISOString(),
      tomorrow: tomorrowStart.toISOString(),
      summary: {
        followUpsToday: followUps.filter((item) => item.dueAt && item.dueAt < tomorrowStart).length,
        followUpsTomorrow: followUps.filter((item) => item.dueAt && item.dueAt >= tomorrowStart).length,
        staleContacts: staleContacts.length,
        dealsClosingWithinTwoDays: closingDeals.length,
      },
      followUps,
      staleContacts,
      closingDeals,
    };
  }

  static async getDashboardCounts(orgId: string, thirtyDaysAgo: Date, sixtyDaysAgo: Date) {
    return await Promise.all([
      getTenantDb().contact.count({ where: { organizationId: orgId, type: "CUSTOMER" } }),
      getTenantDb().contact.count({ where: { organizationId: orgId, type: "LEAD" } }),
      getTenantDb().deal.count({ where: { organizationId: orgId, status: "OPEN" } }),
      getTenantDb().deal.aggregate({
        where: { organizationId: orgId, status: "OPEN" },
        _sum: { value: true }
      }),
      
      getTenantDb().contact.count({ where: { organizationId: orgId, type: "CUSTOMER", createdAt: { lt: thirtyDaysAgo } } }),
      getTenantDb().contact.count({ where: { organizationId: orgId, type: "LEAD", createdAt: { lt: thirtyDaysAgo } } }),
      getTenantDb().deal.count({ where: { organizationId: orgId, status: "OPEN", createdAt: { lt: thirtyDaysAgo } } }),
      getTenantDb().deal.aggregate({
        where: { organizationId: orgId, status: "OPEN", createdAt: { lt: thirtyDaysAgo } },
        _sum: { value: true }
      }),
      
      getTenantDb().deal.count({ where: { organizationId: orgId, status: "WON" } }),
      getTenantDb().deal.count({ where: { organizationId: orgId } }),
      getTenantDb().deal.aggregate({
        where: { organizationId: orgId, status: "WON", createdAt: { gte: thirtyDaysAgo } },
        _sum: { value: true }
      }),
      getTenantDb().deal.aggregate({
        where: { organizationId: orgId, status: "WON", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        _sum: { value: true }
      })
    ]);
  }

  static async getDashboardLists(orgId: string, now: Date) {
    return await Promise.all([
      getTenantDb().deal.findMany({
        where: { 
          organizationId: orgId, 
          status: "OPEN",
          expectedClose: { not: null, gte: now }
        },
        orderBy: { expectedClose: "asc" },
        take: 4,
        include: { contact: true, company: true }
      }),
      getTenantDb().deal.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
        take: 12,
        include: { contact: true, company: true }
      }),
      getTenantDb().contactActivity.findMany({
        where: { contact: { organizationId: orgId } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { contact: true }
      })
    ]);
  }
}
