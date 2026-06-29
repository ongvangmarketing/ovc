import { requireLicensedModule } from "@/lib/modules/guards";

export default async function FinanceLayout({ children }: { children: React.ReactNode }) {
  await requireLicensedModule("FINANCE");
  return children;
}
