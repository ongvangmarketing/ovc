"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { revalidatePath } from "next/cache";
import { HotelBookingService } from "@/modules/traveling/services/hotel-booking.service";

export async function updateBookingStatus(
  hotelId: string,
  bookingId: string,
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED",
  note?: string
) {
  try {
    const authData = await requireAuth();
    
    await HotelBookingService.updateBookingStatus(
      authData.organizationId,
      hotelId,
      bookingId,
      status,
      note
    );

    revalidatePath(`/workspace/traveling/hotels/${hotelId}/bookings`);
    revalidatePath(`/workspace/traveling/hotels/${hotelId}`); // Dashboard
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
