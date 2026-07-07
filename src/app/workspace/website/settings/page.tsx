import type { Metadata } from "next";

import { getWorkspaceDomains } from "@/app/actions/settings";
import { DomainSettingsClient } from "@/modules/core/components/domain-settings-client";

export const metadata: Metadata = {
  title: "Cài đặt Website",
};

export default async function WebsiteSettingsPage() {
  const domains = await getWorkspaceDomains();

  return (
    <div className="p-8 w-full max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Cài đặt Website</h1>
        <p className="text-muted-foreground mt-1">Quản lý tên miền và thiết lập trang web của bạn.</p>
      </div>

      <DomainSettingsClient initialDomains={domains} enableSubdomainBuilder subdomainSuffix=".app.ovc.vn" defaultTarget="homepage" />
    </div>
  );
}
