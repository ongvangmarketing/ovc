import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { PaymentDetailView } from "@/modules/finance/components/payment-detail";

export default async function PaymentDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await requireAuth();
  const payment = await db.payment.findFirst({
    where: { id: params.id, organizationId: session.organizationId },
    include: {
      invoice: {
        include: {
          contact: { include: { company: true } },
          contract: true,
        },
      },
    },
  });

  if (!payment) return notFound();

  return <PaymentDetailView data={JSON.parse(JSON.stringify(payment))} />;
}
