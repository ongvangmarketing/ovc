"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, Download, Eye, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { CompactPagination } from "@/components/ui/compact-pagination";
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
import {  getContracts  } from "@/modules/finance/actions/finance.actions";
import {  deleteContract  } from "@/modules/finance/actions/finance.actions";

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

const PAGE_SIZE = 20;

export function ContractsClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: contracts = [], isFetching } = useQuery({
    queryKey: ["contracts"],
    queryFn: () => getContracts(),
  });
  
  const isInitialFetching = isFetching && contracts.length === 0;

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
    const matchStatus = selectedStatus === "ALL" || inv.status === selectedStatus;
    return matchSearch && matchStatus;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedContracts = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const summaryStats = [
    { label: "Tổng hợp đồng", value: contractRows.length, isCurrency: false },
    { label: "Tổng giá trị", value: contractRows.reduce((s, i) => s + Number(i.total), 0), isCurrency: true },
    { label: "Đã ký", value: contractRows.filter((i) => i.status === "SIGNED").length, isCurrency: false },
    { label: "Đã chuyển đổi", value: contractRows.filter((i) => i.status === "CONVERTED").length, isCurrency: false },
  ];

  const todayDate = new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-8 sm:py-12">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[#eaeaea] pb-8">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="w-fit rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                Hợp đồng
              </span>
              <span className="text-[13px] font-medium text-gray-500">{todayDate}</span>
            </div>
            <h1 className="mb-3 text-[32px] font-medium leading-[1.15] tracking-tight text-black md:text-[40px]">
              Quản lý <span className="text-gray-400">hợp đồng.</span>
            </h1>
            <p className="max-w-xl text-[15px] text-gray-500 mt-4">
              {isInitialFetching ? "Đang tải dữ liệu..." : `Hiện có ${contracts.length} hợp đồng trên hệ thống.`}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-3 md:mt-0">
            <button className="inline-flex h-10 items-center justify-center rounded-full border border-[#eaeaea] bg-white px-5 text-[13px] font-medium text-black transition-colors hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" /> Xuất
            </button>
            <Link href="/workspace/finance/contracts/create" className="inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" /> Tạo mới
            </Link>
          </div>
        </div>

      {/* Summary Cards */}
      <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="min-w-0 rounded-xl border border-[#eaeaea] bg-white p-4 shadow-sm transition-colors duration-200 hover:border-black sm:p-6">
            <p className="mb-4 text-[13px] font-medium leading-snug text-gray-500 sm:text-[11px] sm:font-semibold sm:uppercase sm:tracking-widest">{stat.label}</p>
            <p className="truncate text-[22px] font-medium tracking-tight text-black sm:text-[28px]">
              {stat.isCurrency ? formatCurrency(stat.value) : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mb-8 flex flex-col justify-between rounded-2xl border border-[#eaeaea] bg-white px-2 py-1.5 shadow-sm md:flex-row md:items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm số hợp đồng, tiêu đề, khách hàng..."
            className="w-full bg-transparent pl-11 pr-4 py-2 text-[14px] text-black outline-none placeholder:text-gray-400"
          />
        </div>
        <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto border-t border-[#eaeaea] px-3 py-1.5 md:flex-wrap md:overflow-visible md:border-l md:border-t-0">
          <span className="text-[13px] text-gray-500 font-medium mr-2">Trạng thái:</span>
          {["ALL", "DRAFT", "SIGNED", "SENT", "CONVERTED"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setSelectedStatus(status);
                setCurrentPage(1);
              }}
              className={cn(
                "shrink-0 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors sm:px-4",
                selectedStatus === status 
                  ? "bg-black text-white border-black" 
                  : "bg-white text-gray-600 border-[#eaeaea] hover:bg-gray-50"
              )}
            >
              {status === "ALL" ? "Tất cả" : CONTRACT_STATUS_LABELS[status] || status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[24px] border border-[#eaeaea] bg-white shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-[14px] [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
            <thead className="bg-[#fafafa] border-b border-[#eaeaea]">
              <tr>
                <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px] w-[180px]">Số Hợp đồng</th>
                <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px] w-[330px]">Khách hàng</th>
                <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px] w-[160px]">Trạng thái</th>
                <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px] w-[160px] text-right">Tổng tiền</th>
                <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px] w-[160px]">Ngày tạo</th>
                <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px] w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {paginatedContracts.map((inv) => {
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
                      <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest", statusColor)}>{statusLabel}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium text-black">{formatCurrency(Number(inv.total))}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500 text-[15px]">{inv.createdAt ? formatDate(new Date(inv.createdAt)) : "N/A"}</span>
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
        <CompactPagination
          currentPage={safePage}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          itemLabel="hợp đồng"
          onPageChange={setCurrentPage}
        />
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
    </div>
  );
}
