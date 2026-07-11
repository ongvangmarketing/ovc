// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Save, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/format";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { ComboSelectModal as ComboSelect } from "@/components/ui/combo-select-modal";
import { saveDealAction } from "@/modules/crm/actions/deals.actions";

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

type DealFormOption = {
  id: string;
  serviceOptionId: string;
  serviceOption?: DealFormServiceOption | null;
  quantity?: number | string;
  unitPrice?: number | string;
  discount?: number | string;
  taxRate?: number | string;
  note?: string | null;
};

type DealFormDeal = {
  id: string;
  title?: string | null;
  value?: number | string | null;
  expectedClose?: string | Date | null;
  stageId?: string | null;
  companyId?: string | null;
  contactId?: string | null;
  assigneeId?: string | null;
  notes?: string | null;
  serviceOptions?: DealFormOption[];
};

type DealFormCompany = { id: string; name: string };
type DealFormContact = { id: string; firstName?: string | null; lastName?: string | null; email?: string | null; phone?: string | null };
type DealFormServiceOption = {
  id: string;
  name: string;
  price?: number | string | null;
  description?: string | null;
  unit?: string | null;
  durationText?: string | null;
  featuresJson?: string[] | Record<string, string> | string | null;
};
type DealFormService = { id: string; name: string; options: DealFormServiceOption[] };
type DealFormStage = { id: string; name: string };
type DealFormUser = { id: string; name?: string | null; email?: string | null };
type DealServiceField = keyof Pick<DealServiceItem, "quantity" | "unitPrice" | "discount" | "taxRate" | "note">;
type CustomerChoice = { id: string; type: "company" | "contact"; title: string; subtitle?: string };

