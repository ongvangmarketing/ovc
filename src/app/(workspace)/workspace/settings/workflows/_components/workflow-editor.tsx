"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, Clock3, GitBranch, GripVertical, Play, Plus, Save, Trash2, Zap, LayoutGrid, Cpu } from "lucide-react";
import { toast } from "sonner";
import type { EventDefinition, HandlerDefinition, WorkflowGraph, WorkflowNode, WorkflowNodeType } from "@/lib/automation/types/workflow.types";
import { publishWorkflowAction, saveWorkflowDraftAction } from "../_actions/workflow.actions";
import { WorkflowCanvas } from "./workflow-canvas";

const nodeMeta: Record<WorkflowNodeType, { icon: typeof Zap; label: string }> = {
  TRIGGER: { icon: Zap, label: "Trigger" },
  CONDITION: { icon: GitBranch, label: "Điều kiện" },
  ACTION: { icon: Play, label: "Hành động" },
  DELAY: { icon: Clock3, label: "Chờ" },
  BRANCH: { icon: GitBranch, label: "Rẽ nhánh" },
  END: { icon: CheckCircle2, label: "Kết thúc" },
};

export type PaletteItem = {
  type: WorkflowNodeType;
  handlerKey: string;
  name?: string;
  icon: any;
};

function PaletteNode({ item, onAdd }: { item: PaletteItem; onAdd(): void }) {
  const Icon = item.icon || Play;

  return (
    <button
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("application/ovc-workflow-node", JSON.stringify(item));
        event.dataTransfer.effectAllowed = "move";
      }}
      type="button"
      onClick={onAdd}
      className="flex touch-none items-center gap-2 rounded-lg border border-slate-200 p-2.5 text-[13px] hover:border-orange-300 active:cursor-grabbing dark:border-slate-800"
    >
      <GripVertical className="h-4 w-4 text-slate-400" />
      <Icon className="h-4 w-4 text-orange-500" />
      <span className="truncate">{item.name}</span>
      <Plus className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-400" />
    </button>
  );
}

function rebuildGraph(graph: WorkflowGraph, nodes: WorkflowNode[]): WorkflowGraph {
  return {
    ...graph,
    nodes: nodes.map((node, index) => ({ ...node, position: { x: 120, y: 120 + index * 150 } })),
    edges: nodes.slice(0, -1).flatMap((node, index) => {
      const target = nodes[index + 1];
      return target ? [{ id: `edge-${node.id}-${target.id}`, source: node.id, target: target.id }] : [];
    }),
  };
}

