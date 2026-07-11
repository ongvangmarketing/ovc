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
    <div className="relative h-full w-full bg-white overflow-hidden sm:min-h-screen">
      {/* Blurred Grid Pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:64px_64px]">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 m-auto h-[400px] w-[400px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>
      </div>
      
      <div className="relative z-10 h-full w-full">
        <AppLauncherClient
          activeModules={withDevelopmentModulesForRole(entitlements.enabledModules, authData.user.role)}
          initialPreferences={launcherPreferences}
        />
      </div>
    </div>
  );
}
