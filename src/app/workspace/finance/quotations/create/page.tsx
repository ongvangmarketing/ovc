import { getSettings } from "@/app/actions/settings";
import { getNextQuotationNumber } from "@/app/actions/finance-crud";
import { QuotationFormClient } from "@/modules/finance/components/quotation-form-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CreateQuotationPage() {
  const nextNumber = await getNextQuotationNumber();
  const settings = await getSettings();
  const paymentMethodsJson = (settings as any).payment_methods || null;
  return <QuotationFormClient mode="create" initialNumber={nextNumber}  dynamicPaymentChannels={paymentMethodsJson} />;
}
