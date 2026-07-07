import { ShieldCheck, KeyRound, Ticket, Plus } from "lucide-react";
import { LicensingClient } from "./_components/licensing-client";
import { getPlatformProvisioningOptions } from "@/app/actions/organizations";

export default async function LicensingPage() {
  const { plans, modules } = await getPlatformProvisioningOptions();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">License Management</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-950">Quản lý Cấp phép</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tạo và quản lý các mã kích hoạt (License Keys) cho khách hàng.
          </p>
        </div>
      </div>

      <LicensingClient plans={plans} modules={modules} />
    </div>
  );
}
