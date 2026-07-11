import { getTenantDb } from "@/lib/db";

export async function getQuotationDetailData(organizationId: string, quotationId: string) {
  const db = getTenantDb(organizationId);
  const quotation = await db.quotation.findUnique({
    where: { 
      id: quotationId,
      organizationId 
    },
    include: {
      items: { orderBy: { order: 'asc' } },
      contact: {
        include: { company: true }
      },
      deal: true,
      organization: true,
      creator: true
    }
  });

  if (!quotation) return null;

  const [activityLogs, previousDocument, nextDocument] = await Promise.all([
    db.activityLog.findMany({
      where: {
        organizationId,
        entityId: quotation.id,
        entity: { in: ["Quotation", "quotation", "Báo giá", "Bao gia"] },
      },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    db.quotation.findFirst({
      where: { organizationId, createdAt: { lt: quotation.createdAt } },
      orderBy: { createdAt: "desc" },
      select: { id: true, number: true },
    }),
    db.quotation.findFirst({
      where: { organizationId, createdAt: { gt: quotation.createdAt } },
      orderBy: { createdAt: "asc" },
      select: { id: true, number: true },
    }),
  ]);

  return { quotation, activityLogs, previousDocument, nextDocument };
}

export async function getQuotationForEdit(organizationId: string, quotationId: string) {
  const db = getTenantDb(organizationId);
  const quotation = await db.quotation.findUnique({
    where: { id: quotationId, organizationId },
    include: {
      items: true,
      company: true,
      contact: { include: { company: true } },
    }
  });

  if (!quotation) return null;

  const [initialCompanies, initialContacts] = await Promise.all([
    db.company.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        taxCode: true,
        representativeName: true,
        representativeTitle: true,
        email: true,
        phone: true,
        address: true,
        customFields: true,
      },
    }),
    db.contact.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        identityNumber: true,
        jobTitle: true,
        email: true,
        phone: true,
        address: true,
        customFields: true,
        company: {
          select: {
            id: true,
            name: true,
            taxCode: true,
            representativeName: true,
            representativeTitle: true,
            email: true,
            phone: true,
            address: true,
            customFields: true,
          },
        },
      },
    }),
  ]);

  return { quotation, initialCompanies, initialContacts };
}
