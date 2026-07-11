"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { revalidatePath } from "next/cache";
import { HotelService } from "@/modules/traveling/services/hotel.service";

export async function createHotel(formData: FormData) {
  try {
    const authData = await requireAuth();
    if (authData.user.role !== "AGENT" && authData.user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const starRating = parseInt(formData.get("starRating") as string);
    const status = formData.get("status") === "ACTIVE";

    if (!name || !address || !city || isNaN(starRating)) {
      throw new Error("Vui lòng điền đầy đủ và đúng định dạng các trường bắt buộc.");
    }

    await HotelService.createHotel({
      name,
      address,
      city,
      starRating,
      isActive: status,
    }, authData.organizationId);

    revalidatePath("/agent/hotels");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create hotel:", error);
    return { success: false, error: error.message || "Đã có lỗi xảy ra" };
  }
}

export async function deleteHotel(id: string) {
  try {
    const authData = await requireAuth();
    if (authData.user.role !== "AGENT" && authData.user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized");
    }

    await HotelService.deleteHotel(id, authData.organizationId);
    
    revalidatePath("/agent/hotels");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete hotel:", error);
    return { success: false, error: error.message };
  }
}
