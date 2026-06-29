// App
export const APP_NAME = "Ong Vàng Workspace";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
export const APP_DESCRIPTION =
  "Nền tảng quản trị doanh nghiệp toàn diện — CRM, Dự án, Tài chính, Đào tạo và Marketing trên một hệ thống.";

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

// Date
export const DATE_FORMAT = "dd/MM/yyyy";
export const DATETIME_FORMAT = "dd/MM/yyyy HH:mm";

// Currency
export const DEFAULT_CURRENCY = "VND";
export const CURRENCY_OPTIONS = ["VND", "USD", "EUR"] as const;

// Task Status Labels
export const TASK_STATUS_LABELS = {
  BACKLOG: "Backlog",
  TODO: "Cần làm",
  IN_PROGRESS: "Đang làm",
  IN_REVIEW: "Đang review",
  DONE: "Hoàn thành",
  CANCELLED: "Hủy",
} as const;

// Task Status Colors
export const TASK_STATUS_COLORS = {
  BACKLOG: "#94A3B8",
  TODO: "#6366F1",
  IN_PROGRESS: "#F59E0B",
  IN_REVIEW: "#8B5CF6",
  DONE: "#10B981",
  CANCELLED: "#EF4444",
} as const;

// Priority Labels
export const PRIORITY_LABELS = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
  URGENT: "Khẩn cấp",
} as const;

// Priority Colors
export const PRIORITY_COLORS = {
  LOW: "#94A3B8",
  MEDIUM: "#3B82F6",
  HIGH: "#F97316",
  URGENT: "#EF4444",
} as const;

// Invoice Status
export const INVOICE_STATUS_LABELS = {
  DRAFT: "Bản nháp",
  SENT: "Đã gửi",
  VIEWED: "Đã xem",
  PARTIAL: "Đặt cọc",
  PAID: "Đã thanh toán",
  OVERDUE: "Quá hạn",
  CANCELLED: "Đã hủy",
  REFUNDED: "Hoàn tiền",
} as const;

// Invoice Status Colors
export const INVOICE_STATUS_COLORS = {
  DRAFT: "#94A3B8",
  SENT: "#3B82F6",
  VIEWED: "#8B5CF6",
  PARTIAL: "#F97316",
  PAID: "#10B981",
  OVERDUE: "#EF4444",
  CANCELLED: "#6B7280",
  REFUNDED: "#F59E0B",
} as const;

// Deal Status Labels
export const DEAL_STATUS_LABELS = {
  OPEN: "Đang mở",
  WON: "Đã thắng",
  LOST: "Đã thua",
  ON_HOLD: "Tạm dừng",
} as const;

// Role Labels
export const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  MANAGER: "Quản lý",
  STAFF: "Nhân viên",
  CUSTOMER: "Khách hàng",
  INSTRUCTOR: "Giảng viên",
  STUDENT: "Học viên",
} as const;

// Navigation
export const WORKSPACE_NAV = [
  {
    label: "Dashboard",
    href: "/workspace/dashboard",
    icon: "LayoutDashboard",
    permissions: [],
  },
  {
    label: "CRM",
    href: "/workspace/crm",
    icon: "Users",
    permissions: ["crm:read"],
    children: [
      { label: "Liên hệ", href: "/workspace/crm/contacts" },
      { label: "Công ty", href: "/workspace/crm/companies" },
      { label: "Cơ hội", href: "/workspace/crm/deals" },
    ],
  },
  {
    label: "Dự án",
    href: "/workspace/projects",
    icon: "FolderKanban",
    permissions: ["projects:read"],
  },
  {
    label: "Tài chính",
    href: "/workspace/finance",
    icon: "DollarSign",
    permissions: ["finance:read"],
    children: [
      { label: "Báo giá", href: "/workspace/finance/quotations" },
      { label: "Hóa đơn", href: "/workspace/finance/invoices" },
      { label: "Thanh toán", href: "/workspace/finance/payments" },
      { label: "Báo cáo", href: "/workspace/finance/reports" },
    ],
  },
  {
    label: "Khóa học",
    href: "/workspace/courses",
    icon: "GraduationCap",
    permissions: ["courses:read"],
  },
  {
    label: "Marketing",
    href: "/workspace/marketing",
    icon: "Megaphone",
    permissions: ["marketing:read"],
  },
  {
    label: "CMS",
    href: "/workspace/cms",
    icon: "FileText",
    permissions: ["cms:read"],
  },
  {
    label: "Tệp tin",
    href: "/workspace/files",
    icon: "Folder",
    permissions: ["files:read"],
  },
  {
    label: "Báo cáo",
    href: "/workspace/reports",
    icon: "BarChart3",
    permissions: ["reports:read"],
  },
  {
    label: "Cài đặt",
    href: "/workspace/settings",
    icon: "Settings",
    permissions: ["system:read"],
  },
] as const;
