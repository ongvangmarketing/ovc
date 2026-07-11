import { getSettings } from "@/actions/settings";
import {  getNextQuotationNumber  } from "@/modules/finance/actions/finance.actions";
import { QuotationFormClient } from "@/modules/finance/components/quotation-form-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CreateQuotationPage() {
  const nextNumber = await getNextQuotationNumber();
  const settings = await getSettings();
  const paymentMethodsJson = (settings as any).payment_methods || null;
  return <QuotationFormClient mode="create" initialNumber={nextNumber}  dynamicPaymentChannels={paymentMethodsJson} />;
}
