"use client";

import { useState, useTransition, useMemo } from "react";
import { Plus, Save, Mail, Code, Loader2, Eye, X, ChevronLeft, ChevronRight } from "lucide-react";
import { updateEmailTemplate, createEmailTemplate, toggleEmailTemplateActive, sendTestEmailTemplate } from "@/actions/email-templates";
import { EmailSettingsNav } from "@/modules/core/components/email-settings-nav";
import { wrapGoogleWorkspaceStyle } from "@/lib/email/templates";

type EmailTemplateRecord = {
  id: string;
  code: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  isActive?: boolean;
};

type EmailTemplatesClientProps = {
  templates: EmailTemplateRecord[];
  settings: Record<string, string>;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function StatusPill({ status }: { status: "ACTIVE" | "SKIPPED" | "PENDING" | "FAILED" | "SENT" }) {
  if (status === "ACTIVE") return <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-700 ring-1 ring-inset ring-orange-600/20">ACTIVE</span>;
  if (status === "SKIPPED") return <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-500/20">INACTIVE</span>;
  return null;
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export function EmailTemplatesClient({ templates, settings }: EmailTemplatesClientProps) {
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplateRecord | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplateRecord | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [testEmail, setTestEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(templates.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const visibleTemplates = useMemo(
    () => templates.slice((safePage - 1) * pageSize, safePage * pageSize),
    [templates, safePage]
  );

  const handleSave = async () => {
    if (!editingTemplate) return;
    if (!editingTemplate.name || !editingTemplate.code || !editingTemplate.subject) {
      alert("Vui lòng điền đầy đủ Tên, Mã code và Tiêu đề.");
      return;
    }

    startTransition(async () => {
      try {
        if (isNew) {
          await createEmailTemplate({
            code: editingTemplate.code,
            name: editingTemplate.name,
            subject: editingTemplate.subject,
            body: editingTemplate.body,
            variables: editingTemplate.variables,
          });
        } else {
          await updateEmailTemplate(editingTemplate.id, {
            name: editingTemplate.name,
            subject: editingTemplate.subject,
            body: editingTemplate.body,
            variables: editingTemplate.variables,
          });
        }
        setEditingTemplate(null);
        setIsNew(false);
      } catch (error: unknown) {
        alert(getErrorMessage(error, "Đã xảy ra lỗi khi lưu."));
      }
    });
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    startTransition(async () => {
      try {
        await toggleEmailTemplateActive(id, !currentActive);
      } catch (error: unknown) {
        alert(getErrorMessage(error, "Đã xảy ra lỗi khi bật/tắt mẫu."));
      }
    });
  };

  const handleSendTest = async () => {
    if (!editingTemplate || isNew) return;
    if (!testEmail) {
      alert("Vui lòng nhập email nhận test.");
      return;
    }

    startTransition(async () => {
      try {
        await sendTestEmailTemplate(editingTemplate.id, testEmail);
        alert("Đã gửi email test thành công. Vui lòng kiểm tra hộp thư.");
      } catch (error: unknown) {
        alert(getErrorMessage(error, "Đã xảy ra lỗi khi gửi test."));
      }
    });
  };

  const previewHtml = useMemo(() => {
    if (!previewTemplate) return "";
    let html = previewTemplate.body;

    // Inject mock variables
    previewTemplate.variables.forEach((variable) => {
      html = html.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), `[${variable} mẫu]`);
    });

    // Known company variables
    const COMPANY_VARS = [
      "company_name", "company_workspace_name", "company_logo_url",
      "company_website", "company_email", "company_hotline",
      "company_address", "company_tax_code", "company_function"
    ];

    // Inject company settings
    COMPANY_VARS.forEach((key) => {
      // If setting exists, use it. Otherwise, keep the shortcode
      const value = settings[key];
      const displayValue = value ? String(value) : `{{${key}}}`;

      // Special case for logo to avoid broken images if the template expects an image src
      if (key === "company_logo_url" && !value) {
        html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), "https://placehold.co/200x60?text=LOGO");
      } else {
        html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), displayValue);
      }
    });

    const previewVariables: Record<string, unknown> = {
      ...settings,
      company_workspace_name: settings.company_workspace_name || settings.company_name || "Ong Vàng Workspace",
      company_name: settings.company_name || "Ong Vàng Workspace",
    };

    return wrapGoogleWorkspaceStyle(html, previewVariables);
  }, [previewTemplate, settings]);

  if (editingTemplate) {
    return (
      <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="p-8 border-b border-[#eaeaea] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-[20px] font-medium tracking-tight text-black">
              {isNew ? "Thêm mẫu Email mới" : editingTemplate.name}
            </h3>
            <p className="mt-2 text-[14px] text-gray-500">
              {editingTemplate.code || "Nhập mã code để xác định luồng gửi"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isNew && (
              <div className="flex items-center gap-2 mr-4">
                <input
                  type="email"
                  placeholder="Nhập email test..."
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full sm:w-48 rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-0 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleSendTest}
                  disabled={isPending || !testEmail}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-[#eaeaea] bg-white px-4 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Gửi Test
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => setPreviewTemplate(editingTemplate)}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-[#eaeaea] bg-white px-4 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <Eye className="h-3.5 w-3.5" />
              Xem trước
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-black px-4 text-[13px] font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Lưu mẫu
            </button>
            <button
              type="button"
              onClick={() => { setEditingTemplate(null); setIsNew(false); }}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-[#eaeaea] bg-white px-4 text-[13px] font-medium text-gray-500 hover:text-black hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Hủy
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
            <Field label="Tên mẫu" required>
              <input
                value={editingTemplate.name}
                onChange={(event) => setEditingTemplate({ ...editingTemplate, name: event.target.value })}
                className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-0 transition-colors"
                placeholder="VD: Xác nhận đơn hàng"
              />
            </Field>
            <Field label="Mã Code (Dùng trong API)" required>
              <input
                value={editingTemplate.code}
                onChange={(event) => setEditingTemplate({ ...editingTemplate, code: event.target.value.toUpperCase().replace(/\s+/g, '_') })}
                className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] font-mono bg-gray-50 focus:border-black focus:outline-none focus:ring-0 transition-colors"
                placeholder="VD: SEND_ORDER_CONFIRM"
                disabled={!isNew}
              />
            </Field>
          </div>

          <div className="mb-6">
            <Field label="Tiêu đề email" required>
              <input
                value={editingTemplate.subject}
                onChange={(event) => setEditingTemplate({ ...editingTemplate, subject: event.target.value })}
                className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-0 transition-colors"
                placeholder="VD: Xác nhận đơn hàng {{order_id}}"
              />
            </Field>
          </div>

          <div className="mb-6">
            <Field label="Biến hỗ trợ (Cách nhau bằng dấu phẩy)">
              <input
                value={editingTemplate.variables.join(", ")}
                onChange={(event) => setEditingTemplate({ ...editingTemplate, variables: event.target.value.split(",").map(v => v.trim()).filter(Boolean) })}
                className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-0 transition-colors"
                placeholder="VD: order_id, customer_name, total_amount"
              />
            </Field>
          </div>

          {editingTemplate.variables.length > 0 && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h4 className="mb-3 text-[13px] font-medium text-gray-700 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Có thể sử dụng trong Tiêu đề hoặc Nội dung:
              </h4>
              <div className="flex flex-wrap gap-2">
                {editingTemplate.variables.map((variable) => (
                  <span key={variable} className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-mono text-gray-600">
                    {`{{${variable}}}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <Field label="Nội dung HTML">
              <textarea
                rows={16}
                value={editingTemplate.body}
                onChange={(event) => setEditingTemplate({ ...editingTemplate, body: event.target.value })}
                className="w-full rounded-md border border-[#eaeaea] px-4 py-3 text-[14px] font-mono leading-relaxed focus:border-black focus:outline-none focus:ring-0 transition-colors"
                placeholder="<div>Xin chào {{customer_name}},</div>"
              />
            </Field>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 h-full bg-white font-sans overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <EmailSettingsNav />
        <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden animate-in fade-in duration-300">
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-[20px] font-medium tracking-tight text-black">Mẫu Email</h3>
                <p className="mt-2 text-[14px] text-gray-500">
                  Quản lý giao diện chung và các mẫu email tự động của hệ thống.
                </p>
              </div>

            <div className="flex items-center gap-2">
              <button
              type="button"
              onClick={() => {
                setIsNew(true);
                setEditingTemplate({
                  id: "",
                  name: "",
                  code: "",
                  subject: "",
                  body: "",
                  variables: [],
                  isActive: true,
                });
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-black px-6 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              Tạo mẫu mới
              </button>
            </div>
        </div>

        <div className="border-b border-[#eaeaea] mb-2" />
        <div>
            {templates.length ? (
            <div className="divide-y divide-[#eaeaea]">
              {visibleTemplates.map((template) => (
                <div key={template.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-[14px] font-medium text-black">{template.name}</h4>
                      {template.isActive === false ? <StatusPill status="SKIPPED" /> : <StatusPill status="ACTIVE" />}
                    </div>
                    <p className="truncate text-[13px] text-gray-500">{template.subject}</p>
                  </div>

                  <div className="flex items-center gap-4 pt-2 md:pt-0">
                    <label className="flex cursor-pointer items-center gap-2">
                      <span className="text-[13px] font-medium text-gray-600">Bật gửi</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={template.isActive}
                          onChange={() => handleToggleActive(template.id, template.isActive ?? true)}
                          disabled={isPending}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
                      </div>
                    </label>

                    <div className="w-px h-5 bg-gray-200 hidden md:block"></div>

                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(template)}
                      className="text-gray-400 hover:text-black transition-colors"
                      title="Xem trước"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsNew(false);
                        setEditingTemplate({ ...template });
                      }}
                      className="inline-flex h-8 items-center justify-center rounded-md border border-[#eaeaea] bg-white px-3 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors"
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-[14px] text-gray-500">
              Chưa có mẫu email nào. Nhấn &quot;Tạo mẫu mới&quot; để bắt đầu.
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#eaeaea] py-4">
                <p className="text-[13px] text-gray-500">
                  Trang {safePage}/{totalPages} · {templates.length} mẫu
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={safePage === 1}
                    className="inline-flex h-8 items-center gap-1 rounded-md border border-[#eaeaea] px-3 text-[13px] text-black hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 min-w-8 rounded-md px-2 text-[13px] ${safePage === page ? "bg-black text-white" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={safePage === totalPages}
                    className="inline-flex h-8 items-center gap-1 rounded-md border border-[#eaeaea] px-3 text-[13px] text-black hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Sau
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
    </div>

      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setPreviewTemplate(null)}></div>
          <div className="relative flex w-full max-w-3xl max-h-[90vh] flex-col rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#eaeaea] px-6 py-4 bg-white">
              <div>
                <h3 className="text-[16px] font-medium text-black">Xem trước: {previewTemplate.name}</h3>
                <p className="text-[13px] text-gray-500 mt-1">Chủ đề: {previewTemplate.subject}</p>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="rounded-full p-2 hover:bg-gray-100 text-gray-500 hover:text-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-[#f6f8fa] p-0 sm:p-8">
              <div
                className="mx-auto max-w-2xl overflow-hidden"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
