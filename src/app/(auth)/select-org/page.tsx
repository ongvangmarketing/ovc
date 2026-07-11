import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SelectOrgClient } from "./SelectOrgClient";
import { CoreAuthService } from "@/modules/core/services/auth.service";

export default async function SelectOrgPage() {
  const hdrs = await headers();
  const result = await auth.api.getSession({
    headers: hdrs,
  });

  if (!result?.user) {
    redirect("/login");
  }

  // Find all organizations the user is a member of
  const members = await CoreAuthService.getUserOrganizations(result.user.id);

  const isSuperAdmin = result.user.role === "SUPER_ADMIN";

  if (isSuperAdmin) {
    redirect("/workspace");
  }

  if (members.length === 0) {
    // Edge case: User has no organizations
    redirect("/login?error=no_organization");
  }

  if (members.length === 1) {
    const member = members[0];
    if (!member) redirect("/login?error=no_organization");
    redirect(`/api/select-org?organizationId=${encodeURIComponent(member.organizationId)}`);
  }

  // More than 1 organization, show selection UI
  const orgs = members.map(m => m.organization);

  return <SelectOrgClient orgs={orgs} userName={result.user.name || result.user.email || ""} />;
}
