import { InvoiceFormClient } from "@/modules/finance/components/invoice-form-client";
import { getNextInvoiceNumber } from "@/modules/finance/actions/finance.actions";
import { requireAuth } from "@/lib/auth/require-auth";
import { getSettings } from "@/actions/settings";
import { getInvoiceFormData } from "@/modules/finance/services/invoice.service";

export default async function CreateInvoicePage(props: {
  searchParams: Promise<{ contractId?: string; quotationId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const nextNumber = await getNextInvoiceNumber();
  const session = await requireAuth();
  
  const initialData = await getInvoiceFormData(session.organizationId, searchParams);

  const settings = await getSettings();
  const paymentMethodsJson = (settings as any).payment_methods || null;
  return <InvoiceFormClient mode="create" initialData={initialData} initialNumber={nextNumber} dynamicPaymentChannels={paymentMethodsJson} />;
}
