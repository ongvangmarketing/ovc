import { requireAuth } from "@/lib/auth/require-auth";
import { EmailLogsClient } from "./email-logs-client";
import { getTenantDb } from "@/lib/db";

export const metadata = {
  title: "Email Logs",
};

export default async function EmailLogsPage() {
  const session = await requireAuth();
  
  const logs = await getTenantDb().emailLog.findMany({
    where: { organizationId: (session.user as any).organizationId },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return <EmailLogsClient logs={logs} />;
}
