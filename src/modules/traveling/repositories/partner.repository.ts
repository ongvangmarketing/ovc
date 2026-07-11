import { getTenantDb } from "@/lib/db";

export class PartnerRepository {
  static async findTravelingAgents(organizationId: string) {
    return await getTenantDb().organizationMember.findMany({
      where: {
        organizationId,
        user: { role: "AGENT" }
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, isActive: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  static async findMemberWithUser(memberId: string) {
    return await getTenantDb().organizationMember.findUnique({
      where: { id: memberId },
      include: { user: true }
    });
  }

  static async updateMemberPermissions(memberId: string, permissions: string[]) {
    return await getTenantDb().organizationMember.update({
      where: { id: memberId },
      data: { permissions }
    });
  }
}
