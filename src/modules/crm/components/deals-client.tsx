"use client";

import { useState, useEffect } from "react";
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
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, MoreHorizontal, TrendingUp, Building2, Circle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { ViewSwitcher } from "@/components/ui/view-switcher";
import { useQuery } from "@tanstack/react-query";
import { getDeals } from "@/app/actions/crm";

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
}

interface Stage {
  id: string;
  name: string;
  color: string;
  deals: Deal[];
}

// Mock Data
const initialStages: Stage[] = [
  {
    id: "lead",
    name: "Lead",
    color: "#94A3B8",
    deals: [
      { id: "d1", title: "CRM cho Công ty XYZ", company: "XYZ Corp", value: 75000000, stageId: "lead", probability: 20, assignee: "Nam", priority: "MEDIUM", tags: ["Enterprise"] },
      { id: "d2", title: "App mobile nội bộ", company: "ABC Ltd", value: 45000000, stageId: "lead", probability: 15, assignee: "Hoa", priority: "LOW", tags: ["Mobile"] },
    ],
  },
  {
    id: "contact",
    name: "Đã liên hệ",
    color: "#3B82F6",
    deals: [
      { id: "d3", title: "Website thương mại", company: "Shop Online", value: 65000000, stageId: "contact", probability: 35, assignee: "Linh", priority: "HIGH", tags: ["E-commerce"] },
      { id: "d4", title: "Hệ thống ERP", company: "Mfg Vietnam", value: 250000000, stageId: "contact", probability: 30, assignee: "Hùng", priority: "URGENT", tags: ["ERP", "Enterprise"] },
    ],
  },
  {
    id: "proposal",
    name: "Báo giá",
    color: "#F59E0B",
    deals: [
      { id: "d5", title: "Phần mềm HR", company: "HR Solutions", value: 95000000, stageId: "proposal", probability: 55, assignee: "Mai", priority: "HIGH", tags: ["HR"] },
    ],
  },
  {
    id: "negotiation",
    name: "Đàm phán",
    color: "#8B5CF6",
    deals: [
      { id: "d6", title: "Dự án AI chatbot", company: "Tech Startup", value: 180000000, stageId: "negotiation", probability: 70, assignee: "Khoa", priority: "HIGH", tags: ["AI"] },
      { id: "d7", title: "Tích hợp Thanh toán", company: "FinTech VN", value: 120000000, stageId: "negotiation", probability: 75, assignee: "Phúc", priority: "URGENT", tags: ["FinTech"] },
    ],
  },
  {
    id: "won",
    name: "Đã thắng",
    color: "#10B981",
    deals: [
      { id: "d8", title: "Website Bất động sản", company: "Real Estate Co", value: 88000000, stageId: "won", probability: 100, assignee: "Thu", priority: "MEDIUM", tags: ["Real Estate"] },
    ],
  },
];

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
        <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2 flex-1 group-hover:text-primary transition-colors">
          {deal.title}
        </p>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

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

// Column Component
function KanbanColumn({ stage, onAddDeal }: { stage: Stage; onAddDeal: (stageId: string) => void }) {
  const total = stage.deals.reduce((s, d) => s + d.value, 0);

  return (
    <div className="kanban-column">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-2">
          <Circle
            className="w-2.5 h-2.5 fill-current flex-shrink-0"
            style={{ color: stage.color }}
          />
          <span className="text-xs font-semibold text-foreground">{stage.name}</span>
          <span className="flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
            {stage.deals.length}
          </span>
        </div>
        <button
          onClick={() => onAddDeal(stage.id)}
          className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Total */}
      <p className="text-xs text-muted-foreground px-1 mb-3 tabular-nums">
        {(total / 1_000_000).toFixed(0)}M₫ tổng giá trị
      </p>

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

  const { data: dealsData = [], isLoading } = useQuery({
    queryKey: ["deals"],
    queryFn: () => getDeals(),
  });

  // Map fetched deals to stages
  const mappedStages = initialStages.map((stage) => ({
    ...stage,
    deals: dealsData
      .filter((d: any) => d.stageId === stage.id)
      .map((d: any) => ({
        id: d.id,
        title: d.title,
        company: d.company?.name || "N/A",
        value: Number(d.value),
        stageId: d.stageId!,
        probability: 50, // default placeholder
        assignee: d.assignee?.name || "Unassigned",
        priority: d.priority,
        tags: d.tags || [],
      })),
  }));

  const [stages, setStages] = useState<Stage[]>(mappedStages);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setStages(mappedStages);
    }
  }, [dealsData, isLoading]);

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

    // Check if dropped on a stage column
    const targetStage = stages.find((s) => s.id === overId);
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
    }
  };

  const totalPipeline = stages.reduce(
    (s, stage) => s + stage.deals.reduce((a, d) => a + d.value, 0), 0
  );

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
          <button className="flex items-center gap-2 h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
            <Plus className="w-4 h-4" />
            Thêm deal
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto scrollable-x pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full min-h-96 group">
            {stages.map((stage) => (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                onAddDeal={() => {}}
              />
            ))}
          </div>

          <DragOverlay>
            {activeDeal ? <DealCard deal={activeDeal} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
