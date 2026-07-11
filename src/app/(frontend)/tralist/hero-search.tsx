"use client";

import { useState } from "react";
import { Search, MapPin, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HeroSearch() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [date, setDate] = useState("");

  const POPULAR_DESTINATIONS = [
    "Đà Lạt", "Đà Nẵng", "Phú Quốc", "Nha Trang", "Hà Nội", 
    "Hồ Chí Minh", "Sapa", "Hội An", "Vũng Tàu", "Hạ Long"
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Chuyển hướng tới trang tìm kiếm chung, hoặc tạm thời về Tours
    router.push(`/tralist/tours?q=${encodeURIComponent(location)}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto -mt-16 relative z-10 px-4 md:px-0">
      <div className="bg-white/90 backdrop-blur-xl rounded-full shadow-2xl p-2 md:p-3 border border-white/50">
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-2">
          
          <div className="flex-[2] w-full bg-transparent flex items-center px-6 py-3 md:py-4 relative">
            <MapPin className="w-6 h-6 text-indigo-600 shrink-0" />
            <div className="ml-4 w-full">
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                placeholder="Bạn muốn đi đâu?" 
                className="w-full bg-transparent text-[16px] md:text-[18px] font-medium text-black outline-none placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>
            
            {/* Dropdown 10 điểm đến */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 p-2">
                <div className="px-4 py-2 text-[12px] font-bold text-gray-400 uppercase tracking-wider">Điểm đến phổ biến</div>
                <div className="grid grid-cols-2 gap-1">
                  {POPULAR_DESTINATIONS.map(dest => (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => {
                        setLocation(dest);
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl text-left transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-[15px] font-medium text-black">{dest}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:block w-[1px] h-10 bg-gray-200"></div>

          <div className="flex-[1.5] w-full bg-transparent flex items-center px-6 py-3 md:py-4 border-t md:border-t-0 border-gray-100 relative">
            <CalendarDays className="w-6 h-6 text-indigo-600 shrink-0" />
            <div className="ml-4 w-full relative">
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="Khi nào đi?" 
                className="w-full bg-transparent text-[16px] md:text-[18px] font-medium text-black outline-none placeholder:text-gray-400 placeholder:font-normal cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            </div>
          </div>

          <button type="submit" className="w-full md:w-auto h-[56px] md:h-[64px] px-10 bg-black hover:bg-gray-800 text-white rounded-full flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0">
            <Search className="w-5 h-5" />
            <span className="font-bold text-[16px] md:text-[18px]">Tìm kiếm</span>
          </button>

        </form>

      </div>
    </div>
  );
}
