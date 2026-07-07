import type { Metadata } from "next";
import { getOngVangOrganization, getOngVangServices } from "../actions";
import { ServiceCard } from "../_components/ServiceCard";
import { ScrollReveal } from "../_components/ScrollReveal";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dịch vụ",
  description: "Các gói dịch vụ Digital Marketing toàn diện — Facebook Ads, Google Ads, SEO, Content, Thương hiệu và nhiều hơn nữa.",
};

export default async function DichVuPage() {
  const org = await getOngVangOrganization();
  const services = org ? await getOngVangServices(org.id) : [];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-40 pb-20">
        <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/4 rounded-full bg-amber-600/15 blur-[100px]" />
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400">
              Dịch vụ của chúng tôi
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="max-w-3xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
              Giải pháp Marketing{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                toàn diện
              </span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
              Từ quảng cáo trả phí đến SEO tự nhiên, từ Content sáng tạo đến Xây dựng thương hiệu — chúng tôi có đủ giải pháp giúp doanh nghiệp bạn tăng trưởng bền vững.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Services grid */}
      <section className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-6">
          {services.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, i) => (
                <ServiceCard
                  key={service.id}
                  name={service.name}
                  description={service.description}
                  index={i}
                  href="/ongvang/lien-he"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 text-5xl">🔧</div>
              <h2 className="text-2xl font-bold text-white">Đang cập nhật dịch vụ</h2>
              <p className="mt-2 text-slate-500">Các gói dịch vụ sẽ sớm được cập nhật. Liên hệ trực tiếp với chúng tôi!</p>
              <Link href="/ongvang/lien-he" className="mt-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 font-semibold text-white transition-all hover:scale-105">
                Liên hệ tư vấn
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Why us section */}
      <section className="border-t border-white/[0.06] bg-slate-900/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <ScrollReveal>
              <h2 className="text-4xl font-black text-white sm:text-5xl">
                Tại sao chọn{" "}
                <span className="text-amber-500">Ong Vàng?</span>
              </h2>
            </ScrollReveal>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "🎯", title: "Kết quả đo lường được", desc: "Mọi chiến dịch đều được track và báo cáo minh bạch, rõ ràng theo tuần/tháng." },
              { icon: "🧠", title: "Chuyên gia thực chiến", desc: "Đội ngũ đã triển khai hàng trăm chiến dịch thực tế cho nhiều ngành nghề." },
              { icon: "⚡", title: "Triển khai nhanh", desc: "Từ tư vấn đến lên chiến dịch trong vòng 48 giờ làm việc." },
              { icon: "🤝", title: "Đồng hành lâu dài", desc: "Không chỉ làm dịch vụ, chúng tôi là đối tác chiến lược của bạn." },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.1}>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center hover:border-white/20 transition-colors">
                  <div className="mb-4 text-4xl">{item.icon}</div>
                  <h3 className="mb-2 text-lg font-bold text-white">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <ScrollReveal>
            <h2 className="text-4xl font-black text-white sm:text-5xl">Sẵn sàng hợp tác?</h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="mt-4 text-lg text-slate-400">Liên hệ để nhận báo giá và tư vấn chiến lược miễn phí.</p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              href="/ongvang/lien-he"
              className="mt-8 inline-flex rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
            >
              Nhận tư vấn miễn phí
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
