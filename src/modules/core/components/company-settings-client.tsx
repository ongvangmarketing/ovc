"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Save, Upload, X } from "lucide-react";

import { updateCompanySettings } from "@/app/actions/settings";
import { cn } from "@/lib/utils/cn";

type SettingsMap = Record<string, string>;

export function CompanySettingsClient({ initialSettings }: { initialSettings: SettingsMap }) {
  const router = useRouter();
  const [settings, setSettings] = useState({
    company_workspace_name: initialSettings.company_workspace_name || initialSettings.company_name || "",
    company_name: initialSettings.company_name || "",
    company_logo_url: initialSettings.company_logo_url || "",
    company_favicon_url: initialSettings.company_favicon_url || "",
    company_tax_code: initialSettings.company_tax_code || "",
    company_address: initialSettings.company_address || "",
    company_representative: initialSettings.company_representative || "",
    company_function: initialSettings.company_function || "",
    company_email: initialSettings.company_email || "",
    company_website: initialSettings.company_website || "",
    company_hotline: initialSettings.company_hotline || "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      Object.entries(settings).forEach(([key, value]) => formData.set(key, value));
      if (logoFile) formData.set("company_logo_file", logoFile);
      if (faviconFile) formData.set("company_favicon_file", faviconFile);
      const result = await updateCompanySettings(formData);
      setSettings((current) => {
        const next = { ...current };
        Object.entries(result.settings).forEach(([key, value]) => {
          if (key in next) next[key as keyof typeof next] = value || "";
        });
        return next;
      });
      setLogoFile(null);
      setFaviconFile(null);
      alert("Đã lưu cài đặt công ty.");
      router.refresh();
    } catch (error) {
      alert(`Lỗi: ${error instanceof Error ? error.message : "Không thể lưu cài đặt công ty"}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="quote-page mx-auto max-w-[1440px] px-6 py-6">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
            <Building2 className="h-4 w-4 text-orange-500" />
            Cài đặt / Công ty
          </div>
          <h1 className="text-[14px] font-light text-slate-950">Cài đặt công ty</h1>
        </div>

        <div className="quote-form-actions">
          <button type="button" onClick={() => router.back()} className="quote-action-button quote-action-secondary">
            Quay lại
          </button>
          <button type="button" onClick={save} disabled={isSaving} className="quote-action-button quote-action-primary">
            <Save className="h-4 w-4" />
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <section className="quote-panel">
          <div className="quote-panel-header">
            <h2>Nhận diện thương hiệu</h2>
            <span>Logo dùng cho email/tài liệu, favicon dùng cho homepage.</span>
          </div>

          <div className="quote-upload-grid">
            <BrandUpload
              label="Logo"
              hint="PNG, JPG, SVG, WEBP. Tối đa 2MB."
              value={settings.company_logo_url}
              file={logoFile}
              onUrlChange={(value) => setSettings({ ...settings, company_logo_url: value })}
              onFileChange={setLogoFile}
              inputName="company-logo"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
            />
            <BrandUpload
              label="Favicon"
              hint="PNG, ICO, SVG, WEBP. Tối đa 2MB."
              value={settings.company_favicon_url}
              file={faviconFile}
              onUrlChange={(value) => setSettings({ ...settings, company_favicon_url: value })}
              onFileChange={setFaviconFile}
              inputName="company-favicon"
              accept="image/*,.ico"
              compact
            />
          </div>
        </section>

        <section className="quote-panel">
          <div className="quote-panel-header">
            <h2>Thông tin công ty</h2>
            <span>Các trường này được dùng làm biến trong mẫu email và tài liệu.</span>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Tên workspace">
              <input value={settings.company_workspace_name} onChange={(event) => setSettings({ ...settings, company_workspace_name: event.target.value })} className="quote-input" placeholder="OngVàng Customer Portal" />
            </Field>
            <Field label="Thông tin công ty">
              <input value={settings.company_name} onChange={(event) => setSettings({ ...settings, company_name: event.target.value })} className="quote-input" placeholder="Ong Vàng Workspace" />
            </Field>
            <Field label="Mã số thuế">
              <input value={settings.company_tax_code} onChange={(event) => setSettings({ ...settings, company_tax_code: event.target.value })} className="quote-input" placeholder="0312345678" />
            </Field>
            <Field label="Người đại diện">
              <input value={settings.company_representative} onChange={(event) => setSettings({ ...settings, company_representative: event.target.value })} className="quote-input" placeholder="Nguyễn Văn A" />
            </Field>
            <Field label="Chức năng">
              <input value={settings.company_function} onChange={(event) => setSettings({ ...settings, company_function: event.target.value })} className="quote-input" placeholder="Tư vấn, triển khai và vận hành truyền thông" />
            </Field>
            <Field label="Email">
              <input type="email" value={settings.company_email} onChange={(event) => setSettings({ ...settings, company_email: event.target.value })} className="quote-input" placeholder="info@ovc.vn" />
            </Field>
            <Field label="Website">
              <input value={settings.company_website} onChange={(event) => setSettings({ ...settings, company_website: event.target.value })} className="quote-input" placeholder="https://ovc.vn" />
            </Field>
            <Field label="Hotline">
              <input value={settings.company_hotline} onChange={(event) => setSettings({ ...settings, company_hotline: event.target.value })} className="quote-input" placeholder="0900 000 000" />
            </Field>
            <Field label="Địa chỉ">
              <input value={settings.company_address} onChange={(event) => setSettings({ ...settings, company_address: event.target.value })} className="quote-input" placeholder="Số nhà, phường/xã, tỉnh/thành" />
            </Field>
          </div>
        </section>

        <section className="quote-panel">
          <div className="quote-panel-header">
            <h2>Biến email khả dụng</h2>
            <span>Dùng trong tiêu đề hoặc nội dung HTML của mẫu email.</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {["company_workspace_name", "company_name", "company_logo", "company_favicon", "company_tax_code", "company_address", "company_representative", "company_function", "company_email", "company_website", "company_hotline"].map((variable) => (
              <span key={variable} className="rounded-lg border border-orange-100 bg-orange-50 px-2 py-1 text-sm font-light text-orange-700">
                {`{{${variable}}}`}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[15px] font-light text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function BrandUpload({
  label,
  hint,
  value,
  file,
  inputName,
  accept,
  onUrlChange,
  onFileChange,
  compact = false,
}: {
  label: string;
  hint: string;
  value: string;
  file: File | null;
  inputName: string;
  accept: string;
  onUrlChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  compact?: boolean;
}) {
  const previewUrl = file ? URL.createObjectURL(file) : value;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
      <label className="flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-slate-200 bg-white p-4 transition hover:border-orange-200 hover:bg-orange-50/40">
        <input id={inputName} type="file" accept={accept} className="sr-only" onChange={(event) => onFileChange(event.target.files?.[0] ?? null)} />
        <span
          className={cn(
            "grid shrink-0 place-items-center rounded-lg border border-slate-200 bg-white bg-contain bg-center bg-no-repeat text-slate-400",
            compact ? "h-14 w-14" : "h-16 w-24"
          )}
          style={previewUrl ? { backgroundImage: `url(${previewUrl})` } : undefined}
        >
          {!previewUrl ? <Upload className="h-5 w-5" /> : null}
        </span>
        <span className="min-w-0 flex-1">
          <strong className="block text-[15px] font-light text-slate-950">{label}</strong>
          <small className="mt-1 block text-[13px] font-light text-slate-500">{file ? `${file.name} · ${formatFileSize(file.size)}` : previewUrl ? "Đã có ảnh, bấm để đổi" : hint}</small>
        </span>
        <span className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-light text-slate-700">
          <Upload className="h-4 w-4" />
          Đổi ảnh
        </span>
      </label>

      {file ? (
        <button type="button" onClick={() => onFileChange(null)} className="mt-2 inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-light text-slate-600 hover:bg-slate-950 hover:text-white">
          <X className="h-4 w-4" />
          Gỡ file mới chọn
        </button>
      ) : null}

      {value && !file ? (
        <button type="button" onClick={() => onUrlChange("")} className="mt-2 inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-light text-slate-600 hover:bg-slate-950 hover:text-white">
          <X className="h-4 w-4" />
          Xóa ảnh hiện tại
        </button>
      ) : null}
    </div>
  );
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  if (size >= 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${size} B`;
}
