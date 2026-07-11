import { getTenantDb } from "@/lib/db";
import { randomUUID } from "crypto";

export class HotelScheduleService {
  static async getInventory(orgId: string, hotelId: string, startDateStr: string, endDateStr: string) {
    const hotel = await getTenantDb().hotel.findUnique({
      where: { id: hotelId, organizationId: orgId }
    });
    if (!hotel) throw new Error("Unauthorized");

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    const inventory = await getTenantDb().roomInventory.findMany({
      where: {
        roomType: { hotelId },
        date: {
          gte: startDate,
          lte: endDate,
        }
      }
    });

    return { success: true, inventory };
  }

  static async bulkUpdateInventory(
    orgId: string,
    hotelId: string, 
    roomTypeId: string, 
    dates: string[], 
    data: any
  ) {
    const hotel = await getTenantDb().hotel.findUnique({
      where: { id: hotelId, organizationId: orgId }
    });
    if (!hotel) throw new Error("Unauthorized");

    const roomType = await getTenantDb().roomType.findUnique({
      where: { id: roomTypeId, hotelId }
    });
    if (!roomType) throw new Error("Room Type not found");

    for (const dateStr of dates) {
      const dateObj = new Date(dateStr);
      
      const existing = await getTenantDb().roomInventory.findUnique({
        where: { roomTypeId_date: { roomTypeId, date: dateObj } }
      });

      if (existing) {
        await getTenantDb().roomInventory.update({
          where: { id: existing.id },
          data: {
            ...(data.price !== undefined && { price: data.price }),
            ...(data.allotment !== undefined && { allotment: data.allotment, availableRooms: data.allotment }),
            ...(data.isClosed !== undefined && { isClosed: data.isClosed }),
            ...(data.minStay !== undefined && { minStay: data.minStay }),
            ...(data.maxStay !== undefined && { maxStay: data.maxStay }),
            ...(data.closedToArrival !== undefined && { closedToArrival: data.closedToArrival }),
            ...(data.closedToDeparture !== undefined && { closedToDeparture: data.closedToDeparture }),
          }
        });
      } else {
        await getTenantDb().roomInventory.create({
          data: {
            roomTypeId,
            date: dateObj,
            price: data.price ?? roomType.basePrice,
            allotment: data.allotment ?? 0,
            availableRooms: data.allotment ?? 0,
            isClosed: data.isClosed ?? false,
            minStay: data.minStay ?? 1,
            maxStay: data.maxStay,
            closedToArrival: data.closedToArrival ?? false,
            closedToDeparture: data.closedToDeparture ?? false,
          }
        });
      }
    }

    return { success: true };
  }

