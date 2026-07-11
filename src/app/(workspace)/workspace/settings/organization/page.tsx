import { OrganizationDashboardClient } from "@/modules/core/components/organization/organization-dashboard-client";
import { OrganizationService } from "@/lib/services/organization.service";
import { requireAuth } from "@/lib/auth/require-auth";

export default async function OrganizationSettingsPage() {
  const session = await requireAuth();
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    throw new Error("Không có quyền truy cập. Chỉ dành cho Quản trị viên.");
  }

  // Fetch initial data to pass to client component
  const orgId = session.organizationId;
  const profile = await OrganizationService.getProfile(orgId);
  const brand = await OrganizationService.getBrand(orgId);
  const locale = await OrganizationService.getLocale(orgId);
  const activeModules = await OrganizationService.getModules(orgId);

  return (
    <OrganizationDashboardClient
      initialProfile={profile}
      initialBrand={brand}
      initialLocale={locale}
      initialModules={activeModules}
    />
  );
}
