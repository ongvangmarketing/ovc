"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  X,
} from "lucide-react";

import type { OverviewAlert } from "../training-overview.types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertCircle,
  CircleDollarSign,
  BookOpen,
  CalendarClock,
};

const toneMap: Record<string, { wrap: string; icon: string; badge: string }> = {
  red: {
    wrap: "border-red-100 bg-red-50 hover:border-red-200 hover:bg-white",
    icon: "text-red-600 bg-red-100",
    badge: "bg-red-600",
  },
  amber: {
    wrap: "border-amber-100 bg-amber-50 hover:border-amber-200 hover:bg-white",
    icon: "text-amber-600 bg-amber-100",
    badge: "bg-amber-600",
  },
  orange: {
    wrap: "border-orange-100 bg-orange-50 hover:border-orange-200 hover:bg-white",
    icon: "text-orange-600 bg-orange-100",
    badge: "bg-orange-600",
  },
  blue: {
    wrap: "border-blue-100 bg-blue-50 hover:border-blue-200 hover:bg-white",
    icon: "text-blue-600 bg-blue-100",
    badge: "bg-blue-600",
  },
};

interface OverviewAlertPanelProps {
  alerts: OverviewAlert[];
  isLoading?: boolean;
}

export function OverviewAlertPanel({ alerts, isLoading }: OverviewAlertPanelProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = alerts.filter((a) => !dismissed.has(a.id));

  function dismiss(id: string) {
    setDismissed((prev) => new Set([...prev, id]));
  }

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-950">Tín hiệu cần xử lý</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Những việc ảnh hưởng trực tiếp tới vận hành và doanh thu đào tạo.
          </p>
        </div>
        {visible.length > 0 && (
          <span className="mt-0.5 shrink-0 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            {visible.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {visible.map((alert) => {
              const Icon = iconMap[alert.icon] ?? AlertCircle;
              const blueTone = { wrap: "border-blue-100 bg-blue-50 hover:border-blue-200 hover:bg-white", icon: "text-blue-600 bg-blue-100" };
              const tone = toneMap[alert.tone] ?? blueTone;
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 10 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <a
                    href={alert.href}
                    className={`group flex items-center gap-3 rounded-xl border p-3 transition ${tone.wrap}`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <strong className="flex-1 text-sm font-semibold text-slate-800">
                      {alert.label}
                    </strong>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700" />
                    <button
                      type="button"
                      id={`dismiss-alert-${alert.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        dismiss(alert.id);
                      }}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700"
                      aria-label="Bỏ qua"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </a>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {!visible.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center"
            >
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              <p className="text-sm font-semibold text-slate-600">Không có cảnh báo vận hành</p>
              <p className="text-xs text-slate-400">Dữ liệu đào tạo đang ở trạng thái ổn định.</p>
            </motion.div>
          )}
        </div>
      )}
    </article>
  );
}
