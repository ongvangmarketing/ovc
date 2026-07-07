import type { Metadata } from "next";
import Link from "next/link";
import { getOrganization, getServices } from "../actions";
import { OngvangcomvnReveal } from "../_components/OngvangcomvnReveal";

export const metadata: Metadata = {
  title: "Dịch vụ truyền thông & ứng dụng AI",
  description:
    "Các gói dịch vụ truyền thông, marketing tổng thể, nội dung, SEO và ứng dụng AI giúp doanh nghiệp xây dựng thương hiệu, tối ưu quy trình và tăng trưởng bền vững.",
  alternates: { canonical: "/dich-vu" },
  openGraph: {
    title: "Dịch vụ truyền thông & ứng dụng AI | Ong Vàng",
    description:
      "Giải pháp truyền thông, marketing tổng thể và ứng dụng AI được thiết kế theo mục tiêu tăng trưởng của doanh nghiệp.",
    url: "/dich-vu",
  },
};

const viText: Record<string, string> = {
  "Brand Package": "Gói thương hiệu",
  "Content Package": "Gói nội dung",
  "Design Package": "Gói thiết kế",
  "Basic Brand": "Gói thương hiệu cơ bản",
  "Premium Brand": "Gói thương hiệu nâng cao",
  "Basic Content": "Gói nội dung cơ bản",
  "Premium Content": "Gói nội dung nâng cao",
  "Basic Design": "Gói thiết kế cơ bản",
  "Premium Design": "Gói thiết kế nâng cao",
  "BASIC BRAND": "Gói thương hiệu cơ bản",
  "PREMIUM BRAND": "Gói thương hiệu nâng cao",
  "BASIC CONTENT": "Gói nội dung cơ bản",
  "PREMIUM CONTENT": "Gói nội dung nâng cao",
  "BASIC DESIGN": "Gói thiết kế cơ bản",
  "PREMIUM DESIGN": "Gói thiết kế nâng cao",
};

function toVietnameseLabel(value: string) {
  const trimmed = value.trim();
  return viText[trimmed] ?? trimmed;
}

function extractFeatures(value: unknown, limit = 3) {
  const raw: unknown[] = Array.isArray(value)
    ? value
    : value && typeof value === "object" && Array.isArray((value as { features?: unknown[] }).features)
      ? (value as { features: unknown[] }).features
      : [];

  return raw.filter((item) => item != null).map(String).slice(0, limit);
}

