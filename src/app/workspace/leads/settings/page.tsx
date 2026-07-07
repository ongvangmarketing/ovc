import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/require-auth";
import { SettingsClient } from "./settings-client";

export const metadata: Metadata = { title: "Cấu hình Trung tâm Lead" };

export default async function LeadSettingsPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <SettingsClient />
    </div>
  );
}
