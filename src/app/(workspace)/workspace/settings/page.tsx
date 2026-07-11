import {
  getActivityLogs,
  getEmailLogs,
  getMembers,
  getSettings,
} from "@/actions/settings";
import { getEmailTemplates } from "@/actions/email-templates";
import { SettingsClient } from "@/modules/core/components/settings-client";
import { requireAuth } from "@/lib/auth/require-auth";

export default async function SettingsPage() {
  const session = await requireAuth();
  const settings = await getSettings();
  const [emailLogs, members, activityLogs, emailTemplates] = await Promise.all([
    getEmailLogs(),
    getMembers(),
    getActivityLogs(),
    getEmailTemplates(),
  ]);

  return (
    <SettingsClient
      organizationId={session.organizationId}
      initialSettings={settings}
      initialEmailLogs={emailLogs}
      initialMembers={members}
      initialActivityLogs={activityLogs}
      initialEmailTemplates={emailTemplates}
    />
  );
}
