import { TourService } from "@/modules/traveling/services/tour.service";
import { notFound } from "next/navigation";
import { MapPin, Clock, Star, Share, Heart, Check, Info } from "lucide-react";
import BookingWidget from "./booking-widget";

export const dynamic = "force-dynamic";

export default async function TralistTourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const tour = await TourService.getPublicTourById(id);

  if (!tour) return notFound();

  // Parse surcharges
  let surcharges: any = {};
  if (tour.surcharges && typeof tour.surcharges === 'object') {
    surcharges = tour.surcharges;
  } else if (typeof tour.surcharges === 'string') {
    try { surcharges = JSON.parse(tour.surcharges); } catch (e) {}
  }

  return (
    <div className="bg-white pb-24">
      {/* 1. Header & Gallery */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Breadcrumb */}
        <div className="text-[13px] text-gray-500 mb-4 flex items-center gap-2">
          <span>Trang chủ</span> <span className="text-gray-300">/</span>
          <span>Tours</span> <span className="text-gray-300">/</span>
          <span className="text-black font-medium">{tour.destinations[0] || "Việt Nam"}</span>
        </div>

        {/* Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight text-black leading-tight mb-2">
              {tour.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-[14px]">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-black">4.8</span>
                <span className="text-gray-500 underline cursor-pointer">(120 đánh giá)</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-300"></div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <MapPin className="w-4 h-4" />
                {tour.destinations.join(", ")}
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-300"></div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Clock className="w-4 h-4" />
                {tour.durationDays} ngày
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#eaeaea] hover:bg-gray-50 text-[14px] font-medium transition-colors">
              <Share className="w-4 h-4" /> Chia sẻ
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#eaeaea] hover:bg-gray-50 text-[14px] font-medium transition-colors">
              <Heart className="w-4 h-4" /> Yêu thích
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-4 gap-2 h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12">
          <div className="col-span-4 md:col-span-2 h-full bg-gray-100 relative group cursor-pointer">
            {tour.images[0] && <img src={tour.images[0]} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
          </div>
          <div className="hidden md:grid col-span-2 grid-cols-2 grid-rows-2 gap-2 h-full">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-100 relative group cursor-pointer overflow-hidden">
                {tour.images[i] && <img src={tour.images[i]} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Content & Booking Widget */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column: Details */}
          <div className="flex-1 min-w-0 space-y-12">
            {/* Overview */}
            <section>
              <h2 className="text-[22px] font-bold text-black mb-4">Tổng quan</h2>
              <div className="text-[15px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                {tour.description}
              </div>
            </section>

            {/* What's Included / Excluded */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-6 rounded-2xl border border-[#eaeaea]">
              <div>
                <h3 className="text-[16px] font-bold text-black mb-4 flex items-center gap-2">
                  <span className="text-green-600">✓</span> Giá đã bao gồm
                </h3>
                <ul className="space-y-3">
                  {tour.included.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[14px] text-gray-700">
                      <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                  {tour.included.length === 0 && <li className="text-[14px] text-gray-500 italic">Chưa có thông tin</li>}
                </ul>
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-black mb-4 flex items-center gap-2">
                  <span className="text-red-500">✕</span> Giá chưa bao gồm
                </h3>
                <ul className="space-y-3">
                  {tour.excluded.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[14px] text-gray-700">
                      <XIcon className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                  {tour.excluded.length === 0 && <li className="text-[14px] text-gray-500 italic">Chưa có thông tin</li>}
                </ul>
              </div>
            </section>

            {/* Itinerary Timeline */}
            <section>
              <h2 className="text-[22px] font-bold text-black mb-6">Lịch trình chi tiết</h2>
              <div className="space-y-6">
                {tour.itineraries.map((day, i) => (
                  <div key={day.id} className="relative pl-8 md:pl-0">
                    {/* Desktop Timeline Line */}
                    <div className="hidden md:block absolute left-[39px] top-8 bottom-[-24px] w-0.5 bg-gray-200"></div>
                    
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                      {/* Day Badge */}
                      <div className="md:w-20 shrink-0 relative z-10 flex md:justify-center">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 border-2 border-indigo-100 flex flex-col items-center justify-center text-indigo-700 font-bold leading-none shadow-sm absolute -left-[40px] md:static">
                          <span className="text-[10px] uppercase font-medium">Ngày</span>
                          <span className="text-[18px]">{day.dayNumber}</span>
                        </div>
                      </div>

                      {/* Day Content */}
                      <div className="flex-1 bg-white border border-[#eaeaea] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-[18px] font-bold text-black mb-3">{day.title}</h3>
                        <p className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap mb-4">
                          {day.description}
                        </p>
                        
                        {/* Meta */}
                        <div className="flex flex-wrap gap-3">
                          {day.location && (
                            <div className="bg-gray-50 px-3 py-1.5 rounded-lg text-[13px] text-gray-600 flex items-center gap-1.5 border border-gray-100">
                              <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {day.location}
                            </div>
                          )}
                          {day.hotelName && (
                            <div className="bg-gray-50 px-3 py-1.5 rounded-lg text-[13px] text-gray-600 flex items-center gap-1.5 border border-gray-100">
                              <span className="w-3.5 h-3.5 text-purple-500 flex items-center justify-center text-[10px] border border-purple-500 rounded">H</span> 
                              {day.hotelName}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {tour.itineraries.length === 0 && (
                  <div className="text-gray-500 italic text-[14px]">Chưa có lịch trình chi tiết.</div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="sticky top-24">
              <BookingWidget tour={tour} inventories={tour.inventories} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function XIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
}
