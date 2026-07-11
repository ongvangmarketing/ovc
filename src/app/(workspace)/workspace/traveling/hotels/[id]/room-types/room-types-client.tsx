"use client";

import { useState } from "react";
import { Plus, Users, LayoutGrid, Trash2, Edit, Bed, ArrowRight } from "lucide-react";
import { deleteRoomType } from "../actions";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export default function RoomTypesClient({ hotelId, initialRoomTypes }: { hotelId: string; initialRoomTypes: any[] }) {
  const [types, setTypes] = useState(initialRoomTypes);

  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa hạng phòng này không?")) return;
    const res = await deleteRoomType(id, hotelId);
    if (res.success) {
      setTypes(types.filter(t => t.id !== id));
    } else {
      alert(res.error || "Có lỗi xảy ra");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-[20px] font-medium tracking-tight text-black mb-1">Loại phòng & Giá</h2>
          <p className="text-[14px] text-gray-500">Quản lý các hạng phòng, thiết lập sức chứa và giá cơ bản.</p>
        </div>
        <Link
          href={`/workspace/traveling/hotels/${hotelId}/room-types/new`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-black px-6 text-[13px] font-medium text-white hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm Hạng phòng mới
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {types.map(t => (
          <div key={t.id} className="group rounded-3xl border border-[#eaeaea] bg-white p-6 hover:border-gray-300 transition-colors flex flex-col justify-between h-[280px]">
            <div>
              <div className="flex justify-between items-start mb-5">
                <div className="w-12 h-12 rounded-full border border-[#eaeaea] bg-gray-50 flex items-center justify-center">
                  <Bed className="w-5 h-5 text-black" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link 
                    href={`/workspace/traveling/hotels/${hotelId}/room-types/${t.id}`}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-[#eaeaea] text-gray-400 hover:text-black hover:border-black transition-all"
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Link>
                  <button 
                    onClick={() => handleDelete(t.id)} 
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-[#eaeaea] text-gray-400 hover:text-red-600 hover:border-red-600 transition-all" 
                    title="Xóa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-[18px] font-medium text-black mb-2 tracking-tight line-clamp-1">{t.name}</h3>
              
              <div className="flex items-center gap-3 text-[13px] text-gray-500 mb-6 font-medium">
                <span className="text-black text-[16px] tracking-tight">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.basePrice)}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>/ đêm</span>
              </div>
              
              <p className="text-[14px] text-gray-500 line-clamp-2 leading-relaxed">{t.description || "Chưa có mô tả chi tiết."}</p>
            </div>
            
            <div className="mt-auto pt-4 border-t border-[#eaeaea] flex items-center justify-between">
              <div className="flex items-center gap-4 text-[13px] font-medium text-gray-500">
                <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-gray-400" /> {t.capacity} Ng.</div>
                {t.roomSize && <div className="flex items-center gap-1.5"><LayoutGrid className="w-4 h-4 text-gray-400" /> {t.roomSize} m²</div>}
              </div>
              <Link 
                href={`/workspace/traveling/hotels/${hotelId}/room-types/${t.id}`}
                className="text-[13px] text-gray-400 flex items-center gap-1 group-hover:text-black transition-colors"
              >
                Chi tiết <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}

        {types.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border border-[#eaeaea] border-dashed rounded-3xl bg-gray-50/50">
            <div className="w-16 h-16 rounded-full border border-[#eaeaea] bg-white flex items-center justify-center mb-4">
              <Bed className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-[16px] font-medium text-black mb-1">Chưa có hạng phòng</h3>
            <p className="text-[14px] text-gray-500 mb-6">Hãy thêm hạng phòng đầu tiên cho khách sạn này.</p>
            <Link
              href={`/workspace/traveling/hotels/${hotelId}/room-types/new`}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-white border border-[#eaeaea] px-6 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Thêm phòng ngay
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
