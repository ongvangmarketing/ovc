import type { Metadata } from "next";

import { getWorkspaceDashboard } from "@/actions/dashboard";
import { requireAuth } from "@/lib/auth/require-auth";

import { AppleDashboardClient } from "../dashboard/apple-dashboard-client";

export const metadata: Metadata = {
  title: "Bàn làm việc",
};

export default async function MyWorksPage() {
  const session = await requireAuth();
  const data = await getWorkspaceDashboard();
  
  return (
    <AppleDashboardClient
      data={data}
      userName={session?.user?.name || "CEO"}
      showAIPreview={session.user.role === "SUPER_ADMIN"}
    />
  );
}
