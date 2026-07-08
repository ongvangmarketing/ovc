"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, FileText } from "lucide-react";

export type FinanceActivity = {
  id?: string;
  action: string;
  entity?: string | null;
  description?: string | null;
  createdAt?: string | Date | null;
  user?: { name?: string | null; email?: string | null } | null;
};

export type FinanceDocumentLink = {
  id: string;
  number: string;
};

export type FinanceAttachment = {
  id: string;
  name?: string | null;
  filename?: string | null;
  url?: string | null;
  mimeType?: string | null;
  size?: number | null;
  createdAt?: string | Date | null;
};

function formatDateTime(value?: string | Date | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function actionLabel(action: string) {
  const labels: Record<string, string> = {
    created: "Tạo mới",
    updated: "Cập nhật",
    deleted: "Xóa",
    sent: "Đã gửi",
    signed: "Đã ký",
    admin_signed: "Admin ký",
    admin_signature_revoked: "Hủy ký admin",
    customer_signature_revoked: "Hủy ký khách",
    accepted: "Đã duyệt",
    paid: "Thanh toán",
    payment: "Thanh toán",
  };
  return labels[action] || labels[action.toLowerCase()] || action;
}

export function ActivityTimeline({
  logs,
  fallback,
}: {
  logs?: FinanceActivity[];
  fallback?: FinanceActivity[];
}) {
  const items = (logs?.length ? logs : fallback || [])
    .filter((item) => item.createdAt || item.description || item.action)
    .slice(0, 20);

  if (!items.length) {
    return <div className="text-gray-500 py-8 text-center text-[14px]">Chưa có lịch sử hoạt động.</div>;
  }

  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <article key={item.id || `${item.action}-${index}`} className="relative pl-6">
          {index !== items.length - 1 && <span className="absolute left-[3px] top-4 bottom-[-24px] w-px bg-gray-200" />}
          <span className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-black ring-4 ring-white" />
          <div>
            <strong className="block text-[14px] font-medium text-black">{actionLabel(item.action)}</strong>
            <p className="text-[14px] text-gray-500 mt-0.5">{item.description || item.user?.name || item.user?.email || "Hệ thống ghi nhận thao tác."}</p>
          </div>
          <time className="block text-[12px] text-gray-400 mt-1">{formatDateTime(item.createdAt)}</time>
        </article>
      ))}
    </div>
  );
}

export function DocumentNavigator({
  basePath,
  currentNumber,
  previous,
  next,
}: {
  basePath: string;
  currentNumber: string;
  previous?: FinanceDocumentLink | null;
  next?: FinanceDocumentLink | null;
}) {
  return (
    <div className="rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm">
      <span className="text-[12px] font-medium text-gray-400 uppercase tracking-widest block mb-1">Dòng chứng từ</span>
      <strong className="text-[20px] font-medium text-black tracking-tight block mb-4">{currentNumber}</strong>
      <div className="flex items-center gap-2">
        {previous ? (
          <Link href={`${basePath}/${previous.id}`} title={`Chứng từ trước: ${previous.number}`} className="flex items-center gap-1 text-[13px] text-gray-500 hover:text-black transition-colors px-3 py-1.5 rounded-md hover:bg-gray-50 border border-transparent hover:border-[#eaeaea]">
            <ChevronLeft className="h-4 w-4" />
            {previous.number}
          </Link>
        ) : (
          <button type="button" disabled className="flex items-center gap-1 text-[13px] text-gray-300 px-3 py-1.5 cursor-not-allowed">
            <ChevronLeft className="h-4 w-4" />
            Đầu dòng
          </button>
        )}
        <span className="text-gray-300">/</span>
        {next ? (
          <Link href={`${basePath}/${next.id}`} title={`Chứng từ sau: ${next.number}`} className="flex items-center gap-1 text-[13px] text-gray-500 hover:text-black transition-colors px-3 py-1.5 rounded-md hover:bg-gray-50 border border-transparent hover:border-[#eaeaea]">
            {next.number}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <button type="button" disabled className="flex items-center gap-1 text-[13px] text-gray-300 px-3 py-1.5 cursor-not-allowed">
            Cuối dòng
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function formatFileSize(value?: number | null) {
  if (!value) return "--";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

export function AttachmentList({ files }: { files?: FinanceAttachment[] }) {
  if (!files?.length) {
    return <div className="text-gray-500 py-8 text-center text-[14px]">Chưa có tệp đính kèm.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {files.map((file) => (
        <article key={file.id} className="flex items-center gap-4 p-3 rounded-lg border border-[#eaeaea] bg-gray-50/50 hover:bg-white transition-colors">
          <div className="w-10 h-10 flex items-center justify-center bg-white border border-[#eaeaea] rounded-lg shrink-0 text-gray-400">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <strong className="block text-[14px] font-medium text-black truncate">{file.name || file.filename || "Tệp đính kèm"}</strong>
            <p className="text-[12px] text-gray-500 truncate mt-0.5">{file.mimeType || "File"} · {formatFileSize(file.size)} · {formatDateTime(file.createdAt)}</p>
          </div>
          {file.url ? (
            <a href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium text-black bg-white border border-[#eaeaea] rounded-md hover:bg-gray-50 transition-colors shrink-0">
              <Download className="h-4 w-4" />
              Tải xuống
            </a>
          ) : null}
        </article>
      ))}
    </div>
  );
}
