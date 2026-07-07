import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { notFound } from "next/navigation";
import { DealDetailClient } from "@/modules/crm/components/deal-detail-client";

export default async function DealDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  const params = await props.params;

  const deal = await db.deal.findUnique({
    where: { id: params.id, organizationId: session.organizationId },
    include: {
      contact: true,
      company: true,
      stage: true,
      serviceOptions: {
        include: {
          serviceOption: {
            include: {
              service: true
            }
          }
        },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!deal) notFound();

  const [activeServices, activityLogs, dealStages] = await Promise.all([
    db.service.findMany({
      where: { organizationId: session.organizationId, status: "ACTIVE" },
      include: {
        options: {
          where: { status: "ACTIVE" },
          orderBy: { sortOrder: "asc" }
        }
      },
      orderBy: { sortOrder: "asc" }
    }),
    db.activityLog.findMany({
      where: {
        organizationId: session.organizationId,
        entityId: deal.id,
        entity: { in: ["Deal", "deal", "Cơ hội"] }
      },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    db.dealStage.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { order: "asc" }
    })
  ]);

  return (
    <div className="quote-detail-page bg-gray-50 min-h-screen">
      <DealDetailClient 
        deal={JSON.parse(JSON.stringify({ ...deal, activityLogs, files: [] }))} 
        availableServices={JSON.parse(JSON.stringify(activeServices))} 
        stages={JSON.parse(JSON.stringify(dealStages))}
      />
    </div>
  );
}
