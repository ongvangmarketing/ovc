"use client";

import { useState } from "react";
import { CalendarDays, Users, ShieldCheck, HelpCircle } from "lucide-react";

export default function BookingWidget({ tour, inventories }: { tour: any, inventories: any[] }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Group by month
  // Simple dropdown for dates for MVP
  const availableDates = inventories.filter(i => i.allotment - i.bookedCount > 0);
  
  const selectedInventory = availableDates.find(i => new Date(i.date).toISOString() === selectedDate);
  
  const adultPrice = selectedInventory?.adultPrice ?? tour.basePrice;
  const childPrice = selectedInventory?.childPrice ?? tour.baseChildPrice ?? 0;
  
  const total = (adults * adultPrice) + (children * childPrice);

  return (
    <div className="bg-white rounded-3xl border border-[#eaeaea] shadow-xl shadow-black/5 p-6 md:p-8">
      <div className="flex items-end gap-2 mb-6">
        <span className="text-[28px] font-bold tracking-tight text-black leading-none">
          {new Intl.NumberFormat('vi-VN').format(tour.basePrice)}₫
        </span>
        <span className="text-[14px] text-gray-500 mb-1">/ người</span>
      </div>

      <div className="space-y-4 mb-6">
        {/* Date Selector */}
        <div className="rounded-xl border border-[#eaeaea] p-3 hover:border-black transition-colors focus-within:border-black focus-within:ring-1 focus-within:ring-black">
          <label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">Ngày khởi hành</label>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-gray-400" />
            <select 
              className="w-full text-[14px] font-medium text-black outline-none bg-transparent appearance-none"
              value={selectedDate || ""}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              <option value="" disabled>Chọn ngày...</option>
              {availableDates.map(inv => {
                const dateObj = new Date(inv.date);
                const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                return (
                  <option key={inv.id} value={dateObj.toISOString()}>
                    {dateObj.toLocaleDateString('vi-VN')} {isWeekend ? "(Cuối tuần)" : ""} - Còn {inv.allotment - inv.bookedCount} chỗ
                  </option>
                )
              })}
              {availableDates.length === 0 && <option value="" disabled>Đã hết chỗ trống</option>}
            </select>
          </div>
        </div>

        {/* Pax Selector */}
        <div className="flex gap-4">
          <div className="flex-1 rounded-xl border border-[#eaeaea] p-3 hover:border-black transition-colors">
            <label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">Người lớn</label>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <select className="w-full text-[14px] font-medium text-black outline-none bg-transparent appearance-none" value={adults} onChange={e => setAdults(Number(e.target.value))}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="flex-1 rounded-xl border border-[#eaeaea] p-3 hover:border-black transition-colors">
            <label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">Trẻ em</label>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <select className="w-full text-[14px] font-medium text-black outline-none bg-transparent appearance-none" value={children} onChange={e => setChildren(Number(e.target.value))}>
                {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bill */}
      {selectedDate && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-[#eaeaea] space-y-3">
          <div className="flex justify-between items-center text-[14px]">
            <span className="text-gray-600 underline cursor-help" title={`${new Intl.NumberFormat('vi-VN').format(adultPrice)}₫ x ${adults}`}>
              Người lớn x {adults}
            </span>
            <span className="font-medium text-black">{new Intl.NumberFormat('vi-VN').format(adults * adultPrice)}₫</span>
          </div>
          {children > 0 && (
            <div className="flex justify-between items-center text-[14px]">
              <span className="text-gray-600 underline cursor-help" title={`${new Intl.NumberFormat('vi-VN').format(childPrice)}₫ x ${children}`}>
                Trẻ em x {children}
              </span>
              <span className="font-medium text-black">{new Intl.NumberFormat('vi-VN').format(children * childPrice)}₫</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
            <span className="font-bold text-black text-[15px]">Tổng cộng</span>
            <span className="text-[20px] font-bold text-black">{new Intl.NumberFormat('vi-VN').format(total)}₫</span>
          </div>
        </div>
      )}

      <button 
        disabled={!selectedDate || availableDates.length === 0}
        className="w-full h-12 md:h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-[15px] md:text-[16px] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-indigo-600/20"
      >
        {availableDates.length === 0 ? "Hết chỗ" : (selectedDate ? "Tiếp tục đặt" : "Chọn ngày để đặt")}
      </button>

      <div className="mt-6 flex flex-col gap-3">
        <div className="flex justify-center items-center gap-1.5 text-[13px] text-gray-500">
          <ShieldCheck className="w-4 h-4 text-green-600" /> Thanh toán an toàn 100%
        </div>
        <div className="flex justify-center items-center gap-1.5 text-[13px] text-gray-500">
          <HelpCircle className="w-4 h-4 text-gray-400" /> Miễn phí hủy trước 7 ngày
        </div>
      </div>
    </div>
  );
}
