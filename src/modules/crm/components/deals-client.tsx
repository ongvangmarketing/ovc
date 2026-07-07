"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, MoreHorizontal, TrendingUp, Building2, Circle, Eye, Edit, Trash2, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { ViewSwitcher } from "@/components/ui/view-switcher";
import { useQuery } from "@tanstack/react-query";
import { getDealsPipeline } from "@/app/actions/crm";
import { updateDealStageAction, createDealStageAction, updateDealStageNameAction, deleteDealStageAction, saveDealAction } from "@/app/actions/deals";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Types
interface Deal {
  id: string;
  title: string;
  company: string;
  value: number;
  stageId: string;
  probability: number;
  assignee: string;
  dueDate?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  tags: string[];
  hasSelectedOptions?: boolean;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  deals: Deal[];
}

// We no longer need initialStages since it's dynamic

const priorityColors = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-100 text-blue-600",
  HIGH: "bg-orange-100 text-orange-600",
  URGENT: "bg-red-100 text-red-600",
};

// Deal Card Component
function DealCard({ deal, isDragging }: { deal: Deal; isDragging?: boolean }) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging: isSortDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "kanban-card group",
        (isDragging || isSortDragging) && "opacity-40 ring-2 ring-primary"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <a href={`/workspace/crm/deals/${deal.id}`} className="text-xs font-semibold text-foreground leading-snug line-clamp-2 flex-1 group-hover:text-primary transition-colors cursor-pointer">
          {deal.title}
        </a>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {deal.hasSelectedOptions && (
        <div className="mb-2.5">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3" />
            Khách đã chốt
          </span>
        </div>
      )}

      {/* Company */}
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-2.5">
        <Building2 className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">{deal.company}</span>
      </div>

      {/* Tags */}
      {deal.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {deal.tags.map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-border">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">{deal.probability}%</span>
          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", priorityColors[deal.priority])}>
            {deal.priority}
          </span>
        </div>
        <span className="text-xs font-bold text-foreground tabular-nums">
          {(deal.value / 1_000_000).toFixed(0)}M₫
        </span>
      </div>
    </div>
  );
}

