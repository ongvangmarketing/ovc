import { getTenantDb } from "@/lib/db";

export class LeadWebhookService {
  static async getLeadWebhooks(orgId: string) {
    return getTenantDb().leadWebhook.findMany({
      where: { organizationId: orgId },
      include: { _count: { select: { leads: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async createLeadWebhook(orgId: string, name: string, provider: string) {
    return getTenantDb().leadWebhook.create({
      data: {
        organizationId: orgId,
        name,
        sourceProvider: provider || "CUSTOM",
      }
    });
  }
}
