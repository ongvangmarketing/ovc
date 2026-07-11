import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getOrganization, getServices, getCourses } from "./actions";
import { OngvangcomvnReveal } from "./_components/OngvangcomvnReveal";
import { OngvangcomvnCoursesCarousel } from "./_components/OngvangcomvnCoursesCarousel";
import { OngvangcomvnHorizontalCarousel } from "./_components/OngvangcomvnHorizontalCarousel";

// ─── Floating stat card helper ────────────────────────────────────
function StatCard({ label, value, sub, chart }: { label: string; value: string; sub?: string; chart?: number[] }) {
  return (
    <div className="w-52 rounded-lg border border-[#eaeaea] bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      <p className="text-4xl font-medium tracking-tighter text-black">{value}</p>
      {sub && (
        <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-black">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/>
          </svg>
          {sub}
        </p>
      )}
      {chart && (
        <div className="mt-5 flex items-end gap-[2px] h-10">
          {chart.map((h, i) => (
            <div key={i} className="flex-1 bg-gray-100" style={{ height: "100%" }}>
              <div className="w-full bg-black" style={{ height: `${h}%`, marginTop: `${100 - h}%` }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// No translation map, using raw backend names

function OngvangcomvnServiceCard({ service, index }: { service: { slug?: string; name: string; description: string | null; options?: { id: string; name: string; price: unknown; currency: string; durationText: string | null; featuresJson: unknown }[] }, index: number }) {
  const icons = ["✦", "↗", "◎", "◇", "⌁", "◌"];
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#eaeaea] bg-white p-8 transition-colors duration-200 hover:border-gray-300">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#eaeaea] bg-gray-50 text-2xl font-light text-black">
          {icons[index % icons.length]}
        </div>
        <span className="rounded-full border border-[#eaeaea] bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-black">
          {[128, 96, 84, 72, 61][index % 5]} Khách hàng
        </span>
      </div>
      <h3 className="mb-3 text-[24px] font-medium tracking-tight text-black">{service.name}</h3>
      <p className="min-h-[66px] text-[15px] leading-relaxed text-gray-500">{service.description || "Giải pháp tối ưu hiệu quả đầu tư cho doanh nghiệp của bạn."}</p>
      {(service.options ?? []).length > 0 && (
        <div className="mt-8 divide-y divide-[#eaeaea] border-y border-[#eaeaea]">
          {(service.options ?? []).slice(0, 2).map((opt) => {
            const price = Number(opt.price);
            const fp = price > 0 ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: opt.currency || "VND", maximumFractionDigits: 0 }).format(price) : "Liên hệ";
            return (
              <div key={opt.id} className="grid min-h-[66px] grid-cols-[1fr_auto] items-center gap-4 py-5">
                <div className="min-w-0">
                  <span className="block text-[15px] font-medium tracking-tight leading-5 text-black antialiased">{opt.name}</span>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-[15px] font-medium tracking-tight text-black antialiased">{fp}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Link href={service.slug ? `/ongvangcomvn/dich-vu/${service.slug}` : "/ongvangcomvn/lien-he"} className="mt-8 inline-flex w-full items-center justify-between text-[14px] font-medium tracking-tight text-black hover:text-gray-500 transition-colors antialiased">
        Tìm hiểu thêm
        <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-full border border-[#eaeaea] transition-colors group-hover:bg-black group-hover:text-white">→</span>
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
    <div className="mb-12 rounded-2xl border border-[#eaeaea] bg-white p-6 md:p-10 lg:grid lg:grid-cols-[0.95fr_1.55fr] lg:gap-12">
      <div className="min-w-0 lg:pr-0">
        <span className="text-[12px] font-semibold uppercase tracking-widest text-gray-400">Dịch vụ cốt lõi</span>
        <h3 className="!text-[clamp(30px,3.7vw,50px)] !leading-[1.04] mt-4 font-medium tracking-tighter text-black">{service.name}</h3>
        <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-gray-500">{service.description}</p>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:mt-0">
        {(service.options ?? []).slice(0, 2).map((option, index) => {
          const price = Number(option.price);
          const formattedPrice = price > 0 ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: option.currency || "VND", maximumFractionDigits: 0 }).format(price) : "Liên hệ";
          return (
            <Link
              key={option.id}
              href="/ongvangcomvn/lien-he"
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-300 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-black/30 hover:shadow-[0_16px_55px_rgba(15,23,42,0.12)]"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">{optionCopy[index]?.tier}</span>
                  <span className="rounded-full bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">Quan trọng</span>
                </div>
                <strong className="mt-3 block text-[22px] font-semibold leading-tight tracking-tight text-black antialiased">{optionCopy[index]?.detail}</strong>
                <p className="mt-2 text-[14px] leading-6 text-gray-600 antialiased">{optionCopy[index]?.description}</p>
                <div className="mt-5 space-y-2.5 border-t border-[#eaeaea] pt-4">
                  {optionCopy[index]?.benefits.map((benefit) => (
                    <span key={benefit} className="flex items-start gap-2.5 text-[13px] font-semibold leading-5 tracking-tight text-gray-800 antialiased">
                      <span aria-hidden className="mt-0.5 text-black">✓</span>
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
              <span className="relative z-10 mt-5 flex items-center justify-between border-t border-[#eaeaea] pt-4">
                <span className="text-[11px] uppercase tracking-widest text-gray-400">Chỉ từ</span>
                <span className="text-[20px] font-medium tracking-tight text-black antialiased">{formattedPrice}</span>
              </span>
              {/* Subtle hover gradient background */}
              <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-gray-50/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
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
  const scheduleMonthLabel = `${currentScheduleMonth.getMonth() + 1}/${currentScheduleMonth.getFullYear()}`;
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
        instructor: course.instructor?.name ?? "Ong Vàng",
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
        instructor: course.instructor?.name ?? ["M. Anh", "Q. Bảo", "T. Hà", "G. Huy"][index % 4],
        instructorImage: course.instructor?.image ?? null,
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
      <style dangerouslySetInnerHTML={{ __html: `
        .sunken-bg-text {
          font-size: clamp(150px, 25vw, 400px);
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.05em;
          color: #f7f7f7;
          text-shadow: inset 2px 2px 5px rgba(0,0,0,0.03), 1px 1px 1px rgba(0,0,0,0.02), -1px -1px 1px #fff;
          white-space: nowrap;
        }
        .bg-grid-pattern {
          background-image: linear-gradient(to right, #eaeaea 1px, transparent 1px), linear-gradient(to bottom, #eaeaea 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(circle at center, black, transparent 80%);
          -webkit-mask-image: radial-gradient(circle at center, black, transparent 80%);
        }
        .ai-orb-3d {
          transform-style: preserve-3d;
          animation: ai-orb-float 5.5s ease-in-out infinite;
        }
        .ai-orb-core {
          transform-style: preserve-3d;
          animation: ai-orb-spin 8s linear infinite;
        }
        .ai-orb-ring {
          transform-style: preserve-3d;
          animation: ai-orb-ring 6s ease-in-out infinite;
        }
        .ai-orb-node {
          box-shadow: 0 0 22px rgba(0, 0, 0, 0.12);
        }
        @keyframes ai-orb-float {
          0%, 100% { transform: translate3d(0, 0, 0) rotateX(58deg) rotateZ(-12deg); }
          50% { transform: translate3d(0, -10px, 0) rotateX(58deg) rotateZ(6deg); }
        }
        @keyframes ai-orb-spin {
          from { transform: rotateZ(0deg); }
          to { transform: rotateZ(360deg); }
        }
        @keyframes ai-orb-ring {
          0%, 100% { transform: rotateX(72deg) rotateZ(0deg) scale(1); opacity: 0.52; }
          50% { transform: rotateX(72deg) rotateZ(180deg) scale(1.06); opacity: 0.82; }
        }
      `}} />
      <section className="relative min-h-[90vh] bg-white flex items-center border-b border-[#eaeaea] antialiased overflow-hidden">
        {/* Next Gen Tech Grid & Glow */}
        <div className="absolute inset-0 z-0 bg-grid-pattern opacity-50"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gray-100 rounded-full blur-[100px] opacity-60 z-0 mix-blend-multiply"></div>
        
        {/* Giant Sunken Background Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none flex items-center justify-center opacity-70">
          <span className="sunken-bg-text">ONG VANG</span>
        </div>
        
        {/* Floating stat cards — left */}
        <div className="hidden 2xl:flex flex-col gap-6 absolute left-12 top-1/3 z-10">
          <OngvangcomvnReveal direction="left" delay={0.6}>
            <StatCard label="Khách hàng" value="500+" sub="Tăng 18.5%" />
          </OngvangcomvnReveal>
          <OngvangcomvnReveal direction="left" delay={0.75}>
            <StatCard label="Hiệu quả" value="3.8x" />
          </OngvangcomvnReveal>
        </div>

        {/* Floating stat cards — right */}
        <div className="hidden xl:flex flex-col gap-6 absolute right-12 top-1/4 z-10">
          <OngvangcomvnReveal direction="right" delay={0.65}>
            <StatCard label="Dự án" value="1,200+" chart={[40,65,45,80,60,90,75]} />
          </OngvangcomvnReveal>
          <OngvangcomvnReveal direction="right" delay={0.8}>
            <StatCard label="Hài lòng" value="98%" sub="Đánh giá 5 sao" />
          </OngvangcomvnReveal>
        </div>

        <div className="pointer-events-none absolute bottom-28 left-20 z-10 hidden h-28 w-28 items-center justify-center xl:flex">
          <OngvangcomvnReveal direction="left" delay={0.72}>
            <div className="ai-orb-3d relative h-24 w-24 rounded-2xl border border-[#eaeaea] bg-white/80 shadow-[0_18px_60px_rgba(0,0,0,0.08)] backdrop-blur">
              <div className="ai-orb-ring absolute inset-4 rounded-full border border-black/15" />
              <div className="ai-orb-ring absolute inset-7 rounded-full border border-black/10 [animation-delay:-1.8s]" />
              <div className="ai-orb-core absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2">
                <div className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-black ai-orb-node" />
                <div className="absolute bottom-1 left-0 h-2.5 w-2.5 rounded-full bg-gray-400 ai-orb-node" />
                <div className="absolute bottom-1 right-0 h-2.5 w-2.5 rounded-full bg-gray-700 ai-orb-node" />
                <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-black/20 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.12)]" />
                <span className="absolute left-1/2 top-[8px] h-px w-10 -translate-x-1/2 rotate-[32deg] bg-black/20" />
                <span className="absolute left-1/2 top-[8px] h-px w-10 -translate-x-1/2 rotate-[148deg] bg-black/20" />
                <span className="absolute bottom-[9px] left-1/2 h-px w-10 -translate-x-1/2 bg-black/20" />
              </div>
            </div>
          </OngvangcomvnReveal>
        </div>

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-[1200px] w-full px-6 pt-32 pb-24 text-center">
          {/* Eyebrow label */}
          <OngvangcomvnReveal>
            <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-[#eaeaea] bg-white px-4 py-1.5 text-[12px] font-semibold uppercase tracking-widest text-black">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black opacity-20" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-black" />
              </span>
              Thế hệ sáng tạo mới
            </div>
          </OngvangcomvnReveal>

          {/* Headline */}
          <h1 className="!text-[clamp(44px,7.6vw,108px)] !leading-[0.98] font-medium tracking-tighter text-black relative z-10">
            <OngvangcomvnReveal>
              <span className="block">Tư duy chiến lược.</span>
            </OngvangcomvnReveal>
            <OngvangcomvnReveal delay={0.08}>
              <span className="block">Hành động hiệu quả.</span>
            </OngvangcomvnReveal>
            <OngvangcomvnReveal delay={0.16}>
              <span className="block text-gray-400">
                Phát triển bền vững.
              </span>
            </OngvangcomvnReveal>
          </h1>

          <OngvangcomvnReveal delay={0.28}>
            <div className="relative mx-auto mt-10 max-w-3xl">
              <p className="text-[20px] md:text-[22px] text-gray-500 leading-relaxed tracking-tight">
                {org?.description || "Đối tác chiến lược đồng hành cùng doanh nghiệp trên hành trình chuyển đổi xanh, chuyển đổi số và phát triển bền vững."}
              </p>
              <div className="pointer-events-none absolute -right-8 -top-8 hidden h-24 w-24 items-center justify-center md:flex">
                <div className="ai-orb-3d relative h-20 w-20">
                  <div className="ai-orb-ring absolute inset-1 rounded-full border border-black/15" />
                  <div className="ai-orb-ring absolute inset-4 rounded-full border border-black/10 [animation-delay:-1.4s]" />
                  <div className="ai-orb-core absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2">
                    <div className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-black ai-orb-node" />
                    <div className="absolute bottom-1 left-0 h-2.5 w-2.5 rounded-full bg-gray-400 ai-orb-node" />
                    <div className="absolute bottom-1 right-0 h-2.5 w-2.5 rounded-full bg-gray-700 ai-orb-node" />
                    <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-black/20 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.12)]" />
                    <span className="absolute left-1/2 top-[7px] h-px w-9 -translate-x-1/2 rotate-[32deg] bg-black/20" />
                    <span className="absolute left-1/2 top-[7px] h-px w-9 -translate-x-1/2 rotate-[148deg] bg-black/20" />
                    <span className="absolute bottom-[8px] left-1/2 h-px w-9 -translate-x-1/2 bg-black/20" />
                  </div>
                </div>
              </div>
            </div>
          </OngvangcomvnReveal>

          <OngvangcomvnReveal delay={0.38}>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Link href="/ongvangcomvn/dich-vu" className="inline-flex items-center gap-2 rounded-full bg-black px-10 py-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-gray-800">
                KHÁM PHÁ DỊCH VỤ
              </Link>
              <Link href="/ongvangcomvn/lien-he" className="inline-flex items-center gap-2 rounded-full border border-[#eaeaea] bg-white px-10 py-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-black transition-colors hover:bg-gray-50">
                XEM CASE STUDY
              </Link>
            </div>
          </OngvangcomvnReveal>
        </div>
      </section>

      {/* ═══════════════════ TRUSTED BY / PLATFORM STRIP ════════════ */}
      <section className="border-b border-[#eaeaea] bg-white py-8 antialiased">
        <div className="overflow-hidden">
          <div className="marquee-track flex w-max gap-16 whitespace-nowrap">
            {[...Array(4)].map((_, round) =>
              ["Branding", "Marketing", "Training", "Traveling", "Chuyển đổi số"].map((p) => (
                <span key={`${round}-${p}`} className="text-[24px] font-medium tracking-tight text-gray-300 uppercase">
                  {p}
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS ══════════════════════════════════ */}
      <section className="bg-white py-24 border-b border-[#eaeaea] antialiased">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            {[
              { v: "500+", l: "Dự án" },
              { v: "100+", l: "Chiến dịch" },
              { v: "300+", l: "Khách hàng" },
              { v: "20+", l: "Đối tác" },
            ].map((s, i) => (
              <OngvangcomvnReveal key={s.l} delay={i * 0.08}>
                <div className="text-center">
                  <p className="!text-[clamp(32px,5vw,72px)] !leading-none font-medium tracking-tighter text-black">{s.v}</p>
                  <p className="mt-4 text-[13px] font-semibold uppercase tracking-widest text-gray-400">{s.l}</p>
                </div>
              </OngvangcomvnReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ COMPANY INTRO ══════════════════════════ */}
      <section id="about" className="relative bg-white py-32 border-b border-[#eaeaea] antialiased">
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <OngvangcomvnReveal>
                <p className="mb-6 text-[12px] font-semibold uppercase tracking-widest text-gray-400">Giới thiệu Ong Vàng</p>
              </OngvangcomvnReveal>
              <OngvangcomvnReveal delay={0.1}>
                <h2 className="!text-[clamp(32px,4vw,56px)] !leading-[1.05] font-medium tracking-tighter text-black">
                  Đồng hành cùng doanh nghiệp phát triển bền vững.
                </h2>
              </OngvangcomvnReveal>
              <OngvangcomvnReveal delay={0.2}>
                <p className="mt-8 text-[18px] leading-relaxed text-gray-500">
                  Ong Vàng là đơn vị tư vấn và triển khai giải pháp Branding, Marketing, Training và Traveling. Chúng tôi kết hợp tư duy chiến lược và kinh nghiệm thực thi để biến mục tiêu tăng trưởng thành kế hoạch rõ ràng, đo lường được.
                </p>
              </OngvangcomvnReveal>
              <OngvangcomvnReveal delay={0.3}>
                <div className="mt-10 space-y-6">
                  {[
                    "Tư vấn chiến lược thương hiệu và truyền thông",
                    "Triển khai marketing đa kênh",
                    "Đào tạo đội ngũ bằng chương trình thực tiễn",
                    "Phát triển dự án xanh và cộng đồng",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-4 border-b border-[#eaeaea] pb-5 last:border-0 last:pb-0">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[12px] text-white">✓</span>
                      <span className="text-[16px] font-medium text-black">{item}</span>
                    </div>
                  ))}
                </div>
              </OngvangcomvnReveal>
              <OngvangcomvnReveal delay={0.4}>
                <Link href="/ongvangcomvn/lien-he" className="mt-12 inline-flex items-center gap-2 rounded-full bg-black px-8 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-gray-800">
                  Tư vấn cùng Ong Vàng
                </Link>
              </OngvangcomvnReveal>
            </div>

            <OngvangcomvnReveal direction="left" delay={0.15}>
              <div className="relative overflow-hidden rounded-3xl border border-[#eaeaea] bg-white p-3">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50">
                  <Image
                    src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85"
                    alt="Đội ngũ Ong Vàng"
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    unoptimized
                  />
                </div>
              </div>
            </OngvangcomvnReveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SERVICES FROM DB ═══════════════════════ */}
      {featuredServices.length > 0 && (
        <section id="services" className="relative bg-white py-32 border-b border-[#eaeaea] antialiased">
          <div className="relative z-10 mx-auto max-w-7xl px-6">
            <div className="mb-16 grid grid-cols-1 items-end gap-6 sm:grid-cols-[1fr_auto]">
              <div>
                <OngvangcomvnReveal><p className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-gray-400">Giải pháp</p></OngvangcomvnReveal>
                <OngvangcomvnReveal delay={0.1}>
                  <h2 className="!text-[clamp(44px,6.6vw,88px)] !leading-[0.98] font-medium tracking-tighter text-black">
                    Marketing.<br /><span className="text-gray-400">Truyền thông.</span>
                  </h2>
                </OngvangcomvnReveal>
              </div>
              <OngvangcomvnReveal direction="left">
                <Link href="/ongvangcomvn/dich-vu" className="inline-flex justify-self-start rounded-full border border-[#eaeaea] bg-white px-6 py-3 text-[15px] font-medium text-black transition-colors hover:bg-gray-50 sm:justify-self-end">
                  Xem tất cả dịch vụ
                </Link>
              </OngvangcomvnReveal>
            </div>
            {planningService ? <OngvangcomvnPlanningCard service={{ ...planningService, options: planningService.options.map((option) => ({ ...option, price: Number(option.price) })) }} /> : null}
            <OngvangcomvnHorizontalCarousel>
              {carouselServices.map((service, i) => (
                <OngvangcomvnReveal key={service.id} delay={i * 0.08} className="w-[86vw] max-w-[420px] shrink-0 snap-start md:w-[380px] lg:w-[420px]">
                  <OngvangcomvnServiceCard
                    service={{
                      slug: service.slug,
                      name: service.name,
                      description: service.description,
                      options: (service.options ?? []).map((o) => ({ ...o, price: Number(o.price) }))
                    }}
                    index={i + 1}
                  />
                </OngvangcomvnReveal>
              ))}
            </OngvangcomvnHorizontalCarousel>
          </div>
        </section>
      )}

      {/* ═══════════════════ COURSES FROM DB ════════════════════════ */}
      {courses.length > 0 && (
        <section id="training" className="relative bg-[#fafafa] py-32 border-b border-[#eaeaea] antialiased">
          <div className="relative z-10 mx-auto max-w-7xl px-6">
            <div className="mb-16 grid grid-cols-1 items-end gap-6 sm:grid-cols-[1fr_auto]">
              <div>
                <OngvangcomvnReveal><p className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-gray-400">Đào tạo</p></OngvangcomvnReveal>
                <OngvangcomvnReveal delay={0.1}>
                  <h2 className="!text-[clamp(56px,8vw,112px)] !leading-[0.94] font-medium tracking-tighter text-black">
                    Training.<br /><span className="text-gray-400">Coaching 1:1.</span>
                  </h2>
                </OngvangcomvnReveal>
              </div>
              <OngvangcomvnReveal direction="left">
                <Link href="/ongvangcomvn/khoa-hoc" className="inline-flex justify-self-start rounded-full border border-[#eaeaea] bg-white px-6 py-3 text-[15px] font-medium text-black transition-colors hover:bg-gray-50 sm:justify-self-end">
                  Xem tất cả khóa học
                </Link>
              </OngvangcomvnReveal>
            </div>
            
            <OngvangcomvnCoursesCarousel courses={courses.map((course) => ({ ...course, price: Number(course.price) }))} />
            
            <OngvangcomvnReveal delay={0.15}>
              <div className="mt-20 rounded-3xl border border-[#eaeaea] bg-white p-10 md:p-14">
                <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-widest text-gray-400">Lịch khai giảng</p>
                    <h3 className="!text-[clamp(28px,4vw,56px)] !leading-[1.1] mt-3 font-medium tracking-tighter text-black">Các lớp mở trong {scheduleMonthLabel}</h3>
                  </div>
                  <Link href="/ongvangcomvn/lien-he" className="text-[15px] font-medium text-black hover:text-gray-500 transition-colors">Giữ chỗ tư vấn →</Link>
                </div>
                
                <div className="grid gap-3 border-t border-[#eaeaea] pt-6 md:grid-cols-2">
                  {scheduleRows.map((item) => (
                    <div key={`${item.title}-${item.schedule}`} className="rounded-2xl border border-[#eaeaea] bg-white p-5 transition-colors hover:border-gray-300">
                      <div className="border-b border-[#eaeaea] pb-4">
                        <span className="block text-[20px] font-medium leading-tight tracking-tight text-black">{item.title}</span>
                        <span className="mt-1.5 block truncate text-[13px] leading-5 text-gray-500">Giảng viên: {item.instructor}</span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-[10px] font-medium uppercase tracking-widest text-gray-400">Lịch khai giảng</span>
                          <span className="mt-2 block text-[18px] font-medium leading-tight text-black">{item.day}/{item.month}</span>
                          <span className="mt-1 block text-[13px] text-gray-500">{item.weekday}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-medium uppercase tracking-widest text-gray-400">Lịch học</span>
                          <span className="mt-2 block text-[14px] font-medium leading-tight text-black">{item.schedule}</span>
                          <span className="mt-1 block text-[13px] text-gray-500">{item.time}</span>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 items-end gap-4">
                        <div>
                          <span className="block text-[10px] font-medium uppercase tracking-widest text-gray-400">Học phí</span>
                          <span className="mt-2 block text-[18px] font-medium tracking-tight text-black">{item.fee}</span>
                        </div>
                        <Link href="/ongvangcomvn/lien-he" aria-label={`Đăng ký ${item.title}`} className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-md bg-black text-white transition-colors hover:bg-gray-800">
                          <Plus className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </OngvangcomvnReveal>
          </div>
        </section>
      )}

      {/* ═══════════════════ CTA BANNER ══════════════════════════════ */}
      <section className="relative overflow-hidden bg-black py-32 antialiased">
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <OngvangcomvnReveal>
            <h2 className="!text-[clamp(40px,6vw,80px)] !leading-[1] font-medium tracking-tighter text-white">
              Bứt phá nhanh.<br />
              <span className="text-gray-400">Tăng trưởng thông minh.</span>
            </h2>
          </OngvangcomvnReveal>
          <OngvangcomvnReveal delay={0.2}>
            <Link href="/ongvangcomvn/dich-vu" className="mt-14 inline-flex rounded-full bg-white px-12 py-5 text-[18px] font-medium text-black transition-colors hover:bg-gray-200">
              Bắt đầu ngay
            </Link>
          </OngvangcomvnReveal>
        </div>
      </section>
    </>
  );
}
