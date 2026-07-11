import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth/require-auth";
import { DigitalOfficeClient } from "@/modules/digital-office";

export const metadata = {
  title: "Văn bản | Digital Office",
};

export default async function DigitalOfficeDocumentsPage() {
  const session = await requireAuth();
  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/workspace?module=digital-office-development");
  }

  return <DigitalOfficeClient activeView="documents" />;
}
