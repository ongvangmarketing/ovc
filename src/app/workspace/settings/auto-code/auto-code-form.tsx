"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { updateSettings } from "@/app/actions/settings";
import { toast } from "sonner";

export interface CodeFormat {
  prefix: string;
  dateFormat: string; // "", "YYYY", "MMYYYY", "DDMMYYYY"
  counterLength: number; // 3, 4, 5, 6
}

const DEFAULT_FORMAT: CodeFormat = { prefix: "", dateFormat: "", counterLength: 6 };

function parseFormat(value: string | undefined, defaultPrefix: string): CodeFormat {
  if (!value) return { prefix: defaultPrefix, dateFormat: "MMYYYY", counterLength: 4 };
  try {
    return JSON.parse(value);
  } catch (e) {
    return { prefix: defaultPrefix, dateFormat: "MMYYYY", counterLength: 4 };
  }
}

export function AutoCodeSettingsClient({
  initialData,
  hasCRM,
  hasEducation,
  hasFinance,
  hasHotelBooking,
}: {
  initialData: Record<string, string>;
  hasCRM: boolean;
  hasEducation: boolean;
  hasFinance: boolean;
  hasHotelBooking: boolean;
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    FORMAT_CONTACT: parseFormat(initialData.FORMAT_CONTACT, "KH-"),
    FORMAT_CONTRACT: parseFormat(initialData.FORMAT_CONTRACT, "HD-"),
    FORMAT_STUDENT: parseFormat(initialData.FORMAT_STUDENT, "HV-"),
    FORMAT_CLASS: parseFormat(initialData.FORMAT_CLASS, "LH-"),
    FORMAT_QUOTE: parseFormat(initialData.FORMAT_QUOTE, "BG-"),
    FORMAT_INVOICE: parseFormat(initialData.FORMAT_INVOICE, "HDTC-"),
    FORMAT_RECEIPT: parseFormat(initialData.FORMAT_RECEIPT, "PT-"),
    FORMAT_BOOKING: parseFormat(initialData.FORMAT_BOOKING, "INV-HB"),
  });

  const updateFormat = (key: keyof typeof settings, field: keyof CodeFormat, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const save = async () => {
    setIsSaving(true);
    try {
      // Stringify settings before saving
      const stringifiedSettings: Record<string, string> = {};
      Object.entries(settings).forEach(([k, v]) => {
        stringifiedSettings[k] = JSON.stringify(v);
      });

      const result = await updateSettings(stringifiedSettings);
      if (result && result.success) {
        toast.success("Đã lưu Cài đặt sinh mã");
        router.refresh();
      } else {
        toast.error("Lỗi khi lưu cài đặt");
      }
    } catch (error) {
      toast.error(`Lỗi: ${error instanceof Error ? error.message : "Không thể lưu cài đặt"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const previewCode = (format: CodeFormat) => {
    let datePart = "";
    const now = new Date();
    if (format.dateFormat === "YYYY") datePart = now.getFullYear().toString();
    if (format.dateFormat === "MMYYYY") datePart = (now.getMonth() + 1).toString().padStart(2, "0") + now.getFullYear().toString();
    if (format.dateFormat === "DDMMYYYY") datePart = now.getDate().toString().padStart(2, "0") + (now.getMonth() + 1).toString().padStart(2, "0") + now.getFullYear().toString();
    
    const counterPart = "1".padStart(format.counterLength, "0");
    
    return `${format.prefix}${datePart ? datePart + "-" : ""}${counterPart}`;
  };

  const FormatBuilder = ({ label, keyName }: { label: string, keyName: keyof typeof settings }) => {
    const val = settings[keyName];
    return (
      <div className="flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-colors">
        <div className="flex justify-between items-center mb-1">
          <label className="text-[13px] font-semibold text-slate-800 uppercase tracking-wide">{label}</label>
          <div className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">
            Mẫu: <span className="font-bold text-slate-800">{previewCode(val)}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-4 flex flex-col gap-1.5">
             <span className="text-sm font-medium text-slate-700">Tiền tố</span>
             <input 
               type="text" 
               className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 uppercase"
               value={val.prefix}
               onChange={(e) => updateFormat(keyName, "prefix", e.target.value.toUpperCase())}
               placeholder="Tiền tố..."
             />
          </div>
          <div className="col-span-12 md:col-span-4 flex flex-col gap-1.5">
             <span className="text-sm font-medium text-slate-700">Định dạng Ngày</span>
             <select 
               className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
               value={val.dateFormat}
               onChange={(e) => updateFormat(keyName, "dateFormat", e.target.value)}
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
               value={val.counterLength}
               onChange={(e) => updateFormat(keyName, "counterLength", parseInt(e.target.value))}
             >
                <option value={3}>3 chữ số (001)</option>
                <option value={4}>4 chữ số (0001)</option>
                <option value={5}>5 chữ số (00001)</option>
                <option value={6}>6 chữ số (000001)</option>
             </select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 h-full bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Cài đặt sinh mã tự động</h1>
            <p className="text-sm text-slate-500 mt-1">
              Thiết lập quy tắc sinh mã tự động (ID) cho từng phân hệ trong hệ thống.
            </p>
          </div>

          <div>
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
        </div>

      <div className="space-y-10">
        
        {hasCRM && (
          <section>
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Module CRM (Khách hàng)
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <FormatBuilder label="Mã Khách hàng (Contact)" keyName="FORMAT_CONTACT" />
            </div>
          </section>
        )}

        {hasEducation && (
          <section>
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Module Đào tạo (Education)
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <FormatBuilder label="Mã Học viên" keyName="FORMAT_STUDENT" />
              <FormatBuilder label="Mã Lớp học" keyName="FORMAT_CLASS" />
            </div>
          </section>
        )}



        {hasHotelBooking && (
          <section>
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Module Khách sạn (Hotel Booking)
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <FormatBuilder label="Mã Đặt phòng (Booking)" keyName="FORMAT_BOOKING" />
            </div>
          </section>
        )}

        {(!hasCRM && !hasEducation && !hasFinance && !hasHotelBooking) && (
          <div className="py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">
            Tổ chức của bạn chưa cài đặt module nào hỗ trợ sinh mã tự động.
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
