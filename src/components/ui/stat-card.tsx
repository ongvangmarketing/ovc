"use client";

import { cn } from "@/lib/utils/cn";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign,
  Users,
  FolderKanban,
  TrendingUp,
  FileText,
  GraduationCap
} from "lucide-react";
import type { ElementType } from "react";
import { motion } from "framer-motion";

const iconMap: Record<string, ElementType> = {
  revenue: DollarSign,
  contacts: Users,
  projects: FolderKanban,
  deals: TrendingUp,
  invoices: FileText,
  students: GraduationCap,
};

const colorMap = {
  amber: {
    bg: "bg-amber-100/50 dark:bg-amber-950/30",
    icon: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-200/60 dark:ring-amber-800/40",
  },
  blue: {
    bg: "bg-blue-100/50 dark:bg-blue-950/30",
    icon: "text-blue-600 dark:text-blue-400",
    ring: "ring-blue-200/60 dark:ring-blue-800/40",
  },
  purple: {
    bg: "bg-purple-100/50 dark:bg-purple-950/30",
    icon: "text-purple-600 dark:text-purple-400",
    ring: "ring-purple-200/60 dark:ring-purple-800/40",
  },
  green: {
    bg: "bg-emerald-100/50 dark:bg-emerald-950/30",
    icon: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-200/60 dark:ring-emerald-800/40",
  },
  orange: {
    bg: "bg-orange-100/50 dark:bg-orange-950/30",
    icon: "text-orange-600 dark:text-orange-400",
    ring: "ring-orange-200/60 dark:ring-orange-800/40",
  },
  teal: {
    bg: "bg-teal-100/50 dark:bg-teal-950/30",
    icon: "text-teal-600 dark:text-teal-400",
    ring: "ring-teal-200/60 dark:ring-teal-800/40",
  },
};

type ColorKey = keyof typeof colorMap;

interface StatCardProps {
  id: string;
  label: string;
  value: string;
  change: number;
  trend: "up" | "down";
  color?: ColorKey;
  className?: string;
}

export function StatCard({
  id,
  label,
  value,
  change,
  trend,
  color = "amber",
  className,
}: StatCardProps) {
  const colors = colorMap[color];
  const isPositive = trend === "up";
  const Icon = iconMap[id] || FileText;

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "relative flex flex-col gap-3 p-5 rounded-2xl border border-white/50 bg-white/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/60 transition-all duration-300 overflow-hidden group h-full", 
        className
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent rounded-bl-full opacity-50 -z-10" />
      
      {/* Icon */}
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl ring-1 transition-transform duration-300 group-hover:scale-110 shadow-sm",
          colors.bg,
          colors.ring
        )}
      >
        <Icon className={cn("w-5 h-5", colors.icon)} />
      </div>

      {/* Value */}
      <div className="space-y-1 z-10">
        <p className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent tabular-nums leading-none tracking-tight">
          {value}
        </p>
        <p className="text-sm font-medium text-gray-500 leading-none mt-1">{label}</p>
      </div>

      {/* Trend */}
      <div
        className={cn(
          "flex items-center gap-1.5 text-xs font-semibold mt-auto z-10 pt-2",
          isPositive ? "text-emerald-600" : "text-rose-500"
        )}
      >
        <div className={cn("flex items-center justify-center w-5 h-5 rounded-full", isPositive ? "bg-emerald-100" : "bg-rose-100")}>
          {isPositive ? (
            <ArrowUpRight className="w-3.5 h-3.5" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5" />
          )}
        </div>
        <span>{Math.abs(change)}% so với tháng trước</span>
      </div>
    </motion.div>
  );
}
