"use client";

import { useMemo, useState, useEffect, useRef } from "react";
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
import { getContacts, getDeals, getCompanies, getContactAssignees } from "@/app/actions/crm";
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
  address?: string | null;
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
  companyId?: string | null;
  assigneeId?: string | null;
};

type QuotationItemForm = {
  name: string;
  description: string;
  unit?: string;
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
  companyId?: string | null;
  assigneeId?: string | null;
  projectId?: string | null;
  dealId?: string | null;
  customerSignatureRequired?: boolean;
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
  unit: "",
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
  return { ...item, total: afterDiscount + taxAmount };
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

export function QuotationFormClient({
  mode,
  initialData,
  initialNumber,
}: {
  mode: QuotationMode;
  initialData?: InitialQuotation;
  initialNumber?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  const [number, setNumber] = useState(initialData?.number || initialNumber || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [contactId, setContactId] = useState(searchParams?.get("contactId") || initialData?.contactId || "");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyId, setCompanyId] = useState(searchParams?.get("companyId") || initialData?.companyId || "");
  const [targetType, setTargetType] = useState<"company" | "contact" | "lead">(initialData?.companyId ? "company" : initialData?.contactId ? "contact" : "company");
  const [assigneeId, setAssigneeId] = useState(initialData?.assigneeId || "");
  const [projectId, setProjectId] = useState(searchParams?.get("projectId") || initialData?.projectId || "");
  const [dealId, setDealId] = useState(initialData?.dealId || "");
  const [dealSearch, setDealSearch] = useState("");
  const [quotationDate, setQuotationDate] = useState(todayInputValue());
  const [validUntil, setValidUntil] = useState(toInputDate(initialData?.validUntil));
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [currency, setCurrency] = useState(initialData?.currency || "VND");
  const [customerSignatureRequired, setCustomerSignatureRequired] = useState(initialData?.customerSignatureRequired !== false);
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
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [items, setItems] = useState<QuotationItemForm[]>(
    initialData?.items?.length
      ? initialData.items.map((item) => {
          const content = item.name || normalizeLegacyText(item.description) || "";
          return recalcItem({ ...item, name: content, unit: item.unit || "", description: content });
        })
      : [emptyItem()]
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

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: () => getCompanies(),
  });

  const { data: assignees = [] } = useQuery({
    queryKey: ["assignees"],
    queryFn: () => getContactAssignees(),
  });

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

  const selectedCompany = (companies as any[]).find((c: any) => c.id === companyId);
  const selectedDeal = (deals as any[]).find((d: any) => d.id === dealId);

  useEffect(() => {
    if (!selectedDeal || mode !== "create") return;

    if (selectedDeal.assigneeId) setAssigneeId(selectedDeal.assigneeId);
    if (selectedDeal.contactId) {
      setTargetType("contact");
      setContactId(selectedDeal.contactId);
    } else if (selectedDeal.companyId) {
      setTargetType("company");
      setCompanyId(selectedDeal.companyId);
    }
  }, [mode, selectedDeal]);

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

  const [companySearch, setCompanySearch] = useState("");
  const filteredCompanies = useMemo(() => {
    const keyword = companySearch.trim().toLowerCase();
    if (!keyword) return companies as any[];
    return (companies as any[]).filter((c) => c.name?.toLowerCase().includes(keyword));
  }, [companies, companySearch]);

  const [assigneeSearch, setAssigneeSearch] = useState("");
  const filteredAssignees = useMemo(() => {
    const keyword = assigneeSearch.trim().toLowerCase();
    if (!keyword) return assignees as any[];
    return (assignees as any[]).filter((a) => a.name?.toLowerCase().includes(keyword));
  }, [assignees, assigneeSearch]);

  const selectedContact = (contacts as ContactOption[]).find((contact) => contact.id === contactId);
  const filteredDeals = useMemo(() => {
    const keyword = dealSearch.trim().toLowerCase();
    if (!keyword) return deals as any[];
    return (deals as any[]).filter((d: any) => dealLabel(d)?.toLowerCase().includes(keyword));
  }, [deals, dealSearch]);

  function dealLabel(deal: any) {
    return deal.title || deal.name || "Deal chưa đặt tên";
  }

  function numberValue(val: any) {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    return Number(val.toString()) || 0;
  }
  const selectedAssignee = (assignees as any[]).find((a) => a.user?.id === assigneeId);
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
        targetType,
        assigneeId: assigneeId || undefined,
        contactName: targetType !== 'company' ? (customerSearch || contactName) : undefined,
        companyName: targetType === 'company' ? (companySearch || companyName) : companyName,
        contactPhone,
        contactEmail,
        contactAddress,

    companyId: companyId || undefined,
    projectId: projectId || undefined,
    dealId: dealId || undefined,
    status,
    currency,
    customerSignatureRequired,
    subtotal,
    discount: documentDiscount + lineDiscount,
    discountType,
    tax: totalTax,
    taxRate: 0,
    total: totalAmount,
        validUntil: validUntil || undefined,
        notes,
        terms,
        items: items.map((item, index) => {
          const normalizedItem = recalcItem(item);
          const content = normalizedItem.name || normalizeLegacyText(normalizedItem.description) || `Hạng mục ${index + 1}`;
          return {
            ...normalizedItem,
            name: content,
            description: content,
            order: index,
          };
        }),
      });

  
  useEffect(() => {
    if (selectedContact) {
      setContactName(contactLabel(selectedContact));
      setContactPhone(selectedContact.phone || "");
      setContactEmail(selectedContact.email || "");
      setContactAddress(selectedContact.address || "");
      setCompanyName(selectedContact.company?.name || "");
    }
  }, [selectedContact]);

  useEffect(() => {
    if (selectedCompany) {
      setCompanyName(selectedCompany.name || "");
      setContactPhone(selectedCompany.phone || "");
      setContactEmail(selectedCompany.email || "");
      setContactAddress(selectedCompany.address || "");
    }
  }, [selectedCompany]);

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
  const updateItemDescription = (index: number, value: string) => {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        return recalcItem({ ...item, name: value, description: value });
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
            Tài chính / Báo giá
          </div>
          <h1 className="text-[14px] font-light text-slate-950">
            {mode === "create" ? "Tạo báo giá" : `Báo giá ${initialData?.number || ""}`}
          </h1>
        </div>

        <div className="quote-form-actions w-full lg:w-auto">
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

      <form id="quotation-form" onSubmit={handleSubmit} className="quote-form-grid" style={mobileSingleColumnStyle}><section className="quote-panel quote-payment-sidebar">
            <div className="quote-panel-header">
              <h2>Thông tin chung</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

              <Field label="Tiêu đề" className="sm:col-span-2">
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
                    <option value="contact">Cá nhân</option>
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
                    placeholder="Gõ tên, email hoặc mã khách hàng..."
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
            <div className="quote-panel-header" style={mobilePanelHeaderStyle}>
              <h2 className="quote-work-heading">Nội dung công việc</h2>
              <button type="button" onClick={addItem} className="quote-button quote-button-soft">
                <Plus className="h-4 w-4" />
                Thêm dòng
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="quote-item-grid contract-item-grid" style={mobileSingleColumnStyle}>
                  <Field label="Mô tả sản phẩm / dịch vụ" className="lg:col-span-9">
                    <textarea
                      rows={3}
                      value={item.name}
                      onChange={(event) => updateItemDescription(index, event.target.value)}
                      className="quote-input min-h-[92px] resize-y"
                      placeholder="Nhập mô tả chi tiết, phạm vi công việc, ghi chú riêng cho hạng mục..."
                    />
                  </Field>
                  <Field label="Đơn vị">
                    <input
                      value={item.unit || ""}
                      onChange={(event) => updateItem(index, "unit", event.target.value)}
                      className="quote-input"
                      placeholder=""
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

          <section className="quote-panel quote-compact-upload-panel">
            <div className="quote-panel-header">
              <h2>Tệp đính kèm</h2>
            </div>

            <div className="quote-upload-grid" style={mobileSingleColumnStyle}>
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
              <h2>Ghi chú</h2>
            </div>
            <div className="grid gap-4">
              <Field label="Ghi chú gửi khách">
                <textarea
                  rows={7}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="quote-input min-h-[180px] resize-y"
                  placeholder="Nội dung hiển thị cho khách trong báo giá..."
                />
              </Field>
            </div>
          </section>

          <section className="quote-panel">
            <div className="quote-panel-header" style={mobilePanelHeaderStyle}>
              <h2>Điều khoản báo giá</h2>
            </div>
            <div className="contract-terms-editor">
              <Field label="Điều khoản / Nội dung thêm">
                <textarea
                  value={terms}
                  onChange={(event) => setTerms(event.target.value)}
                  className="quote-input min-h-[360px] resize-y leading-7"
                  placeholder="Điều kiện thanh toán, hiệu lực báo giá, phạm vi triển khai..."
                />
              </Field>
            </div>
          </section>
      </form>

    </div>
  );
}
