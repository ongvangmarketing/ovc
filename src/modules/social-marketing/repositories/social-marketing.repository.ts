import { getTenantDb } from "@/lib/db";
import { Prisma } from "@prisma/client";

export class SocialMarketingRepository {
  static async findProviderConnections(organizationId: string, provider: "FACEBOOK") {
    return getTenantDb().socialProviderConnection.findMany({
      where: { organizationId, provider, deletedAt: null },
      orderBy: { connectedAt: "desc" },
    });
  }

  static async findInsights(organizationId: string, provider: "FACEBOOK", dateFrom: Date, dateTo: Date) {
    return getTenantDb().socialInsight.findMany({
      where: { organizationId, provider, entityType: "PAGE", dateStart: { gte: dateFrom }, dateStop: { lte: dateTo }, deletedAt: null },
      orderBy: { dateStart: "asc" },
    });
  }
}
