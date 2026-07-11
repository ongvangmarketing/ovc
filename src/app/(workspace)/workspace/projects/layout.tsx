import { requireLicensedModule } from "@/lib/modules/guards";

export default async function ProjectsLayout({ children }: { children: React.ReactNode }) {
  await requireLicensedModule("PROJECTS");
  return children;
}
