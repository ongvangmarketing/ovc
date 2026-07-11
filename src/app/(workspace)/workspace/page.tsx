import { requireAuth } from "@/lib/auth/require-auth";
import AppLauncherClient from "@/modules/core/components/app-launcher-client";
import { getOrganizationEntitlements } from "@/lib/modules/entitlements";
import { withDevelopmentModulesForRole } from "@/lib/modules/registry";
import { AppLauncherService } from "@/modules/core/services/app-launcher.service";

export default async function WorkspaceIndex() {
  const authData = await requireAuth();

  const [entitlements, launcherPreferences] = await Promise.all([
    getOrganizationEntitlements(authData.organizationId),
    AppLauncherService.getPreferences(authData.userId, authData.organizationId),
  ]);

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <div className="max-w-6xl mx-auto p-8 pt-12">
        <AppLauncherClient
          activeModules={withDevelopmentModulesForRole(entitlements.enabledModules, authData.user.role)}
          initialPreferences={launcherPreferences}
        />
      </div>
    </div>
  );
}
