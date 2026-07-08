"use client";

import React, { useState, useTransition } from "react";
import { updateSettings } from "@/app/actions/settings";
import { toast } from "sonner";
import { Settings, CheckCircle2, LayoutTemplate, FileText, Save } from "lucide-react";

type CodeFormat = {
  prefix: string;
  dateFormat: string;
  counterLength: number;
};

const defaultCodeFormat: CodeFormat = { prefix: "", dateFormat: "", counterLength: 3 };

function normalizeCodeFormat(value: unknown): CodeFormat {
  if (typeof value === "string") {
    try {
      return normalizeCodeFormat(JSON.parse(value));
    } catch {
      return defaultCodeFormat;
    }
  }

  if (!value || typeof value !== "object") {
    return defaultCodeFormat;
  }

  const format = value as Partial<CodeFormat>;
  return {
    prefix: typeof format.prefix === "string" ? format.prefix : "",
    dateFormat: typeof format.dateFormat === "string" ? format.dateFormat : "",
    counterLength: Number(format.counterLength) || 3,
  };
}

type FinanceSettingsState = Record<string, unknown> & {
  FORMAT_QUOTE: CodeFormat;
  FORMAT_CONTRACT: CodeFormat;
  FORMAT_INVOICE: CodeFormat;
  FORMAT_RECEIPT: CodeFormat;
};

function normalizeFinanceSettings(initialSettings: Record<string, unknown>): FinanceSettingsState {
  return {
    ...initialSettings,
    FORMAT_QUOTE: normalizeCodeFormat(initialSettings.FORMAT_QUOTE),
    FORMAT_CONTRACT: normalizeCodeFormat(initialSettings.FORMAT_CONTRACT),
    FORMAT_INVOICE: normalizeCodeFormat(initialSettings.FORMAT_INVOICE),
    FORMAT_RECEIPT: normalizeCodeFormat(initialSettings.FORMAT_RECEIPT),
  };
}

function previewCode(format: CodeFormat) {
  let datePart = "";
  const now = new Date();
  if (format.dateFormat === "YYYY") datePart = now.getFullYear().toString();
  if (format.dateFormat === "MMYYYY") datePart = (now.getMonth() + 1).toString().padStart(2, "0") + now.getFullYear().toString();
  if (format.dateFormat === "DDMMYYYY") datePart = now.getDate().toString().padStart(2, "0") + (now.getMonth() + 1).toString().padStart(2, "0") + now.getFullYear().toString();

  const counterPart = "1".padStart(format.counterLength, "0");

  return `${format.prefix}${datePart ? datePart + "-" : ""}${counterPart}`;
}

