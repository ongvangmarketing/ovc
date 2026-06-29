import { UserRole } from "@prisma/client";

import { ROLE_PERMISSIONS } from "@/config/permissions";
import { requireAuth } from "@/lib/auth/require-auth";
import { getOrganizationEntitlements, hasModule } from "@/lib/modules/entitlements";
import type { ProjectPermission } from "@/modules/projects/constants/project-permissions";

export type ProjectModuleSession = Awaited<ReturnType<typeof requireProjectModule>>;

export async function requireProjectModule(permission: ProjectPermission) {
  const session = await requireAuth();
  if (!session.organizationId) {
    throw new Error("Forbidden: No organization context");
  }

  const entitlements = await getOrganizationEntitlements(session.organizationId);
  if (!hasModule(entitlements, "PROJECTS")) {
    throw new Error("Forbidden: Module PROJECTS chưa được kích hoạt");
  }

  const role = session.user.role as UserRole;
  const permissions = ROLE_PERMISSIONS[role] || [];
  const hasPermission = role === "SUPER_ADMIN" || permissions.includes(permission);

  if (!hasPermission) {
    throw new Error(`Forbidden: Missing permission ${permission}`);
  }

  return {
    session,
    organizationId: session.organizationId,
    userId: session.user.id,
  };
}
