import { requireAuth } from "@/lib/auth/require-auth";
import InventoryCalendar from "./inventory-calendar";
import { HotelService } from "@/modules/traveling/services/hotel.service";

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authData = await requireAuth();
  const { id: hotelId } = await params;

  // Lấy các hạng phòng của khách sạn
  const roomTypes = await HotelService.getHotelRoomTypes(authData.organizationId, hotelId, true);

  return (
    <div className="max-w-full">
      <div className="mb-6">
        <h2 className="text-[20px] font-medium text-black">Lưới Lịch Inventory</h2>
        <p className="text-[14px] text-gray-500">
          Kéo thả chuột ngang trên các ô để bôi đen nhiều ngày liên tục. Cập nhật giá và mở bán phòng nhanh chóng như Agoda YCS.
        </p>
      </div>

      <InventoryCalendar hotelId={hotelId} roomTypes={roomTypes} />
    </div>
  );
}
