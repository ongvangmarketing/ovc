import { getTenantDb } from "@/lib/db";

export async function getPaymentDetailData(organizationId: string, paymentId: string) {
  const db = getTenantDb(organizationId);
  return db.payment.findFirst({
    where: { id: paymentId, organizationId },
    include: {
      invoice: {
        include: {
          contact: { include: { company: true } },
          contract: true,
        },
      },
    },
  });
}

export async function getPaymentFormData(organizationId: string) {
  const db = getTenantDb(organizationId);
  const invoices = await db.invoice.findMany({
    where: { organizationId },
    include: { contact: { include: { company: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return { invoices };
}

export async function getPaymentForEdit(organizationId: string, paymentId: string) {
  const db = getTenantDb(organizationId);
  const [payment, invoices] = await Promise.all([
    db.payment.findFirst({
      where: { id: paymentId, organizationId },
    }),
    db.invoice.findMany({
      where: { organizationId },
      include: { contact: { include: { company: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return { payment, invoices };
}

export async function getPaymentReceiptData(organizationId: string, paymentId: string) {
  const db = getTenantDb(organizationId);
  return db.payment.findFirst({
    where: { id: paymentId, organizationId },
    include: {
      organization: { include: { settings: true } },
      invoice: {
        include: {
          contact: { include: { company: true } },
          payments: true,
        },
      },
    },
  });
}

export async function getPaymentPdfData(organizationId: string, paymentId: string) {
  const db = getTenantDb(organizationId);
  return db.payment.findFirst({
    where: { id: paymentId, organizationId },
    select: { id: true, number: true, reference: true },
  });
}
