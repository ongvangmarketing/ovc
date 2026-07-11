import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { getOrganization, getServiceBySlug } from "../../actions";
import { OngvangcomvnReveal } from "../../_components/OngvangcomvnReveal";

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

function seoDescription(value?: string | null) {
  const fallback =
    "Dịch vụ truyền thông, marketing và ứng dụng AI của Ong Vàng giúp doanh nghiệp xây dựng thương hiệu, tối ưu quy trình và tăng trưởng bền vững.";
  const text = (value || fallback).replace(/\s+/g, " ").trim();
  return text.length > 155 ? `${text.slice(0, 152).trim()}...` : text;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const org = await getOrganization();
  if (!org) {
    return {
      title: "Dịch vụ truyền thông & ứng dụng AI",
      description: seoDescription(),
    };
  }

  const service = await getServiceBySlug(org.id, slug);
  if (!service || service.status !== "ACTIVE") {
    return {
      title: "Dịch vụ truyền thông & ứng dụng AI",
      description: seoDescription(),
    };
  }

  const title = `${toVietnameseLabel(service.name)} - Truyền thông & AI`;
  const description = seoDescription(service.description);
  const url = `/dich-vu/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Ong Vàng`,
      description,
      url,
    },
    twitter: {
      title: `${title} | Ong Vàng`,
      description,
    },
  };
}

function money(value: unknown, currency = "VND") {
  const amount = Number(value ?? 0);
  return amount > 0
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount)
    : "Liên hệ";
}

function features(value: unknown) {
  if (Array.isArray(value)) return value.map(String).slice(0, 6);
  if (value && typeof value === "object" && Array.isArray((value as { features?: unknown[] }).features)) {
    return (value as { features: unknown[] }).features.map(String).slice(0, 6);
  }
  return [];
}

export default async function OngvangcomvnServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = await getOrganization();
  if (!org) notFound();
  const service = await getServiceBySlug(org.id, slug);
  if (!service || service.status !== "ACTIVE") notFound();

  return (
    <>
      <section className="relative overflow-hidden bg-white pt-40 pb-20">
        <div className="pointer-events-none absolute inset-x-0 top-2 hidden justify-center overflow-hidden select-none md:flex opacity-[0.02]" aria-hidden>
          <span className="whitespace-nowrap text-[18vw] font-black uppercase leading-none tracking-tighter">SERVICE</span>
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <Link href="/ongvangcomvn/dich-vu" className="mb-10 inline-flex h-10 items-center justify-center rounded-full border border-[#eaeaea] bg-white px-5 text-[14px] font-medium text-black transition-colors hover:bg-[#fafafa] antialiased">
            <ArrowLeft className="mr-2 h-4 w-4" /> Dịch vụ
          </Link>
          <OngvangcomvnReveal>
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-gray-400 antialiased">{service.category?.name || "Giải pháp Ong Vàng"}</p>
            <h1 className="!text-[clamp(30px,3.75vw,54px)] !leading-[1.05] font-medium tracking-tighter text-black antialiased max-w-4xl">{toVietnameseLabel(service.name)}</h1>
            <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-gray-500 antialiased">{service.description || "Giải pháp được thiết kế để giúp doanh nghiệp triển khai nhanh, đo lường rõ và tối ưu theo mục tiêu kinh doanh."}</p>
          </OngvangcomvnReveal>
        </div>
      </section>

      <section className="bg-white py-24 border-t border-[#eaeaea]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-6">
            {service.options.map((option, index) => (
              <OngvangcomvnReveal key={option.id} delay={index * 0.06}>
                <article className="rounded-3xl border border-[#eaeaea] bg-white p-8 transition-all duration-300 hover:border-gray-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between mb-8 border-b border-[#eaeaea] pb-8">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Gói {index + 1}</p>
                      <h2 className="text-[24px] font-medium tracking-tight text-black antialiased">{toVietnameseLabel(option.name)}</h2>
                      {option.description ? <p className="mt-3 text-[15px] leading-relaxed text-gray-500 antialiased max-w-md">{option.description}</p> : null}
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 block mb-1">Từ</span>
                      <p className="text-[24px] font-medium tracking-tight text-black antialiased">{money(option.price, option.currency)}</p>
                      {option.durationText ? <p className="mt-1 text-[13px] text-gray-500 antialiased">{option.durationText}{option.unit ? ` / ${option.unit}` : ""}</p> : null}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 mb-8">
                    {(features(option.featuresJson).length ? features(option.featuresJson) : ["Tư vấn mục tiêu", "Kế hoạch triển khai", "Báo cáo tối ưu"]).map((item) => (
                      <span key={item} className="flex items-start gap-3 text-[14px] font-medium tracking-tight text-gray-700 antialiased">
                        <span className="mt-0.5 text-black">✓</span>
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="border-t border-[#eaeaea] pt-6 flex justify-end">
                    <Link href={`/ongvangcomvn/dich-vu/${slug}/dang-ky?option=${encodeURIComponent(toVietnameseLabel(option.name))}`} className="inline-flex h-10 items-center justify-center rounded-full bg-black px-6 text-[14px] font-medium text-white transition-colors hover:bg-gray-800 antialiased">
                      Đăng ký gói này
                    </Link>
                  </div>
                </article>
              </OngvangcomvnReveal>
            ))}
          </div>
          <aside className="h-fit rounded-3xl border border-[#eaeaea] bg-[#fafafa] p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-black">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="text-[22px] font-medium tracking-tight text-black antialiased">Cần tư vấn gói phù hợp?</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-gray-500 antialiased">Đội ngũ Ong Vàng sẽ rà soát mục tiêu, ngân sách và kênh triển khai để đề xuất lộ trình phù hợp.</p>
            <Link href={`/ongvangcomvn/dich-vu/${slug}/dang-ky`} className="mt-8 inline-flex w-full justify-center rounded-full bg-black px-6 py-4 text-[14px] font-medium text-white transition-colors hover:bg-gray-800 antialiased">
              Đăng ký tư vấn
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
