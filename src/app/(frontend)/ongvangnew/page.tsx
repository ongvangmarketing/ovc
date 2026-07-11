import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  Clock3,
  Globe2,
  Mail,
  MapPin,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

import { getTenantDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Ong Vàng Marketing | Tăng trưởng bằng dữ liệu",
  description: "Giải pháp marketing, công nghệ và đào tạo thực chiến cho doanh nghiệp Việt.",
};

const heroImage = "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=88";
const teamImage = "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1500&q=86";
const cultureImage = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1500&q=86";

const benefits = [
  { icon: Search, title: "Nghiên cứu bài bản", text: "Phân tích thị trường, khách hàng và đối thủ trước khi lựa chọn kênh tăng trưởng." },
  { icon: BarChart3, title: "Triển khai minh bạch", text: "Kế hoạch, ngân sách và hiệu quả được theo dõi bằng dữ liệu rõ ràng theo từng giai đoạn." },
  { icon: Sparkles, title: "Giải pháp toàn diện", text: "Kết hợp chiến lược, nội dung, quảng cáo, công nghệ và đào tạo trong cùng một hệ thống." },
  { icon: TrendingUp, title: "Tối ưu liên tục", text: "Đội ngũ đồng hành sát sao để cải thiện chuyển đổi và hiệu suất đầu tư thực tế." },
];

const faqs = [
  ["Ong Vàng phù hợp với doanh nghiệp nào?", "Chúng tôi đồng hành cùng doanh nghiệp vừa và nhỏ, đội ngũ bán hàng, đơn vị đào tạo và thương hiệu cần xây hệ thống marketing có thể đo lường."],
  ["Chi phí triển khai được tính như thế nào?", "Chi phí được thiết kế theo mục tiêu, phạm vi công việc và ngân sách thực tế. Mỗi đề xuất đều có hạng mục, thời gian và chỉ số theo dõi rõ ràng."],
  ["Bao lâu có thể nhìn thấy kết quả?", "Các chiến dịch quảng cáo có thể tạo tín hiệu trong những tuần đầu. SEO, nội dung và xây dựng thương hiệu thường cần 3-6 tháng để tạo nền tảng ổn định."],
  ["Ong Vàng có báo cáo hiệu quả không?", "Có. Khách hàng nhận báo cáo định kỳ theo chỉ số đã thống nhất, cùng nhận định và kế hoạch tối ưu cho giai đoạn tiếp theo."],
];

