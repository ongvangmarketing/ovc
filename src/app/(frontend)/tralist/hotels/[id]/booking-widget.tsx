"use client";

import { CalendarDays, MapPin } from "lucide-react";

export default function BookingWidget({ hotel }: { hotel: any }) {
  const lowestPrice = hotel.roomTypes?.[0]?.basePrice || 0;

  return (
    <div className="bg-white rounded-2xl border border-[#eaeaea] p-6 shadow-xl shadow-gray-200/50">
      <div className="mb-6">
        <div className="text-[24px] font-bold text-black flex items-end gap-1">
          {lowestPrice > 0 ? (
            <>
              {new Intl.NumberFormat('vi-VN').format(lowestPrice)}₫
              <span className="text-[14px] font-normal text-gray-500 mb-1">/ đêm</span>
            </>
          ) : (
            <span className="text-[18px]">Đang cập nhật giá</span>
          )}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="border border-[#eaeaea] rounded-xl overflow-hidden">
          <div className="flex">
            <div className="flex-1 p-3 border-r border-[#eaeaea] cursor-pointer hover:bg-gray-50">
              <div className="text-[10px] font-bold uppercase text-gray-500 mb-1">Nhận phòng</div>
              <div className="text-[14px] font-medium">Chọn ngày</div>
            </div>
            <div className="flex-1 p-3 cursor-pointer hover:bg-gray-50">
              <div className="text-[10px] font-bold uppercase text-gray-500 mb-1">Trả phòng</div>
              <div className="text-[14px] font-medium">Chọn ngày</div>
            </div>
          </div>
          <div className="p-3 border-t border-[#eaeaea] cursor-pointer hover:bg-gray-50">
            <div className="text-[10px] font-bold uppercase text-gray-500 mb-1">Khách</div>
            <div className="text-[14px] font-medium">2 khách, 1 phòng</div>
          </div>
        </div>
      </div>

      <button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center transition-colors mb-4">
        Kiểm tra phòng trống
      </button>

      <div className="text-center text-[12px] text-gray-500">
        Bạn vẫn chưa bị trừ tiền
      </div>
    </div>
  );
}
