"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileUp,
  FileText,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { normalizePaymentChannelKeys, getDynamicPaymentChannels, type PaymentChannelKey } from "@/lib/finance/payment-channels";
import {  createQuotation, updateQuotation  } from "@/modules/finance/actions/finance.actions";
import { getContacts, getCompanies, getContactAssignees, getDeals, lookupCompanyByTaxCode } from "@/modules/crm/actions/crm.actions";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { getProjects } from "@/modules/projects/actions/project.actions";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { CustomerFormSection } from "./customer-form-section";

type QuotationMode = "create" | "edit";

type ContactOption = {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  identityNumber?: string | null;
  jobTitle?: string | null;
  customFields?: unknown;
  company?: {
    name?: string | null;
    taxCode?: string | null;
    representativeName?: string | null;
    representativeTitle?: string | null;
    customFields?: unknown;
  } | null;
  address?: string | null;
};

type CompanyOption = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  taxCode?: string | null;
  representativeName?: string | null;
  representativeTitle?: string | null;
  customFields?: unknown;
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
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  contactAddress?: string | null;
  contactIdentityNumber?: string | null;
  companyName?: string | null;
  companyTaxCode?: string | null;
  companyRepresentative?: string | null;
  companyRepresentativeTitle?: string | null;
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

