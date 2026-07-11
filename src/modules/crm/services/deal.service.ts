import { getTenantDb } from "@/lib/db";

export async function getDealById(organizationId: string, id: string) {
  return getTenantDb().deal.findUnique({
    where: { id, organizationId },
    include: {
      serviceOptions: {
        include: {
          serviceOption: {
            include: { service: true },
          },
        },
      },
    },
  });
}

export async function getDealFormData(organizationId: string) {
  const [companies, contacts, availableServices, stages, users] = await Promise.all([
    getTenantDb().company.findMany({
      where: { organizationId },
      select: { id: true, name: true },
    }),
    getTenantDb().contact.findMany({
      where: { organizationId },
      select: { id: true, firstName: true, lastName: true, email: true, phone: true },
    }),
    getTenantDb().service.findMany({
      where: { organizationId, status: "ACTIVE" },
      include: {
        options: {
          where: { status: "ACTIVE" },
        },
      },
    }),
    getTenantDb().dealStage.findMany({
      where: { organizationId },
      orderBy: { order: "asc" },
    }),
    getTenantDb().user.findMany({
      where: { organizationMembers: { some: { organizationId } } },
      select: { id: true, name: true, email: true },
    }),
  ]);

  return { companies, contacts, availableServices, stages, users };
}

export async function getDealDetailData(organizationId: string, dealId: string) {
  const deal = await getTenantDb().deal.findUnique({
    where: { id: dealId, organizationId },
    include: {
      contact: true,
      company: true,
      stage: true,
      serviceOptions: {
        include: {
          serviceOption: {
            include: {
              service: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!deal) return null;

  const [activeServices, activityLogs, dealStages] = await Promise.all([
    getTenantDb().service.findMany({
      where: { organizationId, status: "ACTIVE" },
      include: {
        options: {
          where: { status: "ACTIVE" },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    }),
    getTenantDb().activityLog.findMany({
      where: {
        organizationId,
        entityId: deal.id,
        entity: { in: ["Deal", "deal", "Cơ hội"] },
      },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    getTenantDb().dealStage.findMany({
      where: { organizationId },
      orderBy: { order: "asc" },
    }),
  ]);

  return { deal, activeServices, activityLogs, dealStages };
}
