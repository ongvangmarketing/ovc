"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface CounterStatProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  duration?: number;
}

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function CounterStat({
  value,
  suffix = "",
  prefix = "",
  label,
  duration = 2000,
}: CounterStatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });
  const [count, setCount] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!isInView || startedRef.current) return;
    startedRef.current = true;

    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(value);
    };
    requestAnimationFrame(tick);
  }, [isInView, value, duration]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-5xl font-black tracking-tight text-stone-900 sm:text-6xl lg:text-7xl">
        <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
          {prefix}{count.toLocaleString("vi-VN")}{suffix}
        </span>
      </div>
      <p className="mt-3 text-sm font-medium text-stone-500 sm:text-base">{label}</p>
    </div>
  );
}
