import { getSettings } from "@/actions/settings";
import { requireAuth } from "@/lib/auth/require-auth";
import { notFound } from "next/navigation";
import { InvoiceFormClient } from "@/modules/finance/components/invoice-form-client";
import { getInvoiceForEdit } from "@/modules/finance/services/invoice.service";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAuth();
  
  const invoice = await getInvoiceForEdit(session.organizationId, id);

  if (!invoice) return notFound();

  const settings = await getSettings();
  const paymentMethodsJson = (settings as any).payment_methods || null;
  return <InvoiceFormClient mode="edit" initialData={JSON.parse(JSON.stringify(invoice))} dynamicPaymentChannels={paymentMethodsJson} />;
}
