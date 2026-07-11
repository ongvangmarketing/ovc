import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { WorkflowEditor } from "../_components/workflow-editor";
import { EventCatalogRegistry } from "@/lib/automation/event-catalog.registry";
import { WorkflowService } from "@/lib/automation/workflow.service";
import { HandlerRegistry } from "@/lib/automation/handler.registry";
import type { WorkflowGraph } from "@/lib/automation/types/workflow.types";

export const metadata: Metadata = { title: "Workflow Editor" };

export default async function WorkflowEditorPage({
  params,
}: {
  params: Promise<{ workflowId: string }>;
}) {
  const session = await requireAuth();
  WorkflowService.assertDevelopmentAccess(session.user.role);
  const { workflowId } = await params;
  const workflow = await WorkflowService.get(session.organizationId, workflowId);
  if (!workflow) notFound();

  const draft = workflow.versions.find((version: any) => version.id === workflow.currentDraftVersionId)
    ?? workflow.versions.find((version: any) => version.state === "DRAFT");
  if (!draft) notFound();

  return (
    <WorkflowEditor
      workflowId={workflow.id}
      workflowName={workflow.name}
      versionId={draft.id}
      initialGraph={draft.graph as unknown as WorkflowGraph}
      events={EventCatalogRegistry.list()}
      handlers={HandlerRegistry.list()}
      published={workflow.status === "PUBLISHED"}
    />
  );
}
