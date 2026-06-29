import { requireLicensedModule } from "@/lib/modules/guards";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  await requireLicensedModule("CRM");
  return children;
}
