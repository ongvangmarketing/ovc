"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Filter, Trash2, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createVehicle, deleteVehicle } from "./actions";
import { Vehicle } from "@prisma/client";

export default function VehiclesClient({ initialVehicles }: { initialVehicles: Vehicle[] }) {
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filteredVehicles = initialVehicles.filter(vehicle => 
    vehicle.name.toLowerCase().includes(query.toLowerCase()) || 
    (vehicle.licensePlate && vehicle.licensePlate.toLowerCase().includes(query.toLowerCase()))
  );

  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa phương tiện này?")) return;
    const res = await deleteVehicle(id);
    if (!res.success) {
      alert(res.error);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await createVehicle(formData);
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
            <h1 className="text-[40px] font-medium tracking-tighter leading-none text-black">Quản lý Xe</h1>
            <p className="mt-3 text-[15px] text-gray-500 leading-relaxed">
              Quản lý danh sách phương tiện, bảng giá và lịch trình cho thuê.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex h-10 items-center justify-center gap-2 rounded-full bg-black px-6 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Thêm Xe
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
                placeholder="Tìm tên xe, biển số..."
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
                  <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400">Tên xe</th>
                  <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400">Loại xe</th>
                  <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400">Số ghế</th>
                  <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400">Biển số</th>
                  <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400">Giá / Ngày</th>
                  <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400 text-right">Trạng thái</th>
                  <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaeaea]">
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-[14px] text-gray-400">
                      Không tìm thấy phương tiện nào.
                    </td>
                  </tr>
                ) : null}
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="group hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-5 py-4">
                      <div className="text-[14px] font-medium text-black">{vehicle.name}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-[13px] text-gray-600">{vehicle.type}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-[13px] text-gray-600">{vehicle.seats}</div>
                    </td>
                    <td className="px-5 py-4">
                      {vehicle.licensePlate ? (
                        <div className="text-[13px] font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded w-fit">{vehicle.licensePlate}</div>
                      ) : (
                        <div className="text-[13px] text-gray-400 italic">Chưa cập nhật</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-[13px] font-medium text-black">{vehicle.pricePerDay.toLocaleString()} ₫</div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-medium uppercase tracking-widest",
                        vehicle.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-gray-50 text-gray-700 border-gray-200"
                      )}>
                        {vehicle.isActive ? "SẴN SÀNG" : "BẢO TRÌ"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(vehicle.id); }}
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

      {/* ── Modal Thêm Xe ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#eaeaea] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-[#eaeaea]">
              <h2 className="text-[18px] font-medium text-black">Thêm Phương tiện mới</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-5">
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-black">Tên / Dòng xe</label>
                <input 
                  required
                  type="text" 
                  name="name"
                  placeholder="VD: Toyota Vios 2023"
                  className="flex h-10 w-full rounded-md border border-[#eaeaea] bg-white px-3 py-2 text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-black">Loại xe</label>
                  <select 
                    name="type"
                    className="flex h-10 w-full rounded-md border border-[#eaeaea] bg-white px-3 py-2 text-[14px] focus:border-black focus:outline-none transition-colors"
                  >
                    <option value="CAR">Ô tô</option>
                    <option value="MOTORBIKE">Xe máy</option>
                    <option value="VAN">Xe khách / Van</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-black">Số chỗ ngồi</label>
                  <input 
                    required
                    type="number" 
                    name="seats"
                    min="1"
                    defaultValue="4"
                    className="flex h-10 w-full rounded-md border border-[#eaeaea] bg-white px-3 py-2 text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-black">Biển số (Tùy chọn)</label>
                  <input 
                    type="text" 
                    name="plate"
                    placeholder="VD: 49A-123.45"
                    className="flex h-10 w-full rounded-md border border-[#eaeaea] bg-white px-3 py-2 text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-black">Trạng thái</label>
                  <select 
                    name="status"
                    className="flex h-10 w-full rounded-md border border-[#eaeaea] bg-white px-3 py-2 text-[14px] focus:border-black focus:outline-none transition-colors"
                  >
                    <option value="ACTIVE">Sẵn sàng</option>
                    <option value="INACTIVE">Bảo trì</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-medium text-black">Giá thuê / Ngày (VNĐ)</label>
                <input 
                  required
                  type="number" 
                  name="pricePerDay"
                  min="0"
                  placeholder="VD: 800000"
                  className="flex h-10 w-full rounded-md border border-[#eaeaea] bg-white px-3 py-2 text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none transition-colors"
                />
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
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lưu Phương tiện"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
