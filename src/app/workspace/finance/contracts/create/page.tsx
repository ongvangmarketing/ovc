import { ContractFormClient } from "@/modules/finance/components/contract-form-client";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";

export default async function CreateContractPage(props: { searchParams: Promise<{ quotationId?: string }> }) {
  const searchParams = await props.searchParams;
  let initialData = undefined;
  
  if (searchParams.quotationId) {
    const session = await requireAuth();
    const quotation = await db.quotation.findFirst({
      where: { id: searchParams.quotationId, organizationId: session.organizationId },
      include: { items: { orderBy: { order: 'asc' } } }
    });
    
    if (quotation) {
      initialData = {
        title: `Hợp đồng theo ${quotation.title}`,
        contactId: quotation.contactId,
        dealId: quotation.dealId,
        currency: quotation.currency,
        subtotal: Number(quotation.subtotal),
        discount: Number(quotation.discount),
        discountType: quotation.discountType,
        tax: Number(quotation.tax),
        total: Number(quotation.total),
        notes: quotation.notes || "",
        terms: quotation.terms || "",
        validUntil: quotation.validUntil,
        quotationId: quotation.id, // Pass to client to link later
        items: quotation.items.map(i => ({
          name: i.name,
          description: i.description || "",
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          total: Number(i.total),
          order: i.order
        }))
      };
    }
  }

  return <ContractFormClient mode="create" initialData={initialData} />;
}
