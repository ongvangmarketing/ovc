import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { PaymentFormClient } from "@/modules/finance/components/payment-form-client";
import { getNextReceiptNumber } from "@/app/actions/finance-crud";

export default async function CreatePaymentPage(props: { searchParams: Promise<{ invoiceId?: string }> }) {
  const searchParams = await props.searchParams;
  const session = await requireAuth();
  const nextNumber = await getNextReceiptNumber();
  const invoices = await db.invoice.findMany({
    where: { organizationId: session.organizationId },
    include: { contact: { include: { company: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const selectedInvoices = searchParams.invoiceId
    ? [...invoices].sort((a, b) => Number(b.id === searchParams.invoiceId) - Number(a.id === searchParams.invoiceId))
    : invoices;

  return <PaymentFormClient invoices={JSON.parse(JSON.stringify(selectedInvoices))} initialNumber={nextNumber} />;
}
