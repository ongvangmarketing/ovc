"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { ReactNode } from "react";

export function AiReveal({ children, className = "", delay = 0, y = 24 }: {
  children: ReactNode; className?: string; delay?: number; y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y, filter: "blur(4px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
