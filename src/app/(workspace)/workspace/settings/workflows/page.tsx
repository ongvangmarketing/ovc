import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/require-auth";
import { WorkflowList } from "./_components/workflow-list";
import { WorkflowService } from "@/lib/automation/workflow.service";

export const metadata: Metadata = { title: "Workflow Automation" };

export default async function WorkflowsPage() {
  const session = await requireAuth();
  WorkflowService.assertDevelopmentAccess(session.user.role);
  const workflows = await WorkflowService.list(session.organizationId);
  return <WorkflowList workflows={workflows} />;
}
