import Image from "next/image";
import Link from "next/link";
import { BarChart3, HeartHandshake, Lightbulb, Target } from "lucide-react";
import { getOrganization, getServices, getCourses } from "./actions";
import { OngvangcomvnReveal } from "./_components/OngvangcomvnReveal";
import { OngvangcomvnCoursesCarousel } from "./_components/OngvangcomvnCoursesCarousel";
import { OngvangcomvnHorizontalCarousel } from "./_components/OngvangcomvnHorizontalCarousel";

// ─── Floating stat card helper ────────────────────────────────────
function StatCard({ label, value, sub, chart }: { label: string; value: string; sub?: string; chart?: number[] }) {
  return (
    <div className="w-52 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xl shadow-slate-200/60">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-900">{value}</p>
      {sub && (
        <p className="mt-0.5 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/>
          </svg>
          {sub}
        </p>
      )}
      {chart && (
        <div className="mt-2.5 flex items-end gap-0.5 h-8">
          {chart.map((h, i) => (
            <div key={i} className="flex-1 rounded-sm overflow-hidden bg-orange-50" style={{ height: "100%" }}>
              <div className="w-full rounded-sm bg-gradient-to-t from-orange-500 to-amber-400" style={{ height: `${h}%`, marginTop: `${100 - h}%` }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const serviceViText: Record<string, string> = {
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

function serviceLabel(value: string) {
  const trimmed = value.trim();
  return serviceViText[trimmed] ?? trimmed;
}

function OngvangcomvnServiceCard({ service, index }: { service: { name: string; description: string | null; options?: { id: string; name: string; price: unknown; currency: string; durationText: string | null; featuresJson: unknown }[] }, index: number }) {
  const icons = ["✦", "↗", "◎", "◇", "⌁", "◌"];
  return (
    <div className="group relative overflow-hidden rounded-lg border border-slate-200/80 bg-gradient-to-br from-white via-white to-orange-50/45 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_18px_45px_rgba(249,115,22,0.12)]">
      <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-amber-400 to-orange-500 transition-transform duration-300 group-hover:scale-x-100" />
      <div className="mb-5 flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-orange-100 bg-orange-50 text-2xl font-light text-orange-500 shadow-sm transition group-hover:rotate-3 group-hover:bg-orange-100">
          {icons[index % icons.length]}
        </div>
        <span className="text-xs font-bold text-orange-500">{[128, 96, 84, 72, 61][index % 5]} đã đăng ký</span>
      </div>
      <h3 className="mb-2 font-bold text-slate-900">{serviceLabel(service.name)}</h3>
      <p className="min-h-[66px] text-sm leading-relaxed text-slate-500">{service.description || "Giải pháp tối ưu hiệu quả đầu tư cho doanh nghiệp của bạn."}</p>
      {(service.options ?? []).length > 0 && (
        <div className="mt-5 divide-y divide-slate-100 border-y border-slate-100">
          {(service.options ?? []).slice(0, 2).map((opt) => {
            const price = Number(opt.price);
            const fp = price > 0 ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: opt.currency || "VND", maximumFractionDigits: 0 }).format(price) : "Liên hệ";
            const isPlanning = service.name.toLowerCase().includes("hoạch định");
            const planningCopy = [
              { tier: "Tư vấn chiến lược", detail: "Hoạch định truyền thông" },
              { tier: "Triển khai thực thi", detail: "Thực thi kế hoạch truyền thông" },
            ];
            const [rawTier = opt.name, ...detailParts] = opt.name.split(" - ");
            const optionIndex = (service.options ?? []).findIndex((item) => item.id === opt.id);
            const tier = isPlanning ? planningCopy[optionIndex]?.tier || rawTier : serviceLabel(rawTier);
            const detail = isPlanning ? planningCopy[optionIndex]?.detail || opt.name : serviceLabel(detailParts.join(" - ") || opt.name);
            return (
              <div key={opt.id} className="grid min-h-[66px] grid-cols-[1fr_auto] items-center gap-4 py-3">
                <div className="min-w-0">
                  <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-orange-500">{tier}</span>
                  <span className="mt-1 block text-sm font-semibold leading-5 text-slate-800">{detail}</span>
                </div>
                <div className="shrink-0 text-right">
                  {price > 0 ? <span className="block text-[10px] font-semibold uppercase text-slate-400">Từ</span> : null}
                  <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-sm font-black text-transparent">{fp}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Link href="/lien-he" className="mt-5 inline-flex w-full translate-y-0 items-center justify-between text-sm font-semibold text-slate-700 opacity-100 transition duration-200 hover:text-orange-600 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
        Tìm hiểu thêm
        <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-200 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-white">→</span>
      </Link>
    </div>
  );
}

function OngvangcomvnPlanningCard({ service }: { service: { name: string; description: string | null; options?: { id: string; name: string; price: unknown; currency: string }[] } }) {
  const optionCopy = [
    {
      tier: "Tư vấn chiến lược",
      detail: "Hoạch định truyền thông",
      description: "Biến mục tiêu kinh doanh thành một kế hoạch truyền thông rõ ràng, có thể triển khai ngay.",
      benefits: ["Bản đồ chiến lược & thông điệp", "Kế hoạch kênh theo từng giai đoạn", "Bộ KPI và ngân sách đề xuất"],
    },
    {
      tier: "Triển khai thực thi",
      detail: "Thực thi kế hoạch truyền thông",
      description: "Đội ngũ Ong Vàng đồng hành vận hành, đo lường và tối ưu để kế hoạch tạo ra kết quả thực tế.",
      benefits: ["Nội dung & lịch triển khai đồng bộ", "Vận hành các kênh đã thống nhất", "Báo cáo và tối ưu theo dữ liệu"],
    },
  ];
  return (
    <div className="relative mb-7 overflow-hidden rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-6 shadow-[0_18px_50px_rgba(249,115,22,0.1)] lg:grid lg:grid-cols-[1.1fr_1.9fr] lg:items-center lg:gap-8">
      <div className="min-w-0 lg:pr-0">
        <span className="text-[11px] font-black tracking-[0.16em] text-orange-500">OV-01</span>
        <h3 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-4xl lg:text-[inherit]">{service.name}</h3>
        <p className="mt-3 max-w-xl leading-7 text-slate-500">{service.description}</p>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:mt-0">
        {(service.options ?? []).slice(0, 2).map((option, index) => {
          const price = Number(option.price);
          const formattedPrice = price > 0 ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: option.currency || "VND", maximumFractionDigits: 0 }).format(price) : "Liên hệ";
          return (
            <Link key={option.id} href="/lien-he" className="group rounded-lg border border-orange-100 bg-white p-5 transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg">
              <span className="text-xs font-black uppercase tracking-[0.1em] text-orange-500">{optionCopy[index]?.tier}</span>
              <strong className="mt-2 block text-lg text-slate-900">{optionCopy[index]?.detail}</strong>
              <p className="mt-2 text-sm leading-6 text-slate-500">{optionCopy[index]?.description}</p>
              <div className="mt-4 space-y-2.5 border-t border-orange-50 pt-4">
                {optionCopy[index]?.benefits.map((benefit) => (
                  <span key={benefit} className="flex items-start gap-2 text-sm font-medium leading-5 text-slate-700">
                    <span aria-hidden className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-black text-white">✓</span>
                    {benefit}
                  </span>
                ))}
              </div>
              <span className="mt-5 flex items-end justify-between border-t border-orange-50 pt-4">
                <span className="text-xs text-slate-400">Từ</span>
                <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-lg font-black text-transparent">{formattedPrice}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────
export default async function OngvangcomvnMainPage() {
  const org = await getOrganization();
  const [services, courses] = org
    ? await Promise.all([getServices(org.id), getCourses(org.id)])
    : [[], []];

  const featuredServices = [...services]
    .sort((a, b) => Number(b.name.toLowerCase().includes("hoạch định")) - Number(a.name.toLowerCase().includes("hoạch định")))
    .slice(0, 6);
  const planningService = featuredServices.find((service) => service.name.toLowerCase().includes("hoạch định"));
  const carouselServices = featuredServices.filter((service) => service.id !== planningService?.id);
  const currentScheduleMonth = new Date();
  const scheduleMonthLabel = `tháng ${currentScheduleMonth.getMonth() + 1}/${currentScheduleMonth.getFullYear()}`;
  const formatScheduleDate = (date: Date) => ({
    day: new Intl.DateTimeFormat("vi-VN", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("vi-VN", { month: "2-digit" }).format(date),
    weekday: new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(date),
    label: new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" }).format(date),
  });
  const scheduleRowsFromBackend = courses
    .flatMap((course) => (course.classes ?? []).map((classItem) => ({ course, classItem })))
    .filter(({ classItem }) => {
      if (!classItem.startDate) return false;
      const date = classItem.startDate;
      return date.getMonth() === currentScheduleMonth.getMonth() && date.getFullYear() === currentScheduleMonth.getFullYear();
    })
    .sort((a, b) => Number(a.classItem.startDate) - Number(b.classItem.startDate))
    .slice(0, 4)
    .map(({ course, classItem }) => {
      const startDate = classItem.startDate ?? new Date();
      const endDate = classItem.endDate;
      const date = formatScheduleDate(startDate);
      const fee = Number(course.price) > 0
        ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: course.currency || "VND", maximumFractionDigits: 0 }).format(Number(course.price))
        : "Liên hệ";
      return {
        title: course.title,
        instructor: course.instructor?.name ?? "Ong Vàng Academy",
        instructorImage: course.instructor?.image ?? null,
        day: date.day,
        month: date.month,
        weekday: date.weekday,
        schedule: date.label,
        time: endDate
          ? `${new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(startDate)} - ${new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(endDate)}`
          : new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(startDate),
        fee,
      };
    });
  const fallbackScheduleDates = [8, 15, 22, 29].map((day, index) => new Date(currentScheduleMonth.getFullYear(), currentScheduleMonth.getMonth(), day, [19, 18, 19, 19][index], [30, 30, 0, 30][index]));
  const firstFallbackScheduleDate = fallbackScheduleDates[0] ?? new Date(currentScheduleMonth.getFullYear(), currentScheduleMonth.getMonth(), 8, 19, 30);
  const scheduleRows = scheduleRowsFromBackend.length > 0
    ? scheduleRowsFromBackend
    : courses.slice(0, 4).map((course, index) => {
      const startDate = fallbackScheduleDates[index] ?? firstFallbackScheduleDate;
      const date = formatScheduleDate(startDate);
      const fee = Number(course.price) > 0
        ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: course.currency || "VND", maximumFractionDigits: 0 }).format(Number(course.price))
        : "Liên hệ";
      return {
        title: course.title,
        instructor: course.instructor?.name ?? ["Nguyễn Minh Anh", "Trần Quốc Bảo", "Lê Thu Hà", "Phạm Gia Huy"][index % 4],
        instructorImage: course.instructor?.image ?? [
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80",
        ][index % 4],
        day: date.day,
        month: date.month,
        weekday: date.weekday,
        schedule: date.label,
        time: `${new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(startDate)} - ${new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(new Date(startDate.getTime() + 2 * 60 * 60 * 1000))}`,
        fee,
      };
    });

  return (
    <>
      {/* ═══════════════════════════ HERO ═══════════════════════════ */}
      <section className="relative min-h-screen overflow-hidden bg-[#EEF2FF] flex items-center">

        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://ovc.vn/wp-content/uploads/2025/07/bg-slide.webp"
            alt="Hoạt động thực tế tại Ong Vàng"
            className="h-full w-full object-cover opacity-[0.16]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#EEF2FF] via-[#EEF2FF]/95 to-[#EEF2FF]/70" />
        </div>

        {/* Floating stat cards — left */}
        <div className="hidden 2xl:flex flex-col gap-4 absolute left-8 top-1/3 z-10">
          <OngvangcomvnReveal direction="left" delay={0.6}>
            <StatCard label="Khách hàng" value="500+" sub="+18.5% tháng này" />
          </OngvangcomvnReveal>
          <OngvangcomvnReveal direction="left" delay={0.75}>
            <StatCard label="Hiệu quả trung bình" value="3.8x" />
          </OngvangcomvnReveal>
        </div>

        {/* Floating stat cards — right */}
        <div className="hidden xl:flex flex-col gap-4 absolute right-8 top-1/4 z-10">
          <OngvangcomvnReveal direction="right" delay={0.65}>
            <StatCard label="Dự án hoàn thành" value="1,200+" chart={[40,65,45,80,60,90,75]} />
          </OngvangcomvnReveal>
          <OngvangcomvnReveal direction="right" delay={0.8}>
            <StatCard label="Tỉ lệ hài lòng" value="98%" sub="Đánh giá 5 sao" />
          </OngvangcomvnReveal>
        </div>

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-7xl w-full px-6 pt-36 pb-28">
          <div className="max-w-5xl">

            {/* Eyebrow label */}
            <OngvangcomvnReveal>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-semibold text-orange-600">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
                </span>
                Thế hệ sáng tạo mới tại Ong Vàng
              </div>
            </OngvangcomvnReveal>

            {/* Headline — bold Inter, FSTACK style */}
            <h1 className="ongvangcomvn-hero-title font-black leading-[0.88] tracking-[0] text-slate-900">
              <OngvangcomvnReveal>
                <span className="block">Tư duy chiến lược</span>
              </OngvangcomvnReveal>
              <OngvangcomvnReveal delay={0.08}>
                <span className="block">Hành động hiệu quả</span>
              </OngvangcomvnReveal>
              <OngvangcomvnReveal delay={0.16}>
                <span className="block bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                  Phát triển bền vững.
                </span>
              </OngvangcomvnReveal>
            </h1>

            <OngvangcomvnReveal delay={0.28}>
              <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-lg">
                {org?.description || "Đối tác chiến lược đồng hành cùng doanh nghiệp trên hành trình chuyển đổi xanh, chuyển đổi số và phát triển bền vững qua Branding, Marketing, Training và Traveling."}
              </p>
            </OngvangcomvnReveal>

            <OngvangcomvnReveal delay={0.38}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/dich-vu" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-7 py-3.5 font-bold uppercase text-white shadow-lg shadow-orange-200 transition-all hover:scale-105 hover:shadow-orange-300 active:scale-95">
                  Khám phá dịch vụ
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
                <Link href="/lien-he" className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-7 py-3.5 font-semibold uppercase text-slate-700 transition-all hover:border-orange-300 hover:text-orange-600 active:scale-95">
                  Xem Case Study
                </Link>
              </div>
            </OngvangcomvnReveal>

            {/* Avatar row */}
            <OngvangcomvnReveal delay={0.48}>
              <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex -space-x-2">
                  {["NL","TM","PH","BT","VA"].map((init, i) => (
                    <div key={i} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-sm"
                      style={{ background: ["#F97316","#F59E0B","#EF4444","#8B5CF6","#10B981"][i] }}>
                      {init}
                    </div>
                  ))}
                </div>
                <div className="text-sm leading-relaxed">
                  <p className="font-bold text-slate-900">Đồng hành cùng doanh nghiệp Việt</p>
                  <p className="text-slate-500">sáng tạo, tận tâm và bền vững</p>
                </div>
              </div>
            </OngvangcomvnReveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════ TRUSTED BY / PLATFORM STRIP ════════════ */}
      <section className="border-y border-slate-200/60 bg-white py-5">
        <div className="mb-3 px-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Hệ sinh thái Ong Vàng</p>
        </div>
        <div className="overflow-hidden">
          <div className="marquee-track flex w-max gap-8 whitespace-nowrap">
            {[...Array(4)].map((_, round) =>
              ["Branding", "Marketing", "Training", "Traveling", "Chuyển đổi số"].map((p) => (
                <span key={`${round}-${p}`} className="cursor-default bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-base font-black uppercase text-transparent transition-opacity hover:opacity-70">
                  {p}
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS ══════════════════════════════════ */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { v: "500+", l: "Dự án" },
              { v: "100+", l: "Chiến dịch" },
              { v: "300+", l: "Khách hàng" },
              { v: "20+", l: "Đối tác" },
            ].map((s, i) => (
              <OngvangcomvnReveal key={s.l} delay={i * 0.08}>
                <div className="text-center">
                  <p className="ongvangcomvn-stat-value font-black bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">{s.v}</p>
                  <p className="ongvangcomvn-stat-label mt-3 font-semibold text-slate-500">{s.l}</p>
                </div>
              </OngvangcomvnReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ COMPANY INTRO ══════════════════════════ */}
      <section id="about" className="ongvangcomvn-values-section relative scroll-mt-32 overflow-hidden py-20">
        <div className="pointer-events-none absolute inset-x-0 top-2 hidden justify-center overflow-hidden select-none md:flex" aria-hidden="true">
          <span className="ongvangcomvn-solutions-ghost whitespace-nowrap text-[20vw] font-black uppercase leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            ABOUT
          </span>
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="grid min-w-0 gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="min-w-0 max-w-full lg:max-w-2xl">
              <OngvangcomvnReveal>
                <p className="mb-2 text-sm font-bold uppercase tracking-widest text-orange-500">Giới thiệu Ong Vàng</p>
              </OngvangcomvnReveal>
              <OngvangcomvnReveal delay={0.1}>
                <h2 className="ongvangcomvn-feature-title font-black tracking-[0] text-slate-900">
                  Đồng hành cùng doanh nghiệp phát triển thương hiệu bền vững.
                </h2>
              </OngvangcomvnReveal>
              <OngvangcomvnReveal delay={0.2}>
                <p className="mt-5 text-lg leading-8 text-slate-600">
                  Ong Vàng là đơn vị tư vấn và triển khai giải pháp Branding, Marketing, Training và Traveling cho doanh nghiệp Việt. Chúng tôi kết hợp tư duy chiến lược, năng lực sáng tạo và kinh nghiệm thực thi để biến mục tiêu tăng trưởng thành kế hoạch rõ ràng, đo lường được.
                </p>
              </OngvangcomvnReveal>
              <OngvangcomvnReveal delay={0.3}>
                <div className="mt-7 grid min-w-0 gap-4 sm:grid-cols-2">
                  {[
                    "Tư vấn chiến lược thương hiệu và truyền thông",
                    "Triển khai marketing đa kênh theo mục tiêu kinh doanh",
                    "Đào tạo đội ngũ bằng chương trình thực tiễn",
                    "Phát triển dự án xanh, du lịch và cộng đồng",
                  ].map((item) => (
                    <div key={item} className="flex min-w-0 gap-3 rounded-lg border border-orange-100 bg-white/80 p-4 shadow-sm">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-[11px] font-black text-white">✓</span>
                      <span className="text-sm font-semibold leading-6 text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </OngvangcomvnReveal>
              <OngvangcomvnReveal delay={0.4}>
                <Link href="/lien-he" className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-7 py-3.5 text-sm font-bold uppercase text-white shadow-lg shadow-orange-200 transition-all hover:scale-105 hover:shadow-orange-300 active:scale-95">
                  Tư vấn cùng Ong Vàng <span>→</span>
                </Link>
              </OngvangcomvnReveal>
            </div>

            <OngvangcomvnReveal direction="left" delay={0.15} className="min-w-0">
              <div className="relative w-full max-w-full overflow-hidden rounded-2xl border border-white bg-white shadow-2xl shadow-orange-100/70">
                <div className="relative aspect-[4/3] min-h-[260px] sm:min-h-[360px]">
                  <Image
                    src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85"
                    alt="Đội ngũ Ong Vàng tư vấn chiến lược cùng doanh nghiệp"
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
                </div>
                <div className="ongvangcomvn-floating-badge absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/70 bg-white/92 px-3 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-slate-800 shadow-xl backdrop-blur sm:left-5 sm:top-5 sm:px-4 sm:text-xs">
                  <Lightbulb className="h-4 w-4 text-orange-500" />
                  Sáng tạo
                </div>
                <div className="ongvangcomvn-floating-badge ongvangcomvn-floating-badge-delay-1 absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/70 bg-white/92 px-3 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-slate-800 shadow-xl backdrop-blur sm:right-5 sm:top-8 sm:px-4 sm:text-xs">
                  <Target className="h-4 w-4 text-orange-500" />
                  Chiến lược
                </div>
                <div className="ongvangcomvn-floating-badge ongvangcomvn-floating-badge-delay-2 absolute right-6 top-[42%] hidden items-center gap-2 rounded-full border border-white/70 bg-white/92 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-800 shadow-xl backdrop-blur sm:flex">
                  <BarChart3 className="h-4 w-4 text-orange-500" />
                  +35% tăng trưởng
                </div>
                <div className="ongvangcomvn-floating-badge ongvangcomvn-floating-badge-delay-3 absolute left-6 top-[50%] hidden items-center gap-2 rounded-full border border-white/70 bg-white/92 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-800 shadow-xl backdrop-blur sm:flex">
                  <HeartHandshake className="h-4 w-4 text-orange-500" />
                  Đồng hành
                </div>
                <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-white/92 p-4 shadow-xl backdrop-blur sm:bottom-5 sm:left-5 sm:right-5 sm:p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-orange-500">Sứ mệnh</p>
                  <p className="mt-2 text-lg font-black leading-tight text-slate-900 sm:text-xl">Sáng tạo có chiến lược, thực thi có trách nhiệm.</p>
                </div>
              </div>
            </OngvangcomvnReveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SERVICES FROM DB ═══════════════════════ */}
      {featuredServices.length > 0 && (
        <section id="services" className="relative scroll-mt-32 overflow-hidden bg-white py-24">
          {/* Ghosted BG text */}
          <div className="pointer-events-none absolute -top-2 right-0 left-[28%] hidden justify-end overflow-hidden select-none lg:flex" aria-hidden="true">
            <span className="ongvangcomvn-solutions-ghost ongvangcomvn-services-ghost whitespace-nowrap text-[13vw] font-black uppercase leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              SOLUTIONS
            </span>
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-6">
            <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <OngvangcomvnReveal><p className="mb-2 text-sm font-bold uppercase tracking-widest text-orange-500">Giải pháp của chúng tôi</p></OngvangcomvnReveal>
                <OngvangcomvnReveal delay={0.1}>
                  <h2 className="ongvangcomvn-solutions-title font-black tracking-[0] text-slate-950">
                    Giải pháp <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">marketing.</span><br />Chiến lược truyền thông
                  </h2>
                </OngvangcomvnReveal>
              </div>
              <OngvangcomvnReveal direction="left">
                <Link href="/dich-vu" className="inline-flex items-center gap-2 rounded-full border border-orange-200 px-5 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition-all">
                  Xem tất cả dịch vụ →
                </Link>
              </OngvangcomvnReveal>
            </div>
            {planningService ? <OngvangcomvnPlanningCard service={{ ...planningService, options: planningService.options.map((option) => ({ ...option, price: Number(option.price) })) }} /> : null}
            <OngvangcomvnHorizontalCarousel>
              {carouselServices.map((service, i) => (
                <OngvangcomvnReveal key={service.id} delay={i * 0.08} className="w-[86vw] max-w-[390px] shrink-0 snap-start sm:w-[calc((100%_-_20px)/2)] lg:w-[calc((100%_-_40px)/3)] lg:max-w-none">
                  <OngvangcomvnServiceCard
                    service={{
                      name: service.name,
                      description: service.description,
                      options: (service.options ?? []).map((o) => ({ ...o, price: Number(o.price) })),
                    }}
                    index={i + 1}
                  />
                </OngvangcomvnReveal>
              ))}
            </OngvangcomvnHorizontalCarousel>
          </div>
        </section>
      )}

      {/* ═══════════════════ PROJECTS FROM ONG VANG NEW ════════════ */}
      <section id="projects" className="relative scroll-mt-32 overflow-hidden bg-[#f8f6f2] py-24">
        <div className="pointer-events-none absolute inset-x-0 top-2 hidden justify-center overflow-hidden select-none md:flex" aria-hidden="true">
          <span className="ongvangcomvn-solutions-ghost whitespace-nowrap text-[20vw] font-black uppercase leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            PROJECT
          </span>
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <OngvangcomvnReveal><p className="mb-2 text-sm font-bold uppercase tracking-widest text-orange-500">Dự án tiêu biểu</p></OngvangcomvnReveal>
              <OngvangcomvnReveal delay={0.1}>
                <h2 className="ongvangcomvn-section-title font-black text-slate-900">Giá trị khách hàng.<br /><span className="text-orange-500">Cam kết với uy tín.</span></h2>
              </OngvangcomvnReveal>
            </div>
            <OngvangcomvnReveal direction="left">
              <Link href="/du-an" className="text-sm font-bold text-orange-600 hover:text-orange-500">Xem tất cả dự án →</Link>
            </OngvangcomvnReveal>
          </div>
          <OngvangcomvnReveal>
            <div className="rounded-lg border border-orange-100 bg-white/80 p-10 text-center shadow-sm">
              <p className="text-sm font-normal uppercase tracking-[0.18em] text-orange-500">Đang tải dữ liệu</p>
              <h3 className="mt-3 text-3xl font-normal text-slate-950">Dự án tiêu biểu đang được cập nhật.</h3>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Ong Vàng đang đồng bộ dữ liệu dự án từ hệ thống nội bộ. Nội dung sẽ hiển thị khi danh sách dự án thật sẵn sàng.
              </p>
            </div>
          </OngvangcomvnReveal>
        </div>
      </section>

      {/* ═══════════════════ MARQUEE ═════════════════════════════════ */}
      <div className="hidden overflow-hidden border-y border-slate-100 bg-[#EEF2FF] py-5 md:block">
        <div className="marquee-track ongvangcomvn-topic-track flex gap-10 whitespace-nowrap">
          {[...Array(3)].map((_, ri) =>
            ["Quảng cáo Facebook","Quảng cáo Google","SEO & Nội dung","Quảng cáo TikTok","Tiếp thị Email","Đào tạo thực chiến","Zalo OA","CRM & Tự động hóa"].map((item) => (
              <span key={`${ri}-${item}`} className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                {item} <span className="text-orange-300 mx-4">✦</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* ═══════════════════ COURSES FROM DB ════════════════════════ */}
      {courses.length > 0 && (
        <section id="training" className="relative scroll-mt-32 overflow-hidden bg-[#f8f6f2] py-24">
          <div className="pointer-events-none absolute inset-x-0 top-2 hidden justify-center overflow-hidden select-none md:flex" aria-hidden="true">
            <span className="ongvangcomvn-solutions-ghost ongvangcomvn-training-ghost whitespace-nowrap text-[18vw] font-black uppercase leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              TRAINING
            </span>
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-6">
            <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <OngvangcomvnReveal><p className="mb-2 text-sm font-bold uppercase tracking-widest text-orange-500">Khóa học nổi bật</p></OngvangcomvnReveal>
                <OngvangcomvnReveal delay={0.1}><h2 className="ongvangcomvn-section-title font-black tracking-tight text-slate-900">Học thông minh.<br />Ứng dụng hiệu quả.</h2></OngvangcomvnReveal>
              </div>
              <OngvangcomvnReveal direction="left">
                <Link href="/khoa-hoc" className="inline-flex items-center gap-2 rounded-full border border-orange-200 px-5 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition-all">
                  Xem tất cả khóa học →
                </Link>
              </OngvangcomvnReveal>
            </div>
            <OngvangcomvnCoursesCarousel courses={courses.map((course) => ({ ...course, price: Number(course.price) }))} />
            <OngvangcomvnReveal delay={0.15}>
              <div className="mt-12 rounded-2xl border border-white/80 bg-white/80 p-5 shadow-xl shadow-blue-100/50 backdrop-blur">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-500">Lịch khai giảng</p>
                    <h3 className="mt-1 text-[28px] font-semibold leading-tight text-slate-950 sm:text-3xl md:font-black">Các lớp mở trong {scheduleMonthLabel}</h3>
                  </div>
                  <Link href="/lien-he" className="text-sm font-bold text-orange-600 hover:text-orange-500">Giữ chỗ tư vấn →</Link>
                </div>
                <div className="grid gap-3 md:hidden">
                  {scheduleRows.map((item) => (
                    <article key={`${item.title}-${item.schedule}-mobile`} className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                          <span className="text-[10px] font-black uppercase leading-none">{item.weekday}</span>
                          <span className="mt-1 text-base font-black leading-none">{item.day}/{item.month}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-lg font-medium leading-snug text-slate-950">{item.title}</h4>
                          <div className="mt-3 flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-600">
                            {item.instructorImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.instructorImage} alt={item.instructor} className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-orange-100" />
                            ) : (
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[10px] font-black text-orange-600">{item.instructor.slice(0, 2).toUpperCase()}</span>
                            )}
                            <span className="min-w-0 truncate">{item.instructor}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-orange-50 pt-4 text-sm">
                        <div>
                          <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Ngày học</span>
                          <strong className="mt-1 block text-orange-600">{item.schedule}</strong>
                        </div>
                        <div>
                          <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Thời gian</span>
                          <strong className="mt-1 block text-slate-700">{item.time}</strong>
                        </div>
                        <div>
                          <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Học phí</span>
                          <strong className="mt-1 block text-slate-950">{item.fee}</strong>
                        </div>
                        <Link href="/lien-he" className="flex h-10 items-center justify-center self-end rounded-full bg-orange-50 px-4 text-sm font-black text-orange-600 ring-1 ring-orange-100 transition hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-600 hover:text-white" aria-label={`Đăng ký ${item.title}`}>
                          Đăng ký →
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="hidden overflow-hidden rounded-lg border border-orange-100 bg-white md:block">
                  {scheduleRows.map((item) => (
                    <div key={`${item.title}-${item.schedule}`} className="grid gap-4 border-b border-orange-50 px-4 py-3 text-sm transition last:border-b-0 hover:bg-orange-50/45 md:grid-cols-[74px_minmax(0,1.55fr)_minmax(0,1.3fr)_120px_112px_120px_40px] md:items-center">
                      <div className="rounded-lg bg-orange-50 px-3 py-2 text-center text-orange-600">
                        <span className="block text-[10px] font-bold uppercase leading-none">{item.weekday}</span>
                        <span className="mt-1 block whitespace-nowrap text-sm font-black leading-none">{item.day}/{item.month}</span>
                      </div>
                      <span className="min-w-0 text-sm font-semibold leading-snug text-slate-950">{item.title}</span>
                      <span className="flex min-w-0 items-center gap-2 font-semibold text-slate-600">
                        {item.instructorImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.instructorImage} alt={item.instructor} className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-orange-100" />
                        ) : (
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[10px] font-black text-orange-600">{item.instructor.slice(0, 2).toUpperCase()}</span>
                        )}
                        <span className="truncate">{item.instructor}</span>
                      </span>
                      <span className="text-xs font-bold text-orange-600">{item.schedule}</span>
                      <span className="text-xs font-semibold text-slate-500">{item.time}</span>
                      <span className="text-sm font-black text-slate-950">{item.fee}</span>
                      <Link href="/lien-he" aria-label={`Đăng ký ${item.title}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-lg font-black text-orange-600 transition hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-600 hover:text-white">
                        →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </OngvangcomvnReveal>
          </div>
        </section>
      )}

      {/* ═══════════════════ TESTIMONIALS ════════════════════════════ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <OngvangcomvnReveal><p className="mb-2 text-sm font-bold uppercase tracking-widest text-orange-500">Khách hàng nói gì</p></OngvangcomvnReveal>
              <OngvangcomvnReveal delay={0.1}><h2 className="ongvangcomvn-section-title text-slate-900">Lời cảm ơn là một lời động viên<br />dành cho chúng mình.</h2></OngvangcomvnReveal>
            </div>
            <OngvangcomvnReveal direction="left">
              <div className="flex items-center gap-1 text-sm font-semibold text-slate-500">
                <span className="text-amber-400 text-base">★★★★★</span> Điểm trung bình 4,9/5
              </div>
            </OngvangcomvnReveal>
          </div>
          <OngvangcomvnHorizontalCarousel>
            {[
              { name: "Nguyễn Thị Lan", role: "Quản lý Marketing", text: "Chiến dịch quảng cáo Facebook giúp chúng tôi tăng 3 lần doanh thu trong 2 tháng. Báo cáo rõ ràng, đội ngũ cực kỳ chuyên nghiệp.", avatar: "NL", stars: 5 },
              { name: "Trần Văn Minh", role: "Giám đốc doanh nghiệp", text: "Đã làm với nhiều đơn vị nhưng Ong Vàng là đội thực sự hiểu hoạt động kinh doanh và tạo ra kết quả đo lường được.", avatar: "TM", stars: 5 },
              { name: "Phạm Thu Hà", role: "Nhà sáng lập", text: "Khóa học thực chiến, áp dụng được ngay. Sau khóa tôi có thể tự chạy quảng cáo và tiết kiệm đáng kể chi phí thuê ngoài.", avatar: "PH", stars: 5 },
            ].map((item, i) => (
              <OngvangcomvnReveal key={item.name} delay={i * 0.1} className="w-[82vw] max-w-[360px] shrink-0 snap-start sm:w-[calc((100%_-_40px)/3)] sm:max-w-none">
                <div className="rounded-2xl border border-slate-100 bg-[#EEF2FF] p-6 hover:border-orange-100 transition-colors h-full flex flex-col">
                  <div className="mb-3 text-amber-400 text-sm">{"★".repeat(item.stars)}</div>
                  <p className="flex-1 text-sm text-slate-600 leading-relaxed italic mb-5">&ldquo;{item.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-xs font-bold text-white">
                      {item.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.role}</p>
                    </div>
                  </div>
                </div>
              </OngvangcomvnReveal>
            ))}
          </OngvangcomvnHorizontalCarousel>
        </div>
      </section>

      {/* ═══════════════════ CTA BANNER ══════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#171717] py-20">
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-8 text-center lg:flex-row">
            <div className="mx-auto max-w-4xl lg:mx-0">
              <OngvangcomvnReveal>
                <h2 className="ongvangcomvn-section-title text-white">
                  Khởi động nhanh. Tăng trưởng thông minh.<br />
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Hệ sinh thái giải pháp toàn diện.</span>
                </h2>
              </OngvangcomvnReveal>
            </div>
            <OngvangcomvnReveal direction="left" delay={0.2}>
              <Link href="/dich-vu" className="shrink-0 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-orange-900/30 transition-all hover:scale-105 active:scale-95">
                Khám phá Dịch vụ
              </Link>
            </OngvangcomvnReveal>
          </div>
        </div>
      </section>
    </>
  );
}
