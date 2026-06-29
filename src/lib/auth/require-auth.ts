import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function requireAuth() {
  const hdrs = await headers();
  const result = await auth.api.getSession({
    headers: hdrs,
  });
  if (!result?.user) {
    throw new Error("Unauthorized");
  }

  const isSuperAdmin = result.user.role === "SUPER_ADMIN";

  // 1. Try explicit active organization cookie first so the workspace switcher
  // can override a stale Better Auth cookie-cached session.
  let organizationId: string | null | undefined;
  const cookieHeader = hdrs.get("cookie") || "";
  const cookieMatch = cookieHeader.match(/better-auth\.active_organization=([^;]+)/);
  if (cookieMatch?.[1]) {
    try {
      const decoded = decodeURIComponent(cookieMatch[1]);
      if (decoded.startsWith("{")) {
        const parsed = JSON.parse(decoded);
        organizationId = parsed.organizationId || parsed.id || null;
      } else {
        organizationId = decoded;
      }
    } catch {
      // ignore parse errors
    }
  }

  // 2. Try session row.
  if (!organizationId) organizationId = result.session.activeOrganizationId;

  // 3. Fallback: look up user's own org membership (for ADMIN/MANAGER/STAFF/CUSTOMER)
  if (organizationId && !isSuperAdmin) {
    const member = await db.organizationMember.findFirst({
      where: { userId: result.user.id, organizationId },
      select: { organizationId: true },
    });

    if (!member) {
      organizationId = null;
    }
  }

  if (!organizationId && !isSuperAdmin) {
    const member = await db.organizationMember.findFirst({
      where: { userId: result.user.id },
      include: { organization: { select: { id: true } } },
      orderBy: { createdAt: "asc" }
    });
    if (member) {
      organizationId = member.organizationId;
    }
  }

  // 4. Final fallback for SUPER_ADMIN: use main/first org (Ong Vàng Workspace)
  if (!organizationId && isSuperAdmin) {
    const mainOrg = await db.organization.findFirst({ orderBy: { createdAt: "asc" } });
    if (mainOrg) {
      organizationId = mainOrg.id;
    }
  }

  if (!organizationId) {
    throw new Error("No organization found");
  }

  return {
    user: result.user,
    session: result.session,
    organizationId: organizationId as string,
    userId: result.user.id,
  };
}
