"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, FileText, FileUp, Plus, Search, Trash2, X } from "lucide-react";

import { createContract, createInvoiceFromInstallment, updateContract } from "@/app/actions/finance-crud";
import { getContacts, getDeals } from "@/app/actions/crm";
import { normalizePaymentChannelKeys, paymentChannelOptions, type PaymentChannelKey } from "@/lib/finance/payment-channels";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";

type ContractMode = "create" | "edit";

type ContactOption = {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  company?: { name?: string | null } | null;
};

type DealOption = {
  id: string;
  title?: string | null;
  name?: string | null;
  value?: unknown;
};

type ContractItemForm = {
  id?: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  order?: number;
};

type InstallmentForm = {
  id?: string;
  name: string;
  amount: number;
  dueDate: string;
  status?: string;
  invoiceId?: string | null;
  invoice?: { id: string; number?: string | null } | null;
};

type InitialContract = {
  id?: string;
  number?: string;
  title?: string;
  status?: string;
  contactId?: string | null;
  dealId?: string | null;
  currency?: string;
  paymentChannels?: unknown;
  subtotal?: unknown;
  discount?: unknown;
  discountType?: string;
  tax?: unknown;
  total?: unknown;
  notes?: string | null;
  terms?: string | null;
  validFrom?: string | Date | null;
  validUntil?: string | Date | null;
  quotationId?: string;
  items?: ContractItemForm[];
  paymentInstallments?: InstallmentForm[];
};

const statusOptions = [
  { value: "DRAFT", label: "Nháp" },
  { value: "SENT", label: "Đã gửi" },
  { value: "SIGNED", label: "Đã ký" },
  { value: "EXPIRED", label: "Hết hạn" },
  { value: "CANCELLED", label: "Đã hủy" },
];

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function nextYearInputValue() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
}

