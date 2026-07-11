import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth/require-auth";
import { DigitalOfficeClient } from "@/modules/digital-office";

export const metadata = {
  title: "Phê duyệt | Digital Office",
};

export default async function DigitalOfficeApprovalsPage() {
  const session = await requireAuth();
  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/workspace?module=digital-office-development");
  }

  return <DigitalOfficeClient activeView="approvals" />;
}
