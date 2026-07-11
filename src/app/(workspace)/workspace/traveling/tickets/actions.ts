"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { revalidatePath } from "next/cache";
import { TicketService } from "@/modules/traveling/services/ticket.service";

export async function createTicket(formData: FormData) {
  try {
    const authData = await requireAuth();
    if (authData.user.role !== "AGENT" && authData.user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const dateStr = formData.get("date") as string;
    const basePrice = parseFloat(formData.get("basePrice") as string);
    const status = formData.get("status") === "ACTIVE";

    if (!name || !type || !dateStr || isNaN(basePrice)) {
      throw new Error("Vui lòng điền đầy đủ và đúng định dạng các trường bắt buộc.");
    }

    await TicketService.createTicket(authData.organizationId, authData.userId, {
      name,
      type,
      eventDate: new Date(dateStr),
      basePrice,
      isActive: status,
    });

    revalidatePath("/workspace/traveling/tickets");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create ticket:", error);
    return { success: false, error: error.message || "Đã có lỗi xảy ra" };
  }
}

export async function deleteTicket(id: string) {
  try {
    const authData = await requireAuth();
    if (authData.user.role !== "AGENT" && authData.user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized");
    }

    await TicketService.deleteTicket(authData.organizationId, id);

    revalidatePath("/workspace/traveling/tickets");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete ticket:", error);
    return { success: false, error: error.message };
  }
}
