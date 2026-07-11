import { Building2, ChevronRight, LogOut } from "lucide-react";
import Link from "next/link";

type Organization = {
  id: string;
  name: string;
  logo?: string | null;
  slug: string;
};

export function SelectOrgClient({ orgs, userName }: { orgs: Organization[], userName: string }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Chào mừng, {userName}!</h1>
          <p className="mt-2 text-sm text-slate-500">
            Bạn đang tham gia nhiều tổ chức. Vui lòng chọn tổ chức bạn muốn làm việc.
          </p>
        </div>

        <div className="space-y-3">
          {orgs.map((org) => (
            <Link
              key={org.id}
              href={`/api/select-org?organizationId=${encodeURIComponent(org.id)}`}
              className="group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 overflow-hidden">
                  {org.logo ? (
                    <img src={org.logo} alt={org.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-bold text-slate-400 text-lg">{org.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">{org.name}</h3>
                  <p className="text-xs text-slate-500">Workspace</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-500" />
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/api/logout" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
            <LogOut className="h-4 w-4" /> Đăng xuất
          </Link>
        </div>

      </div>
    </div>
  );
}
