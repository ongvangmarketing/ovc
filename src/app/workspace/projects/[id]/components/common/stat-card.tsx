import type { ElementType } from "react";
import { cn } from "@/lib/utils/cn";

export function MiniMetric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-muted/60 px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 font-bold text-foreground">{value}</p>
    </div>
  );
}

export function Info({ icon: Icon, label, value }: { icon: ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-border p-3 sm:gap-3 sm:p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-10 sm:w-10">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate whitespace-nowrap text-[11px] text-muted-foreground sm:text-xs">{label}</p>
        <p className="mt-1 truncate whitespace-nowrap text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function ReportMetric({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl bg-white p-3", className)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold text-foreground">{typeof value === "number" ? value.toLocaleString("vi-VN") : value}</p>
    </div>
  );
}

export function SourceRow({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border p-3">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>
        {active ? "Đang bật" : "Tắt"}
      </span>
    </div>
  );
}

export function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
