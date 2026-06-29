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
} from "lucide-react";

import { sendPortalAccessEmailForUser, sendTestEmail, updateEmailTemplate, updateSettings } from "@/app/actions/settings";
import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/format";

type SettingsMap = Record<string, string>;

type EmailTemplateRecord = {
  id: string;
  code: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  isActive?: boolean;
};

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
  initialSettings: SettingsMap;
  initialTemplates: EmailTemplateRecord[];
  initialEmailLogs: EmailLogRecord[];
  initialMembers: MemberRecord[];
  initialActivityLogs: ActivityRecord[];
};

const tabs = [
  { id: "security", label: "Bảo mật", href: "/workspace/settings?tab=security", icon: ShieldCheck },
  { id: "email", label: "Email", href: "/workspace/settings?tab=email", icon: Server },
  { id: "templates", label: "Mẫu Email", href: "/workspace/settings?tab=templates", icon: Mail },
  { id: "email-logs", label: "Email Logs", href: "/workspace/settings?tab=email-logs", icon: ScrollText },
  { id: "notifications", label: "Thông báo", href: "/workspace/settings?tab=notifications", icon: Bell },
  { id: "backup", label: "Sao lưu", href: "/workspace/settings?tab=backup", icon: Archive },
  { id: "integrations", label: "Tích hợp API", href: "/workspace/settings?tab=integrations", icon: Braces },
  { id: "logs", label: "Nhật ký hệ thống", href: "/workspace/settings?tab=logs", icon: Activity },
  { id: "tools", label: "Công cụ", href: "/workspace/settings?tab=tools", icon: Wrench },
  { id: "members", label: "Thành viên", href: "/workspace/settings?tab=members", icon: Users },
  { id: "departments", label: "Phòng ban", href: "/workspace/settings?tab=departments", icon: Database },
  { id: "roles", label: "Vai trò", href: "/workspace/settings?tab=roles", icon: KeyRound },
];

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
          ? "bg-slate-100 text-slate-600"
          : "bg-orange-50 text-orange-700";

  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", color)}>{status}</span>;
}

function DevelopingPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-5">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="h-5 w-5 text-orange-500" />
        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      </div>
      <p className="mb-4 text-[15px] font-semibold text-slate-500">Tính năng đang phát triển.</p>
      <div className="grid gap-2 md:grid-cols-2">
        {items.map((item) => (
          <div key={item} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[15px] font-semibold text-slate-600">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsClient({
  initialSettings,
  initialTemplates,
  initialEmailLogs,
  initialMembers,
  initialActivityLogs,
}: SettingsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "email";

  const [smtpSettings, setSmtpSettings] = useState({
    smtp_host: initialSettings.smtp_host || "",
    smtp_port: initialSettings.smtp_port || "",
    smtp_user: initialSettings.smtp_user || "",
    smtp_pass: initialSettings.smtp_pass || "",
    smtp_from_email: initialSettings.smtp_from_email || "",
    smtp_from_name: initialSettings.smtp_from_name || "",
    mail_mailer: initialSettings.mail_mailer || "smtp",
    mail_scheme: initialSettings.mail_scheme || "smtps",
  });
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [testEmail, setTestEmail] = useState(initialSettings.smtp_from_email || "");
  const [isSendingTest, startTestEmailTransition] = useTransition();

  const [templates, setTemplates] = useState(initialTemplates);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplateRecord | null>(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isPortalPending, startPortalTransition] = useTransition();

  const financeTemplates = useMemo(
    () =>
      templates
        .filter((template) => emailFlow.includes(template.code))
        .sort((a, b) => emailFlow.indexOf(a.code) - emailFlow.indexOf(b.code)),
    [templates]
  );

  const openTab = (tabId: string) => {
    setEditingTemplate(null);
    router.push(`/workspace/settings?tab=${tabId}`, { scroll: false });
  };

  const handleSaveSmtp = async () => {
    setIsSavingSmtp(true);
    try {
      await updateSettings(smtpSettings);
      alert("Đã lưu cấu hình email.");
    } catch (error) {
      alert(`Lỗi: ${error instanceof Error ? error.message : "Không thể lưu cấu hình"}`);
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleSendTestEmail = () => {
    startTestEmailTransition(async () => {
      try {
        await updateSettings(smtpSettings);
        const result = await sendTestEmail(testEmail);
        alert(
          result.sent
            ? `Đã gửi email test tới ${testEmail}.`
            : `Đã tạo Email Log test cho ${testEmail}, nhưng chưa gửi thật vì SMTP/Resend chưa cấu hình.`
        );
        router.refresh();
      } catch (error) {
        alert(`Lỗi: ${error instanceof Error ? error.message : "Không thể gửi email test"}`);
      }
    });
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    setIsSavingTemplate(true);
    try {
      await updateEmailTemplate(editingTemplate.code, {
        name: editingTemplate.name,
        subject: editingTemplate.subject,
        body: editingTemplate.body,
        variables: editingTemplate.variables,
      });
      setTemplates((current) =>
        current.map((template) => (template.code === editingTemplate.code ? editingTemplate : template))
      );
      alert("Đã lưu mẫu email.");
      setEditingTemplate(null);
    } catch (error) {
      alert(`Lỗi: ${error instanceof Error ? error.message : "Không thể lưu mẫu email"}`);
    } finally {
      setIsSavingTemplate(false);
    }
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
    <div className="page-container mx-auto max-w-7xl">
      <div className="page-header mb-2">
        <div>
          <h2 className="text-3xl font-bold text-slate-950">Cài đặt</h2>
          <p className="mt-1 text-[15px] font-semibold text-slate-500">
            Cấu hình hệ thống, email, phân quyền và công cụ vận hành.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => openTab(tab.id)}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[15px] font-semibold transition-all",
                    active ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="min-h-[620px] rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {activeTab === "security" ? (
            <DevelopingPanel
              title="Bảo mật"
              items={[
                "Chính sách mật khẩu",
                "Phiên đăng nhập",
                "Xác thực hai lớp",
                "Giới hạn IP quản trị",
                "Public document token",
                "Chống gửi trùng MailOnce",
              ]}
            />
          ) : null}

          {activeTab === "email" ? (
            <div>
              <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-950">Email</h3>
                  <p className="mt-1 text-[15px] font-semibold text-slate-500">
                    Ưu tiên setup SMTP và danh tính người gửi cho các luồng báo giá, hợp đồng, hóa đơn, thanh toán.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    value={testEmail}
                    onChange={(event) => setTestEmail(event.target.value)}
                    className="settings-input h-10 min-w-0 sm:w-[260px]"
                    placeholder="Email nhận test"
                  />
                  <button
                    onClick={handleSendTestEmail}
                    disabled={isSendingTest || !testEmail.trim()}
                    className="inline-flex h-10 min-w-[124px] items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[15px] font-bold text-slate-700 hover:bg-slate-950 hover:text-white disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                    <span className="whitespace-nowrap">{isSendingTest ? "Đang gửi..." : "Gửi test"}</span>
                  </button>
                  <button
                    onClick={handleSaveSmtp}
                    disabled={isSavingSmtp}
                    className="inline-flex h-10 min-w-[132px] items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-[15px] font-bold text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" />
                    <span className="whitespace-nowrap">{isSavingSmtp ? "Đang lưu..." : "Lưu cấu hình"}</span>
                  </button>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="MAIL_MAILER">
                  <input value={smtpSettings.mail_mailer} onChange={(event) => setSmtpSettings({ ...smtpSettings, mail_mailer: event.target.value })} className="settings-input" placeholder="smtp" />
                </Field>
                <Field label="MAIL_SCHEME">
                  <input value={smtpSettings.mail_scheme} onChange={(event) => setSmtpSettings({ ...smtpSettings, mail_scheme: event.target.value })} className="settings-input" placeholder="smtps" />
                </Field>
                <Field label="SMTP Host">
                  <input value={smtpSettings.smtp_host} onChange={(event) => setSmtpSettings({ ...smtpSettings, smtp_host: event.target.value })} className="settings-input" placeholder="smtp.larksuite.com" />
                </Field>
                <Field label="SMTP Port">
                  <input value={smtpSettings.smtp_port} onChange={(event) => setSmtpSettings({ ...smtpSettings, smtp_port: event.target.value })} className="settings-input" placeholder="465 hoặc 587" />
                </Field>
                <Field label="SMTP Username">
                  <input value={smtpSettings.smtp_user} onChange={(event) => setSmtpSettings({ ...smtpSettings, smtp_user: event.target.value })} className="settings-input" placeholder="info@ovc.vn" />
                </Field>
                <Field label="SMTP Password / App Password">
                  <input type="password" value={smtpSettings.smtp_pass} onChange={(event) => setSmtpSettings({ ...smtpSettings, smtp_pass: event.target.value })} className="settings-input" placeholder="••••••••" />
                </Field>
                <Field label="From Email">
                  <input value={smtpSettings.smtp_from_email} onChange={(event) => setSmtpSettings({ ...smtpSettings, smtp_from_email: event.target.value })} className="settings-input" placeholder="info@ovc.vn" />
                </Field>
                <Field label="From Name">
                  <input value={smtpSettings.smtp_from_name} onChange={(event) => setSmtpSettings({ ...smtpSettings, smtp_from_name: event.target.value })} className="settings-input" placeholder="Ong Vàng Workspace" />
                </Field>
              </div>

              <div className="mt-6 rounded-xl border border-orange-100 bg-orange-50 p-4">
                <h4 className="font-bold text-orange-900">Luồng email ưu tiên từ ongvang.com.vn</h4>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {emailFlow.map((code) => (
                    <button
                      key={code}
                      onClick={() => {
                        openTab("templates");
                        const template = templates.find((item) => item.code === code);
                        if (template) setEditingTemplate({ ...template });
                      }}
                      className="rounded-lg border border-orange-100 bg-white px-3 py-2 text-left text-sm font-bold text-orange-700 hover:border-orange-300"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "templates" && !editingTemplate ? (
            <div>
              <div className="mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-950">Mẫu Email</h3>
                <p className="mt-1 text-[15px] font-semibold text-slate-500">
                  Đã import template legacy; nhóm tài chính được ưu tiên để setup luồng gửi.
                </p>
              </div>
              <div className="space-y-3">
                {(financeTemplates.length ? financeTemplates : templates).map((template) => (
                  <div key={template.id} className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-slate-950">{template.name}</h4>
                        {template.isActive === false ? <StatusPill status="SKIPPED" /> : <StatusPill status="ACTIVE" />}
                      </div>
                      <p className="mt-1 truncate text-sm font-bold text-slate-500">{template.code}</p>
                      <p className="mt-1 truncate text-[15px] font-semibold text-slate-600">{template.subject}</p>
                    </div>
                    <button
                      onClick={() => setEditingTemplate({ ...template })}
                      className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-[15px] font-bold text-slate-700 hover:bg-slate-950 hover:text-white"
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "templates" && editingTemplate ? (
            <div>
              <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <button onClick={() => setEditingTemplate(null)} className="mb-2 text-[15px] font-bold text-slate-500 hover:text-slate-950">
                    ← Quay lại mẫu email
                  </button>
                  <h3 className="text-xl font-bold text-slate-950">{editingTemplate.name}</h3>
                  <p className="mt-1 text-sm font-bold text-slate-500">{editingTemplate.code}</p>
                </div>
                <button
                  onClick={handleSaveTemplate}
                  disabled={isSavingTemplate}
                  className="inline-flex h-10 min-w-[108px] items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-[15px] font-bold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  <span className="whitespace-nowrap">{isSavingTemplate ? "Đang lưu..." : "Lưu mẫu"}</span>
                </button>
              </div>
              <div className="space-y-4">
                <Field label="Tên mẫu">
                  <input value={editingTemplate.name} onChange={(event) => setEditingTemplate({ ...editingTemplate, name: event.target.value })} className="settings-input" />
                </Field>
                <Field label="Tiêu đề email">
                  <input value={editingTemplate.subject} onChange={(event) => setEditingTemplate({ ...editingTemplate, subject: event.target.value })} className="settings-input" />
                </Field>
                <Field label="Nội dung HTML">
                  <textarea rows={14} value={editingTemplate.body} onChange={(event) => setEditingTemplate({ ...editingTemplate, body: event.target.value })} className="settings-input text-sm" />
                </Field>
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <h4 className="mb-2 font-bold text-blue-900">Biến hỗ trợ</h4>
                  <div className="flex flex-wrap gap-2">
                    {editingTemplate.variables.map((variable) => (
                      <span key={variable} className="rounded-lg border border-blue-100 bg-white px-2 py-1 text-sm font-bold text-blue-700">
                        {`{{${variable}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "email-logs" ? (
            <div>
              <div className="mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-950">Email Logs</h3>
                <p className="mt-1 text-[15px] font-semibold text-slate-500">Theo dõi 50 email gần nhất của workspace.</p>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                {initialEmailLogs.length ? (
                  <div className="divide-y divide-slate-100">
                    {initialEmailLogs.map((log) => (
                      <div key={log.id} className="grid gap-3 p-4 md:grid-cols-[120px_1fr_180px] md:items-center">
                        <StatusPill status={log.status} />
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-950">{log.subject || log.templateCode || "Email không có tiêu đề"}</p>
                          <p className="truncate text-[15px] font-semibold text-slate-500">
                            To: {valueToList(log.to)} · From: {log.fromName || log.fromEmail || "—"}
                          </p>
                          {log.errorMessage ? <p className="mt-1 text-[15px] font-semibold text-red-600">{log.errorMessage}</p> : null}
                        </div>
                        <div className="text-[15px] font-semibold text-slate-500 md:text-right">
                          {formatDateTime(log.sentAt || log.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center font-semibold text-slate-500">Chưa có email log.</div>
                )}
              </div>
            </div>
          ) : null}

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

          {activeTab === "departments" ? (
            <DevelopingPanel title="Phòng ban" items={["Ban giám đốc", "Kinh doanh", "Kế toán", "Dự án", "Đào tạo", "Marketing"]} />
          ) : null}

          {activeTab === "roles" ? (
            <DevelopingPanel title="Vai trò" items={["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF", "CUSTOMER", "INSTRUCTOR", "STUDENT"]} />
          ) : null}
        </section>
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