function toInputDate(value?: string | Date | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function numberValue(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
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

function contactLabel(contact: ContactOption) {
  const fullName = contact.name || `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
  return fullName || contact.email || "Khách hàng chưa đặt tên";
}

function dealLabel(deal: DealOption) {
  return deal.title || deal.name || "Deal chưa đặt tên";
}

function emptyItem(): ContractItemForm {
  return { name: "", description: "", quantity: 1, unitPrice: 0, total: 0 };
}

function recalcItem(item: ContractItemForm): ContractItemForm {
  const total = numberValue(item.quantity) * numberValue(item.unitPrice);
  return { ...item, description: normalizeLegacyText(item.description), total };
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  if (size >= 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${size} B`;
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
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
  allowEmpty,
  emptyTitle,
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
  allowEmpty?: boolean;
  emptyTitle?: string;
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

export function ContractFormClient({ mode, initialData }: { mode: ContractMode; initialData?: InitialContract }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  const [number, setNumber] = useState(initialData?.number || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [contactId, setContactId] = useState(searchParams?.get("contactId") || initialData?.contactId || "");
  const [dealId, setDealId] = useState(initialData?.dealId || "");
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [currency, setCurrency] = useState(initialData?.currency || "VND");
  const [paymentChannels, setPaymentChannels] = useState<PaymentChannelKey[]>(normalizePaymentChannelKeys(initialData?.paymentChannels));
  const [discountType, setDiscountType] = useState(initialData?.discountType || "fixed");
  const [discount, setDiscount] = useState(numberValue(initialData?.discount));
  const [validFrom, setValidFrom] = useState(toInputDate(initialData?.validFrom) || todayInputValue());
  const [validUntil, setValidUntil] = useState(toInputDate(initialData?.validUntil) || nextYearInputValue());
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [terms, setTerms] = useState(initialData?.terms || "");
  const [customerSearch, setCustomerSearch] = useState("");
  const [dealSearch, setDealSearch] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [saveError, setSaveError] = useState("");
  const [items, setItems] = useState<ContractItemForm[]>(
    initialData?.items?.length ? initialData.items.map((item) => recalcItem({ ...item, description: normalizeLegacyText(item.description) })) : [emptyItem()]
  );
  const [installments, setInstallments] = useState<InstallmentForm[]>(
    initialData?.paymentInstallments?.length
      ? initialData.paymentInstallments.map((item) => ({ ...item, amount: numberValue(item.amount), dueDate: toInputDate(item.dueDate) || todayInputValue() }))
      : []
  );
  const initialSubtotal = numberValue(initialData?.subtotal);
  const initialTax = numberValue(initialData?.tax);
  const [subtotalOverride, setSubtotalOverride] = useState<number | null>(initialSubtotal > 0 ? initialSubtotal : null);
  const [totalTaxOverride, setTotalTaxOverride] = useState<number | null>(initialTax > 0 ? initialTax : null);

  const { data: contacts = [] } = useQuery({ queryKey: ["contacts"], queryFn: () => getContacts() });
  const { data: deals = [] } = useQuery({ queryKey: ["deals"], queryFn: () => getDeals() });

  const filteredContacts = useMemo(() => {
    const keyword = customerSearch.trim().toLowerCase();
    if (!keyword) return contacts as ContactOption[];
    return (contacts as ContactOption[]).filter((contact) =>
      [contactLabel(contact), contact.email, contact.phone, contact.company?.name].filter(Boolean).join(" ").toLowerCase().includes(keyword)
    );
  }, [contacts, customerSearch]);

  const filteredDeals = useMemo(() => {
    const keyword = dealSearch.trim().toLowerCase();
    if (!keyword) return deals as DealOption[];
    return (deals as DealOption[]).filter((deal) => dealLabel(deal).toLowerCase().includes(keyword));
  }, [deals, dealSearch]);

  const selectedContact = (contacts as ContactOption[]).find((contact) => contact.id === contactId);
  const selectedDeal = (deals as DealOption[]).find((deal) => deal.id === dealId);
  const computedSubtotal = items.reduce((sum, item) => sum + numberValue(item.total), 0);
  const subtotal = subtotalOverride ?? computedSubtotal;
  const totalTax = totalTaxOverride ?? 0;
  const lineDiscount = 0;
  const documentDiscount = discountType === "percent" ? subtotal * (discount / 100) : discount;
  const totalDiscount = lineDiscount + documentDiscount;
  const totalAmount = Math.max(0, subtotal - totalDiscount) + totalTax;
  const installmentTotal = installments.reduce((sum, item) => sum + numberValue(item.amount), 0);

  const saveMutation = useMutation({
    mutationFn: (statusOverride?: string) => {
      const payload = {
        number: number.trim() || undefined,
        title,
        contactId: contactId || undefined,
        dealId: dealId || undefined,
        status: statusOverride || status,
        currency,
        paymentChannels,
        subtotal,
        discount: totalDiscount,
        discountType,
        tax: totalTax,
        total: totalAmount,
        validFrom,
        validUntil,
        notes,
        terms,
        quotationId: initialData?.quotationId,
        items: items.map((item, index) => ({ ...recalcItem(item), order: index })),
        paymentInstallments: installments.map((item) => ({ ...item, amount: numberValue(item.amount), dueDate: item.dueDate || todayInputValue() })),
      };
      return mode === "edit" && initialData?.id ? updateContract(initialData.id, payload) : createContract(payload);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["contract", result?.id || initialData?.id] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Không thể lưu hợp đồng.";
      setSaveError(message);
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (installmentId: string) => createInvoiceFromInstallment(installmentId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      router.push(`/workspace/finance/invoices/${result.invoiceId}`);
    },
    onError: (error) => alert(error instanceof Error ? error.message : "Không thể tạo hóa đơn."),
  });

  const handleSave = async (statusOverride?: string) => {
    setSaveError("");
    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề hợp đồng.");
      return;
    }
    if (!contactId) {
      alert("Vui lòng chọn khách hàng.");
      return;
    }
    try {
      const result = await saveMutation.mutateAsync(statusOverride);
      const contractId = result?.id || initialData?.id;
      if (contractId) {
        router.refresh();
        window.location.assign(`/workspace/finance/contracts/${contractId}?t=${Date.now()}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể lưu hợp đồng.";
      setSaveError(message);
      alert(`Lưu hợp đồng thất bại: ${message}`);
    }
  };

  const addAttachments = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const incoming = Array.from(fileList);
    setAttachments((current) => {
      const keys = new Set(current.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
      return [...current, ...incoming.filter((file) => !keys.has(`${file.name}-${file.size}-${file.lastModified}`))];
    });
  };
  const removeAttachment = (index: number) => setAttachments((current) => current.filter((_, fileIndex) => fileIndex !== index));
  const addItem = () => setItems((current) => [...current, emptyItem()]);
  const removeItem = (index: number) => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  const updateItem = (index: number, field: keyof ContractItemForm, value: string | number) => {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const numericFields: Array<keyof ContractItemForm> = ["quantity", "unitPrice"];
        return recalcItem({ ...item, [field]: numericFields.includes(field) ? numberValue(value) : value } as ContractItemForm);
      })
    );
  };
  const addInstallment = () => setInstallments((current) => [...current, { name: `Đợt ${current.length + 1}`, amount: 0, dueDate: todayInputValue() }]);
  const removeInstallment = (index: number) => setInstallments((current) => current.filter((_, itemIndex) => itemIndex !== index));
  const updateInstallment = (index: number, field: keyof InstallmentForm, value: string | number) => {
    setInstallments((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: field === "amount" ? numberValue(value) : value } : item)));
  };
  const togglePaymentChannel = (key: PaymentChannelKey) => {
    setPaymentChannels((current) => {
      const next = current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
      return next.length ? next : ["company"];
    });
  };

  return (
    <div className="quote-page mx-auto max-w-[1440px] px-6 py-6">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
            <FileText className="h-4 w-4 text-orange-500" />
            Tài chính / Hợp đồng
          </div>
          <h1 className="text-[14px] font-light text-slate-950">
            {mode === "create" ? "Tạo hợp đồng" : `Hợp đồng ${initialData?.number || ""}`}
          </h1>
        </div>

        <div className="quote-form-actions">
          <button type="button" onClick={() => router.back()} className="quote-action-button quote-action-secondary">Quay lại</button>
          <button type="button" onClick={() => handleSave("DRAFT")} disabled={saveMutation.isPending} className="quote-action-button quote-action-secondary">
            {saveMutation.isPending ? "Đang lưu..." : "Lưu nháp"}
          </button>
          <button type="button" onClick={() => handleSave()} disabled={saveMutation.isPending} className="quote-action-button quote-action-primary">
            {saveMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      {saveError ? <div className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-light text-red-700">Lưu hợp đồng thất bại: {saveError}</div> : null}

      <form className="quote-form-grid" onSubmit={(event) => event.preventDefault()}>
        <section className="quote-panel quote-payment-sidebar">
          <div className="quote-panel-header"><h2>Thông tin chung</h2></div>
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Số hợp đồng">
              <input value={number} onChange={(event) => setNumber(event.target.value)} className="quote-input" placeholder="Tự sinh nếu bỏ trống" />
            </Field>
            <Field label="Hiệu lực từ">
              <div className="relative">
                <CalendarDays className="quote-input-icon quote-input-icon-left" />
                <input type="date" value={validFrom} onChange={(event) => setValidFrom(event.target.value)} className="quote-input quote-input-with-left-icon" />
              </div>
            </Field>
            <Field label="Hiệu lực đến">
              <input type="date" value={validUntil} onChange={(event) => setValidUntil(event.target.value)} className="quote-input" />
            </Field>
            <Field label="Trạng thái">
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="quote-input">
                {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            <Field label="Tiêu đề hợp đồng" className="md:col-span-3">
              <input value={title} onChange={(event) => setTitle(event.target.value)} className="quote-input" placeholder="VD: Hợp đồng dịch vụ Digital Marketing" required />
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
            <span>Upload bản scan, phụ lục, file hợp đồng mẫu</span>
          </div>
          <div className="quote-upload-grid">
            <label className="quote-upload-zone">
              <input type="file" multiple className="sr-only" onChange={(event) => { addAttachments(event.target.files); event.currentTarget.value = ""; }} />
              <span className="quote-upload-icon"><FileUp className="h-5 w-5" /></span>
              <strong>Chọn file hoặc kéo thả vào đây</strong>
              <small>PDF, DOCX, XLSX, PNG, JPG. Dữ liệu upload sẽ nối backend file ở bước tiếp theo.</small>
            </label>
            <div className="quote-upload-list">
              {attachments.length ? attachments.map((file, index) => (
                <div key={`${file.name}-${file.size}-${file.lastModified}`} className="quote-upload-file">
                  <FileText className="h-4 w-4 text-orange-500" />
                  <div><strong>{file.name}</strong><span>{formatFileSize(file.size)}</span></div>
                  <button type="button" onClick={() => removeAttachment(index)} title="Gỡ file"><X className="h-4 w-4" /></button>
                </div>
              )) : <div className="quote-upload-empty">Chưa có tệp nào được chọn.</div>}
            </div>
          </div>
        </section>

        <section className="quote-panel">
          <div className="quote-panel-header"><h2>Khách hàng và liên kết</h2></div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ComboSelect
              label="Khách hàng"
              value={contactId}
              search={customerSearch}
              selectedTitle={selectedContact ? contactLabel(selectedContact) : undefined}
              onSearchChange={setCustomerSearch}
              placeholder="Gõ tên, email hoặc công ty..."
              options={filteredContacts}
              getTitle={contactLabel}
              getSubtitle={(contact) => [contact.company?.name, contact.email, contact.phone].filter(Boolean).join(" · ")}
              onSelect={setContactId}
            />
            <ComboSelect
              label="Deal / Cơ hội"
              value={dealId}
              search={dealSearch}
              selectedTitle={selectedDeal ? dealLabel(selectedDeal) : undefined}
              onSearchChange={setDealSearch}
              placeholder="Gõ tên deal..."
              options={filteredDeals}
              getTitle={dealLabel}
              getSubtitle={(deal) => (deal.value ? formatCurrency(numberValue(deal.value)) : "")}
              onSelect={setDealId}
              allowEmpty
              emptyTitle="Không gắn deal"
            />
          </div>
        </section>

        <section className="quote-panel">
          <div className="quote-panel-header">
            <h2>Kênh thanh toán</h2>
            <span>Hiển thị trên hợp đồng, hóa đơn và mã QR VietQR</span>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {paymentChannelOptions.map((channel) => (
              <label key={channel.key} className={cn("quote-payment-channel", paymentChannels.includes(channel.key) && "quote-payment-channel-active")}>
                <input
                  type="checkbox"
                  checked={paymentChannels.includes(channel.key)}
                  onChange={() => togglePaymentChannel(channel.key)}
                />
                <span>
                  <strong>{channel.optionLabel}</strong>
                  <small>{channel.accountName} · {channel.bankName}</small>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="quote-panel">
          <div className="quote-panel-header">
            <h2 className="quote-work-heading">Nội dung công việc</h2>
            <button type="button" onClick={addItem} className="quote-button quote-button-soft"><Plus className="h-4 w-4" />Thêm dòng</button>
          </div>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="quote-item-grid contract-item-grid">
                <Field label="Tên SP/Dịch vụ" className="lg:col-span-3">
                  <input value={item.name} onChange={(event) => updateItem(index, "name", event.target.value)} className="quote-input" placeholder="Tên hạng mục" />
                </Field>
                <Field label="Số lượng"><input type="number" value={item.quantity} min={0} onChange={(event) => updateItem(index, "quantity", event.target.value)} className="quote-input" /></Field>
                <Field label="Đơn giá"><input type="number" value={item.unitPrice} min={0} onChange={(event) => updateItem(index, "unitPrice", event.target.value)} className="quote-input" /></Field>
                <Field label="Thành tiền"><input value={formatCurrency(item.total)} readOnly className="quote-input bg-slate-50 text-slate-500" /></Field>
                <button type="button" onClick={() => removeItem(index)} className="quote-remove-line" title="Xóa dòng"><Trash2 className="h-4 w-4" /></button>
                <Field label="Mô tả dài / long description" className="lg:col-span-6">
                  <textarea value={item.description} onChange={(event) => updateItem(index, "description", event.target.value)} className="quote-input min-h-20" placeholder="Nhập mô tả chi tiết, phạm vi công việc..." />
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
                  <input type="number" min={0} value={discount} onChange={(event) => setDiscount(numberValue(event.target.value))} className="quote-input" />
                </Field>
                <div className="quote-total-row">
                  <span>Tổng chiết khấu</span>
                  <strong>-{formatCurrency(totalDiscount)}</strong>
                </div>
              </div>

              <div className="quote-inline-total-group">
                <Field label="Tạm tính">
                  <input type="number" min={0} value={subtotal} onChange={(event) => setSubtotalOverride(numberValue(event.target.value))} className="quote-input" />
                </Field>
                <Field label="Tổng thuế">
                  <input type="number" min={0} value={totalTax} onChange={(event) => setTotalTaxOverride(numberValue(event.target.value))} className="quote-input" />
                </Field>
                <div className="quote-total-row">
                  <span>Tổng đợt thanh toán</span>
                  <strong>{formatCurrency(installmentTotal)}</strong>
                </div>
                <div className="quote-grand-total">
                  <span>Giá trị hợp đồng</span>
                  <strong>{formatCurrency(totalAmount)}</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="quote-panel">
          <div className="quote-panel-header">
            <h2>Kế hoạch thanh toán</h2>
            <button type="button" onClick={addInstallment} className="quote-button quote-button-soft"><Plus className="h-4 w-4" />Thêm đợt</button>
          </div>
          <div className="space-y-3">
            {installments.map((inst, index) => (
              <div key={`${inst.id || "new"}-${index}`} className="contract-installment-form">
                <Field label="Tên đợt" className="lg:col-span-2"><input value={inst.name} onChange={(event) => updateInstallment(index, "name", event.target.value)} className="quote-input" /></Field>
                <Field label="Số tiền"><input type="number" value={inst.amount} min={0} onChange={(event) => updateInstallment(index, "amount", event.target.value)} className="quote-input" /></Field>
                <Field label="Hạn thanh toán"><input type="date" value={inst.dueDate} onChange={(event) => updateInstallment(index, "dueDate", event.target.value)} className="quote-input" /></Field>
                <div className="flex items-end gap-2">
                  {mode === "edit" && inst.id && !inst.invoiceId ? (
                    <button type="button" onClick={() => createInvoiceMutation.mutate(inst.id!)} className="quote-button quote-button-soft">Tạo hóa đơn</button>
                  ) : null}
                  {inst.invoiceId ? <Link href={`/workspace/finance/invoices/${inst.invoiceId}`} className="quote-button quote-button-soft">{inst.invoice?.number || "Xem hóa đơn"}</Link> : null}
                  {!inst.invoiceId ? <button type="button" onClick={() => removeInstallment(index)} className="quote-remove-line" title="Xóa đợt"><Trash2 className="h-4 w-4" /></button> : null}
                </div>
              </div>
            ))}
            {!installments.length ? <div className="quote-detail-empty">Chưa có kế hoạch thanh toán.</div> : null}
          </div>
        </section>

        <section className="quote-panel">
          <div className="quote-panel-header"><h2>Nội dung chi tiết</h2></div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Ghi chú nội bộ / gửi khách">
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="quote-input min-h-32" placeholder="Ghi chú hợp đồng..." />
            </Field>
            <Field label="Điều khoản / Nội dung thêm">
              <textarea value={terms} onChange={(event) => setTerms(event.target.value)} className="quote-input min-h-32" placeholder="Điều khoản thanh toán, hiệu lực, phạm vi triển khai..." />
            </Field>
          </div>
        </section>
      </form>
    </div>
  );
}
