import type { ReactNode } from "react";
import { Layers3, ShieldCheck } from "lucide-react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="relative hidden w-[40%] max-w-[560px] flex-shrink-0 flex-col justify-between overflow-hidden bg-slate-950 p-12 lg:flex xl:p-14">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/20">
              <Layers3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-base font-semibold leading-none text-white">Business Workspace</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-sm space-y-8">
          <div>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">Không gian làm việc bảo mật.</h2>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Truy cập theo tổ chức</p>
              <p className="mt-1 text-xs text-slate-400">Đăng nhập để tiếp tục.</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-600">Secure workspace</p>
      </aside>

      <main className="flex flex-1 items-center justify-center bg-slate-50/70 px-6 py-10 sm:px-10">
        {children}
      </main>
    </div>
  );
}
