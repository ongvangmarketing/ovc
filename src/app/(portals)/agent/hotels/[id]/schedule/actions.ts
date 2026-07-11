"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { revalidatePath } from "next/cache";
import { HotelScheduleService } from "@/modules/traveling/services/hotel-schedule.service";

export async function getInventory(hotelId: string, startDateStr: string, endDateStr: string) {
  try {
    const authData = await requireAuth();
    return await HotelScheduleService.getInventory(authData.organizationId, hotelId, startDateStr, endDateStr);
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkUpdateInventory(
  hotelId: string, 
  roomTypeId: string, 
  dates: string[], 
  data: { 
    price?: number; 
    allotment?: number; 
    isClosed?: boolean;
    minStay?: number;
    maxStay?: number;
    closedToArrival?: boolean;
    closedToDeparture?: boolean;
  }
) {
  try {
    const authData = await requireAuth();
    
    await HotelScheduleService.bulkUpdateInventory(authData.organizationId, hotelId, roomTypeId, dates, data);

    revalidatePath(`/agent/hotels/${hotelId}/schedule`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function advancedBulkUpdate(
  hotelId: string,
  roomTypeIds: string[],
  startDateStr: string,
  endDateStr: string,
  selectedDays: number[],
  data: { 
    price?: number; 
    allotment?: number; 
    isClosed?: boolean;
    minStay?: number;
    maxStay?: number;
    closedToArrival?: boolean;
    closedToDeparture?: boolean;
  }
) {
  try {
    const authData = await requireAuth();
    
    await HotelScheduleService.advancedBulkUpdate(authData.organizationId, hotelId, roomTypeIds, startDateStr, endDateStr, selectedDays, data);

    revalidatePath(`/agent/hotels/${hotelId}/schedule`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
