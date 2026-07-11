import { requireLicensedModule } from "@/lib/modules/guards";

export default async function CoursesLayout({ children }: { children: React.ReactNode }) {
  await requireLicensedModule("EDUCATION");
  return children;
}
