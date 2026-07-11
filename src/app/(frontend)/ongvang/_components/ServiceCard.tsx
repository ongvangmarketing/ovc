"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface ServiceOption {
  id: string;
  name: string;
  description?: string | null;
  price: number | string;
  currency: string;
  unit?: string | null;
  durationText?: string | null;
  featuresJson?: unknown;
}

interface ServiceCardProps {
  name: string;
  description?: string | null;
  options?: ServiceOption[];
  index: number;
  href?: string;
}

const icons = [
  <svg key="ads" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535" /></svg>,
  <svg key="chart" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
  <svg key="globe" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>,
  <svg key="sparkles" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>,
  <svg key="video" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg>,
  <svg key="star" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>,
];

export function ServiceCard({ name, description, options = [], index, href = "/ongvang/dich-vu" }: ServiceCardProps) {
  const features = (() => {
    if (options.length > 0) return null; // show options instead
    return null;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px 0px" }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
      className="group flex flex-col rounded-3xl border border-amber-100 bg-white shadow-sm shadow-amber-50 transition-all hover:border-orange-200 hover:shadow-md hover:shadow-amber-100"
    >
      {/* Card header */}
      <div className="p-7 pb-5">
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-orange-500 ring-1 ring-amber-100 transition-colors group-hover:bg-orange-50">
          {icons[index % icons.length]}
        </div>
        <h3 className="mb-2 text-xl font-bold text-stone-900">{name}</h3>
        <p className="text-sm leading-relaxed text-stone-500">
          {description || "Giải pháp chuyên nghiệp, tối ưu kết quả kinh doanh cho doanh nghiệp của bạn."}
        </p>
      </div>

      {/* Service Options (pricing packages) */}
      {options.length > 0 && (
        <div className="border-t border-amber-50 px-7 py-5 flex-1">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-stone-400">Gói dịch vụ</p>
          <div className="space-y-3">
            {options.map((opt) => {
              const price = Number(opt.price);
              const formattedPrice =
                price > 0
                  ? new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: opt.currency || "VND",
                      maximumFractionDigits: 0,
                    }).format(price)
                  : "Liên hệ";

              // Parse featuresJson
              let featureList: string[] = [];
              try {
                if (opt.featuresJson && typeof opt.featuresJson === "object") {
                  const arr = Array.isArray(opt.featuresJson)
                    ? opt.featuresJson
                    : (opt.featuresJson as Record<string, unknown>).features;
                  if (Array.isArray(arr)) featureList = arr.slice(0, 3);
                }
              } catch {}

              return (
                <div
                  key={opt.id}
                  className="rounded-xl border border-amber-100 bg-amber-50/50 p-3.5 hover:border-orange-200 hover:bg-orange-50/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-sm font-semibold text-stone-800">{opt.name}</span>
                    <span className="shrink-0 text-sm font-bold text-orange-600">{formattedPrice}</span>
                  </div>
                  {opt.durationText && (
                    <p className="text-xs text-stone-400 mb-1.5">⏱ {opt.durationText}{opt.unit ? ` / ${opt.unit}` : ""}</p>
                  )}
                  {featureList.length > 0 && (
                    <ul className="space-y-1">
                      {featureList.map((f, fi) => (
                        <li key={fi} className="flex items-center gap-1.5 text-xs text-stone-500">
                          <span className="text-orange-400">✓</span> {String(f)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <div className="p-7 pt-4 mt-auto">
        <Link
          href={href}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-50 py-2.5 text-sm font-semibold text-orange-600 ring-1 ring-orange-200 transition-all hover:bg-orange-500 hover:text-white hover:ring-orange-500 active:scale-95"
        >
          Tư vấn chi tiết
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </Link>
      </div>
    </motion.div>
  );
}
