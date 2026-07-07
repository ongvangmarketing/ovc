"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitCustomerOptions(dealId: string, selectedOptionIds: string[]) {
  try {
    const deal = await db.deal.findUnique({
      where: { id: dealId },
      include: { serviceOptions: true }
    });
    
    if (!deal) return { error: "Không tìm thấy yêu cầu tư vấn." };

    // Update selected
    if (selectedOptionIds.length > 0) {
      await db.dealServiceOption.updateMany({
        where: { id: { in: selectedOptionIds }, dealId },
        data: { status: "CUSTOMER_SELECTED" }
      });
    }

    // Update unselected options to REJECTED if they were PROPOSED
    const unselectedIds = deal.serviceOptions
      .filter(opt => !selectedOptionIds.includes(opt.id) && opt.status === "PROPOSED")
      .map(opt => opt.id);

    if (unselectedIds.length > 0) {
      await db.dealServiceOption.updateMany({
        where: { id: { in: unselectedIds }, dealId },
        data: { status: "CUSTOMER_REJECTED" }
      });
    }

    revalidatePath(`/shared/deals/${dealId}/options`);
    return { success: true };
  } catch (error: any) {
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." };
  }
}