function objectFields(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function taxCodeFromCompany(company?: CompanyOption | null) {
  const customFields = objectFields(company?.customFields);
  const customTaxCode = customFields.taxCode;

  return String(company?.taxCode || customTaxCode || "").trim();
}

function companyNameFromCompany(company?: CompanyOption | null, fallback = "") {
  const customFields = objectFields(company?.customFields);
  const customName = customFields.companyName || customFields.name || customFields.businessName;
  const taxCode = normalizedLookup(taxCodeFromCompany(company));
  const companyName = String(customName || company?.name || "").trim();

  if (companyName && normalizedLookup(companyName) !== taxCode) {
    return companyName;
  }

  return fallback;
}

function isUsefulCompany(company?: CompanyOption | null) {
  if (!company) return false;
  const name = companyNameFromCompany(company);
  return Boolean(name || taxCodeFromCompany(company) || company.email || company.phone);
}

function normalizedLookup(value?: string | null) {
  return String(value || "").trim().replace(/\s+/g, "");
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

function normalizeQuotationTerms(value?: string | null) {
  if (!value) return "";
  return value
    .replace(/^\s*(?:Ngày lập|Ngay lap)\s*:\s*\d{4}-\d{2}-\d{2}\s*$/gim, "")
    .replace(/<p>\s*(?:Ngày lập|Ngay lap)\s*:\s*\d{4}-\d{2}-\d{2}\s*<\/p>/gi, "")
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
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      {label ? (
        <span className="mb-1.5 block text-[15px] font-light text-slate-600">{label}</span>
      ) : null}
      {children}
    </label>
  );
}

function VercelPicker<T extends { id: string }>({
  value,
  selectedTitle,
  placeholder,
  options,
  search,
  onSearchChange,
  onSelect,
  getTitle,
  getSubtitle,
  className,
}: {
  value: string;
  selectedTitle?: string;
  placeholder: string;
  options: T[];
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  getTitle: (option: T) => string;
  getSubtitle?: (option: T) => string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const displayValue = open ? search : (selectedTitle || search || "");
  const normalizedQuery = search.trim().toLowerCase();
  const visibleOptions = normalizedQuery
    ? options.filter((option) =>
        [getTitle(option), getSubtitle?.(option)]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      )
    : options.slice(0, 12);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div ref={wrapperRef} className={cn("relative min-w-0", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        value={displayValue}
        onFocus={() => {
          onSearchChange("");
          setOpen(true);
        }}
        onChange={(event) => {
          onSearchChange(event.target.value);
          setOpen(true);
        }}
        className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none vercel-picker-input font-medium"
        placeholder={placeholder}
      />
      {(value || selectedTitle || search) ? (
        <button
          type="button"
          onClick={() => {
            onSelect("");
            onSearchChange("");
            setOpen(false);
          }}
          className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[6px] text-gray-400 transition-colors hover:bg-gray-50 hover:text-black"
          aria-label="Xóa lựa chọn"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}

      {open ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-[80] w-full overflow-hidden rounded-[10px] border border-[#eaeaea] bg-white">
          <div className="max-h-[280px] overflow-y-auto p-1.5">
            {visibleOptions.length ? (
              visibleOptions.map((option) => {
                const title = getTitle(option);
                const subtitle = getSubtitle?.(option);
                const selected = option.id === value;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      onSelect(option.id);
                      onSearchChange(title);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full min-w-0 items-start justify-between gap-3 rounded-[8px] px-3 py-2.5 text-left transition-colors hover:bg-gray-50",
                      selected && "bg-gray-50"
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-medium text-black">{title}</span>
                      {subtitle ? <span className="mt-0.5 block truncate text-[15px] text-gray-500">{subtitle}</span> : null}
                    </span>
                    {selected ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-black" /> : null}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-8 text-center text-[15px] text-gray-500">Không tìm thấy dữ liệu phù hợp.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
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
    <label className="flex h-[46px] mt-[30px] cursor-pointer items-center justify-between rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 hover:bg-gray-100 transition-colors" aria-label="Ký số">
      <span className="text-[15px] font-medium text-black">{checked ? "Bật ký số" : "Tắt ký số"}</span>
      <div className={cn("relative h-5 w-9 rounded-full transition-colors", checked ? "bg-black" : "bg-gray-200")}>
        <div className={cn("absolute top-[2px] left-[2px] h-4 w-4 rounded-full bg-white transition-transform", checked && "translate-x-4")} />
      </div>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

import { ComboSelectModal as ComboSelect } from "@/components/ui/combo-select-modal";


export function QuotationFormClient({
  mode,
  initialData,
  initialNumber,
  dynamicPaymentChannels,
  initialCompanies,
  initialContacts,
}: {
  mode: QuotationMode;
  initialData?: InitialQuotation;
  initialNumber?: string;
  dynamicPaymentChannels?: string | null;
  initialCompanies?: CompanyOption[];
  initialContacts?: ContactOption[];
}) {
    const paymentChannelOptions = useMemo(() => getDynamicPaymentChannels(dynamicPaymentChannels), [dynamicPaymentChannels]);
const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  const [number, setNumber] = useState(initialData?.number || initialNumber || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [contactId, setContactId] = useState(searchParams?.get("contactId") || initialData?.contactId || "");
  const [contactName, setContactName] = useState(initialData?.contactName || "");
  const [contactPhone, setContactPhone] = useState(initialData?.contactPhone || "");
  const [contactEmail, setContactEmail] = useState(initialData?.contactEmail || "");
  const [contactAddress, setContactAddress] = useState(initialData?.contactAddress || "");
  const [contactIdentityNumber, setContactIdentityNumber] = useState(initialData?.contactIdentityNumber || "");
  const [companyName, setCompanyName] = useState(initialData?.companyName || "");
  const [companyTaxCode, setCompanyTaxCode] = useState(initialData?.companyTaxCode || "");
  const [representativeName, setRepresentativeName] = useState(initialData?.companyRepresentative || "");
  const [representativeTitle, setRepresentativeTitle] = useState(initialData?.companyRepresentativeTitle || "");
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
  const [terms, setTerms] = useState(normalizeQuotationTerms(initialData?.terms));
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

  const { data: contacts = [] } = useQuery<ContactOption[]>({
    queryKey: ["contacts"],
    queryFn: async () => (await getContacts()) as ContactOption[],
    initialData: initialContacts ?? [],
    staleTime: 60_000,
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
    initialData: initialCompanies,
    staleTime: 60_000,
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

  const selectedCompany = (companies as CompanyOption[]).find((company) => company.id === companyId);
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

  const [companySearch, setCompanySearch] = useState(initialData?.companyName || "");
  const filteredCompanies = useMemo(() => {
    const usefulCompanies = (companies as CompanyOption[]).filter(isUsefulCompany);
    const keyword = companySearch.trim().toLowerCase();
    if (!keyword) return usefulCompanies;
    return usefulCompanies.filter((company) =>
      [companyNameFromCompany(company), company.name, company.email, company.phone, taxCodeFromCompany(company)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
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
  const customerDisplayName = targetType === "company"
    ? (companyNameFromCompany(selectedCompany, companyName || companySearch) || "Chọn công ty")
    : (selectedContact ? contactLabel(selectedContact) : contactName || customerSearch || "Chọn khách hàng");
  const customerInitial = customerDisplayName.trim().charAt(0).toUpperCase() || "K";
  const customerMeta = [
    targetType === "company" && companyTaxCode ? `MST ${companyTaxCode}` : "",
    contactPhone,
    contactEmail,
  ].filter(Boolean);

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
    title: title.trim() || `Báo giá ${number || ''}`,
    contactId: contactId || undefined,
        targetType,
        assigneeId: assigneeId || undefined,
        contactName: targetType !== 'company' ? (customerSearch || contactName) : undefined,
        companyName: targetType === 'company' ? (companySearch || companyName) : companyName,
        companyTaxCode,
        companyRepresentative: representativeName,
        companyRepresentativeTitle: representativeTitle,
        contactIdentityNumber,
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

  const hasLoadedCompanyRef = useRef(false);
  const hasLoadedContactRef = useRef(false);

  const hydrateContactFields = (contact: ContactOption, overwrite = false) => {
    const contactFields = objectFields(contact.customFields);
    const contactCompany = contact.company as CompanyOption | null;

    setContactName((current) => (overwrite || !current ? contactLabel(contact) : current));
    setCustomerSearch((current) => (overwrite || !current ? contactLabel(contact) : current));
    setContactPhone((current) => (overwrite || !current ? contact.phone || "" : current));
    setContactEmail((current) => (overwrite || !current ? contact.email || "" : current));
    setContactAddress((current) => (overwrite || !current ? contact.address || "" : current));
    setContactIdentityNumber((current) => (
      overwrite || !current
        ? String(contact.identityNumber || contactFields.identityNumber || contactFields.cccd || contactFields.citizenId || contactFields.idNumber || "")
        : current
    ));
    setCompanyName((current) => (overwrite || !current ? companyNameFromCompany(contactCompany) : current));
    setCompanyTaxCode((current) => (overwrite || !current ? taxCodeFromCompany(contactCompany) : current));
  };

  const hydrateCompanyFields = (company: CompanyOption, overwrite = false) => {
    const customFields = objectFields(company.customFields);
    const nextCompanyName = companyNameFromCompany(company, companyName);
    const fallbackCompany = (companies as CompanyOption[]).find((candidate) => {
      if (candidate.id === company.id || !taxCodeFromCompany(candidate)) return false;
      return normalizedLookup(companyNameFromCompany(candidate)) === normalizedLookup(nextCompanyName);
    });
    const nextTaxCode = taxCodeFromCompany(company) || taxCodeFromCompany(fallbackCompany);

    setCompanyName((current) => (overwrite || !current ? nextCompanyName : current));
    setCompanySearch((current) => (overwrite || !current ? nextCompanyName : current));
    setContactPhone((current) => (overwrite || !current ? company.phone || "" : current));
    setContactEmail((current) => (overwrite || !current ? company.email || "" : current));
    setContactAddress((current) => (overwrite || !current ? company.address || "" : current));
    setCompanyTaxCode((current) => (overwrite || !current ? nextTaxCode : current));
    setRepresentativeName((current) => (
      overwrite || !current
        ? String(company.representativeName || customFields.representativeName || customFields.representative || customFields.legalRepresentative || customFields.contactPerson || customFields.companyRepresentative || "")
        : current
    ));
    setRepresentativeTitle((current) => (
      overwrite || !current
        ? String(company.representativeTitle || customFields.representativeTitle || customFields.position || customFields.jobTitle || customFields.title || "")
        : current
    ));
  };

  useEffect(() => {
    if (selectedContact && !hasLoadedContactRef.current) {
      hydrateContactFields(selectedContact);
      hasLoadedContactRef.current = true;
    }
  }, [selectedContact]);

  useEffect(() => {
    if (selectedCompany && !hasLoadedCompanyRef.current) {
      hydrateCompanyFields(selectedCompany);
      hasLoadedCompanyRef.current = true;
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (targetType !== "company" || companyId || !(companies as CompanyOption[]).length) return;
    const matchedCompany = (companies as CompanyOption[]).find((company) => {
      const sameTaxCode = companyTaxCode && normalizedLookup(taxCodeFromCompany(company)) === normalizedLookup(companyTaxCode);
      const sameName = companyName && normalizedLookup(companyNameFromCompany(company)) === normalizedLookup(companyName);
      return sameTaxCode || sameName;
    });
    if (!matchedCompany) return;

    setCompanyId(matchedCompany.id);
    hydrateCompanyFields(matchedCompany);
    hasLoadedCompanyRef.current = true;
  }, [companies, companyId, companyName, companyTaxCode, targetType]);

  useEffect(() => {
    if (companyTaxCode || !companyName || !(companies as CompanyOption[]).length) return;
    const matchedCompany = (companies as CompanyOption[]).find((company) =>
      taxCodeFromCompany(company) && normalizedLookup(companyNameFromCompany(company)) === normalizedLookup(companyName)
    );
    if (matchedCompany) {
      setCompanyTaxCode(taxCodeFromCompany(matchedCompany));
    }
  }, [companies, companyName, companyTaxCode]);

  const handleContactChange = (id: string) => {
    setContactId(id);
    const nextContact = (contacts as ContactOption[]).find((contact) => contact.id === id);
    if (nextContact) {
      hydrateContactFields(nextContact, true);
      hasLoadedContactRef.current = true;
      return;
    }
    hasLoadedContactRef.current = false;
  };

  const handleCompanyChange = (id: string) => {
    setCompanyId(id);
    const nextCompany = (companies as CompanyOption[]).find((company) => company.id === id);
    if (nextCompany) {
      hydrateCompanyFields(nextCompany, true);
      hasLoadedCompanyRef.current = true;
      return;
    }
    hasLoadedContactRef.current = false;
  };

  const taxLookupMutation = useMutation({
    mutationFn: lookupCompanyByTaxCode,
    onSuccess: (result, taxCode) => {
      if (!result.success) return;

      setCompanyTaxCode(result.data.taxCode || taxCode);
      setCompanyName(result.data.name || companyName);
      setCompanySearch(result.data.name || companyName);
      setContactAddress(result.data.address || contactAddress);
    },
  });

  const runTaxLookup = (taxCode: string) => {
    const normalizedTaxCode = taxCode.trim().replace(/\s+/g, "");
    if (normalizedTaxCode.length < 10) return;
    
    const existing = (companies as CompanyOption[]).find((company) => normalizedLookup(taxCodeFromCompany(company)) === normalizedTaxCode);
    const existingName = companyNameFromCompany(existing, companyName);
    const needsCompanyName = !existingName || normalizedLookup(existingName) === normalizedTaxCode;
    if (!existing || needsCompanyName) {
      taxLookupMutation.mutate(normalizedTaxCode);
    }
  };

  useEffect(() => {
    const normalizedTaxCode = (companyTaxCode || "").trim().replace(/\s+/g, "");
    if (normalizedTaxCode.length < 10) return;

    const timer = window.setTimeout(() => runTaxLookup(normalizedTaxCode), 800);
    return () => window.clearTimeout(timer);
  }, [companyTaxCode]);

  useEffect(() => {
    const normalizedSearch = (companySearch || "").trim().replace(/\s+/g, "");
    if (normalizedSearch.match(/^\d{10}(\d{3})?$/)) {
      const timer = window.setTimeout(() => runTaxLookup(normalizedSearch), 800);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [companySearch]);
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
    const hasContactCustomer = targetType !== "company" && (contactId || customerSearch.trim() || contactName.trim());
    const hasCompanyCustomer = targetType === "company" && (companyId || companySearch.trim() || companyName.trim());
    if (!hasContactCustomer && !hasCompanyCustomer) {
      alert(targetType === "company" ? "Vui lòng chọn hoặc nhập tên công ty." : "Vui lòng chọn khách hàng.");
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
    <div className="mx-auto max-w-[1200px] px-6 py-6">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[15px] font-medium uppercase tracking-widest text-gray-400">
            Tài chính / Báo giá
          </div>
          <h1 className="text-[48px] md:text-[56px] font-medium tracking-tighter text-black leading-none">
            {mode === "create" ? "Tạo báo giá" : `Báo giá ${initialData?.number || ""}`}
          </h1>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto">
          <button type="button" onClick={() => router.back()} className="rounded-full border border-[#eaeaea] bg-white px-6 py-2.5 text-[15px] font-medium text-black hover:bg-gray-50 transition-colors">
            Quay lại
          </button>
          <button
            type="button"
            onClick={() => handleSave("DRAFT")}
            disabled={saveMutation.isPending}
            className="rounded-full border border-[#eaeaea] bg-white px-6 py-2.5 text-[15px] font-medium text-black hover:bg-gray-50 transition-colors"
          >
            {saveMutation.isPending ? "Đang lưu..." : "Lưu nháp"}
          </button>
          <button
            type="submit"
            form="quotation-form"
            disabled={saveMutation.isPending}
            className="rounded-full bg-black px-6 py-2.5 text-[15px] font-medium text-white hover:bg-gray-800 transition-colors"
          >
            {saveMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      {saveError ? (
        <div className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[15px] font-light text-red-700">
          Lưu báo giá thất bại: {saveError}
        </div>
      ) : null}

      <form id="quotation-form" onSubmit={handleSubmit} className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-10">
        <section className="rounded-2xl border border-[#eaeaea] bg-white p-5 md:p-8 lg:sticky lg:top-8 lg:col-span-4 lg:col-start-9 lg:row-span-12 lg:row-start-1">
          <div className="mb-8 flex items-center justify-between border-b border-[#eaeaea] pb-4">
            <h2 className="text-[22px] font-medium tracking-tight text-black md:text-[24px]">Thông tin chung</h2>
          </div>

          <div className="flex flex-col gap-6">
            <Field label="Số báo giá">
              <input
                value={number}
                onChange={(event) => setNumber(event.target.value)}
                className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none"
                placeholder="Tự sinh nếu bỏ trống"
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Ngày lập">
                <input
                  type="date"
                  value={quotationDate}
                  onChange={(event) => setQuotationDate(event.target.value)}
                  className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none"
                />
              </Field>
              <Field label="Hạn chót">
                <input
                  type="date"
                  value={validUntil}
                  onChange={(event) => setValidUntil(event.target.value)}
                  className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none"
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Trạng thái">
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none">
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Loại tiền">
                <select value={currency} onChange={(event) => setCurrency(event.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none">
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
          <section className="mb-8 rounded-2xl border border-[#eaeaea] bg-white p-5 md:p-8 lg:col-span-8 lg:col-start-1">
            <div className="mb-8 flex flex-col gap-4 border-b border-[#eaeaea] pb-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-[22px] font-medium tracking-tight text-black md:text-[24px]">Nội dung công việc</h2>
              <button type="button" onClick={addItem} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#eaeaea] bg-white px-4 py-2 text-[15px] font-medium text-black transition-colors hover:bg-gray-50 sm:min-h-0">
                <Plus className="h-4 w-4" />
                Thêm dòng
              </button>
            </div>

            <div className="space-y-0">
              {items.map((item, index) => (
                <div key={index} className="flex flex-col gap-4 border-b border-[#eaeaea] py-5 last:border-0">
                  <Field label="Mô tả sản phẩm / dịch vụ">
                    <TiptapEditor
                      value={item.name}
                      onChange={(content) => updateItemDescription(index, content)}
                      placeholder="Nhập mô tả chi tiết, phạm vi công việc, ghi chú riêng cho hạng mục..."
                    />
                  </Field>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[1fr_1fr_1fr_1fr_1.5fr_auto] md:items-end">
                    <Field label="Đơn vị">
                      <input
                        value={item.unit || ""}
                        onChange={(event) => updateItem(index, "unit", event.target.value)}
                        className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none"
                        placeholder=""
                      />
                    </Field>
                    <Field label="Số lượng">
                      <input
                        type="number"
                        min={0}
                        value={item.quantity}
                        onChange={(event) => updateItem(index, "quantity", event.target.value)}
                        className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none"
                      />
                    </Field>
                    <Field label="Đơn giá">
                      <input
                        type="number"
                        min={0}
                        value={item.unitPrice}
                        onChange={(event) => updateItem(index, "unitPrice", event.target.value)}
                        className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none"
                      />
                    </Field>
                    <Field label="Thuế %">
                      <input
                        type="number"
                        min={0}
                        value={item.tax}
                        onChange={(event) => updateItem(index, "tax", event.target.value)}
                        className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none"
                      />
                    </Field>
                    <Field label="Thành tiền">
                      <input readOnly value={formatCurrency(item.total)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-100/50 px-4 py-3 text-[15px] font-medium text-gray-500 transition-colors placeholder:text-gray-300 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" />
                    </Field>
                    <button type="button" onClick={() => removeItem(index)} className="inline-flex h-[46px] w-full items-center justify-center rounded-lg border border-[#eaeaea] bg-gray-50/50 text-gray-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:w-[46px]" title="Xóa dòng">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-[#eaeaea] pt-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <Field label="Loại chiết khấu">
                    <select value={discountType} onChange={(event) => setDiscountType(event.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none">
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
                      className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none"
                    />
                  </Field>
                  <div className="flex items-center justify-between border-t border-[#eaeaea] pt-4 text-[15px] text-gray-500">
                    <span>Tổng chiết khấu</span>
                    <strong className="text-red-500 font-medium">-{formatCurrency(lineDiscount)}</strong>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <Field label="Tạm tính">
                    <input
                      type="number"
                      min={0}
                      value={subtotal}
                      onChange={(event) => {
                        setSubtotalOverride(numberValue(event.target.value));
                      }}
                      className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none"
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
                      className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none"
                    />
                  </Field>
                  <div className="flex items-center justify-between border-t border-[#eaeaea] pt-4">
                    <span className="text-[16px] font-medium text-black">Tổng báo giá</span>
                    <strong className="text-[24px] font-semibold text-black tracking-tight">{formatCurrency(totalAmount)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8 rounded-2xl border border-[#eaeaea] bg-white p-6 md:p-8 lg:col-span-8 lg:col-start-1">
            <div className="mb-8 flex items-center justify-between border-b border-[#eaeaea] pb-4">
              <h2 className="text-[24px] font-medium tracking-tight text-black">Tệp đính kèm</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center transition-colors hover:bg-gray-100">
                <input
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    addAttachments(event.target.files);
                    event.currentTarget.value = "";
                  }}
                />
                <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm border border-[#eaeaea]">
                  <FileUp className="h-5 w-5" />
                </span>
                <strong className="text-[15px] font-medium text-black">Chọn file hoặc kéo thả vào đây</strong>
                <small className="mt-1 text-[15px] text-gray-500">PDF, DOCX, XLSX, PNG, JPG. Dữ liệu upload sẽ nối backend file ở bước tiếp theo.</small>
              </label>

              <div className="flex flex-col gap-3">
                {attachments.length ? (
                  attachments.map((file, index) => (
                    <div key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center gap-3 rounded-lg border border-[#eaeaea] bg-white p-3 shadow-sm">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-orange-50 text-orange-500">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <strong className="truncate text-[15px] font-medium text-black">{file.name}</strong>
                        <span className="text-[15px] text-gray-500">{formatFileSize(file.size)}</span>
                      </div>
                      <button type="button" onClick={() => removeAttachment(index)} title="Gỡ file" className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="flex h-full min-h-[120px] items-center justify-center rounded-xl border border-dashed border-gray-200 text-[15px] text-gray-400">
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
              <Field label="Ghi chú gửi khách">
                <TiptapEditor
                  value={notes}
                  onChange={(content) => setNotes(content)}
                  placeholder="Nội dung hiển thị cho khách trong báo giá..."
                />
              </Field>
            </div>
          </section>

          <section className="mb-8 rounded-2xl border border-[#eaeaea] bg-white p-6 md:p-8 lg:col-span-8 lg:col-start-1">
            <div className="mb-8 flex items-center justify-between border-b border-[#eaeaea] pb-4">
              <h2 className="text-[24px] font-medium tracking-tight text-black">Điều khoản báo giá</h2>
            </div>
            <div className="grid gap-4">
              <Field label="Điều khoản / Nội dung thêm">
                <TiptapEditor
                  value={terms}
                  onChange={(content) => setTerms(content)}
                  placeholder="Điều kiện thanh toán, hiệu lực báo giá, phạm vi triển khai..."
                />
              </Field>
            </div>
          </section>
      </form>

    </div>
  );
}
