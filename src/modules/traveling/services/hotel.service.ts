import { getTenantDb } from "@/lib/db";
import { Prisma } from "@prisma/client";

export class HotelService {
  // --- PUBLIC / FRONTEND ---
  static async getPublicHotelBySlug(slug: string) {
    return getTenantDb().hotel.findUnique({
      where: { slug, isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        city: true,
        images: true,
        starRating: true,
        amenities: true,
      }
    });
  }

  static async getPublicHotels() {
    return getTenantDb().hotel.findMany({
      where: { isActive: true },
      include: {
        roomTypes: {
          orderBy: { basePrice: 'asc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getPublicHotelById(id: string) {
    return getTenantDb().hotel.findUnique({
      where: { id, isActive: true },
      include: {
        roomTypes: {
          orderBy: { basePrice: 'asc' }
        }
      }
    });
  }

  static async getPublicRoomTypes(hotelId: string) {
    return getTenantDb().roomType.findMany({
      where: { hotelId },
      orderBy: { basePrice: 'asc' }
    });
  }

  static async getHotels(orgId: string) {
    return getTenantDb().hotel.findMany({
      where: { organizationId: orgId },
    });
  }

  static async createHotel(data: any, orgId: string) {
    return getTenantDb().hotel.create({
      data: {
        ...data,
        organizationId: orgId,
      },
    });
  }

  static async deleteHotel(hotelId: string, orgId: string) {
    return getTenantDb().hotel.delete({
      where: { id: hotelId, organizationId: orgId },
    });
  }
  static async getHotelDetail(orgId: string, hotelId: string) {
    return getTenantDb().hotel.findUnique({
      where: {
        id: hotelId,
        organizationId: orgId,
      },
    });
  }

  static async getHotelDashboard(orgId: string, hotelId: string) {
    return getTenantDb().hotel.findUnique({
      where: {
        id: hotelId,
        organizationId: orgId,
      },
      include: {
        bookings: {
          where: {
            status: "PENDING",
          },
        },
      },
    });
  }

  // --- SETTINGS ---
  static async updateHotelInfo(orgId: string, hotelId: string, data: any) {
    const hotel = await getTenantDb().hotel.findUnique({
      where: { id: hotelId, organizationId: orgId }
    });
    if (!hotel) throw new Error("Hotel not found");

    if (data.slug) {
      const existing = await getTenantDb().hotel.findFirst({
        where: { slug: data.slug, id: { not: hotelId } }
      });
      if (existing) throw new Error("Đường dẫn (slug) này đã tồn tại, vui lòng chọn tên khác.");
    }

    return getTenantDb().hotel.update({
      where: { id: hotelId },
      data
    });
  }

  // --- ROOM TYPES ---
  static async getHotelRoomTypes(orgId: string, hotelId: string, orderByAsc = false) {
    const hotel = await getTenantDb().hotel.findUnique({
      where: { id: hotelId, organizationId: orgId }
    });
    if (!hotel) return [];

    return getTenantDb().roomType.findMany({
      where: { hotelId },
      orderBy: orderByAsc ? { name: "asc" } : { createdAt: "desc" }
    });
  }

  static async getRoomTypeDetail(orgId: string, hotelId: string, roomTypeId: string) {
    const hotel = await getTenantDb().hotel.findUnique({
      where: { id: hotelId, organizationId: orgId }
    });
    if (!hotel) return null;

    return getTenantDb().roomType.findUnique({
      where: { id: roomTypeId, hotelId }
    });
  }

  static async createRoomType(orgId: string, hotelId: string, data: any) {
    const hotel = await getTenantDb().hotel.findUnique({
      where: { id: hotelId, organizationId: orgId }
    });
    if (!hotel) throw new Error("Hotel not found");

    return getTenantDb().roomType.create({ data: { hotelId, ...data } });
  }

  static async updateRoomType(orgId: string, hotelId: string, roomTypeId: string, data: any) {
    const hotel = await getTenantDb().hotel.findUnique({
      where: { id: hotelId, organizationId: orgId }
    });
    if (!hotel) throw new Error("Hotel not found");

    return getTenantDb().roomType.update({
      where: { id: roomTypeId, hotelId },
      data
    });
  }

  static async deleteRoomType(orgId: string, hotelId: string, roomTypeId: string) {
    const hotel = await getTenantDb().hotel.findUnique({
      where: { id: hotelId, organizationId: orgId }
    });
    if (!hotel) throw new Error("Hotel not found");

    return getTenantDb().roomType.delete({
      where: { id: roomTypeId, hotelId }
    });
  }
}
