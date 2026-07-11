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
    <div className="relative h-full w-full overflow-hidden sm:min-h-screen">
      <div className="relative z-10 h-full w-full">
        <AppLauncherClient
          activeModules={withDevelopmentModulesForRole(entitlements.enabledModules, authData.user.role)}
          initialPreferences={launcherPreferences}
        />
      </div>
    </div>
  );
}
