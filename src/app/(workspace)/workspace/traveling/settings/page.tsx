import { requireAuth } from "@/lib/auth/require-auth";
import SettingsClient from "./settings-client";
import { TravelingService } from "@/modules/traveling/services/traveling.service";

export default async function TravelingSettingsPage() {
  const authData = await requireAuth();
  
  if (authData.user.role !== "AGENT" && authData.user.role !== "SUPER_ADMIN") {
    return null;
  }

  const activeModules = await TravelingService.getActiveModules(authData.organizationId);

  return <SettingsClient initialModules={activeModules} />;
}
