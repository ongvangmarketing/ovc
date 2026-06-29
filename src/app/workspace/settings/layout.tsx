import { requireLicensedModule } from "@/lib/modules/guards";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  await requireLicensedModule("SETTINGS");
  return children;
}
