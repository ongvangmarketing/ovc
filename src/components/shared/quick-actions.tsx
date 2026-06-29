"use client";

import { Plus, UserPlus, FolderPlus, FileText, DollarSign } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

const actions = [
  { id: "contact", label: "Thêm liên hệ", icon: UserPlus, color: "text-blue-600" },
  { id: "project", label: "Tạo dự án", icon: FolderPlus, color: "text-purple-600" },
  { id: "invoice", label: "Tạo hóa đơn", icon: FileText, color: "text-amber-600" },
  { id: "payment", label: "Ghi nhận thanh toán", icon: DollarSign, color: "text-emerald-600" },
];

export function QuickActions() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all duration-150 shadow-sm hover:shadow-md"
      >
        <Plus className={cn("w-4 h-4 transition-transform duration-200", open && "rotate-45")} />
        Tạo mới
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 card-base shadow-xl w-52 p-1.5 animate-scale-in">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-left transition-colors group"
                >
                  <Icon className={cn("w-4 h-4 flex-shrink-0", action.color)} />
                  <span className="text-sm text-foreground group-hover:text-foreground">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
