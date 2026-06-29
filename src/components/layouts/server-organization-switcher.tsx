import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { OrganizationSwitcher } from "./organization-switcher";

export async function ServerOrganizationSwitcher() {
  const session = await requireAuth();
  
  let organizations = [];
  
  if (session.user.role === "SUPER_ADMIN") {
    organizations = await db.organization.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, slug: true }
    });
  } else {
    // If not super admin, they can only switch between orgs they are a member of
    const members = await db.organizationMember.findMany({
      where: { userId: session.user.id },
      include: { organization: { select: { id: true, name: true, slug: true } } }
    });
    organizations = members.map(m => m.organization);

    // Fallback if they somehow have an active org but no member record
    if (organizations.length === 0 && session.organizationId) {
      const activeOrg = await db.organization.findUnique({
        where: { id: session.organizationId },
        select: { id: true, name: true, slug: true }
      });
      if (activeOrg) organizations.push(activeOrg);
    }
  }

  return (
    <OrganizationSwitcher 
      organizations={organizations} 
      activeOrgId={session.organizationId}
      isSuperAdmin={session.user.role === "SUPER_ADMIN"}
    />
  );
}
