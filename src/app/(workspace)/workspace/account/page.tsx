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

  return (
    <div className="flex h-[100dvh] flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        <AccountSettingsClient 
          initialData={userProfile} 
        />
      </div>
    </div>
  );
}
