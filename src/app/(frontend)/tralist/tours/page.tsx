import { TourService } from "@/modules/traveling/services/tour.service";
import Link from "next/link";
import { MapPin, Clock, Star } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function TralistToursPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  
  // Lấy danh sách Tour đang Active, có filter theo q nếu có
  const tours = await TourService.getPublicTours(q);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Search Header */}
      <div className="mb-12">
        {q ? (
          <h1 className="text-[28px] font-bold tracking-tight text-black mb-2">
            Kết quả tìm kiếm cho "{q}"
          </h1>
        ) : (
          <h1 className="text-[36px] font-bold tracking-tight text-black mb-4">
            Tìm kiếm Tours & Trải nghiệm
          </h1>
        )}
        <p className="text-[16px] text-gray-500 max-w-2xl">
          {q ? `Tìm thấy ${tours.length} trải nghiệm phù hợp với yêu cầu của bạn.` : 'Khám phá những điểm đến tuyệt vời nhất với lịch trình được thiết kế chuẩn mực.'}
        </p>
      </div>

      {/* Grid Danh sách */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tours.map((tour) => (
          <Link 
            key={tour.id} 
            href={`/tralist/tours/${tour.id}`}
            className="group block rounded-2xl bg-white border border-[#eaeaea] overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
          >
            {/* Ảnh Cover */}
            <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
              {tour.images[0] ? (
                <img 
                  src={tour.images[0]} 
                  alt={tour.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
              {/* Badge */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                <span className="text-[12px] font-bold text-black">4.8</span>
                <span className="text-[12px] text-gray-500">(120)</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-center gap-1.5 text-gray-500 mb-2">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-[12px] font-medium">{tour.destinations.join(", ") || "Nhiều điểm đến"}</span>
              </div>
              
              <h3 className="text-[15px] font-bold text-black line-clamp-2 leading-snug mb-3 group-hover:text-indigo-600 transition-colors">
                {tour.name}
              </h3>
              
              <div className="flex items-center gap-1.5 text-gray-500 mb-4">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[12px]">{tour.durationDays} ngày {tour.durationDays - 1} đêm</span>
              </div>

              <div className="border-t border-[#eaeaea] pt-3 flex items-end justify-between">
                <div>
                  <div className="text-[11px] text-gray-500">Từ</div>
                  <div className="text-[16px] font-bold text-black">
                    {new Intl.NumberFormat('vi-VN').format(tour.basePrice)}
                    <span className="text-[12px] font-normal text-gray-500">₫</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
