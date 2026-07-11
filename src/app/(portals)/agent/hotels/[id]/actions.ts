"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { revalidatePath } from "next/cache";
import { HotelService } from "@/modules/traveling/services/hotel.service";
import { HotelScheduleService } from "@/modules/traveling/services/hotel-schedule.service";

export async function updateHotelInfo(formData: FormData) {
  try {
    const authData = await requireAuth();
    const hotelId = formData.get("hotelId") as string;
    const name = formData.get("name") as string;
    const slugRaw = formData.get("slug") as string;
    const slug = slugRaw ? slugRaw.toLowerCase().replace(/[^a-z0-9-]/g, "-") : null;
    const description = formData.get("description") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const starRating = parseInt(formData.get("starRating") as string) || 3;
    
    // New fields
    const checkInTime = formData.get("checkInTime") as string;
    const checkOutTime = formData.get("checkOutTime") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const contactPhone = formData.get("contactPhone") as string;
    const policies = formData.get("policies") as string;
    
    // Images & Amenities (stored as JSON string arrays in FormData)
    const logo = formData.get("logo") as string;
    const imagesRaw = formData.get("images") as string;
    const amenitiesRaw = formData.get("amenities") as string;
    
    const images = imagesRaw ? JSON.parse(imagesRaw) : [];
    const amenities = amenitiesRaw ? JSON.parse(amenitiesRaw) : [];

    await HotelService.updateHotelInfo(authData.organizationId, hotelId, {
      name,
      slug,
      description,
      address,
      city,
      starRating,
      checkInTime,
      checkOutTime,
      contactEmail,
      contactPhone,
      policies,
      logo,
      images,
      amenities
    });

    revalidatePath(`/agent/hotels/${hotelId}`);
    return { success: true };
  } catch (error: any) {
    console.error("updateHotelInfo error:", error);
    return { success: false, error: error.message };
  }
}

export async function createRoomType(formData: FormData) {
  try {
    const authData = await requireAuth();
    const hotelId = formData.get("hotelId") as string;
    
    const imagesRaw = formData.get("images") as string;
    const amenitiesRaw = formData.get("amenities") as string;
    
    const roomType = await HotelService.createRoomType(authData.organizationId, hotelId, {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      basePrice: parseFloat(formData.get("basePrice") as string) || 0,
      capacity: parseInt(formData.get("capacity") as string) || 2,
      roomSize: formData.get("roomSize") ? parseInt(formData.get("roomSize") as string) : null,
      bedType: formData.get("bedType") as string,
      view: formData.get("view") as string,
      maxAdults: parseInt(formData.get("maxAdults") as string) || 2,
      maxChildren: parseInt(formData.get("maxChildren") as string) || 0,
      smoking: formData.get("smoking") === "true",
      images: imagesRaw ? JSON.parse(imagesRaw) : [],
      amenities: amenitiesRaw ? JSON.parse(amenitiesRaw) : [],
    });

    revalidatePath(`/agent/hotels/${hotelId}/room-types`);
    return { success: true, roomType };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateRoomType(formData: FormData) {
  try {
    const authData = await requireAuth();
    const hotelId = formData.get("hotelId") as string;
    const id = formData.get("id") as string;
    
    const imagesRaw = formData.get("images") as string;
    const amenitiesRaw = formData.get("amenities") as string;
    
    const roomType = await HotelService.updateRoomType(authData.organizationId, hotelId, id, {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      basePrice: parseFloat(formData.get("basePrice") as string) || 0,
      capacity: parseInt(formData.get("capacity") as string) || 2,
      roomSize: formData.get("roomSize") ? parseInt(formData.get("roomSize") as string) : null,
      bedType: formData.get("bedType") as string,
      view: formData.get("view") as string,
      maxAdults: parseInt(formData.get("maxAdults") as string) || 2,
      maxChildren: parseInt(formData.get("maxChildren") as string) || 0,
      smoking: formData.get("smoking") === "true",
      images: imagesRaw ? JSON.parse(imagesRaw) : [],
      amenities: amenitiesRaw ? JSON.parse(amenitiesRaw) : [],
    });

    revalidatePath(`/agent/hotels/${hotelId}/room-types`);
    return { success: true, roomType };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteRoomType(id: string, hotelId: string) {
  try {
    const authData = await requireAuth();
    
    await HotelService.deleteRoomType(authData.organizationId, hotelId, id);

    revalidatePath(`/agent/hotels/${hotelId}/room-types`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateRoomInventoryBatch(payload: {
  hotelId: string;
  roomTypeIds: string[];
  dates: string[];
  action: "OPEN" | "CLOSE" | "UPDATE";
  price?: number | null;
  allotment?: number | null;
  availableRooms?: number | null;
  note?: string | null;
}) {
  try {
    const authData = await requireAuth();
    
    const result = await HotelScheduleService.updateRoomInventoryBatch(authData.organizationId, payload);
    
    revalidatePath(`/agent/hotels/${payload.hotelId}/schedule`);
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
