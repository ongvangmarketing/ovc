import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { QuotationDetailView } from "@/modules/finance/components/quotation-detail";

export default async function QuotationDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await requireAuth();

  const quotation = await db.quotation.findUnique({
    where: { 
      id: params.id,
      organizationId: session.organizationId 
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

  if (!quotation) {
    return notFound();
  }

  const [activityLogs, previousDocument, nextDocument] = await Promise.all([
    db.activityLog.findMany({
      where: {
        organizationId: session.organizationId,
        entityId: quotation.id,
        entity: { in: ["Quotation", "quotation", "Báo giá", "Bao gia"] },
      },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    db.quotation.findFirst({
      where: { organizationId: session.organizationId, createdAt: { lt: quotation.createdAt } },
      orderBy: { createdAt: "desc" },
      select: { id: true, number: true },
    }),
    db.quotation.findFirst({
      where: { organizationId: session.organizationId, createdAt: { gt: quotation.createdAt } },
      orderBy: { createdAt: "asc" },
      select: { id: true, number: true },
    }),
  ]);

  return (
    <QuotationDetailView
      data={JSON.parse(JSON.stringify({ ...quotation, activityLogs, previousDocument, nextDocument }))}
    />
  );
}
