import { HotelService } from "@/modules/traveling/services/hotel.service";
import { notFound } from "next/navigation";
import { MapPin, Star, Share, Heart, Check, Wifi, Coffee, Users, Info } from "lucide-react";
import BookingWidget from "./booking-widget";

export const dynamic = "force-dynamic";

export default async function TralistHotelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const hotel = await HotelService.getPublicHotelById(id);

  if (!hotel) return notFound();

  const amenities = Array.isArray(hotel.amenities) ? hotel.amenities as string[] : [];
  const images = Array.isArray(hotel.images) ? hotel.images as string[] : [];

  return (
    <div className="bg-white pb-24">
      {/* 1. Header & Gallery */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Breadcrumb */}
        <div className="text-[13px] text-gray-500 mb-4 flex items-center gap-2">
          <span>Trang chủ</span> <span className="text-gray-300">/</span>
          <span>Khách sạn</span> <span className="text-gray-300">/</span>
          <span className="text-black font-medium">{hotel.name}</span>
        </div>

        {/* Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight text-black leading-tight">
                {hotel.name}
              </h1>
              {hotel.starRating > 0 && (
                <div className="flex items-center gap-0.5 bg-yellow-50 px-2 py-1 rounded-md">
                  {Array(hotel.starRating).fill(0).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 text-[14px] text-gray-600">
              <MapPin className="w-4 h-4" />
              {hotel.address}
              <a href="#" className="text-indigo-600 font-medium ml-2 hover:underline">Xem bản đồ</a>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#eaeaea] hover:bg-gray-50 text-[14px] font-medium transition-colors">
              <Share className="w-4 h-4" /> Chia sẻ
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#eaeaea] hover:bg-gray-50 text-[14px] font-medium transition-colors">
              <Heart className="w-4 h-4" /> Lưu lại
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-4 gap-2 h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12">
          <div className="col-span-4 md:col-span-2 h-full bg-gray-100 relative group cursor-pointer">
            {images[0] && <img src={images[0]} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
          </div>
          <div className="hidden md:grid col-span-2 grid-cols-2 grid-rows-2 gap-2 h-full">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-100 relative group cursor-pointer overflow-hidden">
                {images[i] && <img src={images[i]} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column: Details */}
          <div className="flex-1 min-w-0 space-y-12">
            
            {/* Overview */}
            <section>
              <h2 className="text-[22px] font-bold text-black mb-4">Tổng quan chỗ nghỉ</h2>
              <div className="text-[15px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                {hotel.description || "Chưa có thông tin mô tả cho khách sạn này."}
              </div>
            </section>

            {/* Amenities */}
            {amenities.length > 0 && (
              <section>
                <h2 className="text-[22px] font-bold text-black mb-6">Tiện ích nổi bật</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                  {amenities.map((am, i) => (
                    <div key={i} className="flex items-center gap-3 text-[15px] text-gray-700">
                      <Check className="w-5 h-5 text-green-600" />
                      {am}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Room Types */}
            <section id="rooms">
              <h2 className="text-[22px] font-bold text-black mb-6">Phòng trống</h2>
              <div className="space-y-6">
                {hotel.roomTypes.map(room => {
                  const roomImages = Array.isArray(room.images) ? room.images as string[] : [];
                  const roomAmenities = Array.isArray(room.amenities) ? room.amenities as string[] : [];
                  
                  return (
                    <div key={room.id} className="border border-[#eaeaea] rounded-2xl overflow-hidden flex flex-col md:flex-row bg-white">
                      {/* Room Image */}
                      <div className="w-full md:w-[280px] h-[200px] md:h-auto bg-gray-100 relative shrink-0">
                        {roomImages[0] ? (
                          <img src={roomImages[0]} alt={room.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                        )}
                      </div>
                      
                      {/* Room Info */}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-[18px] font-bold text-black">{room.name}</h3>
                          <div className="flex items-center gap-1 text-[13px] text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                            <Users className="w-4 h-4" /> Tối đa {room.capacity} khách
                          </div>
                        </div>
                        
                        <p className="text-[13px] text-gray-600 line-clamp-2 mb-4">
                          {room.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {roomAmenities.slice(0, 4).map((am, i) => (
                            <span key={i} className="text-[12px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">
                              {am}
                            </span>
                          ))}
                        </div>

                        <div className="mt-auto flex items-end justify-between border-t border-[#eaeaea] pt-4">
                          <div>
                            <div className="text-[18px] font-bold text-red-500">
                              {new Intl.NumberFormat('vi-VN').format(room.basePrice)}₫
                            </div>
                            <div className="text-[11px] text-gray-500">/ phòng / đêm</div>
                          </div>
                          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl transition-colors">
                            Chọn phòng
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {hotel.roomTypes.length === 0 && (
                  <div className="text-center py-12 border border-[#eaeaea] rounded-2xl bg-gray-50">
                    <p className="text-gray-500">Khách sạn chưa cập nhật hạng phòng nào.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="w-full lg:w-[350px] shrink-0">
            <div className="sticky top-24">
              <BookingWidget hotel={hotel} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
