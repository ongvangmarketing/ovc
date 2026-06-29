import type { ReactNode } from "react";
import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  CircleDollarSign,
  Folder,
  GraduationCap,
  LayoutGrid,
  Megaphone,
  Settings,
  Users,
} from "lucide-react";

export type PlatformModuleCode =
  | "WORKSPACE"
  | "CRM"
  | "PROJECTS"
  | "FINANCE"
  | "EDUCATION"
  | "MARKETING"
  | "SOCIAL_MARKETING"
  | "REPORTS"
  | "SETTINGS"
  | "PORTAL"
  | "WEBSITE_BUILDER"
  | "LANDING_PAGES"
  | "AUTOMATION"
  | "AI_ASSISTANT"
  | "SUPPORT";

export type ModuleNavChild = {
  label: string;
  href: string;
  feature?: string;
  available?: boolean;
};

export type ModuleNavItem = {
  code: PlatformModuleCode;
  label: string;
  href: string;
  icon: ReactNode;
  available?: boolean;
  children?: ModuleNavChild[];
};

export type PlatformModuleDefinition = {
  code: PlatformModuleCode;
  name: string;
  version: string;
  category: string;
  description: string;
  icon: string;
  dependencies: PlatformModuleCode[];
  sortOrder: number;
  nav?: ModuleNavItem;
};

