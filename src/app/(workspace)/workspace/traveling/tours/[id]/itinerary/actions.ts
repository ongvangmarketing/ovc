"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { revalidatePath } from "next/cache";
import { TourService } from "@/modules/traveling/services/tour.service";

export async function saveItineraryDay(tourId: string, dayId: string | null, data: any) {
  try {
    const authData = await requireAuth();

    await TourService.saveItineraryDay(
      authData.organizationId,
      tourId,
      dayId,
      {
        dayNumber: data.dayNumber,
        title: data.title,
        description: data.description,
        meals: data.meals,
        hotelName: data.hotelName,
        location: data.location,
        transport: data.transport,
        images: data.images || [],
      }
    );

    revalidatePath(`/workspace/traveling/tours/${tourId}/itinerary`);
    return { success: true };
  } catch (error: any) {
    console.error("Save Itinerary Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteItineraryDay(tourId: string, dayId: string) {
  try {
    const authData = await requireAuth();

    await TourService.deleteItineraryDay(authData.organizationId, tourId, dayId);

    revalidatePath(`/workspace/traveling/tours/${tourId}/itinerary`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
