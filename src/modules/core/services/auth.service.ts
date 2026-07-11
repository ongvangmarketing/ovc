import { getTenantDb } from "@/lib/db";

export class CoreAuthService {
  static async getUserOrganizations(userId: string) {
    return getTenantDb().organizationMember.findMany({
      where: { userId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            logo: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }
}
