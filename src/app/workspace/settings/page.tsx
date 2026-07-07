import {
  getActivityLogs,
  getEmailLogs,
  getMembers,
  getSettings,
} from "@/app/actions/settings";
import { SettingsClient } from "@/modules/core/components/settings-client";

export default async function SettingsPage() {
  const settings = await getSettings();
  const [emailLogs, members, activityLogs] = await Promise.all([
    getEmailLogs(),
    getMembers(),
    getActivityLogs(),
  ]);

  return (
    <SettingsClient
      initialSettings={settings}
      initialEmailLogs={emailLogs}
      initialMembers={members}
      initialActivityLogs={activityLogs}
    />
  );
}
