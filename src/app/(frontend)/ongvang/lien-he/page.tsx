import type { Metadata } from "next";
import { getOngVangOrganization } from "../actions";
import { ContactFormClient } from "../ClientForm";
import { ScrollReveal } from "../_components/ScrollReveal";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Liên hệ tư vấn miễn phí với chuyên gia Ong Vàng Marketing & Training. Chúng tôi sẽ phản hồi trong vòng 24 giờ.",
};

const contactInfo = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
    label: "Hotline",
    defaultValue: "0987 654 321",
    field: "phone" as const,
    href: "tel:",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    label: "Email",
    defaultValue: "contact@ongvang.vn",
    field: "email" as const,
    href: "mailto:",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    label: "Địa chỉ",
    defaultValue: "TP. Hồ Chí Minh, Việt Nam",
    field: "address" as const,
    href: null,
  },
];

export default async function LienHePage() {
  const org = await getOngVangOrganization();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-40 pb-16">
        <div className="absolute top-0 left-1/2 -z-10 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-amber-700/10 blur-[100px]" />
        <div className="mx-auto max-w-7xl px-6 text-center">
          <ScrollReveal>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400">
              Kết nối với chúng tôi
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="mx-auto max-w-3xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
              Hãy để chúng tôi{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                đồng hành cùng bạn
              </span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-xl text-lg text-slate-400 leading-relaxed">
              Điền form để được tư vấn miễn phí. Chuyên gia sẽ liên hệ trong vòng 24 giờ làm việc.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Main content */}
      <section className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
            {/* Left info column */}
            <div className="lg:col-span-2">
              <ScrollReveal>
                <h2 className="text-2xl font-black text-white mb-8">Thông tin liên hệ</h2>
              </ScrollReveal>

              <div className="space-y-6">
                {contactInfo.map((item, i) => {
                  const value =
                    item.field === "address"
                      ? org?.address ?? item.defaultValue
                      : item.field === "phone"
                      ? org?.phone ?? item.defaultValue
                      : org?.email ?? item.defaultValue;

                  return (
                    <ScrollReveal key={item.label} delay={0.1 + i * 0.1}>
                      <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-white/20 transition-colors">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
                            {item.label}
                          </p>
                          {item.href ? (
                            <a
                              href={`${item.href}${value}`}
                              className="text-base font-medium text-white hover:text-amber-400 transition-colors"
                            >
                              {value}
                            </a>
                          ) : (
                            <p className="text-base font-medium text-white">{value}</p>
                          )}
                        </div>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>

              {/* Work hours */}
              <ScrollReveal delay={0.4}>
                <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
                    Giờ làm việc
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Thứ 2 – Thứ 6</span>
                      <span className="font-medium text-white">08:00 – 17:30</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Thứ 7</span>
                      <span className="font-medium text-white">08:00 – 12:00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Chủ nhật</span>
                      <span className="text-slate-600">Nghỉ</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Form column */}
            <ScrollReveal className="lg:col-span-3" direction="left">
              <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-sm lg:p-10">
                <h2 className="mb-2 text-2xl font-black text-white">Gửi yêu cầu tư vấn</h2>
                <p className="mb-8 text-sm text-slate-500">
                  Thông tin của bạn được bảo mật tuyệt đối. Chúng tôi không chia sẻ với bên thứ ba.
                </p>

                {org ? (
                  <ContactFormClient organizationId={org.id} />
                ) : (
                  <div className="py-10 text-center text-slate-500">
                    Không thể tải form. Vui lòng liên hệ trực tiếp qua hotline.
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Map / Trust strip */}
      <section className="border-t border-white/[0.06] bg-slate-900/20 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { icon: "⚡", title: "Phản hồi nhanh", desc: "Chúng tôi phản hồi trong vòng 24 giờ làm việc sau khi nhận được yêu cầu." },
              { icon: "🔒", title: "Bảo mật tuyệt đối", desc: "Thông tin của bạn được bảo mật và không chia sẻ với bất kỳ bên thứ ba nào." },
              { icon: "🎯", title: "Tư vấn chính xác", desc: "Chuyên gia sẽ phân tích và đề xuất giải pháp phù hợp nhất với doanh nghiệp bạn." },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.1}>
                <div className="text-center">
                  <div className="mb-4 text-4xl">{item.icon}</div>
                  <h3 className="mb-2 text-lg font-bold text-white">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
