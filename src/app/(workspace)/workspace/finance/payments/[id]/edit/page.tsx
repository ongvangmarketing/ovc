import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { PaymentFormClient } from "@/modules/finance/components/payment-form-client";
import { getPaymentForEdit } from "@/modules/finance/services/payment.service";

export default async function EditPaymentPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await requireAuth();
  
  const data = await getPaymentForEdit(session.organizationId, params.id);
  const payment = data.payment;
  const invoices = data.invoices;

  if (!payment) return notFound();

  return <PaymentFormClient initialData={JSON.parse(JSON.stringify(payment))} invoices={JSON.parse(JSON.stringify(invoices))} />;
}
