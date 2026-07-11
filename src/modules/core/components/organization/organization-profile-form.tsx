"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { updateOrganizationProfile } from "@/actions/organizations";
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 mb-8">
      
      <section className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
        <div className="p-8">
          <h3 className="text-[20px] font-medium tracking-tight text-black mb-1">Nhận diện thương hiệu</h3>
          <p className="text-[14px] text-gray-500 mb-6">Logo dùng cho hệ thống và các mẫu email gửi đi.</p>

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
        </div>
      </section>

      <section className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
        <div className="p-8">
          <h3 className="text-[20px] font-medium tracking-tight text-black mb-1">Thông tin pháp lý & Liên hệ</h3>
          <p className="text-[14px] text-gray-500 mb-6">
            Thông tin định danh của tổ chức, phục vụ cho các tài liệu và xuất hóa đơn.
          </p>
          
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Tên công ty (Pháp nhân)">
              <input value={settings.company_name} onChange={(e) => setSettings({ ...settings, company_name: e.target.value })} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-0 transition-colors" placeholder="Ong Vàng Workspace" />
            </Field>
            <Field label="Tên ngắn (Workspace)">
              <input value={settings.company_workspace_name} onChange={(e) => setSettings({ ...settings, company_workspace_name: e.target.value })} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-0 transition-colors" placeholder="OVC" />
            </Field>
            <Field label="Mã số thuế">
              <input value={settings.company_tax_code} onChange={(e) => setSettings({ ...settings, company_tax_code: e.target.value })} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-0 transition-colors" placeholder="0312345678" />
            </Field>
            <Field label="Người đại diện">
              <input value={settings.company_representative} onChange={(e) => setSettings({ ...settings, company_representative: e.target.value })} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-0 transition-colors" placeholder="Nguyễn Văn A" />
            </Field>
            <Field label="Ngành nghề / Slogan">
              <input value={settings.company_function} onChange={(e) => setSettings({ ...settings, company_function: e.target.value })} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-0 transition-colors" placeholder="Tư vấn, triển khai và vận hành..." />
            </Field>
            <Field label="Email liên hệ">
              <input type="email" value={settings.company_email} onChange={(e) => setSettings({ ...settings, company_email: e.target.value })} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-0 transition-colors" placeholder="info@ovc.vn" />
            </Field>
            <Field label="Website">
              <input value={settings.company_website} onChange={(e) => setSettings({ ...settings, company_website: e.target.value })} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-0 transition-colors" placeholder="https://ovc.vn" />
            </Field>
            <Field label="Hotline">
              <input value={settings.company_hotline} onChange={(e) => setSettings({ ...settings, company_hotline: e.target.value })} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-0 transition-colors" placeholder="0900 000 000" />
            </Field>
            <div className="md:col-span-2">
              <Field label="Địa chỉ trụ sở">
                <input value={settings.company_address} onChange={(e) => setSettings({ ...settings, company_address: e.target.value })} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-0 transition-colors" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" />
              </Field>
            </div>
          </div>
        </div>

        <div className="bg-gray-50/50 border-t border-[#eaeaea] px-8 py-4 flex items-center justify-between">
          <p className="text-[14px] text-gray-500">Sử dụng thông tin chuẩn xác để xuất hóa đơn.</p>
          <button
            type="button"
            onClick={save}
            disabled={isSaving}
            className="flex items-center justify-center rounded-full bg-black px-6 py-2 text-[14px] font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </section>

    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[14px] font-medium text-black">{label}</span>
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
    <div className="rounded-xl border border-[#eaeaea] bg-white p-5">
      <p className="mb-1 text-[14px] font-medium text-black">{label}</p>
      <p className="mb-4 text-[13px] text-gray-500">{hint}</p>
      
      <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-[#eaeaea] bg-white p-4 transition hover:border-gray-300">
        <input id={inputName} type="file" accept={accept} className="sr-only" onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} />
        <span
          className={cn(
            "grid shrink-0 place-items-center rounded-md border border-[#eaeaea] bg-white bg-contain bg-center bg-no-repeat text-gray-400 shadow-none",
            compact ? "h-14 w-14" : "h-16 w-24"
          )}
          style={previewUrl ? { backgroundImage: `url(${previewUrl})` } : undefined}
        >
          {!previewUrl && "Trống"}
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-[14px] font-medium text-black">Chọn file ảnh</span>
          <span className="text-[12px] text-gray-500">hoặc kéo thả vào đây</span>
        </div>
      </label>
      
    </div>
  );
}
