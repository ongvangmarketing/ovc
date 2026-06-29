import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  DollarSign,
  FolderKanban,
  Hexagon,
  Megaphone,
  Users,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Ong Vàng Workspace — Nền tảng quản trị doanh nghiệp",
  description:
    "CRM, Dự án, Tài chính, Đào tạo và Marketing tích hợp trên một hệ thống. Thiết kế theo chuẩn Enterprise SaaS 2026.",
};

const features = [
  {
    icon: Users,
    title: "CRM & Sales Pipeline",
    desc: "Quản lý leads, deals và khách hàng với pipeline Kanban trực quan. Theo dõi toàn bộ hành trình từ lead đến hợp đồng.",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    icon: FolderKanban,
    title: "Quản lý dự án",
    desc: "Kanban, Timeline, Gantt chart và Calendar. Phân công task, theo dõi tiến độ và cộng tác theo thời gian thực.",
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950/40",
  },
  {
    icon: DollarSign,
    title: "Tài chính tích hợp",
    desc: "Báo giá → Hợp đồng → Hóa đơn → Thanh toán. Tự động hóa toàn bộ quy trình tài chính, báo cáo chi tiết.",
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
  {
    icon: BookOpen,
    title: "LMS đào tạo",
    desc: "Khóa học online, lớp học, chấm điểm và cấp chứng chỉ. Portal riêng cho giảng viên và học viên.",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    icon: Megaphone,
    title: "Marketing & Email",
    desc: "Campaign email, ZNS, social media automation. Phân tích hiệu quả chiến dịch với dashboard realtime.",
    color: "text-rose-600",
    bg: "bg-rose-50 dark:bg-rose-950/40",
  },
  {
    icon: BarChart3,
    title: "Báo cáo & Analytics",
    desc: "Dashboard tổng quan với đa dạng biểu đồ. Xuất báo cáo PDF/Excel, lên lịch gửi tự động.",
    color: "text-teal-600",
    bg: "bg-teal-50 dark:bg-teal-950/40",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "990.000",
    period: "/tháng",
    desc: "Phù hợp cho team nhỏ 1-5 người",
    color: "border-border",
    features: ["5 người dùng", "CRM cơ bản", "10 dự án", "5GB lưu trữ", "Email support"],
    cta: "Bắt đầu miễn phí",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "2.990.000",
    period: "/tháng",
    desc: "Dành cho doanh nghiệp đang tăng trưởng",
    color: "border-primary",
    features: ["25 người dùng", "CRM đầy đủ", "Không giới hạn dự án", "50GB lưu trữ", "Finance & Invoicing", "LMS cơ bản", "Priority support"],
    cta: "Dùng thử 14 ngày",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Liên hệ",
    period: "",
    desc: "Tùy chỉnh cho tổ chức lớn",
    color: "border-border",
    features: ["Không giới hạn users", "Tất cả tính năng", "Custom domain", "1TB lưu trữ", "API access", "SLA 99.9%", "Dedicated support"],
    cta: "Liên hệ tư vấn",
    highlighted: false,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Hexagon className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-foreground text-lg">Ong Vàng</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            {["Tính năng", "Giá cả", "Khách hàng", "Blog"].map((item) => (
              <a key={item} href="#" className="hover:text-foreground transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all shadow-sm"
            >
              Dùng thử miễn phí
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted text-xs text-muted-foreground mb-6">
            <Zap className="w-3 h-3 text-primary" />
            Enterprise SaaS Platform 2026
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6">
            Workspace cho{" "}
            <span className="gradient-text">doanh nghiệp</span>{" "}
            hiện đại
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            CRM, Dự án, Tài chính, Đào tạo và Marketing — tất cả trên một nền tảng.
            Thiết kế theo chuẩn Enterprise SaaS, tương đương Notion, Linear và HubSpot.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-2 h-12 px-8 rounded-xl bg-primary text-white font-semibold text-base hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:shadow-primary/20"
            >
              Bắt đầu miễn phí
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 h-12 px-8 rounded-xl border border-border bg-background text-foreground font-medium text-base hover:bg-muted transition-all"
            >
              Xem demo
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Miễn phí 14 ngày · Không cần thẻ tín dụng · Hủy bất cứ lúc nào
          </p>
        </div>

        {/* Hero Image / Dashboard Preview */}
        <div className="max-w-6xl mx-auto mt-16">
          <div className="relative rounded-2xl border border-border shadow-2xl shadow-foreground/5 overflow-hidden bg-card">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50 z-10 pointer-events-none" />
            {/* Mock dashboard preview */}
            <div className="flex h-96">
              {/* Sidebar preview */}
              <div className="w-52 bg-sidebar p-3 space-y-1">
                {["Dashboard", "CRM", "Dự án", "Tài chính", "Khóa học"].map((item, i) => (
                  <div
                    key={item}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                      i === 0
                        ? "bg-sidebar-muted text-sidebar-foreground"
                        : "text-sidebar-foreground/50"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-sm ${i === 0 ? "bg-primary" : "bg-sidebar-muted"}`} />
                    {item}
                  </div>
                ))}
              </div>

              {/* Content preview */}
              <div className="flex-1 p-6 bg-background">
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Doanh thu", val: "128.4M₫", color: "bg-amber-100" },
                    { label: "Liên hệ", val: "284", color: "bg-blue-100" },
                    { label: "Dự án", val: "14", color: "bg-purple-100" },
                    { label: "Hóa đơn", val: "47", color: "bg-emerald-100" },
                  ].map((item) => (
                    <div key={item.label} className="card-base p-3">
                      <div className={`w-6 h-6 rounded-md ${item.color} mb-2`} />
                      <p className="text-xs font-bold">{item.val}</p>
                      <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className="card-base p-3 h-40 flex items-end gap-1.5">
                  {[60, 80, 55, 90, 75, 95, 85, 100, 88, 110, 105, 128].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm bg-primary/20 relative overflow-hidden" style={{ height: `${h}%` }}>
                      <div className="absolute bottom-0 inset-x-0 bg-primary/60 rounded-sm" style={{ height: "40%" }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Mọi thứ bạn cần trong{" "}
              <span className="gradient-text">một workspace</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Không cần lắp ghép nhiều công cụ. Ong Vàng Workspace tích hợp toàn bộ quy trình kinh doanh vào một hệ thống thống nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="card-base p-6 hover:shadow-md transition-all duration-200 group">
                  <div className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Giá cả minh bạch</h2>
            <p className="text-muted-foreground">Bắt đầu miễn phí, nâng cấp khi cần thiết</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`card-base p-6 border-2 ${plan.color} ${
                  plan.highlighted
                    ? "shadow-lg shadow-primary/10 relative overflow-hidden"
                    : ""
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-primary text-white text-xs font-medium">
                    Phổ biến
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="font-bold text-foreground text-lg">{plan.name}</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">{plan.desc}</p>
                </div>
                <div className="mb-5">
                  {plan.price === "Liên hệ" ? (
                    <p className="text-3xl font-bold text-foreground">Liên hệ</p>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <p className="text-3xl font-bold text-foreground">{plan.price}₫</p>
                      <p className="text-muted-foreground text-sm">{plan.period}</p>
                    </div>
                  )}
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center h-10 rounded-xl text-sm font-semibold transition-all ${
                    plan.highlighted
                      ? "bg-primary text-white hover:bg-primary/90 shadow-sm"
                      : "border border-border text-foreground hover:bg-muted"
                  } flex items-center justify-center`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-sidebar">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-sidebar-foreground mb-4">
            Sẵn sàng chuyển đổi số?
          </h2>
          <p className="text-sidebar-foreground/60 mb-8">
            Tham gia cùng hàng nghìn doanh nghiệp đang sử dụng Ong Vàng Workspace để tăng hiệu suất hoạt động.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
          >
            Bắt đầu miễn phí ngay
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Hexagon className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="font-semibold text-foreground text-sm">Ong Vàng Workspace</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 Ong Vàng. Built with Next.js, TypeScript & ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}
