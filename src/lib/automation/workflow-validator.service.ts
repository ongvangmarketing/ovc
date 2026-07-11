import { EventCatalogRegistry } from "./event-catalog.registry";
import { HandlerRegistry } from "./handler.registry";
import { WorkflowGraphSchema as workflowGraphSchema } from "./types/workflow.schemas";
import type { WorkflowGraph } from "@/lib/automation/types/workflow.types";

export class WorkflowValidatorService {
  static validate(input: unknown): { graph?: WorkflowGraph; errors: string[] } {
    const parsed = workflowGraphSchema.safeParse(input);
    if (!parsed.success) {
      return { errors: (parsed as any).error.issues.map((issue: any) => `${issue.path.join(".")}: ${issue.message}`) };
    }

    const graph = parsed.data as WorkflowGraph;
    const errors: string[] = [];
    const ids = new Set(graph.nodes.map((node) => node.id));

    const triggers = graph.nodes.filter((node) => node.type === "TRIGGER");
    const ends = graph.nodes.filter((node) => node.type === "END");

    if (new Set(graph.nodes.map((node) => node.id)).size !== graph.nodes.length) errors.push("Node ID phải duy nhất.");
    if (triggers.length < 1) errors.push("Workflow phải có ít nhất một Trigger.");
    if (ends.length < 1) errors.push("Workflow phải có ít nhất một End.");

    for (const node of graph.nodes) {
      if (!node.handlerKey) {
        errors.push(`Node ${node.id} thiếu handlerKey.`);
      } else if (!HandlerRegistry.has(node.handlerKey, node.handlerVersion ?? 1)) {
        errors.push(`Handler không tồn tại: ${node.handlerKey}@${node.handlerVersion}.`);
      }
      if (node.type === "TRIGGER" && node.handlerKey === "event.received") {
        const eventName = String(node.config.eventName || "");
        if (!EventCatalogRegistry.get(eventName)) errors.push(`Event không có trong catalog: ${eventName}.`);
      }
    }

    for (const edge of graph.edges) {
      if (!ids.has(edge.source) || !ids.has(edge.target)) errors.push(`Edge ${edge.id} tham chiếu node không tồn tại.`);
      if (edge.source === edge.target) errors.push(`Node ${edge.source} không thể tự nối với chính nó.`);
    }

    return { graph, errors };
  }
}
