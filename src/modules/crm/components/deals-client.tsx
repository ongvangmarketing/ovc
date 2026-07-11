// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  DndContext,
  type DragEndEvent,
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
import { CompactPagination } from "@/components/ui/compact-pagination";
import { useQuery } from "@tanstack/react-query";
import { getDealsPipeline } from "@/modules/crm/actions/crm.actions";
import { updateDealStageAction, createDealStageAction, updateDealStageNameAction, deleteDealStageAction, saveDealAction } from "@/modules/crm/actions/deals.actions";
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

interface PipelineContact {
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

interface PipelineCompany {
  name?: string | null;
}

interface PipelineStage {
  id: string;
  name: string;
  color?: string | null;
  probability?: number | null;
}

interface PipelineDeal {
  id: string;
  title: string;
  company?: PipelineCompany | null;
  contact?: PipelineContact | null;
  value: number | string;
  stageId: string;
  stage?: { probability?: number | null } | null;
  assignee?: { name?: string | null } | null;
  expectedClose?: string | Date | null;
  createdAt?: string | Date | null;
  status?: string | null;
  tags?: string[];
  serviceOptions?: Array<{ status?: string | null }>;
}

// We no longer need initialStages since it's dynamic

const priorityColors = {
  LOW: "border-[#eaeaea] bg-white text-gray-500",
  MEDIUM: "border-[#eaeaea] bg-gray-50 text-black",
  HIGH: "border-[#eaeaea] bg-gray-100 text-black",
  URGENT: "bg-red-100 text-red-600",
};

function formatPlainAmount(value: number) {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value);
}

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
        "group rounded-xl border border-[#eaeaea] bg-white p-4 transition-colors hover:border-gray-300",
        (isDragging || isSortDragging) && "opacity-40 ring-1 ring-black"
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <a href={`/workspace/crm/deals/${deal.id}`} className="line-clamp-2 flex-1 cursor-pointer text-[16px] font-medium leading-snug text-black group-hover:underline">
          {deal.title}
        </a>
        <button className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
          <MoreHorizontal className="h-3.5 w-3.5 text-gray-400" />
        </button>
      </div>

      {deal.hasSelectedOptions && (
        <div className="mb-2.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-700">
            <CheckCircle2 className="w-3 h-3" />
            Khách đã chốt
          </span>
        </div>
      )}

      {/* Company */}
      <div className="mb-3 flex items-center gap-1.5 text-[12px] text-gray-500">
        <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="truncate">{deal.company}</span>
      </div>

      {/* Tags */}
      {deal.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {deal.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-[#eaeaea] bg-white px-2 py-0.5 text-[11px] text-gray-500">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#eaeaea] pt-2.5">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-[12px] text-gray-500">{deal.probability}%</span>
          <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", priorityColors[deal.priority])}>
            {deal.priority}
          </span>
        </div>
        <span className="text-[13px] font-medium tabular-nums text-black">
          {formatPlainAmount(deal.value)}
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
    <div className="group/col w-[280px] shrink-0 rounded-2xl border border-[#eaeaea] bg-gray-50/50 p-3" ref={setNodeRef}>
      {/* Total */}
      <div className="px-1 pt-0.5">
        <div className="tabular-nums text-[32px] font-medium leading-none tracking-tight text-black">
          {formatPlainAmount(total)}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-[10px] font-medium uppercase tracking-wide text-gray-400">
          <span>Tổng giá trị</span>
          <span className="normal-case tracking-normal text-gray-500">{stage.deals.length} cơ hội</span>
        </div>
      </div>

      {/* Header */}
      <div className="mb-3 mt-4 flex items-center justify-between border-t border-[#eaeaea] px-1 pt-3">
        <div className="flex items-center gap-2 flex-1">
          <Circle
            className="w-2.5 h-2.5 fill-current flex-shrink-0"
            style={{ color: stage.color }}
          />
          {isEditing ? (
            <input 
              autoFocus
              className="max-w-[100px] rounded border border-[#eaeaea] bg-white px-1 text-xs font-medium text-black outline-none focus:border-black"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            />
          ) : (
            <span className="max-w-[120px] truncate text-xs font-medium text-black">{stage.name}</span>
          )}
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full border border-[#eaeaea] bg-white px-1 text-[10px] font-medium text-gray-500">
            {stage.deals.length}
          </span>
        </div>
        <div className="flex items-center opacity-0 transition-opacity group-hover/col:opacity-100">
          {onUpdateStage && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-white hover:text-black"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}
          {onDeleteStage && stage.deals.length === 0 && (
            <button
              onClick={() => {
                if(confirm("Bạn có chắc chắn muốn xoá cột này không?")) onDeleteStage(stage.id);
              }}
              className="flex h-6 w-6 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onAddDeal(stage.id)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-white hover:text-black"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
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
        className="mt-2 flex h-10 w-full items-center gap-2 rounded-lg border border-dashed border-[#eaeaea] px-3 text-[13px] text-gray-500 transition-colors hover:border-black hover:bg-white hover:text-black"
      >
        <Plus className="w-3.5 h-3.5" />
        Thêm deal
      </button>
    </div>
  );
}

// Main Component
const PAGE_SIZE = 20;

export function DealsClient() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const [quickStageId, setQuickStageId] = useState<string | null>(null);
  const [quickTitle, setQuickTitle] = useState("");
  const [quickValue, setQuickValue] = useState("");
  const [quickSaving, setQuickSaving] = useState(false);

  const { data: pipelineData, isLoading, refetch } = useQuery({
    queryKey: ["deals-pipeline"],
    queryFn: () => getDealsPipeline(),
  });

  const dealsData = useMemo(() => (pipelineData?.deals || []) as PipelineDeal[], [pipelineData?.deals]);
  const stagesData = useMemo(() => (pipelineData?.stages || []) as PipelineStage[], [pipelineData?.stages]);

  // Map fetched deals to stages
  const mappedStages = useMemo<Stage[]>(() => stagesData.map((stage) => {
    const stageDeals = dealsData.filter((d) => d.stageId === stage.id);
    return {
      id: stage.id,
      name: stage.name,
      color: stage.color || "#94A3B8",
      deals: stageDeals.map((d) => ({
        id: d.id,
        title: d.title,
        company: d.company?.name || d.contact?.name || `${d.contact?.firstName || ""} ${d.contact?.lastName || ""}`.trim() || "Chưa cập nhật",
        value: Number(d.value),
        stageId: d.stageId,
        probability: d.stage?.probability || 0,
        assignee: d.assignee?.name || "Unassigned",
        dueDate: d.expectedClose ? new Date(d.expectedClose).toISOString() : undefined,
        priority: "MEDIUM" as const,
        tags: d.tags || [],
        hasSelectedOptions: d.serviceOptions?.some((o) => o.status === "CUSTOMER_SELECTED")
      }))
    };
  }), [dealsData, stagesData]);

  const [localStages, setLocalStages] = useState<Stage[] | null>(null);
  const stages = localStages ?? mappedStages;
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

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
      setLocalStages((prev) =>
        (prev ?? stages).map((s) => {
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
  const totalPages = Math.max(1, Math.ceil(dealsData.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedDeals = dealsData.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
      setLocalStages(null);
      refetch();
      router.refresh();
      return;
    }
    alert("Không tạo được deal. Vui lòng thử lại.");
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase w-fit">
              CRM Deals
            </span>
          </div>
          <h1 className="text-[32px] md:text-[44px] tracking-tight leading-[1.15] font-medium">
            <span className="text-black">Quản lý</span>{" "}
            <span className="text-gray-400">pipeline CRM.</span>
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-gray-500 max-w-2xl">
            {isLoading ? "Đang tải..." : `${dealsData.length} cơ hội đang mở`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ViewSwitcher
            value={view}
            onChange={(v) => {
              setView(v as "kanban" | "list");
              setCurrentPage(1);
            }}
            options={["kanban", "list"]}
          />
          <Link href="/workspace/crm/deals/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-black px-5 text-[14px] font-medium text-white transition-colors hover:bg-gray-800">
            <Plus className="w-4 h-4" />
            Thêm deal
          </Link>
        </div>
      </div>

      {view === "kanban" ? (
        <div className="flex-1 overflow-x-auto pb-4">
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
              <div className="flex w-[280px] shrink-0 items-center justify-center rounded-2xl border border-dashed border-[#eaeaea] bg-white p-3">
                <button
                  onClick={async () => {
                    const name = prompt("Nhập tên cột mới:");
                    if (name && name.trim()) {
                      await createDealStageAction(name.trim());
                      refetch();
                    }
                  }}
                  className="flex items-center gap-2 rounded-md border border-dashed border-[#eaeaea] px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:border-black hover:text-black"
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
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#eaeaea] bg-white">
          <div className="overflow-x-auto scrollable-x">
            <table className="w-full min-w-[680px] text-sm [&_td]:!px-4 [&_td]:!py-3 [&_th]:!px-4 [&_th]:!py-3">
              <thead>
                <tr className="border-b border-[#eaeaea] bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-widest text-gray-400">Tên Cơ hội</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-widest text-gray-400">Khách hàng</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-widest text-gray-400">Giai đoạn</th>
                  <th className="w-32 px-4 py-3 text-left text-[11px] font-medium uppercase tracking-widest text-gray-400">Giá trị</th>
                  <th className="w-32 px-4 py-3 text-left text-[11px] font-medium uppercase tracking-widest text-gray-400">Ngày tạo</th>
                  <th className="py-3 px-4 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedDeals.map((deal) => {
                  const stage = stagesData.find((s) => s.id === deal.stageId) || { name: deal.status || "N/A", color: "#94A3B8" };
                  
                  return (
                    <tr key={deal.id} className="border-b border-[#eaeaea] transition-colors last:border-0 hover:bg-gray-50">
                      <td className="whitespace-nowrap py-3 px-4">
                        <Link href={`/workspace/crm/deals/${deal.id}`} className="whitespace-nowrap text-sm font-medium text-black hover:underline">
                          {deal.title}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap py-3 px-4 text-sm text-gray-500">
                        {deal.company?.name || deal.contact?.name || `${deal.contact?.firstName || ""} ${deal.contact?.lastName || ""}`.trim() || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                          style={{
                            backgroundColor: stage.color + "20",
                            color: stage.color,
                          }}
                        >
                          {stage.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-black">{formatCurrency(Number(deal.value))}</td>
                      <td className="py-3 px-4 text-xs text-gray-500">
                        <span className={""}>
                          {deal.createdAt ? formatDate(new Date(deal.createdAt)) : "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2 justify-end">
                          <Link href={`/workspace/crm/deals/${deal.id}`} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-50 hover:text-black" title="Xem chi tiết">
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link href={`/workspace/crm/deals/${deal.id}/edit`} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-50 hover:text-black" title="Chỉnh sửa">
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button 
                            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-50 hover:text-black">
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
          <CompactPagination
            currentPage={safePage}
            totalItems={dealsData.length}
            pageSize={PAGE_SIZE}
            itemLabel="cơ hội"
            onPageChange={setCurrentPage}
          />
        </div>
      )}
      {quickStageId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <form onSubmit={createQuickDeal} className="w-full max-w-md rounded-2xl border border-[#eaeaea] bg-white">
            <div className="flex items-start justify-between border-b border-[#eaeaea] px-5 py-4">
              <div>
                <h3 className="text-base font-medium text-black">Tạo deal nhanh</h3>
                <p className="mt-1 text-sm text-gray-500">{quickStage?.name || "Cột đang chọn"}</p>
              </div>
              <button type="button" onClick={() => setQuickStageId(null)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-50 hover:text-black">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 px-5 py-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-500">Tên deal</span>
                <input autoFocus value={quickTitle} onChange={(event) => setQuickTitle(event.target.value)} className="h-10 w-full rounded-lg border border-[#eaeaea] px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black" placeholder="VD: Website Redesign 2026" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-500">Giá trị dự kiến</span>
                <input value={quickValue} onChange={(event) => setQuickValue(event.target.value)} type="number" min="0" className="h-10 w-full rounded-lg border border-[#eaeaea] px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black" placeholder="200000000" />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#eaeaea] px-5 py-4">
              <button type="button" onClick={() => setQuickStageId(null)} className="h-9 rounded-md border border-[#eaeaea] px-4 text-sm font-medium hover:bg-gray-50">Đóng</button>
              <button disabled={quickSaving || !quickTitle.trim()} className="h-9 rounded-md bg-black px-4 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                {quickSaving ? "Đang tạo..." : "Tạo deal"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
