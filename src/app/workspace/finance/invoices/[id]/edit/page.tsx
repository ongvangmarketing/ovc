import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { notFound } from "next/navigation";
import { InvoiceFormClient } from "@/modules/finance/components/invoice-form-client";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAuth();
  
  const invoice = await db.invoice.findFirst({
    where: { id, organizationId: session.organizationId },
    include: {
      items: { orderBy: { order: "asc" } },
      payments: { orderBy: { createdAt: "desc" } },
      contact: { include: { company: true } },
      project: true,
      contract: true,
    }
  });

  if (!invoice) return notFound();

  return <InvoiceFormClient mode="edit" initialData={JSON.parse(JSON.stringify(invoice))} />;
}
