"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit3, Save, X, Banknote, CreditCard, Wallet, Calendar, AlertCircle, FileText, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { updateTuitionInline } from "./actions";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

type TuitionData = {
  id: string;
  student: { id: string; name: string; email: string; phone: string | null };
  course: { id: string; title: string; price: any };
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

const formatMoney = (value: number) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value || 0);
};

const formatDate = (date: Date | string | null) => {
  if (!date) return "--";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(date));
};

export function TuitionDetailWorkspace({ initialData }: { initialData: TuitionData }) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [financeInvoiceId, setFinanceInvoiceId] = useState<string | null>(initialData.financeInvoiceId || null);
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [draftFee, setDraftFee] = useState(data.tuitionFee.toString());
  
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [draftNote, setDraftNote] = useState(data.paymentNote || "");
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const remaining = Math.max(0, data.tuitionFee - data.paidAmount);
  
  const statusColor = 
    data.paymentStatus === "PAID" ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
    data.paymentStatus === "PARTIAL" ? "text-amber-700 bg-amber-50 border-amber-200" :
    "text-red-700 bg-red-50 border-red-200";

  const handleSaveFee = async () => {
    const newFee = Number(draftFee.replace(/\D/g, ""));
    if (isNaN(newFee)) return;
    setIsSaving(true);
    const res = await updateTuitionInline(data.id, { tuitionFee: newFee });
    if (res.success) {
      setData(prev => ({ ...prev, tuitionFee: newFee }));
      if (res.invoiceId) setFinanceInvoiceId(res.invoiceId);
      toast.success("Đã cập nhật học phí");
      setIsEditingAmount(false);
      router.refresh();
    } else {
      toast.error(res.error || "Lỗi cập nhật học phí");
    }
    setIsSaving(false);
  };

  const handleSaveNote = async () => {
    setIsSaving(true);
    const res = await updateTuitionInline(data.id, { paymentNote: draftNote });
    if (res.success) {
      setData(prev => ({ ...prev, paymentNote: draftNote }));
      if (res.invoiceId) setFinanceInvoiceId(res.invoiceId);
      toast.success("Đã lưu ghi chú");
      setIsEditingNote(false);
      router.refresh();
    } else {
      toast.error(res.error || "Lỗi lưu ghi chú");
    }
    setIsSaving(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    const res = await updateTuitionInline(data.id, { paymentStatus: newStatus });
    if (res.success) {
      setData(prev => ({ ...prev, paymentStatus: newStatus }));
      if (res.invoiceId) setFinanceInvoiceId(res.invoiceId);
      toast.success("Đã cập nhật trạng thái");
      router.refresh();
    } else {
      toast.error(res.error || "Lỗi cập nhật trạng thái");
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(paymentAmount.replace(/\D/g, ""));
    if (isNaN(amount) || amount <= 0) {
      toast.error("Số tiền không hợp lệ");
      return;
    }
    
    setIsSaving(true);
    const newPaid = data.paidAmount + amount;
    const newStatus = newPaid >= data.tuitionFee ? "PAID" : "PARTIAL";
    
    const res = await updateTuitionInline(data.id, { 
      paidAmount: newPaid, 
      paymentStatus: newStatus,
      paymentAmountAdded: amount 
    });
    if (res.success) {
      setData(prev => ({ ...prev, paidAmount: newPaid, paymentStatus: newStatus }));
      if (res.invoiceId) setFinanceInvoiceId(res.invoiceId);
      toast.success("Đã ghi nhận thanh toán");
      setIsPaymentModalOpen(false);
      setPaymentAmount("");
      router.refresh();
    } else {
      toast.error(res.error || "Lỗi ghi nhận");
    }
    setIsSaving(false);
  };

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-slate-50/50">
      <div className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border bg-white/80 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/workspace/training/tuition" className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Quay lại">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-sm font-medium text-foreground">Biên lai Học phí</h1>
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium border", statusColor)}>
            {data.paymentStatus === "PAID" ? "Hoàn thành" : data.paymentStatus === "PARTIAL" ? "Đóng 1 phần" : "Chưa nộp"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {financeInvoiceId ? (
            <Link href={`/workspace/finance/invoices/${financeInvoiceId}`} className="flex h-8 items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors">
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Xem Hóa Đơn HP</span>
            </Link>
          ) : (
            <button 
              onClick={async () => {
                setIsSaving(true);
                const res = await updateTuitionInline(data.id, {});
                if (res.success && res.invoiceId) {
                  setFinanceInvoiceId(res.invoiceId);
                  toast.success("Đã đồng bộ Hóa đơn Tài chính");
                }
                setIsSaving(false);
              }}
              disabled={isSaving}
              className="flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tạo HĐ Tài chính</span>
            </button>
          )}
          <button onClick={() => window.print()} className="flex h-8 items-center gap-2 rounded-lg border border-border bg-white px-3 text-xs font-medium text-foreground hover:bg-muted transition-colors">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Xuất PDF</span>
          </button>
          {remaining > 0 && (
            <button onClick={() => setIsPaymentModalOpen(true)} className="flex h-8 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-medium text-white hover:bg-primary/90 transition-colors shadow-sm">
              <Banknote className="h-3.5 w-3.5" />
              <span>Thu tiền</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-4 lg:p-8">
        <div className="mx-auto max-w-4xl">
          {/* A4 Paper Style Document */}
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm print:m-0 print:border-none print:shadow-none print:p-0">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-100 pb-8">
              <div>
                <h2 className="text-3xl font-medium tracking-tight text-slate-900">PHIẾU THU HỌC PHÍ</h2>
                <p className="mt-2 text-sm text-slate-500">Mã GD: #{data.id.slice(-8).toUpperCase()}</p>
                <p className="mt-1 text-sm text-slate-500">Ngày lập: {formatDate(data.createdAt)}</p>
              </div>
              <div className="text-right">
                <h3 className="text-[15px] font-medium text-slate-900">Thông tin học viên</h3>
                <p className="mt-1 font-medium text-slate-700">{data.student.name}</p>
                <p className="mt-1 text-sm text-slate-500">{data.student.email}</p>
                <p className="mt-1 text-sm text-slate-500">{data.student.phone || "Chưa có SĐT"}</p>
              </div>
            </div>

            {/* Course Info */}
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Khóa học / Lớp</p>
                <p className="mt-2 font-medium text-slate-900">{data.course.title}</p>
                <p className="mt-1 text-sm text-slate-600">{data.class?.name || "Chưa xếp lớp"}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Trạng thái thanh toán</p>
                <select 
                  value={data.paymentStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="mt-2 block w-full rounded-lg border-slate-200 bg-white text-sm font-medium text-slate-900 focus:border-primary focus:ring-primary shadow-sm"
                >
                  <option value="PENDING">Chưa nộp</option>
                  <option value="unpaid">Chưa nộp</option>
                  <option value="PARTIAL">Đóng 1 phần</option>
                  <option value="PAID">Hoàn thành</option>
                </select>
              </div>
            </div>

            {/* Line Items (Editable Tuition Fee) */}
            <div className="mt-8">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-3 font-medium uppercase tracking-wider">Mô tả khoản thu</th>
                    <th className="pb-3 text-right font-medium uppercase tracking-wider w-48">Thành tiền (VND)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="group">
                    <td className="py-4">
                      <p className="font-medium text-slate-900">Học phí khóa học</p>
                      <p className="mt-1 text-xs text-slate-500">Áp dụng cho khóa {data.course.title}</p>
                    </td>
                    <td className="py-4 text-right">
                      {isEditingAmount ? (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="text"
                            value={draftFee}
                            onChange={(e) => setDraftFee(e.target.value)}
                            className="w-32 rounded-lg border-slate-200 text-right text-sm focus:border-primary focus:ring-primary shadow-sm"
                            autoFocus
                          />
                          <button onClick={handleSaveFee} disabled={isSaving} className="rounded p-1 text-emerald-600 hover:bg-emerald-50"><Save className="h-4 w-4" /></button>
                          <button onClick={() => setIsEditingAmount(false)} className="rounded p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600"><X className="h-4 w-4" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-3">
                          <span className="font-medium text-slate-900">{formatMoney(data.tuitionFee)}</span>
                          <button onClick={() => setIsEditingAmount(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-primary">
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="mt-6 flex justify-end">
              <div className="w-full max-w-sm space-y-3 rounded-xl bg-slate-50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tổng học phí</span>
                  <span className="font-medium text-slate-900">{formatMoney(data.tuitionFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Đã thanh toán</span>
                  <span className="font-medium text-emerald-600">-{formatMoney(data.paidAmount)}</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex justify-between">
                  <span className="font-medium text-slate-900">Cần thu thêm</span>
                  <span className="text-[15px] font-medium text-red-600">{formatMoney(remaining)}</span>
                </div>
              </div>
            </div>

            {/* Editable Note */}
            <div className="mt-8 border-t border-slate-100 pt-8">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-slate-900 flex items-center gap-2"><FileText className="h-4 w-4 text-slate-400"/> Ghi chú thanh toán</h4>
                {!isEditingNote && (
                  <button onClick={() => setIsEditingNote(true)} className="text-xs font-medium text-primary hover:text-primary/80">Sửa ghi chú</button>
                )}
              </div>
              
              {isEditingNote ? (
                <div className="space-y-3">
                  <TiptapEditor
                    value={draftNote}
                    onChange={(content) => setDraftNote(content)}
                    placeholder="Nhập ghi chú cho biên lai này..."
                  />
                  <div className="flex items-center gap-2">
                    <button onClick={handleSaveNote} disabled={isSaving} className="flex h-8 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-medium text-white hover:bg-primary/90">
                      Lưu ghi chú
                    </button>
                    <button onClick={() => setIsEditingNote(false)} className="flex h-8 items-center gap-2 rounded-lg border border-border px-3 text-xs font-medium text-foreground hover:bg-muted">
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div onClick={() => setIsEditingNote(true)} className="rounded-xl bg-amber-50/50 border border-amber-100/50 p-4 text-sm text-slate-600 hover:bg-amber-50 cursor-pointer transition-colors min-h-[60px]">
                  {data.paymentNote ? (
                    <p className="whitespace-pre-wrap">{data.paymentNote}</p>
                  ) : (
                    <p className="text-slate-400 italic">Nhấp vào đây để thêm ghi chú...</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }} className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="font-medium text-foreground flex items-center gap-2"><Wallet className="h-4 w-4 text-primary"/> Ghi nhận thanh toán</h3>
                <button onClick={() => setIsPaymentModalOpen(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleRecordPayment} className="p-4 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Số tiền thanh toán (VNĐ)</label>
                  <input
                    required
                    autoFocus
                    type="text"
                    value={paymentAmount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setPaymentAmount(val ? Number(val).toLocaleString("vi-VN") : "");
                    }}
                    placeholder={`Tối đa: ${remaining.toLocaleString("vi-VN")}`}
                    className="w-full rounded-xl border-slate-200 p-3 text-[15px] font-medium focus:border-primary focus:ring-primary shadow-sm"
                  />
                </div>
                <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800 flex gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0 text-blue-500 mt-0.5" />
                  <p>Khoản thanh toán này sẽ được cộng trực tiếp vào phần <strong>Đã thanh toán</strong> và trừ đi khoản <strong>Cần thu thêm</strong>.</p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="flex-1 h-10 rounded-xl border border-border font-medium text-foreground hover:bg-muted transition-colors">
                    Hủy
                  </button>
                  <button type="submit" disabled={isSaving || !paymentAmount} className="flex-1 h-10 rounded-xl bg-primary font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50">
                    {isSaving ? "Đang xử lý..." : "Xác nhận thu"}
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
