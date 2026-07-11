import type { Metadata } from "next";
import { FinanceOverviewClient } from "@/modules/finance/components/finance-overview-client";

export const metadata: Metadata = { title: "Tổng quan Tài chính" };

export default function FinanceOverviewPage() {
  // Force rebuild
  return <FinanceOverviewClient />;
}
