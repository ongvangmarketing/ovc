import { getTenantDb } from "@/lib/db";

export async function getContractFormData(organizationId: string, searchParams: { quotationId?: string }) {
  let initialData: any = undefined;
  const db = getTenantDb(organizationId);

  if (searchParams.quotationId) {
    const quotation = await db.quotation.findFirst({
      where: { id: searchParams.quotationId, organizationId },
      include: { items: { orderBy: { order: 'asc' } } }
    });
    
    if (quotation) {
      initialData = {
        title: `Hợp đồng theo ${quotation.title}`,
        contactId: quotation.contactId,
        companyId: quotation.companyId,
        dealId: quotation.dealId,
        assigneeId: quotation.assigneeId,
        currency: quotation.currency,
        subtotal: Number(quotation.subtotal),
        discount: Number(quotation.discount),
        discountType: quotation.discountType,
        tax: Number(quotation.tax),
        total: Number(quotation.total),
        notes: quotation.notes || "",
        terms: quotation.terms || "",
        validUntil: quotation.validUntil,
        quotationId: quotation.id, // Pass to client to link later
        items: quotation.items.map((i: any) => ({
          name: i.name,
          description: i.description || "",
          unit: i.unit || "",
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          total: Number(i.total),
          order: i.order
        }))
      };
    }
  }

  return initialData;
}

export async function getContractDetailData(organizationId: string, contractId: string) {
  const db = getTenantDb(organizationId);
  const contract = await db.contract.findFirst({
    where: {
      id: contractId,
      organizationId
    },
    include: {
      items: { orderBy: { order: 'asc' } },
      paymentInstallments: { 
        orderBy: { dueDate: 'asc' },
        include: { invoice: true }
      },
      contact: {
        include: { company: true }
      },
      deal: true,
      creator: true,
      organization: true
    }
  });

  if (!contract) return null;

  const [activityLogs, previousDocument, nextDocument] = await Promise.all([
    db.activityLog.findMany({
      where: {
        organizationId,
        entityId: contract.id,
        entity: { in: ["Contract", "contract", "Hợp đồng", "Hop dong"] },
      },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    db.contract.findFirst({
      where: { organizationId, createdAt: { lt: contract.createdAt } },
      orderBy: { createdAt: "desc" },
      select: { id: true, number: true },
    }),
    db.contract.findFirst({
      where: { organizationId, createdAt: { gt: contract.createdAt } },
      orderBy: { createdAt: "asc" },
      select: { id: true, number: true },
    }),
  ]);

  return { contract, activityLogs, previousDocument, nextDocument };
}

export async function getContractForEdit(organizationId: string, contractId: string) {
  const db = getTenantDb(organizationId);
  return db.contract.findFirst({
    where: { id: contractId, organizationId },
    include: {
      items: { orderBy: { order: "asc" } },
      paymentInstallments: { 
        orderBy: { dueDate: "asc" },
        include: { invoice: true }
      },
      contact: { include: { company: true } },
      deal: true,
    }
  });
}
