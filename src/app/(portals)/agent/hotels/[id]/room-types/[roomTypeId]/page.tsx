import { notFound } from "next/navigation";
import RoomTypeForm from "./room-type-form";
import { requireAuth } from "@/lib/auth/require-auth";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { HotelService } from "@/modules/traveling/services/hotel.service";

export default async function RoomTypeDetailPage({ params }: { params: Promise<{ id: string; roomTypeId: string }> }) {
  const authData = await requireAuth();
  const { id, roomTypeId } = await params;
  
  const hotel = await HotelService.getHotelDetail(authData.organizationId, id);
  
  if (!hotel) notFound();

  let roomType = null;
  if (roomTypeId !== "new") {
    roomType = await HotelService.getRoomTypeDetail(authData.organizationId, id, roomTypeId);
    if (!roomType) notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link 
          href={`/agent/hotels/${id}/room-types`}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-[20px] font-semibold text-gray-900">
            {roomType ? "Chỉnh sửa Hạng phòng" : "Thêm Hạng phòng mới"}
          </h1>
          <p className="text-[14px] text-gray-500">
            {hotel.name}
          </p>
        </div>
      </div>

      <RoomTypeForm hotelId={id} initialData={roomType} />
    </div>
  );
}
