import type { Metadata } from "next";
import { cookies } from "next/headers";

import { ServerOrganizationSwitcher } from "@/components/layouts/server-organization-switcher";
import { requireAuth } from "@/lib/auth/require-auth";
import { getTenantDb } from "@/lib/db";
import { getOrganizationEntitlements } from "@/lib/modules/entitlements";
import { withDevelopmentModulesForRole } from "@/lib/modules/registry";
import { WorkspaceShellClient } from "./workspace-shell-client";
import { AppLauncherService } from "@/modules/core/services/app-launcher.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata(): Promise<Metadata> {
  const session = await requireAuth();
  const organization = await getTenantDb().organization.findUnique({
    where: { id: session.organizationId },
    include: { settings: true },
  });
  const settings = Object.fromEntries(
    (organization?.settings ?? []).map((item) => [item.key, item.value || ""]),
  );
  const workspaceName = settings.company_workspace_name || settings.company_name || organization?.name || "Workspace";
  const favicon = settings.company_favicon_url || organization?.logo || "";

  return {
    applicationName: workspaceName,
    title: {
      template: `%s | ${workspaceName}`,
      default: workspaceName,
    },
    openGraph: {
      title: workspaceName,
      siteName: workspaceName,
    },
    icons: favicon ? { icon: favicon, shortcut: favicon, apple: favicon } : undefined,
  };
}

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const sidebarCollapsed = (await cookies()).get("ovc_sidebar_collapsed")?.value === "true";
  const [entitlements, organization, launcherPreferences] = await Promise.all([
    getOrganizationEntitlements(session.organizationId),
    getTenantDb().organization.findUnique({
      where: { id: session.organizationId },
      include: { settings: true },
    }),
    AppLauncherService.getPreferences(session.userId, session.organizationId),
  ]);
  const settings = Object.fromEntries(
    (organization?.settings ?? []).map((item) => [item.key, item.value || ""]),
  );
  const brand = organization
    ? {
        name: settings.company_workspace_name || settings.company_name || organization.name,
        logo: settings.company_favicon_url || organization.logo,
      }
    : undefined;
  const currentUser = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: session.user.role,
    organizationId: session.organizationId,
  };
  const visibleModuleCodes = withDevelopmentModulesForRole(entitlements.enabledModules, session.user.role);

  return (
    <WorkspaceShellClient initialSidebarCollapsed={sidebarCollapsed} enabledModuleCodes={visibleModuleCodes} launcherPreferences={launcherPreferences} brand={brand} currentUser={currentUser} switcher={<ServerOrganizationSwitcher />}>
      {children}
    </WorkspaceShellClient>
  );
}
