import { Metadata } from "next";
import { getSettings } from "@/actions/settings";
import { TrainingSettingsClient } from "./training-settings-client";

export const metadata: Metadata = { title: "Cấu hình Đào tạo" };

export default async function TrainingSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-300">
      <TrainingSettingsClient initialSettings={settings} />
    </div>
  );
}
