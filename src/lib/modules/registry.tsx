import type { ReactNode } from "react";
import {
  BarChart3,
  CheckSquare2,
  CircleDollarSign,
  Folder,
  GraduationCap,
  LayoutGrid,
  Megaphone,
  Settings,
  Users,
  Inbox,
  Globe,
  LayoutDashboard,
  Building2,
  Map,
  Car,
  Ticket,
  Settings2,
  Workflow,
  BrainCircuit,
  Bot,
  Bell,
  Hash,
  CreditCard,
  ClipboardCheck,
  FileSignature,
  FileText,
  ShieldCheck,
  Server,
  Mail,
  ScrollText,
  Archive,
  HardDrive,
  Link2,
  MessageCircle,
  MessageSquare,
  CalendarDays
} from "lucide-react";

export type PlatformModuleCode =
  | "WORKSPACE"
  | "DIGITAL_OFFICE"
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
  | "TRAVELING"
  | "HOTEL_BOOKING"
  | "SERVICES"
  | "LEAD_CENTER"
  | "DASHBOARD"
  | "BUSINESS_CHAT";

export type ModuleNavChildAction = {
  icon: ReactNode;
  href: string;
  title?: string;
};

export type ModuleNavSubChild = {
  label: string;
  href: string;
  icon?: ReactNode;
};

