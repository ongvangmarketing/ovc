import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BarChart3, HeartHandshake, Lightbulb, Target } from "lucide-react";
import { OngvangcomvnReveal } from "../_components/OngvangcomvnReveal";

export const metadata: Metadata = {
  title: "Giới thiệu Ong Vàng",
  description:
    "Ong Vàng là đối tác về truyền thông, đào tạo và ứng dụng AI, đồng hành cùng doanh nghiệp xây dựng thương hiệu, tối ưu vận hành và phát triển bền vững.",
  alternates: { canonical: "/gioi-thieu" },
  openGraph: {
    title: "Giới thiệu Ong Vàng - Truyền thông, Đào tạo & Ứng dụng AI",
    description:
      "Tìm hiểu Ong Vàng và cách chúng tôi đồng hành cùng doanh nghiệp qua truyền thông, đào tạo thực chiến và ứng dụng AI.",
    url: "/gioi-thieu",
  },
};

export default function OngvangcomvnAboutPage() {
  return (
    <>
      <section className="ongvangcomvn-values-section relative overflow-hidden pt-40 pb-24">
        <div className="pointer-events-none absolute inset-x-0 top-16 hidden justify-center overflow-hidden select-none md:flex" aria-hidden>
          <span className="ongvangcomvn-solutions-ghost whitespace-nowrap text-[18vw] font-black uppercase leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>ABOUT</span>
        </div>
        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <OngvangcomvnReveal>
              <p className="mb-3 text-sm font-bold uppercase tracking-widest text-orange-500">Giới thiệu Ong Vàng</p>
              <h1 className="ongvangcomvn-page-title ongvangcomvn-about-hero-title tracking-[0] text-slate-950">
                Sáng tạo thực tiễn.<br />
                <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">Tăng trưởng bền vững.</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600">Ong Vàng đồng hành cùng doanh nghiệp Việt trong hành trình xây dựng thương hiệu, triển khai marketing, đào tạo đội ngũ và phát triển các dự án có giá trị dài hạn.</p>
            </OngvangcomvnReveal>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
              {[
                ["500+", "Dự án triển khai"],
                ["300+", "Khách hàng đồng hành"],
                ["100+", "Chiến dịch tối ưu"],
                ["20+", "Đối tác chiến lược"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-orange-100 bg-white/80 p-4 shadow-sm sm:p-5">
                  <p className="text-2xl font-black text-orange-600 sm:text-3xl">{value}</p>
                  <p className="mt-1 text-xs font-semibold leading-snug text-slate-500 sm:text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <OngvangcomvnReveal direction="left">
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl shadow-orange-100">
              <div className="relative aspect-[4/3]">
                <Image src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85" alt="Đội ngũ Ong Vàng" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
              </div>
            </div>
          </OngvangcomvnReveal>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Giá trị cốt lõi</p>
            <h2 className="ongvangcomvn-section-title mt-2 text-slate-950">Cách Ong Vàng làm việc</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-4">
            {[
              { Icon: Lightbulb, title: "Sáng tạo", desc: "Ý tưởng bám sát mục tiêu kinh doanh." },
              { Icon: Target, title: "Chiến lược", desc: "Kế hoạch rõ ràng, ưu tiên đo lường." },
              { Icon: BarChart3, title: "Hiệu quả", desc: "Tối ưu dựa trên dữ liệu thực tế." },
              { Icon: HeartHandshake, title: "Đồng hành", desc: "Làm việc như một phần đội ngũ của bạn." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-orange-100 bg-[#f8f6f2] p-6">
                <Icon className="h-8 w-8 text-orange-500" />
                <h3 className="ongvangcomvn-card-title mt-4 text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
          <Link href="/lien-he" className="mt-10 inline-flex rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-7 py-3 text-sm font-bold uppercase text-white shadow-lg shadow-orange-200">Trao đổi cùng Ong Vàng</Link>
        </div>
      </section>
    </>
  );
}
