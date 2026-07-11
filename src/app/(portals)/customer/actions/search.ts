"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { CustomerPortalService } from "@/modules/crm/services/customer-portal.service";

export async function globalCustomerSearch(query: string) {
  const session = await requireAuth();
  if (session.user.role !== "CUSTOMER") return { projects: [], tasks: [] };

  return CustomerPortalService.globalSearch(session.user.id, query, session.organizationId);
}
