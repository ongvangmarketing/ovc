import { requireAuth } from "@/lib/auth/require-auth";
import { notFound } from "next/navigation";
import TourInfoForm from "./tour-info-form";
import { Metadata } from "next";
import { TourService } from "@/modules/traveling/services/tour.service";

export const metadata: Metadata = {
  title: "Tổng quan Tour",
};

export default async function TourOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const authData = await requireAuth();
  const { id: tourId } = await params;
  
  const tour = await TourService.getTourDetail(authData.organizationId, tourId);

  if (!tour) return notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h2 className="text-[24px] font-medium tracking-tight text-black">
          Cấu hình chung
        </h2>
        <p className="text-[14px] text-gray-500">
          Quản lý thông tin, hình ảnh và chính sách của gói Tour này.
        </p>
      </div>
      <TourInfoForm tour={tour} />
    </div>
  );
}
