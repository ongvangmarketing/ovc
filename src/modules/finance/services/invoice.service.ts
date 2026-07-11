import { getTenantDb } from "@/lib/db";

export async function getInvoiceFormData(organizationId: string, searchParams: { contractId?: string; quotationId?: string }) {
  let initialData = undefined;
  const db = getTenantDb(organizationId);

  if (searchParams.contractId) {
    const contract = await db.contract.findFirst({
      where: { id: searchParams.contractId, organizationId },
      include: { items: { orderBy: { order: "asc" } } },
    });

    if (contract) {
      initialData = {
        title: `Hóa đơn theo hợp đồng ${contract.number}`,
        contactId: contract.contactId,
        companyId: contract.companyId,
        dealId: contract.dealId,
        assigneeId: contract.assigneeId,
        contractId: contract.id,
        currency: contract.currency,
        paymentChannels: contract.paymentChannels,
        customerSignatureRequired: contract.customerSignatureRequired,
        subtotal: Number(contract.subtotal),
        discount: Number(contract.discount),
        discountType: contract.discountType,
        tax: Number(contract.tax),
        total: Number(contract.total),
        notes: contract.notes || "",
        terms: contract.terms || "",
        items: contract.items.map((item) => ({
          name: item.name,
          description: item.description || "",
          unit: item.unit || "",
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discount: 0,
          tax: 0,
          total: Number(item.total),
          order: item.order,
        })),
      };
    }
  } else if (searchParams.quotationId) {
    const quotation = await db.quotation.findFirst({
      where: { id: searchParams.quotationId, organizationId },
      include: { items: { orderBy: { order: "asc" } } },
    });

    if (quotation) {
      initialData = {
        title: `Hóa đơn theo báo giá ${quotation.number}`,
        contactId: quotation.contactId,
        companyId: quotation.companyId,
        dealId: quotation.dealId,
        assigneeId: quotation.assigneeId,
        currency: quotation.currency,
        customerSignatureRequired: quotation.customerSignatureRequired,
        subtotal: Number(quotation.subtotal),
        discount: Number(quotation.discount),
        discountType: quotation.discountType,
        tax: Number(quotation.tax),
        taxRate: Number(quotation.taxRate),
        total: Number(quotation.total),
        notes: quotation.notes || "",
        terms: quotation.terms || "",
        items: quotation.items.map((item) => ({
          name: item.name,
          description: item.description || "",
          unit: item.unit || "",
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discount: Number(item.discount),
          tax: Number(item.tax),
          total: Number(item.total),
          order: item.order,
        })),
      };
    }
  }

  return initialData;
}

export async function getInvoiceDetailData(organizationId: string, invoiceId: string) {
  const db = getTenantDb(organizationId);
  const invoice = await db.invoice.findFirst({
    where: { id: invoiceId, organizationId },
    include: {
      items: { orderBy: { order: 'asc' } },
      payments: { orderBy: { createdAt: "desc" } },
      paymentInstallments: { include: { contract: true } },
      contact: { include: { company: true } },
      project: true,
      contract: true,
      creator: true,
      organization: true,
    }
  });

  if (!invoice) return null;

  const [activityLogs, previousDocument, nextDocument] = await Promise.all([
    db.activityLog.findMany({
      where: {
        organizationId,
        entityId: invoice.id,
        entity: { in: ["Invoice", "invoice", "Hóa đơn", "Hoa don"] },
      },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    db.invoice.findFirst({
      where: { organizationId, createdAt: { lt: invoice.createdAt } },
      orderBy: { createdAt: "desc" },
      select: { id: true, number: true },
    }),
    db.invoice.findFirst({
      where: { organizationId, createdAt: { gt: invoice.createdAt } },
      orderBy: { createdAt: "asc" },
      select: { id: true, number: true },
    }),
  ]);

  return { invoice, activityLogs, previousDocument, nextDocument };
}

export async function getInvoiceForEdit(organizationId: string, invoiceId: string) {
  const db = getTenantDb(organizationId);
  return db.invoice.findFirst({
    where: { id: invoiceId, organizationId },
    include: {
      items: { orderBy: { order: "asc" } },
      payments: { orderBy: { createdAt: "desc" } },
      contact: { include: { company: true } },
      project: true,
      contract: true,
    }
  });
}
