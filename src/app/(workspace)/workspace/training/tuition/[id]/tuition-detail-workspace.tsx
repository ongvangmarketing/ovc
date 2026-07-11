"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Edit3, Save, X, Banknote, Wallet,
  AlertCircle, FileText, Download, Check,
  ExternalLink, CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { updateTuitionInline } from "./actions";
import { cn } from "@/lib/utils/cn";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

type TuitionData = {
  id: string;
  student: { id: string; name: string; email: string; phone: string | null };
  course: { id: string; title: string; price: unknown };
  class: { id: string; name: string } | null;
  tuitionFee: number;
  paidAmount: number;
  paymentStatus: string;
  paymentNote: string | null;
  status: string;
  progress: number;
  createdAt: Date;
  financeInvoiceId?: string | null;
};

const fmtMoney = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v || 0);

const fmtDate = (d: Date | string | null) => {
  if (!d) return "--";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d));
};

const STATUS_LABEL: Record<string, string> = {
  PAID: "Hoàn thành", paid: "Hoàn thành",
  PARTIAL: "Đóng 1 phần", partial: "Đóng 1 phần",
  PENDING: "Chưa nộp", unpaid: "Chưa nộp",
};

export function TuitionDetailWorkspace({ initialData }: { initialData: TuitionData }) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [financeInvoiceId, setFinanceInvoiceId] = useState<string | null>(initialData.financeInvoiceId || null);
  const [financeInvoiceToken, setFinanceInvoiceToken] = useState<string | null>(null);
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [draftFee, setDraftFee] = useState(data.tuitionFee.toString());
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [draftNote, setDraftNote] = useState(data.paymentNote || "");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const remaining = Math.max(0, data.tuitionFee - data.paidAmount);
  const paidRatio = data.tuitionFee > 0 ? Math.min(100, Math.round((data.paidAmount / data.tuitionFee) * 100)) : 0;
  const isPaid = remaining <= 0;

  const rawStatus = data.paymentStatus;
  const isStatusPaid = rawStatus === "PAID" || rawStatus === "paid";
  const isStatusPartial = rawStatus === "PARTIAL" || rawStatus === "partial";

  const statusCls = isStatusPaid
    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
    : isStatusPartial
      ? "bg-amber-50 text-amber-700 border-amber-100"
      : "border-[#eaeaea] bg-white text-gray-600";

  const handleSaveFee = async () => {
    const newFee = Number(draftFee.replace(/\D/g, ""));
    if (isNaN(newFee)) return;
    setIsSaving(true);
    const res = await updateTuitionInline(data.id, { tuitionFee: newFee });
    if (res.success) {
      setData(p => ({ ...p, tuitionFee: newFee }));
      if (res.invoiceId) setFinanceInvoiceId(res.invoiceId);
      if (res.invoiceToken) setFinanceInvoiceToken(res.invoiceToken);
      toast.success("Đã cập nhật học phí");
      setIsEditingAmount(false);
      router.refresh();
    } else toast.error(res.error || "Lỗi cập nhật học phí");
    setIsSaving(false);
  };

  const handleSaveNote = async () => {
    setIsSaving(true);
    const res = await updateTuitionInline(data.id, { paymentNote: draftNote });
    if (res.success) {
      setData(p => ({ ...p, paymentNote: draftNote }));
      if (res.invoiceId) setFinanceInvoiceId(res.invoiceId);
      if (res.invoiceToken) setFinanceInvoiceToken(res.invoiceToken);
      toast.success("Đã lưu ghi chú");
      setIsEditingNote(false);
      router.refresh();
    } else toast.error(res.error || "Lỗi lưu ghi chú");
    setIsSaving(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    const res = await updateTuitionInline(data.id, { paymentStatus: newStatus });
    if (res.success) {
      setData(p => ({ ...p, paymentStatus: newStatus }));
      if (res.invoiceId) setFinanceInvoiceId(res.invoiceId);
      if (res.invoiceToken) setFinanceInvoiceToken(res.invoiceToken);
      toast.success("Đã cập nhật trạng thái");
      router.refresh();
    } else toast.error(res.error || "Lỗi cập nhật trạng thái");
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(paymentAmount.replace(/\D/g, ""));
    if (isNaN(amount) || amount <= 0) { toast.error("Số tiền không hợp lệ"); return; }
    setIsSaving(true);
    const newPaid = data.paidAmount + amount;
    const newStatus = newPaid >= data.tuitionFee ? "PAID" : "PARTIAL";
    const res = await updateTuitionInline(data.id, { paidAmount: newPaid, paymentStatus: newStatus, paymentAmountAdded: amount });
    if (res.success) {
      setData(p => ({ ...p, paidAmount: newPaid, paymentStatus: newStatus }));
      if (res.invoiceId) setFinanceInvoiceId(res.invoiceId);
      if (res.invoiceToken) setFinanceInvoiceToken(res.invoiceToken);
      toast.success("Đã ghi nhận thanh toán");
      setIsPaymentModalOpen(false);
      setPaymentAmount("");
      router.refresh();
    } else toast.error(res.error || "Lỗi ghi nhận");
    setIsSaving(false);
  };

  const syncInvoice = async () => {
    setIsSaving(true);
    const res = await updateTuitionInline(data.id, {});
    if (res.success && res.invoiceId) {
      setFinanceInvoiceId(res.invoiceId);
      if (res.invoiceToken) setFinanceInvoiceToken(res.invoiceToken);
      toast.success("Đã đồng bộ Hóa đơn Tài chính");
    } else toast.error("Không thể đồng bộ");
    setIsSaving(false);
  };

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-white">

      {/* ── Topbar ── */}
      <div className="sticky top-0 z-20 flex h-[56px] shrink-0 items-center justify-between border-b border-[#eaeaea] bg-white px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/workspace/training/tuition"
            className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Học phí
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-[13px] text-black font-medium">{data.student.name}</span>
          <span className={cn("ml-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest", statusCls)}>
            {STATUS_LABEL[rawStatus] || "Chưa nộp"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Link tới Hóa đơn công khai (để gửi KH) */}
          {financeInvoiceToken && (
            <Link
              href={`/document/${financeInvoiceToken}`}
              target="_blank"
              className="flex items-center gap-1.5 rounded-full border border-[#eaeaea] bg-white px-4 py-1.5 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Gửi học viên</span>
            </Link>
          )}
          {/* Link tới Finance Invoice */}
          {financeInvoiceId ? (
            <Link
              href={`/workspace/finance/invoices/${financeInvoiceId}`}
              className="flex items-center gap-1.5 rounded-full border border-[#eaeaea] bg-white px-4 py-1.5 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Xem HĐ Finance</span>
            </Link>
          ) : (
            <button
              onClick={syncInvoice}
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-full border border-[#eaeaea] bg-white px-4 py-1.5 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tạo HĐ Finance</span>
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-full border border-[#eaeaea] bg-white px-4 py-1.5 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Xuất PDF</span>
          </button>
          {!isPaid && (
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-black px-5 py-2 text-[13px] font-medium text-white hover:bg-gray-800 transition-colors"
            >
              <Banknote className="h-3.5 w-3.5" />
              Thu tiền
            </button>
          )}
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 overflow-y-auto bg-[#fafafa] p-6 sm:p-8">
        <div className="mx-auto max-w-3xl space-y-4">

          {/* Paid banner */}
          {isPaid && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <p className="text-[14px] font-medium text-emerald-800">Học viên này đã hoàn thành học phí.</p>
            </div>
          )}

          {/* Student + Course info */}
          <div className="rounded-2xl border border-[#eaeaea] bg-white divide-y divide-[#eaeaea]">
            {/* Student */}
            <div className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-3">Thông tin học viên</p>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[16px] font-medium text-black">{data.student.name}</p>
                  <p className="mt-0.5 text-[13px] text-gray-400">{data.student.email}</p>
                  <p className="mt-0.5 text-[13px] text-gray-400">{data.student.phone || "Chưa có SĐT"}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-1">Ngày đăng ký</p>
                  <p className="text-[13px] text-black">{fmtDate(data.createdAt)}</p>
                </div>
              </div>
            </div>
            {/* Course */}
            <div className="p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-1">Khóa học / Lớp</p>
                <p className="text-[14px] font-medium text-black">{data.course.title}</p>
                <p className="text-[13px] text-gray-400">{data.class?.name || "Chưa xếp lớp"}</p>
              </div>
              {/* Trạng thái nhanh */}
              <div>
                <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-1">Trạng thái</p>
                <select
                  value={data.paymentStatus}
                  onChange={e => handleStatusChange(e.target.value)}
                  className="block rounded-lg border border-[#eaeaea] bg-white text-[13px] font-medium text-black focus:border-black focus:ring-1 focus:ring-black h-8 px-3 cursor-pointer"
                >
                  <option value="PENDING">Chưa nộp</option>
                  <option value="unpaid">Chưa nộp</option>
                  <option value="PARTIAL">Đóng 1 phần</option>
                  <option value="PAID">Hoàn thành</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment summary */}
          <div className="rounded-2xl border border-[#eaeaea] bg-white p-5">
            <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-4">Chi tiết học phí</p>

            {/* Progress bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] text-gray-400">Tiến độ đóng tiền</span>
                <span className="text-[12px] font-medium text-black">{paidRatio}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", isPaid ? "bg-emerald-500" : "bg-black")}
                  style={{ width: `${paidRatio}%` }}
                />
              </div>
            </div>

            {/* Line item */}
            <div className="border-t border-[#eaeaea] pt-4 space-y-3">
              <div className="flex items-center justify-between group">
                <div>
                  <p className="text-[13px] font-medium text-black">Học phí khóa học</p>
                  <p className="text-[12px] text-gray-400">{data.course.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isEditingAmount ? (
                    <>
                      <input
                        type="text"
                        value={draftFee}
                        onChange={e => setDraftFee(e.target.value)}
                        className="w-28 h-8 rounded-lg border border-[#eaeaea] px-2.5 text-right text-[13px] focus:border-black focus:outline-none"
                        autoFocus
                      />
                      <button onClick={handleSaveFee} disabled={isSaving} className="p-1 rounded text-black hover:bg-gray-100">
                        <Save className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setIsEditingAmount(false)} className="p-1 rounded text-gray-400 hover:bg-gray-100">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-[14px] font-medium text-black">{fmtMoney(data.tuitionFee)}</span>
                      <button
                        onClick={() => setIsEditingAmount(true)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-gray-400 hover:text-black"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gray-400">Đã thanh toán</span>
                <span className="text-[13px] font-medium text-emerald-600">−{fmtMoney(data.paidAmount)}</span>
              </div>

              <div className="border-t border-[#eaeaea] pt-3 flex items-center justify-between">
                <span className="text-[14px] font-medium text-black">Còn lại</span>
                <span className={cn("text-[18px] font-medium", isPaid ? "text-emerald-600" : "text-red-600")}>
                  {isPaid ? <span className="flex items-center gap-1"><Check className="h-4 w-4" /> Đã thanh toán đủ</span> : fmtMoney(remaining)}
                </span>
              </div>
            </div>

            {/* Thu tiền inline CTA */}
            {!isPaid && (
              <div className="mt-4 pt-4 border-t border-[#eaeaea]">
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-2.5 text-[13px] font-medium text-white hover:bg-gray-800 transition-colors"
                >
                  <Banknote className="h-4 w-4" />
                  Ghi nhận thanh toán
                </button>
              </div>
            )}
          </div>

          {/* Note */}
          <div className="rounded-2xl border border-[#eaeaea] bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400">Ghi chú thanh toán</p>
              {!isEditingNote && (
                <button onClick={() => setIsEditingNote(true)} className="text-[12px] text-gray-500 hover:text-black transition-colors">
                  Sửa
                </button>
              )}
            </div>

            {isEditingNote ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-[#eaeaea] overflow-hidden focus-within:border-black">
                  <TiptapEditor value={draftNote} onChange={c => setDraftNote(c)} placeholder="Nhập ghi chú..." />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveNote} disabled={isSaving} className="flex h-8 items-center gap-1.5 rounded-full bg-black px-4 text-[12px] font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50">
                    Lưu
                  </button>
                  <button onClick={() => setIsEditingNote(false)} className="flex h-8 items-center gap-1.5 rounded-full border border-[#eaeaea] px-4 text-[12px] font-medium text-black hover:bg-gray-50 transition-colors">
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingNote(true)}
                className="min-h-[48px] cursor-text rounded-xl border border-dashed border-[#eaeaea] p-4 text-[13px] text-gray-500 hover:border-gray-300 transition-colors"
              >
                {data.paymentNote ? (
                  <div dangerouslySetInnerHTML={{ __html: data.paymentNote }} />
                ) : (
                  <span className="text-gray-300 italic">Nhấp để thêm ghi chú...</span>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Payment Modal ── */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#eaeaea] bg-white"
            >
              <div className="flex items-center justify-between border-b border-[#eaeaea] px-5 py-4">
                <h3 className="text-[15px] font-medium text-black flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-gray-400" />
                  Ghi nhận thanh toán
                </h3>
                <button onClick={() => setIsPaymentModalOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-black transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="p-5 space-y-4">
                {/* Còn lại */}
                <div className="flex items-center justify-between rounded-xl border border-[#eaeaea] bg-gray-50 px-4 py-3">
                  <span className="text-[12px] text-gray-400">Còn cần thu</span>
                  <span className="text-[16px] font-medium text-red-600">{fmtMoney(remaining)}</span>
                </div>

                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-gray-500 uppercase tracking-wider">Số tiền thu (VND)</label>
                  <input
                    required
                    autoFocus
                    type="text"
                    value={paymentAmount}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, "");
                      setPaymentAmount(v ? Number(v).toLocaleString("vi-VN") : "");
                    }}
                    placeholder={`Tối đa ${remaining.toLocaleString("vi-VN")}`}
                    className="flex h-10 w-full rounded-xl border border-[#eaeaea] bg-white px-3 text-[14px] placeholder:text-gray-300 focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div className="flex items-start gap-2.5 rounded-xl border border-[#eaeaea] bg-gray-50 p-3">
                  <AlertCircle className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />
                  <p className="text-[12px] text-gray-500 leading-relaxed">
                    Khoản thu sẽ được cộng vào <strong>Đã thanh toán</strong> và đồng bộ sang Hóa đơn Finance tự động.
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="flex flex-1 items-center justify-center h-9 rounded-full border border-[#eaeaea] text-[13px] font-medium text-black hover:bg-gray-50 transition-colors">
                    Hủy
                  </button>
                  <button type="submit" disabled={isSaving || !paymentAmount} className="flex flex-1 items-center justify-center h-9 rounded-full bg-black text-[13px] font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-40">
                    {isSaving ? "Đang lưu..." : "Xác nhận thu"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
