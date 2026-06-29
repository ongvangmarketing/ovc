import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { vi } from "date-fns/locale";

// ============================================================
// Currency Formatting
// ============================================================

export function formatCurrency(
  amount: number,
  currency = "VND",
  locale = "vi-VN"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n);
}

export function formatCompactNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ============================================================
// Date Formatting
// ============================================================

export function formatDate(
  date: Date | string | null | undefined,
  fmt = "dd/MM/yyyy"
): string {
  if (!date) return "—";
  return format(new Date(date), fmt, { locale: vi });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: vi });
}

export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isToday(d)) return `Hôm nay lúc ${format(d, "HH:mm")}`;
  if (isYesterday(d)) return `Hôm qua lúc ${format(d, "HH:mm")}`;
  return formatDistanceToNow(d, { addSuffix: true, locale: vi });
}

// ============================================================
// String Helpers
// ============================================================

export function truncate(str: string, maxLength = 50): string {
  return str.length <= maxLength ? str : `${str.slice(0, maxLength)}...`;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ============================================================
// Color Helpers
// ============================================================

export function stringToColor(str: string): string {
  const colors = [
    "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6",
    "#EF4444", "#EC4899", "#14B8A6", "#F97316",
    "#06B6D4", "#84CC16",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length] ?? colors[0]!;
}

// ============================================================
// File Size
// ============================================================

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ============================================================
// Percentage
// ============================================================

export function formatPercent(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}