export const moduleDefinitions: PlatformModuleDefinition[] = [
  {
    code: "WORKSPACE",
    name: "Bàn làm việc",
    version: "1.0.0",
    category: "WORKSPACE",
    description: "Tổng quan, công việc cá nhân, timeline và lịch.",
    icon: "layout-grid",
    dependencies: [],
    sortOrder: 10,
  },
  {
    code: "CRM",
    name: "Khách hàng",
    version: "1.0.0",
    category: "CRM",
    description: "Quản lý khách hàng, công ty, cá nhân, liên hệ và cơ hội.",
    icon: "users",
    dependencies: [],
    sortOrder: 20,
    nav: {
      code: "CRM",
      label: "Khách hàng",
      href: "/workspace/customers",
      icon: <Users className="h-5 w-5" />,
      children: [
        { label: "Khách hàng", href: "/workspace/crm/contacts", available: true },
        { label: "Công ty", href: "/workspace/crm/companies" },
        { label: "Cá nhân", href: "/workspace/customers" },
      ],
    },
  },
  {
    code: "PROJECTS",
    name: "Dự án",
    version: "1.0.0",
    category: "PROJECT",
    description: "Quản lý dự án, kanban, timeline, calendar, files và báo cáo.",
    icon: "folder",
    dependencies: [],
    sortOrder: 30,
    nav: {
      code: "PROJECTS",
      label: "Dự án",
      href: "/workspace/projects",
      icon: <Folder className="h-5 w-5" />,
      children: [
        { label: "Tổng quan", href: "/workspace/projects", available: true },
        { label: "Nhiệm vụ", href: "/workspace/projects/tasks", available: true },
        { label: "Kanban", href: "/workspace/projects/kanban" },
        { label: "Timeline", href: "/workspace/projects/timeline" },
        { label: "Calendar", href: "/workspace/projects/calendar" },
        { label: "Files", href: "/workspace/projects/files" },
        { label: "Báo cáo", href: "/workspace/projects/reports" },
      ],
    },
  },
  {
    code: "FINANCE",
    name: "Tài chính",
    version: "1.0.0",
    category: "FINANCE",
    description: "Báo giá, hợp đồng, hóa đơn, thanh toán, học phí và chi phí.",
    icon: "circle-dollar-sign",
    dependencies: ["CRM"],
    sortOrder: 40,
    nav: {
      code: "FINANCE",
      label: "Tài chính",
      href: "/workspace/finance",
      icon: <CircleDollarSign className="h-5 w-5" />,
      children: [
        { label: "Báo giá", href: "/workspace/finance/quotations", available: true },
        { label: "Hợp đồng", href: "/workspace/finance/contracts", available: true },
        { label: "Hóa đơn", href: "/workspace/finance/invoices", available: true },
        { label: "Thanh toán", href: "/workspace/finance/payments", available: true },
        { label: "Học phí", href: "/workspace/finance/tuition" },
        { label: "Chi phí", href: "/workspace/finance/expenses" },
      ],
    },
  },
  {
    code: "EDUCATION",
    name: "Đào tạo",
    version: "1.0.0",
    category: "EDUCATION",
    description: "Học viên, khóa học, lớp học, giảng viên, lịch học và chứng chỉ.",
    icon: "graduation-cap",
    dependencies: ["CRM"],
    sortOrder: 50,
    nav: {
      code: "EDUCATION",
      label: "Đào tạo",
      href: "/workspace/training",
      icon: <GraduationCap className="h-5 w-5" />,
      children: [
        { label: "Học viên", href: "/workspace/training/students" },
        { label: "Khóa học", href: "/workspace/courses", available: true },
        { label: "Lớp học", href: "/workspace/training/classes" },
        { label: "Giảng viên", href: "/workspace/training/instructors" },
        { label: "Lịch học", href: "/workspace/training/calendar" },
        { label: "Chứng chỉ", href: "/workspace/training/certificates" },
      ],
    },
  },
  {
    code: "MARKETING",
    name: "Marketing",
    version: "1.0.0",
    category: "MARKETING",
    description: "Campaign, Email Marketing, Facebook Marketing, Landing Page và Automation.",
    icon: "megaphone",
    dependencies: ["CRM"],
    sortOrder: 60,
    nav: {
      code: "MARKETING",
      label: "Marketing",
      href: "/workspace/marketing",
      icon: <Megaphone className="h-5 w-5" />,
      children: [
        { label: "Campaign", href: "/workspace/marketing", available: true },
        { label: "Email Marketing", href: "/workspace/marketing/email" },
        { label: "Facebook Marketing", href: "/workspace/marketing/facebook" },
        { label: "Landing Page", href: "/workspace/marketing/landing-pages" },
        { label: "Automation", href: "/workspace/marketing/automation" },
      ],
    },
  },
  {
    code: "SOCIAL_MARKETING",
    name: "Social Marketing",
    version: "1.0.0",
    category: "MARKETING",
    description: "Kết nối nền tảng, đồng bộ dữ liệu và báo cáo hiệu quả Social Marketing.",
    icon: "chart-no-axes-combined",
    dependencies: [],
    sortOrder: 65,
    nav: {
      code: "SOCIAL_MARKETING",
      label: "Social Marketing",
      href: "/workspace/social-marketing",
      icon: <BarChart3 className="h-5 w-5" />,
      children: [
        { label: "Tổng quan", href: "/workspace/social-marketing", available: true },
        { label: "Báo cáo Facebook", href: "/workspace/social-marketing/reports/facebook", available: true },
        { label: "Lịch sử đồng bộ", href: "/workspace/social-marketing/reports/facebook/sync-logs", available: true },
        { label: "Kết nối & cài đặt", href: "/workspace/social-marketing/settings", available: true },
      ],
    },
  },
  {
    code: "REPORTS",
    name: "Báo cáo",
    version: "1.0.0",
    category: "SYSTEM",
    description: "Dashboard và báo cáo tổng hợp.",
    icon: "bar-chart-3",
    dependencies: [],
    sortOrder: 90,
    nav: {
      code: "REPORTS",
      label: "Báo cáo",
      href: "/workspace/report",
      icon: <BarChart3 className="h-5 w-5" />,
      available: false,
    },
  },
  {
    code: "PORTAL",
    name: "Customer Portal",
    version: "1.0.0",
    category: "SYSTEM",
    description: "Cổng khách hàng cho dự án, nhiệm vụ, tài chính và báo cáo.",
    icon: "panel-left-open",
    dependencies: ["CRM"],
    sortOrder: 110,
  },
  {
    code: "WEBSITE_BUILDER",
    name: "Website Builder",
    version: "1.0.0",
    category: "WEBSITE",
    description: "Trình dựng website, template, theme editor và publishing.",
    icon: "globe",
    dependencies: ["CRM"],
    sortOrder: 120,
  },
  {
    code: "LANDING_PAGES",
    name: "Landing Pages",
    version: "1.0.0",
    category: "WEBSITE",
    description: "Landing page, form lead, template clone và custom domain.",
    icon: "file-text",
    dependencies: ["CRM"],
    sortOrder: 130,
  },
  {
    code: "AUTOMATION",
    name: "Automation",
    version: "1.0.0",
    category: "AUTOMATION",
    description: "Luồng tự động hóa giữa CRM, tài chính, marketing và thông báo.",
    icon: "workflow",
    dependencies: ["CRM"],
    sortOrder: 140,
  },
  {
    code: "AI_ASSISTANT",
    name: "AI Assistant",
    version: "1.0.0",
    category: "AI",
    description: "Trợ lý AI theo module, workspace và dữ liệu được cấp quyền.",
    icon: "sparkles",
    dependencies: [],
    sortOrder: 150,
  },
  {
    code: "SUPPORT",
    name: "Support",
    version: "1.0.0",
    category: "SUPPORT",
    description: "Ticket, hỗ trợ khách hàng và trung tâm trợ giúp.",
    icon: "life-buoy",
    dependencies: ["CRM"],
    sortOrder: 160,
  },
  {
    code: "SETTINGS",
    name: "Cài đặt",
    version: "1.0.0",
    category: "SYSTEM",
    description: "Cài đặt workspace, thành viên, vai trò và nhật ký hoạt động.",
    icon: "settings",
    dependencies: [],
    sortOrder: 100,
    nav: {
      code: "SETTINGS",
      label: "Cài đặt",
      href: "/workspace/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  },
];

export const workNavigation: ModuleNavItem[] = [
  { code: "WORKSPACE", label: "Tổng quan", href: "/workspace/dashboard", icon: <LayoutGrid className="h-5 w-5" /> },
  { code: "WORKSPACE", label: "Công việc", href: "/workspace/tasks", icon: <CheckSquare className="h-5 w-5" /> },
  { code: "WORKSPACE", label: "Timeline", href: "/workspace/timeline", icon: <BarChart3 className="h-5 w-5" /> },
  { code: "WORKSPACE", label: "Calendar", href: "/workspace/calendar", icon: <CalendarDays className="h-5 w-5" /> },
];

export const legacyModuleAliases: Record<string, PlatformModuleCode> = {
  FINANCIAL: "FINANCE",
  FINANCE: "FINANCE",
  CRM: "CRM",
  CUSTOMERS: "CRM",
  CUSTOMER: "CRM",
  PROJECT: "PROJECTS",
  PROJECTS: "PROJECTS",
  EDUCATION: "EDUCATION",
  TRAINING: "EDUCATION",
  MARKETING: "MARKETING",
  SOCIAL_MARKETING: "SOCIAL_MARKETING",
  REPORT: "REPORTS",
  REPORTS: "REPORTS",
  SETTINGS: "SETTINGS",
  SETTING: "SETTINGS",
  WORKSPACE: "WORKSPACE",
  PORTAL: "PORTAL",
};

export const defaultModuleCodes: PlatformModuleCode[] = [
  "WORKSPACE",
  "CRM",
  "PROJECTS",
  "FINANCE",
  "EDUCATION",
  "MARKETING",
  "REPORTS",
  "SETTINGS",
  "PORTAL",
];

export function normalizeModuleCode(code: string): PlatformModuleCode | null {
  return legacyModuleAliases[code.trim().toUpperCase()] ?? null;
}

export function getPlatformModuleDefinition(code: PlatformModuleCode) {
  return moduleDefinitions.find((module) => module.code === code) ?? null;
}
