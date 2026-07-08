import type { ReactNode } from "react";
import {
  BarChart3,
  CircleDollarSign,
  Folder,
  GraduationCap,
  LayoutGrid,
  Megaphone,
  Settings,
  Users,
  Inbox,
  Globe,
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
  | "WEBSITE"
  | "WEBSITE_BUILDER"
  | "LANDING_PAGES"
  | "AUTOMATION"
  | "AI_ASSISTANT"
  | "SUPPORT"
  | "HOTEL_BOOKING"
  | "SERVICES"
  | "LEAD_CENTER";

export type ModuleNavChildAction = {
  icon: ReactNode;
  href: string;
  title?: string;
};

export type ModuleNavChild = {
  label: string;
  href: string;
  feature?: string;
  available?: boolean;
  requiredModule?: PlatformModuleCode;
  action?: ModuleNavChildAction;
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
    code: "LEAD_CENTER",
    name: "Trung tâm Lead",
    version: "1.0.0",
    category: "MARKETING",
    description: "Tiếp nhận, làm sạch và phân bổ nguồn khách hàng tiềm năng.",
    icon: "inbox",
    dependencies: [],
    sortOrder: 15,
    nav: {
      code: "LEAD_CENTER",
      label: "Trung tâm Lead",
      href: "/workspace/leads",
      icon: <Inbox className="h-5 w-5" />,
      children: [
        { label: "Tổng quan", href: "/workspace/leads/dashboard", available: true },
        { label: "Danh sách Lead", href: "/workspace/leads", available: true },
        { label: "Trình tạo Form", href: "/workspace/leads/forms", available: true },
        { label: "Webhooks", href: "/workspace/leads/webhooks", available: true },
        { label: "Nguồn Lead", href: "/workspace/leads/sources", available: true },
        { label: "Cấu hình", href: "/workspace/leads/settings", available: true },
      ],
    },
  },
  {
    code: "CRM",
    name: "CRM",
    version: "1.0.0",
    category: "CRM",
    description: "Quản lý khách hàng, lead, cơ hội bán hàng và pipeline kinh doanh.",
    icon: "users",
    dependencies: [],
    sortOrder: 20,
    nav: {
      code: "CRM",
      label: "CRM",
      href: "/workspace/crm",
      icon: <Users className="h-5 w-5" />,
      children: [
        { label: "Tổng quan", href: "/workspace/crm", available: true },
        { label: "Khách hàng", href: "/workspace/crm/contacts", available: true },
        { 
          label: "Cơ hội", 
          href: "/workspace/crm/deals", 
          available: true,
          action: { icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>, href: "/workspace/crm/deals/new", title: "Tạo Cơ hội mới" }
        },
        { label: "Cấu hình", href: "/workspace/crm/settings", available: true },
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
        { label: "Công việc", href: "/workspace/tasks", available: true },
        { label: "Timeline", href: "/workspace/timeline", available: true },
        { label: "Calendar", href: "/workspace/calendar", available: true },
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
      href: "/workspace/finance/overview",
      icon: <CircleDollarSign className="h-5 w-5" />,
      children: [
        { label: "Tổng quan", href: "/workspace/finance/overview", available: true },
        { label: "Báo giá", href: "/workspace/finance/quotations", available: true },
        { label: "Hợp đồng", href: "/workspace/finance/contracts", available: true },
        { label: "Hóa đơn", href: "/workspace/finance/invoices", available: true },
        { label: "Thanh toán", href: "/workspace/finance/payments", available: true },
        { label: "Học phí", href: "/workspace/training/tuition", available: true, requiredModule: "EDUCATION" },
        { label: "Cấu hình", href: "/workspace/finance/settings", available: true },
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
        { label: "Học viên", href: "/workspace/training/students", available: true },
        { label: "Học viên tiềm năng", href: "/workspace/training/potential-students", available: true },
        { label: "Khóa học", href: "/workspace/courses", available: true },
        { label: "Lớp học", href: "/workspace/training/classes", available: true },
        { label: "Giảng viên", href: "/workspace/training/instructors", available: true },
        { label: "Lịch học", href: "/workspace/training/calendar", available: true },
        { label: "Học phí", href: "/workspace/training/tuition", available: true },
        { label: "Chứng chỉ", href: "/workspace/training/certificates", available: true },
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
    code: "WEBSITE",
    name: "Web Builder",
    version: "1.0.0",
    category: "WEBSITE",
    description: "Kéo thả landing page, website với Business Blocks.",
    icon: "globe",
    dependencies: [],
    sortOrder: 115,
    nav: {
      code: "WEBSITE",
      label: "Web Builder",
      href: "/workspace/website",
      icon: <Globe className="h-5 w-5" />,
      children: [
        { label: "Trang", href: "/workspace/website/pages", available: true },
        { label: "Cài đặt", href: "/workspace/website/settings", available: true },
      ],
    },
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
      href: "/workspace/settings/organization",
      icon: <Settings className="h-5 w-5" />,
    },
  },
  {
    code: "SERVICES",
    name: "Dịch vụ (Catalog)",
    version: "1.0.0",
    category: "CRM",
    description: "Quản lý danh mục dịch vụ, tùy chọn và cấu hình báo giá.",
    icon: "layers-3",
    dependencies: ["CRM"],
    sortOrder: 25,
    nav: {
      code: "SERVICES",
      label: "Dịch vụ",
      href: "/workspace/services",
      icon: <Folder className="h-5 w-5" />,
      children: [
        { label: "Danh mục", href: "/workspace/services", available: true },
        { label: "Thêm mới", href: "/workspace/services/new", available: true },
      ],
    },
  },
];

export const workNavigation: ModuleNavItem[] = [
  { code: "WORKSPACE", label: "Điều hành", href: "/workspace/dashboard", icon: <LayoutGrid className="h-5 w-5" /> },
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
  WEBSITE: "WEBSITE",
  HOTEL_BOOKING: "HOTEL_BOOKING",
  SERVICES: "SERVICES",
  LEAD_CENTER: "LEAD_CENTER",
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
  "HOTEL_BOOKING",
  "SERVICES",
  "WEBSITE",
];

export function normalizeModuleCode(code: string): PlatformModuleCode | null {
  return legacyModuleAliases[code.trim().toUpperCase()] ?? null;
}

export function getPlatformModuleDefinition(code: PlatformModuleCode) {
  return moduleDefinitions.find((module) => module.code === code) ?? null;
}
