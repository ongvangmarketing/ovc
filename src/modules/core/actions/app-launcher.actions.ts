"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { getOrganizationEntitlements } from "@/lib/modules/entitlements";
import { moduleDefinitions, withDevelopmentModulesForRole } from "@/lib/modules/registry";
import { AppLauncherService } from "../services/app-launcher.service";
import type { AppLauncherPreferences } from "../types/app-launcher.types";

export async function saveAppLauncherPreferencesAction(value: AppLauncherPreferences) {
  const authData = await requireAuth();
  const entitlements = await getOrganizationEntitlements(authData.organizationId);
  const enabledModules = new Set(
    withDevelopmentModulesForRole(entitlements.enabledModules, authData.user.role),
  );
  const allowedCodes = [
    "DASHBOARD",
    ...moduleDefinitions
      .filter(
        (module) =>
          module.nav &&
          (enabledModules.has(module.code) || module.code === "SETTINGS" || module.code === "REPORTS"),
      )
      .map((module) => module.code),
  ];

  return AppLauncherService.savePreferences(
    authData.userId,
    authData.organizationId,
    value,
    allowedCodes,
  );
}
