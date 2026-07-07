import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { OrganizationSwitcher } from "./organization-switcher";

export async function ServerOrganizationSwitcher() {
  const session = await requireAuth();
  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  if (!isSuperAdmin) {
    return null;
  }
  
  let organizations = [];
  
  organizations = await db.organization.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, slug: true, logo: true }
  });

  return (
    <OrganizationSwitcher 
      organizations={organizations} 
      activeOrgId={session.organizationId}
      isSuperAdmin={isSuperAdmin}
    />
  );
}
