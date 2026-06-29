"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, FileText, FileUp, Plus, Search, Trash2, X } from "lucide-react";

import { createInvoice, recordPayment, updateInvoice } from "@/app/actions/finance-crud";
import { getContacts } from "@/app/actions/crm";
import { normalizePaymentChannelKeys, paymentChannelOptions, type PaymentChannelKey } from "@/lib/finance/payment-channels";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { InvoicePaymentModal } from "./invoice-payment-modal";

type PaymentPayload = {
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
  paidAt: string;
};

type InvoiceMode = "create" | "edit";

type ContactOption = {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  company?: { name?: string | null } | null;
};

type InvoiceItemForm = {
  id?: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
  order?: number;
};

type InitialInvoice = {
  id?: string;
  number?: string;
  title?: string | null;
  status?: string;
  contactId?: string | null;
  projectId?: string | null;
  contractId?: string | null;
  currency?: string;
  paymentChannels?: unknown;
  subtotal?: unknown;
  discount?: unknown;
  discountType?: string;
  tax?: unknown;
  taxRate?: unknown;
  total?: unknown;
  amountPaid?: unknown;
  notes?: string | null;
  terms?: string | null;
  dueDate?: string | Date | null;
  issuedAt?: string | Date | null;
  items?: InvoiceItemForm[];
  payments?: Array<{ id: string; amount: unknown; method: string; paidAt?: string | Date | null; createdAt: string | Date }>;
};

const statusOptions = [
  { value: "DRAFT", label: "Nháp" },
  { value: "SENT", label: "Đã gửi" },
  { value: "VIEWED", label: "Đã xem" },
  { value: "PARTIAL", label: "Đặt cọc" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "OVERDUE", label: "Quá hạn" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "REFUNDED", label: "Hoàn tiền" },
];

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function nextWeekInputValue() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
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

function emptyItem(): InvoiceItemForm {
  return { name: "", description: "", quantity: 1, unitPrice: 0, discount: 0, tax: 0, total: 0 };
}

