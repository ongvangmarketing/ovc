import { getSettings } from "@/app/actions/settings";
import { PaymentSettingsClient } from "./payment-form";
import { requireAuth } from "@/lib/auth/require-auth";

export const metadata = {
  title: "Cài đặt thanh toán",
};

export default async function PaymentSettingsPage() {
  await requireAuth();
  const settings = await getSettings();

  return <PaymentSettingsClient initialData={settings} />;
}