  static async advancedBulkUpdate(
    orgId: string,
    hotelId: string,
    roomTypeIds: string[],
    startDateStr: string,
    endDateStr: string,
    selectedDays: number[],
    data: any
  ) {
    const hotel = await getTenantDb().hotel.findUnique({
      where: { id: hotelId, organizationId: orgId }
    });
    if (!hotel) throw new Error("Unauthorized");

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    
    const datesToUpdate: Date[] = [];
    let current = new Date(start);
    while (current <= end) {
      if (selectedDays.includes(current.getDay())) {
        datesToUpdate.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }

    if (datesToUpdate.length === 0) {
      throw new Error("No dates matched the selection criteria.");
    }

    const roomTypes = await getTenantDb().roomType.findMany({
      where: { id: { in: roomTypeIds }, hotelId }
    });

    for (const rt of roomTypes) {
      for (const d of datesToUpdate) {
        const existing = await getTenantDb().roomInventory.findUnique({
          where: { roomTypeId_date: { roomTypeId: rt.id, date: d } }
        });

        if (existing) {
          await getTenantDb().roomInventory.update({
            where: { id: existing.id },
            data: {
              ...(data.price !== undefined && { price: data.price }),
              ...(data.allotment !== undefined && { allotment: data.allotment, availableRooms: data.allotment }),
              ...(data.isClosed !== undefined && { isClosed: data.isClosed }),
              ...(data.minStay !== undefined && { minStay: data.minStay }),
              ...(data.maxStay !== undefined && { maxStay: data.maxStay }),
              ...(data.closedToArrival !== undefined && { closedToArrival: data.closedToArrival }),
              ...(data.closedToDeparture !== undefined && { closedToDeparture: data.closedToDeparture }),
            }
          });
        } else {
          await getTenantDb().roomInventory.create({
            data: {
              roomTypeId: rt.id,
              date: d,
              price: data.price ?? rt.basePrice,
              allotment: data.allotment ?? 0,
              availableRooms: data.allotment ?? 0,
              isClosed: data.isClosed ?? false,
              minStay: data.minStay ?? 1,
              maxStay: data.maxStay,
              closedToArrival: data.closedToArrival ?? false,
              closedToDeparture: data.closedToDeparture ?? false,
            }
          });
        }
      }
    }

    return { success: true };
  }

  static async updateRoomInventoryBatch(orgId: string, payload: any) {
    const hotel = await getTenantDb().hotel.findUnique({
      where: { id: payload.hotelId, organizationId: orgId },
      select: { id: true },
    });
    if (!hotel) throw new Error("Unauthorized");

    const roomTypeIds = [...new Set(payload.roomTypeIds as string[])].filter(Boolean);
    const dates = [...new Set(payload.dates as string[])].filter(Boolean);
    if (roomTypeIds.length === 0 || dates.length === 0) {
      throw new Error("Chưa chọn hạng phòng hoặc ngày cần cập nhật.");
    }

    const roomTypes = await getTenantDb().roomType.findMany({
      where: { id: { in: roomTypeIds }, hotelId: payload.hotelId }
    });
    if (roomTypes.length !== roomTypeIds.length) {
      throw new Error("Có hạng phòng không thuộc khách sạn này.");
    }

    const roomTypeMap = new Map(roomTypes.map((roomType) => [roomType.id, roomType]));
    const updates = roomTypeIds.flatMap((roomTypeId) => {
      const roomType = roomTypeMap.get(roomTypeId);
      if (!roomType) return [];

      return dates.map((date) => {
        const inventoryId = randomUUID();
        const price = payload.price != null && !Number.isNaN(payload.price) ? Math.max(0, payload.price) : null;
        const allotment = payload.allotment != null && !Number.isNaN(payload.allotment) ? Math.max(0, payload.allotment) : null;
        const availableRooms = payload.availableRooms != null && !Number.isNaN(payload.availableRooms) ? Math.max(0, payload.availableRooms) : null;
        const note = payload.note || null;
        const isClosed = payload.action === "CLOSE" ? true : payload.action === "OPEN" ? false : null;

        return getTenantDb().$executeRaw`
          INSERT INTO "RoomInventory" (
            "id",
            "roomTypeId",
            "date",
            "allotment",
            "availableRooms",
            "price",
            "isClosed",
            "note",
            "createdAt",
            "updatedAt"
          )
          VALUES (
            ${inventoryId},
            ${roomTypeId},
            ${date}::date,
            COALESCE(${allotment}::integer, 0),
            COALESCE(${availableRooms}::integer, 0),
            COALESCE(${price}::double precision, ${roomType.basePrice}::double precision),
            COALESCE(${isClosed}::boolean, false),
            ${note},
            NOW(),
            NOW()
          )
          ON CONFLICT ("roomTypeId", "date") DO UPDATE SET
            "allotment" = CASE
              WHEN ${payload.action} = 'UPDATE' AND ${allotment}::integer IS NOT NULL THEN ${allotment}::integer
              ELSE "RoomInventory"."allotment"
            END,
            "availableRooms" = CASE
              WHEN ${payload.action} = 'UPDATE' AND ${availableRooms}::integer IS NOT NULL THEN ${availableRooms}::integer
              ELSE "RoomInventory"."availableRooms"
            END,
            "price" = CASE
              WHEN ${payload.action} = 'UPDATE' AND ${price}::double precision IS NOT NULL THEN ${price}::double precision
              ELSE "RoomInventory"."price"
            END,
            "isClosed" = CASE
              WHEN ${payload.action} = 'OPEN' THEN false
              WHEN ${payload.action} = 'CLOSE' THEN true
              ELSE "RoomInventory"."isClosed"
            END,
            "note" = CASE
              WHEN ${payload.action} = 'UPDATE' THEN ${note}
              ELSE "RoomInventory"."note"
            END,
            "updatedAt" = NOW()
        `;
      });
    });

    await getTenantDb().$transaction(updates);
    return { success: true, updated: updates.length };
  }
}
