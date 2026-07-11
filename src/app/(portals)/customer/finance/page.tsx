import type { Metadata } from "next";
import { getCustomerPortalData } from "../portal-data";
import CustomerFinancePageClient from "./finance-client";

export const metadata: Metadata = {
  title: "Tài chính | Customer Portal",
};

export default async function CustomerFinancePage() {
  const data = await getCustomerPortalData();

  if (!data.contact) {
    return null;
  }

  return <CustomerFinancePageClient data={data} />;
}
