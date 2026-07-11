import { requireAuth } from "@/lib/auth/require-auth";
import { notFound } from "next/navigation";
import { DealDetailClient } from "@/modules/crm/components/deal-detail-client";
import { getDealDetailData } from "@/modules/crm/services/deal.service";

export default async function DealDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  const params = await props.params;

  const data = await getDealDetailData(session.organizationId, params.id);
  if (!data) notFound();

  const { deal, activeServices, activityLogs, dealStages } = data;

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans pb-20 animate-in fade-in duration-300">
      <DealDetailClient 
        deal={JSON.parse(JSON.stringify({ ...deal, activityLogs, files: [] }))} 
        availableServices={JSON.parse(JSON.stringify(activeServices))} 
        stages={JSON.parse(JSON.stringify(dealStages))}
      />
    </div>
  );
}
