import { getTenantDb } from "@/lib/db";
import type { AppLauncherPreferences } from "../types/app-launcher.types";

export class AppLauncherRepository {
  static async findPreferences(userId: string, organizationId: string) {
    return getTenantDb().organizationMember.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
      select: { launcherPreferences: true },
    });
  }

  static async savePreferences(
    userId: string,
    organizationId: string,
    preferences: AppLauncherPreferences,
  ) {
    return getTenantDb().organizationMember.update({
      where: { organizationId_userId: { organizationId, userId } },
      data: { launcherPreferences: preferences },
      select: { id: true },
    });
  }
}
