export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 bg-sidebar p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="2" stroke="currentColor" fill="none" />
              </svg>
            </div>
            <div>
              <p className="text-sidebar-foreground font-bold text-lg leading-none">Ong Vàng</p>
              <p className="text-sidebar-foreground/40 text-xs">Workspace</p>
            </div>
          </div>
        </div>

        {/* Testimonial / Feature highlight */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-6">
            {[
              { icon: "🎯", title: "CRM & Sales Pipeline", desc: "Quản lý toàn bộ vòng đời khách hàng từ lead đến deal thắng lợi" },
              { icon: "📊", title: "Tài chính thông minh", desc: "Báo giá, hóa đơn và thanh toán tự động trong một hệ thống" },
              { icon: "🚀", title: "Quản lý dự án", desc: "Kanban, Timeline, Calendar cho mọi phong cách làm việc" },
            ].map((feature) => (
              <div key={feature.title} className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">{feature.icon}</div>
                <div>
                  <p className="text-sidebar-foreground font-medium text-sm">{feature.title}</p>
                  <p className="text-sidebar-foreground/50 text-xs mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="border-l-2 border-primary pl-4">
            <p className="text-sidebar-foreground/70 text-sm italic leading-relaxed">
              &ldquo;Từ khi dùng Ong Vàng Workspace, đội ngũ chúng tôi tiết kiệm được 40% thời gian quản lý.&rdquo;
            </p>
            <p className="text-sidebar-foreground/40 text-xs mt-2">— CEO, TechCorp Vietnam</p>
          </div>
        </div>

        <p className="relative z-10 text-sidebar-foreground/30 text-xs">
          © 2026 Ong Vàng. All rights reserved.
        </p>
      </div>

      {/* Right — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        {children}
      </div>
    </div>
  );
}
