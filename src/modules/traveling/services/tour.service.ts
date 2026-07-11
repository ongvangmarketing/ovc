import { getTenantDb } from "@/lib/db";
import { Prisma } from "@prisma/client";

export class TourService {
  // --- AGENT CRUD ---
  static async getTours(orgId: string) {
    return getTenantDb().tour.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createTour(
    data: { name: string; durationDays: number; destinations: string[]; basePrice: number; isActive: boolean },
    orgId: string,
    agentId: string
  ) {
    return getTenantDb().tour.create({
      data: {
        ...data,
        organizationId: orgId,
        agentId,
      },
    });
  }

  static async deleteTour(id: string, orgId: string) {
    const tour = await getTenantDb().tour.findFirst({ where: { id, organizationId: orgId } });
    if (!tour) throw new Error("Không tìm thấy Tour hoặc không có quyền");
    return getTenantDb().tour.delete({ where: { id } });
  }

  // --- PUBLIC / FRONTEND ---
  static async getPublicTours(query?: string) {
    return getTenantDb().tour.findMany({
      where: { 
        isActive: true,
        ...(query ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { destinations: { hasSome: [query] } }
          ]
        } : {})
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getPublicTourById(id: string) {
    return getTenantDb().tour.findUnique({
      where: { id, isActive: true },
      include: {
        itineraries: { orderBy: { dayNumber: 'asc' } },
        inventories: { 
          where: { date: { gte: new Date() }, isClosed: false },
          orderBy: { date: 'asc' }
        }
      }
    });
  }

  static async getAgentTourBookings(organizationId: string, agentId: string) {
    return getTenantDb().tourBooking.findMany({
      where: {
        tour: {
          agentId,
          organizationId,
        }
      },
      include: {
        tour: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
  // --- TOUR INFO ---
  static async getTourDetail(orgId: string, tourId: string) {
    return getTenantDb().tour.findUnique({
      where: { id: tourId, organizationId: orgId },
      include: {
        itineraries: {
          orderBy: { dayNumber: "asc" }
        }
      }
    });
  }

  static async updateTourInfo(orgId: string, tourId: string, data: any) {
    const existing = await getTenantDb().tour.findUnique({
      where: { id: tourId, organizationId: orgId }
    });
    if (!existing) throw new Error("Không tìm thấy Tour hoặc không có quyền");

    return getTenantDb().tour.update({
      where: { id: tourId },
      data,
    });
  }

  // --- ITINERARY ---
  static async saveItineraryDay(orgId: string, tourId: string, dayId: string | null, data: any) {
    const tour = await getTenantDb().tour.findUnique({
      where: { id: tourId, organizationId: orgId }
    });
    if (!tour) throw new Error("Unauthorized");

    if (dayId) {
      return getTenantDb().tourItinerary.update({
        where: { id: dayId },
        data
      });
    } else {
      return getTenantDb().tourItinerary.create({
        data: { tourId, ...data }
      });
    }
  }

  static async deleteItineraryDay(orgId: string, tourId: string, dayId: string) {
    const tour = await getTenantDb().tour.findUnique({
      where: { id: tourId, organizationId: orgId }
    });
    if (!tour) throw new Error("Unauthorized");

    return getTenantDb().tourItinerary.delete({
      where: { id: dayId }
    });
  }

  // --- SCHEDULE / INVENTORY ---
  static async getInventory(orgId: string, tourId: string, startDateStr: string, endDateStr: string) {
    const tour = await getTenantDb().tour.findUnique({
      where: { id: tourId, organizationId: orgId }
    });
    if (!tour) throw new Error("Unauthorized");

    const inventory = await getTenantDb().tourInventory.findMany({
      where: {
        tourId,
        date: {
          gte: new Date(startDateStr),
          lte: new Date(endDateStr)
        }
      }
    });

    return { success: true, inventory };
  }

  static async bulkUpdateInventory(
    orgId: string,
    tourId: string, 
    dates: string[], 
    data: any
  ) {
    const tour = await getTenantDb().tour.findUnique({
      where: { id: tourId, organizationId: orgId }
    });
    if (!tour) throw new Error("Unauthorized");

    const updateData: any = {};
    if (data.adultPrice !== undefined) updateData.adultPrice = data.adultPrice;
    if (data.childPrice !== undefined) updateData.childPrice = data.childPrice;
    if (data.allotment !== undefined) updateData.allotment = data.allotment;
    if (data.isClosed !== undefined) updateData.isClosed = data.isClosed;

    if (Object.keys(updateData).length === 0) return { success: true }; 

    for (const dateStr of dates) {
      const date = new Date(dateStr);
      
      const existing = await getTenantDb().tourInventory.findUnique({
        where: {
          tourId_date: {
            tourId,
            date
          }
        }
      });

      if (existing) {
        await getTenantDb().tourInventory.update({
          where: { id: existing.id },
          data: updateData
        });
      } else {
        await getTenantDb().tourInventory.create({
          data: {
            tourId,
            date,
            ...updateData
          }
        });
      }
    }

    return { success: true };
  }

  static async advancedBulkUpdate(
    orgId: string,
    tourId: string,
    startDateStr: string,
    endDateStr: string,
    selectedDays: number[],
    data: any
  ) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    if (diffDays > 365 || diffDays < 0) {
      throw new Error("Khoảng thời gian không hợp lệ hoặc quá dài (tối đa 1 năm).");
    }

    const datesToUpdate: string[] = [];
    let current = new Date(start);
    
    while (current <= end) {
      if (selectedDays.includes(current.getDay())) {
        const d = current.toISOString().split('T')[0];
        if (d) datesToUpdate.push(d);
      }
      current.setDate(current.getDate() + 1);
    }

    return await this.bulkUpdateInventory(orgId, tourId, datesToUpdate.filter(Boolean), data);
  }
}
