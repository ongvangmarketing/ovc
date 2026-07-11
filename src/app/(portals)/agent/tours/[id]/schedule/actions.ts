"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { revalidatePath } from "next/cache";
import { TourService } from "@/modules/traveling/services/tour.service";

export async function getInventory(tourId: string, startDate: string, endDate: string) {
  try {
    const authData = await requireAuth();
    
    const inventory = await TourService.getInventory(authData.organizationId!, tourId, startDate, endDate);

    return { success: true, inventory };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkUpdateInventory(
  tourId: string, 
  dates: string[], 
  data: { adultPrice?: number, childPrice?: number, allotment?: number, isClosed?: boolean }
) {
  try {
    const authData = await requireAuth();

    await TourService.bulkUpdateInventory(authData.organizationId!, tourId, dates, data);

    revalidatePath(`/agent/tours/${tourId}/schedule`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function advancedBulkUpdate(
  tourId: string,
  startDate: string,
  endDate: string,
  selectedDays: number[], // 0 = Sunday, 1 = Monday...
  data: { adultPrice?: number, childPrice?: number, allotment?: number, isClosed?: boolean }
) {
  try {
    const authData = await requireAuth();
    await TourService.advancedBulkUpdate(authData.organizationId, tourId, startDate, endDate, selectedDays, data);
    revalidatePath(`/agent/tours/${tourId}/schedule`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
