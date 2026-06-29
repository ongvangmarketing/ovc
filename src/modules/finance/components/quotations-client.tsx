"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, Download, Eye, Edit, MoreHorizontal, Trash2 } from "lucide-react";
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
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  VIEWED: "bg-purple-100 text-purple-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  CONVERTED: "bg-indigo-100 text-indigo-700",
  EXPIRED: "bg-orange-100 text-orange-700",
};
import { ViewSwitcher } from "@/components/ui/view-switcher";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuotations } from "@/app/actions/finance";
import { deleteQuotation } from "@/app/actions/finance-crud";

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

export function QuotationsClient() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [view, setView] = useState("table");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: quotations = [] } = useQuery({
    queryKey: ["quotations"],
    queryFn: () => getQuotations(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteQuotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      setDeletingId(null);
    }
  });

  const filtered = quotations.filter((inv: any) => {
    const customer = getCustomerName(inv.contact);
    const matchSearch = `${inv.number} ${inv.title} ${customer}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = selectedStatus === "all" || inv.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const summaryStats = [
    { label: "Tổng báo giá", value: quotations.reduce((s: any, i: any) => s + Number(i.total), 0), color: "text-foreground" },
    { label: "Đã gửi", value: quotations.filter((i: any) => i.status === "SENT").reduce((s: any, i: any) => s + Number(i.total), 0), color: "text-blue-600" },
    { label: "Chấp nhận", value: quotations.filter((i: any) => i.status === "ACCEPTED").reduce((s: any, i: any) => s + Number(i.total), 0), color: "text-emerald-600" },
    { label: "Đã chuyển đổi", value: quotations.filter((i: any) => i.status === "CONVERTED").reduce((s: any, i: any) => s + Number(i.total), 0), color: "text-purple-600" },
  ];



  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Báo giá</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} báo giá</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> Xuất
          </button>
          <Link href="/workspace/finance/quotations/create" className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Tạo Báo giá
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="card-base p-4">
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className={cn("text-lg font-bold tabular-nums", stat.color)}>
              {formatCurrency(stat.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-64 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm hóa đơn..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1">
          {["all", "DRAFT", "SENT", "PARTIAL", "PAID", "OVERDUE"].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                selectedStatus === s
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {s === "all" ? "Tất cả" : QUOTATION_STATUS_LABELS[s as any] || s}
            </button>
          ))}
        </div>

        <div className="ml-auto">
          <ViewSwitcher value={view} onChange={setView} options={["table", "card"]} />
        </div>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto scrollable-x">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Số Báo giá</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Khách hàng</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Trạng thái</th>
                <th className="text-left font-medium text-muted-foreground py-3 px-4 w-32">Tổng tiền</th>
                <th className="text-left font-medium text-muted-foreground py-3 px-4 w-32">Ngày tạo</th>
                <th className="py-3 px-4 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => {
                const statusColor = QUOTATION_STATUS_COLORS[inv.status] || QUOTATION_STATUS_COLORS["DRAFT"];
                const statusLabel = QUOTATION_STATUS_LABELS[inv.status] || inv.status;

                return (
                  <tr key={inv.id} className="border-b border-border last:border-0 table-row-hover">
                    <td className="py-3 px-4">
                      <Link href={`/workspace/finance/quotations/${inv.id}`} className="text-sm font-semibold text-blue-600 hover:underline">
                        {inv.number}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{getCustomerName(inv.contact)}</td>
                    <td className="py-3 px-4">
                      <span
                        className="badge-status text-xs font-medium"
                        style={{
                          backgroundColor: statusColor + "20",
                          color: statusColor,
                        }}
                      >
                        {statusLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">{formatCurrency(Number(inv.total))}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      <span className={""}>
                        {inv.createdAt ? formatDate(new Date(inv.createdAt)) : "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={`/workspace/finance/quotations/${inv.id}`} className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-all" title="Xem chi tiết">
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link href={`/workspace/finance/quotations/${inv.id}/edit`} className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-all" title="Chỉnh sửa">
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button 
                          className="w-7 h-7 flex items-center justify-center rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          onClick={() => setDeletingId(inv.id)}
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                          <MoreHorizontal className="w-3.5 h-3.5" />
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
    </div>
  );
}
