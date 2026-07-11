import { requireAuth } from "@/lib/auth/require-auth";
import { notFound } from "next/navigation";
import TourNavigation from "./tour-navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TourService } from "@/modules/traveling/services/tour.service";

export default async function TourLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const authData = await requireAuth();
  const { id } = await params;

  const tour = await TourService.getTourDetail(authData.organizationId, id);

  if (!tour) notFound();

  return (
    <div className="flex h-full flex-col bg-[#FAFAFA]">
      <div className="flex-none bg-white">
        <div className="flex h-14 items-center px-6 border-b border-[#eaeaea]">
          <Link 
            href="/workspace/traveling/tours"
            className="flex items-center text-[13px] text-gray-500 hover:text-black transition-colors"
          >
            <ChevronLeft className="mr-1 w-4 h-4" />
            Quay lại danh sách Tour
          </Link>
          <div className="mx-4 h-4 w-[1px] bg-gray-200" />
          <h1 className="text-[14px] font-semibold text-black">
            {tour.name}
          </h1>
        </div>
        <TourNavigation tourId={id} />
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-5xl">
          {children}
        </div>
      </div>
    </div>
  );
}
