"use client";

import { useMemo, useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, GripVertical, LayoutDashboard, Pencil, RotateCcw, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useDroppable } from "@dnd-kit/core";
import { moduleDefinitions } from "@/lib/modules/registry";
import { cn } from "@/lib/utils/cn";
import { saveAppLauncherPreferencesAction } from "../actions/app-launcher.actions";
import type { AppLauncherPreferences } from "../types/app-launcher.types";

type LauncherItem = {
  code: string;
  name: string;
  href: string;
  icon: React.ReactNode;
};

type AppLauncherClientProps = {
  activeModules: string[];
  initialPreferences: AppLauncherPreferences;
};

function SortableLauncherCard({
  item,
  editing,
  hidden,
  onToggleVisibility,
}: {
  item: LauncherItem;
  editing: boolean;
  hidden: boolean;
  onToggleVisibility: (code: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.code,
    disabled: !editing,
  });

  const card = (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group relative flex flex-col items-center gap-2 sm:gap-4 ${
        hidden ? "opacity-35" : ""
      } ${isDragging ? "z-20 scale-105 opacity-80" : ""} ${
        editing ? "cursor-grab active:cursor-grabbing" : ""
      }`}
      {...(editing ? attributes : {})}
      {...(editing ? listeners : {})}
    >
      <div className="relative flex h-[60px] w-[60px] items-center justify-center rounded-2xl border border-[#eaeaea] bg-white transition-colors duration-200 group-hover:border-gray-400 group-hover:bg-gray-50 sm:h-20 sm:w-20">
        <span className="flex items-center justify-center text-black [&>svg]:h-6 [&>svg]:w-6 [&>svg]:stroke-[1.5] sm:[&>svg]:h-7 sm:[&>svg]:w-7 pointer-events-none">
          {item.icon}
        </span>
        {editing ? (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(item.code);
            }}
            className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:text-black z-10"
            aria-label={hidden ? `Hiện ${item.name}` : `Ẩn ${item.name}`}
          >
            {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        ) : null}
      </div>
      <span className="w-[68px] break-words text-center text-[11px] font-medium leading-tight tracking-tight text-black sm:w-[88px] sm:text-[13px] pointer-events-none">
        {item.name}
      </span>
    </div>
  );

  if (editing) return <div className="flex justify-center">{card}</div>;
  return (
    <Link href={item.href} className="flex justify-center">
      {card}
    </Link>
  );
}

function DroppableZone({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={className}>
      {children}
    </div>
  );
}

export default function AppLauncherClient({
  activeModules,
  initialPreferences,
}: AppLauncherClientProps) {
  const availableItems = useMemo<LauncherItem[]>(() => {
    const enabled = new Set(activeModules);
    const modules = moduleDefinitions
      .filter(
        (module) =>
          module.nav &&
          module.code !== "DASHBOARD" &&
          (enabled.has(module.code) || module.code === "SETTINGS" || module.code === "REPORTS"),
      )
      .map((module) => ({
        code: module.code,
        name: module.name,
        href: module.nav?.href || "#",
        icon: module.nav?.icon || <span>{module.name.charAt(0)}</span>,
      }));

    return [
      { code: "DASHBOARD", name: "Dashboard", href: "/workspace/dashboard", icon: <LayoutDashboard /> },
      ...modules,
    ];
  }, [activeModules]);

  const defaultOrder = useMemo(() => availableItems.map((item) => item.code), [availableItems]);
  
  const initialDockOrder = useMemo(() => {
    if (initialPreferences.bottomNavOrder && initialPreferences.bottomNavOrder.length > 0) {
      return initialPreferences.bottomNavOrder;
    }
    const hidden = new Set(initialPreferences.hidden);
    const visibleKeys = initialPreferences.order.filter((key) => !hidden.has(key) && key !== "DASHBOARD");
    return ["DASHBOARD", ...visibleKeys.slice(0, 3)];
  }, [initialPreferences]);

  const initialGridOrder = useMemo(() => {
    const known = new Set(defaultOrder);
    const dockSet = new Set(initialDockOrder);
    const validInitialOrder = initialPreferences.order.filter((code) => known.has(code) && !dockSet.has(code));
    const missing = defaultOrder.filter((code) => !initialPreferences.order.includes(code) && !dockSet.has(code));
    return [...validInitialOrder, ...missing];
  }, [defaultOrder, initialPreferences.order, initialDockOrder]);

  const [preferences, setPreferences] = useState<AppLauncherPreferences>({
    version: 1,
    order: initialGridOrder,
    bottomNavOrder: initialDockOrder,
    hidden: initialPreferences.hidden.filter((code) => defaultOrder.includes(code)),
  });
  const [savedPreferences, setSavedPreferences] = useState(preferences);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const longPressTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const startLongPress = (e: React.PointerEvent) => {
    if (editing) return;
    startPos.current = { x: e.clientX, y: e.clientY };
    longPressTimer.current = setTimeout(() => {
      setEditing(true);
      if (typeof window !== "undefined" && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 1200); // 1.2s feels more responsive
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = undefined;
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (startPos.current && longPressTimer.current) {
      const dx = Math.abs(e.clientX - startPos.current.x);
      const dy = Math.abs(e.clientY - startPos.current.y);
      if (dx > 10 || dy > 10) {
        cancelLongPress();
      }
    }
  };

  useEffect(() => {
    return () => cancelLongPress();
  }, []);

  const itemByCode = useMemo(
    () => new Map(availableItems.map((item) => [item.code, item])),
    [availableItems],
  );
  const orderedItems = preferences.order
    .map((code) => itemByCode.get(code))
    .filter((item): item is LauncherItem => Boolean(item));
    
  const gridItems = editing
    ? orderedItems
    : orderedItems.filter((item) => !preferences.hidden.includes(item.code));

  const dockItems = (preferences.bottomNavOrder || [])
    .map((code) => itemByCode.get(code))
    .filter((item): item is LauncherItem => Boolean(item));

  const handleDragOver = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    const activeContainer = preferences.bottomNavOrder?.includes(activeId) ? "dock" : "grid";
    const overContainer = overId === "dock-zone" ? "dock" : overId === "grid-zone" ? "grid" : preferences.bottomNavOrder?.includes(overId) ? "dock" : "grid";

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setPreferences((prev) => {
      const activeItems = activeContainer === "dock" ? prev.bottomNavOrder || [] : prev.order;
      const overItems = overContainer === "dock" ? prev.bottomNavOrder || [] : prev.order;

      const activeIndex = activeItems.indexOf(activeId);
      const overIndex = overId === "dock-zone" || overId === "grid-zone" ? overItems.length : overItems.indexOf(overId);

      const newGrid = [...prev.order];
      const newDock = [...(prev.bottomNavOrder || [])];

      if (activeContainer === "dock") {
        newDock.splice(activeIndex, 1);
        newGrid.splice(overIndex, 0, activeId);
      } else {
        if (newDock.length >= 5) return prev; // Max 5 items in dock
        newGrid.splice(activeIndex, 1);
        newDock.splice(overIndex, 0, activeId);
      }

      return { ...prev, order: newGrid, bottomNavOrder: newDock };
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    const activeContainer = preferences.bottomNavOrder?.includes(activeId) ? "dock" : "grid";
    const overContainer = overId === "dock-zone" ? "dock" : overId === "grid-zone" ? "grid" : preferences.bottomNavOrder?.includes(overId) ? "dock" : "grid";

    if (activeContainer === overContainer && activeId !== overId) {
      setPreferences((prev) => {
        const items = activeContainer === "dock" ? prev.bottomNavOrder || [] : prev.order;
        const oldIndex = items.indexOf(activeId);
        const newIndex = items.indexOf(overId);

        if (activeContainer === "dock") {
          return { ...prev, bottomNavOrder: arrayMove(items, oldIndex, newIndex) };
        } else {
          return { ...prev, order: arrayMove(items, oldIndex, newIndex) };
        }
      });
    }
  };

  const toggleVisibility = (code: string) => {
    setPreferences((current) => ({
      ...current,
      hidden: current.hidden.includes(code)
        ? current.hidden.filter((item) => item !== code)
        : [...current.hidden, code],
    }));
  };

  const cancelEditing = () => {
    setPreferences(savedPreferences);
    setEditing(false);
  };

  const resetPreferences = () => setPreferences({ version: 1, order: initialGridOrder, bottomNavOrder: initialDockOrder, hidden: [] });

  const savePreferences = () => {
    startTransition(async () => {
      try {
        const saved = await saveAppLauncherPreferencesAction(preferences);
        const savedOrderSet = new Set([...saved.order, ...(saved.bottomNavOrder || [])]);
        const missingCodes = defaultOrder.filter((code) => !savedOrderSet.has(code));
        const normalized = {
          version: 1 as const,
          order: [...saved.order, ...missingCodes],
          bottomNavOrder: saved.bottomNavOrder || [],
          hidden: saved.hidden,
        };
        setPreferences(normalized);
        setSavedPreferences(normalized);
        setEditing(false);
        router.refresh();
        toast.success("Đã lưu bố cục ứng dụng");
      } catch {
        toast.error("Không thể lưu bố cục ứng dụng");
      }
    });
  };

  return (
    <div 
      className="mx-auto max-w-[1200px] px-4 pt-6 pb-6 sm:px-0 sm:py-8"
      onPointerDown={startLongPress}
      onPointerUp={cancelLongPress}
      onPointerLeave={cancelLongPress}
      onPointerMove={handlePointerMove}
      onContextMenu={(e) => {
        if (!editing) e.preventDefault();
      }}
      style={{ WebkitTouchCallout: "none", userSelect: "none", WebkitUserSelect: "none" }}
    >
      {editing && (
        <div 
          className="fixed inset-0 z-[5]"
          onClick={savePreferences}
        />
      )}
      <div className={cn("flex items-center relative z-10", editing ? "mb-4 justify-end sm:mb-10 sm:justify-between" : "hidden sm:flex sm:mb-10 sm:justify-between")}>
        <h1 className="hidden text-[22px] font-bold tracking-tight text-gray-900 sm:block sm:text-[24px]">Ứng dụng của bạn</h1>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button type="button" onClick={resetPreferences} className="quote-action-button quote-action-secondary !px-4 !py-1.5 text-xs sm:text-sm font-semibold">
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Mặc định
              </button>
              <button
                type="button"
                onClick={savePreferences}
                disabled={isPending}
                className="quote-action-button quote-action-primary !px-4 !py-1.5 text-xs sm:text-sm font-semibold rounded-full bg-blue-600 hover:bg-blue-700 text-white border-0"
              >
                {isPending ? "Đang lưu..." : "Xong"}
              </button>
            </>
          ) : null}
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <DroppableZone id="grid-zone" className="flex-1">
          <SortableContext items={gridItems.map((item) => item.code)} strategy={rectSortingStrategy}>
            <div 
              className="grid grid-cols-4 gap-x-2 gap-y-6 sm:gap-x-6 sm:gap-y-10 md:grid-cols-5 lg:grid-cols-6 relative z-10"
            >
              {gridItems.map((item) => (
                <SortableLauncherCard
                  key={item.code}
                  item={item}
                  editing={editing}
                  hidden={preferences.hidden.includes(item.code)}
                  onToggleVisibility={toggleVisibility}
                />
              ))}
            </div>
          </SortableContext>
        </DroppableZone>

        {editing ? (
          <div className="mt-12 mx-2 sm:mx-0 relative z-10 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 p-3 sm:p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-center overflow-x-auto">
              <DroppableZone id="dock-zone" className="flex flex-1 min-h-[96px] items-center justify-center gap-2 sm:gap-4">
                <SortableContext items={dockItems.map((item) => item.code)} strategy={rectSortingStrategy}>
                  {dockItems.map((item) => (
                    <SortableLauncherCard
                      key={item.code}
                      item={item}
                      editing={editing}
                      hidden={false}
                      onToggleVisibility={toggleVisibility}
                    />
                  ))}
                </SortableContext>
              </DroppableZone>
            </div>
          </div>
        ) : null}
      </DndContext>
    </div>
  );
}
