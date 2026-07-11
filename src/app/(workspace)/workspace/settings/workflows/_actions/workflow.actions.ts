"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { WorkflowService } from "@/lib/automation/workflow.service";

export async function createWorkflowAction(formData: FormData) {
  const session = await requireAuth();
  WorkflowService.assertDevelopmentAccess(session.user.role);
  const workflow = await WorkflowService.create(session.organizationId, session.userId, {
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });
  redirect(`/workspace/workflows/${workflow.id}`);
}

export async function saveWorkflowDraftAction(workflowId: string, versionId: string, graph: unknown) {
  const session = await requireAuth();
  WorkflowService.assertDevelopmentAccess(session.user.role);
  await WorkflowService.saveDraft(session.organizationId, session.userId, workflowId, versionId, graph);
  revalidatePath(`/workspace/workflows/${workflowId}`);
  return { ok: true };
}

export async function publishWorkflowAction(workflowId: string) {
  const session = await requireAuth();
  WorkflowService.assertDevelopmentAccess(session.user.role);
  await WorkflowService.publish(session.organizationId, session.userId, workflowId);
  revalidatePath(`/workspace/workflows/${workflowId}`);
  revalidatePath("/workspace/workflows");
  return { ok: true };
}
