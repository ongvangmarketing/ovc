import { createHash } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { WorkflowRepository } from "./repositories/workflow.repository";
import { EMPTY_WORKFLOW_GRAPH, type WorkflowGraph, type WorkflowSummary } from "@/lib/automation/types/workflow.types";
import { WorkflowGraphSchema } from "./types/workflow.schemas";
import { WorkflowValidatorService } from "./workflow-validator.service";

function checksum(graph: WorkflowGraph) {
  return createHash("sha256").update(JSON.stringify(graph)).digest("hex");
}

export class WorkflowService {
  static assertDevelopmentAccess(role?: string | null) {
    if (role !== "SUPER_ADMIN") {
      throw new Error("Workflow đang ở giai đoạn Development và chỉ dành cho Super Admin.");
    }
  }

  static async transaction(callback: (tx: any) => Promise<any>) {
    return WorkflowRepository.transaction(callback);
  }

  static async list(organizationId: string): Promise<WorkflowSummary[]> {
    const workflows = await WorkflowRepository.list(organizationId);
    return workflows.map((w: any) => ({
      id: w.id,
      name: w.name,
      description: w.description || "",
      status: w.status,
      updatedAt: w.updatedAt.toISOString(),
      createdAt: w.createdAt.toISOString(),
      publishedVersion: w.publishedVersion,
      executionCount: w._count?.executions || 0,
    }));
  }

  static get(organizationId: string, workflowId: string) {
    return WorkflowRepository.find(organizationId, workflowId);
  }

  static async create(organizationId: string, userId: string, input: unknown) {
    const validated = WorkflowGraphSchema.safeParse(input);
    if (!validated.success) throw new Error("Invalid workflow data");
    const workflow = await WorkflowRepository.create(organizationId, userId, validated.data.name, validated.data.description);
    const version = await WorkflowRepository.createVersion(
      organizationId,
      workflow.id,
      1,
      EMPTY_WORKFLOW_GRAPH as unknown as Prisma.InputJsonValue,
      checksum(EMPTY_WORKFLOW_GRAPH),
    );
    await WorkflowRepository.updateDraft(
      organizationId,
      workflow.id,
      version.id,
      EMPTY_WORKFLOW_GRAPH as unknown as Prisma.InputJsonValue,
      checksum(EMPTY_WORKFLOW_GRAPH),
      userId,
    );
    return workflow;
  }

  static async saveDraft(
    organizationId: string,
    userId: string,
    workflowId: string,
    versionId: string,
    input: unknown,
  ) {
    const result = WorkflowValidatorService.validate(input);
    if (!result.graph) throw new Error(result.errors.join("\n"));
    return WorkflowRepository.updateDraft(
      organizationId,
      workflowId,
      versionId,
      result.graph as unknown as Prisma.InputJsonValue,
      checksum(result.graph),
      userId,
    );
  }

  static async publish(organizationId: string, userId: string, workflowId: string) {
    const workflow = await WorkflowRepository.find(organizationId, workflowId);
    if (!workflow?.currentDraftVersionId) throw new Error("Workflow chưa có draft.");
    const draft = workflow.versions.find((version: any) => version.id === workflow.currentDraftVersionId);
    if (!draft) throw new Error("Không tìm thấy draft hiện tại.");

    const validation = WorkflowValidatorService.validate(draft.graph);
    if (!validation.graph || validation.errors.length) throw new Error(validation.errors.join("\n"));
    const trigger = validation.graph.nodes.find((node) => node.type === "TRIGGER");
    if (!trigger) throw new Error("Workflow chưa có trigger.");

    await WorkflowRepository.transaction(organizationId, async (tx: any) => {
      await tx.workflowVersion.update({
        where: { id: draft.id },
        data: { state: "PUBLISHED", publishedAt: new Date(), publishedById: userId, validationErrors: undefined },
      });
      await tx.workflowTrigger.deleteMany({ where: { workflowId, organizationId } });
      await tx.workflowTrigger.create({
        data: {
          organizationId,
          workflowId,
          workflowVersionId: draft.id,
          triggerType: trigger.type === "TRIGGER" ? "EVENT" : trigger.type,
          triggerKey: String(trigger.config.eventName || trigger.handlerKey),
          configuration: trigger.config as Prisma.InputJsonValue,
        },
      });
      const nextDraft = await tx.workflowVersion.create({
        data: {
          organizationId,
          workflowId,
          version: draft.version + 1,
          state: "DRAFT",
          graph: draft.graph as Prisma.InputJsonValue,
          checksum: draft.checksum,
        },
      });
      await tx.workflow.update({
        where: { id: workflowId },
        data: { status: "PUBLISHED", publishedVersionId: draft.id, currentDraftVersionId: nextDraft.id, updatedById: userId },
      });
    });
  }
}
