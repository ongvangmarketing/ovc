import type { Metadata } from "next";
import { InvoicesClient } from "@/modules/finance/components/invoices-client";

export const metadata: Metadata = { title: "Hóa đơn" };

export default function InvoicesPage() {
  return <InvoicesClient />;
}
