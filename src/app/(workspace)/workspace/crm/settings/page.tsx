import { Metadata } from "next";
import { getSettings } from "@/actions/settings";
import { CrmSettingsClient } from "./crm-settings-client";

export const metadata: Metadata = { title: "Cấu hình CRM" };

export default async function CrmSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-300">
      <CrmSettingsClient initialSettings={settings} />
    </div>
  );
}
