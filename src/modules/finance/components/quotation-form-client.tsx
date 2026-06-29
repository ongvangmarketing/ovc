"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  FileUp,
  FileText,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { createQuotation, updateQuotation } from "@/app/actions/finance-crud";
import { getContacts, getDeals } from "@/app/actions/crm";
import { getProjects } from "@/app/actions/projects";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";

type QuotationMode = "create" | "edit";

type ContactOption = {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  company?: { name?: string | null } | null;
};

type ProjectOption = {
  id: string;
  name: string;
  status?: string;
  budget?: unknown;
};

type DealOption = {
  id: string;
  title: string;
  value?: unknown;
  contactId?: string | null;
};

type QuotationItemForm = {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
};

type InitialQuotation = {
  id: string;
  number?: string;
  title?: string;
  status?: string;
  contactId?: string | null;
  projectId?: string | null;
  dealId?: string | null;
  currency?: string;
  subtotal?: unknown;
  discount?: unknown;
  discountType?: string;
  tax?: unknown;
  taxRate?: unknown;
  notes?: string | null;
  terms?: string | null;
  validUntil?: string | Date | null;
  items?: QuotationItemForm[];
};

const emptyItem = (): QuotationItemForm => ({
  name: "",
  description: "",
  quantity: 1,
  unitPrice: 0,
  discount: 0,
  tax: 0,
  total: 0,
});