export default async function OngvangcomvnDichVuPage() {
  const org = await getOrganization();
  const services = org ? await getServices(org.id) : [];
  const orderedServices = [...services].sort((a, b) => {
    const aPlanning = a.name.toLowerCase().includes("hoạch định") ? 1 : 0;
    const bPlanning = b.name.toLowerCase().includes("hoạch định") ? 1 : 0;
    return bPlanning - aPlanning;
  });

  return (
    <>
      <section className="relative overflow-hidden bg-[#EEF2FF] pt-40 pb-20">
        <div className="pointer-events-none absolute -top-4 inset-x-0 hidden justify-center overflow-hidden select-none md:flex" aria-hidden="true">
          <span className="whitespace-nowrap text-[20vw] font-black uppercase leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", color: "transparent", WebkitTextStroke: "2px rgba(99,102,241,0.07)" }}>
            DICH VU
          </span>
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <OngvangcomvnReveal>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-semibold text-orange-600">
              Giải pháp của Ong Vàng
            </div>
          </OngvangcomvnReveal>
          <OngvangcomvnReveal delay={0.1}>
            <h1 className="ongvangcomvn-page-title max-w-3xl tracking-tight text-slate-900">
              Giải pháp đủ sâu<br />
              <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">để tăng trưởng bền vững</span>
            </h1>
          </OngvangcomvnReveal>
          <OngvangcomvnReveal delay={0.2}>
            <p className="mt-6 max-w-xl text-lg text-slate-500 leading-relaxed">
              Từ quảng cáo trả phí đến SEO tự nhiên — chúng tôi có đủ giải pháp đo lường được, phù hợp với từng giai đoạn phát triển.
            </p>
          </OngvangcomvnReveal>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          {orderedServices.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {orderedServices.map((service, i) => {
                const prices = (service.options ?? []).map((opt) => Number(opt.price)).filter((price) => price > 0);
                const startingPrice = prices.length
                  ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: service.options?.[0]?.currency || "VND", maximumFractionDigits: 0 }).format(Math.min(...prices))
                  : "Liên hệ";
                const featureItems = (service.options ?? [])
                  .flatMap((opt) => extractFeatures(opt.featuresJson, 2))
                  .slice(0, 3);
                const fallbackFeatures = ["Tư vấn mục tiêu", "Kế hoạch triển khai", "Báo cáo tối ưu"];
                const isFeatured = i === 0 && service.name.toLowerCase().includes("hoạch định");
                const featuredOptions = (service.options ?? []).slice(0, 2);

                if (isFeatured) {
                  return (
                    <OngvangcomvnReveal key={service.id} delay={i * 0.07} className="lg:col-span-3">
                      <div className="grid gap-6 rounded-lg border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6 shadow-sm lg:grid-cols-[0.95fr_1fr_1fr] lg:p-8">
                        <div className="flex flex-col">
                          <div className="mb-8 flex items-center justify-between gap-4">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">OV-01</span>
                            <span className="rounded-full border border-orange-100 bg-white px-3 py-1 text-[11px] font-semibold text-orange-600">
                              Dịch vụ trọng tâm
                            </span>
                          </div>
                          <h3 className="ongvangcomvn-card-title tracking-[0] text-slate-950">{toVietnameseLabel(service.name)}</h3>
                          <p className="mt-5 text-base leading-7 text-slate-500">{service.description || "Giải pháp tối ưu hiệu quả đầu tư cho doanh nghiệp của bạn."}</p>
                          <Link href={`/dich-vu/${service.slug}`} className="mt-auto hidden w-fit rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 lg:inline-flex">
                            Xem chi tiết →
                          </Link>
                        </div>

                        {(featuredOptions.length ? featuredOptions : service.options ?? []).slice(0, 2).map((option, optionIndex) => {
                          const optionPrice = Number(option.price);
                          const optionPriceText = optionPrice > 0
                            ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: option.currency || "VND", maximumFractionDigits: 0 }).format(optionPrice)
                            : "Liên hệ";
                          const optionFeatures = extractFeatures(option.featuresJson, 3);

                          return (
                            <Link key={option.id} href={`/dich-vu/${service.slug}`} className="group/option flex min-h-[260px] flex-col rounded-lg border border-orange-100 bg-white p-5 transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-sm">
                              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-500">
                                {optionIndex === 0 ? "Tư vấn chiến lược" : "Triển khai thực thi"}
                              </span>
                              <h4 className="mt-3 text-xl font-semibold leading-snug text-slate-950">{toVietnameseLabel(option.name)}</h4>
                              <p className="mt-3 text-sm leading-6 text-slate-500">{option.description || (optionIndex === 0 ? "Xây dựng định hướng, chân dung khách hàng và lộ trình truyền thông rõ ràng." : "Đồng hành vận hành, đo lường và tối ưu kế hoạch theo mục tiêu kinh doanh.")}</p>
                              <div className="mt-5 grid gap-2 border-t border-orange-50 pt-4">
                                {(optionFeatures.length ? optionFeatures : fallbackFeatures).map((feature) => (
                                  <span key={feature} className="flex items-start gap-2 text-sm leading-5 text-slate-600">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                                    {feature}
                                  </span>
                                ))}
                              </div>
                              <div className="mt-auto flex items-end justify-between gap-4 pt-5">
                                <div>
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Từ</p>
                                  <p className="mt-1 text-xl font-semibold text-orange-600">{optionPriceText}</p>
                                </div>
                                <span className="text-sm font-semibold text-orange-600 transition group-hover/option:translate-x-1">→</span>
                              </div>
                            </Link>
                          );
                        })}

                        <Link href={`/dich-vu/${service.slug}`} className="inline-flex justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 lg:hidden">
                          Xem chi tiết →
                        </Link>
                      </div>
                    </OngvangcomvnReveal>
                  );
                }

                return (
                  <OngvangcomvnReveal key={service.id} delay={i * 0.07}>
                    <div className={`group flex h-full flex-col rounded-lg border p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange-200 ${
                      "border-slate-200/80 bg-white"
                    }`}>
                      <div className="flex flex-col">
                      <div className="mb-7 flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">OV-{String(i + 1).padStart(2, "0")}</span>
                        <span className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-[11px] font-semibold text-orange-600">
                          {(service.options ?? []).length || 1} lựa chọn
                        </span>
                      </div>
                      <h3 className="ongvangcomvn-card-title tracking-[0] text-slate-950">{toVietnameseLabel(service.name)}</h3>
                      <p className="mt-4 min-h-[78px] text-sm leading-6 text-slate-500">{service.description || "Giải pháp tối ưu hiệu quả đầu tư cho doanh nghiệp của bạn."}</p>
                      </div>

                      <div className="mt-6 grid content-between gap-5">
                      <div className="grid gap-3 border-y border-orange-100/70 py-5">
                        {(featureItems.length ? featureItems : fallbackFeatures).map((feature) => (
                          <div key={feature} className="flex items-start gap-3 text-sm leading-5 text-slate-600">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Từ</p>
                          <p className="mt-1 text-xl font-semibold text-orange-600">{startingPrice}</p>
                        </div>
                        <Link href={`/dich-vu/${service.slug}`} className="inline-flex h-11 items-center rounded-full border border-orange-200 px-5 text-sm font-semibold text-orange-600 transition hover:bg-orange-500 hover:text-white">
                          Chi tiết →
                        </Link>
                      </div>
                      </div>
                    </div>
                  </OngvangcomvnReveal>
                );
              })}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="text-5xl mb-4">🔧</p>
              <h2 className="text-2xl font-bold text-slate-900">Đang cập nhật dịch vụ</h2>
              <p className="mt-2 text-slate-500">Liên hệ trực tiếp để nhận báo giá.</p>
              <Link href="/lien-he" className="mt-6 inline-flex rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 font-bold text-white transition-all hover:scale-105">
                Liên hệ ngay
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#EEF2FF] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <OngvangcomvnReveal><h2 className="ongvangcomvn-section-title mb-10 text-center text-slate-900">Vì sao chọn <span className="text-orange-500">Ong Vàng?</span></h2></OngvangcomvnReveal>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "🎯", t: "Bám sát kết quả", d: "Mọi chiến dịch đều được đo lường và báo cáo rõ ràng mỗi tuần." },
              { icon: "🧠", t: "Đội ngũ thực chiến", d: "Đội ngũ đã triển khai hàng trăm chiến dịch thực tế." },
              { icon: "⚡", t: "Triển khai nhanh", d: "Từ tiếp nhận yêu cầu đến vận hành trong 48 giờ làm việc." },
              { icon: "🤝", t: "Đồng hành dài hạn", d: "Không chỉ làm dịch vụ, chúng tôi là đối tác chiến lược." },
            ].map((item, i) => (
              <OngvangcomvnReveal key={item.t} delay={i * 0.1}>
                <div className="rounded-2xl border border-white bg-white p-6 text-center shadow-sm hover:border-orange-100 hover:shadow-md transition-all">
                  <div className="mb-3 text-4xl">{item.icon}</div>
                  <h3 className="mb-2 font-bold text-slate-900">{item.t}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.d}</p>
                </div>
              </OngvangcomvnReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 text-center">
        <OngvangcomvnReveal><h2 className="ongvangcomvn-section-title text-slate-900">Sẵn sàng hợp tác?</h2></OngvangcomvnReveal>
        <OngvangcomvnReveal delay={0.1}><p className="mt-3 text-slate-500">Nhận báo giá và tư vấn chiến lược miễn phí ngay hôm nay.</p></OngvangcomvnReveal>
        <OngvangcomvnReveal delay={0.2}>
          <Link href="/lien-he" className="mt-8 inline-flex rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-4 font-bold text-white shadow-xl shadow-orange-200 transition-all hover:scale-105">
            Nhận tư vấn miễn phí →
          </Link>
        </OngvangcomvnReveal>
      </section>
    </>
  );
}
