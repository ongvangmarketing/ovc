"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  Archive,
  Bell,
  Braces,
  Database,
  KeyRound,
  Mail,
  Save,
  ScrollText,
  Send,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Wrench,
  Building2,
  Settings as SettingsIcon,
  Inbox,
  LayoutTemplate,
  ArrowLeft
} from "lucide-react";

import { sendPortalAccessEmailForUser, sendTestEmail, updateSettings } from "@/actions/settings";
import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/format";
import { EmailTemplatesClient } from "@/modules/core/components/email-templates-client";
import { MailAccountForm } from "@/modules/core-mail/components/mail-account-form";
import { StorageClient } from "@/modules/core-storage/components/storage-client";

type SettingsMap = Record<string, string>;

type EmailLogRecord = {
  id: string;
  status: string;
  provider: string | null;
  templateCode: string | null;
  subject: string | null;
  to: unknown;
  fromEmail: string | null;
  fromName: string | null;
  relatedType: string | null;
  errorMessage: string | null;
  sentAt: Date | string | null;
  createdAt: Date | string;
};

type MemberRecord = {
  id: string;
  role: string;
  permissions: string[];
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  };
};

type ActivityRecord = {
  id: string;
  action: string;
  entity: string;
  description: string | null;
  createdAt: Date | string;
  user: {
    name: string;
    email: string;
  } | null;
};

type SettingsClientProps = {
  organizationId: string;
  initialSettings: SettingsMap;
  initialEmailLogs: EmailLogRecord[];
  initialMembers: MemberRecord[];
  initialActivityLogs: ActivityRecord[];
  initialEmailTemplates: any[];
};



const emailFlow = [
  "quotation_sign_request_sent",
  "contract_sign_request_sent",
  "invoice_sign_request_sent",
  "quotation_accepted_customer",
  "quotation_accepted_staff",
  "contract_signed_customer",
  "contract_signed_staff",
  "invoice_signed_customer",
  "invoice_signed_staff",
  "invoice_paid_customer",
  "invoice_paid_staff",
];

function valueToList(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "string") return value;
  if (!value) return "—";
  try {
    return JSON.stringify(value);
  } catch {
    return "—";
  }
}