const statusOptions = [
  { value: "DRAFT", label: "Nháp" },
  { value: "SENT", label: "Đã gửi" },
  { value: "ACCEPTED", label: "Đã chấp nhận" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "EXPIRED", label: "Hết hạn" },
];

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function toInputDate(value?: string | Date | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function contactLabel(contact: ContactOption) {
  const fullName = contact.name || `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
  return fullName || contact.email || "Khách hàng chưa đặt tên";
}

function numberValue(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  if (size >= 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${size} B`;
}

function normalizeLegacyText(value?: string | null) {
  if (!value) return "";
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function recalcItem(item: QuotationItemForm): QuotationItemForm {
  const amount = numberValue(item.quantity) * numberValue(item.unitPrice);
  const afterDiscount = Math.max(0, amount - numberValue(item.discount));
  const taxAmount = afterDiscount * (numberValue(item.tax) / 100);
  return { ...item, description: normalizeLegacyText(item.description), total: afterDiscount + taxAmount };
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[14px] font-light text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function ComboSelect<T extends { id: string }>({
  label,
  value,
  search,
  selectedTitle,
  onSearchChange,
  placeholder,
  options,
  getTitle,
  getSubtitle,
  onSelect,
  emptyTitle,
  allowEmpty,
}: {
  label: string;
  value: string;
  search: string;
  selectedTitle?: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
  options: T[];
  getTitle: (option: T) => string;
  getSubtitle?: (option: T) => string;
  onSelect: (id: string) => void;
  emptyTitle?: string;
  allowEmpty?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Field label={label}>
      <div className="quote-combo">
        <Search className="quote-input-icon quote-input-icon-left top-[21px]" />
        <input
          value={search || selectedTitle || ""}
          onChange={(event) => {
            onSearchChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="quote-input quote-input-with-left-icon"
          placeholder={placeholder}
          type="search"
        />
        {open ? (
          <div className="quote-combo-menu">
            {allowEmpty ? (
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect("");
                  onSearchChange("");
                  setOpen(false);
                }}
                className={cn("quote-combo-option", !value && "quote-combo-option-active")}
              >
                {emptyTitle || "Không chọn"}
              </button>
            ) : null}
            {options.slice(0, 9).map((option) => (
              <button
                key={option.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(option.id);
                  onSearchChange(getTitle(option));
                  setOpen(false);
                }}
                className={cn("quote-combo-option", option.id === value && "quote-combo-option-active")}
              >
                <span>{getTitle(option)}</span>
                {getSubtitle ? <small>{getSubtitle(option)}</small> : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </Field>
  );
}

export function QuotationFormClient({
  mode,
  initialData,
}: {
  mode: QuotationMode;
  initialData?: InitialQuotation;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  const [number, setNumber] = useState(initialData?.number || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [contactId, setContactId] = useState(searchParams?.get("contactId") || initialData?.contactId || "");
  const [projectId, setProjectId] = useState(searchParams?.get("projectId") || initialData?.projectId || "");
  const [dealId, setDealId] = useState(initialData?.dealId || "");
  const [quotationDate, setQuotationDate] = useState(todayInputValue());
  const [validUntil, setValidUntil] = useState(toInputDate(initialData?.validUntil));
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [currency, setCurrency] = useState(initialData?.currency || "VND");
  const [discountType, setDiscountType] = useState(initialData?.discountType || "fixed");
  const [discount, setDiscount] = useState(numberValue(initialData?.discount));
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [terms, setTerms] = useState(initialData?.terms || "");
  const [customerSearch, setCustomerSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [subtotalOverride, setSubtotalOverride] = useState<number | null>(null);
  const [totalTaxOverride, setTotalTaxOverride] = useState<number | null>(null);
  const [saveError, setSaveError] = useState("");
  const [items, setItems] = useState<QuotationItemForm[]>(
    initialData?.items?.length ? initialData.items.map(recalcItem) : [emptyItem()]
  );

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => getContacts(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });

  const { data: deals = [] } = useQuery({
    queryKey: ["deals"],
    queryFn: () => getDeals(),
  });

  const filteredContacts = useMemo(() => {
    const keyword = customerSearch.trim().toLowerCase();
    if (!keyword) return contacts as ContactOption[];
    return (contacts as ContactOption[]).filter((contact) =>
      [contactLabel(contact), contact.email, contact.phone, contact.company?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [contacts, customerSearch]);

  const filteredProjects = useMemo(() => {
    const keyword = projectSearch.trim().toLowerCase();
    if (!keyword) return projects as ProjectOption[];
    return (projects as ProjectOption[]).filter((project) => project.name.toLowerCase().includes(keyword));
  }, [projects, projectSearch]);

  const selectedContact = (contacts as ContactOption[]).find((contact) => contact.id === contactId);
  const selectedProject = (projects as ProjectOption[]).find((project) => project.id === projectId);

  const computedSubtotal = items.reduce((sum, item) => sum + numberValue(item.quantity) * numberValue(item.unitPrice), 0);
  const computedLineTax = items.reduce((sum, item) => {
    const amount = numberValue(item.quantity) * numberValue(item.unitPrice) - numberValue(item.discount);
    return sum + Math.max(0, amount) * (numberValue(item.tax) / 100);
  }, 0);
  const subtotal = subtotalOverride ?? computedSubtotal;
  const totalTax = totalTaxOverride ?? computedLineTax;
  const lineDiscount = items.reduce((sum, item) => sum + numberValue(item.discount), 0);
  const documentDiscount = discountType === "percent" ? subtotal * (discount / 100) : discount;
  const afterDiscount = Math.max(0, subtotal - lineDiscount - documentDiscount);
  const totalAmount = afterDiscount + totalTax;

  const payload = () => ({
        number: number.trim() || undefined,
        title,
        contactId: contactId || undefined,
        projectId: projectId || undefined,
        dealId: dealId || undefined,
        status,
        currency,
        subtotal,
        discount: documentDiscount + lineDiscount,
        discountType,
        tax: totalTax,
        taxRate: 0,
        total: totalAmount,
        validUntil: validUntil || undefined,
        notes,
        terms: [
          terms,
          quotationDate ? `Ngày lập: ${quotationDate}` : "",
          selectedProject ? `Dự án: ${selectedProject.name}` : "",
        ]
          .filter(Boolean)
          .join("\n\n"),
        items: items.map((item, index) => ({
          ...recalcItem(item),
          order: index,
        })),
      });

  const saveMutation = useMutation({
    mutationFn: (statusOverride?: string) => {
      const data = { ...payload(), status: statusOverride || status };
      return mode === "edit" && initialData?.id ? updateQuotation(initialData.id, data) : createQuotation(data);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation", result?.id || initialData?.id] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Không thể lưu báo giá.";
      setSaveError(message);
    },
  });

  const addItem = () => setItems((current) => [...current, emptyItem()]);
  const removeItem = (index: number) => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  const addAttachments = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const incoming = Array.from(fileList);
    setAttachments((current) => {
      const keys = new Set(current.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
      return [...current, ...incoming.filter((file) => !keys.has(`${file.name}-${file.size}-${file.lastModified}`))];
    });
  };
  const removeAttachment = (index: number) => {
    setAttachments((current) => current.filter((_, fileIndex) => fileIndex !== index));
  };
  const updateItem = (index: number, field: keyof QuotationItemForm, value: string | number) => {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const numericFields: Array<keyof QuotationItemForm> = ["quantity", "unitPrice", "discount", "tax"];
        const nextItem = {
          ...item,
          [field]: numericFields.includes(field) ? numberValue(value) : value,
        } as QuotationItemForm;
        return recalcItem(nextItem);
      })
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSave();
  };

  const handleSave = async (statusOverride?: string) => {
    setSaveError("");
    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề báo giá.");
      return;
    }
    if (!contactId) {
      alert("Vui lòng chọn khách hàng.");
      return;
    }
    try {
      const result = await saveMutation.mutateAsync(statusOverride);
      const quotationId = result?.id || initialData?.id;
      if (quotationId) {
        router.refresh();
        window.location.assign(`/workspace/finance/quotations/${quotationId}?t=${Date.now()}`);
        return;
      }
      router.refresh();
      window.location.assign(`/workspace/finance/quotations?t=${Date.now()}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể lưu báo giá.";
      setSaveError(message);
      alert(`Lưu báo giá thất bại: ${message}`);
    }
  };

  return (
    <div className="quote-page mx-auto max-w-[1440px] px-6 py-6">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
            <FileText className="h-4 w-4 text-orange-500" />
            Tài chính / Báo giá
          </div>
          <h1 className="text-[14px] font-light text-slate-950">
            {mode === "create" ? "Tạo báo giá" : `Báo giá ${initialData?.number || ""}`}
          </h1>
        </div>

        <div className="quote-form-actions">
          <button type="button" onClick={() => router.back()} className="quote-action-button quote-action-secondary">
            Quay lại
          </button>
          <button
            type="button"
            onClick={() => handleSave("DRAFT")}
            disabled={saveMutation.isPending}
            className="quote-action-button quote-action-secondary"
          >
            {saveMutation.isPending ? "Đang lưu..." : "Lưu nháp"}
          </button>
          <button
            type="submit"
            form="quotation-form"
            disabled={saveMutation.isPending}
            className="quote-action-button quote-action-primary"
          >
            {saveMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      {saveError ? (
        <div className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-light text-red-700">
          Lưu báo giá thất bại: {saveError}
        </div>
      ) : null}

      <form id="quotation-form" onSubmit={handleSubmit} className="space-y-5">
          <section className="quote-panel">
            <div className="quote-panel-header">
              <h2>Thông tin chung</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Field label="Số báo giá">
                <input
                  value={number}
                  onChange={(event) => setNumber(event.target.value)}
                  className="quote-input"
                  placeholder="Tự sinh nếu bỏ trống"
                />
              </Field>
              <Field label="Ngày lập">
                <div className="relative">
                  <CalendarDays className="quote-input-icon quote-input-icon-left" />
                  <input
                    type="date"
                    value={quotationDate}
                    onChange={(event) => setQuotationDate(event.target.value)}
                    className="quote-input quote-input-with-left-icon"
                  />
                </div>
              </Field>
              <Field label="Hạn chót">
                <input
                  type="date"
                  value={validUntil}
                  onChange={(event) => setValidUntil(event.target.value)}
                  className="quote-input"
                />
              </Field>
              <Field label="Trạng thái">
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="quote-input">
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Tiêu đề" className="md:col-span-3">
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="quote-input"
                  placeholder="VD: Báo giá dịch vụ Digital Marketing"
                  required
                />
              </Field>
              <Field label="Loại tiền">
                <select value={currency} onChange={(event) => setCurrency(event.target.value)} className="quote-input">
                  <option value="VND">VND</option>
                  <option value="USD">USD</option>
                </select>
              </Field>
            </div>
          </section>

          <section className="quote-panel">
            <div className="quote-panel-header">
              <h2>Tệp đính kèm</h2>
              <span>Upload brief, file báo giá cũ, hình ảnh, hợp đồng mẫu</span>
            </div>

            <div className="quote-upload-grid">
              <label className="quote-upload-zone">
                <input
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    addAttachments(event.target.files);
                    event.currentTarget.value = "";
                  }}
                />
                <span className="quote-upload-icon">
                  <FileUp className="h-5 w-5" />
                </span>
                <strong>Chọn file hoặc kéo thả vào đây</strong>
                <small>PDF, DOCX, XLSX, PNG, JPG. Dữ liệu upload sẽ nối backend file ở bước tiếp theo.</small>
              </label>

              <div className="quote-upload-list">
                {attachments.length ? (
                  attachments.map((file, index) => (
                    <div key={`${file.name}-${file.size}-${file.lastModified}`} className="quote-upload-file">
                      <FileText className="h-4 w-4 text-orange-500" />
                      <div>
                        <strong>{file.name}</strong>
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                      <button type="button" onClick={() => removeAttachment(index)} title="Gỡ file">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="quote-upload-empty">Chưa có tệp nào được chọn.</div>
                )}
              </div>
            </div>
          </section>

          <section className="quote-panel">
            <div className="quote-panel-header">
              <h2>Khách hàng và dự án</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Field label="Đối tượng báo giá">
                <select className="quote-input" defaultValue="company">
                  <option value="company">Công ty</option>
                  <option value="contact">Liên hệ</option>
                  <option value="lead">Lead</option>
                </select>
              </Field>
              <ComboSelect
                label="Khách hàng"
                value={contactId}
                search={customerSearch}
                selectedTitle={selectedContact ? contactLabel(selectedContact) : undefined}
                onSearchChange={setCustomerSearch}
                placeholder="Gõ tên, email hoặc mã khách hàng..."
                options={filteredContacts}
                getTitle={contactLabel}
                getSubtitle={(contact) => [contact.company?.name, contact.email, contact.phone].filter(Boolean).join(" · ")}
                onSelect={setContactId}
              />
              <ComboSelect
                label="Liên kết dự án"
                value={projectId}
                search={projectSearch}
                selectedTitle={selectedProject?.name}
                onSearchChange={setProjectSearch}
                placeholder="Gõ tên dự án..."
                options={filteredProjects}
                getTitle={(project) => project.name}
                getSubtitle={(project) => (project.status ? `Trạng thái: ${project.status}` : "")}
                onSelect={setProjectId}
                allowEmpty
                emptyTitle="Không gắn dự án"
              />
              <Field label="Deal / Cơ hội" className="lg:col-start-3">
                <select value={dealId} onChange={(event) => setDealId(event.target.value)} className="quote-input">
                  <option value="">Không gắn deal</option>
                  {(deals as DealOption[]).map((deal) => (
                    <option key={deal.id} value={deal.id}>
                      {deal.title}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          <section className="quote-panel">
            <div className="quote-panel-header">
              <h2 className="quote-work-heading">Nội dung công việc</h2>
              <button type="button" onClick={addItem} className="quote-button quote-button-soft">
                <Plus className="h-4 w-4" />
                Thêm dòng
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="quote-item-grid">
                  <Field label="Tên SP/Dịch vụ" className="lg:col-span-3">
                    <input
                      value={item.name}
                      onChange={(event) => updateItem(index, "name", event.target.value)}
                      className="quote-input"
                      placeholder="Tên hạng mục"
                    />
                  </Field>
                  <Field label="Số lượng">
                    <input
                      type="number"
                      min={0}
                      value={item.quantity}
                      onChange={(event) => updateItem(index, "quantity", event.target.value)}
                      className="quote-input"
                    />
                  </Field>
                  <Field label="Đơn giá">
                    <input
                      type="number"
                      min={0}
                      value={item.unitPrice}
                      onChange={(event) => updateItem(index, "unitPrice", event.target.value)}
                      className="quote-input"
                    />
                  </Field>
                  <Field label="Chiết khấu">
                    <input
                      type="number"
                      min={0}
                      value={item.discount}
                      onChange={(event) => updateItem(index, "discount", event.target.value)}
                      className="quote-input"
                    />
                  </Field>
                  <Field label="Thuế %">
                    <input
                      type="number"
                      min={0}
                      value={item.tax}
                      onChange={(event) => updateItem(index, "tax", event.target.value)}
                      className="quote-input"
                    />
                  </Field>
                  <Field label="Thành tiền">
                    <input readOnly value={formatCurrency(item.total)} className="quote-input bg-slate-50 text-slate-500" />
                  </Field>
                  <button type="button" onClick={() => removeItem(index)} className="quote-icon-button" title="Xóa dòng">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <Field label="Mô tả dài / long description" className="lg:col-span-9">
                    <textarea
                      rows={3}
                      value={item.description}
                      onChange={(event) => updateItem(index, "description", event.target.value)}
                      className="quote-input min-h-[92px] resize-y"
                      placeholder="Nhập mô tả chi tiết, phạm vi công việc, ghi chú riêng cho hạng mục..."
                    />
                  </Field>
                </div>
              ))}
            </div>

            <div className="quote-inline-total">
              <div className="quote-inline-total-columns">
                <div className="quote-inline-total-group">
                <Field label="Loại chiết khấu">
                  <select value={discountType} onChange={(event) => setDiscountType(event.target.value)} className="quote-input">
                    <option value="fixed">VND</option>
                    <option value="percent">%</option>
                  </select>
                </Field>
                <Field label="Chiết khấu">
                  <input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={(event) => setDiscount(numberValue(event.target.value))}
                    className="quote-input"
                  />
                </Field>
                <div className="quote-total-row">
                  <span>Tổng chiết khấu</span>
                  <strong>-{formatCurrency(lineDiscount)}</strong>
                </div>
                </div>

                <div className="quote-inline-total-group">
                <Field label="Tạm tính">
                  <input
                    type="number"
                    min={0}
                    value={subtotal}
                    onChange={(event) => {
                      setSubtotalOverride(numberValue(event.target.value));
                    }}
                    className="quote-input"
                  />
                </Field>
                <Field label="Tổng thuế">
                  <input
                    type="number"
                    min={0}
                    value={totalTax}
                    onChange={(event) => {
                      setTotalTaxOverride(numberValue(event.target.value));
                    }}
                    className="quote-input"
                  />
                </Field>
                <div className="quote-grand-total">
                  <span>Tổng báo giá</span>
                  <strong>{formatCurrency(totalAmount)}</strong>
                </div>
              </div>
              </div>
            </div>
          </section>

          <section className="quote-panel">
            <div className="quote-panel-header">
              <h2>Nội dung chi tiết</h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Ghi chú gửi khách">
                <textarea
                  rows={7}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="quote-input min-h-[180px] resize-y"
                  placeholder="Nội dung hiển thị cho khách trong báo giá..."
                />
              </Field>
              <Field label="Điều khoản / Nội dung thêm">
                <textarea
                  rows={7}
                  value={terms}
                  onChange={(event) => setTerms(event.target.value)}
                  className="quote-input min-h-[180px] resize-y"
                  placeholder="Điều kiện thanh toán, hiệu lực báo giá, phạm vi triển khai..."
                />
              </Field>
            </div>
          </section>
      </form>

    </div>
  );
}
