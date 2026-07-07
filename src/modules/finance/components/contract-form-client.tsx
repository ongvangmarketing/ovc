"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, FileText, FileUp, Plus, Search, Trash2, X } from "lucide-react";

import { createContract, createInvoiceFromInstallment, updateContract } from "@/app/actions/finance-crud";
import { getContacts, getCompanies, getContactAssignees, getDeals } from "@/app/actions/crm";
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
  address?: string | null;
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
  unit?: string;
  quantity: number;
  unitPrice: number;
  tax?: number;
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
  companyId?: string | null;
  assigneeId?: string | null;
  dealId?: string | null;
  customerSignatureRequired?: boolean;
  targetType?: "company" | "contact" | "lead";
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
  return { name: "", description: "", unit: "", quantity: 1, unitPrice: 0, tax: 0, total: 0 };
}

function recalcItem(item: ContractItemForm): ContractItemForm {
  const amount = numberValue(item.quantity) * numberValue(item.unitPrice);
  const taxAmount = amount * (numberValue(item.tax) / 100);
  const total = amount + taxAmount;
  return { ...item, total };
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

function SignatureToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="quote-signature-toggle sm:col-span-2" aria-label="Ký số">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className={cn("quote-switch", checked && "quote-switch-on")}>
        <span>Ký số</span>
      </span>
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
  const comboRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!comboRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [open]);

  return (
    <Field label={label}>
      <div ref={comboRef} className="quote-combo">
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
        {(value || search || selectedTitle) ? (
          <button
            type="button"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onSelect("");
              onSearchChange("");
              setOpen(false);
            }}
            onClick={(event) => event.preventDefault()}
            className="absolute right-2 top-[21px] z-50 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-xs font-semibold text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Xóa lựa chọn"
          >
            x
          </button>
        ) : null}
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
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [targetType, setTargetType] = useState(initialData?.targetType || "contact");
  const [companyId, setCompanyId] = useState("");
  const [assigneeId, setAssigneeId] = useState(initialData?.assigneeId || "");
  const [dealId, setDealId] = useState(initialData?.dealId || "");
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [currency, setCurrency] = useState(initialData?.currency || "VND");
  const [customerSignatureRequired, setCustomerSignatureRequired] = useState(initialData?.customerSignatureRequired !== false);
  const [paymentChannels, setPaymentChannels] = useState<PaymentChannelKey[]>(normalizePaymentChannelKeys(initialData?.paymentChannels));
  const [discountType, setDiscountType] = useState(initialData?.discountType || "fixed");
  const [discount, setDiscount] = useState(numberValue(initialData?.discount));
  const [validFrom, setValidFrom] = useState(toInputDate(initialData?.validFrom) || todayInputValue());
  const [validUntil, setValidUntil] = useState(toInputDate(initialData?.validUntil));
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [terms, setTerms] = useState(initialData?.terms || "");
  const [customerSearch, setCustomerSearch] = useState("");
  const [dealSearch, setDealSearch] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [saveError, setSaveError] = useState("");
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [items, setItems] = useState<ContractItemForm[]>(
    initialData?.items?.length ? initialData.items.map((item) => {
      const content = item.name || normalizeLegacyText(item.description) || "";
      return recalcItem({ ...item, name: content, unit: item.unit || "", description: content });
    }) : [emptyItem()]
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
  const { data: assignees = [] } = useQuery({ queryKey: ["assignees"], queryFn: () => getContactAssignees() });
  const { data: companies = [] } = useQuery({ queryKey: ["companies"], queryFn: () => getCompanies() });
  const { data: deals = [] } = useQuery({ queryKey: ["deals"], queryFn: () => getDeals() });

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");
    const updateLayout = () => setIsMobileLayout(media.matches);
    updateLayout();
    media.addEventListener("change", updateLayout);
    return () => media.removeEventListener("change", updateLayout);
  }, []);

  useEffect(() => {
    if (mode !== "create" || assigneeId) return;
    const currentUser = (assignees as any[]).find((item) => item.isCurrentUser);
    if (currentUser?.id) setAssigneeId(currentUser.id);
  }, [assigneeId, assignees, mode]);

  
  const [companySearch, setCompanySearch] = useState("");
  const filteredCompanies = useMemo(() => {
    const keyword = companySearch.trim().toLowerCase();
    if (!keyword) return companies as any[];
    return (companies as any[]).filter((company: any) => company.name?.toLowerCase().includes(keyword));
  }, [companies, companySearch]);

  const selectedCompany = (companies as any[]).find((c: any) => c.id === companyId);
  const selectedDeal = (deals as any[]).find((d: any) => d.id === dealId);
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
  const computedSubtotal = items.reduce((sum, item) => sum + numberValue(item.quantity) * numberValue(item.unitPrice), 0);
  const computedLineTax = items.reduce((sum, item) => {
    const amount = numberValue(item.quantity) * numberValue(item.unitPrice);
    return sum + amount * (numberValue(item.tax) / 100);
  }, 0);
  const subtotal = subtotalOverride ?? computedSubtotal;
  const totalTax = totalTaxOverride ?? computedLineTax;
  const lineDiscount = 0;
  const documentDiscount = discountType === "percent" ? subtotal * (discount / 100) : discount;
  const totalDiscount = lineDiscount + documentDiscount;
  const totalAmount = Math.max(0, subtotal - totalDiscount) + totalTax;
  const installmentTotal = installments.reduce((sum, item) => sum + numberValue(item.amount), 0);

  
  useEffect(() => {
    if (selectedContact) {
      setContactName(contactLabel(selectedContact));
      setContactPhone(selectedContact.phone || "");
      setContactEmail(selectedContact.email || "");
      setContactAddress(selectedContact.address || "");
      setCompanyName(selectedContact.company?.name || "");
    }
  }, [selectedContact]);

  const saveMutation = useMutation({
    mutationFn: (statusOverride?: string) => {
      const payload = {
        number: number.trim() || undefined,
        title,
        contactId: contactId || undefined,
        targetType,
        assigneeId: assigneeId || undefined,
        contactName: targetType !== 'company' ? (customerSearch || contactName) : undefined,
        companyName: targetType === 'company' ? (companySearch || companyName) : companyName,
        contactPhone,
        contactEmail,
        contactAddress,

        dealId: dealId || undefined,
        status: statusOverride || status,
        currency,
        customerSignatureRequired,
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
        items: items.map((item, index) => {
          const content = item.name || normalizeLegacyText(item.description) || "";
          return { ...recalcItem({ ...item, name: content, description: content }), order: index };
        }),
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
    if (field === "quantity" || field === "unitPrice") {
      setSubtotalOverride(null);
    }
    if (field === "quantity" || field === "unitPrice" || field === "tax") {
      setTotalTaxOverride(null);
    }
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const numericFields: Array<keyof ContractItemForm> = ["quantity", "unitPrice", "tax"];
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
  const mobileSingleColumnStyle = isMobileLayout
    ? { gridTemplateColumns: "minmax(0, 1fr)", minWidth: 0, width: "100%" }
    : undefined;
  const mobilePanelHeaderStyle = isMobileLayout ? { alignItems: "flex-start", gap: "0.5rem" } : undefined;

  return (
    <div className="quote-page mx-auto max-w-[1440px] px-3 py-4 sm:px-6 sm:py-6">
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

        <div className="quote-form-actions w-full lg:w-auto">
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

      <form className="quote-form-grid" style={mobileSingleColumnStyle} onSubmit={(event) => event.preventDefault()}>
        <section className="quote-panel quote-payment-sidebar">
          <div className="quote-panel-header"><h2>Thông tin chung</h2></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Số hợp đồng">
              <input value={number} onChange={(event) => setNumber(event.target.value)} className="quote-input" placeholder="Tự sinh nếu bỏ trống" />
            </Field>
            <Field label="Trạng thái">
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="quote-input">
                {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
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
            <Field label="Tiêu đề hợp đồng" className="sm:col-span-2">
              <input value={title} onChange={(event) => setTitle(event.target.value)} className="quote-input" placeholder="VD: Hợp đồng dịch vụ Digital Marketing" required />
            </Field>
            <Field label="Loại tiền" className="sm:col-span-2">
              <select value={currency} onChange={(event) => setCurrency(event.target.value)} className="quote-input">
                <option value="VND">VND</option>
                <option value="USD">USD</option>
              </select>
            </Field>
            <SignatureToggle
              checked={customerSignatureRequired}
              onChange={setCustomerSignatureRequired}
            />
          </div>
        </section>

        
        <section className="quote-panel">
          <div className="quote-panel-header"><h2>Khách hàng và dự án</h2></div>
          <div className="space-y-4">
            {/* Row 1 */}
            <div className="grid gap-4 lg:grid-cols-3 items-start">
              <Field label="Đối tượng báo giá">
                <select className="quote-input" value={targetType} onChange={(e) => setTargetType(e.target.value as any)}>
                  <option value="company">Công ty</option>
                  <option value="contact">Liên hệ</option>
                  <option value="lead">Lead</option>
                </select>
              </Field>
              {typeof assignees !== 'undefined' && (
                <ComboSelect
                  label="Người phụ trách"
                  value={assigneeId}
                  search=""
                  selectedTitle={assignees.find((a: any) => a.id === assigneeId)?.name}
                  onSearchChange={() => {}}
                  placeholder="Gõ tên người phụ trách..."
                  options={assignees}
                  getTitle={(a: any) => a.name}
                  onSelect={setAssigneeId}
                  allowEmpty
                />
              )}
              {typeof deals !== 'undefined' && (
                <ComboSelect
                  label="Deal / Cơ hội"
                  value={dealId}
                  search={dealSearch}
                  selectedTitle={selectedDeal ? dealLabel(selectedDeal) : undefined}
                  onSearchChange={setDealSearch}
                  placeholder="Gõ tên deal..."
                  options={filteredDeals}
                  getTitle={dealLabel}
                  getSubtitle={(deal: any) => (deal.value ? formatCurrency(numberValue(deal.value)) : "")}
                  onSelect={setDealId}
                  allowEmpty
                />
              )}
            </div>

            {/* Row 2 */}
            <div className="grid gap-4 lg:grid-cols-3 items-start">
              {targetType === "company" && typeof filteredCompanies !== 'undefined' ? (
                <ComboSelect
                  label="Công ty"
                  value={companyId}
                  search={companySearch}
                  selectedTitle={selectedCompany?.name || companyName}
                  onSearchChange={setCompanySearch}
                  placeholder="Gõ tên công ty..."
                  options={filteredCompanies}
                  getTitle={(c: any) => c.name}
                  getSubtitle={(c: any) => c.taxCode || ""}
                  onSelect={setCompanyId}
                  allowEmpty
                />
              ) : (
                <ComboSelect
                  label="Tên khách hàng"
                  value={contactId}
                  search={customerSearch}
                  selectedTitle={selectedContact ? contactLabel(selectedContact) : contactName}
                  onSearchChange={setCustomerSearch}
                  placeholder="Gõ tên, email hoặc mã..."
                  options={filteredContacts}
                  getTitle={contactLabel}
                  getSubtitle={(contact: any) => [contact.company?.name, contact.email, contact.phone].filter(Boolean).join(" · ")}
                  onSelect={setContactId}
                  allowEmpty
                />
              )}
              <Field label="Số điện thoại">
                <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="quote-input" placeholder="09xxxx..." />
              </Field>
              <Field label="Email">
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="quote-input" placeholder="email@..." />
              </Field>
            </div>

            {/* Row 3 */}
            <div className="grid gap-4 lg:grid-cols-2 items-start">
              <Field label="Địa chỉ">
                <input value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} className="quote-input" placeholder="Số nhà, đường..." />
              </Field>
              {targetType !== "company" && (
                <Field label="Công ty">
                  <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="quote-input" placeholder="Tên công ty (nếu có)" />
                </Field>
              )}
            </div>
          </div>
        </section>


        <section className="quote-panel">
          <div className="quote-panel-header">
            <h2>Kênh thanh toán</h2>
          </div>
          <div className="grid gap-3 lg:grid-cols-2" style={mobileSingleColumnStyle}>
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
          <div className="quote-panel-header" style={mobilePanelHeaderStyle}>
            <h2 className="quote-work-heading">Nội dung công việc</h2>
            <button type="button" onClick={addItem} className="quote-button quote-button-soft"><Plus className="h-4 w-4" />Thêm dòng</button>
          </div>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="quote-item-grid contract-item-grid" style={mobileSingleColumnStyle}>
                <Field label="Mô tả sản phẩm / dịch vụ">
                  <textarea
                    rows={3}
                    value={item.name}
                    onChange={(event) => updateItem(index, "name", event.target.value)}
                    className="quote-input min-h-[92px] resize-y"
                    placeholder="Nhập mô tả chi tiết, phạm vi công việc, ghi chú riêng cho hạng mục..."
                  />
                </Field>
                <Field label="Đơn vị"><input value={item.unit || ""} onChange={(event) => updateItem(index, "unit", event.target.value)} className="quote-input" placeholder="" /></Field>
                <Field label="Số lượng"><input type="number" value={item.quantity} min={0} onChange={(event) => updateItem(index, "quantity", event.target.value)} className="quote-input" /></Field>
                <Field label="Đơn giá"><input type="number" value={item.unitPrice} min={0} onChange={(event) => updateItem(index, "unitPrice", event.target.value)} className="quote-input" /></Field>
                <Field label="Thuế %"><input type="number" value={item.tax} min={0} onChange={(event) => updateItem(index, "tax", event.target.value)} className="quote-input" /></Field>
                <Field label="Thành tiền"><input value={formatCurrency(item.total)} readOnly className="quote-input bg-slate-50 text-slate-500" /></Field>
                <button type="button" onClick={() => removeItem(index)} className="quote-icon-button" title="Xóa dòng"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          <div className="quote-inline-total contract-inline-total">
            <div className="quote-inline-total-columns" style={mobileSingleColumnStyle}>
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

        <section className="quote-panel quote-compact-upload-panel">
          <div className="quote-panel-header" style={mobilePanelHeaderStyle}>
            <h2>Kế hoạch thanh toán</h2>
            <button type="button" onClick={addInstallment} className="quote-button quote-button-soft"><Plus className="h-4 w-4" />Thêm đợt</button>
          </div>
          <div className="space-y-3">
            {installments.map((inst, index) => (
              <div key={`${inst.id || "new"}-${index}`} className="contract-installment-form" style={mobileSingleColumnStyle}>
                <Field label="Tên đợt" className="lg:col-span-2"><input value={inst.name} onChange={(event) => updateInstallment(index, "name", event.target.value)} className="quote-input" /></Field>
                <Field label="Số tiền"><input type="number" value={inst.amount} min={0} onChange={(event) => updateInstallment(index, "amount", event.target.value)} className="quote-input" /></Field>
                <Field label="Hạn thanh toán"><input type="date" value={inst.dueDate} onChange={(event) => updateInstallment(index, "dueDate", event.target.value)} className="quote-input" /></Field>
                <div className="flex items-end gap-2">
                  {mode === "edit" && inst.id && !inst.invoiceId ? (
                    <button type="button" onClick={() => createInvoiceMutation.mutate(inst.id!)} className="quote-button quote-button-soft">Tạo hóa đơn</button>
                  ) : null}
                  {inst.invoiceId ? <Link href={`/workspace/finance/invoices/${inst.invoiceId}`} className="quote-button quote-button-soft">{inst.invoice?.number || "Xem hóa đơn"}</Link> : null}
                  {!inst.invoiceId ? <button type="button" onClick={() => removeInstallment(index)} className="quote-icon-button" title="Xóa đợt"><Trash2 className="h-4 w-4" /></button> : null}
                </div>
              </div>
            ))}
            {!installments.length ? <div className="quote-detail-empty">Chưa có kế hoạch thanh toán.</div> : null}
          </div>
        </section>

        <section className="quote-panel">
          <div className="quote-panel-header">
            <h2>Tệp đính kèm</h2>
          </div>
          <div className="quote-upload-grid" style={mobileSingleColumnStyle}>
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
          <div className="quote-panel-header"><h2>Ghi chú</h2></div>
          <div className="grid gap-4">
            <Field label="Ghi chú nội bộ / gửi khách">
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="quote-input min-h-32" placeholder="Ghi chú hợp đồng..." />
            </Field>
          </div>
        </section>

        <section className="quote-panel">
          <div className="quote-panel-header" style={mobilePanelHeaderStyle}>
            <h2>Điều khoản hợp đồng</h2>
          </div>
          <div className="contract-terms-editor">
            <Field label="Điều khoản / Nội dung thêm">
              <textarea value={terms} onChange={(event) => setTerms(event.target.value)} className="quote-input min-h-[360px] leading-7" placeholder="Điều khoản thanh toán, hiệu lực, phạm vi triển khai..." />
            </Field>
          </div>
        </section>
      
        </form>
    </div>
  );
}
