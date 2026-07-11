"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { revalidatePath } from "next/cache";
import { TravelingService } from "../services/traveling.service";
import { Prisma } from "@prisma/client";

// --- PARTNERS ---
export async function toggleAgentPermissionAction(memberId: string, permissionCode: string) {
  try {
    const session = await requireAuth();
    if (!session.organizationId) throw new Error("Không xác định được tổ chức hiện tại.");

    // TODO: Move admin check to Service or middleware if needed. Keeping it simple here.
    const res = await TravelingService.toggleAgentPermission(session.organizationId, memberId, permissionCode);
    revalidatePath("/workspace/traveling/partners");
    return res;
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi cập nhật quyền" };
  }
}

export async function getTravelingAgentsAction() {
  const session = await requireAuth();
  if (!session.organizationId) throw new Error("Unauthorized");
  return await TravelingService.getTravelingAgents(session.organizationId);
}

// --- HOTELS ---
export async function createHotelAction(formData: FormData) {
  try {
    const session = await requireAuth();
    if (!session.organizationId) return { success: false, error: "Chưa chọn tổ chức" };

    const data: Prisma.HotelUncheckedCreateInput = {
      organizationId: session.organizationId,
      name: formData.get("name") as string,
      city: formData.get("city") as string,
      address: formData.get("address") as string,
      starRating: parseInt(formData.get("starRating") as string) || 3,
      isActive: formData.get("status") === "ACTIVE",
    };

    await TravelingService.createHotel(data);
    revalidatePath("/workspace/traveling/hotels");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi tạo khách sạn" };
  }
}

export async function deleteHotelAction(id: string) {
  try {
    await requireAuth();
    await TravelingService.deleteHotel(id);
    revalidatePath("/workspace/traveling/hotels");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi xóa khách sạn" };
  }
}

// --- TOURS ---
export async function createTourAction(formData: FormData) {
  try {
    const session = await requireAuth();
    if (!session.organizationId) return { success: false, error: "Chưa chọn tổ chức" };

    const destString = formData.get("destinations") as string;
    const destinations = destString ? destString.split(",").map(s => s.trim()).filter(Boolean) : [];

    const data: Prisma.TourUncheckedCreateInput = {
      organizationId: session.organizationId,
      name: formData.get("name") as string,
      durationDays: parseInt(formData.get("durationDays") as string) || 1,
      basePrice: parseFloat(formData.get("basePrice") as string) || 0,
      destinations: destinations,
      isActive: formData.get("status") === "ACTIVE",
    };

    await TravelingService.createTour(data);
    revalidatePath("/workspace/traveling/tours");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi tạo tour" };
  }
}

export async function deleteTourAction(id: string) {
  try {
    await requireAuth();
    await TravelingService.deleteTour(id);
    revalidatePath("/workspace/traveling/tours");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi xóa tour" };
  }
}
