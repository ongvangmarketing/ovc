import type { Metadata } from "next";

import { getWorkspaceDomains } from "@/app/actions/settings";
import { DomainSettingsClient } from "@/modules/core/components/domain-settings-client";

export const metadata: Metadata = {
  title: "Tên miền công ty",
};

export default async function DomainSettingsPage() {
  const domains = await getWorkspaceDomains();

  return <DomainSettingsClient initialDomains={domains} />;
}
