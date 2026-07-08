import { ContractFormClient } from "@/modules/finance/components/contract-form-client";
import { getNextContractNumber } from "@/app/actions/finance-crud";
import { db } from "@/lib/db";
import { getSettings } from "@/app/actions/settings";
import { requireAuth } from "@/lib/auth/require-auth";

export default async function CreateContractPage(props: { searchParams: Promise<{ quotationId?: string }> }) {
  const searchParams = await props.searchParams;
  const nextNumber = await getNextContractNumber();
  let initialData: any = { number: nextNumber };
  
  if (searchParams.quotationId) {
    const session = await requireAuth();
    const quotation = await db.quotation.findFirst({
      where: { id: searchParams.quotationId, organizationId: session.organizationId },
      include: { items: { orderBy: { order: 'asc' } } }
    });
    
    if (quotation) {
      initialData = {
        number: nextNumber,
        title: `Hợp đồng theo ${quotation.title}`,
        contactId: quotation.contactId,
        companyId: quotation.companyId,
        dealId: quotation.dealId,
        assigneeId: quotation.assigneeId,
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
          unit: i.unit || "",
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          total: Number(i.total),
          order: i.order
        }))
      };
    }
  }

  const settings = await getSettings();
  const paymentMethodsJson = (settings as any).payment_methods || null;
  return <ContractFormClient mode="create" initialData={initialData}  dynamicPaymentChannels={paymentMethodsJson} />;
}
