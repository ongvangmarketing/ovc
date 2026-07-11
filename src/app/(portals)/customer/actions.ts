"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { CustomerPortalService } from "@/modules/crm/services/customer-portal.service";

export async function resendPortalFinanceEmail(type: "quotation" | "contract" | "invoice", id: string) {
  const session = await requireAuth();
  if (session.user.role !== "CUSTOMER") throw new Error("Không có quyền gửi lại email từ portal.");

  await CustomerPortalService.resendFinanceEmail(session.organizationId, session.user.email, type, id);

  return { success: true };
}
