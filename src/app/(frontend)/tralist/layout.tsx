import { Metadata } from "next";
import Link from "next/link";
import { Search, User, Globe, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Tralist - Đặt Tour, Khách sạn, Trải nghiệm",
  description: "Nền tảng đặt tour, phòng khách sạn và các trải nghiệm du lịch tuyệt vời.",
};

export default function TralistLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      {/* Header B2C */}
      <header className="sticky top-0 z-50 w-full border-b border-[#eaeaea] bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <Link href="/tralist" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="text-[20px] font-bold tracking-tight text-black">Tralist</span>
              </Link>
            </div>

            {/* Navigation (Desktop) */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/tralist/tours" className="text-[14px] font-medium text-black hover:text-indigo-600 transition-colors">
                Tours & Trải nghiệm
              </Link>
              <Link href="/tralist/hotels" className="text-[14px] font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                Khách sạn
              </Link>
              <Link href="/tralist/tickets" className="text-[14px] font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                Vé tham quan
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button className="hidden sm:flex items-center gap-1.5 text-[14px] font-medium text-gray-700 hover:text-black">
                <Globe className="w-4 h-4" />
                VND
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eaeaea] bg-white hover:bg-gray-50 transition-colors">
                <Search className="w-4 h-4 text-black" />
              </button>
              <button className="flex h-9 items-center justify-center gap-2 rounded-full bg-black px-4 text-[13px] font-medium text-white hover:bg-gray-800 transition-colors shadow-sm">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer B2C */}
      <footer className="bg-white border-t border-[#eaeaea] py-12 mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                  <span className="text-white font-bold text-[12px]">T</span>
                </div>
                <span className="text-[16px] font-bold tracking-tight text-black">Tralist</span>
              </div>
              <p className="text-[14px] text-gray-500 leading-relaxed">
                Khám phá thế giới cùng Tralist. Đặt tour, khách sạn và vé tham quan dễ dàng, giá tốt nhất.
              </p>
            </div>
            
            <div>
              <h4 className="text-[14px] font-bold text-black mb-4">Sản phẩm</h4>
              <ul className="space-y-3 text-[14px] text-gray-500">
                <li><Link href="/tralist/tours" className="hover:text-black">Tours & Trải nghiệm</Link></li>
                <li><Link href="/tralist/hotels" className="hover:text-black">Khách sạn</Link></li>
                <li><Link href="/tralist/cars" className="hover:text-black">Thuê xe</Link></li>
                <li><Link href="/tralist/tickets" className="hover:text-black">Vé vui chơi</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[14px] font-bold text-black mb-4">Hỗ trợ</h4>
              <ul className="space-y-3 text-[14px] text-gray-500">
                <li><Link href="#" className="hover:text-black">Trung tâm trợ giúp</Link></li>
                <li><Link href="#" className="hover:text-black">Chính sách bảo mật</Link></li>
                <li><Link href="#" className="hover:text-black">Điều khoản sử dụng</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[14px] font-bold text-black mb-4">Liên hệ</h4>
              <ul className="space-y-3 text-[14px] text-gray-500">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Hà Nội, Việt Nam
                </li>
                <li>hotline@tralist.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#eaeaea] mt-12 pt-8 text-center text-[13px] text-gray-400">
            © {new Date().getFullYear()} Tralist. Powered by Ong Vang Cloud.
          </div>
        </div>
      </footer>
    </div>
  );
}
