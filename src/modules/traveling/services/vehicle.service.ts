import { getTenantDb } from "@/lib/db";

export class VehicleService {
  static async getVehicles(orgId: string) {
    return getTenantDb().vehicle.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async createVehicle(orgId: string, agentId: string, data: any) {
    return getTenantDb().vehicle.create({
      data: {
        ...data,
        organizationId: orgId,
        agentId,
      },
    });
  }

  static async deleteVehicle(orgId: string, id: string) {
    const vehicle = await getTenantDb().vehicle.findUnique({ where: { id } });
    if (!vehicle || vehicle.organizationId !== orgId) {
      throw new Error("Phương tiện không tồn tại hoặc không có quyền truy cập.");
    }
    return getTenantDb().vehicle.delete({ where: { id } });
  }
}
