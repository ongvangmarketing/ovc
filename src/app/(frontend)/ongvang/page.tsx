import type { Metadata } from "next";
import Link from "next/link";
import { getOngVangOrganization as getOrganization, getOngVangServices as getServices, getOngVangStats as getStats } from "./actions";
import { SefaMarquee } from "./_components/SefaMarquee";
import { SefaServicesAccordion } from "./_components/SefaServicesAccordion";
import { SefaPortfolio } from "./_components/SefaPortfolio";
import { SefaTestimonials } from "./_components/SefaTestimonials";
import { ScrollReveal as Reveal } from "./_components/ScrollReveal";

export const metadata: Metadata = {
  title: "Ong Vàng Marketing & Training — Nâng tầm thương hiệu trong kỷ nguyên AI",
  description: "Hệ sinh thái tư vấn chiến lược thương hiệu, đào tạo thực chiến, AI ứng dụng và chuyển đổi số bền vững cho doanh nghiệp Việt Nam.",
};

// ── SEFA-style design tokens ─────────────────────────────────────
// Primary red: #e63329   Gradient: #e63329 → #ff6b35
// Dark bg: #111           Text: #111   Muted: #666
// Border: rgba(0,0,0,0.08)
// Font: Be Vietnam Pro (headings) + system (body)
// ─────────────────────────────────────────────────────────────────


const newsItems = [
  {
    img: "https://ovc.vn/wp-content/uploads/2025/06/6.jpg",
    title: "Ong Vàng Training tổ chức lễ trao chứng nhận hoàn thành khóa học",
    excerpt: "Ghi nhận hành trình học tập nghiêm túc và năng lực triển khai thực tế của học viên Ong Vàng Training.",
    cat: "Ong Vàng Training",
  },
  {
    img: "https://ovc.vn/wp-content/uploads/2024/12/ong-vang-training-chuong-trinh-tu-van-ky-nang-pr-ban-than-truoc-nha-tuyen-dung-7.jpg",
    title: "Chương trình tư vấn kỹ năng PR bản thân trước nhà tuyển dụng",
    excerpt: "Hoạt động chia sẻ thực tế giúp người học xây dựng hình ảnh cá nhân và tự tin hơn khi bước vào thị trường lao động.",
    cat: "Đào tạo",
  },
  {
    img: "https://ovc.vn/wp-content/uploads/2024/12/ong-vang-training-khai-giang-khoa-huan-luyen-digital-marketing-full-stack-digi002-3.jpg",
    title: "Khai giảng khóa huấn luyện Digital Marketing Full Stack",
    excerpt: "Chương trình học thực chiến với các module chuyên sâu, được thiết kế để học viên có thể áp dụng ngay vào công việc.",
    cat: "Digital Marketing",
  },
  {
    img: "https://ovc.vn/wp-content/uploads/2025/03/z6364866598341_428fde9cef3d74982d71ba0a99f83ce0.jpg",
    title: "AI for Marketing — nâng cao năng lực sáng tạo trong kỷ nguyên số",
    excerpt: "Ứng dụng AI vào nghiên cứu, sản xuất nội dung và tối ưu hiệu suất marketing theo quy trình thực tế.",
    cat: "AI for Marketing",
  },
  {
    img: "https://ovc.vn/wp-content/uploads/2024/12/ong-vang-training-khai-giang-khoa-huan-luyen-digital-marketing-full-stack-digi002-6.jpg",
    title: "Coaching 1:1 Digital Marketing tại Ong Vàng Training",
    excerpt: "Lộ trình cá nhân hóa theo năng lực và mục tiêu, kết hợp hướng dẫn trực tiếp trên bài toán thật của học viên.",
    cat: "Coaching 1:1",
  },
  {
    img: "https://ovc.vn/wp-content/uploads/2024/12/Chuyen-gia-Sang-kien-Diem-den-An-toan.jpg",
    title: "Ong Vàng đồng hành cùng sáng kiến điểm đến an toàn",
    excerpt: "Kết nối truyền thông, đào tạo và du lịch để kiến tạo hệ sinh thái trải nghiệm bền vững cho địa phương.",
    cat: "Ong Vàng Travel",
  },
];

