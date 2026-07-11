import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { InvoiceDetailView } from "@/modules/finance/components/invoice-detail";
import { getInvoiceDetailData } from "@/modules/finance/services/invoice.service";

export default async function InvoiceDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await requireAuth();

  const data = await getInvoiceDetailData(session.organizationId, params.id);

  if (!data) {
    return notFound();
  }

  const { invoice, activityLogs, previousDocument, nextDocument } = data;

  return (
    <InvoiceDetailView
      data={JSON.parse(JSON.stringify({ ...invoice, activityLogs, previousDocument, nextDocument }))}
    />
  );
}
