import Link from "next/link";
import { getOrganization, getServices, getCourses } from "./actions";
import { AiReveal } from "./_components/AiReveal";

// ── Utility: format price ─────────────────────────────────────────
function formatPrice(price: number, currency = "VND") {
  if (price <= 0) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

// ── Amber SVG icons ───────────────────────────────────────────────
const icons = {
  zap: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f5a524" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  target: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f5a524" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  chart: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f5a524" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  cpu: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f5a524" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  globe: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f5a524" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  users: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f5a524" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  star: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f5a524" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  book: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f5a524" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
};
const iconList = Object.values(icons);

// ── Feature card (cream bg, Framer .framer-1azg69b style) ─────────
function FeatureCard({ icon, title, desc, dark = false }: { icon: React.ReactNode; title: string; desc: string; dark?: boolean }) {
  return (
    <div
      className={`flex h-full flex-col gap-[18px] rounded-[26px] p-6 transition-all hover:-translate-y-0.5 ${
        dark
          ? "border border-white/[0.12] bg-[#111] text-white shadow-[0_24px_70px_rgba(17,17,17,0.18)]"
          : "border border-[rgba(17,17,17,0.08)] bg-[#f7f4ed] text-[#111]"
      }`}
    >
      <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-[rgba(245,165,36,0.1)]">
        {icon}
      </div>
      <div className="flex flex-col gap-2">
        <h3 className={`text-[16px] font-[700] leading-snug ${dark ? "text-white" : "text-[#111]"}`}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {title}
        </h3>
        <p className={`text-[14px] leading-relaxed ${dark ? "text-[#a8a8a8]" : "text-[#6b6b6b]"}`}>
          {desc}
        </p>
      </div>
    </div>
  );
}

// ── Service card (Framer .framer-5pdcd8 style) ────────────────────
function ServiceCard({ icon, title, desc, options = [], index }: {
  icon: React.ReactNode; title: string; desc?: string | null;
  options?: { id: string; name: string; price: number; currency: string; durationText?: string | null }[];
  index: number; dark?: boolean;
}) {
  const isDark = index % 4 === 3;
  return (
    <div className={`flex h-full flex-col gap-[16px] rounded-[24px] p-[22px] transition-all hover:-translate-y-0.5 ${
      isDark
        ? "border border-white/[0.12] bg-[#111] text-white"
        : "border border-[rgba(17,17,17,0.08)] bg-[#f7f4edbd]"
    }`}>
      <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[13px] bg-[rgba(245,165,36,0.12)]">
        {icon}
      </div>
      <div>
        <h3 className={`mb-1.5 text-[15px] font-[700] ${isDark ? "text-white" : "text-[#111]"}`}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h3>
        <p className={`text-[13px] leading-relaxed ${isDark ? "text-[#a8a8a8]" : "text-[#6b6b6b]"}`}>
          {desc || "Giải pháp tối ưu ROI cho doanh nghiệp của bạn."}
        </p>
      </div>
      {options.length > 0 && (
        <div className="mt-auto space-y-2">
          {options.slice(0, 2).map((opt) => (
            <div key={opt.id} className={`flex items-center justify-between rounded-xl px-3 py-2 text-[12px] ${
              isDark ? "bg-white/[0.06]" : "bg-[rgba(17,17,17,0.04)]"
            }`}>
              <span className={`font-[500] ${isDark ? "text-[#e0e0e0]" : "text-[#111]"}`}>{opt.name}</span>
              <span className="font-[700] text-[#f5a524]">{formatPrice(opt.price, opt.currency)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-[8px] rounded-[20px] bg-[rgba(255,255,255,0.64)] p-6">
      <p className="text-[32px] font-[800] leading-none text-[#111]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {value}
      </p>
      <p className="text-center text-[13px] leading-snug text-[#6b6b6b]">{label}</p>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────
export default async function OngVangAiPage() {
  const org = await getOrganization();
  const [services, courses] = org
    ? await Promise.all([getServices(org.id), getCourses(org.id)])
    : [[], []];

  const featuredServices = services.slice(0, 8);
  const featuredCourses = courses.slice(0, 3);

  const features = [
    { icon: icons.target, title: "Tư vấn chiến lược", desc: "Phân tích thị trường chuyên sâu, xây dựng lộ trình tăng trưởng bền vững cho từng giai đoạn." },
    { icon: icons.chart, title: "Marketing toàn diện", desc: "Chiến dịch Ads đa nền tảng — Facebook, Google, TikTok, Zalo — tối ưu ROI từng đồng ngân sách." },
    { icon: icons.cpu, title: "AI ứng dụng", desc: "Tự động hóa quy trình, phân tích dữ liệu và tối ưu hiệu suất bằng công cụ AI tiên tiến nhất." },
    { icon: icons.users, title: "Đào tạo thực chiến", desc: "Khoá học do chuyên gia trực tiếp đứng lớp — học xong là áp dụng được ngay vào thực tế." },
    { icon: icons.globe, title: "Chuyển đổi số", desc: "Xây dựng hệ sinh thái số toàn diện: CRM, automation, dashboard báo cáo tự động theo thời gian thực." },
    { icon: icons.star, title: "Branding & Content", desc: "Định vị thương hiệu chuyên nghiệp, sản xuất content đa kênh chuẩn Agency quốc tế." },
  ];

  return (
    <>
      {/* ═══════════════════════ HERO ═══════════════════════════════ */}
      {/* Framer: radial-gradient(50% 50%, #f7f4ed 0%, #fff 100%) */}
      <section
        className="flex flex-col items-center gap-11 px-8 pb-[84px] pt-[80px]"
        style={{ background: "radial-gradient(70% 70% at 50% 40%, #f7f4ed 0%, #fffdf7 100%)" }}
      >
        <AiReveal className="flex flex-col items-center gap-7 w-full max-w-[980px]">
          {/* Badge — Framer .framer-5u5jw4 */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(17,17,17,0.1)] bg-[rgba(255,255,255,0.7)] px-3 py-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#f5a524">
              <path d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z" fillOpacity="0.2" stroke="#f5a524" strokeWidth="2"/>
              <path d="M12 6L17.2 9V15L12 18L6.8 15V9L12 6Z" fill="#f5a524"/>
            </svg>
            <span className="text-[13px] font-[500] text-[#6b6b6b]">Hệ sinh thái doanh nghiệp toàn diện</span>
          </div>

          {/* Headline */}
          <h1
            className="text-center text-[clamp(3rem,7vw,5.5rem)] font-[800] leading-[1.0] tracking-[-0.02em] text-[#111]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {org?.description
              ? <>{org.name}<br /><span style={{ color: "#f5a524" }}>Marketing & Training</span></>
              : <>Tư vấn chiến lược.<br /><span style={{ color: "#f5a524" }}>Tăng trưởng bền vững.</span></>
            }
          </h1>

          {/* Subtitle */}
          <p className="max-w-[720px] text-center text-[17px] leading-[1.65] text-[#6b6b6b]">
            {org?.description || "Hệ sinh thái tư vấn chiến lược, đào tạo thực chiến, AI ứng dụng và chuyển đổi số bền vững cho doanh nghiệp Việt Nam."}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Primary — Framer .framer-14se9i6 */}
            <Link
              href="/ongvangai/lien-he"
              className="flex items-center gap-2.5 rounded-full px-[22px] py-[15px] text-[15px] font-[700] text-white transition-all hover:opacity-90 active:scale-[0.97]"
              style={{ background: "linear-gradient(135deg,#111 0%,#29200e 100%)", boxShadow: "0 18px 40px rgba(245,165,36,0.24)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5a524" strokeWidth="2.5"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Bắt đầu ngay
            </Link>
            {/* Secondary */}
            <Link
              href="/ongvangai/dich-vu"
              className="flex items-center gap-2 rounded-full border border-[rgba(17,17,17,0.1)] bg-[rgba(255,255,255,0.72)] px-[22px] py-[15px] text-[15px] font-[600] text-[#111] transition-all hover:bg-white active:scale-[0.97]"
            >
              Xem dịch vụ
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4M3 12h18"/></svg>
            </Link>
          </div>

          {/* Tags row */}
          <div className="flex flex-wrap justify-center gap-2.5 max-w-[620px]">
            {["Facebook Ads","Google Ads","SEO & Content","TikTok Marketing","AI Automation","Đào tạo doanh nghiệp","CRM & Data","Chuyển đổi số","Branding"].map((tag) => (
              <span key={tag} className="rounded-full border border-[rgba(17,17,17,0.08)] bg-[rgba(17,17,17,0.04)] px-[14px] py-[10px] text-[12px] font-[500] text-[#6b6b6b]">
                {tag}
              </span>
            ))}
          </div>
        </AiReveal>

        {/* 4-col stat grid — Framer .framer-16bzb7z */}
        <AiReveal delay={0.2} className="w-full max-w-[980px]">
          <div
            className="grid w-full gap-[1px] rounded-[28px] border border-[rgba(17,17,17,0.08)] p-2.5"
            style={{ backdropFilter: "blur(14px)", background: "rgba(255,255,255,0.62)", gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
          >
            <StatCard value="500+" label="Khách hàng hài lòng" />
            <StatCard value="10+" label="Năm kinh nghiệm" />
            <StatCard value="1,200+" label="Dự án hoàn thành" />
            <StatCard value="98%" label="Tỉ lệ hài lòng" />
          </div>
        </AiReveal>
      </section>

      {/* ═══════════════════ FEATURES — white bg ════════════════════ */}
      {/* Framer .framer-1a7svlt: bg-white, padding 96px */}
      <section className="flex flex-col items-center gap-[34px] bg-white px-8 py-24">
        <div className="flex w-full max-w-[880px] flex-col items-center gap-4 text-center">
          <AiReveal>
            <p className="text-[11px] font-[700] uppercase tracking-[0.12em] text-[#f5a524]">Tại sao chọn chúng tôi</p>
          </AiReveal>
          <AiReveal delay={0.1}>
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-[700] leading-tight tracking-[-0.02em] text-[#111]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Mọi thứ bạn cần để<br />
              <span style={{ color: "#f5a524" }}>phát triển bền vững</span>
            </h2>
          </AiReveal>
          <AiReveal delay={0.15}>
            <p className="max-w-[560px] text-[16px] leading-relaxed text-[#6b6b6b]">
              Từ chiến lược đến thực thi — Ong Vàng cung cấp hệ sinh thái hoàn chỉnh giúp doanh nghiệp bứt phá trên môi trường số.
            </p>
          </AiReveal>
        </div>

        {/* 4-col feature grid — Framer .framer-1tao6ac */}
        <div className="grid w-full max-w-[1120px] gap-[14px]"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {features.map((f, i) => (
            <AiReveal key={f.title} delay={i * 0.07}>
              <FeatureCard icon={f.icon} title={f.title} desc={f.desc} dark={i === 3} />
            </AiReveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════ SERVICES — cream bg ════════════════════ */}
      {featuredServices.length > 0 && (
        <section className="flex flex-col items-center gap-9 px-8 py-24" style={{ backgroundColor: "#f7f4ed" }}>
          <div className="flex w-full max-w-[1120px] items-end justify-between">
            <div className="flex flex-col gap-[14px]">
              <AiReveal>
                <p className="text-[11px] font-[700] uppercase tracking-[0.12em] text-[#f5a524]">Dịch vụ của chúng tôi</p>
              </AiReveal>
              <AiReveal delay={0.1}>
                <h2 className="max-w-[760px] text-[clamp(2rem,4vw,3.5rem)] font-[700] leading-tight tracking-[-0.02em] text-[#111]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Giải pháp Marketing<br />toàn diện — đo được kết quả
                </h2>
              </AiReveal>
            </div>
            <Link href="/ongvangai/dich-vu" className="hidden shrink-0 items-center gap-2 rounded-full border border-[rgba(17,17,17,0.1)] bg-white px-5 py-3 text-[13px] font-[600] text-[#111] transition-all hover:bg-[#f5a524] hover:text-white lg:flex">
              Xem tất cả →
            </Link>
          </div>

          {/* Services grid — Framer .framer-p8p4w */}
          <div className="grid w-full max-w-[1120px] gap-[14px]"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
            {featuredServices.map((s, i) => (
              <AiReveal key={s.id} delay={i * 0.06}>
                <ServiceCard
                  icon={iconList[i % iconList.length]}
                  title={s.name}
                  desc={s.description}
                  options={(s.options ?? []).map((o) => ({ ...o, price: Number(o.price) }))}
                  index={i}
                />
              </AiReveal>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════ COURSES ════════════════════════════════ */}
      {featuredCourses.length > 0 && (
        <section className="flex flex-col items-center gap-9 bg-white px-8 py-24">
          <div className="flex w-full max-w-[1120px] items-end justify-between">
            <div>
              <AiReveal><p className="mb-3 text-[11px] font-[700] uppercase tracking-[0.12em] text-[#f5a524]">Đào tạo thực chiến</p></AiReveal>
              <AiReveal delay={0.1}>
                <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-[700] leading-tight tracking-[-0.02em] text-[#111]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Học xong là<br /><span style={{ color: "#f5a524" }}>làm được ngay</span>
                </h2>
              </AiReveal>
            </div>
            <Link href="/ongvangai/khoa-hoc" className="hidden shrink-0 items-center gap-2 rounded-full border border-[rgba(17,17,17,0.1)] bg-[#f7f4ed] px-5 py-3 text-[13px] font-[600] text-[#111] transition-all hover:bg-[#f5a524] hover:text-white lg:flex">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid w-full max-w-[1120px] gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            {featuredCourses.map((course, i) => {
              const price = Number(course.price);
              const levels: Record<string, string> = { beginner: "Cơ bản", intermediate: "Trung cấp", advanced: "Nâng cao" };
              return (
                <AiReveal key={course.id} delay={i * 0.1}>
                  <div className="group overflow-hidden rounded-[24px] border border-[rgba(17,17,17,0.08)] bg-[#f7f4edbd] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/[0.06]">
                    <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-amber-100 to-orange-50">
                      {course.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-5xl">{icons.book}</div>
                      )}
                      <span className="absolute left-3 top-3 rounded-xl bg-white/90 px-2.5 py-1 text-[11px] font-[700] text-[#111]">
                        {levels[course.level] ?? course.level}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="mb-1.5 text-[15px] font-[700] leading-snug text-[#111] line-clamp-2"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{course.title}</h3>
                      <p className="mb-4 text-[13px] leading-relaxed text-[#6b6b6b] line-clamp-2">{course.description}</p>
                      <div className="flex items-center justify-between border-t border-[rgba(17,17,17,0.07)] pt-4">
                        <span className={`text-[17px] font-[800] ${price > 0 ? "text-[#f5a524]" : "text-emerald-600"}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {formatPrice(price, course.currency)}
                        </span>
                        <Link href="/ongvangai/lien-he" className="rounded-full bg-[#111] px-4 py-2 text-[12px] font-[700] text-white transition-all hover:bg-[#f5a524] hover:text-[#111] active:scale-95">
                          Đăng ký
                        </Link>
                      </div>
                    </div>
                  </div>
                </AiReveal>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════════════════ DARK CTA ═══════════════════════════════ */}
      {/* Framer .framer-384y4x: bg-[#111], padding 104px */}
      <section className="flex flex-col items-center gap-9 bg-[#111] px-8 py-[104px]">
        <div className="flex w-full max-w-[1120px] flex-col gap-5 lg:flex-row lg:items-start lg:gap-[34px]">
          {/* Left col */}
          <div className="flex flex-1 flex-col gap-5">
            <AiReveal>
              <p className="text-[11px] font-[700] uppercase tracking-[0.12em] text-[#f5a524]">Sẵn sàng bắt đầu?</p>
            </AiReveal>
            <AiReveal delay={0.1}>
              <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-[700] leading-tight tracking-[-0.02em] text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Bứt phá tăng trưởng<br /><span style={{ color: "#f5a524" }}>ngay hôm nay.</span>
              </h2>
            </AiReveal>
            <AiReveal delay={0.2}>
              <p className="max-w-lg text-[16px] leading-relaxed text-[#a8a8a8]">
                Đặt lịch tư vấn miễn phí — chuyên gia sẽ phân tích toàn diện và đề xuất chiến lược phù hợp nhất với doanh nghiệp của bạn.
              </p>
            </AiReveal>
            <AiReveal delay={0.3}>
              <div className="flex flex-wrap gap-3">
                <Link href="/ongvangai/lien-he"
                  className="flex items-center gap-2.5 rounded-full px-[22px] py-[15px] text-[15px] font-[700] text-white transition-all hover:opacity-90 active:scale-[0.97]"
                  style={{ background: "linear-gradient(135deg,#f5a524 0%,#ff7a1a 100%)", boxShadow: "0 18px 40px rgba(245,165,36,0.3)" }}
                >
                  Nhận tư vấn miễn phí
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4M3 12h18"/></svg>
                </Link>
                <Link href="/ongvangai/khoa-hoc"
                  className="rounded-full border border-white/[0.12] bg-white/[0.06] px-[22px] py-[15px] text-[15px] font-[500] text-white transition-all hover:bg-white/[0.1] active:scale-[0.97]">
                  Xem khóa học
                </Link>
              </div>
            </AiReveal>
          </div>

          {/* Right col — contact info cards, Framer .framer-x1hs1p style */}
          <div className="flex flex-1 flex-col gap-3">
            {[
              { icon: icons.zap, text: "Phản hồi trong vòng 24 giờ làm việc" },
              { icon: icons.target, text: "Tư vấn miễn phí, không ràng buộc" },
              { icon: icons.chart, text: "Báo cáo kết quả minh bạch theo tuần" },
              { icon: icons.users, text: "Hơn 500 doanh nghiệp đã tin tưởng" },
            ].map((item, i) => (
              <AiReveal key={i} delay={0.1 + i * 0.08}>
                <div className="flex items-center gap-3 rounded-[18px] border border-[rgba(245,165,36,0.22)] px-4 py-[14px]"
                  style={{ background: "linear-gradient(135deg,rgba(245,165,36,0.18) 0%,rgba(255,255,255,0.05) 100%)" }}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(245,165,36,0.15)]">
                    {item.icon}
                  </div>
                  <p className="text-[14px] text-[#e0e0e0]">{item.text}</p>
                </div>
              </AiReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
