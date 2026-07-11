"use client";

import React, { useState, useTransition } from "react";
import { updateSettings } from "@/actions/settings";
import { toast } from "sonner";
import { Settings } from "lucide-react";

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

export function TrainingSettingsClient({ initialSettings }: { initialSettings: any }) {
  const [settings, setSettings] = useState(() => ({
    ...initialSettings,
    FORMAT_STUDENT_PARSED: parseFormat(initialSettings.FORMAT_STUDENT, "HV-"),
    FORMAT_CLASS_PARSED: parseFormat(initialSettings.FORMAT_CLASS, "LH-"),
  }));
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        const dataToSave = { ...settings };
        dataToSave.FORMAT_STUDENT = JSON.stringify(settings.FORMAT_STUDENT_PARSED);
        dataToSave.FORMAT_CLASS = JSON.stringify(settings.FORMAT_CLASS_PARSED);
        delete dataToSave.FORMAT_STUDENT_PARSED;
        delete dataToSave.FORMAT_CLASS_PARSED;
        
        await updateSettings(dataToSave);
        toast.success("Cập nhật cấu hình Đào tạo thành công!");
      } catch (error: any) {
        toast.error(error.message || "Lỗi khi lưu cấu hình");
      }
    });
  };

  const updateFormat = (keyName: "FORMAT_STUDENT_PARSED" | "FORMAT_CLASS_PARSED", field: keyof CodeFormat, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [keyName]: {
        ...prev[keyName],
        [field]: value
      }
    }));
  };

  return (
    <div className="flex-1 h-full overflow-y-auto">
      <div className="quote-page mx-auto max-w-[1440px] px-6 py-6 animate-in fade-in duration-300">
        
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-3 border-b border-[#eaeaea] pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[14px] font-medium text-gray-500 uppercase tracking-wide">
              Đào tạo / Cấu hình
            </div>
            <h1 className="text-[24px] font-semibold text-black">Cấu hình Đào tạo</h1>
            <p className="mt-1 text-[14px] text-gray-500">Quản lý cài đặt sinh mã tự động cho phân hệ Đào tạo.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center justify-center gap-2 rounded-full bg-black px-5 py-2.5 text-[14px] font-medium text-white transition-all hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        <div className="space-y-8 max-w-4xl">
          
          <section className="flex flex-col gap-4 p-6 bg-white border border-[#eaeaea] rounded-[12px] shadow-sm">
            <div className="border-b border-[#eaeaea] pb-4 mb-2">
              <h2 className="text-[16px] font-semibold text-black">Quy tắc sinh mã Học viên</h2>
              <p className="text-[13px] text-gray-500 mt-1">Định dạng mã số tự động cho Học viên mới trong hệ thống.</p>
            </div>
            
            <div className="flex justify-between items-center bg-[#fafafa] border border-[#eaeaea] px-4 py-3 rounded-lg mb-2">
              <span className="text-[13px] font-medium text-gray-600">Xem trước kết quả:</span>
              <span className="text-[14px] font-mono font-bold text-black">{previewCode(settings.FORMAT_STUDENT_PARSED)}</span>
            </div>
            
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 md:col-span-4 flex flex-col gap-1.5">
                 <span className="text-[13px] font-medium text-gray-700">Tiền tố</span>
                 <input 
                   type="text" 
                   className="w-full rounded-[8px] border border-[#eaeaea] px-3 py-2.5 text-[14px] focus:border-black focus:outline-none focus:ring-1 focus:ring-black uppercase transition-colors bg-[#fafafa] hover:bg-white focus:bg-white"
                   value={settings.FORMAT_STUDENT_PARSED.prefix}
                   onChange={(e) => updateFormat("FORMAT_STUDENT_PARSED", "prefix", e.target.value.toUpperCase())}
                   placeholder="VD: HV-"
                 />
              </div>
              <div className="col-span-12 md:col-span-4 flex flex-col gap-1.5">
                 <span className="text-[13px] font-medium text-gray-700">Quy tắc Ngày</span>
                 <select 
                   className="w-full rounded-[8px] border border-[#eaeaea] px-3 py-2.5 text-[14px] focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-colors bg-[#fafafa] hover:bg-white focus:bg-white cursor-pointer"
                   value={settings.FORMAT_STUDENT_PARSED.dateFormat}
                   onChange={(e) => updateFormat("FORMAT_STUDENT_PARSED", "dateFormat", e.target.value)}
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
                   value={settings.FORMAT_STUDENT_PARSED.counterLength}
                   onChange={(e) => updateFormat("FORMAT_STUDENT_PARSED", "counterLength", parseInt(e.target.value))}
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
              <h2 className="text-[16px] font-semibold text-black">Quy tắc sinh mã Lớp học</h2>
              <p className="text-[13px] text-gray-500 mt-1">Định dạng mã số tự động cho Lớp học mới được mở.</p>
            </div>
            
            <div className="flex justify-between items-center bg-[#fafafa] border border-[#eaeaea] px-4 py-3 rounded-lg mb-2">
              <span className="text-[13px] font-medium text-gray-600">Xem trước kết quả:</span>
              <span className="text-[14px] font-mono font-bold text-black">{previewCode(settings.FORMAT_CLASS_PARSED)}</span>
            </div>
            
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 md:col-span-4 flex flex-col gap-1.5">
                 <span className="text-[13px] font-medium text-gray-700">Tiền tố</span>
                 <input 
                   type="text" 
                   className="w-full rounded-[8px] border border-[#eaeaea] px-3 py-2.5 text-[14px] focus:border-black focus:outline-none focus:ring-1 focus:ring-black uppercase transition-colors bg-[#fafafa] hover:bg-white focus:bg-white"
                   value={settings.FORMAT_CLASS_PARSED.prefix}
                   onChange={(e) => updateFormat("FORMAT_CLASS_PARSED", "prefix", e.target.value.toUpperCase())}
                   placeholder="VD: LH-"
                 />
              </div>
              <div className="col-span-12 md:col-span-4 flex flex-col gap-1.5">
                 <span className="text-[13px] font-medium text-gray-700">Quy tắc Ngày</span>
                 <select 
                   className="w-full rounded-[8px] border border-[#eaeaea] px-3 py-2.5 text-[14px] focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-colors bg-[#fafafa] hover:bg-white focus:bg-white cursor-pointer"
                   value={settings.FORMAT_CLASS_PARSED.dateFormat}
                   onChange={(e) => updateFormat("FORMAT_CLASS_PARSED", "dateFormat", e.target.value)}
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
                   value={settings.FORMAT_CLASS_PARSED.counterLength}
                   onChange={(e) => updateFormat("FORMAT_CLASS_PARSED", "counterLength", parseInt(e.target.value))}
                 >
                    <option value={3}>3 chữ số (001)</option>
                    <option value={4}>4 chữ số (0001)</option>
                    <option value={5}>5 chữ số (00001)</option>
                    <option value={6}>6 chữ số (000001)</option>
                 </select>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
