"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { useRef } from "react";

export function OvHorizontalCarousel({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const move = (direction: -1 | 1) => {
    trackRef.current?.scrollBy({ left: direction * Math.min(trackRef.current.clientWidth * 0.9, 1040), behavior: "smooth" });
  };
  const keepVerticalScrollStable = () => {
    if (trackRef.current) trackRef.current.scrollLeft = trackRef.current.scrollLeft;
  };

  return (
    <div className="relative">
      <div className="mb-5 flex justify-end gap-2">
        <button type="button" onClick={() => move(-1)} aria-label="Dịch vụ trước" className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-500 transition hover:bg-orange-500 hover:text-white"><ChevronLeft className="h-5 w-5" /></button>
        <button type="button" onClick={() => move(1)} aria-label="Dịch vụ tiếp theo" className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-500 transition hover:bg-orange-500 hover:text-white"><ChevronRight className="h-5 w-5" /></button>
      </div>
      <div
        ref={trackRef}
        onWheel={(event) => {
          if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) keepVerticalScrollStable();
        }}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}
