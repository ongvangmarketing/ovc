"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const fallbackServices = [
  {
    category: "Brand Strategy",
    items: ["Tư vấn Chiến lược Thương hiệu", "Tái Định vị Thương hiệu", "Kiến trúc Thương hiệu", "Nhận diện Thương hiệu", "Mở rộng Thương hiệu", "Phát triển Thương hiệu mới", "Định giá Thương hiệu"],
  },
  {
    category: "Brand Marketing Strategy",
    items: ["Tư vấn Chiến lược Marketing", "Phát triển Sản phẩm mới", "Tư vấn Chiến lược Truyền thông", "Kích hoạt Thương hiệu", "Lập Kế hoạch Marketing"],
  },
  {
    category: "Brand Identity",
    items: ["Logo Thương hiệu", "Bao bì Sản phẩm", "Bộ nhận diện Thương hiệu", "Thiết kế Website", "Thiết kế UI/UX"],
  },
  {
    category: "Digital Marketing",
    items: ["Dịch vụ SEO tổng thể", "Content Marketing", "Mobile App Marketing", "Affiliate Marketing", "Lead Generation"],
  },
  {
    category: "Advertising",
    items: ["Facebook Ads", "Google Ads", "TikTok Ads", "Zalo Ads"],
  },
  {
    category: "MarCom & Media",
    items: ["PR Báo chí", "Influencer Marketing", "Sản xuất Video Marketing", "Sản xuất Phim Quảng cáo", "In ấn & Quà tặng"],
  },
];

type AccordionService = {
  category: string;
  items: string[];
};

export function SefaServicesAccordion({ services = fallbackServices }: { services?: AccordionService[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-black/[0.08]">
      {services.map((svc, i) => (
        <div key={svc.category}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="group flex w-full items-center justify-between py-6 text-left transition-colors hover:text-[#e63329]"
          >
            <span className={`text-xl font-bold lg:text-2xl ${open === i ? "text-[#e63329]" : "text-[#111]"}`}>
              {svc.category}
            </span>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all ${
              open === i ? "border-[#e63329] bg-[#e63329] text-white rotate-45" : "border-black/20 text-[#111] group-hover:border-[#e63329] group-hover:text-[#e63329]"
            }`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 gap-1 pb-6 sm:grid-cols-2 lg:grid-cols-3">
                  {svc.items.map((item) => (
                    <Link
                      key={item}
                      href="/ongvang/lien-he"
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[15px] text-[#555] transition-all hover:bg-[#e63329]/5 hover:text-[#e63329]"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#e63329]" />
                      {item}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
