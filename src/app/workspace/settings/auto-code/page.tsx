import { getSettings } from "@/app/actions/settings";
import { AutoCodeSettingsClient } from "./auto-code-form";
import { requireAuth } from "@/lib/auth/require-auth";
import { getOrganizationEntitlements, hasModule } from "@/lib/modules/entitlements";

export const metadata = {
  title: "Cài đặt sinh mã",
};

export default async function AutoCodeSettingsPage() {
  const session = await requireAuth();
  const settings = await getSettings();
  const entitlements = await getOrganizationEntitlements(session.organizationId!);
  
  return (
    <AutoCodeSettingsClient 
      initialData={settings} 
      hasCRM={hasModule(entitlements, "CRM")}
      hasEducation={hasModule(entitlements, "EDUCATION")}
      hasFinance={hasModule(entitlements, "FINANCE")}
      hasHotelBooking={hasModule(entitlements, "HOTEL_BOOKING")}
    />
  );
}
