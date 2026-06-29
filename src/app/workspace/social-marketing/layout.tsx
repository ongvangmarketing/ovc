import { requireLicensedModule } from "@/lib/modules/guards";

export default async function SocialMarketingLayout({ children }: { children: React.ReactNode }) {
  await requireLicensedModule("SOCIAL_MARKETING");
  return children;
}

