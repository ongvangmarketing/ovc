import { requireAuth } from "@/lib/auth/require-auth";
import RoomTypesClient from "./room-types-client";
import { HotelService } from "@/modules/traveling/services/hotel.service";

export default async function RoomTypesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authData = await requireAuth();
  const { id: hotelId } = await params;

  const roomTypes = await HotelService.getHotelRoomTypes(authData.organizationId, hotelId);

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-medium text-black">Loại phòng & Giá</h2>
          <p className="text-[14px] text-gray-500">
            Quản lý các hạng phòng, bảng giá và sức chứa.
          </p>
        </div>
      </div>

      <RoomTypesClient hotelId={hotelId} initialRoomTypes={roomTypes} />
    </div>
  );
}
