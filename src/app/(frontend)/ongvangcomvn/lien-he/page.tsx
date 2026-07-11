import type { Metadata } from "next";
import Image from "next/image";
import { Clock3, Mail, MapPin, Phone, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { getOrganization } from "../actions";
import { OngvangcomvnContactForm } from "./OngvangcomvnContactForm";
import { OngvangcomvnReveal } from "../_components/OngvangcomvnReveal";

export const metadata: Metadata = {
  title: "Liên hệ tư vấn truyền thông & AI",
  description:
    "Liên hệ Ong Vàng để được tư vấn giải pháp truyền thông, đào tạo và ứng dụng AI phù hợp với mục tiêu tăng trưởng của doanh nghiệp.",
  alternates: { canonical: "/lien-he" },
  openGraph: {
    title: "Liên hệ tư vấn truyền thông & AI | Ong Vàng",
    description:
      "Gửi thông tin để Ong Vàng tư vấn lộ trình truyền thông, đào tạo và ứng dụng AI cho doanh nghiệp.",
    url: "/lien-he",
  },
};

export default async function OngvangcomvnLienHePage() {
  const org = await getOrganization();

  return (
    <>
      <section className="relative overflow-hidden bg-white pt-40 pb-20">
        <div className="pointer-events-none absolute inset-x-0 top-10 hidden justify-center overflow-hidden select-none md:flex opacity-[0.02]" aria-hidden="true">
          <span className="whitespace-nowrap text-[18vw] font-black uppercase leading-none tracking-tighter">
            CONTACT
          </span>
        </div>
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <OngvangcomvnReveal>
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-gray-400 antialiased">Liên hệ Ong Vàng</p>
            <h1 className="!text-[clamp(36px,4.5vw,66px)] !leading-[1.05] font-medium tracking-tighter text-black antialiased">
              Cùng bắt đầu một kế hoạch tăng trưởng rõ ràng.
            </h1>
            <p className="mt-8 max-w-2xl text-[18px] leading-relaxed text-gray-500 antialiased">
              Gửi thông tin cho Ong Vàng, đội ngũ tư vấn sẽ phản hồi trong vòng 24 giờ làm việc với đề xuất phù hợp.
            </p>
          </OngvangcomvnReveal>

          <OngvangcomvnReveal direction="left" delay={0.15}>
            <div className="relative overflow-hidden rounded-3xl border border-[#eaeaea] bg-white p-3">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85"
                  alt="Đội ngũ Ong Vàng trao đổi cùng khách hàng"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  unoptimized
                />
              </div>
              <div className="absolute left-8 top-8 hidden rounded-full border border-[#eaeaea] bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-black backdrop-blur-md sm:block">
                Tư vấn trong 24h
              </div>
              <div className="absolute bottom-8 left-8 right-8 hidden rounded-3xl border border-[#eaeaea] bg-white/80 p-6 backdrop-blur-md sm:block">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Ong Vàng Support</p>
                <p className="mt-2 text-[18px] font-medium tracking-tight text-black antialiased">Lắng nghe nhu cầu, đề xuất đúng giải pháp.</p>
              </div>
            </div>
          </OngvangcomvnReveal>
        </div>
      </section>

      <section className="bg-white pb-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            <div className="space-y-4 lg:col-span-2">
              {[
                {
                  icon: Phone,
                  label: "Hotline",
                  value: org?.phone ?? "0987 654 321",
                  href: `tel:${org?.phone ?? "0987654321"}`,
                },
                {
                  icon: Mail,
                  label: "Email",
                  value: org?.email ?? "contact@ongvang.vn",
                  href: `mailto:${org?.email ?? "contact@ongvang.vn"}`,
                },
                {
                  icon: MapPin,
                  label: "Địa chỉ",
                  value: org?.address ?? "TP. Hồ Chí Minh, Việt Nam",
                  href: null,
                },
              ].map((item) => (
                <OngvangcomvnReveal key={item.label}>
                  <div className="flex items-start gap-5 rounded-3xl border border-[#eaeaea] bg-white p-6 transition-all hover:border-gray-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#eaeaea] bg-[#fafafa] text-black">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-[15px] font-medium text-black hover:text-gray-500 transition-colors antialiased">{item.value}</a>
                      ) : (
                        <p className="text-[15px] font-medium text-black antialiased">{item.value}</p>
                      )}
                    </div>
                  </div>
                </OngvangcomvnReveal>
              ))}
              <OngvangcomvnReveal delay={0.3}>
                <div className="rounded-3xl border border-[#eaeaea] bg-white p-8 transition-all hover:border-gray-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1">
                  <div className="mb-6 flex items-center gap-3 text-black">
                    <Clock3 className="h-5 w-5" />
                    <p className="text-[15px] font-medium antialiased">Giờ làm việc</p>
                  </div>
                  <div className="space-y-4">
                    {[
                      { d: "Thứ 2 – Thứ 6", t: "08:00 – 17:30" },
                      { d: "Thứ 7", t: "08:00 – 12:00" },
                      { d: "Chủ nhật", t: "Nghỉ" },
                    ].map((row) => (
                      <div key={row.d} className="flex justify-between text-[14px]">
                        <span className="text-gray-500 antialiased">{row.d}</span>
                        <span className={`font-medium antialiased ${row.t === "Nghỉ" ? "text-gray-400" : "text-black"}`}>{row.t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </OngvangcomvnReveal>
            </div>

            <OngvangcomvnReveal className="lg:col-span-3" direction="left">
              <div className="flex h-full flex-col justify-center rounded-2xl border border-[#eaeaea] bg-white p-8 transition-colors hover:border-gray-300 md:p-10">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-gray-400 antialiased">Tư vấn</p>
                <h2 className="mb-3 !text-[32px] !leading-[1.05] font-medium tracking-tighter text-black antialiased md:!text-[40px]">Gửi yêu cầu tư vấn</h2>
                <p className="mb-8 text-[15px] leading-relaxed text-gray-500 antialiased">Thông tin được bảo mật. Ong Vàng sẽ phản hồi trong 24 giờ.</p>
                {org ? (
                  <OngvangcomvnContactForm organizationId={org.id} />
                ) : (
                  <p className="py-10 text-center text-gray-400 antialiased">Không thể tải form. Vui lòng liên hệ qua hotline.</p>
                )}
              </div>
            </OngvangcomvnReveal>
          </div>
        </div>
      </section>

      <section className="border-t border-[#eaeaea] bg-[#fafafa] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { Icon: Zap, title: "Phản hồi nhanh", desc: "Chúng tôi phản hồi trong vòng 24 giờ làm việc." },
              { Icon: ShieldCheck, title: "Bảo mật thông tin", desc: "Thông tin bảo mật tuyệt đối, không chia sẻ bên thứ ba." },
              { Icon: Sparkles, title: "Tư vấn đúng nhu cầu", desc: "Chuyên gia phân tích và đề xuất giải pháp phù hợp nhất." },
            ].map((item, i) => (
              <OngvangcomvnReveal key={item.title} delay={i * 0.1}>
                <div className="text-center p-8">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-black">
                    <item.Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-4 text-[20px] font-medium tracking-tight text-black antialiased">{item.title}</h3>
                  <p className="text-[15px] text-gray-500 leading-relaxed antialiased">{item.desc}</p>
                </div>
              </OngvangcomvnReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