export type ModuleNavChild = {
  label: string;
  href?: string;
  icon?: ReactNode;
  feature?: string;
  available?: boolean;
  action?: ModuleNavChildAction;
  children?: ModuleNavSubChild[];
  isHeader?: boolean;
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
  lifecycle?: "DEVELOPMENT" | "TESTING" | "BETA" | "PUBLISHED" | "DEPRECATED";
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
    nav: {
      code: "WORKSPACE",
      label: "Bàn làm việc",
      href: "/workspace/myworks",
      icon: <CheckSquare2 className="h-5 w-5" />,
      children: [
        { label: "Tổng quan", href: "/workspace/myworks", available: true, icon: <CheckSquare2 className="h-4 w-4" /> },
        { label: "Hộp thư", href: "/workspace/mail", available: true, icon: <Mail className="h-4 w-4" /> },
        { label: "Chat", href: "/workspace/chat", available: true, icon: <Inbox className="h-4 w-4" /> },
      ],
    },
  },

  {
    code: "BUSINESS_CHAT",
    name: "Chat",
    version: "1.0.0",
    category: "WORKSPACE",
    description: "Nhắn tin nội bộ và giao tiếp khách hàng",
    icon: "message-circle",
    dependencies: [],
    sortOrder: 11,
    lifecycle: "DEVELOPMENT",
    features: [
      "Nhắn tin nhóm & cá nhân",
      "Live chat website",
      "Tích hợp Omni-channel (Zalo, Messenger)",
      "Chatbot & AI trả lời tự động",
    ],
    nav: {
      code: "BUSINESS_CHAT",
      label: "Chat",
      href: "/workspace/chat",
      icon: <MessageSquare className="h-5 w-5" />,
      children: [
        { label: "Trò chuyện", href: "/workspace/chat", available: true },
      ],
    },
  },
  {
    code: "DIGITAL_OFFICE",
    name: "Digital Office",
    version: "0.1.0",
    category: "WORKSPACE",
    description: "Văn phòng số cho văn bản, phê duyệt, yêu cầu nội bộ, lịch và chữ ký số.",
    icon: "scroll-text",
    dependencies: ["WORKSPACE"],
    sortOrder: 12,
    lifecycle: "DEVELOPMENT",
    nav: {
      code: "DIGITAL_OFFICE",
      label: "Digital Office",
      href: "/workspace/office",
      icon: <ScrollText className="h-5 w-5" />,
      children: [
        { label: "Tổng quan", href: "/workspace/office", icon: <LayoutDashboard className="h-4 w-4" />, available: true },
        { label: "Văn bản", href: "/workspace/office/documents", icon: <FileText className="h-4 w-4" />, available: true },
        { label: "Phê duyệt", href: "/workspace/office/approvals", icon: <ClipboardCheck className="h-4 w-4" />, available: true },
        { label: "Yêu cầu", href: "/workspace/office/requests", icon: <Inbox className="h-4 w-4" />, available: true },
        { label: "Ký số", href: "/workspace/office/signatures", icon: <FileSignature className="h-4 w-4" />, available: true },
        { label: "Cấu hình", href: "/workspace/office/settings", icon: <Settings2 className="h-4 w-4" />, available: true },
      ],
    },
  },
  {
    code: "LEAD_CENTER",
    name: "Lead Center",
    version: "1.0.0",
    category: "MARKETING",
    description: "Tiếp nhận, làm sạch và phân bổ nguồn khách hàng tiềm năng.",
    icon: "inbox",
    dependencies: [],
    sortOrder: 15,
    nav: {
      code: "LEAD_CENTER",
      label: "Lead Center",
      href: "/workspace/leads/dashboard",
      icon: <Inbox className="h-5 w-5" />,
      children: [
        { label: "Tổng quan", href: "/workspace/leads/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, available: true },
        { label: "Danh sách Lead", href: "/workspace/leads", icon: <Inbox className="h-4 w-4" />, available: true },
        { label: "Trình tạo Form", href: "/workspace/leads/forms", icon: <FileText className="h-4 w-4" />, available: true },
        { label: "Webhooks", href: "/workspace/leads/webhooks", icon: <Link2 className="h-4 w-4" />, available: true },
        { label: "Nguồn Lead", href: "/workspace/leads/sources", icon: <Hash className="h-4 w-4" />, available: true },
        { label: "Cấu hình", href: "/workspace/leads/settings", icon: <Settings2 className="h-4 w-4" />, available: true },
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
        { label: "Tổng quan", href: "/workspace/projects", available: true, icon: <LayoutDashboard className="h-4 w-4" /> },
        { label: "Công việc", href: "/workspace/tasks", available: true, icon: <CheckSquare2 className="h-4 w-4" /> },
        { label: "Timeline", href: "/workspace/timeline", available: true, icon: <BarChart3 className="h-4 w-4" /> },
        { label: "Calendar", href: "/workspace/calendar", available: true, icon: <CalendarDays className="h-4 w-4" /> },
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
        { label: "Tổng quan", href: "/workspace/finance/overview", available: true, icon: <LayoutDashboard className="h-4 w-4" /> },
        { label: "Báo giá", href: "/workspace/finance/quotations", available: true, icon: <ScrollText className="h-4 w-4" /> },
        { label: "Hợp đồng", href: "/workspace/finance/contracts", available: true, icon: <FileSignature className="h-4 w-4" /> },
        { label: "Hóa đơn", href: "/workspace/finance/invoices", available: true, icon: <FileText className="h-4 w-4" /> },
        { label: "Thanh toán", href: "/workspace/finance/payments", available: true, icon: <CreditCard className="h-4 w-4" /> },
        { label: "Cấu hình", href: "/workspace/finance/settings", available: true, icon: <Settings2 className="h-4 w-4" /> },
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
    name: "Automations",
    version: "1.0.0",
    category: "AUTOMATION",
    description: "Luồng tự động hóa giữa CRM, tài chính, marketing và thông báo.",
    icon: "bot",
    dependencies: [],
    sortOrder: 140,
    lifecycle: "DEVELOPMENT",
    nav: {
      code: "AUTOMATION",
      label: "Automations",
      href: "/workspace/workflows",
      icon: <Bot className="h-5 w-5" />,
      children: [
        { label: "Workflows", href: "/workspace/workflows", available: true },
        { label: "Notifications", href: "/workspace/automations/notifications", available: true },
        { label: "Reminders", href: "/workspace/automations/reminders", available: true },
      ],
    },
  },
  {
    code: "AI_ASSISTANT",
    name: "AI Platform",
    version: "1.0.0",
    category: "AI",
    description: "Trợ lý AI theo module, workspace và dữ liệu được cấp quyền.",
    icon: "sparkles",
    dependencies: [],
    sortOrder: 150,
    lifecycle: "DEVELOPMENT",
    nav: {
      code: "AI_ASSISTANT",
      label: "AI Platform",
      href: "/workspace/ai",
      icon: <BrainCircuit className="h-5 w-5" />,
      children: [
        { label: "Tổng quan", href: "/workspace/ai", available: true },
      ],
    },
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
      children: [
        { label: "Hồ sơ doanh nghiệp", href: "/workspace/settings/organization", icon: <Building2 className="h-4 w-4" />, available: true },
        { label: "Tên miền", href: "/workspace/settings/domains", icon: <Globe className="h-4 w-4" />, available: true },
        { label: "Nhắc nhở tự động", href: "/workspace/settings/automations/reminders", icon: <Bell className="h-4 w-4" />, available: true },
        { label: "Quy trình (Workflows)", href: "/workspace/settings/workflows", icon: <Workflow className="h-4 w-4" />, available: true },
        { label: "Cài đặt thanh toán", href: "/workspace/settings/payment", icon: <CreditCard className="h-4 w-4" />, available: true },
        { label: "Bảo mật", href: "/workspace/settings?tab=security", icon: <ShieldCheck className="h-4 w-4" />, available: true },
        { label: "Cài đặt Email", href: "/workspace/settings/email", icon: <Mail className="h-4 w-4" />, available: true },
        { label: "Storage Center", href: "/workspace/settings?tab=storage", icon: <HardDrive className="h-4 w-4" />, available: true },
        { label: "Thông báo", href: "/workspace/settings?tab=notifications", icon: <Bell className="h-4 w-4" />, available: true },
        { label: "Sao lưu", href: "/workspace/settings?tab=backup", icon: <Archive className="h-4 w-4" />, available: true },
        { label: "Cài đặt nhắn tin", href: "/workspace/settings/chat", icon: <MessageCircle className="h-4 w-4" />, available: true },
      ]
    },
  },
  {
    code: "TRAVELING",
    name: "Traveling",
    version: "1.0.0",
    category: "SERVICES",
    description: "Quản lý Khách sạn, Tour du lịch, Thuê xe và Vé dịch vụ.",
    icon: "map",
    dependencies: [],
    sortOrder: 170,
    nav: {
      code: "TRAVELING",
      label: "Traveling",
      href: "/workspace/traveling",
      icon: <Globe className="h-5 w-5" />,
      children: [
        { label: "Tổng quan", href: "/workspace/traveling", available: true, icon: <LayoutDashboard className="h-4 w-4" /> },
        { label: "Khách sạn", href: "/workspace/traveling/hotels", available: true, icon: <Building2 className="h-4 w-4" /> },
        { label: "Tour Du Lịch", href: "/workspace/traveling/tours", available: true, icon: <Map className="h-4 w-4" /> },
        { label: "Thuê Xe", href: "/workspace/traveling/vehicles", available: true, icon: <Car className="h-4 w-4" /> },
        { label: "Vé Dịch Vụ", href: "/workspace/traveling/tickets", available: true, icon: <Ticket className="h-4 w-4" /> },
        { label: "Quản lý Đối tác", href: "/workspace/traveling/partners", available: true, icon: <Users className="h-4 w-4" /> },
        { label: "Cài đặt", href: "/workspace/traveling/settings", available: true, icon: <Settings2 className="h-4 w-4" /> },
      ],
    },
  },
  {
    code: "SERVICES",
    name: "Dịch vụ",
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
  { code: "WORKSPACE", label: "Dashboard", href: "/workspace/dashboard", icon: <LayoutGrid className="h-5 w-5" /> },
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
  DIGITAL_OFFICE: "DIGITAL_OFFICE",
  OFFICE: "DIGITAL_OFFICE",
  PORTAL: "PORTAL",
  WEBSITE: "WEBSITE",
  HOTEL_BOOKING: "TRAVELING",
  TRAVELING: "TRAVELING",
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
  "TRAVELING",
  "SERVICES",
  "WEBSITE",
];

export function normalizeModuleCode(code: string): PlatformModuleCode | null {
  return legacyModuleAliases[code.trim().toUpperCase()] ?? null;
}

export function getPlatformModuleDefinition(code: PlatformModuleCode) {
  return moduleDefinitions.find((module) => module.code === code) ?? null;
}

export function withDevelopmentModulesForRole(
  enabledModules: PlatformModuleCode[],
  role?: string | null,
): PlatformModuleCode[] {
  if (role !== "SUPER_ADMIN") return enabledModules;
  const result = new Set(enabledModules);
  for (const definition of moduleDefinitions) {
    if (definition.lifecycle === "DEVELOPMENT" || definition.lifecycle === "TESTING") {
      result.add(definition.code);
    }
  }
  return Array.from(result);
}
