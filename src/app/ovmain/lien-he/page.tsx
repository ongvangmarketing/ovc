import type { Metadata } from "next";
import Image from "next/image";
import { Clock3, Mail, MapPin, Phone, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { getOrganization } from "../actions";
import { OvContactForm } from "./OvContactForm";
import { OvReveal } from "../_components/OvReveal";

export const metadata: Metadata = {
  title: "Liên hệ tư vấn truyền thông & AI",
  description:
    "Liên hệ Ong Vàng để được tư vấn giải pháp truyền thông, đào tạo và ứng dụng AI phù hợp với mục tiêu tăng trưởng của doanh nghiệp.",
  alternates: { canonical: "/ovmain/lien-he" },
  openGraph: {
    title: "Liên hệ tư vấn truyền thông & AI | Ong Vàng",
    description:
      "Gửi thông tin để Ong Vàng tư vấn lộ trình truyền thông, đào tạo và ứng dụng AI cho doanh nghiệp.",
    url: "/ovmain/lien-he",
  },
};

export default async function OvLienHePage() {
  const org = await getOrganization();

  return (
    <>
      <section className="relative overflow-hidden bg-[#f8f6f2] pt-40 pb-20">
        <div className="pointer-events-none absolute inset-x-0 top-10 flex justify-center overflow-hidden select-none" aria-hidden="true">
          <span className="ovmain-solutions-ghost ovmain-contact-ghost whitespace-nowrap text-[18vw] font-black uppercase leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            CONTACT
          </span>
        </div>
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <OvReveal>
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-orange-500">Liên hệ Ong Vàng</p>
            <h1 className="max-w-4xl text-5xl font-black tracking-[0] text-slate-950 sm:text-6xl">
              Cùng bắt đầu một kế hoạch tăng trưởng rõ ràng.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Gửi thông tin cho Ong Vàng, đội ngũ tư vấn sẽ phản hồi trong vòng 24 giờ làm việc với đề xuất phù hợp.
            </p>
          </OvReveal>

          <OvReveal direction="left" delay={0.15}>
            <div className="relative overflow-hidden rounded-3xl border border-orange-100 bg-white p-3 shadow-2xl shadow-orange-100/60">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85"
                  alt="Đội ngũ Ong Vàng trao đổi cùng khách hàng"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent" />
              </div>
              <div className="absolute left-8 top-8 rounded-full bg-white/92 px-4 py-2 text-xs font-bold uppercase text-slate-800 shadow-lg backdrop-blur">
                Tư vấn trong 24h
              </div>
              <div className="absolute bottom-8 left-8 right-8 rounded-2xl bg-white/92 p-5 shadow-xl backdrop-blur">
                <p className="text-sm font-bold uppercase text-orange-500">Ong Vàng Support</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">Lắng nghe nhu cầu, đề xuất đúng giải pháp.</p>
              </div>
            </div>
          </OvReveal>
        </div>
      </section>

      <section className="bg-[#f8f6f2] pb-24">
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
                <OvReveal key={item.label}>
                  <div className="flex items-start gap-4 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition hover:border-orange-200 hover:shadow-md">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500 ring-1 ring-orange-100">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-sm font-semibold text-slate-900 hover:text-orange-600 transition-colors">{item.value}</a>
                      ) : (
                        <p className="text-sm font-semibold text-slate-900">{item.value}</p>
                      )}
                    </div>
                  </div>
                </OvReveal>
              ))}
              <OvReveal delay={0.3}>
                <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 text-slate-950">
                    <Clock3 className="h-5 w-5 text-orange-500" />
                    <p className="text-sm font-bold">Giờ làm việc</p>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { d: "Thứ 2 – Thứ 6", t: "08:00 – 17:30" },
                      { d: "Thứ 7", t: "08:00 – 12:00" },
                      { d: "Chủ nhật", t: "Nghỉ" },
                    ].map((row) => (
                      <div key={row.d} className="flex justify-between text-sm">
                        <span className="text-slate-500">{row.d}</span>
                        <span className={`font-semibold ${row.t === "Nghỉ" ? "text-slate-400" : "text-slate-900"}`}>{row.t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </OvReveal>
            </div>

            <OvReveal className="lg:col-span-3" direction="left">
              <div className="rounded-3xl border border-orange-100 bg-white p-8 shadow-xl shadow-orange-100/40 lg:p-10">
                <h2 className="mb-1 text-2xl font-black text-slate-900">Gửi yêu cầu tư vấn</h2>
                <p className="mb-7 text-sm text-slate-400">Thông tin được bảo mật. Ong Vàng sẽ phản hồi trong 24 giờ.</p>
                {org ? (
                  <OvContactForm organizationId={org.id} />
                ) : (
                  <p className="py-10 text-center text-slate-400">Không thể tải form. Vui lòng liên hệ qua hotline.</p>
                )}
              </div>
            </OvReveal>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/60 bg-white py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { Icon: Zap, title: "Phản hồi nhanh", desc: "Chúng tôi phản hồi trong vòng 24 giờ làm việc." },
              { Icon: ShieldCheck, title: "Bảo mật thông tin", desc: "Thông tin bảo mật tuyệt đối, không chia sẻ bên thứ ba." },
              { Icon: Sparkles, title: "Tư vấn đúng nhu cầu", desc: "Chuyên gia phân tích và đề xuất giải pháp phù hợp nhất." },
            ].map((item, i) => (
              <OvReveal key={item.title} delay={i * 0.1}>
                <div className="text-center p-6">
                  <item.Icon className="mx-auto mb-3 h-8 w-8 text-orange-500" />
                  <h3 className="mb-2 font-bold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </OvReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
