import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { PaymentFormClient } from "@/modules/finance/components/payment-form-client";

export default async function EditPaymentPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await requireAuth();
  const [payment, invoices] = await Promise.all([
    db.payment.findFirst({
      where: { id: params.id, organizationId: session.organizationId },
    }),
    db.invoice.findMany({
      where: { organizationId: session.organizationId },
      include: { contact: { include: { company: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  if (!payment) return notFound();

  return <PaymentFormClient initialData={JSON.parse(JSON.stringify(payment))} invoices={JSON.parse(JSON.stringify(invoices))} />;
}
