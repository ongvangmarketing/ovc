"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  X, UserPlus, Mail, Phone, User,
  CheckCircle2, ExternalLink, Loader2,
} from "lucide-react";
import { enrollStudentToClass } from "./actions";

interface Props {
  classId: string;
  className: string;
  courseName: string;
}

export function EnrollStudentModal({ classId, className, courseName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    invoiceToken?: string | null;
    isNewUser?: boolean;
  } | null>(null);

  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Vui lòng nhập họ tên và email");
      return;
    }
    setLoading(true);
    const res = await enrollStudentToClass(classId, form);
    setLoading(false);

    if (!res.success) {
      toast.error(res.error || "Có lỗi xảy ra");
      return;
    }

    setResult({ invoiceToken: res.invoiceToken, isNewUser: res.isNewUser });
    router.refresh();
  };

  const handleClose = () => {
    setOpen(false);
    setResult(null);
    setForm({ name: "", email: "", phone: "" });
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-[13px] font-medium text-white hover:bg-gray-800 transition-colors"
      >
        <UserPlus className="h-3.5 w-3.5" />
        Đăng ký học viên
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-[#eaeaea] bg-white"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#eaeaea] px-5 py-4">
                <div>
                  <h3 className="text-[15px] font-medium text-black">Đăng ký học viên vào lớp</h3>
                  <p className="mt-0.5 text-[12px] text-gray-400">{className} — {courseName}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-black transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Result state */}
              {result ? (
                <div className="p-6 text-center space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 mx-auto">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-black">Ghi danh thành công!</p>
                    <p className="mt-1 text-[13px] text-gray-500">
                      {result.isNewUser
                        ? "Tài khoản mới đã được tạo và gửi thông tin đăng nhập qua email."
                        : "Học viên đã được ghi danh vào lớp. Email xác nhận đã gửi."}
                    </p>
                  </div>
                  {result.invoiceToken && (
                    <a
                      href={`/document/${result.invoiceToken}/pay`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#eaeaea] px-4 py-2 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Xem hóa đơn học phí
                    </a>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => { setResult(null); setForm({ name: "", email: "", phone: "" }); }}
                      className="flex flex-1 items-center justify-center h-9 rounded-full border border-[#eaeaea] text-[13px] font-medium text-black hover:bg-gray-50 transition-colors"
                    >
                      Thêm học viên khác
                    </button>
                    <button
                      onClick={handleClose}
                      className="flex flex-1 items-center justify-center h-9 rounded-full bg-black text-[13px] font-medium text-white hover:bg-gray-800 transition-colors"
                    >
                      Xong
                    </button>
                  </div>
                </div>
              ) : (
                /* Form state */
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  {/* Name */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-gray-400">
                      <User className="h-3 w-3" /> Họ và tên <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Nguyễn Văn A"
                      className="flex h-10 w-full rounded-xl border border-[#eaeaea] bg-white px-3 text-[14px] placeholder:text-gray-300 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-gray-400">
                      <Mail className="h-3 w-3" /> Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="email@example.com"
                      className="flex h-10 w-full rounded-xl border border-[#eaeaea] bg-white px-3 text-[14px] placeholder:text-gray-300 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-gray-400">
                      <Phone className="h-3 w-3" /> Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="0901 234 567"
                      className="flex h-10 w-full rounded-xl border border-[#eaeaea] bg-white px-3 text-[14px] placeholder:text-gray-300 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  {/* Info note */}
                  <div className="rounded-xl border border-[#eaeaea] bg-gray-50 px-4 py-3 text-[12px] text-gray-500 leading-relaxed">
                    Hệ thống sẽ tự động:
                    <ul className="mt-1 space-y-0.5 list-disc list-inside text-gray-400">
                      <li>Tạo tài khoản Portal học viên (nếu email chưa có)</li>
                      <li>Ghi danh vào lớp <strong className="text-gray-600">{className}</strong></li>
                      <li>Tạo hóa đơn học phí</li>
                      <li>Gửi email thông tin đăng nhập + link thanh toán</li>
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex flex-1 items-center justify-center h-9 rounded-full border border-[#eaeaea] text-[13px] font-medium text-black hover:bg-gray-50 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex flex-1 items-center justify-center gap-1.5 h-9 rounded-full bg-black text-[13px] font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang xử lý...</>
                      ) : (
                        <><UserPlus className="h-3.5 w-3.5" /> Ghi danh</>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
