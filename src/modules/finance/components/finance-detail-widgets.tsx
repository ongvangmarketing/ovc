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
    return <div className="quote-detail-empty">Chưa có lịch sử hoạt động.</div>;
  }

  return (
    <div className="finance-activity-list">
      {items.map((item, index) => (
        <article key={item.id || `${item.action}-${index}`} className="finance-activity-item">
          <span />
          <div>
            <strong>{actionLabel(item.action)}</strong>
            <p>{item.description || item.user?.name || item.user?.email || "Hệ thống ghi nhận thao tác."}</p>
          </div>
          <time>{formatDateTime(item.createdAt)}</time>
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
    <div className="document-flow-card">
      <span>Dòng chứng từ</span>
      <strong>{currentNumber}</strong>
      <div>
        {previous ? (
          <Link href={`${basePath}/${previous.id}`} title={`Chứng từ trước: ${previous.number}`}>
            <ChevronLeft className="h-4 w-4" />
            {previous.number}
          </Link>
        ) : (
          <button type="button" disabled>
            <ChevronLeft className="h-4 w-4" />
            Đầu dòng
          </button>
        )}
        {next ? (
          <Link href={`${basePath}/${next.id}`} title={`Chứng từ sau: ${next.number}`}>
            {next.number}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <button type="button" disabled>
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
    return <div className="quote-detail-empty">Chưa có tệp đính kèm.</div>;
  }

  return (
    <div className="finance-attachment-list">
      {files.map((file) => (
        <article key={file.id} className="finance-attachment-item">
          <FileText className="h-5 w-5" />
          <div>
            <strong>{file.name || file.filename || "Tệp đính kèm"}</strong>
            <p>{file.mimeType || "File"} · {formatFileSize(file.size)} · {formatDateTime(file.createdAt)}</p>
          </div>
          {file.url ? (
            <a href={file.url} target="_blank" rel="noreferrer">
              <Download className="h-4 w-4" />
              Tải xuống
            </a>
          ) : null}
        </article>
      ))}
    </div>
  );
}
