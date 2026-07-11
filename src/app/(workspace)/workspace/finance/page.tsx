import { redirect } from "next/navigation";

export default function FinancePage() {
  redirect("/workspace/finance/invoices");
}
