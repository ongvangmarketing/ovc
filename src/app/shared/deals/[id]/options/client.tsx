"use client";

import { useState } from "react";
import { submitCustomerOptions } from "@/app/actions/deal-services-public";
import { CheckCircle2, ShieldCheck, Mail, FileText } from "lucide-react";

function formatMoney(value: unknown, currency = "VND") {
  const parsed = Number(value ?? 0);
  const num = Number.isFinite(parsed) ? parsed : 0;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDate(value?: string | Date | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  }).format(date);
}

export function PublicOptionsClient({ deal }: { deal: any }) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    deal.serviceOptions.filter((o: any) => o.status === "CUSTOMER_SELECTED" || o.status === "CONVERTED_TO_QUOTE").map((o: any) => o.id)
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Group by service
  const serviceGroups = deal.serviceOptions.reduce((acc: any, curr: any) => {
    const serviceName = curr.serviceOption.service.name;
    if (!acc[serviceName]) acc[serviceName] = [];
    acc[serviceName].push(curr);
    return acc;
  }, {});

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      alert("Vui lòng chọn ít nhất một hạng mục để tiếp tục.");
      return;
    }
    
    setSubmitting(true);
    const res = await submitCustomerOptions(deal.id, selectedIds);
    setSubmitting(false);

    if (res.error) {
      alert(res.error);
    } else {
      setSubmitted(true);
    }
  };

  const hasConverted = deal.serviceOptions.some((o: any) => o.status === "CONVERTED_TO_QUOTE");

  if (submitted || hasConverted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Xác nhận thành công!</h1>
        <p className="text-slate-600 max-w-md mx-auto text-lg leading-relaxed">
          Cảm ơn bạn đã lựa chọn dịch vụ của <strong>{deal.organization?.name}</strong>. Chúng tôi đã ghi nhận sự lựa chọn của bạn và sẽ tiến hành gửi Hợp đồng / Báo giá chính thức trong thời gian sớm nhất.
        </p>
      </div>
    );
  }

  const org = deal.organization;
  const orgSettings = org?.settings as any;
  const logo = orgSettings?.logo || org?.logo;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Document A4 View Container */}
      <div className="w-full max-w-4xl bg-white shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden border border-gray-100 min-h-[1056px] flex flex-col">
        
        {/* Document Header */}
        <div className="px-10 py-12 flex justify-between items-start border-b border-gray-100">
          <div className="flex items-center gap-4">
            {logo ? (
              <img src={logo} alt={org?.name} className="h-16 object-contain" />
            ) : (
              <div className="w-16 h-16 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-2xl">
                {org?.name?.charAt(0) || 'O'}
              </div>
            )}
            <div>
              <h2 className="font-bold text-gray-900 text-lg uppercase tracking-wider">{org?.name}</h2>
              <p className="text-gray-500 text-sm mt-1">{orgSettings?.address || "Address not provided"}</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">ĐỀ XUẤT DỊCH VỤ</h1>
            <p className="text-gray-500 text-sm font-medium">Mã cơ hội: #{deal.id.slice(-6).toUpperCase()}</p>
            <p className="text-gray-500 text-sm font-medium mt-1">Ngày lập: {formatDate(deal.updatedAt || deal.createdAt)}</p>
          </div>
        </div>

        {/* Document Body */}
        <div className="flex-1 px-10 py-10">
          <div className="mb-10 text-gray-700 text-base leading-relaxed">
            <p>Kính gửi Quý Khách hàng,</p>
            <p className="mt-2">
              Dựa trên yêu cầu và trao đổi, <strong>{org?.name}</strong> trân trọng gửi tới Quý khách bảng Đề xuất các hạng mục dịch vụ (Options). Vui lòng đánh dấu <strong>[x]</strong> vào các hạng mục Quý khách muốn lựa chọn.
            </p>
          </div>

          <div className="space-y-10">
            {Object.entries(serviceGroups).map(([serviceName, options]: [string, any]) => (
              <div key={serviceName}>
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b-2 border-slate-900 pb-2 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-400" />
                  {serviceName}
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  {options.map((opt: any) => {
                    const isSelected = selectedIds.includes(opt.id);
                    return (
                      <label 
                        key={opt.id} 
                        className={`relative flex items-start gap-4 p-5 rounded-xl cursor-pointer transition-all border-2 ${isSelected ? 'border-slate-900 bg-slate-50' : 'border-gray-100 hover:border-gray-300 bg-white'}`}
                      >
                        <div className="pt-1 shrink-0">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded border-gray-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedIds([...selectedIds, opt.id]);
                              else setSelectedIds(selectedIds.filter(id => id !== opt.id));
                            }}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div>
                              <h4 className={`text-base font-bold ${isSelected ? 'text-slate-900' : 'text-gray-800'}`}>{opt.serviceOption.name}</h4>
                              <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                                {opt.serviceOption.description || opt.note || "Hạng mục tiêu chuẩn."}
                              </p>
                            </div>
                            <div className="text-left sm:text-right shrink-0">
                              <div className="text-sm font-semibold text-gray-900">{formatMoney(opt.unitPrice)} đ</div>
                              {opt.quantity > 1 && <div className="text-xs text-gray-500 mt-0.5">SL: {opt.quantity}</div>}
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Document Footer */}
        <div className="px-10 py-8 bg-gray-50/80 border-t border-gray-100 mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Đã chọn ({selectedIds.length} hạng mục)</div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-slate-600">Lựa chọn của Quý khách sẽ được gửi về cho chuyên viên phụ trách.</span>
              </div>
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={submitting || selectedIds.length === 0}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-lg font-bold text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? "Đang xử lý..." : "Xác nhận Lựa chọn"}
              {!submitting && <CheckCircle2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
        <Mail className="w-4 h-4" />
        Nếu có thắc mắc, vui lòng liên hệ nhân viên tư vấn để được hỗ trợ.
      </div>
    </div>
  );
}
