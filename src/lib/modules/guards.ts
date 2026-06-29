import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth/require-auth";
import { getOrganizationEntitlements, hasModule } from "@/lib/modules/entitlements";
import type { PlatformModuleCode } from "@/lib/modules/registry";

export async function requireLicensedModule(code: PlatformModuleCode) {
  const session = await requireAuth();
  const entitlements = await getOrganizationEntitlements(session.organizationId);

  if (!hasModule(entitlements, code)) {
    redirect(`/workspace/dashboard?module=${code.toLowerCase()}-disabled`);
  }

  return { session, entitlements };
}

export async function assertLicensedModule(code: PlatformModuleCode) {
  const session = await requireAuth();
  const entitlements = await getOrganizationEntitlements(session.organizationId);

  if (!hasModule(entitlements, code)) {
    throw new Error(`Module ${code} chưa được cấp cho workspace này`);
  }

  return session;
}
