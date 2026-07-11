"use client";

import { useCallback, useEffect, type DragEvent } from "react";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { CheckCircle2, Clock3, GitBranch, Play, Zap, AlertCircle, Send, MessageSquare, Database, FileText, Link, ShieldCheck, Calculator } from "lucide-react";
import type { WorkflowGraph, WorkflowNode } from "@/lib/automation/types/workflow.types";

const icons: Record<string, any> = { TRIGGER: Zap, CONDITION: GitBranch, ACTION: Play, DELAY: Clock3, BRANCH: GitBranch, END: CheckCircle2 };
const actionIcons: Record<string, any> = {
  "email.send": Send,
  "sms.send": MessageSquare,
  "slack.send": MessageSquare,
  "record.create": Database,
  "record.update": Database,
  "record.delete": Database,
  "document.generate": FileText,
  "invoice.generate": FileText,
  "contract.generate": FileText,
  "payment.create": Link,
  "approval.request": ShieldCheck,
  "math.calculate": Calculator,
  "file.upload": FileText,
  "data.transform": Database,
  "user.assign": Zap,
  "task.create": Zap,
  "zalo.send": Send,
  "notification.send": Send,
  "http.request": Link,
  "webhook.send": Link,
  "ai.call": Zap,
};

type CanvasNode = Node<{ workflowNode: WorkflowNode }, "workflow">;

function WorkflowCanvasNode({ data, selected }: NodeProps<CanvasNode>) {
  const node = data.workflowNode;
  const Icon = actionIcons[node.handlerKey || ""] || icons[node.type] || AlertCircle;
  const acceptsInput = node.type !== "TRIGGER";
  const emitsOutput = node.type !== "END";
  return (
    <div className={`min-w-[210px] rounded-xl border bg-white p-3 shadow-sm dark:bg-slate-950 ${selected ? "border-orange-400 ring-2 ring-orange-100 dark:ring-orange-950" : "border-slate-200 dark:border-slate-800"}`}>
      {acceptsInput && <Handle type="target" position={Position.Top} className="!h-3 !w-3 !border-2 !border-white !bg-slate-500" />}
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 dark:bg-slate-900"><Icon className="h-4 w-4" /></span>
        <span>
          <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-400">{node.type}</span>
          <span className="block text-sm font-medium text-slate-900 dark:text-slate-100">{node.name}</span>
        </span>
      </div>
      {emitsOutput && <Handle type="source" position={Position.Bottom} className="!h-3 !w-3 !border-2 !border-white !bg-orange-500" />}
    </div>
  );
}

const nodeTypes = { workflow: WorkflowCanvasNode };

function toCanvasNodes(graph: WorkflowGraph, selectedId?: string): CanvasNode[] {
  return graph.nodes.map((node) => ({ id: node.id, type: "workflow", position: node.position || { x: 0, y: 0 }, selected: node.id === selectedId, data: { workflowNode: node } }));
}

function toCanvasEdges(graph: WorkflowGraph): Edge[] {
  return graph.edges.map((edge) => ({
    ...edge,
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { strokeWidth: 1.6 },
  }));
}

function GraphSurface({
  graph,
  selectedId,
  onChange,
  onSelect,
}: {
  graph: WorkflowGraph;
  selectedId?: string;
  onChange(graph: WorkflowGraph): void;
  onSelect(nodeId: string): void;
}) {
  const { screenToFlowPosition } = useReactFlow();
  
  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Sync from parent graph to local canvas state safely
  useEffect(() => {
    setNodes(toCanvasNodes(graph, selectedId));
    setEdges(toCanvasEdges(graph));
  }, [graph, selectedId, setNodes, setEdges]);

  // Sync node positions back to parent on drag stop
  const onNodeDragStop = useCallback((_: any, node: any) => {
    onChange({
      ...graph,
      nodes: graph.nodes.map((n) => n.id === node.id ? { ...n, position: node.position } : n),
    });
  }, [graph, onChange]);

  // Handle new connections
  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target || connection.source === connection.target) return;
    const newEdges = addEdge({ ...connection, id: `edge-${crypto.randomUUID()}`, type: "smoothstep" }, edges);
    onChange({ ...graph, edges: newEdges.map((edge) => ({ id: edge.id, source: edge.source, target: edge.target, sourceHandle: edge.sourceHandle ?? undefined })) });
  }, [graph, edges, onChange]);

  // Handle node deletions via keyboard
  const onNodesDelete = useCallback((deleted: Node[]) => {
    const deletedIds = new Set(deleted.map((n) => n.id));
    onChange({
      ...graph,
      nodes: graph.nodes.filter((n) => !deletedIds.has(n.id)),
      edges: graph.edges.filter((e) => !deletedIds.has(e.source) && !deletedIds.has(e.target)),
    });
  }, [graph, onChange]);

  // Handle edge deletions via keyboard
  const onEdgesDelete = useCallback((deleted: Edge[]) => {
    const deletedIds = new Set(deleted.map((e) => e.id));
    onChange({
      ...graph,
      edges: graph.edges.filter((e) => !deletedIds.has(e.id)),
    });
  }, [graph, onChange]);

  const onDrop = useCallback((event: DragEvent) => {
    event.preventDefault();
    try {
      const dataString = event.dataTransfer.getData("application/ovc-workflow-node");
      if (!dataString) return;
      const item = JSON.parse(dataString);
      if (!item.type || !item.handlerKey) return;

      const id = `${item.type.toLowerCase()}-${crypto.randomUUID()}`;
      const node: WorkflowNode = {
        id,
        type: item.type,
        handlerKey: item.handlerKey,
        handlerVersion: 1,
        name: item.name,
        position: screenToFlowPosition({ x: event.clientX, y: event.clientY }),
        config: item.type === "DELAY" ? { seconds: 60 } : {},
      };
      onChange({ ...graph, nodes: [...graph.nodes, node] });
      onSelect(id);
    } catch (e) {
      // Bỏ qua nếu data không hợp lệ
    }
  }, [graph, onChange, onSelect, screenToFlowPosition]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={(_, node) => onSelect(node.id)}
      onNodeDragStop={onNodeDragStop}
      onNodesDelete={onNodesDelete}
      onEdgesDelete={onEdgesDelete}
      onDrop={onDrop}
      onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }}
      fitView
      snapToGrid
      snapGrid={[16, 16]}
      deleteKeyCode={["Backspace", "Delete"]}
      defaultEdgeOptions={{ type: "smoothstep", markerEnd: { type: MarkerType.ArrowClosed } }}
      style={{ width: "100%", height: "100%" }}
    >
      <Controls />
      <Background gap={20} size={1} />
    </ReactFlow>
  );
}

export function WorkflowCanvas(props: {
  graph: WorkflowGraph;
  selectedId?: string;
  onChange(graph: WorkflowGraph): void;
  onSelect(nodeId: string): void;
}) {
  return (
    <ReactFlowProvider>
      <div style={{ width: "100%", height: "100%" }}>
        <GraphSurface {...props} />
      </div>
    </ReactFlowProvider>
  );
}
