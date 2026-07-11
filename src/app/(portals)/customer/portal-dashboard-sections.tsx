"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, Download, Eye, FileCheck2, FileText, Mail, ReceiptText } from "lucide-react";

import { resendPortalFinanceEmail } from "./actions";

type TaskItem = {
  id: string;
  title: string;
  projectName: string;
  status: string;
  dueDate: string | null;
};

type FinanceItem = {
  id: string;
  code: string;
  title: string;
  status: string;
  date: string | null;
  amount: number;
  href: string;
  type?: "quotation" | "contract" | "invoice";
  downloadHref?: string;
  canEmail?: boolean;
};

type FinanceGroup = {
  key: "quotations" | "contracts" | "invoices" | "payments";
  label: string;
  items: FinanceItem[];
};

const taskColumns = [
  { key: "TODO", label: "Cần làm" },
  { key: "IN_PROGRESS", label: "Đang làm" },
  { key: "IN_REVIEW", label: "Đang duyệt" },
  { key: "DONE", label: "Hoàn thành" },
];

const financeIcons = {
  quotations: FileText,
  contracts: FileCheck2,
  invoices: CreditCard,
  payments: ReceiptText,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value: string | null) {
  if (!value) return "Chưa cập nhật";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    TODO: "Cần làm",
    IN_PROGRESS: "Đang làm",
    IN_REVIEW: "Đang duyệt",
    DONE: "Hoàn thành",
    DRAFT: "Bản nháp",
    SENT: "Đã gửi",
    ACCEPTED: "Đã chấp nhận",
    SIGNED: "Đã ký",
    ACTIVE: "Đang hiệu lực",
    PARTIAL: "Đặt cọc",
    PAID: "Đã thanh toán",
    COMPLETED: "Hoàn thành",
    PENDING: "Đang chờ",
    OVERDUE: "Quá hạn",
  };
  return labels[status] || status;
}

function statusClass(status: string) {
  if (["DONE", "COMPLETED", "PAID", "SIGNED", "ACCEPTED"].includes(status)) return "is-success";
  if (["IN_PROGRESS", "SENT", "PARTIAL", "ACTIVE"].includes(status)) return "is-info";
  if (["OVERDUE", "CANCELLED", "FAILED"].includes(status)) return "is-danger";
  return "is-warning";
}

