import type { UserRole } from "@prisma/client";

// ============================================================
// Permission Keys
// ============================================================

export type Permission =
  // CRM
  | "crm:read"
  | "crm:write"
  | "crm:delete"
  | "crm:export"
  // Finance
  | "finance:read"
  | "finance:write"
  | "finance:delete"
  | "finance:approve"
  | "finance:export"
  // Projects
  | "projects:read"
  | "projects:write"
  | "projects:delete"
  | "projects:manage"
  // Courses
  | "courses:read"
  | "courses:write"
  | "courses:delete"
  | "courses:manage"
  // Marketing
  | "marketing:read"
  | "marketing:write"
  | "marketing:delete"
  // CMS
  | "cms:read"
  | "cms:write"
  | "cms:delete"
  | "cms:publish"
  // Users / HR
  | "users:read"
  | "users:write"
  | "users:delete"
  | "users:invite"
  // System
  | "system:read"
  | "system:write"
  | "system:admin"
  // Reports
  | "reports:read"
  | "reports:export"
  // Files
  | "files:read"
  | "files:write"
  | "files:delete";

// ============================================================
// RBAC Permission Matrix
// ============================================================

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    "crm:read", "crm:write", "crm:delete", "crm:export",
    "finance:read", "finance:write", "finance:delete", "finance:approve", "finance:export",
    "projects:read", "projects:write", "projects:delete", "projects:manage",
    "courses:read", "courses:write", "courses:delete", "courses:manage",
    "marketing:read", "marketing:write", "marketing:delete",
    "cms:read", "cms:write", "cms:delete", "cms:publish",
    "users:read", "users:write", "users:delete", "users:invite",
    "system:read", "system:write", "system:admin",
    "reports:read", "reports:export",
    "files:read", "files:write", "files:delete",
  ],
  ADMIN: [
    "crm:read", "crm:write", "crm:delete", "crm:export",
    "finance:read", "finance:write", "finance:delete", "finance:approve", "finance:export",
    "projects:read", "projects:write", "projects:delete", "projects:manage",
    "courses:read", "courses:write", "courses:delete", "courses:manage",
    "marketing:read", "marketing:write", "marketing:delete",
    "cms:read", "cms:write", "cms:delete", "cms:publish",
    "users:read", "users:write", "users:invite",
    "system:read",
    "reports:read", "reports:export",
    "files:read", "files:write", "files:delete",
  ],
  MANAGER: [
    "crm:read", "crm:write", "crm:export",
    "finance:read", "finance:write", "finance:approve",
    "projects:read", "projects:write", "projects:manage",
    "courses:read",
    "marketing:read", "marketing:write",
    "cms:read", "cms:write",
    "users:read",
    "reports:read", "reports:export",
    "files:read", "files:write",
  ],
  STAFF: [
    "crm:read", "crm:write",
    "finance:read",
    "projects:read", "projects:write",
    "courses:read",
    "marketing:read",
    "cms:read", "cms:write",
    "reports:read",
    "files:read", "files:write",
  ],
  CUSTOMER: [
    "projects:read",
    "finance:read",
    "files:read",
  ],
  INSTRUCTOR: [
    "courses:read", "courses:write", "courses:manage",
    "files:read", "files:write",
    "reports:read",
  ],
  STUDENT: [
    "courses:read",
    "files:read",
  ],
};

// ============================================================
// Helper Functions
// ============================================================

export function hasPermission(
  role: UserRole,
  permission: Permission
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(
  role: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(
  role: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

// ============================================================
// Route Access Config
// ============================================================

export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  "/workspace/crm": ["crm:read"],
  "/workspace/finance": ["finance:read"],
  "/workspace/projects": ["projects:read"],
  "/workspace/courses": ["courses:read"],
  "/workspace/marketing": ["marketing:read"],
  "/workspace/cms": ["cms:read"],
  "/workspace/users": ["users:read"],
  "/workspace/settings": ["system:read"],
  "/workspace/reports": ["reports:read"],
};

// ============================================================
// Dashboard Route by Role
// ============================================================

export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  SUPER_ADMIN: "/workspace/dashboard",
  ADMIN: "/workspace/dashboard",
  MANAGER: "/workspace/dashboard",
  STAFF: "/workspace/dashboard",
  CUSTOMER: "/portal",
  INSTRUCTOR: "/portal/instructor/dashboard",
  STUDENT: "/portal/student/dashboard",
};
