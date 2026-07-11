import { Metadata } from "next";
import { MailClient } from "@/modules/mail/components/mail-client";
import { requireAuth } from "@/lib/auth/require-auth";
import { getWorkspaceMailboxes } from "@/modules/mail/actions/mail.actions";

export const metadata: Metadata = {
  title: "Mail Workspace - OVC",
  description: "Quản lý hộp thư và gửi nhận email.",
};

export default async function MailPage() {
  const { user, organizationId } = await requireAuth();

  // Fetch real mailboxes from DB
  const mailboxes = await getWorkspaceMailboxes();

  return <MailClient organizationId={organizationId} user={user} mailboxes={mailboxes} />;
}
