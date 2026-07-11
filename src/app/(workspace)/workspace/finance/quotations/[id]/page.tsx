import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { QuotationDetailView } from "@/modules/finance/components/quotation-detail";
import { getQuotationDetailData } from "@/modules/finance/services/quotation.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function QuotationDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await requireAuth();

  const data = await getQuotationDetailData(session.organizationId, params.id);
  
  if (!data) {
    return notFound();
  }

  const { quotation, activityLogs, previousDocument, nextDocument } = data;

  return (
    <QuotationDetailView
      data={JSON.parse(JSON.stringify({ ...quotation, activityLogs, previousDocument, nextDocument }))}
    />
  );
}
