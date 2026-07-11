import {  getPayments  } from "@/modules/finance/actions/finance.actions";
import { PaymentsClient } from "@/modules/finance/components/payments-client";

export default async function PaymentsPage() {
  const payments = await getPayments();
  return <PaymentsClient initialData={payments} />;
}
