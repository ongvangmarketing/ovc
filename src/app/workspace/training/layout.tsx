import { requireLicensedModule } from "@/lib/modules/guards";

export default async function TrainingLayout({ children }: { children: React.ReactNode }) {
  await requireLicensedModule("EDUCATION");
  return children;
}
