export type JsonObject = { [key: string]: any };

export type PlatformEvent = {
  id: string;
  name: string;
  version: number;
  organizationId: string;
  sourceModule: string;
  occurredAt: string;
  payload: JsonObject;
  aggregate?: { id: string; type: string };
  metadata?: JsonObject;
};

export type WorkflowNodeType = "TRIGGER" | "ACTION" | "CONDITION" | "END" | "DELAY" | "BRANCH";

export type WorkflowNode = {
  id: string;
  type: WorkflowNodeType;
  name?: string;
  config?: any;
  handlerKey?: string;
  handlerVersion?: number;
  position?: { x: number; y: number };
};

export type ExecutionContext = any;
export type ActionResult = any;

export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
};

export type WorkflowGraph = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  settings?: any;
};

export const EMPTY_WORKFLOW_GRAPH: WorkflowGraph = { nodes: [], edges: [] };

export type EventDefinition = {
  name: string;
  version: number;
  description: string;
  schema?: any;
};

export type HandlerDefinition = {
  key: string;
  name?: string;
  displayName?: string;
  version: number;
  description: string;
  schema?: any;
  nodeType?: string;
};

export type WorkflowSummary = {
  id: string;
  name: string;
  description?: string;
  status: string;
  executionCount?: number;
  createdAt: Date;
  updatedAt: Date;
};
