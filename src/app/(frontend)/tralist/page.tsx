import { HotelService } from "@/modules/traveling/services/hotel.service";
import { TourService } from "@/modules/traveling/services/tour.service";
import Link from "next/link";
import { MapPin, Clock, Star } from "lucide-react";
import HeroSearch from "./hero-search";

export const dynamic = "force-dynamic";

export default async function TralistHomePage() {
  // Lấy 4 tour nổi bật để hiển thị
  const topTours = await TourService.getPublicTours();
  topTours.length = Math.min(topTours.length, 4);

  // Lấy 4 khách sạn nổi bật để hiển thị
  const topHotels = await HotelService.getPublicHotels();
  topHotels.sort((a, b) => b.starRating - a.starRating);
  topHotels.length = Math.min(topHotels.length, 4);

  return (
    <div className="bg-white">
      {/* Hero Banner Section */}
      <section className="relative h-[500px] md:h-[600px] bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20"></div>
        
        <div className="relative h-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col justify-center pb-20">
          <h1 className="text-white text-[40px] md:text-[60px] font-bold tracking-tight mb-4 drop-shadow-lg leading-tight">
            Thế giới trong <br /> tầm tay bạn
          </h1>
          <p className="text-white/90 text-[16px] md:text-[20px] max-w-2xl drop-shadow-md">
            Khám phá hàng ngàn khách sạn, tour du lịch và trải nghiệm tuyệt vời cùng Tralist. Đặt phòng nhanh chóng, an toàn.
          </p>
        </div>
      </section>

      {/* Interactive Search Widget (pulls up over the hero) */}
      <HeroSearch />

      {/* Hot Destinations Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="mb-10">
          <h2 className="text-[28px] font-bold text-black mb-2 tracking-tight">Điểm đến thịnh hành</h2>
          <p className="text-[16px] text-gray-500">Các lựa chọn phổ biến nhất cho chuyến đi tiếp theo của bạn</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
          {[
            { name: "Đà Lạt", count: "1,204 chỗ ở" },
            { name: "Đà Nẵng", count: "856 chỗ ở" },
            { name: "Phú Quốc", count: "932 chỗ ở" },
            { name: "Nha Trang", count: "740 chỗ ở" },
            { name: "Hà Nội", count: "1,500+ chỗ ở" },
            { name: "Hồ Chí Minh", count: "2,000+ chỗ ở" },
            { name: "Sapa", count: "420 chỗ ở" },
            { name: "Hội An", count: "630 chỗ ở" },
            { name: "Vũng Tàu", count: "512 chỗ ở" },
            { name: "Hạ Long", count: "890 chỗ ở" }
          ].map((dest, i) => (
            <div key={dest.name} className="group relative h-[200px] md:h-[250px] rounded-2xl overflow-hidden cursor-pointer">
              <img 
                src={`https://source.unsplash.com/random/400x600/?${encodeURIComponent(dest.name)},travel`} 
                alt={dest.name} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white font-bold text-[18px] drop-shadow-md">{dest.name}</h3>
                <p className="text-white/80 text-[12px]">{dest.count}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Tours Section */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-[28px] font-bold text-black mb-2 tracking-tight">Tours & Trải nghiệm Đang Hot</h2>
              <p className="text-[16px] text-gray-500">Đặt ngay những trải nghiệm không thể bỏ lỡ</p>
            </div>
            <Link href="/tralist/tours" className="hidden md:flex text-[14px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              Xem tất cả Tours &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topTours.map((tour) => (
              <Link 
                key={tour.id} 
                href={`/tralist/tours/${tour.id}`}
                className="group block rounded-2xl bg-white border border-[#eaeaea] overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                  {tour.images[0] && (
                    <img 
                      src={tour.images[0]} 
                      alt={tour.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-[12px] font-bold text-black">4.8</span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-1.5 text-gray-500 mb-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-[12px] font-medium">{tour.destinations[0] || "Nhiều điểm đến"}</span>
                  </div>
                  
                  <h3 className="text-[15px] font-bold text-black line-clamp-2 leading-snug mb-3 group-hover:text-indigo-600 transition-colors">
                    {tour.name}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-gray-500 mb-4">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[12px]">{tour.durationDays} ngày {tour.durationDays - 1} đêm</span>
                  </div>

                  <div className="border-t border-[#eaeaea] pt-3">
                    <div className="text-[11px] text-gray-500">Từ</div>
                    <div className="text-[16px] font-bold text-black">
                      {new Intl.NumberFormat('vi-VN').format(tour.basePrice)}
                      <span className="text-[12px] font-normal text-gray-500">₫</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Link href="/tralist/tours" className="inline-flex items-center justify-center h-12 px-6 rounded-full border border-[#eaeaea] text-[14px] font-bold text-black bg-white hover:bg-gray-50 transition-colors w-full">
              Xem tất cả Tours
            </Link>
          </div>
        </div>
      </section>
      {/* Featured Hotels Section */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-[28px] font-bold text-black mb-2 tracking-tight">Khách sạn Nổi Bật</h2>
              <p className="text-[16px] text-gray-500">Chỗ nghỉ dưỡng tuyệt vời với giá tốt nhất</p>
            </div>
            <Link href="/tralist/hotels" className="hidden md:flex text-[14px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              Xem tất cả Khách sạn &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topHotels.map((hotel) => {
              const lowestPrice = hotel.roomTypes[0]?.basePrice || 0;
              return (
                <Link 
                  key={hotel.id} 
                  href={`/tralist/hotels/${hotel.id}`}
                  className="group block rounded-2xl bg-white border border-[#eaeaea] overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                    {hotel.images[0] && (
                      <img 
                        src={hotel.images[0]} 
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    {hotel.starRating > 0 && (
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1">
                        {Array(hotel.starRating).fill(0).map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-[12px] font-medium line-clamp-1">{hotel.address}</span>
                      </div>
                      <div className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        8.5 Tuyệt vời
                      </div>
                    </div>
                    
                    <h3 className="text-[15px] font-bold text-black line-clamp-2 leading-snug mb-4 group-hover:text-indigo-600 transition-colors">
                      {hotel.name}
                    </h3>

                    <div className="border-t border-[#eaeaea] pt-3">
                      <div className="text-[11px] text-gray-500">Giá mỗi đêm từ</div>
                      <div className="text-[16px] font-bold text-black text-red-500">
                        {new Intl.NumberFormat('vi-VN').format(lowestPrice)}
                        <span className="text-[12px] font-normal text-gray-500">₫</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Link href="/tralist/hotels" className="inline-flex items-center justify-center h-12 px-6 rounded-full border border-[#eaeaea] text-[14px] font-bold text-black bg-white hover:bg-gray-50 transition-colors w-full">
              Xem tất cả Khách sạn
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
