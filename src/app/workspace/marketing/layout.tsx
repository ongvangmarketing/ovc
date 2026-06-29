import { requireLicensedModule } from "@/lib/modules/guards";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  await requireLicensedModule("MARKETING");
  return children;
}
