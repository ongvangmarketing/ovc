import { getSettings } from "@/actions/settings";
import { FinanceSettingsClient } from "@/modules/finance/components/finance-settings-client";

export const metadata = {
  title: "Cấu hình Tài chính",
};

export default async function FinanceSettingsPage() {
  const settings = await getSettings();
  
  return (
    <FinanceSettingsClient initialSettings={settings} />
  );
}
