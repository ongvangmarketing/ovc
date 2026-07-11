import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getWorkspaceDashboard } from "@/actions/dashboard";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { ServerOrganizationSwitcher } from "@/components/layouts/server-organization-switcher";
import { auth } from "@/lib/auth";
import { requireAuth } from "@/lib/auth/require-auth";
import { getTenantDb } from "@/lib/db";
import { getOrganizationEntitlements } from "@/lib/modules/entitlements";

import { DashboardContainer, WorkspaceDashboard } from "@/app/(workspace)/workspace/dashboard/dashboard-client";
import { WorkspaceShellClient } from "@/app/(workspace)/workspace/workspace-shell-client";

export async function generateMetadata(): Promise<Metadata> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session?.activeOrganizationId) {
    return {
      title: {
        absolute: "Ong Vàng Workspace",
      },
      description: "Cổng đăng nhập và vận hành hệ thống Ong Vàng.",
    };
  }

  const organization = await getTenantDb().organization.findUnique({
    where: { id: session.session.activeOrganizationId },
    include: { settings: true },
  });
  const settings = Object.fromEntries(
    (organization?.settings ?? []).map((item) => [item.key, item.value || ""]),
  );
  const workspaceName = settings.company_workspace_name || settings.company_name || organization?.name || "Ong Vàng Workspace";
  const favicon = settings.company_favicon_url || organization?.logo || "/favicon.ico";

  return {
    title: {
      absolute: workspaceName,
    },
    description: `Cổng làm việc ${workspaceName}.`,
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
    openGraph: {
      title: workspaceName,
      siteName: workspaceName,
    },
  };
}

function parseDate(value: string | string[] | undefined, endOfDay = false) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}+07:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parsePeriod(value: string | string[] | undefined) {
  return typeof value === "string" && ["7d", "30d", "3m", "6m", "12m"].includes(value)
    ? value as "7d" | "30d" | "3m" | "6m" | "12m"
    : "6m";
}

function dateValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function rangeFromPeriod(period: "7d" | "30d" | "3m" | "6m" | "12m") {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  const from = new Date(to);
  from.setHours(0, 0, 0, 0);
  if (period.endsWith("d")) {
    from.setDate(from.getDate() - Number(period.replace("d", "")) + 1);
  } else {
    from.setMonth(from.getMonth() - Number(period.replace("m", "")) + 1);
    from.setDate(1);
  }

  return { from, to };
}

type AppEntryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AppEntryPage({ searchParams }: AppEntryPageProps) {
  const query = await searchParams;
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
    redirect("/customer");
  }

  if (role === "INSTRUCTOR") {
    redirect("/instructor");
  }

  if (role === "STUDENT") {
    redirect("/student");
  }

  const workspaceSession = await requireAuth();
  const period = parsePeriod(query.period);
  const from = parseDate(query.from);
  const to = parseDate(query.to, true);
  const customRange = from && to && from <= to ? { from, to } : undefined;
  const range = customRange ?? rangeFromPeriod(period);
  const [entitlements, dashboard, organization] = await Promise.all([
    getOrganizationEntitlements(workspaceSession.organizationId),
    getWorkspaceDashboard(range),
    getTenantDb().organization.findUnique({
      where: { id: workspaceSession.organizationId },
      include: { settings: true },
    }),
  ]);
  const organizationSettings = Object.fromEntries(
    (organization?.settings ?? []).map((item) => [item.key, item.value || ""]),
  );
  const brand = organization
    ? {
        name: organizationSettings.company_workspace_name || organizationSettings.company_name || organization.name,
        logo: organizationSettings.company_favicon_url || organization.logo,
      }
    : undefined;

  return (
    <WorkspaceShellClient enabledModuleCodes={entitlements.enabledModules} brand={brand} switcher={<ServerOrganizationSwitcher />}>
      <DashboardContainer>
        <WorkspaceDashboard
          data={dashboard}
          dateFrom={customRange ? query.from as string : dateValue(range.from)}
          dateTo={customRange ? query.to as string : dateValue(range.to)}
          period={period}
        />
      </DashboardContainer>
    </WorkspaceShellClient>
  );
}
