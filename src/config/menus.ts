import { PERMISSIONS, Permission } from "./permissions";
import { UserRole } from "@prisma/client";
import { LayoutDashboard, Users, FileText, Settings, BookOpen, GraduationCap, Building } from "lucide-react";

export type MenuItem = {
  id: string;
  label: string;
  icon: any;
  href: string;
  requiredPermissions?: Permission[];
  requiredRoles?: UserRole[];
};

export const WORKSPACE_MENU: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/workspace",
  },
  {
    id: "crm",
    label: "CRM",
    icon: Users,
    href: "/workspace/crm",
    requiredPermissions: [PERMISSIONS.CRM_READ],
  },
  {
    id: "financial",
    label: "Financial",
    icon: FileText,
    href: "/workspace/financial",
    requiredPermissions: [PERMISSIONS.FINANCIAL_READ],
  },
  {
    id: "education",
    label: "Education",
    icon: BookOpen,
    href: "/workspace/education",
    requiredPermissions: [PERMISSIONS.EDUCATION_READ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/workspace/settings",
    requiredPermissions: [PERMISSIONS.SETTINGS_READ],
  }
];

export const SUPER_ADMIN_MENU: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/super-admin",
  },
  {
    id: "organizations",
    label: "Organizations",
    icon: Building,
    href: "/super-admin/organizations",
  },
  {
    id: "admins",
    label: "Admins",
    icon: Users,
    href: "/super-admin/admins",
  },
];

export const CUSTOMER_MENU: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/customer",
  },
  {
    id: "projects",
    label: "Dự án",
    icon: FileText,
    href: "/customer/projects",
  },
];

export const INSTRUCTOR_MENU: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/instructor",
  },
  {
    id: "classes",
    label: "Lớp học",
    icon: GraduationCap,
    href: "/instructor/classes",
  },
];

export const STUDENT_MENU: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/student",
  },
  {
    id: "my-courses",
    label: "Khóa học của tôi",
    icon: BookOpen,
    href: "/student/courses",
  },
];
