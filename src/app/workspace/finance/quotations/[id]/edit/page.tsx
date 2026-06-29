import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { QuotationFormClient } from "@/modules/finance/components/quotation-form-client";

export default async function EditQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const quotation = await db.quotation.findUnique({
    where: { id },
    include: {
      items: true,
    }
  });

  if (!quotation) return notFound();

  return <QuotationFormClient mode="edit" initialData={JSON.parse(JSON.stringify(quotation))} />;
}
