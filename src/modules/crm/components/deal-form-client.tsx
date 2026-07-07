"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Save, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/format";
import { saveDealAction } from "@/app/actions/deals";

type DealServiceItem = {
  id: string;
  serviceOptionId: string;
  name: string;
  quantity: number | string;
  unitPrice: number | string;
  discount: number | string;
  taxRate: number | string;
  note: string;
};

export function DealFormClient({ 
  mode, 
  deal,
  companies = [],
  contacts = [],
  availableServices = [],
  stages = [],
  users = [],
  defaultStageId
}: { 
  mode: "create" | "edit"; 
  deal?: any;
  companies?: any[];
  contacts?: any[];
  availableServices?: any[];
  stages?: any[];
  users?: any[];
  defaultStageId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [servicePickerOpen, setServicePickerOpen] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  
  const [form, setForm] = useState({
    title: deal?.title || "",
    value: deal?.value || "",
    expectedClose: deal?.expectedClose ? new Date(deal.expectedClose).toISOString().slice(0, 10) : "",
    stageId: deal?.stageId || defaultStageId || stages?.[0]?.id || "",
    companyId: deal?.companyId || "",
    contactId: deal?.contactId || "",
    assigneeId: deal?.assigneeId || "",
    notes: deal?.notes || "",
    serviceOptions: deal?.serviceOptions?.map((o: any) => ({
      id: o.id || Math.random().toString(),
      serviceOptionId: o.serviceOptionId,
      name: o.serviceOption?.name || "",
      quantity: o.quantity || 1,
      unitPrice: Number(o.unitPrice) || 0,
      discount: Number(o.discount) || 0,
      taxRate: Number(o.taxRate) || 0,
      note: o.note || ""
    })) || []
  });

  const handleServiceChange = (serviceOptionId: string) => {
    const serviceOption = availableServices.flatMap(s => s.options).find(o => o.id === serviceOptionId);
    if (!serviceOption) return;
    
    setForm(prev => ({
      ...prev,
      serviceOptions: [
        ...prev.serviceOptions,
        {
          id: Math.random().toString(),
          serviceOptionId: serviceOption.id,
          name: serviceOption.name,
          quantity: 1,
          unitPrice: Number(serviceOption.price),
          discount: 0,
          taxRate: 10,
          note: ""
        }
      ]
    }));
  };

  const removeItem = (index: number) => {
    const newItems = [...form.serviceOptions];
    newItems.splice(index, 1);
    setForm({ ...form, serviceOptions: newItems });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...form.serviceOptions];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm({ ...form, serviceOptions: newItems });
  };

  const totalValue = form.serviceOptions.reduce((acc: number, item: any) => {
    const unitPrice = Number(item.unitPrice) || 0;
    const qty = Number(item.quantity) || 1;
    const discount = Number(item.discount) || 0;
    return acc + (unitPrice * qty) - discount;
  }, 0);
  const selectedServiceOptionIds = new Set(form.serviceOptions.map((item: DealServiceItem) => item.serviceOptionId));
  const serviceKeyword = serviceSearch.trim().toLowerCase();
  const filteredServices = availableServices
    .map((service) => ({
      ...service,
      options: service.options.filter((option: any) =>
        !selectedServiceOptionIds.has(option.id) &&
        (!serviceKeyword || `${service.name} ${option.name}`.toLowerCase().includes(serviceKeyword))
      ),
    }))
    .filter((service) => service.options.length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("value", totalValue > 0 ? totalValue.toString() : (form.value || "0"));
      if (form.expectedClose) formData.append("expectedClose", form.expectedClose);
      if (form.stageId) formData.append("stageId", form.stageId);
      if (form.companyId) formData.append("companyId", form.companyId);
      if (form.contactId) formData.append("contactId", form.contactId);
      if (form.notes) formData.append("notes", form.notes);
      
      const payload = {
        id: mode === 'edit' ? deal.id : undefined,
        title: form.title,
        value: totalValue > 0 ? totalValue : Number(form.value) || 0,
        expectedClose: form.expectedClose,
        stageId: form.stageId,
        companyId: form.companyId || undefined,
        contactId: form.contactId || undefined,
        assigneeId: form.assigneeId || undefined,
        notes: form.notes,
        serviceOptions: form.serviceOptions
      };

      const result = await saveDealAction(payload);
      
      if (result.success) {
        router.push(mode === 'create' ? `/workspace/crm/deals/${result.dealId}` : `/workspace/crm/deals/${deal.id}`);
        router.refresh();
      } else {
        alert("Có lỗi xảy ra khi lưu Deals");
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi lưu Deals");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quote-detail-page bg-gray-50/50 min-h-screen pb-20">
      <header className="quote-detail-hero border-b border-border bg-white sticky top-0 z-20">
        <div className="quote-detail-title">
          <Link href="/workspace/crm/deals" className="mr-3 w-9 h-9 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors shrink-0 border border-transparent hover:border-border">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              CRM / Cơ hội
            </div>
            <h1 className="text-lg font-semibold text-foreground m-0 p-0 leading-none">
              {mode === "create" ? "Tạo Cơ hội mới" : `Sửa: ${deal?.title}`}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/workspace/crm/deals" className="h-9 px-4 inline-flex items-center justify-center rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors">
            Hủy bỏ
          </Link>
          <button onClick={handleSubmit} disabled={loading} className="h-9 px-4 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm gap-2">
            <Save className="w-4 h-4" />
            {loading ? "Đang lưu..." : (mode === "create" ? "Tạo Cơ hội" : "Lưu thay đổi")}
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto mt-6 px-4 space-y-6">
        
        {/* SECTION: Thông tin chung */}
        <section className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h2 className="text-sm font-medium text-foreground mb-4">Thông tin chung</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Tên Cơ hội (Deal Title) *</label>
              <input 
                type="text" 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})}
                placeholder="VD: Thiết kế Website Doanh nghiệp..."
                className="w-full h-10 px-3 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Giai đoạn (Stage) *</label>
              <select 
                value={form.stageId}
                onChange={e => setForm({...form, stageId: e.target.value})}
                className="w-full h-10 px-3 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                required
              >
                <option value="" disabled>-- Chọn Giai đoạn --</option>
                {stages?.map(stage => (
                  <option key={stage.id} value={stage.id}>{stage.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Giá trị dự kiến (VNĐ)</label>
              <input 
                type="number" 
                value={form.value} 
                onChange={e => setForm({...form, value: e.target.value})}
                placeholder="10000000"
                className="w-full h-10 px-3 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                disabled={form.serviceOptions.length > 0} 
              />
              {form.serviceOptions.length > 0 && <span className="text-[10px] text-blue-600 mt-1 block">Tự động tính từ Sản phẩm/Dịch vụ</span>}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Ngày chốt dự kiến</label>
              <input 
                type="date" 
                value={form.expectedClose} 
                onChange={e => setForm({...form, expectedClose: e.target.value})}
                className="w-full h-10 px-3 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Người phụ trách (Assignee)</label>
              <select 
                value={form.assigneeId}
                onChange={e => setForm({...form, assigneeId: e.target.value})}
                className="w-full h-10 px-3 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
              >
                <option value="">-- Chọn Người phụ trách --</option>
                {users?.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* SECTION: Khách hàng và dự án */}
        <section className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h2 className="text-sm font-medium text-foreground mb-4">Khách hàng / Liên hệ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Doanh nghiệp (Company)</label>
              <select 
                value={form.companyId}
                onChange={e => setForm({...form, companyId: e.target.value})}
                className="w-full h-10 px-3 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
              >
                <option value="">-- Chọn Doanh nghiệp --</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Người liên hệ (Contact)</label>
              <select 
                value={form.contactId}
                onChange={e => setForm({...form, contactId: e.target.value})}
                className="w-full h-10 px-3 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
              >
                <option value="">-- Chọn Người liên hệ --</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email || c.phone})</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* SECTION: Sản phẩm / Dịch vụ */}
        <section className="quote-panel overflow-hidden p-0">
          <div className="quote-panel-header flex items-center justify-between">
            <div>
              <h2>Nội dung công việc (Sản phẩm / Dịch vụ)</h2>
              <span>Chọn option dịch vụ, sau đó điều chỉnh nội dung và giá trước khi lưu.</span>
            </div>
            <button type="button" onClick={() => setServicePickerOpen((open) => !open)} className="quote-action-button quote-action-secondary">
              {servicePickerOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {servicePickerOpen ? "Đóng" : "Chọn dịch vụ"}
            </button>
          </div>

          {servicePickerOpen ? (
            <div className="border-b border-slate-200 bg-slate-50 p-5">
              <div className="relative mb-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={serviceSearch} onChange={(event) => setServiceSearch(event.target.value)} className="quote-input pl-9" placeholder="Tìm gói hoặc option dịch vụ..." />
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredServices.map((service) => (
                  <div key={service.id} className="border border-slate-200 bg-white p-4">
                    <h3 className="mb-3 text-[14px] font-medium text-slate-900">{service.name}</h3>
                    <div className="space-y-2">
                      {service.options.map((option: any) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleServiceChange(option.id)}
                          className="flex w-full items-center justify-between gap-3 border border-slate-200 px-3 py-2 text-left hover:border-orange-300 hover:bg-orange-50"
                        >
                          <span className="min-w-0 text-[13px] text-slate-700">{option.name}</span>
                          <span className="shrink-0 text-[13px] font-medium text-orange-600">{formatCurrency(Number(option.price))}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {filteredServices.length === 0 ? <div className="text-[13px] text-slate-500">Không còn dịch vụ phù hợp để thêm.</div> : null}
              </div>
            </div>
          ) : null}
          
          <div className="p-5">
            {form.serviceOptions.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-border rounded-lg bg-slate-50">
                <p className="text-sm text-muted-foreground">Chưa có Sản phẩm/Dịch vụ nào được thêm vào Cơ hội.</p>
                <p className="text-xs text-muted-foreground mt-1">Chọn từ danh sách phía trên để thêm.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Headers */}
                <div className="grid grid-cols-12 gap-3 pb-2 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-4">Tên SP/Dịch vụ</div>
                  <div className="col-span-1 text-center">SL</div>
                  <div className="col-span-2 text-right">Đơn giá</div>
                  <div className="col-span-2 text-right">Chiết khấu</div>
                  <div className="col-span-2 text-right">Thành tiền</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Items */}
                {form.serviceOptions.map((item: DealServiceItem, index: number) => {
                  const lineTotal = (Number(item.unitPrice) * Number(item.quantity)) - Number(item.discount);
                  
                  return (
                    <div key={item.id} className="grid grid-cols-12 gap-3 items-start pb-4 border-b border-border border-dashed last:border-0 last:pb-0">
                      <div className="col-span-4 space-y-2">
                        <div className="font-medium text-sm text-foreground bg-slate-50 px-3 py-2 rounded border border-border">{item.name}</div>
                        <textarea
                          placeholder="Nhập mô tả chi tiết, phạm vi công việc, ghi chú riêng..."
                          className="w-full text-xs px-3 py-2 border border-border rounded-md min-h-[60px] focus:outline-none focus:ring-1 focus:ring-primary"
                          value={item.note}
                          onChange={e => updateItem(index, 'note', e.target.value)}
                        />
                      </div>
                      <div className="col-span-1">
                        <input 
                          type="number" min="1" 
                          className="w-full text-sm px-2 py-2 border border-border rounded-md text-center focus:outline-none focus:ring-1 focus:ring-primary"
                          value={item.quantity}
                          onChange={e => updateItem(index, 'quantity', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <input 
                          type="number" min="0" 
                          className="w-full text-sm px-3 py-2 border border-border rounded-md text-right focus:outline-none focus:ring-1 focus:ring-primary"
                          value={item.unitPrice}
                          onChange={e => updateItem(index, 'unitPrice', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <input 
                          type="number" min="0" 
                          className="w-full text-sm px-3 py-2 border border-border rounded-md text-right focus:outline-none focus:ring-1 focus:ring-primary"
                          value={item.discount}
                          onChange={e => updateItem(index, 'discount', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm px-3 py-2 bg-slate-50 border border-transparent rounded-md text-right font-medium">
                          {formatCurrency(lineTotal)}
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-center pt-2">
                        <button type="button" onClick={() => removeItem(index)} className="text-muted-foreground hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Summary */}
                <div className="flex justify-end pt-4">
                  <div className="w-1/3 min-w-[300px]">
                    <div className="flex justify-between items-center py-2 text-sm">
                      <span className="text-muted-foreground">Tạm tính</span>
                      <span className="font-medium text-foreground">{formatCurrency(totalValue)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 text-base border-t border-border font-bold">
                      <span className="text-foreground">Tổng Giá Trị Deal</span>
                      <span className="text-emerald-600">{formatCurrency(totalValue)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION: Ghi chú */}
        <section className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h2 className="text-sm font-medium text-foreground mb-4">Ghi chú Nội bộ</h2>
          <div>
            <textarea
              placeholder="Nhập ghi chú, đánh giá khách hàng, lịch sử trao đổi ngắn gọn..."
              className="w-full text-sm px-3 py-2 border border-border rounded-md min-h-[100px] focus:outline-none focus:ring-1 focus:ring-primary"
              value={form.notes}
              onChange={e => setForm({...form, notes: e.target.value})}
            />
          </div>
        </section>
        
      </div>
    </div>
  );
}
