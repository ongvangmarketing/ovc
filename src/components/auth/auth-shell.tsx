import type { ReactNode } from "react";
import { BarChart3, Layers3, ShieldCheck, Workflow } from "lucide-react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="relative hidden w-[46%] max-w-[680px] flex-shrink-0 flex-col justify-between overflow-hidden bg-slate-950 p-12 lg:flex xl:p-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/20">
              <Layers3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-base font-semibold leading-none text-white">Business Workspace</p>
              <p className="mt-1 text-xs text-slate-400">Unified operations platform</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-md space-y-10">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">One connected workspace</p>
            <h2 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">Vận hành doanh nghiệp trên một nền tảng.</h2>
            <p className="mt-5 text-base leading-7 text-slate-400">Dữ liệu, quy trình và đội ngũ được kết nối trong một không gian làm việc bảo mật.</p>
          </div>
          <div className="space-y-5">
            {[
              { icon: Workflow, title: "Quy trình thống nhất", desc: "Kết nối bán hàng, dự án và vận hành." },
              { icon: BarChart3, title: "Dữ liệu tức thời", desc: "Theo dõi hiệu suất từ một nguồn dữ liệu." },
              { icon: ShieldCheck, title: "Truy cập bảo mật", desc: "Dữ liệu được phân quyền theo tổ chức." },
            ].map((feature) => (
              <div key={feature.title} className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-emerald-400"><feature.icon className="h-4 w-4" /></div>
                <div>
                  <p className="text-sm font-medium text-white">{feature.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-600">
          Secure workspace · Privacy protected
        </p>
      </aside>

      <main className="flex flex-1 items-center justify-center bg-slate-50/70 px-6 py-12 sm:px-10">
        {children}
      </main>
    </div>
  );
}
