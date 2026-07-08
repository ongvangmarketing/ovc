"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface OverviewHeaderProps {
  onQuickCreate: () => void;
}

export function OverviewHeader({ onQuickCreate }: OverviewHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-orange-500">
          Education OS
        </p>
        <h1 className="mt-1 text-[15px] font-medium text-foreground">
          Tổng quan Đào tạo
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Quản lý học viên, khóa học, lớp học, giảng viên, lịch học và chứng chỉ theo từng công ty.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center gap-2"
      >
        <button
          id="training-overview-quick-create"
          onClick={onQuickCreate}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-100 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Tạo nhanh
        </button>
      </motion.div>
    </header>
  );
}
