"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, FileUp, Plus, Search, Trash2, X } from "lucide-react";

import { createContract, createInvoiceFromInstallment, updateContract } from "@/app/actions/finance-crud";
import { getContacts, getCompanies, getContactAssignees, getDeals } from "@/app/actions/crm";
import { normalizePaymentChannelKeys, paymentChannelOptions, type PaymentChannelKey } from "@/lib/finance/payment-channels";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { CustomerFormSection } from "./customer-form-section";

type ContractMode = "create" | "edit";

type ContactOption = {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  company?: { id?: string; name?: string | null } | null;
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
  companyTaxCode?: string;
  companyRepresentative?: string;
  companyRepresentativeTitle?: string;
  contactIdentityNumber?: string;
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
    <label className="flex h-[46px] mt-[30px] cursor-pointer items-center justify-between rounded-lg border-transparent bg-gray-50/50 px-4 hover:bg-gray-100 transition-colors" aria-label="Ký số">
      <span className="text-[13px] font-medium text-black">{checked ? "Bật ký số" : "Tắt ký số"}</span>
      <div className={cn("relative h-5 w-9 rounded-full transition-colors", checked ? "bg-black" : "bg-gray-200")}>
        <div className={cn("absolute top-[2px] left-[2px] h-4 w-4 rounded-full bg-white transition-transform", checked && "translate-x-4")} />
      </div>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(event) => onChange(event.target.checked)} />
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
      <div ref={comboRef} className="relative">
        <Search className="absolute left-3 text-gray-400 h-4 w-4 top-[22px]" />
        <input
          value={search || selectedTitle || ""}
          onChange={(event) => {
            onSearchChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="w-full rounded-lg border-transparent bg-gray-50/50 pl-10 pr-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none"
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
          <div className="absolute z-[100] mt-1 max-h-60 w-full overflow-auto rounded-lg border border-[#eaeaea] bg-white py-1 shadow-lg">
            {allowEmpty ? (
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect("");
                  onSearchChange("");
                  setOpen(false);
                }}
                className={cn("cursor-pointer px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-100", !value && "bg-orange-50 text-orange-700")}
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
                className={cn("cursor-pointer px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-100", option.id === value && "bg-orange-50 text-orange-700")}
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
  const [companyTaxCode, setCompanyTaxCode] = useState(initialData?.companyTaxCode || "");
  const [representativeName, setRepresentativeName] = useState(initialData?.companyRepresentative || "");
  const [representativeTitle, setRepresentativeTitle] = useState(initialData?.companyRepresentativeTitle || "");
  const [contactIdentityNumber, setContactIdentityNumber] = useState(initialData?.contactIdentityNumber || "");
  const [targetType, setTargetType] = useState<"company" | "contact" | "lead">(initialData?.targetType as any || "contact");
  const [companyId, setCompanyId] = useState(initialData?.companyId || "");
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
  const [companySearch, setCompanySearch] = useState("");
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

  const handleCompanyChange = (id: string) => {
    setCompanyId(id);
    const company = (companies as any[]).find((c: any) => c.id === id);
    if (company) {
      setCompanyName(company.name);
      setCompanyTaxCode(company.taxCode || "");
    }
  };

  const handleContactChange = (id: string) => {
    setContactId(id);
    const contact = (contacts as ContactOption[]).find((c) => c.id === id);
    if (contact) {
      setContactName(contactLabel(contact));
      setContactPhone(contact.phone || "");
      setContactEmail(contact.email || "");
      setContactAddress(contact.address || "");
      setCompanyName(contact.company?.name || "");
      setCompanyId(contact.company?.id || "");
    }
  };

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

  const customerDisplayName = targetType === "company" ? companyName : (selectedContact ? contactLabel(selectedContact) : contactName);
  const customerInitial = customerDisplayName ? customerDisplayName.charAt(0).toUpperCase() : "?";
  const customerMeta = (targetType === "company" 
    ? [companyTaxCode].filter(Boolean) 
    : (selectedContact ? [selectedContact.company?.name, selectedContact.email, selectedContact.phone].filter(Boolean) : [])
  ) as string[];
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

  const saveMutation = useMutation({
    mutationFn: (statusOverride?: string) => {
      const payload = {
        number: number.trim() || undefined,
        title: title.trim() || `Hợp đồng ${number || ''}`,
        contactId: contactId || undefined,
        companyId: companyId || undefined,
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
        companyTaxCode,
        companyRepresentative: representativeName,
        companyRepresentativeTitle: representativeTitle,
        contactIdentityNumber,
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

    if (!contactId && !companyId) {
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-gray-400">
            Tài chính / Hợp đồng
          </div>
          <h1 className="text-[48px] md:text-[56px] font-medium tracking-tighter text-black leading-none">{mode === "create" ? "Tạo hợp đồng" : `Hợp đồng ${initialData?.number || ""}`}</h1>
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto">
          <button type="button" onClick={() => router.back()} className="rounded-full border border-[#eaeaea] bg-white px-6 py-2.5 text-[14px] font-medium text-black transition-colors hover:bg-gray-50">Quay lại</button>
          <button type="button" onClick={() => handleSave("DRAFT")} disabled={saveMutation.isPending} className="rounded-full border border-[#eaeaea] bg-white px-6 py-2.5 text-[14px] font-medium text-black transition-colors hover:bg-gray-50">
            {saveMutation.isPending ? "Đang lưu..." : "Lưu nháp"}
          </button>
          <button type="button" onClick={() => handleSave()} disabled={saveMutation.isPending} className="rounded-full bg-black px-6 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-gray-800">
            {saveMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      {saveError ? <div className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-light text-red-700">Lưu hợp đồng thất bại: {saveError}</div> : null}

      <form className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-10" onSubmit={(event) => event.preventDefault()}>
        <section className="rounded-2xl border border-[#eaeaea] bg-white p-6 md:p-8 lg:sticky lg:top-8 lg:col-span-4 lg:col-start-9 lg:row-span-12 lg:row-start-1">
          <div className="mb-8 flex items-center justify-between border-b border-[#eaeaea] pb-4">
            <h2 className="text-[24px] font-medium tracking-tight text-black">Thông tin chung</h2>
          </div>
          <div className="flex flex-col gap-6">
            <Field label="Số hợp đồng">
              <input value={number} onChange={(event) => setNumber(event.target.value)} className="w-full rounded-lg border-transparent bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" placeholder="Tự sinh nếu bỏ trống" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Hiệu lực từ">
                <input type="date" value={validFrom} onChange={(event) => setValidFrom(event.target.value)} className="w-full rounded-lg border-transparent bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" />
              </Field>
              <Field label="Hiệu lực đến">
                <input type="date" value={validUntil} onChange={(event) => setValidUntil(event.target.value)} className="w-full rounded-lg border-transparent bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Trạng thái">
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-lg border-transparent bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none">
                  {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </Field>
              <Field label="Loại tiền">
                <select value={currency} onChange={(event) => setCurrency(event.target.value)} className="w-full rounded-lg border-transparent bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none">
                  <option value="VND">VND</option>
                  <option value="USD">USD</option>
                </select>
              </Field>
            </div>
            <SignatureToggle
              checked={customerSignatureRequired}
              onChange={setCustomerSignatureRequired}
            />
          </div>
        </section>

        <CustomerFormSection
          customerInitial={customerInitial}
          customerDisplayName={customerDisplayName}
          customerMeta={customerMeta}
          targetType={targetType as any}
          setTargetType={setTargetType as any}
          assignees={assignees}
          assigneeId={assigneeId}
          setAssigneeId={setAssigneeId}
          companyId={companyId}
          companySearch={companySearch}
          selectedCompany={selectedCompany}
          companyName={companyName}
          setCompanySearch={setCompanySearch}
          handleCompanyChange={handleCompanyChange}
          setCompanyName={setCompanyName}
          filteredCompanies={filteredCompanies}
          representativeName={representativeName}
          setRepresentativeName={setRepresentativeName}
          representativeTitle={representativeTitle}
          setRepresentativeTitle={setRepresentativeTitle}
          companyTaxCode={companyTaxCode}
          setCompanyTaxCode={setCompanyTaxCode}
          contactId={contactId}
          customerSearch={customerSearch}
          selectedContact={selectedContact}
          contactName={contactName}
          setCustomerSearch={setCustomerSearch}
          handleContactChange={handleContactChange}
          setContactName={setContactName}
          filteredContacts={filteredContacts}
          contactPhone={contactPhone}
          setContactPhone={setContactPhone}
          contactEmail={contactEmail}
          setContactEmail={setContactEmail}
          contactAddress={contactAddress}
          setContactAddress={setContactAddress}
          contactIdentityNumber={contactIdentityNumber}
          setContactIdentityNumber={setContactIdentityNumber}
        />


        <section className="mb-8 rounded-2xl border border-[#eaeaea] bg-white p-6 md:p-8 lg:col-span-8 lg:col-start-1">
          <div className="mb-8 flex items-center justify-between border-b border-[#eaeaea] pb-4">
            <h2 className="text-[24px] font-medium tracking-tight text-black">Kênh thanh toán</h2>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {paymentChannelOptions.map((channel) => (
              <label key={channel.key} className={cn("flex cursor-pointer items-start gap-4 rounded-xl border border-[#eaeaea] bg-white p-4 transition-colors hover:border-orange-200 hover:bg-orange-50/50", paymentChannels.includes(channel.key) && "border-orange-500 bg-orange-50/50 ring-1 ring-orange-500")}>
                <input
                  type="checkbox"
                  className="mt-1 flex-shrink-0"
                  checked={paymentChannels.includes(channel.key)}
                  onChange={() => togglePaymentChannel(channel.key)}
                />
                <span className="flex flex-col">
                  <strong className="text-[14px] font-medium text-black">{channel.optionLabel}</strong>
                  <small className="text-[13px] text-gray-500">{channel.accountName} · {channel.bankName}</small>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-[#eaeaea] bg-white p-6 md:p-8 lg:col-span-8 lg:col-start-1">
          <div className="mb-8 flex items-center justify-between border-b border-[#eaeaea] pb-4">
            <h2 className="text-[24px] font-medium tracking-tight text-black">Nội dung công việc</h2>
            <button type="button" onClick={addItem} className="inline-flex items-center gap-2 rounded-md border border-[#eaeaea] bg-white px-4 py-2 text-[14px] font-medium text-black transition-colors hover:bg-gray-50"><Plus className="h-4 w-4" />Thêm dòng</button>
          </div>
          <div className="space-y-0">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col gap-4 border-b border-[#eaeaea] py-5 last:border-0">
                <Field label="Mô tả sản phẩm / dịch vụ">
                  <textarea
                    rows={3}
                    value={item.name}
                    onChange={(event) => updateItem(index, "name", event.target.value)}
                    className="w-full rounded-lg border-transparent bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none min-h-[92px] resize-y"
                    placeholder="Nhập mô tả chi tiết, phạm vi công việc, ghi chú riêng cho hạng mục..."
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-[1fr_1fr_1fr_1fr_1.5fr_auto] md:items-end">
                  <Field label="Đơn vị"><input value={item.unit || ""} onChange={(event) => updateItem(index, "unit", event.target.value)} className="w-full rounded-lg border-transparent bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" placeholder="" /></Field>
                  <Field label="Số lượng"><input type="number" value={item.quantity} min={0} onChange={(event) => updateItem(index, "quantity", event.target.value)} className="w-full rounded-lg border-transparent bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" /></Field>
                  <Field label="Đơn giá"><input type="number" value={item.unitPrice} min={0} onChange={(event) => updateItem(index, "unitPrice", event.target.value)} className="w-full rounded-lg border-transparent bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" /></Field>
                  <Field label="Thuế %"><input type="number" value={item.tax} min={0} onChange={(event) => updateItem(index, "tax", event.target.value)} className="w-full rounded-lg border-transparent bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" /></Field>
                  <Field label="Thành tiền"><input value={formatCurrency(item.total)} readOnly className="w-full rounded-lg border-transparent bg-gray-100/50 px-4 py-3 text-[14px] font-medium text-gray-500 transition-colors placeholder:text-gray-300 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" /></Field>
                  <button type="button" onClick={() => removeItem(index)} className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-lg border-transparent bg-gray-50/50 text-gray-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600" title="Xóa dòng"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-8 border-t border-[#eaeaea]">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="flex flex-col gap-4">
                <Field label="Loại chiết khấu">
                  <select value={discountType} onChange={(event) => setDiscountType(event.target.value)} className="w-full rounded-lg border-transparent bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none">
                    <option value="fixed">VND</option>
                    <option value="percent">%</option>
                  </select>
                </Field>
                <Field label="Chiết khấu">
                  <input type="number" min={0} value={discount} onChange={(event) => setDiscount(numberValue(event.target.value))} className="w-full rounded-lg border-transparent bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" />
                </Field>
                <div className="flex items-center justify-between border-t border-[#eaeaea] pt-4 text-sm text-gray-500">
                  <span>Tổng chiết khấu</span>
                  <strong>-{formatCurrency(totalDiscount)}</strong>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Field label="Tạm tính">
                  <input type="number" min={0} value={subtotal} onChange={(event) => setSubtotalOverride(numberValue(event.target.value))} className="w-full rounded-lg border-transparent bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" />
                </Field>
                <Field label="Tổng thuế">
                  <input type="number" min={0} value={totalTax} onChange={(event) => setTotalTaxOverride(numberValue(event.target.value))} className="w-full rounded-lg border-transparent bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" />
                </Field>
                <div className="flex items-center justify-between border-t border-[#eaeaea] pt-4 text-[16px] font-medium tracking-tight text-black">
                  <span>Tổng đợt thanh toán</span>
                  <strong>{formatCurrency(installmentTotal)}</strong>
                </div>
                <div className="flex items-center justify-between border-t border-[#eaeaea] pt-4 text-[20px] font-medium tracking-tight text-black">
                  <span>Giá trị hợp đồng</span>
                  <strong>{formatCurrency(totalAmount)}</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-[#eaeaea] bg-white p-6 md:p-8 lg:col-span-8 lg:col-start-1">
          <div className="mb-8 flex items-center justify-between border-b border-[#eaeaea] pb-4">
            <h2 className="text-[24px] font-medium tracking-tight text-black">Kế hoạch thanh toán</h2>
            <button type="button" onClick={addInstallment} className="inline-flex items-center gap-2 rounded-md border border-[#eaeaea] bg-white px-4 py-2 text-[14px] font-medium text-black transition-colors hover:bg-gray-50"><Plus className="h-4 w-4" />Thêm đợt</button>
          </div>
          <div className="space-y-0">
            {installments.map((inst, index) => (
              <div key={`${inst.id || "new"}-${index}`} className="grid gap-4 md:grid-cols-[2fr_1.5fr_1.5fr_auto] items-end border-b border-[#eaeaea] py-5 last:border-0">
                <Field label="Tên đợt"><input value={inst.name} onChange={(event) => updateInstallment(index, "name", event.target.value)} className="w-full rounded-lg border-transparent bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" /></Field>
                <Field label="Số tiền"><input type="number" value={inst.amount} min={0} onChange={(event) => updateInstallment(index, "amount", event.target.value)} className="w-full rounded-lg border-transparent bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" /></Field>
                <Field label="Hạn thanh toán"><input type="date" value={inst.dueDate} onChange={(event) => updateInstallment(index, "dueDate", event.target.value)} className="w-full rounded-lg border-transparent bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" /></Field>
                <div className="flex items-center gap-2 h-[46px]">
                  {mode === "edit" && inst.id && !inst.invoiceId ? (
                    <button type="button" onClick={() => createInvoiceMutation.mutate(inst.id!)} className="inline-flex items-center gap-2 rounded-md border border-[#eaeaea] bg-white px-4 py-2 text-[14px] font-medium text-black transition-colors hover:bg-gray-50">Tạo hóa đơn</button>
                  ) : null}
                  {inst.invoiceId ? <Link href={`/workspace/finance/invoices/${inst.invoiceId}`} className="inline-flex items-center gap-2 rounded-md border border-[#eaeaea] bg-white px-4 py-2 text-[14px] font-medium text-black transition-colors hover:bg-gray-50">{inst.invoice?.number || "Xem hóa đơn"}</Link> : null}
                  {!inst.invoiceId ? <button type="button" onClick={() => removeInstallment(index)} className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-lg border-transparent bg-gray-50/50 text-gray-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600" title="Xóa đợt"><Trash2 className="h-4 w-4" /></button> : null}
                </div>
              </div>
            ))}
            {!installments.length ? <div className="flex h-full min-h-[120px] items-center justify-center rounded-xl border border-dashed border-gray-200 text-[13px] text-gray-400">Chưa có kế hoạch thanh toán.</div> : null}
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-[#eaeaea] bg-white p-6 md:p-8 lg:col-span-8 lg:col-start-1">
          <div className="mb-8 flex items-center justify-between border-b border-[#eaeaea] pb-4">
            <h2 className="text-[24px] font-medium tracking-tight text-black">Tệp đính kèm</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center transition-colors hover:bg-gray-100">
              <input type="file" multiple className="sr-only" onChange={(event) => { addAttachments(event.target.files); event.currentTarget.value = ""; }} />
              <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm border border-[#eaeaea]">
                <FileUp className="h-5 w-5" />
              </span>
              <strong className="text-[14px] font-medium text-black">Chọn file hoặc kéo thả vào đây</strong>
              <small className="mt-1 text-[12px] text-gray-500">PDF, DOCX, XLSX, PNG, JPG. Dữ liệu upload sẽ nối backend file ở bước tiếp theo.</small>
            </label>

            <div className="flex flex-col gap-3">
              {attachments.length ? (
                attachments.map((file, index) => (
                  <div key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center gap-3 rounded-lg border border-[#eaeaea] bg-white p-3 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-orange-50 text-orange-500">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <strong className="truncate text-[13px] font-medium text-black">{file.name}</strong>
                      <span className="text-[11px] text-gray-500">{formatFileSize(file.size)}</span>
                    </div>
                    <button type="button" onClick={() => removeAttachment(index)} title="Gỡ file" className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex h-full min-h-[120px] items-center justify-center rounded-xl border border-dashed border-gray-200 text-[13px] text-gray-400">
                  Chưa có tệp nào được chọn.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-[#eaeaea] bg-white p-6 md:p-8 lg:col-span-8 lg:col-start-1">
          <div className="mb-8 flex items-center justify-between border-b border-[#eaeaea] pb-4">
            <h2 className="text-[24px] font-medium tracking-tight text-black">Ghi chú</h2>
          </div>
          <div className="grid gap-4">
            <Field label="Ghi chú nội bộ / gửi khách">
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="w-full rounded-lg border-transparent bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none min-h-32 resize-y" placeholder="Ghi chú hợp đồng..." />
            </Field>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-[#eaeaea] bg-white p-6 md:p-8 lg:col-span-8 lg:col-start-1">
          <div className="mb-8 flex items-center justify-between border-b border-[#eaeaea] pb-4">
            <h2 className="text-[24px] font-medium tracking-tight text-black">Điều khoản hợp đồng</h2>
          </div>
          <div className="contract-terms-editor">
            <Field label="Điều khoản / Nội dung thêm">
              <textarea value={terms} onChange={(event) => setTerms(event.target.value)} className="w-full rounded-lg border-transparent bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none min-h-[360px] leading-7 resize-y" placeholder="Điều khoản thanh toán, hiệu lực, phạm vi triển khai..." />
            </Field>
          </div>
        </section>
      
      </form>
    </div>
  );
}
