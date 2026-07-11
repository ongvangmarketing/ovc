import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { ChevronRight, Building2, MapPin } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { HotelService } from "@/modules/traveling/services/hotel.service";

export default async function HotelDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const authData = await requireAuth();
  const { id } = await params;

  const hotel = await HotelService.getHotelDetail(authData.organizationId, id);

  if (!hotel) {
    notFound();
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-white overflow-y-auto">
      {/* Vercel-style Page Header */}
      <div className="w-full border-b border-[#eaeaea]">
        <div className="mx-auto w-full max-w-[1200px] px-8 lg:px-12 py-10">
          <div className="flex flex-col gap-8">
            
            <div className="flex items-center gap-2 text-[13px] font-medium text-gray-500">
              <Link href="/agent/hotels" className="hover:text-black transition-colors">Khách sạn</Link>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-black">{hotel.name}</span>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#eaeaea] bg-gray-50/50">
                  {hotel.logo ? (
                    <img src={hotel.logo} alt={hotel.name} className="h-full w-full object-cover rounded-full p-1" />
                  ) : (
                    <Building2 className="h-6 w-6 text-black" />
                  )}
                </div>
                <div>
                  <h1 className="text-[32px] font-medium tracking-tight text-black leading-tight mb-2">{hotel.name}</h1>
                  <div className="flex items-center gap-3 text-[14px] text-gray-500">
                    <span className="inline-flex items-center rounded-full border border-[#eaeaea] bg-white px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-black">
                      {hotel.starRating} SAO
                    </span>
                    {hotel.city && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <MapPin className="h-3.5 w-3.5" />
                        {hotel.city}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1200px] flex-1 px-8 lg:px-12 py-10">
        {children}
      </div>
    </div>
  );
}
