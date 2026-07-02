import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { getOrganization, getServiceBySlug } from "../../actions";
import { OvReveal } from "../../_components/OvReveal";

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
  const url = `/ovmain/dich-vu/${slug}`;

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

export default async function OvServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = await getOrganization();
  if (!org) notFound();
  const service = await getServiceBySlug(org.id, slug);
  if (!service || service.status !== "ACTIVE") notFound();

  return (
    <>
      <section className="relative overflow-hidden bg-[#f8f6f2] pt-40 pb-20">
        <div className="pointer-events-none absolute inset-x-0 top-2 hidden justify-center overflow-hidden select-none md:flex" aria-hidden>
          <span className="ovmain-solutions-ghost whitespace-nowrap text-[18vw] font-normal uppercase leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>DICH VU</span>
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <Link href="/ovmain/dich-vu" className="mb-8 inline-flex items-center gap-2 text-sm font-normal text-orange-600 hover:text-orange-500"><ArrowLeft className="h-4 w-4" /> Dịch vụ</Link>
          <OvReveal>
            <p className="mb-3 text-sm font-normal uppercase tracking-widest text-orange-500">{service.category?.name || "Giải pháp Ong Vàng"}</p>
            <h1 className="ovmain-page-title max-w-4xl tracking-[0] text-slate-950">{toVietnameseLabel(service.name)}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{service.description || "Giải pháp được thiết kế để giúp doanh nghiệp triển khai nhanh, đo lường rõ và tối ưu theo mục tiêu kinh doanh."}</p>
          </OvReveal>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-5">
            {service.options.map((option, index) => (
              <OvReveal key={option.id} delay={index * 0.06}>
                <article className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm transition hover:border-orange-200 hover:shadow-md">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-normal uppercase tracking-[0.16em] text-orange-500">Gói {index + 1}</p>
                      <h2 className="ovmain-card-title mt-2 text-slate-950">{toVietnameseLabel(option.name)}</h2>
                      {option.description ? <p className="mt-2 text-sm leading-6 text-slate-500">{option.description}</p> : null}
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <span className="text-xs font-normal uppercase text-slate-400">Từ</span>
                      <p className="text-2xl font-normal text-orange-600">{money(option.price, option.currency)}</p>
                      {option.durationText ? <p className="text-xs font-normal text-slate-400">{option.durationText}{option.unit ? ` / ${option.unit}` : ""}</p> : null}
                    </div>
                  </div>
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {(features(option.featuresJson).length ? features(option.featuresJson) : ["Tư vấn mục tiêu", "Kế hoạch triển khai", "Báo cáo tối ưu"]).map((item) => (
                      <span key={item} className="flex items-center gap-2 text-sm font-normal text-slate-600"><Check className="h-4 w-4 text-orange-500" />{item}</span>
                    ))}
                  </div>
                </article>
              </OvReveal>
            ))}
          </div>
          <aside className="h-fit rounded-2xl bg-[#f8f6f2] p-6 shadow-sm">
            <Sparkles className="h-8 w-8 text-orange-500" />
            <h2 className="ovmain-card-title mt-4 text-slate-950">Cần tư vấn gói phù hợp?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Đội ngũ Ong Vàng sẽ rà soát mục tiêu, ngân sách và kênh triển khai để đề xuất lộ trình phù hợp.</p>
            <Link href="/ovmain/lien-he" className="mt-6 inline-flex w-full justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-normal uppercase text-white shadow-lg shadow-orange-200">Tư vấn miễn phí</Link>
          </aside>
        </div>
      </section>
    </>
  );
}
