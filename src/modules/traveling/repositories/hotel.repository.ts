import { getTenantDb } from "@/lib/db";
import { Prisma } from "@prisma/client";

export class HotelRepository {
  static async findManyByOrganization(organizationId: string) {
    return await getTenantDb().hotel.findMany({
      where: { organizationId },
      include: {
        agent: { select: { id: true, name: true, email: true } }
      }
    });
  }

  static async findById(id: string) {
    return await getTenantDb().hotel.findUnique({ where: { id } });
  }

  static async create(data: Prisma.HotelUncheckedCreateInput) {
    return await getTenantDb().hotel.create({ data });
  }

  static async update(id: string, data: Prisma.HotelUpdateInput) {
    return await getTenantDb().hotel.update({ where: { id }, data });
  }

  static async delete(id: string) {
    return await getTenantDb().hotel.delete({ where: { id } });
  }
}
