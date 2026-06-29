"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, FileCheck2, FileText, ReceiptText } from "lucide-react";

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
        <Link href="/portal/tasks" className="quote-detail-action">Xem tất cả</Link>
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
  const activeGroup = groups.find((group) => group.key === activeKey) || firstGroup;
  const Icon = financeIcons[activeGroup.key];

  return (
    <section className="quote-detail-card">
      <div className="portal-section-heading">
        <div>
          <h2>Tài chính</h2>
          <p>Báo giá, hợp đồng, hóa đơn và thanh toán của khách hàng.</p>
        </div>
        <Link href="/portal/finance" className="quote-detail-action">Xem tất cả</Link>
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
        </div>
        {activeGroup.items.slice(0, 5).map((item) => (
          <Link key={item.id} href={item.href} className="portal-finance-row">
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
          </Link>
        ))}
        {!activeGroup.items.length ? <div className="quote-detail-empty">Chưa có dữ liệu {activeGroup.label.toLowerCase()}.</div> : null}
      </div>
    </section>
  );
}
