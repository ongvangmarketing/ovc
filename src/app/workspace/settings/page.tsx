import {
  getActivityLogs,
  getEmailLogs,
  getEmailTemplates,
  getMembers,
  getSettings,
  seedDefaultTemplates,
} from "@/app/actions/settings";
import { SettingsClient } from "@/modules/core/components/settings-client";

export default async function SettingsPage() {
  const settings = await getSettings();
  let templates = await getEmailTemplates();
  const [emailLogs, members, activityLogs] = await Promise.all([
    getEmailLogs(),
    getMembers(),
    getActivityLogs(),
  ]);

  // Auto seed default templates if empty
  if (templates.length === 0) {
    await seedDefaultTemplates();
    templates = await getEmailTemplates();
  }

  return (
    <SettingsClient
      initialSettings={settings}
      initialTemplates={templates}
      initialEmailLogs={emailLogs}
      initialMembers={members}
      initialActivityLogs={activityLogs}
    />
  );
}
