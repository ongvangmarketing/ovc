import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { getCustomerPortalData as getServiceData } from "@/modules/core/services/customer-portal.service";

export { formatCurrency, formatDate, statusLabel, statusClass } from "@/modules/core/services/customer-portal.service";
export { progressFromTasks } from "./utils";

export async function getCustomerPortalData() {
  const session = await requireAuth();

  if (session.user.role !== "CUSTOMER") {
    redirect("/workspace");
  }

  return getServiceData(session);
}