function optionDetailText(option?: DealFormServiceOption | null) {
  if (!option) return "";
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const parts: string[] = [];
  if (option.description) parts.push(`<p>${escapeHtml(option.description)}</p>`);
  if (option.unit) parts.push(`<p><strong>Đơn vị:</strong> ${escapeHtml(option.unit)}</p>`);
  if (option.durationText) parts.push(`<p><strong>Thời lượng:</strong> ${escapeHtml(option.durationText)}</p>`);

  const features = option.featuresJson;
  const featureItems = Array.isArray(features)
    ? features
    : typeof features === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(features);
            if (Array.isArray(parsed)) return parsed.map(String);
            if (parsed && typeof parsed === "object") return Object.values(parsed).map(String);
          } catch {
            return features.split(/\n|,/).map((item) => item.trim());
          }
          return [];
        })()
      : features && typeof features === "object"
        ? Object.values(features).map(String)
        : [];

  const cleanFeatures = featureItems.map((item) => item.trim()).filter(Boolean);
  if (cleanFeatures.length) {
    parts.push(`<p><strong>Hạng mục / quyền lợi:</strong></p><ul>${cleanFeatures.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`);
  }

  return parts.filter(Boolean).join("");
}

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
  deal?: DealFormDeal;
  companies?: DealFormCompany[];
  contacts?: DealFormContact[];
  availableServices?: DealFormService[];
  stages?: DealFormStage[];
  users?: DealFormUser[];
  defaultStageId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [servicePickerOpen, setServicePickerOpen] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [assigneeSearch, setAssigneeSearch] = useState("");
  
  const [form, setForm] = useState({
    title: deal?.title || "",
    value: deal?.value || "",
    expectedClose: deal?.expectedClose ? new Date(deal.expectedClose).toISOString().slice(0, 10) : "",
    stageId: deal?.stageId || defaultStageId || stages?.[0]?.id || "",
    companyId: deal?.companyId || "",
    contactId: deal?.contactId || "",
    assigneeId: deal?.assigneeId || "",
    notes: deal?.notes || "",
    serviceOptions: deal?.serviceOptions?.map((o, index) => ({
      id: o.id || `existing-${index}`,
      serviceOptionId: o.serviceOptionId,
      name: o.serviceOption?.name || "",
      quantity: o.quantity || 1,
      unitPrice: Number(o.unitPrice) || 0,
      discount: Number(o.discount) || 0,
      taxRate: Number(o.taxRate) || 0,
      note: o.note || optionDetailText(o.serviceOption)
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
          note: optionDetailText(serviceOption)
        }
      ]
    }));
  };

  const removeItem = (index: number) => {
    const newItems = [...form.serviceOptions];
    newItems.splice(index, 1);
    setForm({ ...form, serviceOptions: newItems });
  };

  const updateItem = (index: number, field: DealServiceField, value: number | string) => {
    const newItems = [...form.serviceOptions];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm({ ...form, serviceOptions: newItems });
  };

  const totalValue = form.serviceOptions.reduce((acc: number, item: DealServiceItem) => {
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
      options: service.options.filter((option) =>
        !selectedServiceOptionIds.has(option.id) &&
        (!serviceKeyword || `${service.name} ${option.name}`.toLowerCase().includes(serviceKeyword))
      ),
    }))
    .filter((service) => service.options.length > 0);
  const customerChoices: CustomerChoice[] = [
    ...companies.map((company) => ({ id: `company:${company.id}`, type: "company" as const, title: company.name, subtitle: "Doanh nghiệp" })),
    ...contacts.map((contact) => {
      const title = `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || contact.email || contact.phone || "Liên hệ chưa đặt tên";
      return { id: `contact:${contact.id}`, type: "contact" as const, title, subtitle: contact.email || contact.phone || "Người liên hệ" };
    }),
  ];
  const selectedCustomerId = form.companyId ? `company:${form.companyId}` : form.contactId ? `contact:${form.contactId}` : "";
  const selectedCustomer = customerChoices.find((customer) => customer.id === selectedCustomerId);
  const selectedAssignee = users.find((user) => user.id === form.assigneeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("value", form.value || (totalValue > 0 ? totalValue.toString() : "0"));
      if (form.expectedClose) formData.append("expectedClose", form.expectedClose);
      if (form.stageId) formData.append("stageId", form.stageId);
      if (form.companyId) formData.append("companyId", form.companyId);
      if (form.contactId) formData.append("contactId", form.contactId);
      if (form.notes) formData.append("notes", form.notes);
      
      const payload = {
        id: mode === 'edit' ? deal.id : undefined,
        title: form.title,
        value: Number(form.value) || totalValue || 0,
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
    <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase w-fit">
              CRM Deal Form
            </span>
          </div>
          <h1 className="text-[32px] md:text-[44px] tracking-tight leading-[1.15] font-medium uppercase">
            {mode === "create" ? "Tạo Cơ hội mới" : `Sửa: ${deal?.title}`}
          </h1>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/workspace/crm/deals" className="flex items-center justify-center h-9 px-4 text-[13px] font-medium text-black bg-white border border-[#eaeaea] rounded-md hover:bg-gray-50 transition-colors">
            Hủy bỏ
          </Link>
          <button onClick={handleSubmit} disabled={loading} className="flex items-center justify-center h-9 px-6 text-[13px] font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50">
            {loading ? "Đang lưu..." : (mode === "create" ? "Tạo Cơ hội" : "Lưu thay đổi")}
          </button>
        </div>
      </div>
      
      <div className="space-y-6">
        
        {/* SECTION: Thông tin chung */}
        <section className="rounded-2xl border border-[#eaeaea] bg-white p-6">
          <h2 className="mb-5 text-[24px] font-medium tracking-tight text-black">Thông tin chung</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-gray-400">Tên Cơ hội (Deal Title) *</label>
              <input 
                type="text" 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})}
                placeholder="VD: Thiết kế Website Doanh nghiệp..."
                className="h-11 w-full rounded-lg border border-[#eaeaea] px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-gray-400">Giai đoạn (Stage) *</label>
              <select 
                value={form.stageId}
                onChange={e => setForm({...form, stageId: e.target.value})}
                className="h-11 w-full rounded-lg border border-[#eaeaea] bg-white px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                required
              >
                <option value="" disabled>-- Chọn Giai đoạn --</option>
                {stages?.map(stage => (
                  <option key={stage.id} value={stage.id}>{stage.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-gray-400">Giá trị dự kiến (VNĐ)</label>
              <input 
                type="number" 
                value={form.value} 
                onChange={e => setForm({...form, value: e.target.value})}
                placeholder="10000000"
                className="h-11 w-full rounded-lg border border-[#eaeaea] px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
              {form.serviceOptions.length > 0 && <span className="mt-1 block text-[11px] text-gray-500">Tự động tính từ Sản phẩm/Dịch vụ</span>}
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-gray-400">Ngày chốt dự kiến</label>
              <input 
                type="date" 
                value={form.expectedClose} 
                onChange={e => setForm({...form, expectedClose: e.target.value})}
                className="h-11 w-full rounded-lg border border-[#eaeaea] px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-gray-400">Người phụ trách (Assignee)</label>
              <ComboSelect
                label="Người phụ trách"
                value={form.assigneeId}
                search={assigneeSearch}
                selectedTitle={selectedAssignee?.name || selectedAssignee?.email || ""}
                onSearchChange={setAssigneeSearch}
                placeholder="Gõ tên người phụ trách..."
                options={users}
                getTitle={(user) => user.name || user.email || "Chưa có tên"}
                getSubtitle={(user) => user.email || ""}
                onSelect={(assigneeId) => setForm({ ...form, assigneeId })}
                allowEmpty
              />
            </div>
          </div>
        </section>

        {/* SECTION: Khách hàng và dự án */}
        <section className="rounded-2xl border border-[#eaeaea] bg-white p-6">
          <h2 className="mb-5 text-[24px] font-medium tracking-tight text-black">Khách hàng</h2>
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-gray-400">Khách hàng / Doanh nghiệp / Liên hệ</label>
              <ComboSelect
                value={selectedCustomerId}
                search={companySearch}
                selectedTitle={selectedCustomer?.title}
                onSearchChange={setCompanySearch}
                placeholder="Chọn hoặc tìm khách hàng..."
                options={customerChoices}
                getTitle={(customer) => customer.title}
                getSubtitle={(customer) => customer.subtitle || ""}
                onSelect={(customerId) => {
                  if (!customerId) {
                    setForm({ ...form, companyId: "", contactId: "" });
                    return;
                  }
                  const [type, id] = customerId.split(":");
                  setForm({
                    ...form,
                    companyId: type === "company" ? id : "",
                    contactId: type === "contact" ? id : "",
                  });
                }}
                allowEmpty
              />
            </div>
          </div>
        </section>

        {/* SECTION: Sản phẩm / Dịch vụ */}
        <section className="overflow-hidden rounded-2xl border border-[#eaeaea] bg-white">
          <div className="flex flex-col justify-between gap-4 border-b border-[#eaeaea] p-6 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-[24px] font-medium tracking-tight text-black">Nội dung công việc</h2>
              <span className="mt-1 block text-[14px] text-gray-500">Chọn option dịch vụ, sau đó điều chỉnh nội dung và giá trước khi lưu.</span>
            </div>
            <button type="button" onClick={() => setServicePickerOpen((open) => !open)} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#eaeaea] bg-white px-5 text-[14px] font-medium text-black transition-colors hover:bg-gray-50">
              {servicePickerOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {servicePickerOpen ? "Đóng" : "Chọn dịch vụ"}
            </button>
          </div>

          {servicePickerOpen ? (
            <div className="border-b border-[#eaeaea] bg-gray-50/50 p-5">
              <div className="relative mb-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input value={serviceSearch} onChange={(event) => setServiceSearch(event.target.value)} className="h-10 w-full rounded-full border border-[#eaeaea] bg-white pl-9 pr-4 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black" placeholder="Tìm gói hoặc option dịch vụ..." />
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredServices.map((service) => (
                  <div key={service.id} className="rounded-2xl border border-[#eaeaea] bg-white p-4">
                    <h3 className="mb-3 text-[14px] font-medium text-black">{service.name}</h3>
                    <div className="space-y-2">
                      {service.options.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleServiceChange(option.id)}
                          className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#eaeaea] bg-white px-3 py-2 text-left transition-colors hover:border-black"
                        >
                          <span className="min-w-0 text-[13px] text-gray-700">{option.name}</span>
                          <span className="shrink-0 text-[13px] font-medium text-black">{formatCurrency(Number(option.price))}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {filteredServices.length === 0 ? <div className="text-[13px] text-gray-500">Không còn dịch vụ phù hợp để thêm.</div> : null}
              </div>
            </div>
          ) : null}
          
          <div className="p-4">
            {form.serviceOptions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#eaeaea] bg-gray-50/50 py-8 text-center">
                <p className="text-sm text-gray-500">Chưa có Sản phẩm/Dịch vụ nào được thêm vào Cơ hội.</p>
                <p className="mt-1 text-xs text-gray-400">Chọn từ danh sách phía trên để thêm.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Items */}
                {form.serviceOptions.map((item: DealServiceItem, index: number) => {
                  const lineTotal = (Number(item.unitPrice) * Number(item.quantity)) - Number(item.discount);
                  
                  return (
                    <div key={item.id} className="rounded-2xl border border-[#eaeaea] bg-white p-4">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-medium uppercase tracking-widest text-gray-400">Tên SP/Dịch vụ</div>
                          <div className="mt-2 rounded-lg border border-[#eaeaea] bg-gray-50/50 px-3 py-2 text-[15px] font-medium text-black">{item.name}</div>
                        </div>
                        <button type="button" onClick={() => removeItem(index)} className="mt-6 rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="text-[11px] font-medium uppercase tracking-widest text-gray-400">Nội dung chi tiết của gói</div>
                        <TiptapEditor
                          placeholder="Nhập mô tả chi tiết, phạm vi công việc, ghi chú riêng..."
                          value={item.note}
                          onChange={content => updateItem(index, 'note', content)}
                        />
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-[120px_1fr_1fr_1fr]">
                        <label className="block">
                          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-gray-400">Số lượng</span>
                        <input 
                          type="number" min="1" 
                          className="w-full rounded-md border border-[#eaeaea] px-2 py-2 text-center text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                          value={item.quantity}
                          onChange={e => updateItem(index, 'quantity', e.target.value)}
                        />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-gray-400">Đơn giá</span>
                        <input 
                          type="number" min="0" 
                          className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-right text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                          value={item.unitPrice}
                          onChange={e => updateItem(index, 'unitPrice', e.target.value)}
                        />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-gray-400">Chiết khấu</span>
                        <input 
                          type="number" min="0" 
                          className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-right text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                          value={item.discount}
                          onChange={e => updateItem(index, 'discount', e.target.value)}
                        />
                        </label>
                        <div>
                          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-gray-400">Thành tiền</span>
                        <div className="rounded-md border border-transparent bg-gray-50 px-3 py-2 text-right text-sm font-medium text-black">
                          {formatCurrency(lineTotal)}
                        </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Summary */}
                <div className="flex justify-end pt-4">
                  <div className="w-1/3 min-w-[300px]">
                    <div className="flex justify-between items-center py-2 text-sm">
                      <span className="text-gray-500">Tạm tính</span>
                      <span className="font-medium text-black">{formatCurrency(totalValue)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#eaeaea] py-3 text-base font-medium">
                      <span className="text-black">Tổng Giá Trị Deal</span>
                      <span className="text-black">{formatCurrency(totalValue)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION: Ghi chú */}
        <section className="rounded-2xl border border-[#eaeaea] bg-white p-6">
          <h2 className="mb-5 text-[24px] font-medium tracking-tight text-black">Ghi chú Nội bộ</h2>
          <div>
            <TiptapEditor
              placeholder="Nhập ghi chú, đánh giá khách hàng, lịch sử trao đổi ngắn gọn..."
              value={form.notes}
              onChange={content => setForm({...form, notes: content})}
            />
          </div>
        </section>
        
      </div>
    </div>
  );
}
