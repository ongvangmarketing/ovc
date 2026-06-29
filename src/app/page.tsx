import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getWorkspaceDashboard } from "@/app/actions/dashboard";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { ServerOrganizationSwitcher } from "@/components/layouts/server-organization-switcher";
import { auth } from "@/lib/auth";
import { requireAuth } from "@/lib/auth/require-auth";
import { getOrganizationEntitlements } from "@/lib/modules/entitlements";

import { DashboardContainer, WorkspaceDashboard } from "./workspace/dashboard/dashboard-client";
import { WorkspaceShellClient } from "./workspace/workspace-shell-client";

export const metadata: Metadata = {
  title: "Ong Vàng App",
  description: "Cổng đăng nhập và vận hành hệ thống Ong Vàng.",
};

export default async function AppEntryPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return (
      <AuthShell>
        <LoginForm />
      </AuthShell>
    );
  }

  const role = session.user.role || "";

  if (role === "CUSTOMER") {
    redirect("/portal");
  }

  if (role === "INSTRUCTOR") {
    redirect("/instructor");
  }

  if (role === "STUDENT") {
    redirect("/student");
  }

  const workspaceSession = await requireAuth();
  const [entitlements, dashboard] = await Promise.all([
    getOrganizationEntitlements(workspaceSession.organizationId),
    getWorkspaceDashboard(),
  ]);

  return (
    <WorkspaceShellClient enabledModuleCodes={entitlements.enabledModules} switcher={<ServerOrganizationSwitcher />}>
      <DashboardContainer>
        <WorkspaceDashboard data={dashboard} />
      </DashboardContainer>
    </WorkspaceShellClient>
  );
}
