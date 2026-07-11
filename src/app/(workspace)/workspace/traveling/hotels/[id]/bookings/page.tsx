import { requireAuth } from "@/lib/auth/require-auth";
import { notFound } from "next/navigation";
import { Search, ChevronDown, CheckCircle2, Clock, XCircle, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import BookingActions from "./booking-actions";
import { HotelBookingService } from "@/modules/traveling/services/hotel-booking.service";

export default async function BookingManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authData = await requireAuth();
  const { id } = await params;

  const bookings = await HotelBookingService.getHotelBookings(authData.organizationId, id);
  if (!bookings) notFound();

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-medium text-black">Quản lý Đặt phòng</h2>
          <p className="text-[14px] text-gray-500 mt-1">
            Theo dõi và quản lý các đơn đặt phòng từ khách hàng.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm mã Booking, tên khách..." 
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] outline-none focus:border-black transition-colors w-64"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
            <tr>
              <th className="px-6 py-4 font-medium">Mã Đặt Phòng</th>
              <th className="px-6 py-4 font-medium">Khách Hàng</th>
              <th className="px-6 py-4 font-medium">Nhận / Trả Phòng</th>
              <th className="px-6 py-4 font-medium">Hạng Phòng</th>
              <th className="px-6 py-4 font-medium text-right">Tổng Tiền</th>
              <th className="px-6 py-4 font-medium text-center">Trạng Thái</th>
              <th className="px-6 py-4 font-medium text-center">Tùy Chọn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Chưa có đơn đặt phòng nào.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-black">{booking.bookingCode}</div>
                    <div className="text-[12px] text-gray-500">{new Date(booking.createdAt).toLocaleDateString('vi-VN')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-black flex items-center gap-1">
                      {booking.contact ? (
                        <Link href={`/workspace/crm/contacts/${booking.contactId}`} className="hover:underline hover:text-indigo-600 flex items-center">
                          {booking.guestName} <ArrowUpRight className="w-3 h-3 ml-0.5 text-gray-400" />
                        </Link>
                      ) : (
                        booking.guestName
                      )}
                    </div>
                    <div className="text-[12px] text-gray-500">{booking.guestPhone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-black font-medium">{new Date(booking.checkIn).toLocaleDateString('vi-VN')}</div>
                    <div className="text-gray-500 text-[12px]">đến {new Date(booking.checkOut).toLocaleDateString('vi-VN')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{booking.roomType.name}</div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-black">
                    {new Intl.NumberFormat('vi-VN').format(booking.totalAmount)} ₫
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {booking.status === 'CONFIRMED' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[12px] font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Đã xác nhận
                        </span>
                      ) : booking.status === 'PENDING' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-2.5 py-1 text-[12px] font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                          <Clock className="h-3.5 w-3.5" /> Chờ xác nhận
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[12px] font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                          <XCircle className="h-3.5 w-3.5" /> Đã hủy {booking.specialRequest === 'NO_SHOW' && '(Khách không đến)'} {booking.specialRequest === 'INVALID_CARD' && '(Thẻ lỗi)'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {booking.invoiceId ? (
                        <Link 
                          href={`/workspace/finance/invoices/${booking.invoiceId}`}
                          className="inline-flex items-center gap-1 text-[13px] font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Hóa đơn <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <span className="text-[13px] text-gray-400">Không có HĐ</span>
                      )}
                      <BookingActions 
                        hotelId={id} 
                        bookingId={booking.id} 
                        currentStatus={booking.status} 
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
