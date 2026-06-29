import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { ContractDetailView } from "@/modules/finance/components/contract-detail";

export default async function ContractDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await requireAuth();

  const contract = await db.contract.findFirst({
    where: {
      id: params.id,
      organizationId: session.organizationId
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

  if (!contract) {
    return notFound();
  }

  const [activityLogs, previousDocument, nextDocument] = await Promise.all([
    db.activityLog.findMany({
      where: {
        organizationId: session.organizationId,
        entityId: contract.id,
        entity: { in: ["Contract", "contract", "Hợp đồng", "Hop dong"] },
      },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    db.contract.findFirst({
      where: { organizationId: session.organizationId, createdAt: { lt: contract.createdAt } },
      orderBy: { createdAt: "desc" },
      select: { id: true, number: true },
    }),
    db.contract.findFirst({
      where: { organizationId: session.organizationId, createdAt: { gt: contract.createdAt } },
      orderBy: { createdAt: "asc" },
      select: { id: true, number: true },
    }),
  ]);

  return (
    <ContractDetailView
      data={JSON.parse(JSON.stringify({ ...contract, activityLogs, previousDocument, nextDocument }))}
    />
  );
}
