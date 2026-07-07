import { BarChart3, CheckCircle2, FileBox, LayoutGrid, MessageSquare } from "lucide-react";

export const statusConfig: Record<string, { label: string; cls: string; dot: string }> = {
  PLANNING: { label: "Lên kế hoạch", cls: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  ACTIVE: { label: "Đang chạy", cls: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  ON_HOLD: { label: "Tạm dừng", cls: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  COMPLETED: { label: "Hoàn tất", cls: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  CANCELLED: { label: "Đã hủy", cls: "bg-red-100 text-red-700", dot: "bg-red-500" },
  ARCHIVED: { label: "Lưu trữ", cls: "bg-gray-100 text-gray-700", dot: "bg-gray-400" },
};

export const fallbackStatus = statusConfig.ACTIVE as { label: string; cls: string; dot: string };

export const priorityConfig: Record<string, { label: string; cls: string; dot: string }> = {
  LOW: { label: "Thấp", cls: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  MEDIUM: { label: "Vừa", cls: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  HIGH: { label: "Cao", cls: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  URGENT: { label: "Khẩn", cls: "bg-red-100 text-red-700", dot: "bg-red-500" },
};

export const fallbackPriority = priorityConfig.MEDIUM as { label: string; cls: string; dot: string };

export const columns = [
  { id: "BACKLOG", title: "Chưa bắt đầu", tone: "bg-zinc-50 border-zinc-200", dot: "bg-zinc-400" },
  { id: "TODO", title: "Cần làm", tone: "bg-slate-50 border-slate-200", dot: "bg-slate-400" },
  { id: "IN_PROGRESS", title: "Đang làm", tone: "bg-blue-50 border-blue-200", dot: "bg-blue-500" },
  { id: "IN_REVIEW", title: "Đang duyệt", tone: "bg-amber-50 border-amber-200", dot: "bg-amber-500" },
  { id: "DONE", title: "Hoàn tất", tone: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  { id: "CANCELLED", title: "Đã hủy", tone: "bg-red-50 border-red-200", dot: "bg-red-500" },
];

export const baseTabs = [
  { id: "overview", label: "Tổng quan", icon: LayoutGrid },
  { id: "kanban", label: "Kanban", icon: CheckCircle2 },
  { id: "timeline", label: "Timeline", icon: BarChart3 },
  { id: "files", label: "Tập tin", icon: FileBox },
  { id: "discussion", label: "Trao đổi", icon: MessageSquare },
];
