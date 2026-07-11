"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Filter, Trash2, X, Loader2, Map, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createTour, deleteTour } from "./actions";
import { Tour } from "@prisma/client";
import { useRouter } from "next/navigation";

export default function ToursClient({ initialTours }: { initialTours: Tour[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filteredTours = initialTours.filter(tour => 
    tour.name.toLowerCase().includes(query.toLowerCase())
  );

  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa tour này?")) return;
    const res = await deleteTour(id);
    if (!res.success) {
      alert(res.error);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await createTour(formData);
      if (res.success) {
        setIsModalOpen(false);
      } else {
        alert(res.error);
      }
    });
  }

  return (
    <div className="quote-page mx-auto max-w-[1440px] px-6 py-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
            <Map className="h-4 w-4 text-orange-500" />
            Đại lý / Tour Du Lịch
          </div>
          <h1 className="text-[15px] font-medium text-slate-950">Danh sách Sản phẩm</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="quote-action-button quote-action-primary"
          >
            <Plus className="w-4 h-4 mr-1" />
            Thêm Tour Mới
          </button>
        </div>
      </div>

      <div className="quote-panel">
        <div className="quote-panel-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2>Tất cả Tour</h2>
            <span>Quản lý thông tin và cài đặt giá cho các tour của bạn</span>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm tên Tour..."
              className="quote-input pl-9 w-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-[12px] font-semibold text-slate-600">Tên Tour</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-slate-600">Thời lượng</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-slate-600">Địa điểm</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-slate-600">Trạng thái</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-slate-600 text-right">Quản lý Giá & Tình trạng</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-slate-600 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTours.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[13px] text-slate-400">
                    Chưa có tour nào. Bấm "Thêm Tour Mới" để bắt đầu.
                  </td>
                </tr>
              ) : null}
              {filteredTours.map((tour) => (
                <tr 
                  key={tour.id} 
                  className="group hover:bg-orange-50/30 transition-colors"
                >
                  <td className="px-4 py-3" onClick={() => router.push(`/agent/tours/${tour.id}/overview`)}>
                    <div className="text-[13px] font-medium text-slate-900 cursor-pointer hover:text-orange-600 transition-colors">
                      {tour.name}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[13px] text-slate-600">{tour.durationDays} ngày</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[13px] text-slate-600">{tour.destinations[0] || "Chưa cập nhật"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                      tour.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-600 border-slate-200"
                    )}>
                      {tour.isActive ? "Hoạt động" : "Đã tắt"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => router.push(`/agent/tours/${tour.id}/schedule`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-orange-100 text-orange-700 hover:bg-orange-200 text-[12px] font-medium transition-colors"
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                      Cập nhật Giá
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(tour.id); }}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-50 opacity-0 group-hover:opacity-100"
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

      {/* ── Modal Thêm Tour ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="quote-panel w-full max-w-md !p-0 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="quote-panel-header flex items-center justify-between !border-b border-slate-200">
              <div>
                <h2>Thêm Tour Mới</h2>
                <span>Khởi tạo thông tin cơ bản cho sản phẩm tour</span>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors bg-slate-100 hover:bg-slate-200 p-1.5 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-5">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Tên Tour <span className="text-red-500">*</span></label>
                <input 
                  required
                  type="text" 
                  name="name"
                  placeholder="VD: Khám phá Vịnh Hạ Long 3N2Đ"
                  className="quote-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700">Thời lượng (Ngày) <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="number" 
                    name="durationDays"
                    min="1"
                    defaultValue="1"
                    className="quote-input w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700">Địa điểm chính <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="text" 
                    name="dest"
                    placeholder="VD: Hạ Long"
                    className="quote-input w-full"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Giá cơ bản (VNĐ) <span className="text-red-500">*</span></label>
                <input 
                  required
                  type="number" 
                  name="basePrice"
                  min="0"
                  placeholder="VD: 2500000"
                  className="quote-input w-full"
                />
                <p className="text-[11px] text-slate-500">Đây là giá gốc, bạn có thể chỉnh sửa giá theo từng ngày sau khi tạo.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Trạng thái</label>
                <select 
                  name="status"
                  className="quote-input w-full bg-white"
                >
                  <option value="ACTIVE">Hoạt động (Mở bán)</option>
                  <option value="INACTIVE">Tạm dừng (Lưu nháp)</option>
                </select>
              </div>

              <div className="pt-5 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="quote-action-button bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isPending}
                  className="quote-action-button quote-action-primary"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Tạo Tour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