export function WorkflowEditor({
  workflowId,
  workflowName,
  versionId,
  initialGraph,
  events,
  handlers = [],
  published,
}: {
  workflowId: string;
  workflowName: string;
  versionId: string;
  initialGraph: WorkflowGraph;
  events: EventDefinition[];
  handlers?: HandlerDefinition[];
  published: boolean;
}) {
  const [graph, setGraph] = useState(initialGraph);
  const [selectedId, setSelectedId] = useState(initialGraph.nodes[0]?.id);
  const [pending, startTransition] = useTransition();
  const selected = useMemo(() => graph.nodes.find((node) => node.id === selectedId), [graph.nodes, selectedId]);
  const actionHandlers = useMemo(() => handlers.filter((handler) => handler.nodeType === "ACTION"), [handlers]);

  const logicItems: PaletteItem[] = [
    { type: "CONDITION", handlerKey: "condition.compare", name: "Điều kiện", icon: GitBranch },
    { type: "BRANCH", handlerKey: "workflow.branch", name: "Rẽ nhánh", icon: GitBranch },
    { type: "DELAY", handlerKey: "delay.wait", name: "Chờ", icon: Clock3 },
  ];

  const actionItems: PaletteItem[] = actionHandlers.map((handler) => ({
    type: "ACTION",
    handlerKey: handler.key,
    name: handler.displayName,
    icon: Play,
  }));

  function addNode(item: PaletteItem, insertIndex = graph.nodes.length - 1) {
    const id = `${item.type.toLowerCase()}-${crypto.randomUUID()}`;
    const node: WorkflowNode = {
      id,
      type: item.type,
      handlerKey: item.handlerKey,
      handlerVersion: 1,
      name: item.name,
      position: { x: 120, y: 0 },
      config: item.type === "DELAY" ? { seconds: 60 } : {},
    };
    const boundedIndex = Math.max(1, Math.min(insertIndex, graph.nodes.length - 1));
    const nodes = [...graph.nodes.slice(0, boundedIndex), node, ...graph.nodes.slice(boundedIndex)];
    setGraph(rebuildGraph(graph, nodes));
    setSelectedId(id);
  }

  function updateSelected(patch: Partial<WorkflowNode>) {
    setGraph({ ...graph, nodes: graph.nodes.map((node) => node.id === selectedId ? { ...node, ...patch } : node) });
  }

  function removeSelected() {
    if (!selected || selected.type === "TRIGGER" || selected.type === "END") return;
    const nodes = graph.nodes.filter((node) => node.id !== selected.id);
    setGraph(rebuildGraph(graph, nodes));
    setSelectedId(nodes[0]?.id);
  }

  function save(publish = false) {
    startTransition(async () => {
      try {
        await saveWorkflowDraftAction(workflowId, versionId, graph);
        if (publish) await publishWorkflowAction(workflowId);
        toast.success(publish ? "Workflow đã được xuất bản" : "Đã lưu bản nháp");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Không thể lưu workflow");
      }
    });
  }

  return (
    <div className="quote-page mx-auto max-w-[1600px] px-6 py-6">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between dark:border-slate-800">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
            <GitBranch className="h-4 w-4 text-orange-500" /> Workflow / {workflowName}
          </div>
          <h1 className="text-[14px] font-light text-slate-950 dark:text-slate-100">
            {published ? "Đang chỉnh sửa bản nháp mới" : "Bản nháp chưa xuất bản"}
          </h1>
        </div>
        <div className="flex gap-2">
          <button disabled={pending} onClick={() => save(false)} className="quote-action-button quote-action-secondary">
            <Save className="h-4 w-4" /> Lưu nháp
          </button>
          <button disabled={pending} onClick={() => save(true)} className="quote-action-button quote-action-primary">
            <CheckCircle2 className="h-4 w-4" /> Xuất bản
          </button>
        </div>
      </div>

        <div className="grid min-h-[680px] gap-4 xl:grid-cols-[220px_minmax(420px,1fr)_320px]">
          <section className="quote-panel flex flex-col h-[680px]">
            <div className="quote-panel-header shrink-0"><h2>Thư viện node</h2></div>
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="mb-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500"><LayoutGrid className="h-3.5 w-3.5" /> Logic & Điều khiển</div>
                <div className="grid gap-2">
                  {logicItems.map((item) => <PaletteNode key={item.handlerKey} item={item} onAdd={() => addNode(item)} />)}
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500"><Cpu className="h-3.5 w-3.5" /> Hành động</div>
                <div className="grid gap-2">
                  {actionItems.map((item) => <PaletteNode key={item.handlerKey} item={item} onAdd={() => addNode(item)} />)}
                </div>
              </div>
            </div>
          </section>

          <section className="quote-panel overflow-auto bg-slate-50/70 dark:bg-slate-950/50">
            <div className="quote-panel-header"><h2>Canvas</h2></div>
            <div className="h-[600px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <WorkflowCanvas graph={graph} selectedId={selectedId} onChange={setGraph} onSelect={setSelectedId} />
            </div>
          </section>

          <section className="quote-panel">
          <div className="quote-panel-header"><h2>Cấu hình</h2><span>{selected ? nodeMeta[selected.type].label : "Chọn một node"}</span></div>
          {selected && (
            <div className="grid gap-4">
              <label className="block">
                <span className="mb-1.5 block text-[15px] font-light text-slate-700 dark:text-slate-300">Tên node</span>
                <input className="quote-input" value={selected.name} onChange={(event) => updateSelected({ name: event.target.value })} />
              </label>
              {selected.type === "TRIGGER" && (
                <label className="block">
                  <span className="mb-1.5 block text-[15px] font-light text-slate-700 dark:text-slate-300">Sự kiện</span>
                  <select className="quote-input" value={String(selected.config.eventName || "")} onChange={(event) => updateSelected({ config: { ...selected.config, eventName: event.target.value } })}>
                    {events.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
                  </select>
                </label>
              )}
              {selected.type === "DELAY" && (
                <label className="block">
                  <span className="mb-1.5 block text-[15px] font-light text-slate-700 dark:text-slate-300">Thời gian chờ (giây)</span>
                  <input type="number" min={1} max={86400} className="quote-input" value={Number(selected.config.seconds || 60)} onChange={(event) => updateSelected({ config: { seconds: Number(event.target.value) } })} />
                </label>
              )}
              {selected.type === "ACTION" && (
                <>
                  <label className="block">
                    <span className="mb-1.5 block text-[15px] font-light text-slate-700 dark:text-slate-300">Hành động</span>
                    <select
                      className="quote-input"
                      value={selected.handlerKey}
                      onChange={(event) => {
                        const handler = actionHandlers.find((item) => item.key === event.target.value);
                        updateSelected({
                          handlerKey: event.target.value,
                          handlerVersion: handler?.version ?? 1,
                          name: handler?.displayName ?? selected.name,
                          config: {},
                        });
                      }}
                    >
                      {actionHandlers.map((handler) => (
                        <option key={`${handler.key}@${handler.version}`} value={handler.key}>
                          {handler.displayName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500 dark:border-slate-800 dark:bg-slate-900/60">
                    {actionHandlers.find((handler) => handler.key === selected.handlerKey)?.description}
                  </div>
                </>
              )}

              {/* CẤU HÌNH CHI TIẾT TỪNG LOẠI NODE */}
              {selected.handlerKey === "condition.compare" && (
                <div className="grid gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Chi tiết Điều kiện</h3>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] text-slate-700 dark:text-slate-300">Trường dữ liệu (Field)</span>
                    <input className="quote-input !text-sm" placeholder="Ví dụ: status, amount..." value={String(selected.config.field || "")} onChange={(e) => updateSelected({ config: { ...selected.config, field: e.target.value } })} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] text-slate-700 dark:text-slate-300">Phép toán (Operator)</span>
                    <select className="quote-input !text-sm" value={String(selected.config.operator || "equals")} onChange={(e) => updateSelected({ config: { ...selected.config, operator: e.target.value } })}>
                      <option value="equals">Bằng (=)</option>
                      <option value="not_equals">Khác (!=)</option>
                      <option value="contains">Chứa (Contains)</option>
                      <option value="greater_than">Lớn hơn (&gt;)</option>
                      <option value="less_than">Nhỏ hơn (&lt;)</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] text-slate-700 dark:text-slate-300">Giá trị so sánh (Value)</span>
                    <input className="quote-input !text-sm" placeholder="Nhập giá trị cần so sánh..." value={String(selected.config.value || "")} onChange={(e) => updateSelected({ config: { ...selected.config, value: e.target.value } })} />
                  </label>
                </div>
              )}

              {selected.handlerKey === "email.send" && (
                <div className="grid gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Soạn Email</h3>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] text-slate-700 dark:text-slate-300">Người nhận (To)</span>
                    <input className="quote-input !text-sm" placeholder="Email người nhận hoặc {{email}}..." value={String(selected.config.to || "")} onChange={(e) => updateSelected({ config: { ...selected.config, to: e.target.value } })} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] text-slate-700 dark:text-slate-300">Tiêu đề (Subject)</span>
                    <input className="quote-input !text-sm" placeholder="Tiêu đề email..." value={String(selected.config.subject || "")} onChange={(e) => updateSelected({ config: { ...selected.config, subject: e.target.value } })} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] text-slate-700 dark:text-slate-300">Nội dung (Body)</span>
                    <textarea className="quote-input !text-sm min-h-[120px]" placeholder="Nội dung email..." value={String(selected.config.body || "")} onChange={(e) => updateSelected({ config: { ...selected.config, body: e.target.value } })} />
                  </label>
                </div>
              )}

              {selected.handlerKey === "ai.call" && (
                <div className="grid gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cấu hình AI</h3>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] text-slate-700 dark:text-slate-300">Lựa chọn Model</span>
                    <select className="quote-input !text-sm" value={String(selected.config.model || "llama-3.3-70b-versatile")} onChange={(e) => updateSelected({ config: { ...selected.config, model: e.target.value } })}>
                      <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Versatile)</option>
                      <option value="llama-3.1-8b-instant">Llama 3.1 8B (Fast)</option>
                      <option value="gpt-4o-mini">GPT-4o Mini</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] text-slate-700 dark:text-slate-300">Câu lệnh (Prompt)</span>
                    <textarea className="quote-input !text-sm min-h-[120px]" placeholder="Bạn muốn AI phân tích hay viết gì?" value={String(selected.config.prompt || "")} onChange={(e) => updateSelected({ config: { ...selected.config, prompt: e.target.value } })} />
                  </label>
                </div>
              )}

              {selected.handlerKey === "notification.send" && (
                <div className="grid gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Thông báo Nội bộ</h3>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] text-slate-700 dark:text-slate-300">Người nhận (User ID)</span>
                    <input className="quote-input !text-sm" placeholder="User ID hoặc {{assigneeId}}..." value={String(selected.config.userId || "")} onChange={(e) => updateSelected({ config: { ...selected.config, userId: e.target.value } })} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] text-slate-700 dark:text-slate-300">Nội dung thông báo</span>
                    <textarea className="quote-input !text-sm min-h-[80px]" placeholder="Nhập tin nhắn..." value={String(selected.config.message || "")} onChange={(e) => updateSelected({ config: { ...selected.config, message: e.target.value } })} />
                  </label>
                </div>
              )}

              {selected.handlerKey === "webhook.send" && (
                <div className="grid gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cấu hình Webhook</h3>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] text-slate-700 dark:text-slate-300">Phương thức (Method)</span>
                    <select className="quote-input !text-sm" value={String(selected.config.method || "POST")} onChange={(e) => updateSelected({ config: { ...selected.config, method: e.target.value } })}>
                      <option value="POST">POST</option>
                      <option value="GET">GET</option>
                      <option value="PUT">PUT</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] text-slate-700 dark:text-slate-300">Địa chỉ URL</span>
                    <input className="quote-input !text-sm" placeholder="https://api.example.com/webhook" value={String(selected.config.url || "")} onChange={(e) => updateSelected({ config: { ...selected.config, url: e.target.value } })} />
                  </label>
                </div>
              )}

              {!["TRIGGER", "END"].includes(selected.type) && (
                <button type="button" onClick={removeSelected} className="quote-action-button quote-action-secondary text-rose-600">
                  <Trash2 className="h-4 w-4" /> Xóa node
                </button>
              )}
            </div>
          )}
          </section>
        </div>
    </div>
  );
}
