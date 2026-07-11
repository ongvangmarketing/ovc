"use server";

import { HotelBookingService } from "@/modules/traveling/services/hotel-booking.service";

export async function getBookingInventory(hotelId: string, startDateStr: string, endDateStr: string) {
  try {
    const inventory = await HotelBookingService.getPublicBookingInventory(hotelId, startDateStr, endDateStr);
    return { success: true, inventory };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createBooking(data: {
  hotelId: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequest: string;
}) {
  try {
    const bookingCode = await HotelBookingService.createPublicBooking(data);
    return { success: true, bookingCode };
  } catch (error: any) {
    console.error("Booking Error:", error);
    return { success: false, error: error.message || "Đã có lỗi xảy ra trong quá trình đặt phòng. Vui lòng thử lại." };
  }
}
