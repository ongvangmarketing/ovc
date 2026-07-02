import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BarChart3, HeartHandshake, Lightbulb, Target } from "lucide-react";
import { OvReveal } from "../_components/OvReveal";

export const metadata: Metadata = {
  title: "Giới thiệu Ong Vàng",
  description:
    "Ong Vàng là đối tác về truyền thông, đào tạo và ứng dụng AI, đồng hành cùng doanh nghiệp xây dựng thương hiệu, tối ưu vận hành và phát triển bền vững.",
  alternates: { canonical: "/ovmain/gioi-thieu" },
  openGraph: {
    title: "Giới thiệu Ong Vàng - Truyền thông, Đào tạo & Ứng dụng AI",
    description:
      "Tìm hiểu Ong Vàng và cách chúng tôi đồng hành cùng doanh nghiệp qua truyền thông, đào tạo thực chiến và ứng dụng AI.",
    url: "/ovmain/gioi-thieu",
  },
};

export default function OvAboutPage() {
  return (
    <>
      <section className="ovmain-values-section relative overflow-hidden pt-40 pb-24">
        <div className="pointer-events-none absolute inset-x-0 top-16 flex justify-center overflow-hidden select-none" aria-hidden>
          <span className="ovmain-solutions-ghost whitespace-nowrap text-[18vw] font-black uppercase leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>ABOUT</span>
        </div>
        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <OvReveal>
              <p className="mb-3 text-sm font-bold uppercase tracking-widest text-orange-500">Giới thiệu Ong Vàng</p>
              <h1 className="text-5xl font-black tracking-[0] text-slate-950 sm:text-6xl">Sáng tạo thực tiễn. Tăng trưởng bền vững.</h1>
              <p className="mt-6 text-lg leading-8 text-slate-600">Ong Vàng đồng hành cùng doanh nghiệp Việt trong hành trình xây dựng thương hiệu, triển khai marketing, đào tạo đội ngũ và phát triển các dự án có giá trị dài hạn.</p>
            </OvReveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ["500+", "Dự án triển khai"],
                ["300+", "Khách hàng đồng hành"],
                ["100+", "Chiến dịch tối ưu"],
                ["20+", "Đối tác chiến lược"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-orange-100 bg-white/80 p-5 shadow-sm">
                  <p className="text-3xl font-black text-orange-600">{value}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <OvReveal direction="left">
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl shadow-orange-100">
              <div className="relative aspect-[4/3]">
                <Image src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85" alt="Đội ngũ Ong Vàng" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
              </div>
            </div>
          </OvReveal>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Giá trị cốt lõi</p>
            <h2 className="mt-2 text-4xl font-black text-slate-950">Cách Ong Vàng làm việc</h2>
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
                <h3 className="mt-4 font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
          <Link href="/ovmain/lien-he" className="mt-10 inline-flex rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-7 py-3 text-sm font-bold uppercase text-white shadow-lg shadow-orange-200">Trao đổi cùng Ong Vàng</Link>
        </div>
      </section>
    </>
  );
}
