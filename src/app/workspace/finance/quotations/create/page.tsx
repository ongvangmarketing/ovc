import { getNextQuotationNumber } from "@/app/actions/finance-crud";
import { QuotationFormClient } from "@/modules/finance/components/quotation-form-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CreateQuotationPage() {
  const nextNumber = await getNextQuotationNumber();
  return <QuotationFormClient mode="create" initialNumber={nextNumber} />;
}
