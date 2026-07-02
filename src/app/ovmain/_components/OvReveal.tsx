"use client";
import { useRef, ReactNode } from "react";
import { motion, useInView } from "framer-motion";

export function OvReveal({ children, className = "", delay = 0, direction = "up" }: {
  children: ReactNode; className?: string; delay?: number; direction?: "up" | "left" | "right" | "none";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  const initial: Record<string, string | number> = { opacity: 0 };
  if (direction === "up") initial.y = 18;
  if (direction === "left") initial.x = -18;
  if (direction === "right") initial.x = 18;
  const animate = inView ? { opacity: 1, y: 0, x: 0 } : initial;
  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{ duration: 0.38, delay: Math.min(delay, 0.18), ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
