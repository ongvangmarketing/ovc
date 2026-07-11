import { getTenantDb } from "@/lib/db";
import { notFound } from "next/navigation";
import { DealPublicViewClient } from "@/modules/crm/components/deal-public-view-client";
import { customerNameFromDeal, notifyDealCustomerEvent } from "@/lib/notifications/deals";

export const dynamic = 'force-dynamic';

export default async function PublicDealOptionsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  
  const deal = await getTenantDb().deal.findUnique({
    where: { id },
    include: {
      organization: { include: { settings: true } },
      contact: { include: { company: true } },
      company: true,
      serviceOptions: {
        include: {
          serviceOption: {
            include: {
              service: true
            }
          }
        }
      }
    }
  });

  if (!deal) return notFound();

  await notifyDealCustomerEvent({
    organizationId: deal.organizationId,
    dealId: deal.id,
    title: deal.title,
    assigneeId: deal.assigneeId,
    event: "viewed",
    customerName: customerNameFromDeal(deal),
    dedupeMinutes: 15,
    sendEmail: false,
  }).catch((error) => console.error("Không thể tạo thông báo khách mở deal", error));

  return <DealPublicViewClient data={JSON.parse(JSON.stringify(deal))} />;
}
