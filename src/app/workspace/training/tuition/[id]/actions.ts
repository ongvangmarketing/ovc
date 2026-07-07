"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { syncTuitionInvoiceForSession } from "@/lib/training/tuition-finance";

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
    const current = await db.enrollment.findFirst({
      where: { id, course: { organizationId: session.organizationId } },
    });

    if (!current) {
      return { success: false, error: "Không tìm thấy học phí" };
    }

    const updated = await db.enrollment.update({
      where: { id },
      data: {
        tuitionFee: payload.tuitionFee !== undefined ? payload.tuitionFee : current.tuitionFee,
        paidAmount: payload.paidAmount !== undefined ? payload.paidAmount : current.paidAmount,
        paymentStatus: payload.paymentStatus !== undefined ? payload.paymentStatus : current.paymentStatus,
        paymentNote: payload.paymentNote !== undefined ? payload.paymentNote : current.paymentNote,
      },
    });

    // Automatically sync with Finance Invoice
    const syncRes = await syncTuitionInvoice(id);
    
    // If a payment was added, record it in Finance as well
    if (payload.paymentAmountAdded && payload.paymentAmountAdded > 0 && syncRes.invoiceId) {
      await db.payment.create({
        data: {
          organizationId: session.organizationId,
          invoiceId: syncRes.invoiceId,
          amount: payload.paymentAmountAdded,
          currency: "VND",
          method: "BANK_TRANSFER",
          status: "COMPLETED",
          notes: `Thanh toán học phí từ Module Đào tạo`,
          paidAt: new Date(),
        }
      });
    }

    revalidatePath("/workspace/training/tuition");
    revalidatePath(`/workspace/training/tuition/${id}`);
    revalidatePath("/workspace/finance/invoices");
    
    return { success: true, data: updated, invoiceId: syncRes.invoiceId };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Lỗi cập nhật học phí" };
  }
}
