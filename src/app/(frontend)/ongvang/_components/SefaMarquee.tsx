"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const items = ["NÂNG TẦM THƯƠNG HIỆU", "MARKETING & TRAINING", "TĂNG TRƯỞNG BỀN VỮNG", "ONG VÀNG", "DIGITAL MARKETING", "AI ỨNG DỤNG"];

export function SefaMarquee({ dark = false }: { dark?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className={`relative overflow-hidden py-5 ${dark ? "bg-[#111]" : "bg-white border-y border-black/[0.06]"}`}>
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 22, ease: "linear", repeat: Infinity }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-12 shrink-0">
            <span className={`text-[13px] font-black uppercase tracking-[0.2em] ${dark ? "text-white/90" : "text-[#111]"}`}>
              {item}
            </span>
            <span className="text-[#e63329] text-xl font-black">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
