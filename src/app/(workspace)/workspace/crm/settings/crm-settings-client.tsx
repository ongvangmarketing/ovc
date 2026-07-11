"use client";

import React, { useState, useTransition } from "react";
import { updateSettings } from "@/actions/settings";
import { toast } from "sonner";
import { Settings, CheckCircle2, LayoutTemplate, FileText } from "lucide-react";

export interface CodeFormat {
  prefix: string;
  dateFormat: string;
  counterLength: number;
}

function parseFormat(value: string | undefined, defaultPrefix: string): CodeFormat {
  if (!value) return { prefix: defaultPrefix, dateFormat: "MMYYYY", counterLength: 4 };
  try {
    return JSON.parse(value);
  } catch (e) {
    return { prefix: defaultPrefix, dateFormat: "MMYYYY", counterLength: 4 };
  }
}

const previewCode = (format: CodeFormat) => {
  let datePart = "";
  const now = new Date();
  if (format.dateFormat === "YYYY") datePart = now.getFullYear().toString();
  if (format.dateFormat === "MMYYYY") datePart = (now.getMonth() + 1).toString().padStart(2, "0") + now.getFullYear().toString();
  if (format.dateFormat === "DDMMYYYY") datePart = now.getDate().toString().padStart(2, "0") + (now.getMonth() + 1).toString().padStart(2, "0") + now.getFullYear().toString();
  const counterPart = "1".padStart(format.counterLength, "0");
  return `${format.prefix}${datePart ? datePart + "-" : ""}${counterPart}`;
};