function KanbanColumn({ stage, onAddDeal, onUpdateStage, onDeleteStage }: { stage: Stage; onAddDeal: (stageId: string) => void, onUpdateStage?: (id: string, newName: string) => void, onDeleteStage?: (id: string) => void }) {
  const total = stage.deals.reduce((s, d) => s + d.value, 0);
  const { setNodeRef } = useDroppable({
    id: stage.id,
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(stage.name);

  const handleSaveName = () => {
    if (editName.trim() && editName !== stage.name && onUpdateStage) {
      onUpdateStage(stage.id, editName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="kanban-column group/col" ref={setNodeRef}>
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-2 flex-1">
          <Circle
            className="w-2.5 h-2.5 fill-current flex-shrink-0"
            style={{ color: stage.color }}
          />
          {isEditing ? (
            <input 
              autoFocus
              className="text-xs font-semibold text-foreground bg-background border border-border rounded px-1 max-w-[100px] outline-none focus:border-primary/50"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            />
          ) : (
            <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">{stage.name}</span>
          )}
          <span className="flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
            {stage.deals.length}
          </span>
        </div>
        <div className="flex items-center opacity-0 group-hover/col:opacity-100 transition-opacity">
          {onUpdateStage && (
            <button
              onClick={() => setIsEditing(true)}
              className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}
          {onDeleteStage && stage.deals.length === 0 && (
            <button
              onClick={() => {
                if(confirm("Bạn có chắc chắn muốn xoá cột này không?")) onDeleteStage(stage.id);
              }}
              className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onAddDeal(stage.id)}
            className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="mb-3 rounded-xl border border-border/70 bg-background/75 px-3 py-2 shadow-sm">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Tổng giá trị</div>
        <div className="mt-0.5 flex items-end gap-1 tabular-nums">
          <span className="text-base font-bold text-foreground">{(total / 1_000_000).toFixed(0)}M₫</span>
          <span className="pb-0.5 text-[11px] text-muted-foreground">{stage.deals.length} cơ hội</span>
        </div>
      </div>

      {/* Cards */}
      <SortableContext items={stage.deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 min-h-16">
          {stage.deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </SortableContext>

      {/* Add Button */}
      <button
        onClick={() => onAddDeal(stage.id)}
        className="mt-2 w-full flex items-center gap-2 h-9 px-3 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all"
      >
        <Plus className="w-3.5 h-3.5" />
        Thêm deal
      </button>
    </div>
  );
}

// Main Component
export function DealsClient() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const router = useRouter();
  const [quickStageId, setQuickStageId] = useState<string | null>(null);
  const [quickTitle, setQuickTitle] = useState("");
  const [quickValue, setQuickValue] = useState("");
  const [quickSaving, setQuickSaving] = useState(false);

  const { data: pipelineData, isLoading, refetch } = useQuery({
    queryKey: ["deals-pipeline"],
    queryFn: () => getDealsPipeline(),
  });

  const dealsData = pipelineData?.deals || [];
  const stagesData = pipelineData?.stages || [];

  // Map fetched deals to stages
  const mappedStages = stagesData.map((stage: any) => {
    const stageDeals = dealsData.filter((d: any) => d.stageId === stage.id);
    return {
      id: stage.id,
      name: stage.name,
      color: stage.color || "#94A3B8",
      deals: stageDeals.map((d: any) => ({
        id: d.id,
        title: d.title,
        company: d.company?.name || d.contact?.name || "Chưa cập nhật",
        value: Number(d.value),
        stageId: d.stageId,
        probability: d.stage?.probability || 0,
        assignee: d.assignee?.name || "Unassigned",
        dueDate: d.expectedClose ? new Date(d.expectedClose).toISOString() : undefined,
        priority: "MEDIUM" as const,
        tags: d.tags || [],
        hasSelectedOptions: d.serviceOptions?.some((o: any) => o.status === "CUSTOMER_SELECTED")
      }))
    };
  });

  const [stages, setStages] = useState<Stage[]>(mappedStages);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  useEffect(() => {
    if (!isLoading && pipelineData) {
      setStages(mappedStages);
    }
  }, [pipelineData, isLoading]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const findDeal = (id: string) => {
    for (const stage of stages) {
      const deal = stage.deals.find((d) => d.id === id);
      if (deal) return { deal, stageId: stage.id };
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const found = findDeal(String(event.active.id));
    if (found) setActiveDeal(found.deal);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    // Find target stage
    let targetStageId = overId;
    const overDeal = findDeal(overId);
    if (overDeal) {
      targetStageId = overDeal.stageId;
    }

    const targetStage = stages.find((s) => s.id === targetStageId);
    const found = findDeal(activeId);

    if (!found) return;

    if (targetStage && targetStage.id !== found.stageId) {
      setStages((prev) =>
        prev.map((s) => {
          if (s.id === found.stageId) {
            return { ...s, deals: s.deals.filter((d) => d.id !== activeId) };
          }
          if (s.id === targetStage.id) {
            return { ...s, deals: [...s.deals, { ...found.deal, stageId: targetStage.id }] };
          }
          return s;
        })
      );
      
      // Call server action to update db
      updateDealStageAction(activeId, targetStage.id).catch((err) => {
        console.error("Failed to update deal stage", err);
      });
    }
  };

  const quickStage = stages.find((stage) => stage.id === quickStageId);

  const createQuickDeal = async (event: FormEvent) => {
    event.preventDefault();
    if (!quickStageId || !quickTitle.trim()) return;
    setQuickSaving(true);
    const result = await saveDealAction({
      title: quickTitle.trim(),
      value: Number(quickValue || 0),
      stageId: quickStageId,
      serviceOptions: [],
    });
    setQuickSaving(false);
    if (result.success) {
      setQuickStageId(null);
      setQuickTitle("");
      setQuickValue("");
      refetch();
      router.refresh();
      return;
    }
    alert("Không tạo được deal. Vui lòng thử lại.");
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pipeline Cơ hội</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? "Đang tải..." : `${dealsData.length} cơ hội đang mở`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewSwitcher
            value={view}
            onChange={(v) => setView(v as "kanban" | "list")}
            options={["kanban", "table", "list"]}
          />
          <Link href="/workspace/crm/deals/new" className="flex items-center gap-2 h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
            <Plus className="w-4 h-4" />
            Thêm deal
          </Link>
        </div>
      </div>

      {view === "kanban" ? (
        <div className="flex-1 overflow-x-auto scrollable-x pb-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex h-full gap-4 overflow-x-auto pb-4 pt-2">
              {stages.map((stage) => (
                <KanbanColumn 
                  key={stage.id} 
                  stage={stage} 
                  onAddDeal={(stageId) => setQuickStageId(stageId)} 
                  onUpdateStage={async (id, name) => {
                    await updateDealStageNameAction(id, name);
                    refetch();
                  }}
                  onDeleteStage={async (id) => {
                    const res = await deleteDealStageAction(id);
                    if (res?.error) alert(res.error);
                    else refetch();
                  }}
                />
              ))}
              
              {/* Add Column Button */}
              <div className="kanban-column shrink-0 flex items-center justify-center">
                <button
                  onClick={async () => {
                    const name = prompt("Nhập tên cột mới:");
                    if (name && name.trim()) {
                      await createDealStageAction(name.trim());
                      refetch();
                    }
                  }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm cột</span>
                </button>
              </div>
            </div>
            
            <DragOverlay>
              {activeDeal ? <DealCard deal={activeDeal} isDragging /> : null}
            </DragOverlay>
          </DndContext>
        </div>
      ) : (
        <div className="card-base overflow-hidden mt-4">
          <div className="overflow-x-auto scrollable-x">
            <table className="w-full min-w-[680px] text-sm [&_td]:!px-3 [&_td]:!py-2.5 [&_th]:!px-3 [&_th]:!py-2.5">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Tên Cơ hội</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Khách hàng</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Giai đoạn</th>
                  <th className="text-left font-medium text-muted-foreground py-3 px-4 w-32">Giá trị</th>
                  <th className="text-left font-medium text-muted-foreground py-3 px-4 w-32">Ngày tạo</th>
                  <th className="py-3 px-4 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {dealsData.map((deal: any) => {
                  const stage = stagesData.find((s: any) => s.id === deal.stageId) || { name: deal.status, color: "#94A3B8" };
                  
                  return (
                    <tr key={deal.id} className="border-b border-border last:border-0 table-row-hover">
                      <td className="whitespace-nowrap py-3 px-4">
                        <Link href={`/workspace/crm/deals/${deal.id}`} className="whitespace-nowrap text-sm font-semibold text-blue-600 hover:underline">
                          {deal.title}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap py-3 px-4 text-sm text-muted-foreground">
                        {deal.company?.name || deal.contact?.name || `${deal.contact?.firstName || ""} ${deal.contact?.lastName || ""}`.trim() || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="badge-status text-xs font-medium"
                          style={{
                            backgroundColor: stage.color + "20",
                            color: stage.color,
                          }}
                        >
                          {stage.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">{formatCurrency(Number(deal.value))}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        <span className={""}>
                          {deal.createdAt ? formatDate(new Date(deal.createdAt)) : "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2 justify-end">
                          <Link href={`/workspace/crm/deals/${deal.id}`} className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-all" title="Xem chi tiết">
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link href={`/workspace/crm/deals/${deal.id}/edit`} className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-all" title="Chỉnh sửa">
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button 
                            className="w-7 h-7 flex items-center justify-center rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {quickStageId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
          <form onSubmit={createQuickDeal} className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl">
            <div className="flex items-start justify-between border-b border-border px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">Tạo deal nhanh</h3>
                <p className="mt-1 text-sm text-muted-foreground">{quickStage?.name || "Cột đang chọn"}</p>
              </div>
              <button type="button" onClick={() => setQuickStageId(null)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 px-5 py-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Tên deal</span>
                <input autoFocus value={quickTitle} onChange={(event) => setQuickTitle(event.target.value)} className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="VD: Website Redesign 2026" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Giá trị dự kiến</span>
                <input value={quickValue} onChange={(event) => setQuickValue(event.target.value)} type="number" min="0" className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="200000000" />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
              <button type="button" onClick={() => setQuickStageId(null)} className="h-9 rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted">Đóng</button>
              <button disabled={quickSaving || !quickTitle.trim()} className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {quickSaving ? "Đang tạo..." : "Tạo deal"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
