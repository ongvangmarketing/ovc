"use client";

import { useState } from "react";
import { MoreHorizontal, Ban, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { updateBookingStatus } from "./actions";

export default function BookingActions({ 
  hotelId, 
  bookingId, 
  currentStatus 
}: { 
  hotelId: string, 
  bookingId: string, 
  currentStatus: string 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleAction = async (status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED", note?: string) => {
    setIsPending(true);
    setIsOpen(false);
    
    const res = await updateBookingStatus(hotelId, bookingId, status, note);
    if (!res.success) {
      alert("Lỗi cập nhật: " + res.error);
    }
    
    setIsPending(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <MoreHorizontal className="w-5 h-5" />}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden border border-[#eaeaea]">
            <div className="py-1">
              {currentStatus !== 'CONFIRMED' && (
                <button
                  onClick={() => handleAction("CONFIRMED")}
                  className="group flex w-full items-center px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors"
                >
                  <CheckCircle2 className="mr-3 h-4 w-4 text-gray-400 group-hover:text-green-600" />
                  Xác nhận Booking
                </button>
              )}
              
              <button
                onClick={() => {
                  const confirm = window.confirm("Xác nhận khách không đến (No-Show)?");
                  if (confirm) handleAction("CANCELLED", "NO_SHOW");
                }}
                className="group flex w-full items-center px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 hover:text-amber-600 transition-colors"
              >
                <Ban className="mr-3 h-4 w-4 text-gray-400 group-hover:text-amber-600" />
                Đánh dấu khách không đến (No-Show)
              </button>

              <button
                onClick={() => {
                  const confirm = window.confirm("Báo cáo thẻ tín dụng lỗi? Booking sẽ được Hủy.");
                  if (confirm) handleAction("CANCELLED", "INVALID_CARD");
                }}
                className="group flex w-full items-center px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
              >
                <AlertTriangle className="mr-3 h-4 w-4 text-gray-400 group-hover:text-red-600" />
                Báo cáo thẻ tín dụng lỗi
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
