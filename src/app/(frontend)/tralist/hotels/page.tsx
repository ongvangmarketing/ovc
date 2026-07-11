import { HotelService } from "@/modules/traveling/services/hotel.service";
import Link from "next/link";
import { MapPin, Star, Wifi, Coffee, Map } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TralistHotelsPage() {
  const hotels = await HotelService.getPublicHotels();

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header Search Info */}
      <div className="bg-indigo-600 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-[32px] font-bold mb-2">Tìm Khách sạn hoàn hảo</h1>
          <p className="text-white/80">Hàng ngàn chỗ nghỉ tuyệt vời đang chờ đón bạn.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 flex flex-col md:flex-row gap-8">
        {/* Left Sidebar (Filters) */}
        <div className="w-full md:w-[280px] shrink-0">
          <div className="bg-white rounded-2xl p-6 border border-[#eaeaea] sticky top-24">
            <h3 className="text-[16px] font-bold text-black mb-4 pb-4 border-b border-[#eaeaea]">Lọc kết quả</h3>
            
            <div className="mb-6">
              <label className="text-[13px] font-bold text-black mb-3 block">Mức giá mỗi đêm</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600" />
                  <span className="text-[13px] text-gray-600">Dưới 1.000.000₫</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600" />
                  <span className="text-[13px] text-gray-600">1.000.000₫ - 3.000.000₫</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600" />
                  <span className="text-[13px] text-gray-600">Trên 3.000.000₫</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-[13px] font-bold text-black mb-3 block">Xếp hạng sao</label>
              <div className="flex gap-2">
                {[3,4,5].map(star => (
                  <button key={star} className="flex-1 py-1.5 border border-[#eaeaea] rounded-lg text-[13px] font-medium text-gray-600 hover:border-indigo-600 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1">
                    {star} <Star className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Content (Listings) */}
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[18px] font-bold text-black">Tìm thấy {hotels.length} khách sạn</h2>
            <select className="border border-[#eaeaea] rounded-lg px-3 py-2 text-[13px] text-gray-600 outline-none bg-white cursor-pointer">
              <option>Đề xuất</option>
              <option>Giá thấp nhất</option>
              <option>Đánh giá cao nhất</option>
            </select>
          </div>

          {hotels.map(hotel => {
            const lowestPrice = hotel.roomTypes[0]?.basePrice || 0;
            const amenities = hotel.amenities || [];
            
            return (
              <div key={hotel.id} className="bg-white rounded-2xl border border-[#eaeaea] overflow-hidden flex flex-col md:flex-row hover:shadow-lg transition-shadow group">
                <div className="w-full md:w-[300px] h-[200px] md:h-auto relative bg-gray-100 shrink-0">
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

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div>
                      <h3 className="text-[20px] font-bold text-black group-hover:text-indigo-600 transition-colors">{hotel.name}</h3>
                      <div className="flex items-center gap-1.5 text-gray-500 text-[13px] mt-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="line-clamp-1">{hotel.address}</span>
                        <a href="#" className="text-indigo-600 font-medium whitespace-nowrap ml-1">Xem bản đồ</a>
                      </div>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-1.5 flex flex-col items-center shrink-0">
                      <div className="text-[14px] font-bold text-indigo-700">8.5</div>
                      <div className="text-[10px] text-indigo-600">Tuyệt vời</div>
                    </div>
                  </div>

                  {/* Amenities (Max 4) */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {amenities.slice(0, 4).map((am, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-50 rounded text-[11px] text-gray-600 border border-gray-100">
                        {am}
                      </span>
                    ))}
                    {amenities.length > 4 && (
                      <span className="px-2 py-1 bg-gray-50 rounded text-[11px] text-gray-600 border border-gray-100">
                        +{amenities.length - 4}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-4 flex items-end justify-between">
                    <div className="text-[12px] text-green-600 font-medium flex items-center gap-1">
                      <CheckIcon className="w-3.5 h-3.5" /> Miễn phí hủy phòng
                    </div>
                    <div className="text-right">
                      <div className="text-[12px] text-gray-500">1 đêm, 2 người lớn</div>
                      <div className="text-[22px] font-bold text-black text-red-500">
                        {new Intl.NumberFormat('vi-VN').format(lowestPrice)}₫
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Đã bao gồm thuế và phí</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          
          {hotels.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-[#eaeaea]">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Map className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-[18px] font-bold text-black mb-2">Chưa có khách sạn nào</h3>
              <p className="text-gray-500 text-[14px]">Vui lòng quay lại sau.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
}
