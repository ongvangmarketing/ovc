"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/require-auth";
import { syncTuitionInvoiceForSession } from "@/lib/training/tuition-finance";
import { TuitionService } from "@/modules/training/services/tuition.service";

export async function syncTuitionInvoice(enrollmentId: string) {
  const session = await requireAuth();
  return syncTuitionInvoiceForSession(enrollmentId, session);
}

export async function updateTuitionInline(
  id: string,
  payload: {
    tuitionFee?: number;
    paidAmount?: number;
    paymentStatus?: string;
    paymentNote?: string;
    paymentAmountAdded?: number;
  }
) {
  try {
    const session = await requireAuth();
    
    const result = await TuitionService.updateTuitionInline(
      session.organizationId,
      session.userId,
      id,
      payload
    );

    if (result.success) {
      revalidatePath("/workspace/training/tuition");
      revalidatePath(`/workspace/training/tuition/${id}`);
      revalidatePath("/workspace/finance/invoices");
    }
    
    return result;
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Lỗi cập nhật học phí" };
  }
}
