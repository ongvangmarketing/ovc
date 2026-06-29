import "server-only";

import { db } from "@/lib/db";
import {
  defaultModuleCodes,
  moduleDefinitions,
  normalizeModuleCode,
  type PlatformModuleCode,
} from "@/lib/modules/registry";

export type OrganizationEntitlements = {
  organizationId: string;
  enabledModules: PlatformModuleCode[];
  source: "license" | "legacy" | "default";
};

function uniqueCodes(codes: Array<PlatformModuleCode | null | undefined>) {
  return Array.from(new Set(codes.filter(Boolean) as PlatformModuleCode[]));
}

function expandDependencies(codes: PlatformModuleCode[]) {
  const enabled = new Set<PlatformModuleCode>(codes);
  let changed = true;

  while (changed) {
    changed = false;
    for (const definition of moduleDefinitions) {
      if (!enabled.has(definition.code)) continue;
      for (const dependency of definition.dependencies) {
        if (!enabled.has(dependency)) {
          enabled.add(dependency);
          changed = true;
        }
      }
    }
  }

  return Array.from(enabled);
}

export async function getOrganizationEntitlements(organizationId: string): Promise<OrganizationEntitlements> {
  const organization = await db.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      activeModules: true,
      moduleLicenses: {
        where: {
          enabled: true,
          status: { in: ["ACTIVE", "TRIALING"] },
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          module: { status: "ACTIVE" },
        },
        select: {
          module: { select: { code: true } },
        },
      },
    },
  });

  if (!organization) {
    return { organizationId, enabledModules: [], source: "default" };
  }

  const licensedCodes = uniqueCodes(
    organization.moduleLicenses.map((license) => normalizeModuleCode(license.module.code))
  );

  if (licensedCodes.length > 0) {
    return {
      organizationId,
      enabledModules: expandDependencies(licensedCodes),
      source: "license",
    };
  }

  const legacyCodes = uniqueCodes(organization.activeModules.map((code) => normalizeModuleCode(code)));

  return {
    organizationId,
    enabledModules: expandDependencies(legacyCodes.length > 0 ? legacyCodes : defaultModuleCodes),
    source: legacyCodes.length > 0 ? "legacy" : "default",
  };
}

export function hasModule(entitlements: OrganizationEntitlements, code: PlatformModuleCode) {
  return entitlements.enabledModules.includes(code);
}

export async function organizationHasModule(organizationId: string, code: PlatformModuleCode) {
  const entitlements = await getOrganizationEntitlements(organizationId);
  return hasModule(entitlements, code);
}
