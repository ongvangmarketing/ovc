import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { PaymentFormClient } from "@/modules/finance/components/payment-form-client";

export default async function CreatePaymentPage() {
  const session = await requireAuth();
  const invoices = await db.invoice.findMany({
    where: { organizationId: session.organizationId },
    include: { contact: { include: { company: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return <PaymentFormClient invoices={JSON.parse(JSON.stringify(invoices))} />;
}
