import { ServerOrganizationSwitcher } from "@/components/layouts/server-organization-switcher";
import { requireAuth } from "@/lib/auth/require-auth";
import { getOrganizationEntitlements } from "@/lib/modules/entitlements";
import { WorkspaceShellClient } from "./workspace-shell-client";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const entitlements = await getOrganizationEntitlements(session.organizationId);

  return (
    <WorkspaceShellClient enabledModuleCodes={entitlements.enabledModules} switcher={<ServerOrganizationSwitcher />}>
      {children}
    </WorkspaceShellClient>
  );
}
