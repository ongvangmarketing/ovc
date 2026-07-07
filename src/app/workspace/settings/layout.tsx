import { requireLicensedModule } from "@/lib/modules/guards";
import { requireAuth } from "@/lib/auth/require-auth";
import { SettingsSidebar } from "@/modules/core/components/settings-sidebar";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  
  // Organization Admin and Super Admin always have access to settings
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    await requireLicensedModule("SETTINGS");
  }
  
  return (
    <div className="flex h-full w-full bg-white">
      <SettingsSidebar />
      <div className="flex-1 h-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
