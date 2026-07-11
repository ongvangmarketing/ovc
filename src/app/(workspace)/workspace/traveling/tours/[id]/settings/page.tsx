import { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { TourService } from "@/modules/traveling/services/tour.service";

export const metadata: Metadata = {
  title: "Cài đặt & Bảng giá",
};

export default async function TourSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authData = await requireAuth();
  const { id } = await params;

  const tour = await TourService.getTourDetail(authData.organizationId!, id);

  if (!tour) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h2 className="text-[24px] font-medium tracking-tight text-black">
          Cài đặt & Bảng giá
        </h2>
        <p className="text-[14px] text-gray-500">
          (Đang phát triển) Phần này sẽ chứa cấu hình giá chi tiết theo từng đợt khởi hành, cấu hình độ tuổi, và các tùy chọn nâng cao.
        </p>
      </div>
      <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
        Giao diện chỉnh sửa thông tin Tour đang được xây dựng.
      </div>
    </div>
  );
}
