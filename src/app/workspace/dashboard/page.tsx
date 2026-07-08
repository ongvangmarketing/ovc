import type { Metadata } from "next";

import { getWorkspaceDashboard } from "@/app/actions/dashboard";
import { requireAuth } from "@/lib/auth/require-auth";

import { AppleDashboardClient } from "./apple-dashboard-client";

export const metadata: Metadata = {
  title: "Điều hành",
};

export default async function DashboardPage() {
  const session = await requireAuth();
  const data = await getWorkspaceDashboard();
  
  return (
    <AppleDashboardClient data={data} userName={session?.user?.name || "CEO"} />
  );
}
