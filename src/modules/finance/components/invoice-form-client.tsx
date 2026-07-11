"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, FileUp, Loader2, Plus, Search, Trash2, X } from "lucide-react";

import {  createInvoice, recordPayment, updateInvoice  } from "@/modules/finance/actions/finance.actions";
import { getContacts, getCompanies, getContactAssignees, getDeals, lookupCompanyByTaxCode } from "@/modules/crm/actions/crm.actions";
import { normalizePaymentChannelKeys, getDynamicPaymentChannels, type PaymentChannelKey } from "@/lib/finance/payment-channels";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { InvoicePaymentModal } from "./invoice-payment-modal";
import { CustomerFormSection } from "./customer-form-section";

type PaymentPayload = {
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
  paidAt: string;
  sendCustomerEmail: boolean;
};

type InvoiceMode = "create" | "edit";

type ContactOption = {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  customFields?: Record<string, unknown> | null;
  company?: {
    name?: string | null;
    taxCode?: string | null;
    customFields?: Record<string, unknown> | null;
  } | null;
  address?: string | null;
};

type InvoiceItemForm = {
  id?: string;
  name: string;
  description: string;
  unit?: string;
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
  companyId?: string | null;
  dealId?: string | null;
  assigneeId?: string | null;
  targetType?: string | null;
  projectId?: string | null;
  contractId?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  contactAddress?: string | null;
  companyName?: string | null;
  companyTaxCode?: string | null;
  currency?: string;
  paymentChannels?: unknown;
  customerSignatureRequired?: boolean;
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
function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

function normalizedLookup(value?: string | null) {
  return String(value || "").trim().replace(/\s+/g, "");
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
  return { name: "", description: "", unit: "", quantity: 1, unitPrice: 0, discount: 0, tax: 0, total: 0 };
}

function recalcItem(item: InvoiceItemForm): InvoiceItemForm {
  const gross = numberValue(item.quantity) * numberValue(item.unitPrice);
  const afterDiscount = Math.max(0, gross - numberValue(item.discount));
  const lineTax = afterDiscount * (numberValue(item.tax) / 100);
  return { ...item, total: afterDiscount + lineTax };
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[15px] font-light text-slate-600">{label}</span>
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

export function InvoiceFormClient({ mode, initialData, initialNumber = "", dynamicPaymentChannels }: { mode: InvoiceMode; initialData?: InitialInvoice; initialNumber?: string; dynamicPaymentChannels?: string | null; }) {
    const paymentChannelOptions = useMemo(() => getDynamicPaymentChannels(dynamicPaymentChannels), [dynamicPaymentChannels]);
const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  const [number, setNumber] = useState(initialData?.number || initialNumber);
  const [title, setTitle] = useState(initialData?.title || "");
  const [contactId, setContactId] = useState(searchParams?.get("contactId") || initialData?.contactId || "");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [targetType, setTargetType] = useState<"company" | "contact" | "lead">(initialData?.targetType as any || "company");
  const [companyId, setCompanyId] = useState("");
  const [dealId, setDealId] = useState("");
  const [dealSearch, setDealSearch] = useState("");
  const [assigneeId, setAssigneeId] = useState(initialData?.assigneeId || "");
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [currency, setCurrency] = useState(initialData?.currency || "VND");
  const [paymentChannels, setPaymentChannels] = useState<PaymentChannelKey[]>(normalizePaymentChannelKeys(initialData?.paymentChannels, paymentChannelOptions));
  const [customerSignatureRequired, setCustomerSignatureRequired] = useState(initialData?.customerSignatureRequired !== false);
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
      ? initialData.items.map((item) => {
          const content = item.name || normalizeLegacyText(item.description) || "";
          return recalcItem({ ...item, name: content, unit: item.unit || "", description: content, discount: numberValue(item.discount), tax: numberValue(item.tax) });
        })
      : [emptyItem()]
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
  const filteredDeals = useMemo(() => {
    const keyword = dealSearch.trim().toLowerCase();
    if (!keyword) return deals as any[];
    return (deals as any[]).filter((d: any) => dealLabel(d)?.toLowerCase().includes(keyword));
  }, [deals, dealSearch]);

  function dealLabel(deal: any) {
    return deal.title || deal.name || "Deal chưa đặt tên";
  }
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

  const [companyTaxCode, setCompanyTaxCode] = useState(initialData?.companyTaxCode || "");
  const [representativeName, setRepresentativeName] = useState((initialData as any)?.representativeName || "");
  const [representativeTitle, setRepresentativeTitle] = useState((initialData as any)?.representativeTitle || "");
  const [contactIdCard, setContactIdCard] = useState((initialData as any)?.contactIdCard || "");

  const hasLoadedCompanyRef = useRef(false);
  const hasLoadedContactRef = useRef(false);

  useEffect(() => {
    if (selectedContact && !hasLoadedContactRef.current) {
      setContactName(contactLabel(selectedContact));
      setContactPhone(selectedContact.phone || "");
      setContactEmail(selectedContact.email || "");
      setContactAddress(selectedContact.address || "");
      setCompanyName(selectedContact.company?.name || "");
      const customFields: any = selectedContact.company?.customFields || {};
      setCompanyTaxCode(selectedContact.company?.taxCode || customFields.taxCode || "");
      const contactCustomFields: any = selectedContact.customFields || {};
      setContactIdCard(contactCustomFields.idCard || "");
      hasLoadedContactRef.current = true;
    }
  }, [selectedContact]);

  useEffect(() => {
    if (selectedCompany && !hasLoadedCompanyRef.current) {
      setCompanyName(selectedCompany.name || "");
      setContactPhone(selectedCompany.phone || "");
      setContactEmail(selectedCompany.email || "");
      setContactAddress(selectedCompany.address || "");
      const customFields: any = selectedCompany.customFields || {};
      setCompanyTaxCode(selectedCompany.taxCode || customFields.taxCode || "");
      setRepresentativeName(customFields.representativeName || "");
      setRepresentativeTitle(customFields.representativeTitle || "");
      hasLoadedCompanyRef.current = true;
    }
  }, [selectedCompany]);

  const handleContactChange = (id: string) => {
    setContactId(id);
    hasLoadedContactRef.current = false;
  };

  const handleCompanyChange = (id: string) => {
    setCompanyId(id);
    hasLoadedCompanyRef.current = false;
  };

  const taxLookupMutation = useMutation({
    mutationFn: lookupCompanyByTaxCode,
    onSuccess: (result, taxCode) => {
      if (!result.success) return;

      setCompanyTaxCode(result.data.taxCode || taxCode);
      setCompanyName(result.data.name || companyName);
      setContactAddress(result.data.address || contactAddress);
    },
  });

  const runTaxLookup = (taxCode: string) => {
    const normalizedTaxCode = taxCode.trim().replace(/\s+/g, "");
    if (normalizedTaxCode.length < 10) return;
    
    const existing = companies?.find((c: any) => normalizedLookup(c.taxCode) === normalizedTaxCode);
    if (!existing) {
      taxLookupMutation.mutate(normalizedTaxCode);
    }
  };

  useEffect(() => {
    const normalizedTaxCode = (companyTaxCode || "").trim().replace(/\s+/g, "");
    if (normalizedTaxCode.length < 10) return;

    const timer = window.setTimeout(() => runTaxLookup(normalizedTaxCode), 800);
    return () => window.clearTimeout(timer);
  }, [companyTaxCode]);

  const saveMutation = useMutation({
    mutationFn: (statusOverride?: string) => {
      const payload = {
        number: number.trim() || undefined,
        title: title.trim() || `Hóa đơn ${number || ''}`,
        contactId: contactId || undefined,
        targetType,
        assigneeId: assigneeId || undefined,
        contactName: targetType !== 'company' ? (customerSearch || contactName) : undefined,
        companyName: targetType === 'company' ? (companySearch || companyName) : companyName,
        companyTaxCode,
        contactPhone,
        contactEmail,
        contactAddress,

        contractId: initialData?.contractId || undefined,
        projectId: initialData?.projectId || undefined,
        status: statusOverride || status,
        currency,
        paymentChannels,
        customerSignatureRequired,
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
        items: items.map((item, index) => {
          const content = item.name || normalizeLegacyText(item.description) || "";
          return { ...recalcItem({ ...item, name: content, description: content }), order: index };
        }),
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
    mutationFn: (paymentData: PaymentPayload) =>
      recordPayment(
        initialData!.id!,
        paymentData.amount,
        paymentData.method,
        paymentData.notes,
        paymentData.paidAt,
        paymentData.sendCustomerEmail
      ),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setShowPaymentModal(false);
      router.push(`/workspace/finance/payments/${result.paymentId}`);
    },
  });

  const handleSave = async (statusOverride?: string) => {
    setSaveError("");
    const hasContactCustomer = targetType !== "company" && (contactId || customerSearch.trim() || contactName.trim());
    const hasCompanyCustomer = targetType === "company" && (companyId || companySearch.trim() || companyName.trim());
    if (!hasContactCustomer && !hasCompanyCustomer) {
      alert(targetType === "company" ? "Vui lòng chọn hoặc nhập tên công ty." : "Vui lòng chọn hoặc nhập khách hàng.");
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

  const customerDisplayName = targetType === "company"
    ? (selectedCompany?.name || companyName || companySearch || "Chọn công ty")
    : (selectedContact ? contactLabel(selectedContact) : contactName || customerSearch || "Chọn khách hàng");
  const customerInitial = customerDisplayName.trim().charAt(0).toUpperCase() || "K";
  const customerMeta = [
    targetType === "company" && companyTaxCode ? `MST ${companyTaxCode}` : "",
    contactPhone,
    contactEmail,
  ].filter(Boolean);

  const togglePaymentChannel = (key: PaymentChannelKey) => {
    setPaymentChannels((current) => {
      const next = current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
      return next.length ? next : ["company"];
    });
  };

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-6">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[15px] font-medium uppercase tracking-widest text-gray-400">
            Tài chính / Hóa đơn
          </div>
          <h1 className="text-[48px] md:text-[56px] font-medium tracking-tighter text-black leading-none">{mode === "create" ? "Tạo hóa đơn" : `Hóa đơn ${initialData?.number || ""}`}</h1>
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto">
          <button type="button" onClick={() => router.back()} className="rounded-full border border-[#eaeaea] bg-white px-6 py-2.5 text-[15px] font-medium text-black transition-colors hover:bg-gray-50">Quay lại</button>
          <button type="button" onClick={() => handleSave("DRAFT")} disabled={saveMutation.isPending} className="rounded-full border border-[#eaeaea] bg-white px-6 py-2.5 text-[15px] font-medium text-black transition-colors hover:bg-gray-50">
            {saveMutation.isPending ? "Đang lưu..." : "Lưu nháp"}
          </button>
          <button type="button" onClick={() => handleSave()} disabled={saveMutation.isPending} className="rounded-full bg-black px-6 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-gray-800">
            {saveMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      {saveError ? <div className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[15px] font-light text-red-700">Lưu hóa đơn thất bại: {saveError}</div> : null}

      <form className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-10" onSubmit={(event) => event.preventDefault()}>
        <section className="rounded-[24px] border border-[#eaeaea] bg-white p-5 md:p-8 lg:sticky lg:top-8 lg:col-span-4 lg:col-start-9 lg:row-span-12 lg:row-start-1">
          <div className="mb-8 flex items-center justify-between border-b border-[#eaeaea] pb-4">
            <h2 className="text-[22px] font-medium tracking-tight text-black md:text-[24px]">Thông tin chung</h2></div>
          <div className="flex flex-col gap-6">
            <Field label="Số hóa đơn"><input value={number} onChange={(event) => setNumber(event.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" placeholder="Tự sinh nếu bỏ trống" /></Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Ngày lập"><input type="date" value={issuedAt} onChange={(event) => setIssuedAt(event.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" /></Field>
              <Field label="Hạn thanh toán"><input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" /></Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Trạng thái"><select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none">{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
              <Field label="Loại tiền"><select value={currency} onChange={(event) => setCurrency(event.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none"><option value="VND">VND</option><option value="USD">USD</option></select></Field>
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
          targetType={targetType}
          setTargetType={setTargetType}
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
          contactIdentityNumber={contactIdCard}
          setContactIdentityNumber={setContactIdCard}
        />

        <section className="mb-8 rounded-[24px] border border-[#eaeaea] bg-white p-6 md:p-8 lg:col-span-8 lg:col-start-1">
          <div className="mb-8 flex items-center justify-between border-b border-[#eaeaea] pb-4">
            <h2 className="text-[24px] font-medium tracking-tight text-black">Kênh thanh toán</h2></div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            {paymentChannelOptions.map((channel) => (
              <label key={channel.key} className={cn("flex w-[320px] shrink-0 cursor-pointer items-start gap-4 rounded-xl border p-5 transition-colors", paymentChannels.includes(channel.key) ? "border-black bg-gray-50/50" : "border-[#eaeaea] bg-white hover:border-gray-300")}>
                <input type="checkbox" checked={paymentChannels.includes(channel.key)} onChange={() => togglePaymentChannel(channel.key)} className="mt-0.5 flex-shrink-0" />
                <div className="flex flex-col gap-1.5">
                  <span className="text-[15px] font-semibold leading-snug text-black">{channel.optionLabel}</span>
                  <span className="text-[15px] leading-relaxed text-gray-500 uppercase tracking-wide">{channel.accountName} · {channel.bankName}</span>
                </div>
              </label>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-[24px] border border-[#eaeaea] bg-white p-5 md:p-8 lg:col-span-8 lg:col-start-1">
          <div className="mb-8 flex flex-col gap-4 border-b border-[#eaeaea] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[22px] font-medium tracking-tight text-black md:text-[24px]">Nội dung công việc</h2>
            <button type="button" onClick={addItem} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#eaeaea] bg-white px-4 py-2 text-[15px] font-medium text-black transition-colors hover:bg-gray-50 sm:min-h-0"><Plus className="h-4 w-4" />Thêm dòng</button>
          </div>
          <div className="space-y-0">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col gap-4 border-b border-[#eaeaea] py-5 last:border-0">
                <Field label="Mô tả sản phẩm / dịch vụ">
                  <TiptapEditor
                    value={item.name}
                    onChange={(content) => updateItem(index, "name", content)}
                    placeholder="Nhập mô tả chi tiết, phạm vi công việc, ghi chú riêng cho hạng mục..."
                  />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[1fr_1fr_1fr_1fr_1.5fr_auto] md:items-end">
                  <Field label="Đơn vị"><input value={item.unit || ""} onChange={(event) => updateItem(index, "unit", event.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" placeholder="" /></Field>
                  <Field label="Số lượng"><input type="number" value={item.quantity} min={0} onChange={(event) => updateItem(index, "quantity", event.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" /></Field>
                  <Field label="Đơn giá"><input type="number" value={item.unitPrice} min={0} onChange={(event) => updateItem(index, "unitPrice", event.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" /></Field>
                  <Field label="Thuế %"><input type="number" value={item.tax} min={0} onChange={(event) => updateItem(index, "tax", event.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" /></Field>
                  <Field label="Thành tiền"><input value={formatCurrency(item.total)} readOnly className="w-full rounded-lg border border-[#eaeaea] bg-gray-100/50 px-4 py-3 text-[15px] font-medium text-gray-500 transition-colors placeholder:text-gray-300 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" /></Field>
                  <button type="button" onClick={() => removeItem(index)} className="inline-flex h-[46px] w-full items-center justify-center rounded-lg border border-[#eaeaea] bg-gray-50/50 text-gray-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:w-[46px]" title="Xóa dòng"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-8 border-t border-[#eaeaea]">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="flex flex-col gap-4">
                <Field label="Loại chiết khấu"><select value={discountType} onChange={(event) => setDiscountType(event.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none"><option value="fixed">VND</option><option value="percent">%</option></select></Field>
                <Field label="Chiết khấu"><input type="number" min={0} value={discount} onChange={(event) => setDiscount(numberValue(event.target.value))} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" /></Field>
                <div className="flex items-center justify-between border-t border-[#eaeaea] pt-4 text-[15px] text-gray-500"><span>Tổng chiết khấu</span><strong>-{formatCurrency(totalDiscount)}</strong></div>
              </div>
              <div className="flex flex-col gap-4">
                <Field label="Tạm tính"><input type="number" min={0} value={subtotal} onChange={(event) => setSubtotalOverride(numberValue(event.target.value))} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" /></Field>
                <Field label="Tổng thuế"><input type="number" min={0} value={totalTax} onChange={(event) => setTotalTaxOverride(numberValue(event.target.value))} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" /></Field>
                <div className="flex items-center justify-between border-t border-[#eaeaea] pt-4 text-[15px] text-gray-500"><span>Đã thanh toán</span><strong>{formatCurrency(amountPaid)}</strong></div>
                <div className="flex items-center justify-between border-t border-[#eaeaea] pt-4 text-[20px] font-medium tracking-tight text-black"><span>Tổng hóa đơn</span><strong>{formatCurrency(totalAmount)}</strong></div>
              </div>
            </div>
          </div>
        </section>

        {mode === "edit" ? (
          <section className="mb-8 rounded-[24px] border border-[#eaeaea] bg-white p-6 md:p-8 lg:col-span-8 lg:col-start-1">
            <div className="mb-8 flex items-center justify-between border-b border-[#eaeaea] pb-4">
            <h2 className="text-[24px] font-medium tracking-tight text-black">Thanh toán</h2>
              {amountDue > 0 ? <button type="button" onClick={() => setShowPaymentModal(true)} className="inline-flex items-center gap-2 rounded-md border border-[#eaeaea] bg-white px-4 py-2 text-[15px] font-medium text-black transition-colors hover:bg-gray-50"><Plus className="h-4 w-4" />Ghi nhận thanh toán</button> : null}
            </div>
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#eaeaea] pb-4 text-[15px]"><span className="text-gray-500">Đã thanh toán</span><strong className="font-medium text-black">{formatCurrency(amountPaid)}</strong></div>
              <div className="flex items-center justify-between border-b border-[#eaeaea] pb-4 text-[15px]"><span className="text-gray-500">Còn lại</span><strong className="font-medium text-red-600">{formatCurrency(amountDue)}</strong></div>
              {(initialData?.payments || []).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between pt-2 text-[15px]"><span className="text-gray-500">{payment.method} · {formatDate(payment.paidAt || payment.createdAt)}</span><strong className="font-medium text-black">{formatCurrency(numberValue(payment.amount))}</strong></div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mb-8 rounded-[24px] border border-[#eaeaea] bg-white p-6 md:p-8 lg:col-span-8 lg:col-start-1">
          <div className="mb-8 flex items-center justify-between border-b border-[#eaeaea] pb-4">
            <h2 className="text-[24px] font-medium tracking-tight text-black">Tệp đính kèm</h2></div>
          <div className="grid gap-6 md:grid-cols-2">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center transition-colors hover:bg-gray-100">
              <input type="file" multiple className="sr-only" onChange={(event) => { addAttachments(event.target.files); event.currentTarget.value = ""; }} />
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

        <section className="mb-8 rounded-[24px] border border-[#eaeaea] bg-white p-6 md:p-8 lg:col-span-8 lg:col-start-1">
          <div className="mb-8 flex items-center justify-between border-b border-[#eaeaea] pb-4">
            <h2 className="text-[24px] font-medium tracking-tight text-black">Ghi chú</h2></div>
          <div className="grid gap-4">
            <Field label="Ghi chú nội bộ / gửi khách">
              <TiptapEditor 
                value={notes} 
                onChange={(content) => setNotes(content)} 
                placeholder="Ghi chú hóa đơn..." 
              />
            </Field>
          </div>
        </section>

        <section className="mb-8 rounded-[24px] border border-[#eaeaea] bg-white p-6 md:p-8 lg:col-span-8 lg:col-start-1">
          <div className="mb-8 flex items-center justify-between border-b border-[#eaeaea] pb-4">
            <h2 className="text-[24px] font-medium tracking-tight text-black">Điều khoản hóa đơn</h2>
          </div>
          <div className="contract-terms-editor">
            <Field label="Điều khoản / Nội dung thêm">
              <TiptapEditor 
                value={terms} 
                onChange={(content) => setTerms(content)} 
                placeholder="Điều khoản thanh toán, hóa đơn VAT..." 
              />
            </Field>
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
