import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { ArrowUpRight, BedDouble, BookmarkCheck, LayoutGrid, AlertCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import { HotelService } from "@/modules/traveling/services/hotel.service";

const formatMoney = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
});

export default async function HotelDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authData = await requireAuth();
  const { id } = await params;

  const hotelData = await HotelService.getHotelDashboard(authData.organizationId!, id);
  if (!hotelData) notFound();
  
  const hotel = hotelData;
  const pendingBookings = (hotelData as any).bookings?.length || 0;

  // Giả lập dữ liệu hôm nay
  const todayRevenue = 15500000;
  const todayOccupancy = 75;

  return (
    <div className="w-full space-y-8 p-4">
      <div className="space-y-1">
        <h2 className="text-[24px] font-medium tracking-tight text-black">
          Xin chào, {hotel.name}
        </h2>
        <p className="text-[14px] text-gray-500">
          Tổng quan hiệu suất hoạt động và các công việc cần xử lý.
        </p>
      </div>

      {/* Actionable Alerts */}
      {pendingBookings > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="space-y-1 flex-1">
            <h3 className="text-[14px] font-medium text-amber-900">
              Bạn có {pendingBookings} đặt phòng mới cần xác nhận
            </h3>
            <p className="text-[13px] text-amber-700">
              Hãy kiểm tra và xác nhận sớm để tránh ảnh hưởng đến trải nghiệm khách hàng.
            </p>
          </div>
          <Link
            href={`/agent/hotels/${id}/bookings`}
            className="rounded-lg bg-amber-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-amber-700 transition-colors"
          >
            Xử lý ngay
          </Link>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-gray-500">
            <ArrowUpRight className="h-4 w-4" />
            <span className="text-[13px] font-medium uppercase tracking-widest">
              Doanh thu (Hôm nay)
            </span>
          </div>
          <div className="text-[32px] font-medium text-black">
            {formatMoney.format(todayRevenue)}
            <span className="text-[16px] text-gray-400 ml-1">₫</span>
          </div>
        </div>

        <div className="rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-gray-500">
            <BookmarkCheck className="h-4 w-4" />
            <span className="text-[13px] font-medium uppercase tracking-widest">
              Chờ xác nhận
            </span>
          </div>
          <div className="text-[32px] font-medium text-black">
            {pendingBookings}
          </div>
        </div>

        <div className="rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-gray-500">
            <BedDouble className="h-4 w-4" />
            <span className="text-[13px] font-medium uppercase tracking-widest">
              Tỷ lệ lấp đầy
            </span>
          </div>
          <div className="text-[32px] font-medium text-black">
            {todayOccupancy}%
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-4">
        <h3 className="text-[16px] font-medium text-black">Lối tắt thao tác</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link
            href={`/agent/hotels/${id}/schedule`}
            className="flex items-center gap-3 rounded-xl border border-[#eaeaea] bg-white p-4 hover:border-black hover:shadow-md transition-all group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-black group-hover:text-white transition-colors">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div className="font-medium text-[14px]">Cập nhật giá & phòng</div>
          </Link>
          
          <Link
            href={`/agent/hotels/${id}/bookings`}
            className="flex items-center gap-3 rounded-xl border border-[#eaeaea] bg-white p-4 hover:border-black hover:shadow-md transition-all group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-black group-hover:text-white transition-colors">
              <BookmarkCheck className="h-5 w-5" />
            </div>
            <div className="font-medium text-[14px]">Quản lý đặt phòng</div>
          </Link>

          <Link
            href={`#`}
            className="flex items-center gap-3 rounded-xl border border-[#eaeaea] bg-white p-4 hover:border-black hover:shadow-md transition-all group opacity-50 cursor-not-allowed"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-black group-hover:text-white transition-colors">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="font-medium text-[14px]">Tin nhắn (Sắp có)</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
