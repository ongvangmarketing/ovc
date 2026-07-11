import { UserCircle2 } from "lucide-react";
import { getCustomerPortalData } from "./portal-data";
import { AppleCustomerDashboardClient } from "./apple-customer-dashboard-client";

export default async function CustomerPortalPage() {
  const data = await getCustomerPortalData();

  if (!data.contact) {
    return (
      <div className="mx-auto max-w-[1440px] px-6 py-8 animate-in fade-in duration-500">
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[16px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <UserCircle2 className="mb-4 h-12 w-12 text-slate-300" />
          <h3 className="text-[15px] font-medium text-slate-900">Không tìm thấy thông tin khách hàng</h3>
          <p className="mt-1 text-sm text-slate-500">Email của bạn ({data.session.user.email}) chưa được liên kết với hồ sơ khách hàng nào.</p>
        </div>
      </div>
    );
  }

  return <AppleCustomerDashboardClient data={data} />;
}
