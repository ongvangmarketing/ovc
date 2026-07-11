import { getTenantDb } from "@/lib/db";
import { Prisma } from "@prisma/client";

export class ProjectRepository {
  static async findProjectByIdAndOrg(projectId: string, organizationId: string) {
    return getTenantDb().project.findFirst({
      where: { id: projectId, organizationId },
      select: { id: true, name: true },
    });
  }

  static async countProjects(organizationId: string) {
    return getTenantDb().project.count({
      where: { organizationId },
    });
  }
}
