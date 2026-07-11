import { getTenantDb } from "@/lib/db";

export class LeadSourceService {
  static async getLeadSources(orgId: string) {
    return getTenantDb().leadSource.findMany({
      where: { organizationId: orgId },
    });
  }
}
