import { getPayments } from "@/app/actions/finance";
import { PaymentsClient } from "@/modules/finance/components/payments-client";

export default async function PaymentsPage() {
  const payments = await getPayments();
  return <PaymentsClient initialData={payments} />;
}
