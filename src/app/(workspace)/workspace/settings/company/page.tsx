import type { Metadata } from "next";

import { getSettings } from "@/actions/settings";
import { CompanySettingsClient } from "@/modules/core/components/company-settings-client";

export const metadata: Metadata = {
  title: "Cài đặt công ty",
};

export default async function CompanySettingsPage() {
  const settings = await getSettings();

  return <CompanySettingsClient initialSettings={settings} />;
}