export function PortalTaskKanban({ tasks }: { tasks: TaskItem[] }) {
  return (
    <section className="quote-detail-card">
      <div className="portal-section-heading">
        <div>
          <h2>Nhiệm vụ</h2>
          <p>Tiến độ công việc theo từng trạng thái.</p>
        </div>
        <Link href="/customer/tasks" className="quote-detail-action">Xem tất cả</Link>
      </div>
      <div className="portal-kanban-preview">
        {taskColumns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.key);
          return (
            <div key={column.key} className="portal-kanban-column">
              <header>
                <strong>{column.label}</strong>
                <span>{columnTasks.length}</span>
              </header>
              <div>
                {columnTasks.slice(0, 3).map((task) => (
                  <article key={task.id} className="portal-kanban-card">
                    <i />
                    <strong>{task.title}</strong>
                    <p>{task.projectName}</p>
                    <small>{task.dueDate ? `Hạn ${formatDate(task.dueDate)}` : "Chưa có hạn"}</small>
                  </article>
                ))}
                {!columnTasks.length ? <p className="portal-kanban-empty">Chưa có việc</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function PortalFinanceTabs({ groups }: { groups: FinanceGroup[] }) {
  const fallbackGroup: FinanceGroup = { key: "quotations", label: "Báo giá", items: [] };
  const firstGroup = groups.find((group) => group.items.length) || groups[0] || fallbackGroup;
  const [activeKey, setActiveKey] = useState<FinanceGroup["key"]>(firstGroup.key);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [confirmItem, setConfirmItem] = useState<FinanceItem | null>(null);
  const activeGroup = groups.find((group) => group.key === activeKey) || firstGroup;
  const Icon = financeIcons[activeGroup.key];

  async function handleResend(item: FinanceItem) {
    if (!item.type || sendingId) return;
    setSendingId(item.id);
    try {
      await resendPortalFinanceEmail(item.type, item.id);
      setConfirmItem(null);
    } finally {
      setSendingId(null);
    }
  }

  return (
    <section className="quote-detail-card">
      <div className="portal-section-heading">
        <div>
          <h2>Tài chính</h2>
          <p>Báo giá, hợp đồng, hóa đơn và thanh toán của khách hàng.</p>
        </div>
        <Link href="/customer/finance" className="quote-detail-action">Xem tất cả</Link>
      </div>
      <nav className="portal-finance-tabs" aria-label="Nhóm tài chính">
        {groups.map((group) => (
          <button
            key={group.key}
            type="button"
            className={group.key === activeKey ? "active" : ""}
            onClick={() => setActiveKey(group.key)}
          >
            {group.label}
            <span>{group.items.length}</span>
          </button>
        ))}
      </nav>
      <div className="portal-finance-table">
        <div className="portal-finance-head">
          <span>Chứng từ</span>
          <span>Ngày</span>
          <span>Trạng thái</span>
          <span>Giá trị</span>
          <span>Thao tác</span>
        </div>
        {activeGroup.items.slice(0, 5).map((item) => (
          <article key={item.id} className="portal-finance-row">
            <span className="portal-finance-document">
              <i><Icon className="h-4 w-4" /></i>
              <span>
                <strong>{item.code}</strong>
                <small>{item.title}</small>
              </span>
            </span>
            <time>{formatDate(item.date)}</time>
            <span className={`portal-status ${statusClass(item.status)}`}>{statusLabel(item.status)}</span>
            <strong>{formatCurrency(item.amount)}</strong>
            <span className="portal-finance-actions">
              <Link href={item.href} target="_blank" aria-label={`Xem ${item.code}`} title="Xem">
                <Eye className="h-4 w-4" />
              </Link>
              {item.downloadHref ? (
                <Link href={item.downloadHref} target="_blank" aria-label={`Tải ${item.code}`} title="Tải">
                  <Download className="h-4 w-4" />
                </Link>
              ) : null}
              {item.type && item.canEmail !== false ? (
                <button type="button" onClick={() => setConfirmItem(item)} disabled={sendingId === item.id} aria-label={`Gửi lại ${item.code} qua email`} title="Gửi lại email">
                  <Mail className="h-4 w-4" />
                </button>
              ) : null}
            </span>
          </article>
        ))}
        {!activeGroup.items.length ? <div className="quote-detail-empty">Chưa có dữ liệu {activeGroup.label.toLowerCase()}.</div> : null}
      </div>
      {confirmItem ? (
        <div className="portal-task-modal" role="dialog" aria-modal="true" aria-label="Xác nhận gửi email">
          <button className="portal-task-modal-backdrop" type="button" aria-label="Đóng xác nhận" onClick={() => setConfirmItem(null)} />
          <section className="portal-task-modal-card">
            <header>
              <div>
                <span className="portal-status is-warning">Xác nhận</span>
                <h3>Gửi lại email?</h3>
              </div>
              <button type="button" aria-label="Đóng" onClick={() => setConfirmItem(null)}>×</button>
            </header>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Hệ thống sẽ gửi lại {confirmItem.code} đến email của tài khoản portal hiện tại.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button type="button" className="h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600" onClick={() => setConfirmItem(null)}>
                Hủy
              </button>
              <button type="button" className="h-10 rounded-xl bg-orange-500 text-sm font-semibold text-white disabled:opacity-60" disabled={sendingId === confirmItem.id} onClick={() => void handleResend(confirmItem)}>
                {sendingId === confirmItem.id ? "Đang gửi..." : "Gửi email"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
