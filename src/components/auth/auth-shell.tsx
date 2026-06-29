import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="relative hidden w-[480px] flex-shrink-0 flex-col justify-between overflow-hidden bg-sidebar p-12 lg:flex">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white text-white">
                <path d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="2" stroke="currentColor" fill="none" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold leading-none text-sidebar-foreground">Ong Vàng</p>
              <p className="text-xs text-sidebar-foreground/40">Business Platform</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-6">
            {[
              { icon: "🎯", title: "CRM & Sales Pipeline", desc: "Quản lý toàn bộ vòng đời khách hàng từ lead đến deal thắng lợi" },
              { icon: "📊", title: "Tài chính thông minh", desc: "Báo giá, hóa đơn và thanh toán tự động trong một hệ thống" },
              { icon: "🚀", title: "Quản lý dự án", desc: "Kanban, Timeline, Calendar cho mọi phong cách làm việc" },
            ].map((feature) => (
              <div key={feature.title} className="flex items-start gap-3">
                <div className="flex-shrink-0 text-2xl">{feature.icon}</div>
                <div>
                  <p className="text-sm font-medium text-sidebar-foreground">{feature.title}</p>
                  <p className="mt-0.5 text-xs text-sidebar-foreground/50">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-l-2 border-primary pl-4">
            <p className="text-sm italic leading-relaxed text-sidebar-foreground/70">
              &ldquo;Từ khi dùng Ong Vàng, đội ngũ chúng tôi tiết kiệm được 40% thời gian quản lý.&rdquo;
            </p>
            <p className="mt-2 text-xs text-sidebar-foreground/40">CEO, TechCorp Vietnam</p>
          </div>
        </div>

        <p className="relative z-10 text-xs text-sidebar-foreground/30">
          © 2026 Ong Vàng. All rights reserved.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        {children}
      </div>
    </div>
  );
}
