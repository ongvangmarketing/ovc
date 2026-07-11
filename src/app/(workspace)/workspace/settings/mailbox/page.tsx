import { requireAuth } from "@/lib/auth/require-auth";
import { MailAccountForm } from "@/modules/core-mail/components/mail-account-form";
import { EmailSettingsNav } from "@/modules/core/components/email-settings-nav";
import { getSystemDb } from "@/lib/db";

export const metadata = {
  title: "Cài đặt Mailbox",
};

export default async function MailboxSettingsPage() {
  const session = await requireAuth();
  
  const members = await getSystemDb().organizationMember.findMany({
    where: { organizationId: (session.user as any).organizationId },
    include: { user: true }
  });

  return (
    <div className="p-8 md:p-12 h-full bg-white font-sans overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <EmailSettingsNav />
        <div className="space-y-6">
          <MailAccountForm 
            organizationId={(session.user as any).organizationId} 
            members={members} 
          />
        </div>
      </div>
    </div>
  );
}
