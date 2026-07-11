"use client";

import { motion } from "framer-motion";
import { CalendarDays, CircleDollarSign, GraduationCap, UsersRound } from "lucide-react";
import Link from "next/link";

const quickActions = [
  {
    id: "create-course",
    label: "Tạo khóa học",
    note: "Thiết kế chương trình, học phí, giảng viên",
    href: "/workspace/courses/create",
    icon: GraduationCap,
    color: "text-orange-600 bg-orange-50 group-hover:bg-orange-600 group-hover:text-white",
  },
  {
    id: "create-class",
    label: "Mở lớp học",
    note: "Xếp lớp, lịch vận hành, sĩ số",
    href: "/workspace/training/classes/create",
    icon: UsersRound,
    color: "text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white",
  },
  {
    id: "create-student",
    label: "Thêm học viên",
    note: "Tạo hồ sơ và chuẩn bị ghi danh",
    href: "/workspace/training/students/create",
    icon: CalendarDays,
    color: "text-violet-600 bg-violet-50 group-hover:bg-violet-600 group-hover:text-white",
  },
  {
    id: "record-tuition",
    label: "Ghi nhận học phí",
    note: "Theo dõi đã thu, còn lại, trạng thái",
    href: "/workspace/training/tuition/create",
    icon: CircleDollarSign,
    color: "text-emerald-600 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white",
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
};

export function OverviewQuickActions() {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-medium text-slate-950">Trung tâm vận hành đào tạo</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Thao tác trực tiếp với dữ liệu khóa học, lớp, lịch, học viên và học phí.
          </p>
        </div>
        <Link
          href="/workspace/training/calendar"
          className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
        >
          Lịch học
        </Link>
      </div>

      <motion.div
        className="grid gap-3 sm:grid-cols-2"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.div key={action.id} variants={itemVariants}>
              <Link
                id={`quick-action-${action.id}`}
                href={action.href}
                className="group flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-orange-200 hover:bg-orange-50/50 hover:shadow-sm active:scale-[0.98]"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm transition ${action.color}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <strong className="block text-sm font-medium text-slate-950 transition group-hover:text-orange-700">
                    {action.label}
                  </strong>
                  <small className="mt-0.5 block text-xs text-slate-500">{action.note}</small>
                </span>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </article>
  );
}
