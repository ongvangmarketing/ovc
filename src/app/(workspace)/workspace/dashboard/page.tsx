import type { Metadata } from "next";
import { AppleDashboardClient } from "./apple-dashboard-client";
import { requireAuth } from "@/lib/auth/require-auth";
import { getWorkspaceDashboard } from "@/actions/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await requireAuth();
  const data = await getWorkspaceDashboard();
  return <AppleDashboardClient data={data} userName={session.user.name || "Bạn"} />;
}
