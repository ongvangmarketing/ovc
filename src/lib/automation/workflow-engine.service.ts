import type { Prisma } from "@prisma/client";
import { getTenantDb } from "@/lib/db";
import type { JsonObject, PlatformEvent, WorkflowGraph, WorkflowNode } from "@/lib/automation/types/workflow.types";
import { HandlerRegistry } from "./handler.registry";
import { WorkflowValidatorService } from "./workflow-validator.service";

function readPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => {
    if (!value || typeof value !== "object") return undefined;
    return (value as Record<string, unknown>)[key];
  }, source);
}

function evaluate(node: WorkflowNode, context: JsonObject) {
  const left = readPath(context, String(node.config.field || ""));
  const operator = String(node.config.operator || "EQUALS");
  const right = node.config.value;
  if (operator === "EXISTS") return left !== undefined && left !== null;
  if (operator === "EMPTY") return left === undefined || left === null || left === "";
  if (operator === "NOT_EQUALS") return left !== right;
  if (operator === "CONTAINS") return String(left ?? "").includes(String(right ?? ""));
  if (operator === "GREATER_THAN") return Number(left) > Number(right);
  if (operator === "LESS_THAN") return Number(left) < Number(right);
  return left === right;
}

export class WorkflowEngineService {
  static async start(input: {
    organizationId: string;
    workflowId: string;
    workflowVersionId: string;
    triggerId: string;
    event: PlatformEvent;
  }) {
    const db = getTenantDb(input.organizationId);
    const idempotencyKey = `${input.event.id}:${input.workflowVersionId}`;
    return db.workflowExecution.upsert({
      where: { organizationId_idempotencyKey: { organizationId: input.organizationId, idempotencyKey } },
      create: {
        organizationId: input.organizationId,
        workflowId: input.workflowId,
        workflowVersionId: input.workflowVersionId,
        triggerId: input.triggerId,
        eventId: input.event.id,
        idempotencyKey,
        context: { event: input.event, variables: {} } as unknown as Prisma.InputJsonValue,
      },
      update: {},
    });
  }

  static async run(organizationId: string, executionId: string) {
    const db = getTenantDb(organizationId);
    const execution = await db.workflowExecution.findFirst({
      where: { id: executionId, organizationId },
      include: { version: true },
    });
    if (!execution || !["QUEUED", "RUNNING"].includes(execution.status)) return execution;

    const validation = WorkflowValidatorService.validate(execution.version.graph);
    if (!validation.graph) throw new Error(validation.errors.join("\n"));
    const graph = validation.graph as WorkflowGraph;
    const context = execution.context as JsonObject;
    const startedAt = execution.startedAt ?? new Date();

    await db.workflowExecution.update({
      where: { id: execution.id },
      data: { status: "RUNNING", startedAt, attempt: { increment: 1 } },
    });

    try {
      let node = graph.nodes.find((item) => item.id === execution.currentNodeId)
        ?? graph.nodes.find((item) => item.type === "TRIGGER");
      let steps = 0;

      while (node && steps < graph.settings.maxSteps) {
        const stepStarted = Date.now();
        await db.workflowExecutionLog.create({
          data: { organizationId, executionId, nodeId: node.id, nodeType: node.type, status: "STARTED", input: context as Prisma.InputJsonValue },
        });

        if (node.type === "END") {
          await db.workflowExecutionLog.create({
            data: { organizationId, executionId, nodeId: node.id, nodeType: node.type, status: "SUCCEEDED", durationMs: Date.now() - stepStarted },
          });
          return db.workflowExecution.update({
            where: { id: executionId },
            data: { status: "SUCCEEDED", currentNodeId: node.id, finishedAt: new Date() },
          });
        }

        let sourceHandle: string | undefined;
        if (node.type === "CONDITION") sourceHandle = evaluate(node, context) ? "true" : "false";
        if (node.type === "DELAY") {
          const seconds = Math.max(1, Math.min(86_400, Number(node.config.seconds || 60)));
          await db.workflowExecution.update({
            where: { id: executionId },
            data: { status: "WAITING", currentNodeId: node.id, timeoutAt: new Date(Date.now() + seconds * 1_000) },
          });
          return;
        }
        if (node.handlerKey) {
          const handler = HandlerRegistry.getAction(node.handlerKey, node.handlerVersion ?? 1);
          if (!handler) throw new Error(`Action handler chưa được đăng ký: ${node.handlerKey}@${node.handlerVersion}`);
          const result = await handler.execute(
            {
              executionId,
              organizationId,
              workflowId: execution.workflowId,
              workflowVersionId: execution.workflowVersionId,
              event: (context.event ?? {}) as PlatformEvent,
              variables: (context.variables ?? {}) as JsonObject,
            },
            node.config,
          );
          if (result.output) {
            context.variables = { ...((context.variables ?? {}) as JsonObject), [node.id]: result.output };
            await db.workflowExecution.update({
              where: { id: executionId },
              data: { context: context as Prisma.InputJsonValue, currentNodeId: node.id },
            });
          }
        }

        const edge = graph.edges.find((item) =>
          item.source === node?.id && (!sourceHandle || !item.sourceHandle || item.sourceHandle === sourceHandle),
        );
        await db.workflowExecutionLog.create({
          data: { organizationId, executionId, nodeId: node.id, nodeType: node.type, status: "SUCCEEDED", durationMs: Date.now() - stepStarted },
        });
        node = edge ? graph.nodes.find((item) => item.id === edge.target) : undefined;
        steps += 1;
      }

      throw new Error(node ? "Workflow vượt quá giới hạn số bước." : "Workflow không có đường dẫn tới End.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Workflow execution failed";
      await db.workflowExecutionLog.create({
        data: { organizationId, executionId, nodeType: "ENGINE", level: "ERROR", status: "FAILED", errorMessage: message },
      });
      return db.workflowExecution.update({
        where: { id: executionId },
        data: { status: "FAILED", error: { message }, finishedAt: new Date() },
      });
    }
  }
}