export default async function OngVangPage() {
  const org = await getOrganization();
  const [services, stats] = org
    ? await Promise.all([getServices(org.id), getStats(org.id)])
    : [[], { projects: 0, contacts: 0, services: 0, courses: 0 }];
  const phone = org?.phone?.trim() || "0987654321";
  const email = org?.email?.trim() || "contact@ongvang.vn";
  const address = org?.address?.trim() || "TP. Hồ Chí Minh";
  const projectCount = stats.projects > 0 ? `${stats.projects}+` : "Đang cập nhật";
  const customerCount = stats.contacts > 0 ? `${stats.contacts}+` : "Đang cập nhật";
  const accordionServices = services.map((service) => ({
    category: service.name,
    items: service.options.length > 0
      ? service.options.map((option) => option.name)
      : [service.description || "Nhận tư vấn giải pháp phù hợp"],
  }));

  return (
    <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      {/* ═══════════════════ HERO ═══════════════════════════════════ */}
      {/* SEFA: full-height, dark overlay, bold headline, 2 stat counters */}
      <section className="relative min-h-screen overflow-hidden bg-[#111]">
        {/* Background texture */}
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://ovc.vn/wp-content/uploads/2025/07/bg-slide.webp"
            alt="Hero background"
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#111]/70 via-[#111]/50 to-[#111]" />
        </div>

        {/* Floating contact sidebar — SEFA style */}
        <div className="fixed right-4 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-3">
          {[
            { href: `tel:${phone.replace(/\s+/g, "")}`, icon: "📞", label: "Gọi Ong Vàng" },
            { href: `https://zalo.me/${phone.replace(/\D/g, "")}`, icon: "💬", label: "Chat Zalo" },
            { href: `mailto:${email}`, icon: "✉️", label: "Gửi email" },
          ].map((item) => (
            <a key={item.href} href={item.href} aria-label={item.label}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg backdrop-blur-sm transition-all hover:border-[#e63329] hover:bg-[#e63329] hover:scale-110">
              {item.icon}
            </a>
          ))}
        </div>

        {/* Hero content */}
        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-start justify-center px-6 pb-20 pt-40 lg:px-12">
          <Reveal>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e63329]/40 bg-[#e63329]/10 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-[#e63329] animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#e63329]">
                Thế hệ sáng tạo mới tại Ong Vàng
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="mb-6 text-[clamp(3rem,8vw,7rem)] font-black uppercase leading-[0.9] tracking-[-0.02em] text-white">
              Tư duy chiến lược<br />
              <span style={{ color: "#e63329" }}>Hành động hiệu quả</span><br />
              Phát triển bền vững
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mb-8 max-w-lg text-lg leading-relaxed text-white/70">
              {org?.description || "Đối tác chiến lược đồng hành cùng doanh nghiệp trên hành trình chuyển đổi xanh, chuyển đổi số và phát triển bền vững qua Branding, Marketing, Training và Traveling."}
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="flex flex-wrap gap-4">
              <Link href="/ongvang/lien-he"
                className="rounded-full bg-[#e63329] px-8 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-2xl shadow-[#e63329]/30 transition-all hover:bg-[#c82820] hover:scale-105 active:scale-95">
                Tư vấn ngay
              </Link>
              <Link href="#dich-vu"
                className="rounded-full border border-white/30 bg-white/10 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20">
                Xem dịch vụ ↓
              </Link>
            </div>
          </Reveal>

          {/* Stats row — SEFA: 6000+ projects, 5000+ clients */}
          <Reveal delay={0.5} className="mt-16 w-full">
            <div className="grid max-w-lg grid-cols-2 gap-6 border-t border-white/10 pt-10">
              <div>
                <p className="text-[clamp(2rem,5vw,4rem)] font-black leading-none text-white">{projectCount}</p>
                <p className="text-sm text-white/50">Dự án thành công</p>
              </div>
              <div>
                <p className="text-[clamp(2rem,5vw,4rem)] font-black leading-none text-white">{customerCount}</p>
                <p className="text-sm text-white/50">Khách hàng tin tưởng</p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-white/30 uppercase tracking-widest">Scroll</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><path d="M7 13l5 5 5-5M7 6l5 5 5-5"/></svg>
        </div>
      </section>

      {/* ═══════════════════ MARQUEE ════════════════════════════════ */}
      <SefaMarquee />

      {/* ═══════════════════ SERVICES ═══════════════════════════════ */}
      {/* SEFA: white bg, big heading left, accordion right */}
      <section id="dich-vu" className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(480px,0.95fr)_1.05fr] lg:gap-16">
            {/* Left: heading sticky */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal>
                <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#e63329]">Dịch vụ của chúng tôi</p>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="mb-7 text-[clamp(4.5rem,8.5vw,8.5rem)] font-black uppercase leading-[0.82] tracking-[0] text-[#111]">
                  Ứng dụng AI<br />
                  <span style={{ WebkitTextStroke: "2px #e63329", color: "transparent" }}>DẪN ĐẦU XU THẾ</span><br />
                  bùng nổ doanh thu
                </h2>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="mb-8 text-[15px] leading-relaxed text-[#666]">
                  Hệ sinh thái giải pháp từ xây dựng thương hiệu, truyền thông đa kênh đến đào tạo thực chiến và ứng dụng công nghệ, được thiết kế phù hợp cho từng doanh nghiệp.
                </p>
              </Reveal>
              <Reveal delay={0.3}>
                <Link href="/ongvang/lien-he"
                  className="inline-flex items-center gap-2 rounded-full bg-[#e63329] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#c82820] active:scale-95">
                  Tư vấn ngay
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              </Reveal>
            </div>

            {/* Right: accordion */}
            <Reveal delay={0.15}>
              <SefaServicesAccordion services={accordionServices.length > 0 ? accordionServices : undefined} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURE SPLIT — product dev ════════════ */}
      {/* SEFA: alternating split layout with checklist */}
      <section className="bg-[#f8f6f2] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#e63329]">Phát triển Sản phẩm mới</p>
                <h2 className="mb-4 text-3xl font-black uppercase leading-tight text-[#111] lg:text-4xl">
                  Đồng hành cùng doanh nghiệp<br />
                  <span className="text-[#e63329]">liên tục đổi mới sáng tạo</span>
                </h2>
                <p className="mb-8 text-[15px] leading-relaxed text-[#666]">
                  Đáp ứng nhu cầu thị hiếu của thị trường và mở rộng thị phần thông qua nghiên cứu chuyên sâu và triển khai thực tiễn.
                </p>
                <ul className="mb-8 space-y-4">
                  {[
                    "Mở rộng \"miếng bánh\" thị phần",
                    "Khai phá tiềm năng thị trường mới",
                    "Tạo dựng lợi thế cạnh tranh bền vững",
                    "Đáp ứng tối đa kỳ vọng của khách hàng",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[15px] text-[#333]">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e63329] text-[10px] text-white font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/ongvang/lien-he"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[#111] px-6 py-3 text-sm font-bold text-[#111] transition-all hover:bg-[#111] hover:text-white">
                  Tư vấn ngay →
                </Link>
              </div>
            </Reveal>

            {/* Image */}
            <Reveal delay={0.15}>
              <div className="relative overflow-hidden rounded-3xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://ovc.vn/wp-content/uploads/2024/12/mkt.jpg"
                  alt="Hoạt động Marketing thực tế tại Ong Vàng"
                  className="w-full object-cover"
                />
                {/* Floating badge */}
                <div className="absolute bottom-4 left-4 rounded-2xl bg-white p-4 shadow-xl">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#999]">Kết quả đạt được</p>
                  <p className="text-2xl font-black text-[#111]">Thực chiến <span className="text-[#e63329]">& Bền vững</span></p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════ DARK AI SECTION ════════════════════════ */}
      <section className="relative overflow-hidden bg-[#111] py-24">
        <SefaMarquee dark />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 text-center lg:px-12">
          <Reveal>
            <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[#e63329]">AI & Chuyển đổi số</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mb-6 text-4xl font-black uppercase leading-tight text-white lg:text-6xl">
              ỨNG DỤNG AI<br />
              <span className="bg-gradient-to-r from-[#e63329] to-[#ff6b35] bg-clip-text text-transparent">
                DẪN ĐẦU XU THẾ
              </span><br />
              BÙNG NỔ DOANH THU
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mb-10 max-w-xl text-lg text-white/60">
              Tự động hóa quy trình, phân tích dữ liệu thời gian thực và tối ưu hiệu suất marketing bằng AI — không chỉ là xu hướng mà là lợi thế cạnh tranh.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <Link href="/ongvang/lien-he"
              className="inline-flex items-center gap-2 rounded-full bg-[#e63329] px-8 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-2xl shadow-[#e63329]/30 transition-all hover:bg-[#c82820] hover:scale-105">
              Tư vấn ngay →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════ SOLUTIONS GRID ═════════════════════════ */}
      {/* SEFA: 4-col icon grid with codes */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-12 text-center">
            <Reveal><p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#e63329]">Giải pháp của chúng tôi</p></Reveal>
            <Reveal delay={0.1}>
              <h2 className="text-[60px] font-black uppercase leading-[1.1] text-[#111] lg:text-[60px]">
                Total Brand Marketing<br />
                <span className="text-[#e63329]">Performance Solutions</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mx-auto mt-4 max-w-xl text-[15px] text-[#666]">
                Tăng trưởng doanh thu, tiết kiệm chi phí bằng bộ giải pháp độc quyền thông qua quá trình nghiên cứu thị trường và chiến lược hiệu quả.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.slice(0, 8).map((sol, i) => (
              <Reveal key={sol.id} delay={i * 0.06}>
                <Link href="/ongvang/lien-he"
                  className="group flex flex-col gap-4 rounded-2xl border border-black/[0.08] bg-[#f8f6f2] p-6 transition-all hover:-translate-y-1 hover:border-[#e63329]/30 hover:shadow-lg hover:shadow-[#e63329]/10">
                  <div className="text-3xl">{["📊", "🤖", "🎯", "📈", "🛒", "📣", "🎓", "⚙️"][i % 8]}</div>
                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase tracking-[0.15em] text-[#e63329]">OV-{String(i + 1).padStart(2, '0')}</p>
                    <h3 className="mb-2 text-[15px] font-bold leading-tight text-[#111]">{sol.name}</h3>
                    <p className="text-[13px] leading-relaxed text-[#888] line-clamp-3">{sol.description}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ ABOUT ══════════════════════════════════ */}
      <section className="bg-[#f8f6f2] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Image */}
            <Reveal>
              <div className="relative">
                <div className="overflow-hidden rounded-3xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://ovc.vn/wp-content/uploads/2024/12/ong-vang-training-khai-giang-khoa-huan-luyen-digital-marketing-full-stack-digi002.jpg"
                    alt="Đội ngũ và học viên Ong Vàng Training" className="w-full object-cover" />
                </div>
                {/* Stats overlay */}
                <div className="absolute -right-4 top-8 rounded-2xl bg-[#e63329] p-5 text-white shadow-2xl lg:-right-8">
                  <p className="text-4xl font-black">10<span className="text-white/70">+</span></p>
                  <p className="text-xs font-semibold">Năm kinh nghiệm</p>
                </div>
                <div className="absolute -bottom-4 left-8 rounded-2xl bg-[#111] p-5 text-white shadow-2xl">
                  <p className="text-4xl font-black">98<span className="text-[#e63329]">%</span></p>
                  <p className="text-xs font-semibold">Tỉ lệ hài lòng</p>
                </div>
              </div>
            </Reveal>

            {/* Text */}
            <Reveal delay={0.15}>
              <div className="lg:pl-8">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#e63329]">Về Ong Vàng</p>
                <h2 className="mb-6 text-3xl font-black uppercase leading-tight text-[#111] lg:text-4xl">
                  Hệ sinh thái<br />
                  <span className="text-[#e63329]">Marketing Toàn Diện</span>
                </h2>
                <p className="mb-4 text-[15px] leading-relaxed text-[#555]">
                  {org?.description || "Ong Vàng Marketing & Training mong muốn tạo dựng uy tín và vị thế nhất định trên bản đồ kinh tế: Trở thành đơn vị tư vấn Marketing hàng đầu Việt Nam, đồng hành cùng hàng nghìn doanh nghiệp nâng cao năng lực cạnh tranh."}
                </p>
                <p className="mb-8 text-[15px] leading-relaxed text-[#555]">
                  Sức mạnh Ong Vàng đến từ tinh thần sáng tạo, trung thực và tử tế. Chúng tôi hội tụ thế hệ sáng tạo mới để biến chiến lược thành hành động hiệu quả, mang lại giá trị thực tiễn cho khách hàng và cộng đồng.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { v: projectCount, l: "Dự án trên hệ thống" },
                    { v: customerCount, l: "Khách hàng trong CRM" },
                    { v: `${stats.services}`, l: "Dịch vụ đang cung cấp" },
                    { v: `${stats.courses}`, l: "Khóa học đã xuất bản" },
                  ].map((s) => (
                    <div key={s.l} className="rounded-2xl border border-black/[0.08] bg-white p-4">
                      <p className="text-2xl font-black text-[#e63329]">{s.v}</p>
                      <p className="text-xs text-[#888]">{s.l}</p>
                    </div>
                  ))}
                </div>
                <Link href="/ongvang/lien-he"
                  className="inline-flex items-center gap-2 rounded-full bg-[#111] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#e63329]">
                  Tìm hiểu thêm →
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════ PORTFOLIO ══════════════════════════════ */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Reveal><p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[#e63329]">Dự án tiêu biểu</p></Reveal>
              <Reveal delay={0.1}>
                <h2 className="text-3xl font-black uppercase leading-tight text-[#111] lg:text-4xl">
                  Dự án tiêu biểu<br /><span className="text-[#e63329]">của chúng tôi</span>
                </h2>
              </Reveal>
            </div>
            <Reveal direction="left">
              <Link href="/ongvang/lien-he" className="text-sm font-semibold text-[#e63329] hover:underline">
                Xem thêm →
              </Link>
            </Reveal>
          </div>
          <SefaPortfolio />
        </div>
      </section>

      {/* ═══════════════════ CTA BANNER ═════════════════════════════ */}
      <section className="bg-[#e63329] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <Reveal>
              <h2 className="text-[60px] font-black uppercase text-white lg:text-[60px] leading-[1.1]">
                Total Brand Marketing Performance Solutions<br />
                <span className="text-white/70 text-2xl font-semibold normal-case">Cùng Ong Vàng tăng trưởng nhiều lần doanh thu</span>
              </h2>
            </Reveal>
            <Reveal direction="left">
              <a href={`tel:${phone.replace(/\s+/g, "")}`}
                className="shrink-0 rounded-full bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-[#e63329] shadow-xl transition-all hover:bg-[#111] hover:text-white active:scale-95">
                Liên hệ Ong Vàng
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIALS ═══════════════════════════ */}
      <section className="bg-[#f8f6f2] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-12 text-center">
            <Reveal><p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#e63329]">Sự tin tưởng từ khách hàng</p></Reveal>
            <Reveal delay={0.1}>
              <h2 className="text-3xl font-black uppercase text-[#111] lg:text-4xl">
                Khách hàng nói gì về<br /><span className="text-[#e63329]">Ong Vàng</span>
              </h2>
            </Reveal>
          </div>
          <SefaTestimonials />
        </div>
      </section>

      {/* ═══════════════════ NEWS & INSIGHTS ════════════════════════ */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Reveal><p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[#e63329]">Kiến thức & Góc nhìn</p></Reveal>
              <Reveal delay={0.1}>
                <h2 className="text-3xl font-black uppercase text-[#111] lg:text-4xl">
                  Tin tức &amp;<br /><span className="text-[#e63329]">Sự kiện</span>
                </h2>
              </Reveal>
            </div>
            <Reveal direction="left">
              <Link href="/ongvang/lien-he" className="text-sm font-semibold text-[#e63329] hover:underline">Xem thêm →</Link>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {newsItems.map((news, i) => (
              <Reveal key={news.title} delay={i * 0.07}>
                <article className="group overflow-hidden rounded-2xl border border-black/[0.06] bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.08]">
                  <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={news.img} alt={news.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="p-5">
                    <span className="mb-2 inline-block rounded-full bg-[#e63329]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#e63329]">
                      {news.cat}
                    </span>
                    <h3 className="mb-2 text-[15px] font-bold leading-snug text-[#111] line-clamp-2 group-hover:text-[#e63329] transition-colors">
                      {news.title}
                    </h3>
                    <p className="text-[13px] leading-relaxed text-[#888] line-clamp-2">{news.excerpt}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-black/[0.06] pt-4">
                      <span className="text-xs text-[#bbb]">Ong Vàng Blog</span>
                      <Link href="/ongvang/lien-he" className="text-xs font-bold text-[#e63329] hover:underline">Đọc thêm →</Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER CTA ═════════════════════════════ */}
      <section className="bg-[#111] py-20 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#e63329]">Sẵn sàng bứt phá?</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mb-4 text-4xl font-black uppercase leading-tight text-white lg:text-5xl">
              Nâng tầm Thương hiệu<br />
              <span className="text-[#e63329]">cùng Ong Vàng</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mb-8 text-[#666]">Cập nhật những xu hướng và phân tích mới nhất về Marketing và Branding</p>
          </Reveal>
          <Reveal delay={0.3}>
            <Link href="/ongvang/lien-he"
              className="inline-flex items-center gap-2 rounded-full bg-[#e63329] px-10 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-2xl shadow-[#e63329]/30 transition-all hover:scale-105 active:scale-95">
              Xem dự án của Ong Vàng →
            </Link>
          </Reveal>

          <Reveal delay={0.4} className="mt-16 flex flex-wrap justify-center gap-6 text-sm text-[#555]">
            {[
              { label: phone, icon: "📞", href: `tel:${phone.replace(/\s+/g, "")}` },
              { label: email, icon: "✉️", href: `mailto:${email}` },
              { label: address, icon: "📍", href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` },
            ].map((item) => (
              <a key={item.label} href={item.href} className="flex items-center gap-2 transition-colors hover:text-white">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </Reveal>
        </div>
      </section>
    </div>
  );
}
