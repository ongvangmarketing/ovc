import type { Metadata } from "next";

import { getSettings } from "@/app/actions/settings";
import { CompanySettingsClient } from "@/modules/core/components/company-settings-client";

export const metadata: Metadata = {
  title: "Cài đặt công ty",
};

export default async function CompanySettingsPage() {
  const settings = await getSettings();

  return <CompanySettingsClient initialSettings={settings} />;
}
