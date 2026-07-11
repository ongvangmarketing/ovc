import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { HotelService } from "@/modules/traveling/services/hotel.service";
import { getTenantDb } from "@/lib/db";
import InventoryCalendar from "./inventory-calendar";

export default async function HotelSchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authData = await requireAuth();
  const { id } = await params;

  const hotelData = await HotelService.getHotelDashboard(authData.organizationId!, id);
  if (!hotelData) notFound();

  // Load room types for this hotel
  const roomTypes = await getTenantDb().roomType.findMany({
    where: { hotelId: id },
    select: { id: true, name: true, basePrice: true },
  });

  return (
    <div className="w-full space-y-6 p-4">
      <div>
        <h2 className="text-[24px] font-medium tracking-tight text-black">
          Cập nhật giá & phòng
        </h2>
        <p className="text-[14px] text-gray-500">
          Quản lý số lượng phòng trống và giá bán theo từng ngày cho khách sạn {hotelData.name}.
        </p>
      </div>

      <InventoryCalendar hotelId={id} roomTypes={roomTypes} />
    </div>
  );
}
