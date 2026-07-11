import { CreditCard, Hotel, Map, Car, Ticket } from "lucide-react";
import { requireAuth } from "@/lib/auth/require-auth";
import Link from "next/link";
import { TravelingService } from "@/modules/traveling/services/traveling.service";

export default async function AgentDashboardPage() {
  const authData = await requireAuth();

  const stats = await TravelingService.getDashboardStats(authData.organizationId);
  const { hasHotel, hasTour, hasCar, hasTicket, hotelCount, tourCount, carCount, ticketCount } = stats;

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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[32px] font-medium tracking-tight text-black">Tổng quan Đại lý</h1>
        <p className="mt-2 text-[15px] text-gray-500">Báo cáo hiệu suất kinh doanh cho các mảng dịch vụ của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {hasHotel && <StatCard label="SỐ KHÁCH SẠN" value={hotelCount} icon={<Hotel className="w-5 h-5 text-gray-400" />} />}
        {hasTour && <StatCard label="TỔNG SỐ TOUR" value={tourCount} icon={<Map className="w-5 h-5 text-gray-400" />} />}
        {hasCar && <StatCard label="SỐ XE ĐANG CHO THUÊ" value={carCount} icon={<Car className="w-5 h-5 text-gray-400" />} />}
        {hasTicket && <StatCard label="SỰ KIỆN & VÉ" value={ticketCount} icon={<Ticket className="w-5 h-5 text-gray-400" />} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-[#eaeaea] bg-white p-6">
          <h2 className="text-[16px] font-medium text-black mb-6">Giao dịch gần đây</h2>
          <div className="flex flex-col items-center justify-center py-12">
            <span className="text-[14px] text-gray-400">Chưa có dữ liệu giao dịch</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#eaeaea] bg-white p-6">
          <h2 className="text-[16px] font-medium text-black mb-6">Doanh thu tạm tính</h2>
          <div className="flex flex-col items-center justify-center py-12">
            <span className="text-[32px] font-medium tracking-tight text-black">0 ₫</span>
            <span className="text-[13px] text-gray-500 mt-2">Chưa ghi nhận doanh thu</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#eaeaea] bg-white p-5 hover:border-black transition-colors duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-medium uppercase tracking-widest text-gray-400">{label}</div>
        {icon}
      </div>
      <div className="text-[32px] font-medium tracking-tight text-black">{value}</div>
    </div>
  );
}