function FormatBuilder({
  label,
  value,
  onChange,
}: {
  label: string;
  value: CodeFormat;
  onChange: (field: keyof CodeFormat, value: string | number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-colors">
      <div className="flex justify-between items-center mb-1">
        <label className="text-[13px] font-medium text-slate-800 uppercase tracking-wide">{label}</label>
        <div className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">
          Mẫu: <span className="font-medium text-slate-800">{previewCode(value)}</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-4 flex flex-col gap-1.5">
           <span className="text-sm font-medium text-slate-700">Tiền tố</span>
           <input
             type="text"
             className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 uppercase"
             value={value.prefix}
             onChange={(e) => onChange("prefix", e.target.value.toUpperCase())}
             placeholder="Tiền tố..."
           />
        </div>
        <div className="col-span-12 md:col-span-4 flex flex-col gap-1.5">
           <span className="text-sm font-medium text-slate-700">Định dạng Ngày</span>
           <select
             className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
             value={value.dateFormat}
             onChange={(e) => onChange("dateFormat", e.target.value)}
           >
              <option value="">Không dùng</option>
              <option value="YYYY">Năm (YYYY)</option>
              <option value="MMYYYY">Tháng-Năm (MMYYYY)</option>
              <option value="DDMMYYYY">Ngày-Tháng-Năm</option>
           </select>
        </div>
        <div className="col-span-12 md:col-span-4 flex flex-col gap-1.5">
           <span className="text-sm font-medium text-slate-700">Số tự động</span>
           <select
             className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
             value={value.counterLength}
             onChange={(e) => onChange("counterLength", parseInt(e.target.value))}
           >
              <option value={2}>2 chữ số (01)</option>
              <option value={3}>3 chữ số (001)</option>
              <option value={4}>4 chữ số (0001)</option>
              <option value={5}>5 chữ số (00001)</option>
              <option value={6}>6 chữ số (000001)</option>
           </select>
        </div>
      </div>
    </div>
  );
}

export function FinanceSettingsClient({ initialSettings }: { initialSettings: any }) {
  const [settings, setSettings] = useState<FinanceSettingsState>(() => normalizeFinanceSettings(initialSettings));
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        const stringifiedSettings: Record<string, string> = {};
        for (const [k, v] of Object.entries(settings)) {
          if (typeof v === "object") {
            stringifiedSettings[k] = JSON.stringify(v);
          } else {
            stringifiedSettings[k] = v as string;
          }
        }
        await updateSettings(stringifiedSettings);
        toast.success("Cập nhật cấu hình Tài chính thành công!");
      } catch (error: any) {
        toast.error(error.message || "Lỗi khi lưu cấu hình");
      }
    });
  };

  const updateFormat = (keyName: keyof typeof settings, field: keyof CodeFormat, value: string | number) => {
    setSettings((prev: any) => ({
      ...prev,
      [keyName]: {
        ...prev[keyName],
        [field]: value
      }
    }));
  };

  const templates = [
    {
      id: "A4",
      name: "Mẫu A4 Truyền thống",
      description: "Giao diện báo giá và hợp đồng định dạng A4 chuẩn, phù hợp để in ấn và xuất PDF truyền thống.",
      icon: <FileText className="h-6 w-6 text-slate-500" />
    },
    {
      id: "MODERN",
      name: "Mẫu Hiện đại (Interactive)",
      description: "Giao diện web hiện đại, đẹp mắt với màu sắc và bố cục tối ưu trải nghiệm trên thiết bị điện tử.",
      icon: <LayoutTemplate className="h-6 w-6 text-indigo-500" />
    }
  ];

  return (
    <div className="flex-1 h-full overflow-y-auto">
      <div className="quote-page mx-auto max-w-[1440px] px-6 py-6 animate-in fade-in duration-300">
        
        {/* Page Header */}
        <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
              <Settings className="h-4 w-4 text-orange-500" />
              Tài chính / Cấu hình
            </div>
            <h1 className="text-[14px] font-light text-slate-950">Quản lý cài đặt Báo giá, Hợp đồng, Hóa đơn và giao diện hiển thị tài liệu.</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave}
              disabled={isPending}
              className="quote-action-button quote-action-primary"
            >
              <Save className="h-4 w-4 mr-1.5" />
              {isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        {/* Panel Cấu hình Mẫu */}
        <div className="space-y-6">
          <section className="quote-panel">
            <div className="quote-panel-header">
              <h2>Mẫu Báo giá / Hợp đồng / Hóa đơn mặc định</h2>
              <span>Chọn giao diện khi khách hàng click vào link xem tài liệu (Báo giá, Hợp đồng, Hóa đơn).</span>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              {templates.map((template) => {
                const isSelected = (settings.FINANCE_DOCUMENT_TEMPLATE || "A4") === template.id;
                
                return (
                  <div 
                    key={template.id}
                    onClick={() => setSettings({ ...settings, FINANCE_DOCUMENT_TEMPLATE: template.id })}
                    className={`relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                      isSelected 
                        ? "border-orange-500 bg-orange-50/50 shadow-md ring-1 ring-orange-500" 
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isSelected ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
                          {template.icon}
                        </div>
                        <div>
                          <h3 className={`font-medium ${isSelected ? 'text-orange-900' : 'text-slate-900'}`}>
                            {template.name}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-slate-300'}`}>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Panel Cấu hình Mã tự động */}
          <section className="quote-panel">
            <div className="quote-panel-header">
              <h2>Cài đặt sinh mã tự động</h2>
              <span>Thiết lập quy tắc sinh mã tự động (ID) cho các chứng từ Tài chính.</span>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mt-4">
              <FormatBuilder label="Mã Báo giá (Quotation)" value={settings.FORMAT_QUOTE} onChange={(field, value) => updateFormat("FORMAT_QUOTE", field, value)} />
              <FormatBuilder label="Mã Hợp đồng (Contract)" value={settings.FORMAT_CONTRACT} onChange={(field, value) => updateFormat("FORMAT_CONTRACT", field, value)} />
              <FormatBuilder label="Mã Hóa đơn (Invoice)" value={settings.FORMAT_INVOICE} onChange={(field, value) => updateFormat("FORMAT_INVOICE", field, value)} />
              <FormatBuilder label="Mã Phiếu thu (Receipt)" value={settings.FORMAT_RECEIPT} onChange={(field, value) => updateFormat("FORMAT_RECEIPT", field, value)} />
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
