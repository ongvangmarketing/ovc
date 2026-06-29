import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { ROLE_PERMISSIONS, Permission } from "@/config/permissions";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

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
  if (!organizationId) organizationId = result.session.activeOrganizationId as string | null | undefined;

  // 3. For non-super-admins: verify the selected org really belongs to the user.
  if (organizationId && !isSuperAdmin) {
    const member = await db.organizationMember.findFirst({
      where: { userId: result.user.id, organizationId },
      select: { organizationId: true },
    });

    if (!member) {
      organizationId = null;
    }
  }

  // 4. For non-super-admins: look up their own org membership
  if (!organizationId && !isSuperAdmin) {
    const member = await db.organizationMember.findFirst({
      where: { userId: result.user.id },
      orderBy: { createdAt: "asc" }
    });
    if (member) {
      organizationId = member.organizationId;
    }
  }

  // 5. For super-admins: default to main org
  if (!organizationId && isSuperAdmin) {
    const mainOrg = await db.organization.findFirst({ orderBy: { createdAt: "asc" } });
    if (mainOrg) organizationId = mainOrg.id;
  }

  return {
    user: result.user,
    session: result.session,
    organizationId: organizationId as string | undefined,
  };
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.user.role as UserRole)) {
    throw new Error("Forbidden: Invalid Role");
  }
  return session;
}

export async function requirePermission(permission: Permission) {
  const session = await requireAuth();
  const role = session.user.role as UserRole;
  
  if (role === "SUPER_ADMIN") return session; // SUPER_ADMIN bypasses all

  const userPermissions = ROLE_PERMISSIONS[role] || [];
  if (!userPermissions.includes(permission)) {
    throw new Error(`Forbidden: Missing permission ${permission}`);
  }
  
  return session;
}

export async function requireOrganization() {
  const session = await requireAuth();
  if (session.user.role === "SUPER_ADMIN") {
    return session; // Super admin can bypass strictly having an org id for some actions, or can pass org id explicitly.
  }
  if (!session.organizationId) {
    throw new Error("Forbidden: No Organization context");
  }
  return session as typeof session & { organizationId: string };
}

// === PORTAL GUARDS ===

export async function requireSuperAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/workspace"); // Redirect to default workspace if not super admin
  }
  return session;
}

export async function requireWorkspaceUser() {
  const session = await requireAuth();
  const allowedRoles = ["ADMIN", "MANAGER", "STAFF", "SUPER_ADMIN"];
  if (!session.user.role || !allowedRoles.includes(session.user.role)) {
    redirect("/customer"); // Fallback
  }
  return requireOrganization();
}

export async function requireCustomerPortal() {
  const session = await requireAuth();
  if (session.user.role !== "CUSTOMER") {
    redirect("/workspace");
  }
  return requireOrganization();
}

export async function requireInstructorPortal() {
  const session = await requireAuth();
  if (session.user.role !== "INSTRUCTOR") {
    redirect("/workspace");
  }
  return requireOrganization();
}

export async function requireStudentPortal() {
  const session = await requireAuth();
  if (session.user.role !== "STUDENT") {
    redirect("/workspace");
  }
  return requireOrganization();
}
