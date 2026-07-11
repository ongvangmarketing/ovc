"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { revalidatePath } from "next/cache";
import { VehicleService } from "@/modules/traveling/services/vehicle.service";

export async function createVehicle(formData: FormData) {
  try {
    const authData = await requireAuth();
    if (authData.user.role !== "AGENT" && authData.user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const plate = formData.get("plate") as string;
    const seats = parseInt(formData.get("seats") as string);
    const pricePerDay = parseFloat(formData.get("pricePerDay") as string);
    const status = formData.get("status") === "ACTIVE";

    if (!name || !type || isNaN(seats) || isNaN(pricePerDay)) {
      throw new Error("Vui lòng điền đầy đủ và đúng định dạng các trường bắt buộc.");
    }

    await VehicleService.createVehicle(authData.organizationId, authData.userId, {
      name,
      type,
      licensePlate: plate || null,
      seats,
      pricePerDay,
      isActive: status,
    });

    revalidatePath("/workspace/traveling/vehicles");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create vehicle:", error);
    return { success: false, error: error.message || "Đã có lỗi xảy ra" };
  }
}

export async function deleteVehicle(id: string) {
  try {
    const authData = await requireAuth();
    if (authData.user.role !== "AGENT" && authData.user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized");
    }

    await VehicleService.deleteVehicle(authData.organizationId, id);
    
    revalidatePath("/workspace/traveling/vehicles");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete vehicle:", error);
    return { success: false, error: error.message };
  }
}
