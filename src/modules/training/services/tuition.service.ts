import { getTenantDb } from "@/lib/db";
import { syncTuitionInvoiceForSession } from "@/lib/training/tuition-finance";

export class TuitionService {
  static async updateTuitionInline(
    organizationId: string,
    userId: string,
    id: string,
    payload: {
      tuitionFee?: number;
      paidAmount?: number;
      paymentStatus?: string;
      paymentNote?: string;
      paymentAmountAdded?: number;
    }
  ) {
    const current = await getTenantDb().enrollment.findFirst({
      where: { id, course: { organizationId } },
    });

    if (!current) {
      return { success: false, error: "Không tìm thấy học phí" };
    }

    const updated = await getTenantDb().enrollment.update({
      where: { id },
      data: {
        tuitionFee: payload.tuitionFee !== undefined ? payload.tuitionFee : current.tuitionFee,
        paidAmount: payload.paidAmount !== undefined ? payload.paidAmount : current.paidAmount,
        paymentStatus: payload.paymentStatus !== undefined ? payload.paymentStatus : current.paymentStatus,
        paymentNote: payload.paymentNote !== undefined ? payload.paymentNote : current.paymentNote,
      },
    });

    // Automatically sync with Finance Invoice
    const syncRes = await syncTuitionInvoiceForSession(id, { organizationId, userId });
    
    // If a payment was added, record it in Finance as well
    if (payload.paymentAmountAdded && payload.paymentAmountAdded > 0 && syncRes.invoiceId) {
      await getTenantDb().payment.create({
        data: {
          organizationId,
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

    return { success: true, data: updated, invoiceId: syncRes.invoiceId, invoiceToken: syncRes.invoiceToken };
  }
}
