import { HotelRepository } from "../repositories/hotel.repository";
import { TourRepository } from "../repositories/tour.repository";
import { PartnerRepository } from "../repositories/partner.repository";
import { Prisma } from "@prisma/client";
import { getTenantDb } from "@/lib/db";

export class TravelingService {
  // --- SETTINGS ---
  static async getActiveModules(organizationId: string) {
    const org = await getTenantDb().organization.findUnique({
      where: { id: organizationId },
      select: { activeModules: true }
    });
    return org?.activeModules || [];
  }

  static async updateAgentModules(organizationId: string, allowedModules: string[], formData: FormData) {
    const org = await getTenantDb().organization.findUnique({
      where: { id: organizationId },
      select: { activeModules: true }
    });

    if (!org) throw new Error("Organization not found");

    let updatedModules = org.activeModules.filter(m => !m.startsWith("TRAVELING_"));
    
    for (const mod of allowedModules) {
      if (formData.get(mod) === "on") {
        updatedModules.push(mod);
      }
    }

    return getTenantDb().organization.update({
      where: { id: organizationId },
      data: { activeModules: updatedModules },
    });
  }

  // --- DASHBOARD ---
  static async getDashboardStats(organizationId: string) {
    const org = await getTenantDb().organization.findUnique({
      where: { id: organizationId },
      select: { activeModules: true }
    });
    const activeModules = org?.activeModules || [];

    const hasHotel = activeModules.includes("TRAVELING_HOTEL");
    const hasTour = activeModules.includes("TRAVELING_TOUR");
    const hasCar = activeModules.includes("TRAVELING_CAR");
    const hasTicket = activeModules.includes("TRAVELING_EVENT") || activeModules.includes("TRAVELING_TICKET");

    const [hotelCount, tourCount, carCount, ticketCount] = await Promise.all([
      hasHotel ? getTenantDb().hotel.count({ where: { organizationId } }) : Promise.resolve(0),
      hasTour ? getTenantDb().tour.count({ where: { organizationId } }) : Promise.resolve(0),
      hasCar ? getTenantDb().vehicle.count({ where: { organizationId } }) : Promise.resolve(0),
      hasTicket ? getTenantDb().ticketEvent.count({ where: { organizationId } }) : Promise.resolve(0),
    ]);

    return {
      hasHotel, hasTour, hasCar, hasTicket,
      hotelCount, tourCount, carCount, ticketCount
    };
  }
  // --- PARTNERS ---
  static async getTravelingAgents(organizationId: string) {
    return await PartnerRepository.findTravelingAgents(organizationId);
  }

  static async toggleAgentPermission(organizationId: string, memberId: string, permissionCode: string) {
    const targetMember = await PartnerRepository.findMemberWithUser(memberId);

    if (!targetMember || targetMember.organizationId !== organizationId) {
      throw new Error("Không tìm thấy đại lý này trong tổ chức của bạn.");
    }

    if (targetMember.user.role !== "AGENT") {
      throw new Error("Tài khoản này không phải là Đại lý (Agent).");
    }

    const currentPermissions = targetMember.permissions || [];
    const hasPermission = currentPermissions.includes(permissionCode);
    
    const nextPermissions = hasPermission
      ? currentPermissions.filter(p => p !== permissionCode)
      : [...currentPermissions, permissionCode];

    await PartnerRepository.updateMemberPermissions(memberId, nextPermissions);
    
    return { success: true, nextPermissions };
  }

  // --- HOTELS ---
  static async getHotels(organizationId: string) {
    return await HotelRepository.findManyByOrganization(organizationId);
  }

  static async createHotel(data: Prisma.HotelUncheckedCreateInput) {
    return await HotelRepository.create(data);
  }

  static async deleteHotel(id: string) {
    return await HotelRepository.delete(id);
  }

  // --- TOURS ---
  static async getTours(organizationId: string) {
    return await TourRepository.findManyByOrganization(organizationId);
  }

  static async createTour(data: Prisma.TourUncheckedCreateInput) {
    return await TourRepository.create(data);
  }

  static async deleteTour(id: string) {
    return await TourRepository.delete(id);
  }
}
