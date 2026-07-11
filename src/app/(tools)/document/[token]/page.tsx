import { notFound } from "next/navigation";
import { QuotationHandler } from "./handlers/quotation";
import { ContractHandler } from "./handlers/contract";
import { InvoiceHandler } from "./handlers/invoice";

export const dynamic = 'force-dynamic';

export default async function DocumentPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // Each handler is completely isolated.
  // It handles its own DB queries, event tracking, and UI rendering.
  const quotation = await QuotationHandler({ token });
  if (quotation) return quotation;

  const contract = await ContractHandler({ token });
  if (contract) return contract;

  const invoice = await InvoiceHandler({ token });
  if (invoice) return invoice;

  return notFound();
}
