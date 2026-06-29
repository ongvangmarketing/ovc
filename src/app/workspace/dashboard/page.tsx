import type { Metadata } from "next";

import { getWorkspaceDashboard } from "@/app/actions/dashboard";

import { DashboardContainer, WorkspaceDashboard } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Tổng quan",
};

export default async function DashboardPage() {
  const dashboard = await getWorkspaceDashboard();

  return (
    <DashboardContainer>
      <WorkspaceDashboard data={dashboard} />
    </DashboardContainer>
  );
}
