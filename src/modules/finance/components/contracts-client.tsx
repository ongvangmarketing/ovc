"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, Download, Eye, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { ConfirmModal } from "@/components/ui/confirm-modal";
const CONTRACT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Bản nháp",
  SENT: "Đã gửi",
  VIEWED: "Đã xem",
  SIGNED: "Đã ký",
  CANCELLED: "Đã hủy",
  CONVERTED: "Đã chuyển đổi",
};
const CONTRACT_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-white border border-[#eaeaea] text-gray-500",
  SENT: "bg-white border border-[#eaeaea] text-black",
  VIEWED: "bg-white border border-[#eaeaea] text-black",
  SIGNED: "bg-gray-100 text-black",
  CANCELLED: "bg-white border border-[#eaeaea] text-gray-400",
  CONVERTED: "bg-gray-50 border border-[#eaeaea] text-black",
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContracts } from "@/app/actions/finance";
import { deleteContract } from "@/app/actions/finance-crud";

type FinanceContact = {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: { name?: string | null } | null;
};

type ContractRow = {
  id: string;
  number: string;
  title?: string | null;
  status: string;
  total: number | string;
  createdAt?: string | Date | null;
  contact?: FinanceContact | null;
};

function getCustomerName(contact?: FinanceContact | null) {
  if (!contact) return "Không gắn khách hàng";
  const fullName = contact.name || `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
  return contact.company?.name || fullName || contact.email || contact.phone || "Không gắn khách hàng";
}

export function ContractsClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [view, setView] = useState("table");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: contracts = [] } = useQuery({
    queryKey: ["contracts"],
    queryFn: () => getContracts(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteContract(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      setDeletingId(null);
    }
  });

  const contractRows = contracts as unknown as ContractRow[];

  const filtered = contractRows.filter((inv) => {
    const customer = getCustomerName(inv.contact);
    const matchSearch = `${inv.number} ${inv.title} ${customer}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = selectedStatus === "all" || inv.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const summaryStats = [
    { label: "Tổng hợp đồng", value: contractRows.reduce((s, i) => s + Number(i.total), 0) },
    { label: "Đã gửi", value: contractRows.filter((i) => i.status === "SENT").reduce((s, i) => s + Number(i.total), 0) },
    { label: "Đã ký", value: contractRows.filter((i) => i.status === "SIGNED").reduce((s, i) => s + Number(i.total), 0) },
    { label: "Đã chuyển đổi", value: contractRows.filter((i) => i.status === "CONVERTED").reduce((s, i) => s + Number(i.total), 0) },
  ];



  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-10 lg:px-12 bg-white min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[36px] font-medium tracking-tighter text-black leading-none mb-3">Hợp đồng</h1>
          <p className="text-[14px] text-gray-500">{filtered.length} hợp đồng</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-9 px-4 rounded-lg border border-[#eaeaea] text-[14px] font-medium text-black hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> Xuất
          </button>
          <Link href="/workspace/finance/contracts/create" className="h-9 px-4 rounded-lg bg-black text-white text-[14px] font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2 shadow-none">
            <Plus className="w-4 h-4" /> Tạo Hợp đồng
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

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm hợp đồng..."
            className="w-full h-10 pl-10 pr-3 rounded-lg border border-[#eaeaea] bg-white text-[14px] text-black focus:outline-none focus:border-black transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {["all", "DRAFT", "SENT", "SIGNED", "CONVERTED", "CANCELLED"].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors border",
                selectedStatus === s
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-500 border-[#eaeaea] hover:border-gray-400"
              )}
            >
              {s === "all" ? "Tất cả" : (CONTRACT_STATUS_LABELS[s] || s)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#eaeaea] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px] [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
            <thead className="bg-gray-50/50 border-b border-[#eaeaea]">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px] w-[180px]">Số Hợp đồng</th>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px] w-[330px]">Khách hàng</th>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px] w-[160px]">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px] w-[160px] text-right">Tổng tiền</th>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px] w-[160px]">Ngày tạo</th>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px] w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {filtered.map((inv) => {
                const statusColor = CONTRACT_STATUS_COLORS[inv.status] || CONTRACT_STATUS_COLORS["DRAFT"];
                const statusLabel = CONTRACT_STATUS_LABELS[inv.status] || inv.status;


                return (
                  <tr key={inv.id} onClick={() => router.push(`/workspace/finance/contracts/${inv.id}`)} className="cursor-pointer hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/workspace/finance/contracts/${inv.id}`} className="font-medium text-black hover:underline">
                        {inv.number}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="block truncate font-medium text-black">{getCustomerName(inv.contact)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex items-center px-2 py-1 rounded-[6px] font-medium text-[11px] uppercase tracking-wide", statusColor)}>{statusLabel}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium text-black">{formatCurrency(Number(inv.total))}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500 text-[14px]">{inv.createdAt ? formatDate(new Date(inv.createdAt)) : "N/A"}</span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={`/workspace/finance/contracts/${inv.id}`} className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-black hover:bg-gray-100 transition-all" title="Xem chi tiết">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/workspace/finance/contracts/${inv.id}/edit`} className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-black hover:bg-gray-100 transition-all" title="Chỉnh sửa">
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
        title="Xác nhận xóa Hợp đồng"
        message="Bạn có chắc chắn muốn xóa hợp đồng này không? Dữ liệu đã xóa không thể khôi phục."
        confirmText="Xóa Hợp đồng"
        isDestructive={true}
      />
    </div>
  );
}
