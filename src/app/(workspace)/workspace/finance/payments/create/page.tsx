import { requireAuth } from "@/lib/auth/require-auth";
import { PaymentFormClient } from "@/modules/finance/components/payment-form-client";
import { getNextReceiptNumber } from "@/modules/finance/actions/finance.actions";
import { getPaymentFormData } from "@/modules/finance/services/payment.service";

export default async function CreatePaymentPage(props: { searchParams: Promise<{ invoiceId?: string }> }) {
  const searchParams = await props.searchParams;
  const session = await requireAuth();
  const nextNumber = await getNextReceiptNumber();
  
  const { invoices } = await getPaymentFormData(session.organizationId);
  
  const selectedInvoices = searchParams.invoiceId
    ? [...invoices].sort((a, b) => Number(b.id === searchParams.invoiceId) - Number(a.id === searchParams.invoiceId))
    : invoices;

  return <PaymentFormClient invoices={JSON.parse(JSON.stringify(selectedInvoices))} initialNumber={nextNumber} />;
}
