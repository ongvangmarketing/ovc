import { InvoiceFormClient } from "@/modules/finance/components/invoice-form-client";
import { getNextInvoiceNumber } from "@/app/actions/finance-crud";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { getSettings } from "@/app/actions/settings";

export default async function CreateInvoicePage(props: {
  searchParams: Promise<{ contractId?: string; quotationId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const nextNumber = await getNextInvoiceNumber();
  const session = await requireAuth();
  let initialData;

  if (searchParams.contractId) {
    const contract = await db.contract.findFirst({
      where: { id: searchParams.contractId, organizationId: session.organizationId },
      include: { items: { orderBy: { order: "asc" } } },
    });

    if (contract) {
      initialData = {
        title: `Hóa đơn theo hợp đồng ${contract.number}`,
        contactId: contract.contactId,
        companyId: contract.companyId,
        dealId: contract.dealId,
        assigneeId: contract.assigneeId,
        contractId: contract.id,
        currency: contract.currency,
        paymentChannels: contract.paymentChannels,
        customerSignatureRequired: contract.customerSignatureRequired,
        subtotal: Number(contract.subtotal),
        discount: Number(contract.discount),
        discountType: contract.discountType,
        tax: Number(contract.tax),
        total: Number(contract.total),
        notes: contract.notes || "",
        terms: contract.terms || "",
        items: contract.items.map((item) => ({
          name: item.name,
          description: item.description || "",
          unit: item.unit || "",
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discount: 0,
          tax: 0,
          total: Number(item.total),
          order: item.order,
        })),
      };
    }
  } else if (searchParams.quotationId) {
    const quotation = await db.quotation.findFirst({
      where: { id: searchParams.quotationId, organizationId: session.organizationId },
      include: { items: { orderBy: { order: "asc" } } },
    });

    if (quotation) {
      initialData = {
        title: `Hóa đơn theo báo giá ${quotation.number}`,
        contactId: quotation.contactId,
        companyId: quotation.companyId,
        dealId: quotation.dealId,
        assigneeId: quotation.assigneeId,
        currency: quotation.currency,
        customerSignatureRequired: quotation.customerSignatureRequired,
        subtotal: Number(quotation.subtotal),
        discount: Number(quotation.discount),
        discountType: quotation.discountType,
        tax: Number(quotation.tax),
        taxRate: Number(quotation.taxRate),
        total: Number(quotation.total),
        notes: quotation.notes || "",
        terms: quotation.terms || "",
        items: quotation.items.map((item) => ({
          name: item.name,
          description: item.description || "",
          unit: item.unit || "",
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discount: Number(item.discount),
          tax: Number(item.tax),
          total: Number(item.total),
          order: item.order,
        })),
      };
    }
  }

  const settings = await getSettings();
  const paymentMethodsJson = (settings as any).payment_methods || null;
  return <InvoiceFormClient mode="create" initialData={initialData} initialNumber={nextNumber}  dynamicPaymentChannels={paymentMethodsJson} />;
}
