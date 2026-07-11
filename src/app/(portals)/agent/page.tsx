import { CreditCard, Hotel, Map, Car, Ticket, TrendingUp, Home, AlertCircle, Activity } from "lucide-react";
import { requireAuth } from "@/lib/auth/require-auth";
import Link from "next/link";
import RevenueChart from "./revenue-chart";
import { TravelingService } from "@/modules/traveling/services/traveling.service";

export default async function AgentDashboardPage() {
  const authData = await requireAuth();

  const stats = await TravelingService.getDashboardStats(authData.organizationId!);
  const activeModules: string[] = [];

  const hasHotel = stats.hasHotel;
  const hasTour = stats.hasTour;
  const hasCar = stats.hasCar;
  const hasTicket = stats.hasTicket;

  const pendingBookingsCount = 0;
  const upcomingDeparturesCount = 0;
  const totalRevenue = 0;

  if (!hasHotel && !hasTour && !hasCar && !hasTicket) {
    return (
      <div className="flex h-full items-center justify-center p-8 bg-[#fafafa]">
        <div className="max-w-md text-center">
          <h2 className="text-[24px] font-medium text-black">Chào mừng đến với Cổng Đại lý</h2>
          <p className="mt-3 text-[15px] text-gray-500 mb-8">
            Vui lòng vào phần Cài đặt để kích hoạt các mảng dịch vụ kinh doanh của bạn trước khi bắt đầu.
          </p>
          <Link 
            href="/agent/settings"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-black px-6 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Đi đến Cài đặt
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="quote-page mx-auto max-w-[1440px] px-6 py-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
            <Home className="h-4 w-4 text-orange-500" />
            Đại lý / Tổng quan
          </div>
          <h1 className="text-[15px] font-medium text-slate-950">Trung tâm Điều hành (Action Hub)</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Action Center - Booking.com Style */}
        <section className="quote-panel lg:col-span-2 border-t-[3px] border-t-orange-500 shadow-sm">
          <div className="quote-panel-header flex items-center justify-between !border-b border-slate-100">
            <div>
              <h2 className="flex items-center gap-2 text-orange-700">
                <AlertCircle className="w-5 h-5" /> 
                Cần Xử Lý Ngay
              </h2>
              <span>Các công việc ưu tiên cần sự chú ý của Đại lý hôm nay.</span>
            </div>
          </div>
          
          <div className="p-0">
            <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              <div className="flex-1 p-6 flex flex-col justify-between bg-orange-50/30 hover:bg-orange-50/60 transition-colors">
                <div>
                  <div className="text-[36px] font-bold text-slate-800">{pendingBookingsCount}</div>
                  <div className="text-[15px] font-medium text-slate-800 mt-1">Đơn hàng chờ duyệt</div>
                  <p className="text-[13px] text-slate-500 mt-2">Xác nhận ngay để giữ chỗ và tránh khách hàng hủy đơn.</p>
                </div>
                <Link href="/agent/bookings" className="mt-5 text-[14px] font-medium text-orange-600 flex items-center gap-1 hover:underline">
                  Xem và Xử lý &rarr;
                </Link>
              </div>

              <div className="flex-1 p-6 flex flex-col justify-between hover:bg-slate-50/50 transition-colors">
                <div>
                  <div className="text-[36px] font-bold text-slate-800">{upcomingDeparturesCount}</div>
                  <div className="text-[15px] font-medium text-slate-800 mt-1">Khách khởi hành (3 ngày tới)</div>
                  <p className="text-[13px] text-slate-500 mt-2">Theo dõi sát sao lịch trình và chuẩn bị dịch vụ cho khách.</p>
                </div>
                <Link href="/agent/bookings" className="mt-5 text-[14px] font-medium text-orange-600 flex items-center gap-1 hover:underline">
                  Xem danh sách &rarr;
                </Link>
              </div>

              <div className="flex-1 p-6 flex flex-col justify-between hover:bg-slate-50/50 transition-colors">
                <div>
                  <div className="text-[36px] font-bold text-red-500">2</div>
                  <div className="text-[15px] font-medium text-slate-800 mt-1">Sản phẩm chưa cài giá</div>
                  <p className="text-[13px] text-slate-500 mt-2">Cập nhật giá tháng tới để không đánh mất cơ hội bán hàng.</p>
                </div>
                <Link href="/agent/tours" className="mt-5 text-[14px] font-medium text-red-600 flex items-center gap-1 hover:underline">
                  Quản lý giá ngay &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Perf metrics */}
        <section className="quote-panel bg-slate-900 text-white border-none shadow-sm relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-orange-500/10 blur-3xl"></div>
          
          <div className="quote-panel-header border-slate-800">
            <h2 className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Hiệu suất Kinh doanh
            </h2>
            <span className="text-slate-400">So sánh với 30 ngày trước</span>
          </div>
          <div className="p-6 flex flex-col gap-6 relative z-10">
            <div>
              <div className="text-[14px] font-medium text-slate-400 mb-1">Doanh thu khả dụng</div>
              <div className="flex items-baseline gap-2">
                <span className="text-[32px] font-bold text-white">{new Intl.NumberFormat('vi-VN').format(totalRevenue)} ₫</span>
                <span className="text-[13px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded">+12%</span>
              </div>
            </div>
            
            <div className="h-px w-full bg-slate-800"></div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[13px] text-slate-400 mb-1">Lượt xem sản phẩm</div>
                <div className="text-[20px] font-bold text-white">4,281</div>
              </div>
              <div>
                <div className="text-[13px] text-slate-400 mb-1">Tỷ lệ chuyển đổi</div>
                <div className="text-[20px] font-bold text-white">3.2%</div>
              </div>
            </div>

            <div className="mt-2">
              <button className="w-full bg-white/10 hover:bg-white/20 text-white text-[14px] font-medium py-2 rounded-md transition-colors">
                Xem Báo Cáo Chi Tiết
              </button>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <section className="quote-panel">
          <div className="quote-panel-header">
            <h2>Biểu đồ doanh thu 30 ngày qua</h2>
            <span>Theo dõi biến động và xu hướng đặt phòng/tour của khách hàng.</span>
          </div>
          <div className="h-[300px] w-full p-4">
            <RevenueChart />
          </div>
        </section>
      </div>
    </div>
  );
}
