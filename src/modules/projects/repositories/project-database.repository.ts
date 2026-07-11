import { getTenantDb } from "@/lib/db";
import { Prisma } from "@prisma/client";

export class ProjectDatabaseRepository {
  static async findDatabaseByIdAndOrg(databaseId: string, organizationId: string) {
    return getTenantDb().projectDatabase.findFirst({
      where: { id: databaseId, organizationId, deletedAt: null },
      include: { project: { select: { id: true, name: true } } },
    });
  }

  static async findFieldById(fieldId: string, databaseId: string) {
    return getTenantDb().projectDatabaseField.findFirst({
      where: { id: fieldId, databaseId },
    });
  }

  static async findViewById(viewId: string, databaseId: string) {
    return getTenantDb().projectDatabaseView.findFirst({
      where: { id: viewId, databaseId },
    });
  }
}
