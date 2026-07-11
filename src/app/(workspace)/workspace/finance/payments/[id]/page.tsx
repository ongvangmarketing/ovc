import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { PaymentDetailView } from "@/modules/finance/components/payment-detail";
import { getPaymentDetailData } from "@/modules/finance/services/payment.service";

export default async function PaymentDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await requireAuth();
  
  const payment = await getPaymentDetailData(session.organizationId, params.id);

  if (!payment) return notFound();

  return <PaymentDetailView data={JSON.parse(JSON.stringify(payment))} />;
}
