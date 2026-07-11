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
      <section className="relative overflow-hidden bg-white pt-40 pb-24">
        {/* Background Text */}
        <div className="pointer-events-none absolute inset-x-0 top-16 hidden justify-center overflow-hidden select-none md:flex opacity-[0.03]" aria-hidden>
          <span className="whitespace-nowrap text-[18vw] font-black uppercase leading-none tracking-tighter">ABOUT</span>
        </div>
        
        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <OngvangcomvnReveal>
              <p className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-gray-400 antialiased">Giới thiệu Ong Vàng</p>
            <h1 className="!text-[clamp(36px,4.5vw,66px)] !leading-[1.05] font-medium tracking-tighter text-black antialiased">
                Sáng tạo thực tiễn.<br />
                Tăng trưởng bền vững.
              </h1>
              <p className="mt-8 text-[18px] leading-relaxed text-gray-500 antialiased max-w-xl">
                Ong Vàng đồng hành cùng doanh nghiệp Việt trong hành trình xây dựng thương hiệu, triển khai marketing, đào tạo đội ngũ và phát triển các dự án có giá trị dài hạn.
              </p>
            </OngvangcomvnReveal>
            <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6">
              {[
                ["500+", "Dự án triển khai"],
                ["300+", "Khách hàng đồng hành"],
                ["100+", "Chiến dịch tối ưu"],
                ["20+", "Đối tác chiến lược"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-[#eaeaea] bg-white p-6 transition-colors hover:border-gray-300">
                  <p className="text-[32px] font-medium tracking-tight text-black antialiased">{value}</p>
                  <p className="mt-2 text-[13px] font-medium tracking-tight text-gray-500 uppercase antialiased">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <OngvangcomvnReveal direction="left">
            <div className="relative overflow-hidden rounded-3xl border border-[#eaeaea] bg-white">
              <div className="relative aspect-[4/3]">
                <Image src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85" alt="Đội ngũ Ong Vàng" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover grayscale hover:grayscale-0 transition-all duration-700" unoptimized />
              </div>
            </div>
          </OngvangcomvnReveal>
        </div>
      </section>

      <section className="bg-white py-24 border-t border-[#eaeaea]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 max-w-2xl">
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-gray-400 antialiased">Giá trị cốt lõi</p>
            <h2 className="!text-[clamp(32px,4vw,56px)] !leading-[1.1] font-medium tracking-tighter text-black antialiased">Cách Ong Vàng làm việc</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              { Icon: Lightbulb, title: "Sáng tạo", desc: "Ý tưởng bám sát mục tiêu kinh doanh." },
              { Icon: Target, title: "Chiến lược", desc: "Kế hoạch rõ ràng, ưu tiên đo lường." },
              { Icon: BarChart3, title: "Hiệu quả", desc: "Tối ưu dựa trên dữ liệu thực tế." },
              { Icon: HeartHandshake, title: "Đồng hành", desc: "Làm việc như một phần đội ngũ của bạn." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="group rounded-3xl border border-[#eaeaea] bg-white p-8 transition-all hover:-translate-y-1 hover:border-gray-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#eaeaea] bg-[#fafafa] text-black transition-colors group-hover:bg-black group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-8 text-[20px] font-medium tracking-tight text-black antialiased">{title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-gray-500 antialiased">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 flex">
            <Link href="/ongvangcomvn/lien-he" className="inline-flex h-12 items-center justify-center rounded-full bg-black px-8 text-[14px] font-medium text-white transition-colors hover:bg-gray-800 antialiased">
              Trao đổi cùng Ong Vàng
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
