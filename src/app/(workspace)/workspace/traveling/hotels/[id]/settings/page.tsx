import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import HotelInfoForm from "../hotel-info-form";
import { HotelService } from "@/modules/traveling/services/hotel.service";

export default async function HotelOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authData = await requireAuth();
  const { id } = await params;

  const hotel = await HotelService.getHotelDetail(authData.organizationId, id);

  if (!hotel) {
    notFound();
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-[20px] font-medium tracking-tight text-black mb-1">Cấu hình Tổng quan</h2>
        <p className="text-[14px] text-gray-500">
          Thiết lập thông tin chung, hình ảnh và chính sách của khách sạn.
        </p>
      </div>

      <HotelInfoForm hotel={hotel} />
    </div>
  );
}
