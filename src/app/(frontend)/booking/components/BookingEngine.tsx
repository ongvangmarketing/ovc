"use client";

import { useState, useEffect } from "react";
import { getBookingInventory, createBooking } from "../actions";
import { Loader2, Calendar, MapPin, Users, Check, X, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface RoomType {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  basePrice: number;
  amenities: string[];
  images: string[];
}

interface BookingEngineProps {
  hotel: {
    id: string;
    name: string;
    description: string | null;
    address: string;
    city: string;
    images: string[];
    starRating: number;
    amenities: string[];
  };
  roomTypes: RoomType[];
}

export default function BookingEngine({ hotel, roomTypes }: BookingEngineProps) {
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState(2);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Checkout State
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccessCode, setBookingSuccessCode] = useState<string | null>(null);

  // Default dates: tomorrow and day after tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    
    setCheckIn(tomorrow.toISOString().split('T')[0] ?? "");
    setCheckOut(dayAfter.toISOString().split('T')[0] ?? "");
  }, []);

  const handleSearch = async () => {
    if (!checkIn || !checkOut) return;
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (start >= end) {
      alert("Ngày trả phòng phải sau ngày nhận phòng");
      return;
    }

    setIsSearching(true);
    const res = await getBookingInventory(hotel.id, checkIn, checkOut);
    if (res.success && res.inventory) {
      // Process inventory
      const roomResults = roomTypes.map(rt => {
        const rtInventory = res.inventory.filter((inv: any) => inv.roomTypeId === rt.id);
        
        let isAvailable = true;
        let totalPrice = 0;
        let reasons: string[] = [];

        // Check each day of the stay
        let current = new Date(start);
        const stayLength = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

        let dayCount = 0;
        while (current < end) {
          const dateStr = current.toISOString().split('T')[0] ?? "";
          const dayInv = rtInventory.find((inv: any) => {
            const invDateStr = (typeof inv.date === 'string' ? new Date(inv.date) : inv.date).toISOString().split('T')[0] ?? "";
            return invDateStr === dateStr;
          });
          
          if (!dayInv) {
            totalPrice += rt.basePrice;
          } else {
            totalPrice += dayInv.price;
            
            if (dayInv.isClosed) {
              isAvailable = false;
              reasons.push("Phòng đã đóng vào ngày " + current.toLocaleDateString('vi-VN'));
            }
            if (dayInv.availableRooms <= 0) {
              isAvailable = false;
              reasons.push("Hết phòng vào ngày " + current.toLocaleDateString('vi-VN'));
            }
            if (dayCount === 0 && dayInv.closedToArrival) {
              isAvailable = false;
              reasons.push("Không nhận khách (Check-in) vào ngày " + current.toLocaleDateString('vi-VN'));
            }
            if (dayInv.minStay && stayLength < dayInv.minStay) {
              isAvailable = false;
              reasons.push(`Yêu cầu ở tối thiểu ${dayInv.minStay} đêm`);
            }
            if (dayInv.maxStay && stayLength > dayInv.maxStay) {
              isAvailable = false;
              reasons.push(`Chỉ được ở tối đa ${dayInv.maxStay} đêm`);
            }
          }
          current.setDate(current.getDate() + 1);
          dayCount++;
        }

        return {
          roomType: rt,
          isAvailable,
          totalPrice,
          avgPrice: totalPrice / stayLength,
          reasons: Array.from(new Set(reasons))
        };
      });

      setResults(roomResults);
    }
    setIsSearching(false);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRoom) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const guestName = formData.get("guestName") as string;
    const guestEmail = formData.get("guestEmail") as string;
    const guestPhone = formData.get("guestPhone") as string;
    const specialRequest = formData.get("specialRequest") as string;

    const res = await createBooking({
      hotelId: hotel.id,
      roomTypeId: selectedRoom.roomType.id,
      checkIn,
      checkOut,
      totalPrice: selectedRoom.totalPrice,
      guestName,
      guestEmail,
      guestPhone,
      specialRequest
    });

    if (res.success) {
      setBookingSuccessCode(res.bookingCode ?? null);
    } else {
      alert("Lỗi: " + res.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="relative h-[400px] w-full bg-gray-900">
        {hotel.images && hotel.images.length > 0 ? (
          <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-900 to-indigo-900 opacity-80" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">{hotel.name}</h1>
          <div className="flex items-center gap-2 text-white/90 text-sm md:text-base">
            <span className="flex">
              {Array.from({ length: hotel.starRating || 3 }).map((_, i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {hotel.address}, {hotel.city}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-5xl mx-auto -mt-8 relative z-10 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-[13px] font-semibold text-gray-700 mb-1">Nhận phòng</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="date" 
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full border-b-2 border-gray-200 py-2 pl-10 pr-3 focus:border-black outline-none bg-transparent transition-colors text-[15px] font-medium"
              />
            </div>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-[13px] font-semibold text-gray-700 mb-1">Trả phòng</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="date" 
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn}
                className="w-full border-b-2 border-gray-200 py-2 pl-10 pr-3 focus:border-black outline-none bg-transparent transition-colors text-[15px] font-medium"
              />
            </div>
          </div>
          <div className="flex-1 w-full md:w-32">
            <label className="block text-[13px] font-semibold text-gray-700 mb-1">Khách</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select 
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                className="w-full border-b-2 border-gray-200 py-2 pl-10 pr-3 focus:border-black outline-none bg-transparent appearance-none text-[15px] font-medium"
              >
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n} người</option>
                ))}
              </select>
            </div>
          </div>
          <button 
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full md:w-auto h-12 px-8 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tìm phòng"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto mt-12 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Sidebar: Hotel Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-[16px] font-bold text-black mb-4">Giới thiệu</h3>
            <p className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">
              {hotel.description || "Chưa có thông tin mô tả về khách sạn này."}
            </p>
          </div>

          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-[16px] font-bold text-black mb-4">Tiện ích nổi bật</h3>
              <ul className="space-y-3 text-[14px] text-gray-600">
                {hotel.amenities.map((am, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" /> {am}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Content: Rooms List */}
        <div className="lg:col-span-2 space-y-6">
          {!results && (
            <div className="bg-blue-50 text-blue-800 rounded-2xl p-6 text-center border border-blue-100">
              <h3 className="font-semibold mb-2">Hãy chọn ngày để xem giá tốt nhất</h3>
              <p className="text-[14px] opacity-80">Nhập ngày nhận và trả phòng ở phía trên để tìm phòng trống.</p>
            </div>
          )}

          {results && results.map((res: any) => (
            <div key={res.roomType.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-2/5 h-48 md:h-auto bg-gray-200 relative">
                {res.roomType.images && res.roomType.images.length > 0 ? (
                  <img src={res.roomType.images[0]} alt={res.roomType.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Không có ảnh</div>
                )}
              </div>
              <div className="p-6 md:w-3/5 flex flex-col justify-between">
                <div>
                  <h3 className="text-[18px] font-bold text-black mb-1">{res.roomType.name}</h3>
                  <div className="flex items-center gap-2 text-[12px] text-gray-500 mb-3">
                    <span><Users className="w-3 h-3 inline mr-1" /> Tối đa {res.roomType.capacity} khách</span>
                  </div>
                  <p className="text-[13px] text-gray-600 line-clamp-2 mb-4">{res.roomType.description}</p>
                  
                  {/* Amenities tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {res.roomType.amenities?.slice(0, 3).map((am: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-[11px] rounded-md">{am}</span>
                    ))}
                    {res.roomType.amenities?.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[11px] rounded-md">+{res.roomType.amenities.length - 3} nữa</span>
                    )}
                  </div>
                </div>

                <div className="flex items-end justify-between border-t border-gray-100 pt-4 mt-2">
                  <div>
                    {res.isAvailable ? (
                      <>
                        <div className="text-[12px] text-gray-500">Giá trung bình/đêm</div>
                        <div className="text-[20px] font-bold text-indigo-600">
                          {new Intl.NumberFormat('vi-VN').format(res.avgPrice)} <span className="text-[14px] font-normal text-gray-500">VND</span>
                        </div>
                        <div className="text-[12px] text-gray-500 mt-1">
                          Tổng cộng: {new Intl.NumberFormat('vi-VN').format(res.totalPrice)} VND
                        </div>
                      </>
                    ) : (
                      <div className="text-red-500 text-[13px] font-medium">
                        {res.reasons[0] || "Hết phòng"}
                      </div>
                    )}
                  </div>
                  <button 
                    disabled={!res.isAvailable}
                    onClick={() => setSelectedRoom(res)}
                    className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors text-[14px] disabled:opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Đặt ngay
                  </button>
                </div>
              </div>
            </div>
          ))}

          {results && results.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Khách sạn chưa cấu hình hạng phòng nào.
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {selectedRoom && !bookingSuccessCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row my-8">
            
            {/* Left side: Booking Summary */}
            <div className="w-full md:w-5/12 bg-gray-50 p-6 md:p-8 border-r border-gray-200">
              <h3 className="text-[18px] font-bold text-black mb-6">Tóm tắt đơn đặt phòng</h3>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                    {selectedRoom.roomType.images && selectedRoom.roomType.images.length > 0 && (
                      <img src={selectedRoom.roomType.images[0]} alt={selectedRoom.roomType.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <div className="text-[16px] font-bold text-black">{hotel.name}</div>
                    <div className="text-[14px] text-gray-600 mt-1">{selectedRoom.roomType.name}</div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-gray-500 font-medium uppercase tracking-wider">Nhận phòng</div>
                    <div className="text-[15px] font-bold text-black mt-1">
                      {new Date(checkIn).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <div className="text-[12px] text-gray-500 font-medium uppercase tracking-wider">Trả phòng</div>
                    <div className="text-[15px] font-bold text-black mt-1">
                      {new Date(checkOut).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-[14px] text-gray-600">
                    <span>Số lượng khách:</span>
                    <span className="font-medium text-black">{guests} người</span>
                  </div>
                  <div className="flex justify-between text-[14px] text-gray-600">
                    <span>Tổng thời gian:</span>
                    <span className="font-medium text-black">{Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000*60*60*24))} đêm</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[15px] font-bold text-black">Tổng tiền thanh toán</span>
                    <div className="text-right">
                      <div className="text-[24px] font-bold text-indigo-600">
                        {new Intl.NumberFormat('vi-VN').format(selectedRoom.totalPrice)} ₫
                      </div>
                      <div className="text-[12px] text-gray-500">Đã bao gồm thuế và phí</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Guest Form */}
            <div className="w-full md:w-7/12 bg-white p-6 md:p-8 relative">
              <button 
                onClick={() => setSelectedRoom(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-[18px] font-bold text-black mb-6">Thông tin khách hàng</h3>
              
              <form onSubmit={handleCheckoutSubmit} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Họ và tên người nhận phòng <span className="text-red-500">*</span></label>
                  <input type="text" name="guestName" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="Nhập tên trên CCCD/Passport" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Email liên hệ <span className="text-red-500">*</span></label>
                    <input type="email" name="guestEmail" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="email@example.com" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Số điện thoại <span className="text-red-500">*</span></label>
                    <input type="tel" name="guestPhone" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="0901234567" />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Yêu cầu đặc biệt (Không bắt buộc)</label>
                  <textarea name="specialRequest" rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="Ví dụ: Cần phòng tầng cao, giường lớn..." />
                  <p className="text-[12px] text-gray-500 mt-1">Các yêu cầu đặc biệt không được đảm bảo chắc chắn nhưng khách sạn sẽ cố gắng sắp xếp.</p>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-colors flex items-center justify-center disabled:opacity-50 text-[15px]"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    {isSubmitting ? "Đang xử lý..." : "Xác nhận Đặt phòng"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {bookingSuccessCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-green-500" />
            
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            
            <h2 className="text-[24px] font-bold text-black mb-2">Đặt phòng thành công!</h2>
            <p className="text-[15px] text-gray-600 mb-8">
              Mã xác nhận của bạn là:<br/>
              <span className="text-[28px] font-bold text-indigo-600 block mt-2 tracking-wider">{bookingSuccessCode}</span>
            </p>

            <div className="bg-gray-50 p-4 rounded-xl text-[13px] text-gray-600 mb-8 text-left space-y-2">
              <p>Chúng tôi đã gửi email xác nhận đến hòm thư của bạn.</p>
              <p>Khách sạn sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận lại thông tin.</p>
            </div>

            <button 
              onClick={() => {
                setBookingSuccessCode(null);
                setSelectedRoom(null);
                handleSearch(); // Refresh inventory
              }}
              className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-colors"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
