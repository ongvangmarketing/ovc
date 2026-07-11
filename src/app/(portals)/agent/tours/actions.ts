"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { revalidatePath } from "next/cache";
import { TourService } from "@/modules/traveling/services/tour.service";

export async function createTour(formData: FormData) {
  try {
    const authData = await requireAuth();
    if (authData.user.role !== "AGENT" && authData.user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    const durationDays = parseInt(formData.get("durationDays") as string);
    const dest = formData.get("dest") as string;
    const basePrice = parseFloat(formData.get("basePrice") as string);
    const status = formData.get("status") === "ACTIVE";

    if (!name || isNaN(durationDays) || !dest || isNaN(basePrice)) {
      throw new Error("Vui lòng điền đầy đủ và đúng định dạng các trường bắt buộc.");
    }

    await TourService.createTour({
      name,
      durationDays,
      destinations: [dest],
      basePrice,
      isActive: status,
    }, authData.organizationId, authData.userId);

    revalidatePath("/agent/tours");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create tour:", error);
    return { success: false, error: error.message || "Đã có lỗi xảy ra" };
  }
}

export async function deleteTour(id: string) {
  try {
    const authData = await requireAuth();
    if (authData.user.role !== "AGENT" && authData.user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized");
    }

    await TourService.deleteTour(id, authData.organizationId);

    revalidatePath("/agent/tours");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete tour:", error);
    return { success: false, error: error.message };
  }
}