function money(value: unknown, currency = "VND") {
  const amount = Number(value);
  if (!amount) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

export default async function OngVangNewPage() {
  const organization = await getTenantDb().organization.findUnique({ where: { slug: "ongvangcomvn" } })
    ?? await getTenantDb().organization.findFirst({ where: { name: { contains: "Ong Vàng", mode: "insensitive" } } })
    ?? await getTenantDb().organization.findFirst();
  const [services, courses] = organization
    ? await Promise.all([
        getTenantDb().service.findMany({
          where: { organizationId: organization.id, status: "ACTIVE" },
          include: { options: { where: { status: "ACTIVE" }, orderBy: { sortOrder: "asc" } } },
          orderBy: { sortOrder: "asc" },
        }),
        getTenantDb().course.findMany({
          where: { organizationId: organization.id, status: "PUBLISHED" },
          orderBy: { createdAt: "desc" },
        }),
      ])
    : [[], []];
  const brandName = organization?.name || "Ong Vàng";
  const phone = organization?.phone || "0909 999 999";
  const email = organization?.email || "contact@ongvang.com.vn";
  const address = organization?.address || "TP. Hồ Chí Minh, Việt Nam";

  return (
    <div className="min-h-screen bg-white text-[#172238] [font-family:'Be_Vietnam_Pro',Arial,sans-serif]">
      <div className="bg-[#13233f] text-white">
        <div className="mx-auto flex min-h-10 max-w-[1240px] items-center justify-between gap-4 px-5 py-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-white/78">
            <a href={`tel:${phone}`} className="flex items-center gap-1.5 hover:text-[#ffd229]"><Phone className="h-3.5 w-3.5" />{phone}</a>
            <span className="hidden items-center gap-1.5 sm:flex"><MapPin className="h-3.5 w-3.5" />{address}</span>
            <span className="hidden items-center gap-1.5 md:flex"><Clock3 className="h-3.5 w-3.5" />T2 - T6: 08:30 - 17:30</span>
          </div>
          <a href={`mailto:${email}`} className="flex shrink-0 items-center gap-1.5 text-white/78 hover:text-[#ffd229]"><Mail className="h-3.5 w-3.5" /><span className="hidden sm:inline">{email}</span></a>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[78px] max-w-[1240px] items-center justify-between gap-5 px-5">
          <Link href="/ongvangnew" className="flex min-w-0 items-center gap-3">
            {organization?.logo ? <Image src={organization.logo} alt={brandName} width={148} height={42} unoptimized className="h-11 w-auto object-contain" /> : <Image src="/brand/ong-vang-logo.png" alt={brandName} width={148} height={42} className="h-11 w-auto object-contain" />}
            <span className="hidden border-l border-slate-200 pl-3 text-[11px] font-bold uppercase leading-4 text-slate-500 lg:block">Marketing<br />& Technology</span>
          </Link>
          <nav className="hidden items-center gap-7 lg:flex">
            {["Trang chủ", "Dịch vụ", "Quy trình", "Giới thiệu", "Đào tạo"].map((item, index) => (
              <a key={item} href={["#home", "#services", "#process", "#about", "#courses"][index]} className="text-[14px] font-semibold text-slate-700 transition hover:text-[#e9a900]">{item}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/ongvangcomvn/lien-he" className="hidden h-11 items-center gap-2 bg-[#ffd229] px-5 text-[13px] font-extrabold text-[#172238] transition hover:bg-[#172238] hover:text-white sm:flex">NHẬN TƯ VẤN <ArrowRight className="h-4 w-4" /></Link>
            <button type="button" aria-label="Mở menu" className="flex h-11 w-11 items-center justify-center border border-slate-200 lg:hidden"><Menu className="h-5 w-5" /></button>
          </div>
        </div>
      </header>

      <main>
        <section id="home" className="relative min-h-[680px] overflow-hidden bg-[#152641] text-white">
          <Image src={heroImage} alt="Đội ngũ Ong Vàng hoạch định chiến lược" fill priority className="object-cover object-center" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,31,55,.96)_0%,rgba(14,31,55,.88)_42%,rgba(14,31,55,.18)_78%)]" />
          <div className="relative mx-auto flex min-h-[680px] max-w-[1240px] items-center px-5 py-20">
            <div className="max-w-[720px]">
              <p className="mb-5 inline-flex items-center gap-2 border-l-4 border-[#ffd229] pl-3 text-[13px] font-extrabold uppercase tracking-[.16em] text-[#ffd229]">Digital Growth Partner 2026</p>
              <h1 className="max-w-[700px] text-[42px] font-black leading-[1.12] tracking-[0] sm:text-[58px] lg:text-[68px]">Tăng tốc tăng trưởng bằng marketing và công nghệ</h1>
              <p className="mt-6 max-w-[610px] text-[17px] leading-8 text-white/78">{organization?.description || "Ong Vàng xây dựng hệ thống marketing dựa trên dữ liệu, giúp doanh nghiệp tiếp cận đúng khách hàng, tối ưu chuyển đổi và phát triển doanh thu bền vững."}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/ongvangcomvn/lien-he" className="flex h-[52px] items-center gap-2 bg-[#ffd229] px-7 text-[14px] font-extrabold text-[#172238] transition hover:bg-white">TƯ VẤN CHIẾN LƯỢC <ArrowRight className="h-4 w-4" /></Link>
                <a href="#services" className="flex h-[52px] items-center gap-2 border border-white/40 px-7 text-[14px] font-bold transition hover:border-white hover:bg-white hover:text-[#172238]">KHÁM PHÁ DỊCH VỤ</a>
              </div>
              <div className="mt-10 grid max-w-[600px] grid-cols-2 gap-4 border-t border-white/20 pt-7 sm:grid-cols-3">
                {[["100+", "Dự án triển khai"], ["95%", "Khách hàng hài lòng"], ["10+", "Năm kinh nghiệm"]].map(([value, label]) => <div key={label}><strong className="block text-3xl text-[#ffd229]">{value}</strong><span className="mt-1 block text-[12px] text-white/65">{label}</span></div>)}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white py-7">
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-center gap-x-12 gap-y-5 px-5 text-[14px] font-extrabold uppercase text-slate-400">
            <span className="text-[11px] tracking-[.16em] text-slate-500">Nền tảng triển khai</span>
            {['Google Partner','Meta Business','TikTok Ads','Zalo OA','CRM Automation'].map((item) => <span key={item} className="transition hover:text-[#172238]">{item}</span>)}
          </div>
        </section>

        <section id="services" className="bg-[#f5f7fa] py-24">
          <div className="mx-auto max-w-[1240px] px-5">
            <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl"><p className="mb-3 text-[12px] font-black uppercase tracking-[.18em] text-[#d79b00]">Năng lực của Ong Vàng</p><h2 className="text-3xl font-black leading-tight text-[#172238] sm:text-5xl">Giải pháp thực chiến cho từng bài toán tăng trưởng</h2></div>
              <Link href="/ongvangcomvn/dich-vu" className="flex items-center gap-2 text-[13px] font-extrabold text-[#172238] hover:text-[#d79b00]">XEM TẤT CẢ DỊCH VỤ <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid gap-px overflow-hidden border border-slate-200 bg-slate-200 md:grid-cols-2 lg:grid-cols-3">
              {(services.length ? services.slice(0, 9) : [
                { id: 'strategy', name: 'Chiến lược Marketing', description: 'Nghiên cứu và hoạch định chiến lược tăng trưởng phù hợp với mô hình kinh doanh.', options: [] },
                { id: 'ads', name: 'Quảng cáo đa kênh', description: 'Google, Facebook, TikTok và Zalo được vận hành theo mục tiêu chuyển đổi.', options: [] },
                { id: 'website', name: 'Website & Automation', description: 'Xây dựng nền tảng số đồng bộ với CRM, dữ liệu và quy trình bán hàng.', options: [] },
              ]).map((service, index) => {
                const icons = [Target, BarChart3, Globe2, Sparkles, Zap, ShieldCheck];
                const Icon = icons[index % icons.length] as any;
                const firstOption = service.options?.[0];
                return <article key={service.id} className="group min-h-[310px] bg-white p-8 transition hover:bg-[#172238]">
                  <div className="flex h-[52px] w-[52px] items-center justify-center bg-[#fff6d7] text-[#d79b00] transition group-hover:bg-[#ffd229] group-hover:text-[#172238]"><Icon className="h-6 w-6" /></div>
                  <h3 className="mt-7 text-xl font-extrabold group-hover:text-white">{service.name}</h3>
                  <p className="mt-3 line-clamp-3 text-[14px] leading-7 text-slate-500 group-hover:text-white/65">{service.description || "Giải pháp được thiết kế theo mục tiêu và dữ liệu thực tế của doanh nghiệp."}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5 group-hover:border-white/15"><span className="text-[12px] font-bold text-[#d79b00] group-hover:text-[#ffd229]">{firstOption ? money(firstOption.price, firstOption.currency) : "Nhận tư vấn"}</span><Link href="/ongvangcomvn/lien-he" aria-label={`Tìm hiểu ${service.name}`} className="flex h-9 w-9 items-center justify-center border border-slate-200 group-hover:border-white/30 group-hover:text-white"><ArrowRight className="h-4 w-4" /></Link></div>
                </article>;
              })}
            </div>
          </div>
        </section>

        <section id="about" className="py-24">
          <div className="mx-auto grid max-w-[1240px] gap-14 px-5 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div className="relative min-h-[520px]"><Image src={teamImage} alt="Đội ngũ Ong Vàng" fill className="object-cover" /><div className="absolute -bottom-6 -right-1 bg-[#ffd229] p-7 sm:right-[-24px]"><strong className="block text-4xl font-black">10+</strong><span className="text-[12px] font-bold uppercase">Năm đồng hành doanh nghiệp</span></div></div>
            <div><p className="text-[12px] font-black uppercase tracking-[.18em] text-[#d79b00]">Vì sao chọn Ong Vàng</p><h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">Đội ngũ hiểu kinh doanh, làm marketing bằng dữ liệu</h2><p className="mt-6 text-[15px] leading-8 text-slate-600">Chúng tôi không chạy theo chỉ số bề nổi. Mỗi hoạt động đều bắt đầu từ mục tiêu kinh doanh, được triển khai theo quy trình và cải thiện qua dữ liệu thực tế.</p>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">{benefits.map(({ icon, title, text }) => { const Icon = icon as any; return <div key={title} className="border-t border-slate-200 pt-5"><Icon className="h-5 w-5 text-[#d79b00]" /><h3 className="mt-3 font-extrabold">{title}</h3><p className="mt-2 text-[13px] leading-6 text-slate-500">{text}</p></div>; })}</div>
            </div>
          </div>
        </section>

        <section id="process" className="bg-[#172238] py-24 text-white">
          <div className="mx-auto max-w-[1240px] px-5"><div className="max-w-2xl"><p className="text-[12px] font-black uppercase tracking-[.18em] text-[#ffd229]">Quy trình triển khai</p><h2 className="mt-3 text-3xl font-black sm:text-5xl">Từ mục tiêu đến kết quả trong 5 giai đoạn</h2></div>
            <div className="mt-14 grid gap-px bg-white/15 md:grid-cols-5">{[
              ['01','Khảo sát','Hiểu mục tiêu, sản phẩm và nguồn lực.'],['02','Phân tích','Nghiên cứu thị trường và cơ hội.'],['03','Chiến lược','Thiết kế kế hoạch và chỉ số đo lường.'],['04','Triển khai','Thực thi đồng bộ theo từng kênh.'],['05','Tối ưu','Báo cáo, thử nghiệm và cải thiện.'],
            ].map(([number,title,text]) => <div key={number} className="bg-[#172238] p-7"><span className="text-4xl font-black text-[#ffd229]">{number}</span><h3 className="mt-8 text-lg font-extrabold">{title}</h3><p className="mt-3 text-[13px] leading-6 text-white/55">{text}</p></div>)}</div>
          </div>
        </section>

        {courses.length > 0 && <section id="courses" className="bg-[#f5f7fa] py-24"><div className="mx-auto max-w-[1240px] px-5"><p className="text-[12px] font-black uppercase tracking-[.18em] text-[#d79b00]">Đào tạo thực chiến</p><div className="mt-3 flex items-end justify-between gap-5"><h2 className="max-w-2xl text-3xl font-black sm:text-5xl">Học để triển khai được ngay</h2><Link href="/ongvangcomvn/khoa-hoc" className="hidden items-center gap-2 text-[13px] font-extrabold md:flex">TẤT CẢ KHÓA HỌC <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">{courses.slice(0,3).map((course) => <article key={course.id} className="overflow-hidden bg-white"><div className="relative aspect-[16/10] bg-[#dfe5ee]">{course.thumbnail ? <Image src={course.thumbnail} alt={course.title} fill unoptimized className="object-cover" /> : <Image src={cultureImage} alt={course.title} fill className="object-cover" />}</div><div className="p-7"><div className="flex items-center gap-4 text-[11px] font-bold uppercase text-slate-400"><span>{course.level}</span>{course.duration ? <span>{course.duration} phút</span> : null}</div><h3 className="mt-4 text-xl font-extrabold leading-7">{course.title}</h3><p className="mt-3 line-clamp-2 text-[13px] leading-6 text-slate-500">{course.description}</p><div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5"><strong className="text-[#d79b00]">{money(course.price, course.currency)}</strong><Link href="/ongvangcomvn/lien-he" className="text-[12px] font-extrabold">ĐĂNG KÝ →</Link></div></div></article>)}</div></div></section>}

        <section className="py-24"><div className="mx-auto grid max-w-[1240px] gap-14 px-5 lg:grid-cols-[.85fr_1.15fr] lg:items-start"><div><p className="text-[12px] font-black uppercase tracking-[.18em] text-[#d79b00]">Câu hỏi thường gặp</p><h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">Thông tin trước khi bắt đầu</h2><p className="mt-5 text-[14px] leading-7 text-slate-500">Trao đổi trực tiếp với đội ngũ Ong Vàng để nhận đề xuất phù hợp nhất cho mục tiêu của doanh nghiệp.</p><Link href="/ongvangcomvn/lien-he" className="mt-7 inline-flex items-center gap-2 bg-[#ffd229] px-6 py-4 text-[13px] font-extrabold">GỬI YÊU CẦU <ArrowRight className="h-4 w-4" /></Link></div><div className="border-t border-slate-200">{faqs.map(([question,answer]) => <details key={question} className="group border-b border-slate-200 py-6"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-extrabold"><span>{question}</span><ChevronDown className="h-5 w-5 shrink-0 transition group-open:rotate-180" /></summary><p className="max-w-2xl pt-4 text-[14px] leading-7 text-slate-500">{answer}</p></details>)}</div></div></section>

        <section className="bg-[#ffd229] py-16"><div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-7 px-5 lg:flex-row lg:items-center"><div><p className="text-[12px] font-black uppercase tracking-[.18em]">Sẵn sàng tăng trưởng?</p><h2 className="mt-2 text-3xl font-black sm:text-5xl">Cùng Ong Vàng bắt đầu dự án của bạn.</h2></div><Link href="/ongvangcomvn/lien-he" className="flex h-14 shrink-0 items-center gap-2 bg-[#172238] px-8 text-[14px] font-extrabold text-white transition hover:bg-white hover:text-[#172238]">NHẬN TƯ VẤN MIỄN PHÍ <ArrowRight className="h-4 w-4" /></Link></div></section>
      </main>

      <footer className="bg-[#101b2e] py-16 text-white"><div className="mx-auto max-w-[1240px] px-5"><div className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-4"><div><Image src={organization?.logo || "/brand/ong-vang-logo.png"} alt={brandName} width={150} height={50} unoptimized={Boolean(organization?.logo)} className="h-12 w-auto object-contain brightness-0 invert" /><p className="mt-5 text-[13px] leading-7 text-white/55">Giải pháp marketing, công nghệ và đào tạo giúp doanh nghiệp phát triển bền vững.</p></div><div><h3 className="text-[13px] font-extrabold uppercase text-[#ffd229]">Dịch vụ</h3><div className="mt-5 grid gap-3 text-[13px] text-white/60">{services.slice(0,5).map(service => <Link key={service.id} href="/ongvangcomvn/dich-vu" className="hover:text-white">{service.name}</Link>)}</div></div><div><h3 className="text-[13px] font-extrabold uppercase text-[#ffd229]">Liên kết</h3><div className="mt-5 grid gap-3 text-[13px] text-white/60"><a href="#about">Về chúng tôi</a><a href="#process">Quy trình</a><Link href="/ongvangcomvn/khoa-hoc">Khóa học</Link><Link href="/ongvangcomvn/lien-he">Liên hệ</Link></div></div><div><h3 className="text-[13px] font-extrabold uppercase text-[#ffd229]">Liên hệ</h3><div className="mt-5 grid gap-4 text-[13px] text-white/60"><span className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#ffd229]" />{address}</span><a href={`tel:${phone}`} className="flex gap-2"><Phone className="h-4 w-4 text-[#ffd229]" />{phone}</a><a href={`mailto:${email}`} className="flex gap-2"><Mail className="h-4 w-4 text-[#ffd229]" />{email}</a></div></div></div><div className="flex flex-col justify-between gap-3 pt-7 text-[11px] text-white/40 sm:flex-row"><span>© 2026 {brandName}. All rights reserved.</span><span>Marketing • Technology • Training</span></div></div></footer>
    </div>
  );
}
