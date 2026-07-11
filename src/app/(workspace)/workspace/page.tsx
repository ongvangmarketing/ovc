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
    <div className="relative h-full w-full bg-[#111] overflow-hidden sm:min-h-screen">
      {/* Background texture from hero */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="https://ovc.vn/wp-content/uploads/2025/07/bg-slide.webp"
          alt="Hero background"
          className="h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#111]/70 via-[#111]/50 to-[#111]" />
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
