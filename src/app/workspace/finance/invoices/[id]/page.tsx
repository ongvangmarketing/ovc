import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { InvoiceDetailView } from "@/modules/finance/components/invoice-detail";

export default async function InvoiceDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await requireAuth();

  const invoice = await db.invoice.findFirst({
    where: { id: params.id, organizationId: session.organizationId },
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

  if (!invoice) {
    return notFound();
  }

  const [activityLogs, previousDocument, nextDocument] = await Promise.all([
    db.activityLog.findMany({
      where: {
        organizationId: session.organizationId,
        entityId: invoice.id,
        entity: { in: ["Invoice", "invoice", "Hóa đơn", "Hoa don"] },
      },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    db.invoice.findFirst({
      where: { organizationId: session.organizationId, createdAt: { lt: invoice.createdAt } },
      orderBy: { createdAt: "desc" },
      select: { id: true, number: true },
    }),
    db.invoice.findFirst({
      where: { organizationId: session.organizationId, createdAt: { gt: invoice.createdAt } },
      orderBy: { createdAt: "asc" },
      select: { id: true, number: true },
    }),
  ]);

  return (
    <InvoiceDetailView
      data={JSON.parse(JSON.stringify({ ...invoice, activityLogs, previousDocument, nextDocument }))}
    />
  );
}
