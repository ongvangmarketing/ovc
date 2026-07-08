"use client";

import { type InputHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { GraduationCap, X } from "lucide-react";
import { toast } from "sonner";

import type { OverviewCourse } from "../training-overview.types";

interface QuickCreateProps {
  onClose: () => void;
  onCreate: (course: Partial<OverviewCourse>) => void;
}

export function OverviewQuickCreate({ onClose, onCreate }: QuickCreateProps) {
  function handleSubmit(formData: FormData) {
    const title = String(formData.get("title") ?? "").trim();
    if (!title) {
      toast.error("Vui lòng nhập tên khóa học");
      return;
    }
    onCreate({
      title,
      instructor: String(formData.get("instructor") ?? "").trim() || "Chưa phân công",
      price: Number(formData.get("price") ?? 0),
      status: "DRAFT",
      level: "beginner",
      description: String(formData.get("description") ?? "").trim(),
      classes: 0,
      enrollments: 0,
      language: "vi",
      isPublic: false,
      isFeatured: false,
      activity: ["Tạo nhanh trong workspace"],
    });
    toast.success("Đã tạo khóa học mới!");
    onClose();
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.form
        action={handleSubmit}
        className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white shadow-2xl"
        initial={{ y: 20, scale: 0.97, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 20, scale: 0.97, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-medium text-slate-950">Tạo nhanh khóa học</h2>
              <p className="text-xs text-slate-500">Điền thông tin cơ bản, sửa chi tiết sau.</p>
            </div>
          </div>
          <button
            type="button"
            id="quick-create-close"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              name="title"
              label="Tên khóa học *"
              placeholder="Vd: Digital Marketing Toàn diện"
              required
              className="sm:col-span-2"
            />
            <Field
              name="instructor"
              label="Giảng viên"
              placeholder="Tên giảng viên phụ trách"
            />
            <Field
              name="price"
              label="Học phí (VND)"
              type="number"
              min="0"
              placeholder="0"
            />
            <Field
              name="description"
              label="Mô tả ngắn"
              placeholder="Mô tả nội dung chính..."
              className="sm:col-span-2"
            />
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700">
            💡 Khóa học sẽ được tạo với trạng thái <strong>Bản nháp</strong>. Bạn có thể chỉnh sửa và xuất bản sau.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            id="quick-create-submit"
            className="h-10 rounded-xl bg-primary px-5 text-sm font-medium text-white transition hover:bg-primary/90 active:scale-95 focus-visible:ring-4 focus-visible:ring-orange-100"
          >
            Tạo khóa học
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function Field({
  label,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) {
  return (
    <label className={`block space-y-1.5 text-sm font-medium text-slate-600 ${className ?? ""}`}>
      {label}
      <input
        {...props}
        className="mt-1.5 block h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
      />
    </label>
  );
}
