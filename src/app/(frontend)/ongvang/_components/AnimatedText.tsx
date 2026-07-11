"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  staggerChildren?: number;
  splitBy?: "words" | "chars";
  once?: boolean;
}

export function AnimatedText({
  text,
  className = "",
  delay = 0,
  staggerChildren = 0.04,
  splitBy = "words",
  once = true,
}: AnimatedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, margin: "-50px 0px" });
  const controls = useAnimation();

  const tokens =
    splitBy === "words"
      ? text.split(" ")
      : text.split("");

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren,
        delayChildren: delay,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
    },
  };

  return (
    <motion.span
      ref={ref}
      className={`inline-block ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={controls}
      style={{ overflow: "hidden", display: "block" }}
    >
      {tokens.map((token, i) => (
        <motion.span
          key={i}
          variants={childVariants}
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          {token}
          {splitBy === "words" && i < tokens.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}
