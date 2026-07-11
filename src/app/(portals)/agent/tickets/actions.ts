"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { revalidatePath } from "next/cache";

export async function createTicket(formData: FormData) {
  try {
    const authData = await requireAuth();
    // TODO: Implement via TicketService when ready
    revalidatePath("/agent/tickets");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTicket(id: string) {
  try {
    const authData = await requireAuth();
    // TODO: Implement via TicketService when ready
    revalidatePath("/agent/tickets");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