export function CrmSettingsClient({ initialSettings }: { initialSettings: any }) {
  const [settings, setSettings] = useState(() => ({
    ...initialSettings,
    FORMAT_CONTACT_PARSED: parseFormat(initialSettings.FORMAT_CONTACT, "KH-"),
  }));
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        const dataToSave = { ...settings };
        dataToSave.FORMAT_CONTACT = JSON.stringify(settings.FORMAT_CONTACT_PARSED);
        delete dataToSave.FORMAT_CONTACT_PARSED;
        
        await updateSettings(dataToSave);
        toast.success("Cập nhật cấu hình CRM thành công!");
      } catch (error: any) {
        toast.error(error.message || "Lỗi khi lưu cấu hình");
      }
    });
  };

  const updateFormat = (field: keyof CodeFormat, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      FORMAT_CONTACT_PARSED: {
        ...prev.FORMAT_CONTACT_PARSED,
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
        <div className="mb-8 flex flex-col gap-3 border-b border-[#eaeaea] pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[14px] font-medium text-gray-500 uppercase tracking-wide">
              CRM / Cấu hình
            </div>
            <h1 className="text-[24px] font-semibold text-black">Cấu hình CRM</h1>
            <p className="mt-1 text-[14px] text-gray-500">Quản lý cài đặt sinh mã tự động và giao diện hiển thị báo giá.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center justify-center gap-2 rounded-full bg-black px-5 py-2.5 text-[14px] font-medium text-white transition-all hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 whitespace-nowrap"
            >
              {isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        <div className="space-y-8 max-w-4xl">
          
          <section className="flex flex-col gap-4 p-6 bg-white border border-[#eaeaea] rounded-[12px] shadow-sm">
            <div className="border-b border-[#eaeaea] pb-4 mb-2">
              <h2 className="text-[16px] font-semibold text-black">Quy tắc sinh mã Khách hàng (Contact)</h2>
              <p className="text-[13px] text-gray-500 mt-1">Định dạng mã số tự động cho Khách hàng mới được tạo trong CRM.</p>
            </div>
            
            <div className="flex justify-between items-center bg-[#fafafa] border border-[#eaeaea] px-4 py-3 rounded-lg mb-2">
              <span className="text-[13px] font-medium text-gray-600">Xem trước kết quả:</span>
              <span className="text-[14px] font-mono font-bold text-black">{previewCode(settings.FORMAT_CONTACT_PARSED)}</span>
            </div>
            
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 md:col-span-4 flex flex-col gap-1.5">
                 <span className="text-[13px] font-medium text-gray-700">Tiền tố</span>
                 <input 
                   type="text" 
                   className="w-full rounded-[8px] border border-[#eaeaea] px-3 py-2.5 text-[14px] focus:border-black focus:outline-none focus:ring-1 focus:ring-black uppercase transition-colors bg-[#fafafa] hover:bg-white focus:bg-white"
                   value={settings.FORMAT_CONTACT_PARSED.prefix}
                   onChange={(e) => updateFormat("prefix", e.target.value.toUpperCase())}
                   placeholder="VD: KH-"
                 />
              </div>
              <div className="col-span-12 md:col-span-4 flex flex-col gap-1.5">
                 <span className="text-[13px] font-medium text-gray-700">Quy tắc Ngày</span>
                 <select 
                   className="w-full rounded-[8px] border border-[#eaeaea] px-3 py-2.5 text-[14px] focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-colors bg-[#fafafa] hover:bg-white focus:bg-white cursor-pointer"
                   value={settings.FORMAT_CONTACT_PARSED.dateFormat}
                   onChange={(e) => updateFormat("dateFormat", e.target.value)}
                 >
                    <option value="">Không dùng</option>
                    <option value="YYYY">Năm (YYYY)</option>
                    <option value="MMYYYY">Tháng-Năm (MMYYYY)</option>
                    <option value="DDMMYYYY">Ngày-Tháng-Năm</option>
                 </select>
              </div>
              <div className="col-span-12 md:col-span-4 flex flex-col gap-1.5">
                 <span className="text-[13px] font-medium text-gray-700">Số chữ số đếm</span>
                 <select 
                   className="w-full rounded-[8px] border border-[#eaeaea] px-3 py-2.5 text-[14px] focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-colors bg-[#fafafa] hover:bg-white focus:bg-white cursor-pointer"
                   value={settings.FORMAT_CONTACT_PARSED.counterLength}
                   onChange={(e) => updateFormat("counterLength", parseInt(e.target.value))}
                 >
                    <option value={3}>3 chữ số (001)</option>
                    <option value={4}>4 chữ số (0001)</option>
                    <option value={5}>5 chữ số (00001)</option>
                    <option value={6}>6 chữ số (000001)</option>
                 </select>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4 p-6 bg-white border border-[#eaeaea] rounded-[12px] shadow-sm">
            <div className="border-b border-[#eaeaea] pb-4 mb-2">
              <h2 className="text-[16px] font-semibold text-black">Giao diện Link Báo giá / Hợp đồng</h2>
              <p className="text-[13px] text-gray-500 mt-1">Chọn mẫu hiển thị mặc định khi khách hàng truy cập link chia sẻ cơ hội (Deal).</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {templates.map((template) => {
                const isSelected = (settings.CRM_DOCUMENT_TEMPLATE || "A4") === template.id;
                
                return (
                  <div 
                    key={template.id}
                    onClick={() => setSettings({ ...settings, CRM_DOCUMENT_TEMPLATE: template.id })}
                    className={`relative cursor-pointer rounded-xl border p-5 transition-all duration-200 ${
                      isSelected 
                        ? "border-black bg-gray-50 shadow-sm ring-1 ring-black" 
                        : "border-[#eaeaea] bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isSelected ? 'bg-white border border-[#eaeaea] shadow-sm' : 'bg-gray-50 border border-transparent'}`}>
                          {template.icon}
                        </div>
                        <div>
                          <h3 className={`text-[14px] font-semibold ${isSelected ? 'text-black' : 'text-gray-900'}`}>
                            {template.name}
                          </h3>
                          <p className="mt-1.5 text-[13px] text-gray-500 leading-relaxed">
                            {template.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isSelected ? 'border-black bg-black' : 'border-gray-300'}`}>
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
