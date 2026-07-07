"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Real testimonials from sefamedia.vn
const testimonials = [
  {
    quote: "Hệ thống Automation Marketing do đội ngũ triển khai đã mang lại một trải nghiệm xuất sắc. 85% khách hàng quan trọng liên hệ lại với chúng tôi — ngoài sự mong đợi hoàn toàn.",
    author: "Giám đốc Agribank Tây Đô",
    company: "Agribank",
    result: "+85% khách hàng liên hệ lại",
  },
  {
    quote: "Đội ngũ không chỉ thể hiện sự chuyên nghiệp mà còn có tinh thần làm việc không ngừng, không ngần ngại ngày đêm để hoàn thành dự án trong thời gian gấp gáp.",
    author: "Đại diện Ban Lãnh đạo",
    company: "MB Bank",
    result: "Kết quả ấn tượng, đúng kỳ vọng",
  },
  {
    quote: "Doanh thu từ các cửa hàng Offline đã tăng lên gấp đôi chỉ sau 4 tháng triển khai chiến lược Kích hoạt thương hiệu trên các điểm bán quan trọng.",
    author: "CEO Ding Tea Vietnam",
    company: "Ding Tea",
    result: "x2 doanh thu Offline trong 4 tháng",
  },
  {
    quote: "Lượng traffic của thương hiệu chưa bao giờ đạt đến mức cao như trong dự án này. Tinh thần làm việc của đội ngũ rất nhiệt huyết — hợp tác trở nên rất yên tâm.",
    author: "Marketing Director",
    company: "Vua Nệm",
    result: "Traffic kỷ lục từ trước đến nay",
  },
  {
    quote: "Chiến dịch Xúc tiến nội bộ đã có ảnh hưởng trực tiếp và tích cực — kết quả tăng trưởng doanh thu lên đến 138% đã thay đổi quan điểm của chúng tôi.",
    author: "Giám đốc Kinh doanh",
    company: "Khách hàng Doanh nghiệp",
    result: "+138% doanh thu",
  },
  {
    quote: "The team's creativity and attention to detail have brought a fresh perspective to our digital marketing efforts, leading to a notable increase in brand visibility and customer reach.",
    author: "International Partner",
    company: "Foreign Enterprise",
    result: "Significant brand visibility increase",
  },
];

export function SefaTestimonials() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const t = testimonials[current] || testimonials[0];

  if (!t) return null;

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
          className="mx-auto max-w-3xl text-center"
        >
          {/* Quote mark */}
          <div className="mb-6 text-7xl font-black leading-none text-[#e63329]/20">&ldquo;</div>
          <p className="mb-8 text-lg font-medium leading-relaxed text-[#333] lg:text-xl">{t.quote}</p>
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#e63329] to-[#ff6b35] flex items-center justify-center text-white text-sm font-bold">
              {t.company.charAt(0)}
            </div>
            <p className="font-bold text-[#111]">{t.author}</p>
            <p className="text-sm text-[#999]">{t.company}</p>
            <span className="mt-1 rounded-full bg-[#e63329]/10 px-4 py-1.5 text-xs font-bold text-[#e63329]">
              {t.result}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="mt-10 flex justify-center gap-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${i === current ? "bg-[#e63329] w-8" : "bg-black/10 w-2 hover:bg-black/20"}`}
          />
        ))}
      </div>
    </div>
  );
}
