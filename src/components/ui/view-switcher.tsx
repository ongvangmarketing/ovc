"use client";

import {
  LayoutGrid,
  Table2,
  List,
  Calendar,
  Kanban,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const VIEW_OPTIONS = {
  table: { icon: Table2, label: "Bảng" },
  card: { icon: LayoutGrid, label: "Thẻ" },
  kanban: { icon: Kanban, label: "Kanban" },
  list: { icon: List, label: "Danh sách" },
  calendar: { icon: Calendar, label: "Lịch" },
} as const;

type ViewOption = keyof typeof VIEW_OPTIONS;

interface ViewSwitcherProps {
  value: string;
  onChange: (value: string) => void;
  options?: ViewOption[];
}

export function ViewSwitcher({
  value,
  onChange,
  options = ["table", "card", "kanban"],
}: ViewSwitcherProps) {
  return (
    <div className="view-switcher">
      {options.map((opt) => {
        const { icon: Icon, label } = VIEW_OPTIONS[opt];
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn("view-switcher-btn", value === opt && "active")}
            title={label}
            aria-label={label}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        );
      })}
    </div>
  );
}
