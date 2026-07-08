"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Download, Eye, Edit, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { ConfirmModal } from "@/components/ui/confirm-modal";
const QUOTATION_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Bản nháp",
  SENT: "Đã gửi",
  VIEWED: "Đã xem",
  ACCEPTED: "Chấp nhận",
  REJECTED: "Từ chối",
  CONVERTED: "Đã chuyển đổi",
  EXPIRED: "Hết hạn",
};
const QUOTATION_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-white border border-[#eaeaea] text-gray-500",
  SENT: "bg-white border border-[#eaeaea] text-black",
  VIEWED: "bg-white border border-[#eaeaea] text-black",
  ACCEPTED: "bg-gray-100 text-black",
  REJECTED: "bg-white border border-red-200 text-red-600",
  CONVERTED: "bg-black text-white",
  EXPIRED: "bg-white border border-[#eaeaea] text-gray-400",
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuotations, getQuotationById } from "@/app/actions/finance";
import { deleteQuotation } from "@/app/actions/finance-crud";
import { QuotationDetailView } from "@/modules/finance/components/quotation-detail";

type FinanceContact = {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: { name?: string | null } | null;
};

function getCustomerName(contact?: FinanceContact | null) {
  if (!contact) return "Không gắn khách hàng";
  const fullName = contact.name || `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
  return contact.company?.name || fullName || contact.email || contact.phone || "Không gắn khách hàng";
}

function displayQuotationNumber(number: string) {
  return /^[A-Za-zÀ-ỹ]/.test(number) ? number : `BG-${number}`;
}

export function QuotationsClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);

  const { data: quotations = [] } = useQuery({
    queryKey: ["quotations"],
    queryFn: () => getQuotations(),
  });

  const { data: detailData, isLoading: isDetailLoading } = useQuery({
    queryKey: ["quotation", selectedQuotationId],
    queryFn: () => getQuotationById(selectedQuotationId!),
    enabled: !!selectedQuotationId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteQuotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      setDeletingId(null);
    }
  });

  const summaryStats = [
    { label: "Tổng báo giá", value: quotations.reduce((s: any, i: any) => s + Number(i.total), 0) },
    { label: "Đã gửi", value: quotations.filter((i: any) => i.status === "SENT").reduce((s: any, i: any) => s + Number(i.total), 0) },
    { label: "Chấp nhận", value: quotations.filter((i: any) => i.status === "ACCEPTED").reduce((s: any, i: any) => s + Number(i.total), 0) },
    { label: "Đã chuyển đổi", value: quotations.filter((i: any) => i.status === "CONVERTED").reduce((s: any, i: any) => s + Number(i.total), 0) },
  ];



  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-10 lg:px-12 bg-white min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[36px] font-medium tracking-tighter text-black leading-none mb-3">Báo giá</h1>
          <p className="text-[14px] text-gray-500">{quotations.length} báo giá</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-9 px-4 rounded-lg border border-[#eaeaea] text-[14px] font-medium text-black hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> Xuất
          </button>
          <Link href="/workspace/finance/quotations/create" className="h-9 px-4 rounded-lg bg-black text-white text-[14px] font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2 shadow-none">
            <Plus className="w-4 h-4" /> Tạo Báo giá
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-[#eaeaea] bg-white p-6 hover:border-black transition-colors duration-200">
            <p className="text-[12px] font-medium text-gray-400 uppercase tracking-widest mb-4">{stat.label}</p>
            <p className="text-[24px] font-medium tracking-tight text-black">
              {formatCurrency(stat.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#eaeaea] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px] [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
            <thead className="bg-gray-50/50 border-b border-[#eaeaea]">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px]">Số Báo giá</th>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px]">Khách hàng</th>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px]">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px]">Tổng tiền</th>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px]">Ngày tạo</th>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px] w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {quotations.map((inv) => {
                const statusColor = QUOTATION_STATUS_COLORS[inv.status] || QUOTATION_STATUS_COLORS["DRAFT"];
                const statusLabel = QUOTATION_STATUS_LABELS[inv.status] || inv.status;

                return (
                  <tr key={inv.id} onClick={() => setSelectedQuotationId(inv.id)} className="cursor-pointer hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/workspace/finance/quotations/${inv.id}`} className="font-medium text-black hover:underline">
                        {displayQuotationNumber(inv.number)}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="block truncate font-medium text-black">{getCustomerName(inv.contact)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex items-center px-2 py-1 rounded-[6px] font-medium text-[11px] uppercase tracking-wide", statusColor)}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-black">{formatCurrency(Number(inv.total))}</td>
                    <td className="px-6 py-4 text-gray-500">
                      <span>
                        {inv.createdAt ? formatDate(new Date(inv.createdAt)) : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={`/workspace/finance/quotations/${inv.id}`} className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-black hover:bg-gray-100 transition-all" title="Xem chi tiết">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/workspace/finance/quotations/${inv.id}/edit`} className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-black hover:bg-gray-100 transition-all" title="Chỉnh sửa">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          onClick={() => setDeletingId(inv.id)}
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Xác nhận xóa Báo giá"
        message="Bạn có chắc chắn muốn xóa báo giá này không? Dữ liệu đã xóa không thể khôi phục."
        confirmText="Xóa Báo giá"
        isDestructive={true}
      />

      {/* Side Panel Overlay */}
      {selectedQuotationId && (
        <div className="fixed inset-0 bg-black/20 z-[999]" onClick={() => setSelectedQuotationId(null)} />
      )}
      
      {/* Side Panel */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-[800px] bg-white shadow-2xl z-[1000] transform transition-transform duration-300 ease-in-out flex flex-col",
          selectedQuotationId ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#eaeaea]">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-medium">Chi tiết Báo giá</h2>
            {detailData && (
              <span className="inline-block rounded-full border border-[#eaeaea] bg-white px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-black">
                {detailData.status}
              </span>
            )}
          </div>
          <button onClick={() => setSelectedQuotationId(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto bg-white p-6">
          {isDetailLoading ? (
            <div className="flex items-center justify-center h-full text-gray-500">Đang tải dữ liệu...</div>
          ) : detailData ? (
            <div className="space-y-8">
              {/* Header: Customer and Quote Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6 border-b border-[#eaeaea]">
                <div>
                  <h3 className="text-[11px] lg:text-[12px] font-medium uppercase tracking-widest text-gray-400 mb-2">Khách hàng</h3>
                  <strong className="text-[24px] font-medium tracking-tight text-black block mb-2">
                    {detailData.contact?.company?.name || detailData.contact?.name || `${detailData.contact?.firstName || ""} ${detailData.contact?.lastName || ""}`.trim() || detailData.contact?.email || "Khách hàng"}
                  </strong>
                  {detailData.contact?.company?.taxCode && (
                    <p className="text-[14px] text-gray-500 mb-1">MST: {detailData.contact.company.taxCode}</p>
                  )}
                  {detailData.contact?.email && <p className="text-[14px] text-gray-500 mb-1">{detailData.contact.email}</p>}
                  {detailData.contact?.phone && <p className="text-[14px] text-gray-500 mb-1">{detailData.contact.phone}</p>}
                  {(detailData.contact?.address || detailData.contact?.company?.address) && (
                    <p className="text-[14px] text-gray-500 mb-1">{detailData.contact.address || detailData.contact.company.address}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-[11px] lg:text-[12px] font-medium uppercase tracking-widest text-gray-400 mb-3">Thông tin Báo giá</h3>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400 block mb-1">Số chứng từ</span>
                      <strong className="text-[14px] font-medium text-black">{detailData.number}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400 block mb-1">Người tạo</span>
                      <span className="text-[14px] text-gray-600">{detailData.creator?.name || detailData.creator?.email || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400 block mb-1">Ngày lập</span>
                      <span className="text-[14px] text-gray-600">{detailData.createdAt ? formatDate(new Date(detailData.createdAt)) : "—"}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400 block mb-1">Hiệu lực đến</span>
                      <span className="text-[14px] text-gray-600">{detailData.validUntil ? formatDate(new Date(detailData.validUntil)) : "—"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-[11px] lg:text-[12px] font-medium uppercase tracking-widest text-gray-400 mb-4">Sản phẩm & Dịch vụ</h3>
                <div className="border border-[#eaeaea] rounded-xl overflow-hidden">
                  <table className="w-full text-[14px] text-left">
                    <thead className="bg-gray-50/50 border-b border-[#eaeaea] text-gray-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Nội dung</th>
                        <th className="px-4 py-3 font-medium text-right">SL</th>
                        <th className="px-4 py-3 font-medium text-right">Đơn giá</th>
                        <th className="px-4 py-3 font-medium text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eaeaea]">
                      {detailData.items?.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-black">{item.title || item.product?.name || "Dịch vụ"}</p>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(Number(item.unitPrice))}</td>
                          <td className="px-4 py-3 text-right font-medium text-black">{formatCurrency(Number(item.total))}</td>
                        </tr>
                      ))}
                      {!detailData.items?.length && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-500">Chưa có hạng mục nào</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <div className="bg-gray-50/50 px-4 py-4 border-t border-[#eaeaea] flex justify-between items-center">
                    <span className="text-[12px] uppercase tracking-widest font-medium text-gray-500">Tổng cộng</span>
                    <strong className="text-[20px] tracking-tight font-medium text-black">{formatCurrency(Number(detailData.total))}</strong>
                  </div>
                </div>
              </div>

              {/* Notes & Terms */}
              {(detailData.notes || detailData.terms) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 pb-2">
                  {detailData.notes && (
                    <div>
                      <h3 className="text-[11px] lg:text-[12px] font-medium uppercase tracking-widest text-gray-400 mb-2">Ghi chú</h3>
                      <div className="text-[14px] text-gray-600 whitespace-pre-wrap leading-relaxed">{detailData.notes}</div>
                    </div>
                  )}
                  {detailData.terms && (
                    <div>
                      <h3 className="text-[11px] lg:text-[12px] font-medium uppercase tracking-widest text-gray-400 mb-2">Điều khoản</h3>
                      <div className="text-[14px] text-gray-600 whitespace-pre-wrap leading-relaxed">{typeof detailData.terms === 'string' ? detailData.terms : "Xem chi tiết trong báo giá"}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <Link 
                  href={`/workspace/finance/quotations/${detailData.id}`} 
                  className="flex-1 flex justify-center items-center h-11 bg-black text-white rounded-full text-[14px] font-medium hover:bg-gray-800 transition-colors"
                >
                  Xem chi tiết đầy đủ
                </Link>
                <Link 
                  href={`/workspace/finance/quotations/${detailData.id}/edit`} 
                  className="flex-1 flex justify-center items-center h-11 bg-white border border-[#eaeaea] text-black rounded-full text-[14px] font-medium hover:bg-gray-50 transition-colors"
                >
                  Chỉnh sửa báo giá
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">Không tìm thấy báo giá</div>
          )}
        </div>
      </div>
    </div>
  );
}
