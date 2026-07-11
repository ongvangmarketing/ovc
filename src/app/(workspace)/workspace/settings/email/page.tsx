import { getSettings } from "@/actions/settings";
import { EmailSettingsForm } from "./email-form";
import { requireAuth } from "@/lib/auth/require-auth";

export const metadata = {
  title: "Cấu hình Email",
};

export default async function EmailSettingsPage() {
  await requireAuth();
  const settings = await getSettings();

  return <EmailSettingsForm initialSettings={settings} />;
}
