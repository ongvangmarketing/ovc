"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Filter, Trash2, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createTicket, deleteTicket } from "./actions";
import { TicketEvent } from "@prisma/client";
import { format } from "date-fns";

export default function TicketsClient({ initialTickets }: { initialTickets: TicketEvent[] }) {
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filteredTickets = initialTickets.filter(ticket => 
    ticket.name.toLowerCase().includes(query.toLowerCase()) || 
    ticket.type.toLowerCase().includes(query.toLowerCase())
  );

  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa vé này?")) return;
    const res = await deleteTicket(id);
    if (!res.success) {
      alert(res.error);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await createTicket(formData);
      if (res.success) {
        setIsModalOpen(false);
      } else {
        alert(res.error);
      }
    });
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-[#fafafa]">
      {/* ── Header ── */}
      <div className="sticky top-0 z-10 shrink-0 border-b border-[#eaeaea] bg-white px-8 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-[40px] font-medium tracking-tighter leading-none text-black">Quản lý Vé</h1>
            <p className="mt-3 text-[15px] text-gray-500 leading-relaxed">
              Cung cấp vé máy bay, tàu hỏa, và các sự kiện du lịch.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex h-10 items-center justify-center gap-2 rounded-full bg-black px-6 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Thêm Vé
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Workspace ── */}
      <div className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-full rounded-2xl border border-[#eaeaea] bg-white">
          
          {/* Toolbar */}
          <div className="flex flex-col justify-between gap-4 border-b border-[#eaeaea] p-4 sm:flex-row sm:items-center">
            <div className="flex gap-2">
              <button className="flex h-9 items-center gap-2 rounded-full border border-[#eaeaea] bg-white px-4 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                Lọc
              </button>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Tìm tên vé..."
                className="flex h-9 w-full rounded-full border border-[#eaeaea] bg-white pl-9 pr-4 text-[13px] placeholder:text-gray-400 focus:border-black focus:outline-none transition-colors"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* List Area */}
          <div className="min-h-[400px]">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-[#eaeaea]">
                <tr>
                  <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400">Tên vé / Sự kiện</th>
                  <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400">Loại vé</th>
                  <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400">Ngày / Giờ</th>
                  <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400">Giá vé</th>
                  <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400 text-right">Trạng thái</th>
                  <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaeaea]">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-[14px] text-gray-400">
                      Không tìm thấy vé nào.
                    </td>
                  </tr>
                ) : null}
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="group hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-5 py-4">
                      <div className="text-[14px] font-medium text-black">{ticket.name}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-[13px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded w-fit">{ticket.type}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-[13px] text-gray-600">{ticket.eventDate ? format(new Date(ticket.eventDate), 'dd/MM/yyyy HH:mm') : "Chưa đặt lịch"}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-[13px] font-medium text-black">{ticket.basePrice.toLocaleString()} ₫</div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-medium uppercase tracking-widest",
                        ticket.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-gray-50 text-gray-700 border-gray-200"
                      )}>
                        {ticket.isActive ? "ĐANG BÁN" : "NGỪNG BÁN"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(ticket.id); }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
        </div>
      </div>

      {/* ── Modal Thêm Vé ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#eaeaea] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-[#eaeaea]">
              <h2 className="text-[18px] font-medium text-black">Thêm Vé mới</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-5">
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-black">Tên Vé / Sự kiện</label>
                <input 
                  required
                  type="text" 
                  name="name"
                  placeholder="VD: Vé Vietjet Air Đà Lạt - HN"
                  className="flex h-10 w-full rounded-md border border-[#eaeaea] bg-white px-3 py-2 text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-black">Loại vé</label>
                  <select 
                    name="type"
                    className="flex h-10 w-full rounded-md border border-[#eaeaea] bg-white px-3 py-2 text-[14px] focus:border-black focus:outline-none transition-colors"
                  >
                    <option value="FLIGHT">Máy bay</option>
                    <option value="TRAIN">Tàu hỏa</option>
                    <option value="BUS">Xe khách</option>
                    <option value="EVENT">Sự kiện</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-black">Ngày / Giờ</label>
                  <input 
                    required
                    type="datetime-local" 
                    name="date"
                    className="flex h-10 w-full rounded-md border border-[#eaeaea] bg-white px-3 py-2 text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-black">Giá vé (VNĐ)</label>
                  <input 
                    required
                    type="number" 
                    name="basePrice"
                    min="0"
                    placeholder="VD: 1200000"
                    className="flex h-10 w-full rounded-md border border-[#eaeaea] bg-white px-3 py-2 text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-black">Trạng thái</label>
                  <select 
                    name="status"
                    className="flex h-10 w-full rounded-md border border-[#eaeaea] bg-white px-3 py-2 text-[14px] focus:border-black focus:outline-none transition-colors"
                  >
                    <option value="ACTIVE">Đang bán</option>
                    <option value="INACTIVE">Ngừng bán</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 rounded-full px-6 text-[14px] font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isPending}
                  className="flex h-10 items-center justify-center rounded-full bg-black px-6 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lưu Vé"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