function StatusPill({ status }: { status: string }) {
  const color =
    status === "SENT" || status === "COMPLETED"
      ? "bg-emerald-50 text-emerald-700"
      : status === "FAILED"
        ? "bg-red-50 text-red-700"
        : status === "SKIPPED"
          ? "bg-gray-100 text-gray-600"
          : "bg-orange-50 text-orange-700";

  return <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest border border-[#eaeaea]", color)}>{status}</span>;
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-[14px] font-medium rounded-full transition-colors whitespace-nowrap ${
        active ? "bg-black text-white" : "text-gray-500 hover:bg-gray-100 hover:text-black"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function DevelopingPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden animate-in fade-in duration-300">
      <div className="p-8">
        <div className="mb-8">
          <h3 className="text-[20px] font-medium tracking-tight text-black">{title}</h3>
          <p className="mt-2 text-[14px] text-gray-500">Tính năng đang phát triển.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <div key={item} className="rounded-xl border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[14px] font-medium text-gray-700">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingsClient({
  organizationId,
  initialSettings,
  initialEmailLogs,
  initialMembers,
  initialActivityLogs,
  initialEmailTemplates,
}: SettingsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "security";

  const isPortalPending = false;
  const startPortalTransition = (cb: () => void) => cb();

  const openTab = (tabId: string) => {
    router.push(`/workspace/settings?tab=${tabId}`, { scroll: false });
  };

  const handleSendPortalAccess = (userId: string) => {
    const password = window.prompt("Nhập mật khẩu Portal muốn cấp. Để trống để hệ thống tự sinh mật khẩu.");
    startPortalTransition(async () => {
      try {
        const result = await sendPortalAccessEmailForUser(userId, password || undefined);
        const generated = result.generatedPassword ? `\nMật khẩu tự sinh: ${result.generatedPassword}` : "";
        alert(`Đã tạo/cập nhật tài khoản Portal và ghi email log cho ${result.email}.${generated}`);
      } catch (error) {
        alert(`Lỗi: ${error instanceof Error ? error.message : "Không thể gửi email Portal"}`);
      }
    });
  };

  return (
    <div className="p-8 md:p-12 h-full bg-white font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <button 
              onClick={() => router.back()} 
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-black transition-colors border border-[#eaeaea]"
              title="Quay lại"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase">
              Thiết lập hệ thống
            </span>
          </div>
          <h1 className="text-[32px] md:text-[44px] tracking-tight leading-[1.15] font-medium">
            <span className="text-black">Cấu hình hệ thống,</span>{" "}
            <span className="text-gray-400">quản lý email, phân quyền.</span>
          </h1>
          <p className="text-[15px] text-gray-500 leading-relaxed mt-5 max-w-2xl">
            Trung tâm thiết lập kỹ thuật giúp bạn dễ dàng theo dõi SMTP, gửi email test, giám sát hoạt động hệ thống và quản trị các phân quyền nâng cao.
          </p>
        </div>

      <div className="w-full">

        <section className="min-h-[620px]">
          {activeTab === "security" ? (
            <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
              <div className="p-8">
                <div className="mb-8">
                  <h3 className="text-[20px] font-medium tracking-tight text-black">Bảo mật</h3>
                  <p className="mt-2 text-[14px] text-gray-500">
                    Thiết lập các chính sách an toàn, xác thực và giới hạn truy cập cho workspace.
                  </p>
                </div>

                <div className="grid gap-6">
                  {/* Password Policy */}
                  <div className="flex items-start justify-between border-b border-[#eaeaea] pb-6">
                    <div>
                      <h4 className="text-[14px] font-medium text-black">Chính sách mật khẩu mạnh</h4>
                      <p className="mt-1 text-[13px] text-gray-500">Yêu cầu tối thiểu 8 ký tự, bao gồm số và ký tự đặc biệt.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>
                  
                  {/* 2FA */}
                  <div className="flex items-start justify-between border-b border-[#eaeaea] pb-6">
                    <div>
                      <h4 className="text-[14px] font-medium text-black">Xác thực hai lớp (2FA)</h4>
                      <p className="mt-1 text-[13px] text-gray-500">Bắt buộc tất cả thành viên sử dụng 2FA khi đăng nhập.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>

                  {/* MailOnce */}
                  <div className="flex items-start justify-between border-b border-[#eaeaea] pb-6">
                    <div>
                      <h4 className="text-[14px] font-medium text-black">Chống gửi trùng MailOnce</h4>
                      <p className="mt-1 text-[13px] text-gray-500">Ngăn chặn việc gửi cùng một loại email cho cùng một khách hàng nhiều lần.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>
                  
                  {/* Session Timeout */}
                  <div className="flex items-center justify-between border-b border-[#eaeaea] pb-6">
                    <div>
                      <h4 className="text-[14px] font-medium text-black">Thời gian hết hạn phiên</h4>
                      <p className="mt-1 text-[13px] text-gray-500">Tự động đăng xuất sau thời gian không hoạt động.</p>
                    </div>
                    <select className="rounded-md border border-[#eaeaea] px-3 py-2 text-[13px] focus:border-black focus:outline-none focus:ring-0 transition-colors bg-white">
                      <option>1 giờ</option>
                      <option>4 giờ</option>
                      <option>8 giờ</option>
                      <option>24 giờ</option>
                      <option>Không bao giờ</option>
                    </select>
                  </div>

                  {/* Public token */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[14px] font-medium text-black">Public document token</h4>
                      <p className="mt-1 text-[13px] text-gray-500">Thời gian hiệu lực của các link chia sẻ công khai.</p>
                    </div>
                    <select className="rounded-md border border-[#eaeaea] px-3 py-2 text-[13px] focus:border-black focus:outline-none focus:ring-0 transition-colors bg-white">
                      <option>7 ngày</option>
                      <option>30 ngày</option>
                      <option>Không giới hạn</option>
                    </select>
                  </div>

                </div>
              </div>

              <div className="bg-gray-50/50 border-t border-[#eaeaea] px-8 py-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <p className="text-[14px] text-gray-500">Các thay đổi sẽ có hiệu lực ngay sau khi lưu.</p>
                <button
                  className="inline-flex h-10 min-w-[132px] items-center justify-center gap-2 rounded-full bg-black px-6 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors ml-auto xl:ml-0"
                >
                  <Save className="h-4 w-4" />
                  <span className="whitespace-nowrap">Lưu cấu hình</span>
                </button>
              </div>
            </div>
          ) : null}



          {activeTab === "storage" && (
            <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
              <div className="p-8">
                <div className="mb-8">
                  <h3 className="text-[20px] font-medium tracking-tight text-black">Storage Center</h3>
                  <p className="mt-2 text-[14px] text-gray-500">
                    Quản lý bộ nhớ lưu trữ, kết nối Cloud (S3, Drive) và thiết lập chính sách lưu trữ cho toàn hệ thống.
                  </p>
                </div>
                <StorageClient organizationId={organizationId} />
              </div>
            </div>
          )}

          {activeTab === "notifications" ? (
            <DevelopingPanel
              title="Thông báo"
              items={["Thông báo khi khách xem tài liệu", "Thông báo khi khách ký", "Thông báo thanh toán", "Kênh nội bộ", "Email nội bộ staff"]}
            />
          ) : null}

          {activeTab === "backup" ? (
            <DevelopingPanel title="Sao lưu" items={["Backup database", "Backup file ký/PDF", "Lịch sao lưu", "Khôi phục dữ liệu", "Xuất cấu hình"]} />
          ) : null}

          {activeTab === "integrations" ? (
            <DevelopingPanel title="Tích hợp API" items={["Lark Suite SMTP", "Resend", "Webhook Ongvang.com.vn", "Facebook Marketing", "Public document API"]} />
          ) : null}

          {activeTab === "logs" ? (
            <div>
              <div className="mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-950">Nhật ký hệ thống</h3>
                <p className="mt-1 text-[15px] font-semibold text-slate-500">Activity logs gần nhất.</p>
              </div>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {initialActivityLogs.length ? (
                  initialActivityLogs.map((log) => (
                    <div key={log.id} className="grid gap-2 p-4 md:grid-cols-[1fr_180px]">
                      <div>
                        <p className="font-bold text-slate-950">
                          {log.action} · {log.entity}
                        </p>
                        <p className="text-[15px] font-semibold text-slate-500">{log.description || log.user?.name || "Hệ thống"}</p>
                      </div>
                      <p className="text-[15px] font-semibold text-slate-500 md:text-right">{formatDateTime(log.createdAt)}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center font-semibold text-slate-500">Chưa có nhật ký hệ thống.</div>
                )}
              </div>
            </div>
          ) : null}

          {activeTab === "tools" ? (
            <DevelopingPanel title="Công cụ" items={["Import legacy", "Test SMTP", "Gửi lại email lỗi", "Dọn cache", "Kiểm tra token public link"]} />
          ) : null}

          {activeTab === "members" ? (
            <div>
              <div className="mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-950">Thành viên</h3>
                <p className="mt-1 text-[15px] font-semibold text-slate-500">Danh sách user đang thuộc workspace.</p>
              </div>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {initialMembers.map((member) => (
                  <div key={member.id} className="grid gap-3 p-4 md:grid-cols-[1fr_140px_110px_150px] md:items-center">
                    <div>
                      <p className="font-bold text-slate-950">{member.user.name}</p>
                      <p className="text-[15px] font-semibold text-slate-500">{member.user.email}</p>
                    </div>
                    <p className="font-bold text-slate-600">{member.role}</p>
                    <StatusPill status={member.user.isActive ? "ACTIVE" : "SKIPPED"} />
                    <button
                      onClick={() => handleSendPortalAccess(member.user.id)}
                      disabled={isPortalPending}
                      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[15px] font-bold text-slate-700 hover:bg-slate-950 hover:text-white disabled:opacity-60"
                    >
                      Gửi Portal
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}


        </section>
      </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[15px] font-bold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