function recalcItem(item: InvoiceItemForm): InvoiceItemForm {
  const gross = numberValue(item.quantity) * numberValue(item.unitPrice);
  const afterDiscount = Math.max(0, gross - numberValue(item.discount));
  const lineTax = afterDiscount * (numberValue(item.tax) / 100);
  return { ...item, description: normalizeLegacyText(item.description), total: afterDiscount + lineTax };
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[14px] font-light text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function ComboSelect({
  value,
  search,
  selectedTitle,
  onSearchChange,
  options,
  onSelect,
}: {
  value: string;
  search: string;
  selectedTitle?: string;
  onSearchChange: (value: string) => void;
  options: ContactOption[];
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Field label="Khách hàng">
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
          placeholder="Gõ tên, email hoặc công ty..."
          type="search"
        />
        {open ? (
          <div className="quote-combo-menu">
            {options.slice(0, 9).map((contact) => (
              <button
                key={contact.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(contact.id);
                  onSearchChange(contactLabel(contact));
                  setOpen(false);
                }}
                className={cn("quote-combo-option", contact.id === value && "quote-combo-option-active")}
              >
                <span>{contactLabel(contact)}</span>
                <small>{[contact.company?.name, contact.email, contact.phone].filter(Boolean).join(" · ")}</small>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </Field>
  );
}

export function InvoiceFormClient({ mode, initialData }: { mode: InvoiceMode; initialData?: InitialInvoice }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  const [number, setNumber] = useState(initialData?.number || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [contactId, setContactId] = useState(searchParams?.get("contactId") || initialData?.contactId || "");
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [currency, setCurrency] = useState(initialData?.currency || "VND");
  const [paymentChannels, setPaymentChannels] = useState<PaymentChannelKey[]>(normalizePaymentChannelKeys(initialData?.paymentChannels));
  const [issuedAt, setIssuedAt] = useState(toInputDate(initialData?.issuedAt) || todayInputValue());
  const [dueDate, setDueDate] = useState(toInputDate(initialData?.dueDate) || nextWeekInputValue());
  const [discountType, setDiscountType] = useState(initialData?.discountType || "fixed");
  const [discount, setDiscount] = useState(numberValue(initialData?.discount));
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [terms, setTerms] = useState(initialData?.terms || "");
  const [customerSearch, setCustomerSearch] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [saveError, setSaveError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [items, setItems] = useState<InvoiceItemForm[]>(
    initialData?.items?.length
      ? initialData.items.map((item) => recalcItem({ ...item, description: normalizeLegacyText(item.description), discount: numberValue(item.discount), tax: numberValue(item.tax) }))
      : [emptyItem()]
  );
  const initialSubtotal = numberValue(initialData?.subtotal);
  const initialTax = numberValue(initialData?.tax);
  const [subtotalOverride, setSubtotalOverride] = useState<number | null>(initialSubtotal > 0 ? initialSubtotal : null);
  const [totalTaxOverride, setTotalTaxOverride] = useState<number | null>(initialTax > 0 ? initialTax : null);

  const { data: contacts = [] } = useQuery({ queryKey: ["contacts"], queryFn: () => getContacts() });

  const filteredContacts = useMemo(() => {
    const keyword = customerSearch.trim().toLowerCase();
    if (!keyword) return contacts as ContactOption[];
    return (contacts as ContactOption[]).filter((contact) =>
      [contactLabel(contact), contact.email, contact.phone, contact.company?.name].filter(Boolean).join(" ").toLowerCase().includes(keyword)
    );
  }, [contacts, customerSearch]);

  const selectedContact = (contacts as ContactOption[]).find((contact) => contact.id === contactId);
  const computedSubtotal = items.reduce((sum, item) => sum + numberValue(item.quantity) * numberValue(item.unitPrice), 0);
  const subtotal = subtotalOverride ?? computedSubtotal;
  const lineDiscount = items.reduce((sum, item) => sum + numberValue(item.discount), 0);
  const computedLineTax = items.reduce((sum, item) => {
    const gross = numberValue(item.quantity) * numberValue(item.unitPrice);
    return sum + Math.max(0, gross - numberValue(item.discount)) * (numberValue(item.tax) / 100);
  }, 0);
  const totalTax = totalTaxOverride ?? computedLineTax;
  const documentDiscount = discountType === "percent" ? subtotal * (discount / 100) : discount;
  const totalDiscount = lineDiscount + documentDiscount;
  const totalAmount = Math.max(0, subtotal - totalDiscount) + totalTax;
  const amountPaid = numberValue(initialData?.amountPaid) || (initialData?.payments || []).reduce((sum, item) => sum + numberValue(item.amount), 0);
  const amountDue = Math.max(0, totalAmount - amountPaid);

  const saveMutation = useMutation({
    mutationFn: (statusOverride?: string) => {
      const payload = {
        number: number.trim() || undefined,
        title,
        contactId: contactId || undefined,
        contractId: initialData?.contractId || undefined,
        projectId: initialData?.projectId || undefined,
        status: statusOverride || status,
        currency,
        paymentChannels,
        subtotal,
        discount: totalDiscount,
        discountType,
        tax: totalTax,
        taxRate: 0,
        total: totalAmount,
        amountPaid,
        issuedAt,
        dueDate,
        notes,
        terms,
        items: items.map((item, index) => ({ ...recalcItem(item), order: index })),
      };
      return mode === "edit" && initialData?.id ? updateInvoice(initialData.id, payload) : createInvoice(payload);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", result?.id || initialData?.id] });
    },
    onError: (error) => setSaveError(error instanceof Error ? error.message : "Không thể lưu hóa đơn."),
  });

  const paymentMutation = useMutation({
    mutationFn: (paymentData: PaymentPayload) => recordPayment(initialData!.id!, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setShowPaymentModal(false);
      router.refresh();
    },
  });

  const handleSave = async (statusOverride?: string) => {
    setSaveError("");
    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề hóa đơn.");
      return;
    }
    if (!contactId) {
      alert("Vui lòng chọn khách hàng.");
      return;
    }
    try {
      const result = await saveMutation.mutateAsync(statusOverride);
      const invoiceId = result?.id || initialData?.id;
      if (invoiceId) window.location.assign(`/workspace/finance/invoices/${invoiceId}?t=${Date.now()}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể lưu hóa đơn.";
      setSaveError(message);
      alert(`Lưu hóa đơn thất bại: ${message}`);
    }
  };

  const addAttachments = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setAttachments((current) => [...current, ...Array.from(fileList)]);
  };
  const removeAttachment = (index: number) => setAttachments((current) => current.filter((_, fileIndex) => fileIndex !== index));
  const addItem = () => setItems((current) => [...current, emptyItem()]);
  const removeItem = (index: number) => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  const updateItem = (index: number, field: keyof InvoiceItemForm, value: string | number) => {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const numericFields: Array<keyof InvoiceItemForm> = ["quantity", "unitPrice", "discount", "tax"];
        return recalcItem({ ...item, [field]: numericFields.includes(field) ? numberValue(value) : value } as InvoiceItemForm);
      })
    );
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
            <FileText className="h-4 w-4 text-orange-500" />Tài chính / Hóa đơn
          </div>
          <h1 className="text-[14px] font-light text-slate-950">{mode === "create" ? "Tạo hóa đơn" : `Hóa đơn ${initialData?.number || ""}`}</h1>
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

      {saveError ? <div className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-light text-red-700">Lưu hóa đơn thất bại: {saveError}</div> : null}

      <form className="quote-form-grid" onSubmit={(event) => event.preventDefault()}>
        <section className="quote-panel quote-payment-sidebar">
          <div className="quote-panel-header"><h2>Thông tin chung</h2></div>
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Số hóa đơn"><input value={number} onChange={(event) => setNumber(event.target.value)} className="quote-input" placeholder="Tự sinh nếu bỏ trống" /></Field>
            <Field label="Ngày lập"><div className="relative"><CalendarDays className="quote-input-icon quote-input-icon-left" /><input type="date" value={issuedAt} onChange={(event) => setIssuedAt(event.target.value)} className="quote-input quote-input-with-left-icon" /></div></Field>
            <Field label="Hạn thanh toán"><input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="quote-input" /></Field>
            <Field label="Trạng thái"><select value={status} onChange={(event) => setStatus(event.target.value)} className="quote-input">{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
            <Field label="Tiêu đề hóa đơn" className="md:col-span-3"><input value={title} onChange={(event) => setTitle(event.target.value)} className="quote-input" placeholder="VD: Hóa đơn thanh toán đợt 1" required /></Field>
            <Field label="Loại tiền"><select value={currency} onChange={(event) => setCurrency(event.target.value)} className="quote-input"><option value="VND">VND</option><option value="USD">USD</option></select></Field>
          </div>
        </section>

        <section className="quote-panel">
          <div className="quote-panel-header"><h2>Tệp đính kèm</h2><span>Upload hóa đơn mẫu, chứng từ, file đối soát</span></div>
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
                  <div><strong>{file.name}</strong><span>{Math.round(file.size / 1024)} KB</span></div>
                  <button type="button" onClick={() => removeAttachment(index)} title="Gỡ file"><X className="h-4 w-4" /></button>
                </div>
              )) : <div className="quote-upload-empty">Chưa có tệp nào được chọn.</div>}
            </div>
          </div>
        </section>

        <section className="quote-panel">
          <div className="quote-panel-header"><h2>Khách hàng và liên kết</h2></div>
          <ComboSelect
            value={contactId}
            search={customerSearch}
            selectedTitle={selectedContact ? contactLabel(selectedContact) : undefined}
            onSearchChange={setCustomerSearch}
            options={filteredContacts}
            onSelect={setContactId}
          />
        </section>

        <section className="quote-panel">
          <div className="quote-panel-header"><h2>Kênh thanh toán</h2><span>Hiển thị QR VietQR trên hóa đơn</span></div>
          <div className="grid gap-3 lg:grid-cols-2">
            {paymentChannelOptions.map((channel) => (
              <label key={channel.key} className={cn("quote-payment-channel", paymentChannels.includes(channel.key) && "quote-payment-channel-active")}>
                <input type="checkbox" checked={paymentChannels.includes(channel.key)} onChange={() => togglePaymentChannel(channel.key)} />
                <span><strong>{channel.optionLabel}</strong><small>{channel.accountName} · {channel.bankName}</small></span>
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
              <div key={index} className="quote-item-grid">
                <Field label="Tên SP/Dịch vụ" className="lg:col-span-3"><input value={item.name} onChange={(event) => updateItem(index, "name", event.target.value)} className="quote-input" placeholder="Tên hạng mục" /></Field>
                <Field label="Số lượng"><input type="number" value={item.quantity} min={0} onChange={(event) => updateItem(index, "quantity", event.target.value)} className="quote-input" /></Field>
                <Field label="Đơn giá"><input type="number" value={item.unitPrice} min={0} onChange={(event) => updateItem(index, "unitPrice", event.target.value)} className="quote-input" /></Field>
                <Field label="Chiết khấu"><input type="number" value={item.discount} min={0} onChange={(event) => updateItem(index, "discount", event.target.value)} className="quote-input" /></Field>
                <Field label="Thuế %"><input type="number" value={item.tax} min={0} onChange={(event) => updateItem(index, "tax", event.target.value)} className="quote-input" /></Field>
                <Field label="Thành tiền"><input value={formatCurrency(item.total)} readOnly className="quote-input bg-slate-50 text-slate-500" /></Field>
                <button type="button" onClick={() => removeItem(index)} className="quote-remove-line" title="Xóa dòng"><Trash2 className="h-4 w-4" /></button>
                <Field label="Mô tả dài / long description" className="lg:col-span-9">
                  <textarea value={item.description} onChange={(event) => updateItem(index, "description", event.target.value)} className="quote-input min-h-20" placeholder="Nhập mô tả chi tiết, phạm vi công việc..." />
                </Field>
              </div>
            ))}
          </div>
          <div className="quote-inline-total">
            <div className="quote-inline-total-columns">
              <div className="quote-inline-total-group">
                <Field label="Loại chiết khấu"><select value={discountType} onChange={(event) => setDiscountType(event.target.value)} className="quote-input"><option value="fixed">VND</option><option value="percent">%</option></select></Field>
                <Field label="Chiết khấu"><input type="number" min={0} value={discount} onChange={(event) => setDiscount(numberValue(event.target.value))} className="quote-input" /></Field>
                <div className="quote-total-row"><span>Tổng chiết khấu</span><strong>-{formatCurrency(totalDiscount)}</strong></div>
              </div>
              <div className="quote-inline-total-group">
                <Field label="Tạm tính"><input type="number" min={0} value={subtotal} onChange={(event) => setSubtotalOverride(numberValue(event.target.value))} className="quote-input" /></Field>
                <Field label="Tổng thuế"><input type="number" min={0} value={totalTax} onChange={(event) => setTotalTaxOverride(numberValue(event.target.value))} className="quote-input" /></Field>
                <div className="quote-total-row"><span>Đã thanh toán</span><strong>{formatCurrency(amountPaid)}</strong></div>
                <div className="quote-grand-total"><span>Tổng hóa đơn</span><strong>{formatCurrency(totalAmount)}</strong></div>
              </div>
            </div>
          </div>
        </section>

        {mode === "edit" ? (
          <section className="quote-panel">
            <div className="quote-panel-header">
              <h2>Thanh toán</h2>
              {amountDue > 0 ? <button type="button" onClick={() => setShowPaymentModal(true)} className="quote-button quote-button-soft"><Plus className="h-4 w-4" />Ghi nhận thanh toán</button> : null}
            </div>
            <div className="quote-side-list">
              <div><span>Đã thanh toán</span><strong>{formatCurrency(amountPaid)}</strong></div>
              <div><span>Còn lại</span><strong className="text-red-500">{formatCurrency(amountDue)}</strong></div>
              {(initialData?.payments || []).map((payment) => (
                <div key={payment.id}><span>{payment.method} · {formatDate(payment.paidAt || payment.createdAt)}</span><strong>{formatCurrency(numberValue(payment.amount))}</strong></div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="quote-panel">
          <div className="quote-panel-header"><h2>Nội dung chi tiết</h2></div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Ghi chú nội bộ / gửi khách"><textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="quote-input min-h-32" placeholder="Ghi chú hóa đơn..." /></Field>
            <Field label="Điều khoản / Nội dung thêm"><textarea value={terms} onChange={(event) => setTerms(event.target.value)} className="quote-input min-h-32" placeholder="Điều khoản thanh toán, hóa đơn VAT..." /></Field>
          </div>
        </section>
      </form>

      {mode === "edit" && initialData?.id ? (
        <InvoicePaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={(paymentData) => paymentMutation.mutate(paymentData)}
          amountDue={amountDue}
          isPending={paymentMutation.isPending}
        />
      ) : null}
    </div>
  );
}
