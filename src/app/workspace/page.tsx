import { getWorkspaceDashboard } from "@/app/actions/dashboard";
import { DashboardContainer, WorkspaceDashboard } from "./dashboard/dashboard-client";

export default async function WorkspaceIndex() {
  const data = await getWorkspaceDashboard();
  
  return (
    <DashboardContainer>
      <WorkspaceDashboard data={data} period="6m" />
    </DashboardContainer>
  );
}
