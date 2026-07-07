"use client";

import { useState, useTransition, useMemo } from "react";
import { Plus, Save, Mail, Code, Loader2, Eye, X } from "lucide-react";
import { updateEmailTemplate, createEmailTemplate, toggleEmailTemplateActive, sendTestEmailTemplate } from "@/app/actions/email-templates";
import { cn } from "@/lib/utils/cn";

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
  
  const [testEmail, setTestEmail] = useState("");
  const [isPending, startTransition] = useTransition();

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
      } catch (err: any) {
        alert(err.message || "Đã xảy ra lỗi khi lưu.");
      }
    });
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    startTransition(async () => {
      try {
        await toggleEmailTemplateActive(id, !currentActive);
      } catch (err: any) {
        alert(err.message || "Đã xảy ra lỗi khi bật/tắt mẫu.");
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
      } catch (err: any) {
        alert(err.message || "Đã xảy ra lỗi khi gửi test.");
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

    return html;
  }, [previewTemplate, settings]);

  if (editingTemplate) {
    return (
      <div className="quote-page mx-auto max-w-[1440px] px-6 py-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
              <Mail className="h-4 w-4 text-orange-500" />
              Cài đặt / Mẫu Email
            </div>
            <h1 className="text-[14px] font-light text-slate-950">
              {isNew ? "Thêm mẫu Email mới" : editingTemplate.name}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {!isNew && (
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="Nhập email test..."
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="quote-input h-9 py-0"
                />
                <button
                  type="button"
                  onClick={handleSendTest}
                  disabled={isPending || !testEmail}
                  className="quote-action-button quote-action-secondary h-9"
                >
                  <Mail className="h-4 w-4" />
                  Gửi Test
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => setPreviewTemplate(editingTemplate)}
              className="quote-action-button quote-action-secondary h-9"
            >
              <Eye className="h-4 w-4" />
              Xem trước
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="quote-action-button quote-action-primary h-9"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Lưu mẫu
            </button>
            <button type="button" onClick={() => { setEditingTemplate(null); setIsNew(false); }} className="quote-action-button quote-action-secondary h-9">
              Quay lại
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <section className="quote-panel">
            <div className="quote-panel-header">
              <h2>Thông tin mẫu</h2>
              <span>{editingTemplate.code || "Nhập mã code để xác định luồng gửi"}</span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[15px] font-light text-slate-700">Tên mẫu <span className="text-red-500">*</span></span>
              <input 
                value={editingTemplate.name} 
                onChange={(event) => setEditingTemplate({ ...editingTemplate, name: event.target.value })} 
                className="quote-input" 
                placeholder="VD: Xác nhận đơn hàng"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[15px] font-light text-slate-700">Mã Code (Dùng trong API) <span className="text-red-500">*</span></span>
              <input 
                value={editingTemplate.code} 
                onChange={(event) => setEditingTemplate({ ...editingTemplate, code: event.target.value.toUpperCase().replace(/\s+/g, '_') })} 
                className="quote-input font-mono bg-slate-50" 
                placeholder="VD: SEND_ORDER_CONFIRM"
                disabled={!isNew}
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-[15px] font-light text-slate-700">Tiêu đề email <span className="text-red-500">*</span></span>
            <input 
              value={editingTemplate.subject} 
              onChange={(event) => setEditingTemplate({ ...editingTemplate, subject: event.target.value })} 
              className="quote-input" 
              placeholder="VD: Xác nhận đơn hàng {{order_id}}"
            />
          </label>
          
          <label className="block">
            <span className="mb-1.5 block text-[15px] font-light text-slate-700">Biến hỗ trợ (Cách nhau bằng dấu phẩy)</span>
            <input 
              value={editingTemplate.variables.join(", ")} 
              onChange={(event) => setEditingTemplate({ ...editingTemplate, variables: event.target.value.split(",").map(v => v.trim()).filter(Boolean) })} 
              className="quote-input" 
              placeholder="VD: order_id, customer_name, total_amount"
            />
          </label>

          {editingTemplate.variables.length > 0 && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <h4 className="mb-2 text-sm font-bold text-blue-900 flex items-center gap-2"><Code className="w-4 h-4" /> Có thể sử dụng trong Tiêu đề hoặc Nội dung:</h4>
              <div className="flex flex-wrap gap-2">
                {editingTemplate.variables.map((variable) => (
                  <span key={variable} className="rounded-md border border-blue-200 bg-white px-2 py-1 text-xs font-mono font-bold text-blue-700">
                    {`{{${variable}}}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          <label className="block">
            <span className="mb-1.5 block text-[15px] font-light text-slate-700">Nội dung HTML</span>
            <textarea 
              rows={16} 
              value={editingTemplate.body} 
              onChange={(event) => setEditingTemplate({ ...editingTemplate, body: event.target.value })} 
              className="quote-input font-mono text-sm leading-relaxed" 
              placeholder="<div>Xin chào {{customer_name}},</div>"
            />
          </label>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="quote-page mx-auto max-w-[1440px] px-6 py-6 animate-in fade-in duration-300">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
            <Mail className="h-4 w-4 text-orange-500" />
            Cài đặt / Hệ thống
          </div>
          <h1 className="text-[14px] font-light text-slate-950">Mẫu Email</h1>
        </div>
        
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
          className="quote-action-button quote-action-primary"
        >
          <Plus className="h-4 w-4" />
          Tạo mới
        </button>
      </div>

      <div className="space-y-5">
        <section className="quote-panel">
          <div className="quote-panel-header">
            <h2>Quản lý mẫu Email</h2>
            <span>Quản lý tất cả các mẫu email hệ thống. Bạn có thể tạo thêm mẫu để sử dụng qua API.</span>
          </div>
          
          <div className="grid gap-4">
        {templates.map((template) => (
          <div key={template.id} className="grid gap-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors p-4 md:grid-cols-[1fr_auto] md:items-center shadow-sm">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-[15px] font-medium text-slate-900">{template.name}</h4>
                {template.isActive === false ? <StatusPill status="SKIPPED" /> : <StatusPill status="ACTIVE" />}
              </div>
              <div className="mt-1 flex items-center gap-2 text-[13px] font-light text-slate-500">
                <Code className="w-4 h-4" />
                <span className="truncate">{template.code}</span>
              </div>
              <p className="mt-2 truncate text-[14px] font-light text-slate-600">{template.subject}</p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <label className="flex cursor-pointer items-center gap-2">
                <span className="text-sm font-bold text-slate-600">Bật gửi</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={template.isActive}
                    onChange={() => handleToggleActive(template.id, template.isActive ?? true)}
                    disabled={isPending}
                  />
                  <div className={cn("block h-6 w-10 rounded-full transition-colors", template.isActive ? "bg-orange-500" : "bg-slate-200")}></div>
                  <div className={cn("absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform", template.isActive ? "translate-x-4" : "")}></div>
                </div>
              </label>

              <div className="w-px h-8 bg-slate-200 mx-2 hidden md:block"></div>

              <button
                type="button"
                onClick={() => setPreviewTemplate(template)}
                className="quote-action-button quote-action-secondary h-9 w-9 p-0 flex items-center justify-center"
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
                className="quote-action-button quote-action-secondary h-9"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        ))}

        {templates.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-light text-slate-500">
            Chưa có mẫu email nào. Nhấn "Tạo mới" để bắt đầu.
          </div>
        )}
          </div>
        </section>
      </div>

      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setPreviewTemplate(null)}></div>
          <div className="relative flex w-full max-w-3xl max-h-[90vh] flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Xem trước: {previewTemplate.name}</h3>
                <p className="text-sm font-medium text-slate-500">Chủ đề: {previewTemplate.subject}</p>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="rounded-full p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 rounded-b-2xl">
              <div 
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mx-auto max-w-2xl"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
