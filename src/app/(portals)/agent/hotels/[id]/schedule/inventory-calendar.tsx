"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Loader2, ChevronLeft, ChevronRight, X, CalendarDays, KeySquare } from "lucide-react";
import { getInventory, bulkUpdateInventory, advancedBulkUpdate } from "./actions";

interface InventoryRecord {
  id?: string;
  roomTypeId: string;
  date: string;
  allotment: number;
  availableRooms: number;
  price: number;
  isClosed: boolean;
  minStay: number;
  maxStay: number | null;
  closedToArrival: boolean;
  closedToDeparture: boolean;
}

export default function InventoryCalendar({ hotelId, roomTypes }: { hotelId: string, roomTypes: any[] }) {
  const [startDate, setStartDate] = useState(new Date());
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ roomTypeId: string, dateIndex: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ roomTypeId: string, dateIndex: number } | null>(null);

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
    const res = await getInventory(hotelId, startStr, endStr);
    if (res.success && 'inventory' in res && res.inventory) {
      const normalized = (res.inventory as any[]).map((inv: any) => ({
        ...inv,
        date: new Date(inv.date).toISOString().split('T')[0]
      }));
      setInventory(normalized);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, [startDate, hotelId]);

  const getCellData = (roomTypeId: string, dateObj: Date) => {
    const dateStr = dateObj.toISOString().split('T')[0];
    const found = inventory.find(i => i.roomTypeId === roomTypeId && i.date === dateStr);
    const rt = roomTypes.find(r => r.id === roomTypeId);
    return found || {
      roomTypeId,
      date: dateStr,
      allotment: 0,
      availableRooms: 0,
      price: rt?.basePrice || 0,
      isClosed: false,
      minStay: 1,
      maxStay: null,
      closedToArrival: false,
      closedToDeparture: false
    };
  };

  const isCellSelected = (roomTypeId: string, dateIndex: number) => {
    if (!dragStart || !dragEnd) return false;
    if (dragStart.roomTypeId !== roomTypeId) return false;
    const minIndex = Math.min(dragStart.dateIndex, dragEnd.dateIndex);
    const maxIndex = Math.max(dragStart.dateIndex, dragEnd.dateIndex);
    return dateIndex >= minIndex && dateIndex <= maxIndex;
  };

  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseDown = (roomTypeId: string, dateIndex: number) => {
    setIsDragging(true);
    setDragStart({ roomTypeId, dateIndex });
    setDragEnd({ roomTypeId, dateIndex });
  };

  const handleMouseEnter = (roomTypeId: string, dateIndex: number) => {
    if (isDragging && dragStart && dragStart.roomTypeId === roomTypeId) {
      setDragEnd({ roomTypeId, dateIndex });
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart && dragEnd) {
      setIsDragging(false);
      // Only open popup on mouse up if it's a drag selection
      if (dragStart.dateIndex !== dragEnd.dateIndex) {
        setIsQuickUpdateOpen(true);
      }
    }
  };

  const toggleRoomStatus = async (roomTypeId: string, dateIndex: number) => {
    const dateStr = dates[dateIndex]!.toISOString().split('T')[0];
    const cell = inventory.find(i => i.roomTypeId === roomTypeId && i.date === dateStr);
    const newStatus = cell ? !cell.isClosed : true; // default to true (close) if not found, since default is open
    
    setIsLoading(true);
    const res = await bulkUpdateInventory(hotelId, roomTypeId, [dateStr as string], {
      isClosed: newStatus
    });
    if (res.success) {
      await fetchInventory();
    } else {
      alert("Lỗi cập nhật: " + res.error);
      setIsLoading(false);
    }
  };

  const handleCellClick = (roomTypeId: string, dateIndex: number) => {
    // If it was a drag, do nothing here (handled by handleMouseUp)
    if (dragStart && dragEnd && dragStart.dateIndex !== dragEnd.dateIndex) return;

    if (clickTimeoutRef.current) {
      // Double click
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      setDragStart({ roomTypeId, dateIndex });
      setDragEnd({ roomTypeId, dateIndex });
      setIsQuickUpdateOpen(true);
    } else {
      // Single click
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null;
        toggleRoomStatus(roomTypeId, dateIndex);
      }, 250);
    }
  };

  useEffect(() => {
    const onMouseUpWindow = () => {
      if (isDragging) {
        setIsDragging(false);
        if (dragStart && dragEnd && dragStart.dateIndex !== dragEnd.dateIndex) {
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
    if (!dragStart || !dragEnd) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const priceStr = formData.get("price") as string;
    const allotmentStr = formData.get("allotment") as string;
    const minStayStr = formData.get("minStay") as string;

    const price = priceStr ? parseFloat(priceStr) : undefined;
    const allotment = allotmentStr ? parseInt(allotmentStr) : undefined;
    const minStay = minStayStr ? parseInt(minStayStr) : undefined;
    
    const isClosedStatus = formData.get("isClosedStatus") as string;
    const isClosed = isClosedStatus === "true" ? true : isClosedStatus === "false" ? false : undefined;

    const ctaStatus = formData.get("ctaStatus") as string;
    const closedToArrival = ctaStatus === "true" ? true : ctaStatus === "false" ? false : undefined;

    const ctdStatus = formData.get("ctdStatus") as string;
    const closedToDeparture = ctdStatus === "true" ? true : ctdStatus === "false" ? false : undefined;

    const minIndex = Math.min(dragStart.dateIndex, dragEnd.dateIndex);
    const maxIndex = Math.max(dragStart.dateIndex, dragEnd.dateIndex);
    
    const selectedDates = [];
    for (let i = minIndex; i <= maxIndex; i++) {
      selectedDates.push(dates[i]!.toISOString().split('T')[0]);
    }

    const res = await bulkUpdateInventory(hotelId, dragStart.roomTypeId, selectedDates as string[], {
      price,
      allotment,
      isClosed,
      minStay,
      closedToArrival,
      closedToDeparture
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
    
    // Days of week
    const selectedDays: number[] = [];
    ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].forEach((day, index) => {
      if (formData.get(`day_${day}`) === "true") selectedDays.push(index);
    });

    // Room types
    const selectedRoomTypes: string[] = [];
    roomTypes.forEach(rt => {
      if (formData.get(`rt_${rt.id}`) === "true") selectedRoomTypes.push(rt.id);
    });

    if (!startDateVal || !endDateVal || selectedDays.length === 0 || selectedRoomTypes.length === 0) {
      alert("Vui lòng chọn ngày, thứ và ít nhất 1 hạng phòng.");
      setIsSubmitting(false);
      return;
    }

    const priceStr = formData.get("price") as string;
    const allotmentStr = formData.get("allotment") as string;
    const minStayStr = formData.get("minStay") as string;

    const price = priceStr ? parseFloat(priceStr) : undefined;
    const allotment = allotmentStr ? parseInt(allotmentStr) : undefined;
    const minStay = minStayStr ? parseInt(minStayStr) : undefined;

    // Checkboxes
    const updateClosed = formData.get("update_isClosed") === "true";
    const isClosed = updateClosed ? formData.get("isClosed") === "true" : undefined;

    const updateCTA = formData.get("update_cta") === "true";
    const closedToArrival = updateCTA ? formData.get("cta") === "true" : undefined;

    const updateCTD = formData.get("update_ctd") === "true";
    const closedToDeparture = updateCTD ? formData.get("ctd") === "true" : undefined;

    const res = await advancedBulkUpdate(hotelId, selectedRoomTypes, startDateVal, endDateVal, selectedDays, {
      price,
      allotment,
      isClosed,
      minStay,
      closedToArrival,
      closedToDeparture
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
              <th className="bg-gray-50 px-4 py-3 sticky left-0 z-10 border-r border-b border-[#eaeaea] w-64 shadow-[1px_0_0_0_#eaeaea]">
                Hạng phòng
              </th>
              {dates.map((d, i) => {
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <th key={i} className={`bg-gray-50 border-b border-[#eaeaea] min-w-[100px] ${isWeekend ? 'bg-gray-100/50' : ''}`}>
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
            {roomTypes.map(rt => (
              <tr key={rt.id}>
                <td className="bg-white px-4 py-3 sticky left-0 z-10 border-r border-b border-[#eaeaea] shadow-[1px_0_0_0_#eaeaea]">
                  <div className="font-medium text-black">{rt.name}</div>
                  <div className="text-[12px] text-gray-500">Giá gốc: {new Intl.NumberFormat('vi-VN').format(rt.basePrice)}đ</div>
                </td>
                {dates.map((d, i) => {
                  const cell = getCellData(rt.id, d);
                  const isSelected = isCellSelected(rt.id, i);
                  
                  return (
                    <td 
                      key={i} 
                      className={`border-r border-b border-[#eaeaea] p-1.5 cursor-crosshair transition-colors align-top
                        ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}
                        ${cell.isClosed ? 'bg-red-50/30' : ''}
                      `}
                      onMouseDown={() => handleMouseDown(rt.id, i)}
                      onMouseEnter={() => handleMouseEnter(rt.id, i)}
                      onMouseUp={handleMouseUp}
                      onClick={() => handleCellClick(rt.id, i)}
                    >
                      <div className={`flex flex-col h-full rounded-md p-1.5 ${isSelected ? 'ring-1 ring-blue-400' : ''} ${cell.allotment === 0 && !cell.isClosed ? 'bg-orange-50/50' : ''}`}>
                        <div className="flex flex-wrap gap-1 mb-1">
                          {cell.isClosed ? (
                            <span className="text-[10px] font-medium text-red-600 bg-red-100 rounded px-1 w-max">Đóng</span>
                          ) : cell.allotment === 0 ? (
                            <span className="text-[10px] font-medium text-orange-600 bg-orange-100 rounded px-1 w-max" title="Bạn chưa nhập số lượng phòng mở bán">Trống quỹ phòng</span>
                          ) : (
                            <span className="text-[10px] font-medium text-green-600 bg-green-100 rounded px-1 w-max">Mở</span>
                          )}
                          {cell.minStay > 1 && (
                            <span className="text-[10px] font-medium text-purple-600 bg-purple-100 rounded px-1 w-max" title="Min Stay">M:{cell.minStay}</span>
                          )}
                          {cell.closedToArrival && (
                            <span className="text-[10px] font-medium text-orange-600 bg-orange-100 rounded px-1 w-max" title="Closed to Arrival">CTA</span>
                          )}
                          {cell.closedToDeparture && (
                            <span className="text-[10px] font-medium text-orange-600 bg-orange-100 rounded px-1 w-max" title="Closed to Departure">CTD</span>
                          )}
                        </div>

                        <div className="mt-1 text-[12px] text-gray-700 font-semibold line-clamp-1" title={new Intl.NumberFormat('vi-VN').format(cell.price)}>
                          {new Intl.NumberFormat('vi-VN').format(cell.price)}đ
                        </div>
                        <div className="mt-1 text-[11px] text-gray-500">
                          {cell.allotment === 0 ? (
                            <span className="text-orange-500 font-medium">Chưa nhập SL</span>
                          ) : (
                            <>Phòng: <span className="font-medium text-black">{cell.availableRooms}/{cell.allotment}</span></>
                          )}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            {roomTypes.length === 0 && (
              <tr>
                <td colSpan={15} className="px-6 py-12 text-center text-[14px] text-gray-500">
                  Vui lòng tạo hạng phòng trước.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Update Modal (Drag selection) */}
      {isQuickUpdateOpen && dragStart && dragEnd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-[#eaeaea] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-[#eaeaea]">
              <h3 className="text-[18px] font-semibold tracking-tight text-black">Cập nhật nhanh</h3>
              <button onClick={() => { setIsQuickUpdateOpen(false); setDragStart(null); setDragEnd(null); }} className="text-gray-400 hover:text-black transition-colors rounded-full p-1 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleQuickUpdate} className="p-5 space-y-4">
              <div className="text-[13px] border border-[#eaeaea] bg-gray-50 text-black p-4 rounded-xl mb-4">
                Bạn đang chọn <strong>{Math.abs(dragEnd.dateIndex - dragStart.dateIndex) + 1} ngày</strong> cho hạng phòng 
                <br/><strong>{roomTypes.find(r => r.id === dragStart.roomTypeId)?.name}</strong>
              </div>

              {/* Status Selectors */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-1.5">Trạng thái phòng</label>
                  <select name="isClosedStatus" defaultValue={getCellData(dragStart.roomTypeId, dates[dragStart.dateIndex]!).isClosed ? "true" : "false"} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[13px] font-medium text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black appearance-none bg-white">
                    <option value="">Không đổi</option>
                    <option value="false">Mở bán (Open)</option>
                    <option value="true">Khóa phòng (Closed)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-1.5">Check-in (CTA)</label>
                  <select name="ctaStatus" defaultValue={getCellData(dragStart.roomTypeId, dates[dragStart.dateIndex]!).closedToArrival ? "true" : "false"} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[13px] font-medium text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black appearance-none bg-white">
                    <option value="">Không đổi</option>
                    <option value="false">Cho phép (Mở)</option>
                    <option value="true">Chặn Check-in (Đóng)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-1.5">Check-out (CTD)</label>
                  <select name="ctdStatus" defaultValue={getCellData(dragStart.roomTypeId, dates[dragStart.dateIndex]!).closedToDeparture ? "true" : "false"} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[13px] font-medium text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black appearance-none bg-white">
                    <option value="">Không đổi</option>
                    <option value="false">Cho phép (Mở)</option>
                    <option value="true">Chặn Check-out (Đóng)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-1.5">Giá bán / đêm</label>
                  <input type="number" name="price" placeholder="Bỏ qua" className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[13px] font-medium text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-1.5">Allotment</label>
                  <input type="number" name="allotment" placeholder="Bỏ qua" className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[13px] font-medium text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
              </div>
              
              <div className="mt-2">
                <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-1.5">Min Stay (Lưu trú tối thiểu)</label>
                <input type="number" name="minStay" placeholder="Ví dụ: 2" min="1" className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[13px] font-medium text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
              </div>

              <div className="pt-6">
                <button type="submit" disabled={isSubmitting} className="flex h-10 items-center justify-center rounded-full bg-black px-6 text-[14px] font-medium text-white hover:bg-gray-800 disabled:opacity-50 w-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Áp dụng cập nhật"}
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
                    <h4 className="text-[14px] font-bold text-black mb-3 border-b pb-1">1. Chọn khoảng thời gian</h4>
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
                    <h4 className="text-[14px] font-bold text-black mb-3 border-b pb-1">2. Các thứ trong tuần</h4>
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

                  <div>
                    <h4 className="text-[14px] font-bold text-black mb-3 border-b pb-1">3. Áp dụng cho hạng phòng</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-100 p-2 rounded">
                      {roomTypes.map(rt => (
                        <label key={rt.id} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" name={`rt_${rt.id}`} value="true" defaultChecked className="w-4 h-4 rounded text-indigo-600" />
                          <span className="text-[13px] font-medium">{rt.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Values */}
                <div className="space-y-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="text-[14px] font-bold text-black mb-3 border-b pb-1">4. Dữ liệu cập nhật</h4>
                  
                  <div className="space-y-4">
                    {/* Status Toggles */}
                    <div className="space-y-3 bg-white p-3 rounded border border-gray-200">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" name="update_isClosed" value="true" className="mt-1" />
                        <div>
                          <div className="text-[13px] font-bold text-black">Đổi trạng thái đóng/mở</div>
                          <select name="isClosed" className="mt-1 w-full border border-gray-300 rounded p-1 text-[13px]">
                            <option value="false">Mở bán (Mở)</option>
                            <option value="true">Khóa phòng (Đóng)</option>
                          </select>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer border-t pt-2">
                        <input type="checkbox" name="update_cta" value="true" className="mt-1" />
                        <div>
                          <div className="text-[13px] font-bold text-black">Closed to Arrival (CTA)</div>
                          <select name="cta" className="mt-1 w-full border border-gray-300 rounded p-1 text-[13px]">
                            <option value="true">Bật CTA (Chặn Check-in)</option>
                            <option value="false">Tắt CTA</option>
                          </select>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer border-t pt-2">
                        <input type="checkbox" name="update_ctd" value="true" className="mt-1" />
                        <div>
                          <div className="text-[13px] font-bold text-black">Closed to Departure (CTD)</div>
                          <select name="ctd" className="mt-1 w-full border border-gray-300 rounded p-1 text-[13px]">
                            <option value="true">Bật CTD (Chặn Check-out)</option>
                            <option value="false">Tắt CTD</option>
                          </select>
                        </div>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[12px] font-bold text-gray-700 mb-1">Giá bán mới</label>
                        <input type="number" name="price" placeholder="Để trống nếu giữ nguyên" className="w-full border border-gray-300 rounded p-2 text-[13px]" />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-gray-700 mb-1">Số phòng mở bán</label>
                        <input type="number" name="allotment" placeholder="Để trống nếu giữ nguyên" className="w-full border border-gray-300 rounded p-2 text-[13px]" />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-gray-700 mb-1">Min Stay (đêm)</label>
                        <input type="number" name="minStay" placeholder="Để trống nếu giữ nguyên" min="1" className="w-full border border-gray-300 rounded p-2 text-[13px]" />
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
