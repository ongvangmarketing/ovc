import { requireAuth } from "@/lib/auth/require-auth";
import { notFound } from "next/navigation";
import TourInventoryCalendar from "./inventory-calendar";
import { Metadata } from "next";
import { TourService } from "@/modules/traveling/services/tour.service";

export const metadata: Metadata = {
  title: "Lịch & Chỗ",
};

export default async function TourSchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authData = await requireAuth();
  const { id } = await params;

  const tour = await TourService.getTourDetail(authData.organizationId, id);

  if (!tour) return notFound();

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex flex-col gap-4">
        <h2 className="text-[24px] font-medium tracking-tight text-black">
          Lịch & Chỗ (Inventory)
        </h2>
        <p className="text-[14px] text-gray-500 max-w-2xl">
          Quản lý số lượng chỗ mở bán (Allotment) và giá cả linh hoạt theo từng ngày. 
          Kéo thả chuột trên lịch để chọn nhiều ngày cùng lúc và cập nhật nhanh, 
          hoặc dùng nút <strong>Cập nhật hàng loạt</strong> cho các thao tác phức tạp.
        </p>
      </div>

      <TourInventoryCalendar tour={tour} />
    </div>
  );
}
