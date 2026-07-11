import { getTenantDb } from "@/lib/db";
import { Prisma } from "@prisma/client";

export class TourRepository {
  static async findManyByOrganization(organizationId: string) {
    return await getTenantDb().tour.findMany({
      where: { organizationId },
      include: {
        agent: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  static async findById(id: string) {
    return await getTenantDb().tour.findUnique({ where: { id } });
  }

  static async create(data: Prisma.TourUncheckedCreateInput) {
    return await getTenantDb().tour.create({ data });
  }

  static async update(id: string, data: Prisma.TourUpdateInput) {
    return await getTenantDb().tour.update({ where: { id }, data });
  }

  static async delete(id: string) {
    return await getTenantDb().tour.delete({ where: { id } });
  }
}
