"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { revalidatePath } from "next/cache";
import { TravelingService } from "@/modules/traveling/services/traveling.service";

export async function updateAgentModules(formData: FormData) {
  try {
    const authData = await requireAuth();
    if (authData.user.role !== "AGENT" && authData.user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized");
    }

    const allowedModules = ["TRAVELING_HOTEL", "TRAVELING_TOUR", "TRAVELING_CAR", "TRAVELING_EVENT", "TRAVELING_TICKET"];
    
    await TravelingService.updateAgentModules(authData.organizationId, allowedModules, formData);

    revalidatePath("/workspace", "layout");
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update modules:", error);
    return { success: false, error: error.message };
  }
}
