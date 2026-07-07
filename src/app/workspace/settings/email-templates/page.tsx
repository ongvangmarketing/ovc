import { getEmailTemplates } from "@/app/actions/email-templates";
import { getSettings } from "@/app/actions/settings";
import { EmailTemplatesClient } from "@/modules/core/components/email-templates-client";

export default async function EmailTemplatesPage() {
  const [settings, templates] = await Promise.all([
    getSettings(),
    getEmailTemplates()
  ]);

  return <EmailTemplatesClient templates={templates} settings={settings} />;
}
