"use client";

import { useRef, ReactNode } from "react";
import { motion, useInView } from "framer-motion";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
  once?: boolean;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-80px 0px" });

  const initial: Record<string, string | number> = {
    opacity: 0,
    filter: "blur(4px)",
  };
  if (direction === "up") initial.y = 40;
  if (direction === "left") initial.x = -40;
  if (direction === "right") initial.x = 40;

  const animate =
    isInView
      ? { opacity: 1, y: 0, x: 0, filter: "blur(0px)" }
      : initial;

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
