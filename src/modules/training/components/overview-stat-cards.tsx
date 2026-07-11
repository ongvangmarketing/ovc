"use client";

import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  School,
  Sparkles,
  UserCheck,
  Users,
  WalletCards,
} from "lucide-react";

import type { OverviewStat } from "@/modules/training/types/training-overview.types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  WalletCards,
  Users,
  Sparkles,
  BookOpen,
  School,
  UserCheck,
  Award,
};

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

interface OverviewStatCardsProps {
  stats: OverviewStat[];
  isLoading?: boolean;
}

export function OverviewStatCards({ stats, isLoading }: OverviewStatCardsProps) {
  if (isLoading) {
    return (
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-[108px] animate-pulse rounded-2xl border border-[#eaeaea] bg-white" />
        ))}
      </section>
    );
  }

  return (
    <motion.section
      className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {stats.map((stat) => {
        const Icon = iconMap[stat.icon];
        return (
          <motion.article
            key={stat.id}
            variants={itemVariants}
            className="group cursor-default rounded-2xl border border-[#eaeaea] bg-white p-4 transition-colors hover:border-gray-300"
          >
            {Icon ? (
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[#eaeaea] bg-gray-50 text-gray-700">
                <Icon className="h-5 w-5" />
              </div>
            ) : null}
            <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400">{stat.label}</p>
            <strong className="mt-1.5 block text-[15px] font-medium tabular-nums text-slate-950">
              {stat.value}
            </strong>
            <small className="mt-1 block text-xs font-medium text-gray-500">
              {stat.note}
            </small>
          </motion.article>
        );
      })}
    </motion.section>
  );
}
