"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { revalidatePath } from "next/cache";
import { TourService } from "@/modules/traveling/services/tour.service";

export async function updateTourInfo(formData: FormData) {
  try {
    const authData = await requireAuth();

    const tourId = formData.get("tourId") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const durationDays = parseInt(formData.get("durationDays") as string) || 1;
    const basePrice = parseFloat(formData.get("basePrice") as string) || 0;
    const baseChildPrice = parseFloat(formData.get("baseChildPrice") as string) || 0;
    const destinationInput = formData.get("destinations") as string;
    
    const imagesInput = formData.get("images") as string;
    const logoInput = formData.get("logo") as string;
    
    if (!tourId || !name) {
      return { success: false, error: "Thiếu thông tin bắt buộc" };
    }

    const destinations = destinationInput 
      ? destinationInput.split(",").map(d => d.trim()).filter(Boolean)
      : [];
      
    const images = imagesInput ? imagesInput.split(",").map(d => d.trim()).filter(Boolean) : [];
    if (logoInput && !images.includes(logoInput)) {
       images.unshift(logoInput);
    }

    const includedStr = formData.get("included") as string;
    const excludedStr = formData.get("excluded") as string;
    const surchargesStr = formData.get("surcharges") as string;

    const included = includedStr ? includedStr.split('\n').map(d => d.trim()).filter(Boolean) : [];
    const excluded = excludedStr ? excludedStr.split('\n').map(d => d.trim()).filter(Boolean) : [];
    
    let surcharges = null;
    if (surchargesStr) {
      try {
        surcharges = JSON.parse(surchargesStr);
      } catch (e) {
        surcharges = surchargesStr; // Fallback
      }
    }

    await TourService.updateTourInfo(authData.organizationId, tourId, {
      name,
      description,
      durationDays,
      basePrice,
      baseChildPrice,
      destinations,
      images,
      included,
      excluded,
      surcharges,
    });

    revalidatePath(`/agent/tours/${tourId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi cập nhật Tour:", error);
    return { success: false, error: "Đã xảy ra lỗi hệ thống" };
  }
}
