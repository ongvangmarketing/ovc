"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Download, Eye, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from "@/lib/constants";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInvoices } from "@/app/actions/finance";
import { deleteInvoice } from "@/app/actions/finance-crud";

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

export function InvoicesClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => getInvoices(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setDeletingId(null);
    }
  });

  const summaryStats = [
    { label: "Tổng hóa đơn", value: invoices.reduce((s, i) => s + Number(i.total), 0), color: "text-foreground" },
    { label: "Chưa thanh toán", value: invoices.filter((i) => ["SENT", "VIEWED", "PARTIAL"].includes(i.status)).reduce((s, i) => s + Number(i.amountDue), 0), color: "text-blue-600" },
    { label: "Quá hạn", value: invoices.filter((i) => i.status === "OVERDUE").reduce((s, i) => s + Number(i.amountDue), 0), color: "text-red-500" },
    { label: "Đã thanh toán", value: invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + Number(i.total), 0), color: "text-emerald-600" },
  ];



  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Hóa đơn</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{invoices.length} hóa đơn</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-background text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
            <Download className="w-4 h-4" />
            Xuất
          </button>
          <Link href="/workspace/finance/invoices/create" className="flex items-center gap-2 h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
            <Plus className="w-4 h-4" />
            Tạo hóa đơn
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

      {/* Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto scrollable-x">
          <table className="w-full min-w-[680px] text-sm [&_td]:!px-3 [&_td]:!py-2.5 [&_th]:!px-3 [&_th]:!py-2.5">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Số HĐ</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Khách hàng</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Trạng thái</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Tổng tiền</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Còn lại</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Hạn TT</th>
                <th className="py-3 px-4 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const statusColor = INVOICE_STATUS_COLORS[inv.status];
                const statusLabel = INVOICE_STATUS_LABELS[inv.status];
                const isOverdue = inv.status === "OVERDUE";

                return (
                  <tr key={inv.id} onClick={() => router.push(`/workspace/finance/invoices/${inv.id}`)} className="cursor-pointer border-b border-border last:border-0 table-row-hover">
                    <td className="whitespace-nowrap py-3 px-4">
                      <Link href={`/workspace/finance/invoices/${inv.id}`} className="whitespace-nowrap text-sm font-semibold text-blue-600 hover:underline">
                        {inv.number}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap py-3 px-4 text-sm text-muted-foreground">{getCustomerName(inv.contact)}</td>
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
                    <td className="py-3 px-4 text-right font-semibold tabular-nums text-sm">
                      {formatCurrency(Number(inv.total))}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-sm">
                      <span className={Number(inv.amountDue) > 0 ? (isOverdue ? "text-red-500 font-semibold" : "text-foreground") : "text-emerald-600"}>
                        {Number(inv.amountDue) > 0 ? formatCurrency(Number(inv.amountDue)) : "Đã TT"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      <span className={isOverdue ? "text-red-500 font-medium" : ""}>
                        {inv.dueDate ? formatDate(new Date(inv.dueDate)) : "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={`/workspace/finance/invoices/${inv.id}`} className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-all" title="Xem chi tiết">
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link href={`/workspace/finance/invoices/${inv.id}/edit`} className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-all" title="Chỉnh sửa">
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
        title="Xác nhận xóa Hóa đơn"
        message="Bạn có chắc chắn muốn xóa hóa đơn này không? Dữ liệu đã xóa không thể khôi phục."
        confirmText="Xóa Hóa đơn"
        isDestructive={true}
      />
    </div>
  );
}
