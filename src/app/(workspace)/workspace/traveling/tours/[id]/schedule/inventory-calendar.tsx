"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Loader2, ChevronLeft, ChevronRight, X, CalendarDays } from "lucide-react";
import { getInventory, bulkUpdateInventory, advancedBulkUpdate } from "./actions";
import { Tour } from "@prisma/client";

interface InventoryRecord {
  id?: string;
  tourId: string;
  date: string;
  allotment: number;
  bookedCount: number;
  adultPrice: number | null;
  childPrice: number | null;
  isClosed: boolean;
}

const toDateKey = (date: Date) => date.toISOString().split('T')[0] ?? "";

export default function TourInventoryCalendar({ tour }: { tour: Tour }) {
  const [startDate, setStartDate] = useState(new Date());
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);

  // Modals state
  const [isQuickUpdateOpen, setIsQuickUpdateOpen] = useState(false);
  const [isAdvancedBulkOpen, setIsAdvancedBulkOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate 14 days
  const dates = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [startDate]);

  const fetchInventory = async () => {
    setIsLoading(true);
    const startStr = dates[0]!.toISOString();
    const endStr = dates[13]!.toISOString();
    const res = await getInventory(tour.id, startStr, endStr);
    if (res.success && 'inventory' in res && res.inventory) {
      const normalized = (res.inventory as any[]).map((inv: any) => ({
        ...inv,
        date: toDateKey(new Date(inv.date))
      }));
      setInventory(normalized);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, [startDate, tour.id]);

  const getCellData = (dateObj: Date) => {
    const dateStr = toDateKey(dateObj);
    const found = inventory.find(i => i.date === dateStr);
    return found || {
      tourId: tour.id,
      date: dateStr,
      allotment: 20, // default
      bookedCount: 0,
      adultPrice: null,
      childPrice: null,
      isClosed: false,
    };
  };

  const isCellSelected = (dateIndex: number) => {
    if (dragStart === null || dragEnd === null) return false;
    const minIndex = Math.min(dragStart, dragEnd);
    const maxIndex = Math.max(dragStart, dragEnd);
    return dateIndex >= minIndex && dateIndex <= maxIndex;
  };

  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseDown = (dateIndex: number) => {
    setIsDragging(true);
    setDragStart(dateIndex);
    setDragEnd(dateIndex);
  };

  const handleMouseEnter = (dateIndex: number) => {
    if (isDragging && dragStart !== null) {
      setDragEnd(dateIndex);
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart !== null && dragEnd !== null) {
      setIsDragging(false);
      // Only open popup on mouse up if it's a drag selection
      if (dragStart !== dragEnd) {
        setIsQuickUpdateOpen(true);
      }
    }
  };

  const toggleStatus = async (dateIndex: number) => {
    const dateStr = dates[dateIndex]!.toISOString().split('T')[0] as string;
    const cell = inventory.find(i => i.date === dateStr);
    const newStatus = cell ? !cell.isClosed : true; 
    
    setIsLoading(true);
    const res = await bulkUpdateInventory(tour.id, [dateStr], {
      isClosed: newStatus
    });
    if (res.success) {
      await fetchInventory();
    } else {
      alert("Lỗi cập nhật: " + res.error);
      setIsLoading(false);
    }
  };

  const handleCellClick = (dateIndex: number) => {
    if (dragStart !== null && dragEnd !== null && dragStart !== dragEnd) return;

    if (clickTimeoutRef.current) {
      // Double click
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      setDragStart(dateIndex);
      setDragEnd(dateIndex);
      setIsQuickUpdateOpen(true);
    } else {
      // Single click
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null;
        toggleStatus(dateIndex);
      }, 250);
    }
  };

  useEffect(() => {
    const onMouseUpWindow = () => {
      if (isDragging) {
        setIsDragging(false);
        if (dragStart !== null && dragEnd !== null && dragStart !== dragEnd) {
          setIsQuickUpdateOpen(true);
        }
      }
    };
    window.addEventListener("mouseup", onMouseUpWindow);
    return () => window.removeEventListener("mouseup", onMouseUpWindow);
  }, [isDragging, dragStart, dragEnd]);

  const handleNextDays = () => {
    const next = new Date(startDate);
    next.setDate(next.getDate() + 7);
    setStartDate(next);
  };

  const handlePrevDays = () => {
    const prev = new Date(startDate);
    prev.setDate(prev.getDate() - 7);
    setStartDate(prev);
  };

  const handleQuickUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (dragStart === null || dragEnd === null) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const adultPriceStr = formData.get("adultPrice") as string;
    const childPriceStr = formData.get("childPrice") as string;
    const allotmentStr = formData.get("allotment") as string;
    
    const adultPrice = adultPriceStr ? parseFloat(adultPriceStr) : undefined;
    const childPrice = childPriceStr ? parseFloat(childPriceStr) : undefined;
    const allotment = allotmentStr ? parseInt(allotmentStr) : undefined;
    
    const isClosedStatus = formData.get("isClosedStatus") as string;
    const isClosed = isClosedStatus === "true" ? true : isClosedStatus === "false" ? false : undefined;

    const minIndex = Math.min(dragStart, dragEnd);
    const maxIndex = Math.max(dragStart, dragEnd);
    
    const selectedDates: string[] = [];
    for (let i = minIndex; i <= maxIndex; i++) {
      const d = dates[i]?.toISOString().split('T')[0];
      if (d) selectedDates.push(d);
    }

    const res = await bulkUpdateInventory(tour.id, selectedDates, {
      adultPrice,
      childPrice,
      allotment,
      isClosed,
    });

    if (res.success) {
      await fetchInventory();
      setIsQuickUpdateOpen(false);
      setDragStart(null);
      setDragEnd(null);
    } else {
      alert("Lỗi cập nhật: " + res.error);
    }
    setIsSubmitting(false);
  };

  const handleAdvancedBulkSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const startDateVal = formData.get("startDate") as string;
    const endDateVal = formData.get("endDate") as string;
    
    const selectedDays: number[] = [];
    ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].forEach((day, index) => {
      if (formData.get(`day_${day}`) === "true") selectedDays.push(index);
    });

    if (!startDateVal || !endDateVal || selectedDays.length === 0) {
      alert("Vui lòng chọn ngày và thứ hợp lệ.");
      setIsSubmitting(false);
      return;
    }

    const adultPriceStr = formData.get("adultPrice") as string;
    const childPriceStr = formData.get("childPrice") as string;
    const allotmentStr = formData.get("allotment") as string;

    const adultPrice = adultPriceStr ? parseFloat(adultPriceStr) : undefined;
    const childPrice = childPriceStr ? parseFloat(childPriceStr) : undefined;
    const allotment = allotmentStr ? parseInt(allotmentStr) : undefined;

    const updateClosed = formData.get("update_isClosed") === "true";
    const isClosed = updateClosed ? formData.get("isClosed") === "true" : undefined;

    const res = await advancedBulkUpdate(tour.id, startDateVal, endDateVal, selectedDays, {
      adultPrice,
      childPrice,
      allotment,
      isClosed,
    });

    if (res.success) {
      await fetchInventory();
      setIsAdvancedBulkOpen(false);
      alert("Cập nhật hàng loạt thành công!");
    } else {
      alert("Lỗi cập nhật: " + res.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#eaeaea]">
        <div className="flex items-center gap-4">
          <button onClick={handlePrevDays} className="p-2 border border-[#eaeaea] rounded-lg hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-[14px] font-medium text-black">
            {dates[0]!.toLocaleDateString('vi-VN')} - {dates[13]!.toLocaleDateString('vi-VN')}
          </div>
          <button onClick={handleNextDays} className="p-2 border border-[#eaeaea] rounded-lg hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
          {isLoading && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
        </div>
        <div>
          <button onClick={() => setIsAdvancedBulkOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-indigo-700 transition-colors">
            <CalendarDays className="w-4 h-4" />
            Cập nhật hàng loạt
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-xl border border-[#eaeaea] overflow-x-auto select-none">
        <table className="w-full text-left text-[14px] min-w-[1200px] border-collapse">
          <thead>
            <tr>
              <th className="bg-gray-50 px-4 py-3 sticky left-0 z-10 border-r border-b border-[#eaeaea] w-52 shadow-[1px_0_0_0_#eaeaea]">
                Tour
              </th>
              {dates.map((d, i) => {
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <th key={i} className={`bg-gray-50 border-b border-[#eaeaea] min-w-[120px] ${isWeekend ? 'bg-gray-100/50' : ''}`}>
                    <div className="text-center p-2">
                      <div className={`text-[12px] font-medium ${isWeekend ? 'text-red-500' : 'text-gray-500'}`}>
                        {d.toLocaleDateString('vi-VN', { weekday: 'short' })}
                      </div>
                      <div className="text-[14px] text-black font-semibold mt-1">
                        {d.getDate()}/{d.getMonth() + 1}
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="bg-white px-4 py-3 sticky left-0 z-10 border-r border-b border-[#eaeaea] shadow-[1px_0_0_0_#eaeaea]">
                <div className="font-medium text-black line-clamp-2">{tour.name}</div>
                <div className="text-[12px] text-gray-500 mt-1">
                  NL: {new Intl.NumberFormat('vi-VN').format(tour.basePrice)}đ<br/>
                  TE: {new Intl.NumberFormat('vi-VN').format((tour as any).baseChildPrice || 0)}đ
                </div>
              </td>
              {dates.map((d, i) => {
                const cell = getCellData(d);
                const isSelected = isCellSelected(i);
                
                const currentAdultPrice = cell.adultPrice !== null ? cell.adultPrice : tour.basePrice;
                const currentChildPrice = cell.childPrice !== null ? cell.childPrice : ((tour as any).baseChildPrice || 0);
                
                return (
                  <td 
                    key={i} 
                    className={`border-r border-b border-[#eaeaea] p-1.5 cursor-crosshair transition-colors align-top
                      ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}
                      ${cell.isClosed ? 'bg-red-50/30' : ''}
                    `}
                    onMouseDown={() => handleMouseDown(i)}
                    onMouseEnter={() => handleMouseEnter(i)}
                    onMouseUp={handleMouseUp}
                    onClick={() => handleCellClick(i)}
                  >
                    <div className={`flex flex-col h-full rounded-md p-2 ${isSelected ? 'ring-1 ring-blue-400' : ''}`}>
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {cell.isClosed ? (
                          <span className="text-[10px] font-medium text-red-600 bg-red-100 rounded px-1.5 w-max">Đóng</span>
                        ) : (
                          <span className="text-[10px] font-medium text-green-600 bg-green-100 rounded px-1.5 w-max">Mở bán</span>
                        )}
                      </div>

                      <div className="mt-1 space-y-0.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-gray-500">NL:</span>
                          <span className="font-semibold text-gray-800">{new Intl.NumberFormat('vi-VN').format(currentAdultPrice)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-gray-500">TE:</span>
                          <span className="font-medium text-gray-600">{new Intl.NumberFormat('vi-VN').format(currentChildPrice)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-[11px] text-gray-500 pt-1 border-t border-black/5">
                        Chỗ: <span className="font-medium text-black">{cell.allotment - cell.bookedCount}/{cell.allotment}</span>
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Quick Update Modal */}
      {isQuickUpdateOpen && dragStart !== null && dragEnd !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-[#eaeaea] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-[#eaeaea]">
              <h3 className="text-[18px] font-semibold tracking-tight text-black">Cập nhật Lịch Tour</h3>
              <button onClick={() => { setIsQuickUpdateOpen(false); setDragStart(null); setDragEnd(null); }} className="text-gray-400 hover:text-black transition-colors rounded-full p-1 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleQuickUpdate} className="p-5 space-y-4">
              <div className="text-[13px] border border-[#eaeaea] bg-gray-50 text-black p-4 rounded-xl mb-4">
                Bạn đang chọn <strong>{Math.abs(dragEnd - dragStart) + 1} ngày</strong> khởi hành.
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-1.5">Trạng thái khởi hành</label>
                <select name="isClosedStatus" defaultValue={getCellData(dates[dragStart]!).isClosed ? "true" : "false"} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[13px] font-medium text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black appearance-none bg-white">
                  <option value="">Không đổi</option>
                  <option value="false">Mở bán (Open)</option>
                  <option value="true">Khóa (Đóng)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="col-span-2">
                  <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-1.5">Tổng số chỗ (Allotment)</label>
                  <input type="number" name="allotment" placeholder="Để trống nếu giữ nguyên" className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[13px] font-medium text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-1.5">Giá người lớn</label>
                  <input type="number" name="adultPrice" placeholder="Giá gốc" className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[13px] font-medium text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-1.5">Giá trẻ em</label>
                  <input type="number" name="childPrice" placeholder="Giá gốc" className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[13px] font-medium text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" disabled={isSubmitting} className="flex h-10 items-center justify-center rounded-full bg-black px-6 text-[14px] font-medium text-white hover:bg-gray-800 disabled:opacity-50 w-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lưu cài đặt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Advanced Bulk Update Modal */}
      {isAdvancedBulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-[#eaeaea] overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-[#eaeaea]">
              <h3 className="text-[18px] font-semibold tracking-tight text-black flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-gray-400" />
                Cập nhật hàng loạt (Advanced Bulk Update)
              </h3>
              <button onClick={() => setIsAdvancedBulkOpen(false)} className="text-gray-400 hover:text-black transition-colors rounded-full p-1 hover:bg-gray-100">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAdvancedBulkSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Scope */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[14px] font-bold text-black mb-3 border-b pb-1">1. Khoảng thời gian</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] text-gray-500 mb-1">Từ ngày</label>
                        <input type="date" name="startDate" required className="w-full border border-gray-300 rounded p-2 text-[14px]" />
                      </div>
                      <div>
                        <label className="block text-[12px] text-gray-500 mb-1">Đến ngày</label>
                        <input type="date" name="endDate" required className="w-full border border-gray-300 rounded p-2 text-[14px]" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[14px] font-bold text-black mb-3 border-b pb-1">2. Các ngày khởi hành trong tuần</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((day, idx) => {
                        const labels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                        return (
                          <label key={day} className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" name={`day_${day}`} value="true" defaultChecked className="w-4 h-4 rounded text-indigo-600" />
                            <span className="text-[13px]">{labels[idx]}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Values */}
                <div className="space-y-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="text-[14px] font-bold text-black mb-3 border-b pb-1">3. Cấu hình Tour</h4>
                  
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer p-3 bg-white border border-gray-200 rounded">
                      <input type="checkbox" name="update_isClosed" value="true" className="mt-1" />
                      <div className="flex-1">
                        <div className="text-[13px] font-bold text-black">Đổi trạng thái đóng/mở</div>
                        <select name="isClosed" className="mt-1 w-full border border-gray-300 rounded p-1 text-[13px]">
                          <option value="false">Mở bán (Mở)</option>
                          <option value="true">Khóa (Đóng)</option>
                        </select>
                      </div>
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-[12px] font-bold text-gray-700 mb-1">Số chỗ mở bán (Allotment)</label>
                        <input type="number" name="allotment" placeholder="Để trống nếu giữ nguyên" className="w-full border border-gray-300 rounded p-2 text-[13px]" />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-gray-700 mb-1">Giá NL mới</label>
                        <input type="number" name="adultPrice" placeholder="Trống = Giữ nguyên" className="w-full border border-gray-300 rounded p-2 text-[13px]" />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-gray-700 mb-1">Giá TE mới</label>
                        <input type="number" name="childPrice" placeholder="Trống = Giữ nguyên" className="w-full border border-gray-300 rounded p-2 text-[13px]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#eaeaea] flex justify-end gap-3">
                <button type="button" onClick={() => setIsAdvancedBulkOpen(false)} className="px-6 py-2 rounded-full border border-[#eaeaea] text-black font-medium hover:bg-gray-50 transition-colors text-[14px]">
                  Hủy
                </button>
                <button type="submit" disabled={isSubmitting} className="flex h-10 items-center justify-center rounded-full bg-black px-8 text-[14px] font-medium text-white hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Áp dụng cập nhật hàng loạt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
