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
      <section className="relative overflow-hidden bg-white pt-40 pb-24">
        {/* Background Text */}
        <div className="pointer-events-none absolute -top-4 inset-x-0 hidden justify-center overflow-hidden select-none md:flex opacity-[0.02]" aria-hidden="true">
          <span className="whitespace-nowrap text-[20vw] font-black uppercase leading-none tracking-tighter">
            SERVICES
          </span>
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <OngvangcomvnReveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#eaeaea] bg-[#fafafa] px-4 py-1.5 text-[12px] font-medium tracking-wide text-gray-500 uppercase antialiased">
              Giải pháp của Ong Vàng
            </div>
          </OngvangcomvnReveal>
          <OngvangcomvnReveal delay={0.1}>
            <h1 className="!text-[clamp(36px,4.5vw,66px)] !leading-[1.05] font-medium tracking-tighter text-black antialiased max-w-4xl">
              Giải pháp hoàn chỉnh<br />
              để phát triển thương hiệu.
            </h1>
          </OngvangcomvnReveal>
          <OngvangcomvnReveal delay={0.2}>
            <p className="mt-8 max-w-2xl text-[18px] text-gray-500 leading-relaxed antialiased">
              Từ quảng cáo trả phí đến SEO tự nhiên — chúng tôi có đủ giải pháp đo lường được, phù hợp với từng giai đoạn phát triển.
            </p>
          </OngvangcomvnReveal>
        </div>
      </section>

      <section className="bg-white py-24 border-t border-[#eaeaea]">
        <div className="mx-auto max-w-7xl px-6">
          {orderedServices.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                      <div className="grid gap-8 rounded-3xl border border-[#eaeaea] bg-white p-8 lg:grid-cols-[0.95fr_1fr_1fr] lg:p-12 transition-all duration-300 hover:border-gray-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.04)] hover:-translate-y-1">
                        <div className="flex flex-col">
                          <div className="mb-8 flex items-center justify-between gap-4">
                            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">OV-01</span>
                            <span className="rounded-full border border-[#eaeaea] bg-[#fafafa] px-3 py-1 text-[11px] font-semibold tracking-widest uppercase text-black">
                              Dịch vụ trọng tâm
                            </span>
                          </div>
                          <h3 className="!text-[clamp(32px,4vw,48px)] !leading-[1.1] font-medium tracking-tighter text-black antialiased">{toVietnameseLabel(service.name)}</h3>
                          <p className="mt-5 text-[15px] leading-relaxed text-gray-500 antialiased max-w-sm">{service.description || "Giải pháp tối ưu hiệu quả đầu tư cho doanh nghiệp của bạn."}</p>
                          <Link href={`/dich-vu/${service.slug}`} className="mt-auto hidden w-fit rounded-full bg-black px-6 py-3 text-[14px] font-medium text-white transition-colors hover:bg-gray-800 antialiased lg:inline-flex">
                            Xem chi tiết
                          </Link>
                        </div>

                        {(featuredOptions.length ? featuredOptions : service.options ?? []).slice(0, 2).map((option, optionIndex) => {
                          const optionPrice = Number(option.price);
                          const optionPriceText = optionPrice > 0
                            ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: option.currency || "VND", maximumFractionDigits: 0 }).format(optionPrice)
                            : "Liên hệ";
                          const optionFeatures = extractFeatures(option.featuresJson, 3);

                          return (
                            <Link key={option.id} href={`/dich-vu/${service.slug}`} className="group/option flex min-h-[260px] flex-col rounded-3xl border border-[#eaeaea] bg-[#fafafa] p-8 transition-all hover:bg-white hover:-translate-y-1 hover:border-gray-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden">
                              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 relative z-10">
                                {optionIndex === 0 ? "Tư vấn chiến lược" : "Triển khai thực thi"}
                              </span>
                              <h4 className="mt-4 text-[22px] font-medium tracking-tight text-black antialiased relative z-10">{toVietnameseLabel(option.name)}</h4>
                              <p className="mt-3 text-[14px] leading-relaxed text-gray-500 antialiased relative z-10">{option.description || (optionIndex === 0 ? "Xây dựng định hướng, chân dung khách hàng và lộ trình truyền thông rõ ràng." : "Đồng hành vận hành, đo lường và tối ưu kế hoạch theo mục tiêu kinh doanh.")}</p>
                              <div className="mt-8 grid gap-4 border-t border-[#eaeaea] pt-6 relative z-10">
                                {(optionFeatures.length ? optionFeatures : fallbackFeatures).map((feature) => (
                                  <span key={feature} className="flex items-start gap-3 text-[14px] font-medium tracking-tight text-gray-700 antialiased">
                                    <span className="mt-0.5 text-black">✓</span>
                                    {feature}
                                  </span>
                                ))}
                              </div>
                              <div className="mt-10 flex items-center justify-between border-t border-[#eaeaea] pt-6 relative z-10">
                                <div>
                                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Chỉ từ</p>
                                  <p className="mt-1 text-[20px] font-medium tracking-tight text-black antialiased">{optionPriceText}</p>
                                </div>
                              </div>
                              {/* Subtle hover gradient background */}
                              <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-gray-50/50 opacity-0 transition-opacity duration-300 group-hover/option:opacity-100"></div>
                            </Link>
                          );
                        })}

                        <Link href={`/ongvangcomvn/dich-vu/${service.slug}`} className="inline-flex justify-center rounded-full bg-black px-6 py-3 text-[14px] font-medium text-white transition-colors hover:bg-gray-800 antialiased lg:hidden">
                          Xem chi tiết
                        </Link>
                      </div>
                    </OngvangcomvnReveal>
                  );
                }

                return (
                  <OngvangcomvnReveal key={service.id} delay={i * 0.07}>
                    <div className="group flex h-full flex-col rounded-3xl border border-[#eaeaea] bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.06)] relative overflow-hidden">
                      <div className="flex flex-col relative z-10">
                        <div className="mb-8 flex items-center justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">OV-{String(i + 1).padStart(2, "0")}</span>
                          <span className="rounded-full border border-[#eaeaea] bg-[#fafafa] px-3 py-1 text-[11px] font-semibold tracking-widest uppercase text-black">
                            {(service.options ?? []).length || 1} lựa chọn
                          </span>
                        </div>
                        <h3 className="text-[24px] font-medium tracking-tight text-black antialiased">{toVietnameseLabel(service.name)}</h3>
                        <p className="mt-4 min-h-[78px] text-[15px] leading-relaxed text-gray-500 antialiased">{service.description || "Giải pháp tối ưu hiệu quả đầu tư cho doanh nghiệp của bạn."}</p>
                      </div>

                      <div className="mt-8 flex flex-col justify-between flex-1 relative z-10">
                        <div className="grid gap-4 border-y border-[#eaeaea] py-6">
                          {(featureItems.length ? featureItems : fallbackFeatures).map((feature) => (
                            <div key={feature} className="flex items-start gap-3 text-[14px] font-medium tracking-tight text-gray-700 antialiased">
                              <span className="mt-0.5 text-black">✓</span>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-8 flex items-center justify-between">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Từ</p>
                            <p className="mt-1 text-[20px] font-medium tracking-tight text-black antialiased">{startingPrice}</p>
                          </div>
                          <Link href={`/ongvangcomvn/dich-vu/${service.slug}`} className="inline-flex h-10 items-center justify-center rounded-full border border-[#eaeaea] px-5 text-[14px] font-medium text-black transition-colors hover:bg-black hover:text-white antialiased">
                            Chi tiết
                          </Link>
                        </div>
                      </div>
                      {/* Subtle hover gradient background */}
                      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-gray-50/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    </div>
                  </OngvangcomvnReveal>
                );
              })}
            </div>
          ) : (
            <div className="py-32 text-center">
              <h2 className="text-[32px] font-medium tracking-tight text-black antialiased">Đang cập nhật dịch vụ</h2>
              <p className="mt-4 text-[16px] text-gray-500 antialiased">Liên hệ trực tiếp để nhận báo giá.</p>
              <Link href="/ongvangcomvn/lien-he" className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-black px-8 text-[14px] font-medium text-white transition-colors hover:bg-gray-800 antialiased">
                Liên hệ ngay
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white py-24 border-t border-[#eaeaea]">
        <div className="mx-auto max-w-7xl px-6">
          <OngvangcomvnReveal><h2 className="!text-[clamp(32px,4vw,56px)] !leading-[1.1] mb-16 text-center font-medium tracking-tighter text-black antialiased">Vì sao chọn Ong Vàng?</h2></OngvangcomvnReveal>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "🎯", t: "Bám sát kết quả", d: "Mọi chiến dịch đều được đo lường và báo cáo rõ ràng mỗi tuần." },
              { icon: "🧠", t: "Đội ngũ thực chiến", d: "Đội ngũ đã triển khai hàng trăm chiến dịch thực tế." },
              { icon: "⚡", t: "Triển khai nhanh", d: "Từ tiếp nhận yêu cầu đến vận hành trong 48 giờ làm việc." },
              { icon: "🤝", t: "Đồng hành dài hạn", d: "Không chỉ làm dịch vụ, chúng tôi là đối tác chiến lược." },
            ].map((item, i) => (
              <OngvangcomvnReveal key={item.t} delay={i * 0.1}>
                <div className="rounded-3xl border border-[#eaeaea] bg-white p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.06)]">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#eaeaea] bg-[#fafafa] text-2xl mb-6">
                    {item.icon}
                  </div>
                  <h3 className="mb-3 text-[20px] font-medium tracking-tight text-black antialiased">{item.t}</h3>
                  <p className="text-[15px] text-gray-500 leading-relaxed antialiased">{item.d}</p>
                </div>
              </OngvangcomvnReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-32 text-center border-t border-[#eaeaea]">
        <OngvangcomvnReveal><h2 className="!text-[clamp(40px,5vw,72px)] !leading-[1.05] font-medium tracking-tighter text-black antialiased">Sẵn sàng hợp tác?</h2></OngvangcomvnReveal>
        <OngvangcomvnReveal delay={0.1}><p className="mt-6 text-[18px] text-gray-500 antialiased">Nhận báo giá và tư vấn chiến lược miễn phí ngay hôm nay.</p></OngvangcomvnReveal>
        <OngvangcomvnReveal delay={0.2}>
          <Link href="/ongvangcomvn/lien-he" className="mt-10 inline-flex h-14 items-center justify-center rounded-full bg-black px-10 text-[15px] font-medium text-white transition-colors hover:bg-gray-800 antialiased">
            Nhận tư vấn miễn phí
          </Link>
        </OngvangcomvnReveal>
      </section>
    </>
  );
}
