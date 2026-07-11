import { requireAuth } from "@/lib/auth/require-auth";
import { UserService } from "@/modules/core/services/user.service";
import { AccountSettingsClient } from "./account-settings-client";

export const metadata = {
  title: "Tài khoản | OVC Workspace",
};

export default async function AccountSettingsPage() {
  const session = await requireAuth();
  
  // Fetch user profile
  const userProfile = await UserService.getUserProfile(session.user.id);

  if (!userProfile) {
    return <div>Không tìm thấy người dùng</div>;
  }

  // Fetch app launcher preferences (used for both App Launcher and Footer Nav configs)
  const { AppLauncherService } = await import("@/modules/core/services/app-launcher.service");
  const launcherPreferences = await AppLauncherService.getPreferences(session.user.id, session.organizationId);

  return (
    <div className="flex h-[100dvh] flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        <AccountSettingsClient 
          initialData={userProfile} 
          launcherPreferences={launcherPreferences} 
        />
      </div>
    </div>
  );
}
