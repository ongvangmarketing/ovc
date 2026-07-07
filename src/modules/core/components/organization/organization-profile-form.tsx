"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { updateOrganizationProfile } from "@/app/actions/organizations";
import { cn } from "@/lib/utils/cn";

export function OrganizationProfileForm({ initialProfile, initialBrand }: { initialProfile: any, initialBrand: any }) {
  const router = useRouter();
  const [settings, setSettings] = useState({
    company_workspace_name: initialBrand?.name || "",
    company_name: initialBrand?.name || "",
    company_logo_url: initialProfile?.logo || initialBrand?.logo || "",
    company_favicon_url: initialProfile?.favicon || "",
    company_tax_code: initialProfile?.businessLicense || "",
    company_address: initialProfile?.address || "",
    company_representative: initialProfile?.representativeName || "",
    company_function: initialProfile?.slogan || "",
    company_email: initialProfile?.representativeEmail || "",
    company_website: initialBrand?.website || "",
    company_hotline: initialProfile?.representativePhone || "",
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
      
      await updateOrganizationProfile(formData);
      
      setLogoFile(null);
      setFaviconFile(null);
      alert("Đã cập nhật Hồ sơ doanh nghiệp thành công.");
      router.refresh();
    } catch (error) {
      alert(`Lỗi: ${error instanceof Error ? error.message : "Không thể cập nhật hồ sơ"}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Hồ sơ chung</h2>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý thông tin định danh của tổ chức, phục vụ cho các tài liệu và hóa đơn.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>

      <div className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900">Nhận diện thương hiệu</h3>
            <p className="text-sm text-slate-500">Logo dùng cho hệ thống và các mẫu email gửi đi.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
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

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900">Thông tin pháp lý & Liên hệ</h3>
            <p className="text-sm text-slate-500">
              Các trường này sẽ được dùng làm biến <span className="font-mono bg-slate-100 px-1 rounded">{"{{company_name}}"}</span> trong email và văn bản.
            </p>
          </div>
          
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Tên công ty (Pháp nhân)">
              <input value={settings.company_name} onChange={(e) => setSettings({ ...settings, company_name: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="Ong Vàng Workspace" />
            </Field>
            <Field label="Tên ngắn (Workspace)">
              <input value={settings.company_workspace_name} onChange={(e) => setSettings({ ...settings, company_workspace_name: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="OVC" />
            </Field>
            <Field label="Mã số thuế">
              <input value={settings.company_tax_code} onChange={(e) => setSettings({ ...settings, company_tax_code: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="0312345678" />
            </Field>
            <Field label="Người đại diện">
              <input value={settings.company_representative} onChange={(e) => setSettings({ ...settings, company_representative: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="Nguyễn Văn A" />
            </Field>
            <Field label="Ngành nghề / Slogan">
              <input value={settings.company_function} onChange={(e) => setSettings({ ...settings, company_function: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="Tư vấn, triển khai và vận hành..." />
            </Field>
            <Field label="Email liên hệ">
              <input type="email" value={settings.company_email} onChange={(e) => setSettings({ ...settings, company_email: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="info@ovc.vn" />
            </Field>
            <Field label="Website">
              <input value={settings.company_website} onChange={(e) => setSettings({ ...settings, company_website: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="https://ovc.vn" />
            </Field>
            <Field label="Hotline">
              <input value={settings.company_hotline} onChange={(e) => setSettings({ ...settings, company_hotline: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="0900 000 000" />
            </Field>
            <div className="md:col-span-2">
              <Field label="Địa chỉ trụ sở">
                <input value={settings.company_address} onChange={(e) => setSettings({ ...settings, company_address: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" />
              </Field>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
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
    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
      <p className="mb-1 font-medium text-slate-900">{label}</p>
      <p className="mb-3 text-xs text-slate-500">{hint}</p>
      
      <label className="flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-slate-300 bg-white p-4 transition hover:border-orange-300 hover:bg-orange-50/40">
        <input id={inputName} type="file" accept={accept} className="sr-only" onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} />
        <span
          className={cn(
            "grid shrink-0 place-items-center rounded-lg border border-slate-200 bg-white bg-contain bg-center bg-no-repeat text-slate-400 shadow-sm",
            compact ? "h-14 w-14" : "h-16 w-24"
          )}
          style={previewUrl ? { backgroundImage: `url(${previewUrl})` } : undefined}
        >
          {!previewUrl && "Trống"}
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-orange-600">Chọn file ảnh</span>
          <span className="text-xs text-slate-400">hoặc kéo thả vào đây</span>
        </div>
      </label>
      
      <div className="mt-3">
        <input
          value={value}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="Hoặc dán link ảnh URL vào đây..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
      </div>
    </div>
  );
}
