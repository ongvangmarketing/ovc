"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface CourseCardProps {
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  price: number;
  currency?: string;
  level: string;
  duration?: number | null;
  tags?: string[];
  index: number;
  href?: string;
}

const levelColors: Record<string, string> = {
  beginner: "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30",
  intermediate: "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30",
  advanced: "bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/30",
};

const levelLabels: Record<string, string> = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

export function CourseCard({
  title,
  description,
  thumbnail,
  price,
  currency = "VND",
  level,
  duration,
  tags = [],
  index,
  href = "/ongvang/khoa-hoc",
}: CourseCardProps) {
  const formattedPrice =
    price > 0
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency,
          maximumFractionDigits: 0,
        }).format(price)
      : "Miễn phí";

  const durationText = duration
    ? duration >= 60
      ? `${Math.floor(duration / 60)}h${duration % 60 > 0 ? ` ${duration % 60}m` : ""}`
      : `${duration}m`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px 0px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-sm shadow-amber-50 transition-all hover:border-orange-200 hover:shadow-md hover:shadow-amber-100"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-amber-900/30 to-slate-800">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg className="h-16 w-16 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>
          </div>
        )}
        {/* Level badge */}
        <span className={`absolute top-3 left-3 rounded-lg px-2.5 py-1 text-xs font-semibold backdrop-blur-sm ${levelColors[level] ?? levelColors.beginner}`}>
          {levelLabels[level] ?? level}
        </span>
        {durationText && (
          <span className="absolute top-3 right-3 rounded-lg bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {durationText}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        {tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-slate-500">
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className="mb-2 line-clamp-2 text-lg font-bold text-stone-900 leading-snug">
          {title}
        </h3>
        <p className="flex-1 line-clamp-2 text-sm text-stone-500 leading-relaxed">
          {description || "Khóa học chất lượng cao với kiến thức thực tế và có thể áp dụng ngay vào công việc."}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-amber-100 pt-4">
          <span className={`text-xl font-extrabold ${price > 0 ? "bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent" : "text-emerald-600"}`}>
            {formattedPrice}
          </span>
          <Link
            href={href}
            className="rounded-xl bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600 ring-1 ring-orange-200 transition-all hover:bg-orange-500 hover:text-white hover:ring-orange-500 active:scale-95"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
