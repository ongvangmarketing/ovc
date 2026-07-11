import { requireAuth } from "@/lib/auth/require-auth";
import { Calendar, User, Search, Map, CheckCircle2, XCircle, LayoutList } from "lucide-react";
import { TourService } from "@/modules/traveling/services/tour.service";

export default async function AgentBookingsPage() {
  const authData = await requireAuth();

  // Fetch Tour Bookings
  const tourBookings = await TourService.getAgentTourBookings(authData.organizationId, authData.userId);

  return (
    <div className="quote-page mx-auto max-w-[1440px] px-6 py-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
            <LayoutList className="h-4 w-4 text-orange-500" />
            Đại lý / Đơn đặt hàng
          </div>
          <h1 className="text-[15px] font-medium text-slate-950">Theo dõi và xử lý các Booking từ khách hàng.</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="quote-action-button quote-action-secondary">
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Main Content */}
      <section className="quote-panel">
        <div className="quote-panel-header flex-col md:flex-row md:items-center gap-4">
          <div className="flex flex-col">
            <h2>Danh sách Đơn hàng</h2>
            <span>Quản lý danh sách các đơn đặt tour du lịch.</span>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Tìm mã đơn, tên khách..."
                className="quote-input pl-9"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] whitespace-nowrap">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 font-medium text-slate-500">Mã đơn</th>
                <th className="px-5 py-3 font-medium text-slate-500">Sản phẩm</th>
                <th className="px-5 py-3 font-medium text-slate-500">Khách hàng</th>
                <th className="px-5 py-3 font-medium text-slate-500">Khởi hành</th>
                <th className="px-5 py-3 font-medium text-slate-500">Tổng tiền</th>
                <th className="px-5 py-3 font-medium text-slate-500 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tourBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[14px] text-slate-400">
                    Chưa có đơn đặt hàng nào.
                  </td>
                </tr>
              ) : null}
              {tourBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900">{booking.bookingCode}</div>
                    <div className="text-[12px] text-slate-500 mt-0.5">{booking.createdAt.toLocaleDateString('vi-VN')}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Map className="w-4 h-4 text-orange-500" />
                      <span className="font-medium text-slate-900 line-clamp-1 max-w-[200px]">
                        {booking.tour.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{booking.guestName}</div>
                        <div className="text-[12px] text-slate-500">{booking.guestPhone || booking.guestEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {booking.departureDate.toLocaleDateString('vi-VN')}
                    </div>
                    <div className="text-[12px] text-slate-500 mt-1">{booking.paxCount} khách</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-red-600">
                      {new Intl.NumberFormat('vi-VN').format(booking.totalAmount)} ₫
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {booking.status === "PENDING" && (
                      <span className="inline-flex items-center rounded-md border border-orange-200 bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-700">
                        Chờ duyệt
                      </span>
                    )}
                    {booking.status === "CONFIRMED" && (
                      <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                        Đã xác nhận
                      </span>
                    )}
                    {booking.status === "CANCELLED" && (
                      <span className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
                        Đã hủy
                      </span>
                    )}
                    
                    <div className="mt-2 flex justify-end gap-3">
                      {booking.status === "PENDING" && (
                        <>
                          <button className="text-[12px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                            Duyệt
                          </button>
                          <button className="text-[12px] text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                            Hủy
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
