"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Save, User, Building2, ExternalLink, Loader2, Search, X } from "lucide-react";
import Link from "next/link";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

import { createContact, lookupCompanyByTaxCode, updateContact, type ContactPayload } from "@/modules/crm/actions/crm.actions";
import { cn } from "@/lib/utils/cn";

type CompanyOption = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  customFields?: unknown | null;
};

type AssigneeOption = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

type ContactFormInitial = Partial<ContactPayload> & {
  id?: string;
  companyId?: string | null;
  company?: CompanyOption | null;
  assignee?: AssigneeOption | null;
};

const typeOptions = [
  { value: "CUSTOMER", label: "Khách hàng" },
  { value: "LEAD", label: "Tiềm năng" },
  { value: "PROSPECT", label: "Cơ hội" },
  { value: "PARTNER", label: "Đối tác" },
  { value: "VENDOR", label: "Nhà cung cấp" },
] as const;

const statusOptions = [
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "INACTIVE", label: "Không hoạt động" },
  { value: "BLOCKED", label: "Chặn" },
] as const;

const priorityOptions = [
  { value: "LOW", label: "Thấp" },
  { value: "MEDIUM", label: "Trung bình" },
  { value: "HIGH", label: "Cao" },
  { value: "URGENT", label: "Khẩn cấp" },
] as const;

function splitTags(value?: string[]) {
  return value?.join(", ") || "";
}

function parseTags(value: string) {
  return value.split(",").map((tag) => tag.trim()).filter(Boolean);
}

function objectFields(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  return {};
}

function companyTaxCode(company?: Pick<CompanyOption, "customFields"> | null) {
  const value = objectFields(company?.customFields).taxCode;
  return typeof value === "string" ? value : "";
}

function normalizedLookup(value?: string | null) {
  return value?.trim().toLowerCase() || "";
}

function companySubtitle(company: CompanyOption) {
  return [company.email, company.phone, companyTaxCode(company) ? `MST: ${companyTaxCode(company)}` : ""]
    .filter(Boolean)
    .join(" · ");
}

function customerName(initial?: ContactFormInitial) {
  return [initial?.firstName, initial?.lastName].filter(Boolean).join(" ").trim();
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
      <span className="mb-2 block text-[13px] font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function CompanyCombo({
  value,
  search,
  options,
  onSearchChange,
  onSelect,
}: {
  value: string;
  search: string;
  selectedTitle?: string;
  options: CompanyOption[];
  onSearchChange: (value: string) => void;
  onSelect: (company: CompanyOption | null) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Field label="Công ty">
      <div className="relative">
        <Search className="absolute left-3 top-[11px] h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(event) => {
            onSearchChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="flex h-10 w-full rounded-lg border border-[#eaeaea] bg-white pl-10 pr-10 py-2 text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black transition-shadow"
          placeholder="Gõ tên công ty, email hoặc mã số thuế..."
          type="search"
        />
        {search || value ? (
          <button
            type="button"
            aria-label="Xóa công ty"
            onClick={() => {
              onSelect(null);
              onSearchChange("");
              setOpen(false);
            }}
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
        {open ? (
          <div className="absolute left-0 right-0 top-full mt-2 max-h-60 overflow-y-auto rounded-xl border border-[#eaeaea] bg-white p-1.5 shadow-xl shadow-black/5 z-50">
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onSelect(null);
                onSearchChange("");
                setOpen(false);
              }}
              className={cn("flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[14px] transition-colors hover:bg-gray-50", !value ? "font-medium text-black bg-gray-50" : "text-gray-600")}
            >
              Không gắn công ty
            </button>
            {options.slice(0, 9).map((company) => (
              <button
                key={company.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(company);
                  setOpen(false);
                }}
                className={cn("flex w-full flex-col items-start rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-50 mt-0.5", company.id === value ? "bg-gray-50" : "")}
              >
                <span className={cn("text-[14px]", company.id === value ? "font-medium text-black" : "text-gray-700")}>{company.name}</span>
                <small className="text-[12px] text-gray-500 mt-0.5">{companySubtitle(company) || "Chưa có email công ty"}</small>
              </button>
            ))}
            {!options.length ? <div className="px-3 py-3 text-center text-[13px] text-gray-500">Nhập tên mới để tự tạo công ty khi lưu.</div> : null}
          </div>
        ) : null}
      </div>
    </Field>
  );
}

function assigneeSubtitle(assignee: AssigneeOption) {
  return [assignee.role, assignee.email].filter(Boolean).join(" · ");
}

function AssigneeCombo({
  value,
  search,
  options,
  onSearchChange,
  onSelect,
}: {
  value: string;
  search: string;
  selectedTitle?: string;
  options: AssigneeOption[];
  onSearchChange: (value: string) => void;
  onSelect: (assignee: AssigneeOption | null) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Field label="Người phụ trách">
      <div className="relative">
        <Search className="absolute left-3 top-[11px] h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(event) => {
            onSearchChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="flex h-10 w-full rounded-lg border border-[#eaeaea] bg-white pl-10 pr-10 py-2 text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black transition-shadow"
          placeholder="Tìm theo tên, email hoặc vai trò..."
          type="search"
        />
        {value ? (
          <button
            type="button"
            aria-label="Xóa người phụ trách"
            onClick={() => {
              onSelect(null);
              onSearchChange("");
              setOpen(false);
            }}
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
        {open ? (
          <div className="absolute left-0 right-0 top-full mt-2 max-h-60 overflow-y-auto rounded-xl border border-[#eaeaea] bg-white p-1.5 shadow-xl shadow-black/5 z-50">
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onSelect(null);
                onSearchChange("");
                setOpen(false);
              }}
              className={cn("flex w-full flex-col items-start rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-50", !value ? "bg-gray-50" : "")}
            >
              <span className={cn("text-[14px]", !value ? "font-medium text-black" : "text-gray-700")}>Chưa gán</span>
              <small className="text-[12px] text-gray-500 mt-0.5">Xóa người phụ trách khỏi khách hàng này</small>
            </button>
            {options.slice(0, 9).map((assignee) => (
              <button
                key={assignee.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(assignee);
                  setOpen(false);
                }}
                className={cn("flex w-full flex-col items-start rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-50 mt-0.5", assignee.id === value ? "bg-gray-50" : "")}
              >
                <span className={cn("text-[14px]", assignee.id === value ? "font-medium text-black" : "text-gray-700")}>{assignee.name}</span>
                <small className="text-[12px] text-gray-500 mt-0.5">{assigneeSubtitle(assignee) || "Chưa có email"}</small>
              </button>
            ))}
            {!options.length ? <div className="px-3 py-3 text-center text-[13px] text-gray-500">Không tìm thấy người phụ trách phù hợp.</div> : null}
          </div>
        ) : null}
      </div>
    </Field>
  );
}

export function ContactFormClient({
  mode,
  initial,
  companies,
  assignees,
}: {
  mode: "create" | "edit";
  initial?: ContactFormInitial;
  companies: CompanyOption[];
  assignees: AssigneeOption[];
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const initialCompanyName = initial?.company?.name || initial?.companyName || "";
  const [form, setForm] = useState<ContactPayload>({
    firstName: customerName(initial) || initial?.firstName || "",
    lastName: "",
    email: initial?.email || "",
    phone: initial?.phone || "",
    mobile: initial?.mobile || "",
    jobTitle: initial?.jobTitle || "",
    department: initial?.department || "",
    type: initial?.type || "CUSTOMER",
    status: initial?.status || "ACTIVE",
    priority: initial?.priority || "MEDIUM",
    source: initial?.source || "",
    tags: initial?.tags || [],
    notes: initial?.notes || "",
    address: initial?.address || "",
    city: "",
    country: "Vietnam",
    companyId: initial?.companyId || null,
    companyName: initialCompanyName,
    companyEmail: initial?.company?.email || initial?.companyEmail || "",
    companyTaxCode: companyTaxCode(initial?.company) || initial?.companyTaxCode || "",
    assigneeId: initial?.assigneeId || null,
  });
  const [companySearch, setCompanySearch] = useState(initialCompanyName);
  const [assigneeSearch, setAssigneeSearch] = useState(initial?.assignee?.name || "");
  const [tagText, setTagText] = useState(splitTags(initial?.tags));
  const [error, setError] = useState<string | null>(null);
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);
  const [lastLookupTaxCode, setLastLookupTaxCode] = useState("");
  const [customerKind, setCustomerKind] = useState<"PERSONAL" | "COMPANY">("PERSONAL");

  const title = useMemo(() => mode === "create" ? "Tạo khách hàng" : "Chỉnh sửa khách hàng", [mode]);
  const selectedCompany = useMemo(() => companies.find((company) => company.id === form.companyId), [companies, form.companyId]);
  const selectedAssignee = useMemo(() => assignees.find((assignee) => assignee.id === form.assigneeId), [assignees, form.assigneeId]);
  const filteredCompanies = useMemo(() => {
    const keyword = companySearch.trim().toLowerCase();
    if (!keyword) return companies;

    return companies.filter((company) =>
      [company.name, company.email, company.phone, companyTaxCode(company)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [companies, companySearch]);
  const filteredAssignees = useMemo(() => {
    const keyword = assigneeSearch.trim().toLowerCase();
    if (!keyword) return assignees;

    return assignees.filter((assignee) =>
      [assignee.name, assignee.email, assignee.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [assignees, assigneeSearch]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, lastName: "", tags: parseTags(tagText) };
      return mode === "create" ? createContact(payload) : updateContact(initial!.id!, payload);
    },
    onSuccess: (result) => {
      if (!result.success) {
        setError(result.error || "Không thể lưu khách hàng");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      router.push(`/workspace/crm/contacts/${result.id}`);
      router.refresh();
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Không thể lưu khách hàng");
    },
  });

  const taxLookupMutation = useMutation({
    mutationFn: lookupCompanyByTaxCode,
    onSuccess: (result, taxCode) => {
      if (!result.success) {
        setLookupMessage(result.error);
        return;
      }

      setForm((current) => ({
        ...current,
        companyId: null,
        companyTaxCode: result.data.taxCode || taxCode,
        companyName: result.data.name,
        address: result.data.address || current.address,
      }));
      setCompanySearch(result.data.name);
      setLookupMessage(result.data.status ? `Đã lấy thông tin: ${result.data.status}` : "Đã lấy thông tin công ty từ mã số thuế");
    },
    onError: () => {
      setLookupMessage("Không thể tra cứu mã số thuế lúc này");
    },
  });

  const update = <K extends keyof ContactPayload>(key: K, value: ContactPayload[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleCompanySearch = (value: string) => {
    setCompanySearch(value);
    setForm((current) => ({ ...current, companyId: null, companyName: value }));
  };

  const handleCompanySelect = (company: CompanyOption | null) => {
    if (!company) {
      setForm((current) => ({ ...current, companyId: null, companyName: "", companyEmail: "", companyTaxCode: "" }));
      setCompanySearch("");
      return;
    }

    setForm((current) => ({
      ...current,
      companyId: company.id,
      companyName: company.name,
      companyEmail: company.email || current.companyEmail || "",
      companyTaxCode: companyTaxCode(company) || current.companyTaxCode || "",
    }));
    setCompanySearch(company.name);
  };

  const handleAssigneeSearch = (value: string) => {
    setAssigneeSearch(value);
    setForm((current) => ({ ...current, assigneeId: null }));
  };

  const handleAssigneeSelect = (assignee: AssigneeOption | null) => {
    setForm((current) => ({ ...current, assigneeId: assignee?.id || null }));
    setAssigneeSearch(assignee?.name || "");
  };

  const handleCompanyTaxCodeChange = (value: string) => {
    const matchedCompany = companies.find((company) => normalizedLookup(companyTaxCode(company)) === normalizedLookup(value));

    setForm((current) => ({
      ...current,
      companyTaxCode: value,
      ...(matchedCompany
        ? {
            companyId: matchedCompany.id,
            companyName: matchedCompany.name,
            companyEmail: matchedCompany.email || current.companyEmail || "",
          }
        : {}),
    }));

    if (matchedCompany) setCompanySearch(matchedCompany.name);
    if (matchedCompany) setLookupMessage(`Đã khớp công ty có sẵn: ${matchedCompany.name}`);
  };

  const runTaxLookup = (taxCode: string) => {
    const normalizedTaxCode = taxCode.trim().replace(/\s+/g, "");
    if (normalizedTaxCode.length < 10) {
      setLookupMessage(null);
      return;
    }

    const matchedCompany = companies.find((company) => normalizedLookup(companyTaxCode(company)) === normalizedLookup(normalizedTaxCode));
    if (matchedCompany) return;
    if (normalizedTaxCode === lastLookupTaxCode) return;

    setLastLookupTaxCode(normalizedTaxCode);
    setLookupMessage("Đang tra cứu mã số thuế...");
    taxLookupMutation.mutate(normalizedTaxCode);
  };

  useEffect(() => {
    const normalizedTaxCode = (form.companyTaxCode || "").trim().replace(/\s+/g, "");
    if (normalizedTaxCode.length < 10) return;

    const timer = window.setTimeout(() => runTaxLookup(normalizedTaxCode), 800);
    return () => window.clearTimeout(timer);
  }, [form.companyTaxCode]);

  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase w-fit">
              CRM Form
            </span>
          </div>
          <h1 className="text-[32px] md:text-[44px] tracking-tight leading-[1.15] font-medium uppercase">{title}</h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button type="button" onClick={() => router.back()} className="flex items-center justify-center h-9 px-4 text-[13px] font-medium text-black bg-white border border-[#eaeaea] rounded-md hover:bg-gray-50 transition-colors">Hủy</button>
          <button type="submit" form="contact-form" disabled={saveMutation.isPending} className="flex items-center justify-center h-9 px-6 text-[13px] font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50">
            {saveMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg w-fit mb-8">
        <button 
          type="button" 
          onClick={() => setCustomerKind("PERSONAL")}
          className={cn("px-4 py-1.5 text-[14px] font-medium rounded-md transition-colors", customerKind === "PERSONAL" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black")}
        >
          Cá nhân
        </button>
        <button 
          type="button" 
          onClick={() => setCustomerKind("COMPANY")}
          className={cn("px-4 py-1.5 text-[14px] font-medium rounded-md transition-colors", customerKind === "COMPANY" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black")}
        >
          Công ty
        </button>
      </div>

      {error ? <div className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-light text-red-700">{error}</div> : null}

      <form id="contact-form" className="space-y-5" onSubmit={(event) => { event.preventDefault(); setError(null); saveMutation.mutate(); }}>
        <section className="bg-white rounded-2xl border border-[#eaeaea] p-6 lg:p-8">
          <h2 className="text-[16px] font-medium text-black mb-6">Thông tin khách hàng</h2>
          <div className="grid gap-5 md:grid-cols-4">
            <Field label={customerKind === "COMPANY" ? "Tên công ty" : "Tên khách hàng"} className={customerKind === "COMPANY" ? "md:col-span-4 lg:col-span-2" : "md:col-span-2"}>
              <input value={form.firstName} onChange={(event) => update("firstName", event.target.value)} className="flex h-10 w-full rounded-lg border border-[#eaeaea] bg-white px-3 py-2 text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black transition-shadow" placeholder={customerKind === "COMPANY" ? "Tên công ty" : "Tên khách hàng"} required />
            </Field>
            {customerKind === "COMPANY" && (
              <Field label="Mã số thuế" className="md:col-span-2">
                <div className="flex gap-2">
                  <input value={form.companyTaxCode || ""} onChange={(event) => handleCompanyTaxCodeChange(event.target.value)} className="flex h-10 w-full rounded-lg border border-[#eaeaea] bg-white px-3 py-2 text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black transition-shadow" placeholder="Nhập MST để tự tra cứu" />
                  <button
                    type="button"
                    onClick={() => runTaxLookup(form.companyTaxCode || "")}
                    disabled={taxLookupMutation.isPending}
                    className="flex h-10 items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 text-[13px] font-medium text-black hover:bg-gray-200 transition-colors shrink-0"
                  >
                    {taxLookupMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Tra cứu
                  </button>
                </div>
                {lookupMessage ? <small className="mt-1.5 block text-[12px] text-emerald-600">{lookupMessage}</small> : null}
              </Field>
            )}
            <Field label="Loại khách hàng">
              <select value={form.type} onChange={(event) => update("type", event.target.value as ContactPayload["type"])} className="flex h-10 w-full rounded-lg border border-[#eaeaea] bg-white px-3 py-2 text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black transition-shadow">
                {typeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            <Field label="Trạng thái">
              <select value={form.status} onChange={(event) => update("status", event.target.value as ContactPayload["status"])} className="flex h-10 w-full rounded-lg border border-[#eaeaea] bg-white px-3 py-2 text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black transition-shadow">
                {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#eaeaea] p-6 lg:p-8">
          <h2 className="text-[16px] font-medium text-black mb-6">Liên hệ & thông tin thêm</h2>
          <div className="grid gap-5 lg:grid-cols-4">
            <Field label={customerKind === "COMPANY" ? "Email liên hệ" : "Email khách hàng"}>
              <input type="email" value={form.email || ""} onChange={(event) => update("email", event.target.value)} className="flex h-10 w-full rounded-lg border border-[#eaeaea] bg-white px-3 py-2 text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black transition-shadow" placeholder="email@domain.com" />
            </Field>
            <Field label="Số điện thoại">
              <input value={form.phone || ""} onChange={(event) => update("phone", event.target.value)} className="flex h-10 w-full rounded-lg border border-[#eaeaea] bg-white px-3 py-2 text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black transition-shadow" placeholder="0918..." />
            </Field>
            <Field label="Di động">
              <input value={form.mobile || ""} onChange={(event) => update("mobile", event.target.value)} className="flex h-10 w-full rounded-lg border border-[#eaeaea] bg-white px-3 py-2 text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black transition-shadow" placeholder="Số phụ nếu có" />
            </Field>
            <AssigneeCombo
              value={form.assigneeId || ""}
              search={assigneeSearch}
              selectedTitle={selectedAssignee?.name || initial?.assignee?.name}
              options={filteredAssignees}
              onSearchChange={handleAssigneeSearch}
              onSelect={handleAssigneeSelect}
            />
            
            {customerKind === "PERSONAL" && (
              <>
                <div className="lg:col-span-2">
                  <CompanyCombo
                    value={form.companyId || ""}
                    search={companySearch}
                    selectedTitle={selectedCompany?.name || form.companyName}
                    options={filteredCompanies}
                    onSearchChange={handleCompanySearch}
                    onSelect={handleCompanySelect}
                  />
                </div>
                <Field label="Email công ty">
                  <input type="email" value={form.companyEmail || ""} onChange={(event) => update("companyEmail", event.target.value)} className="flex h-10 w-full rounded-lg border border-[#eaeaea] bg-white px-3 py-2 text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black transition-shadow" placeholder="company@domain.com" />
                </Field>
                <Field label="Mã số thuế">
                  <div className="flex gap-2">
                    <input value={form.companyTaxCode || ""} onChange={(event) => handleCompanyTaxCodeChange(event.target.value)} className="flex h-10 w-full rounded-lg border border-[#eaeaea] bg-white px-3 py-2 text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black transition-shadow" placeholder="Nhập MST để tự tra cứu" />
                    <button
                      type="button"
                      onClick={() => runTaxLookup(form.companyTaxCode || "")}
                      disabled={taxLookupMutation.isPending}
                      className="flex h-10 items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 text-[13px] font-medium text-black hover:bg-gray-200 transition-colors shrink-0"
                    >
                      {taxLookupMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      Tra cứu
                    </button>
                  </div>
                  {lookupMessage ? <small className="mt-1.5 block text-[12px] text-emerald-600">{lookupMessage}</small> : null}
                </Field>
              </>
            )}

            <Field label={customerKind === "COMPANY" ? "Người đại diện" : "Chức danh"}>
              <input value={form.jobTitle || ""} onChange={(event) => update("jobTitle", event.target.value)} className="flex h-10 w-full rounded-lg border border-[#eaeaea] bg-white px-3 py-2 text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black transition-shadow" placeholder={customerKind === "COMPANY" ? "Đại diện..." : "Giám đốc..."} />
            </Field>
            <Field label="Phòng ban">
              <input value={form.department || ""} onChange={(event) => update("department", event.target.value)} className="flex h-10 w-full rounded-lg border border-[#eaeaea] bg-white px-3 py-2 text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black transition-shadow" placeholder="Kinh doanh..." />
            </Field>
            <Field label="Nguồn khách hàng">
              <input value={form.source || ""} onChange={(event) => update("source", event.target.value)} className="flex h-10 w-full rounded-lg border border-[#eaeaea] bg-white px-3 py-2 text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black transition-shadow" placeholder="website, referral..." />
            </Field>
            <Field label="Ưu tiên">
              <select value={form.priority} onChange={(event) => update("priority", event.target.value as ContactPayload["priority"])} className="flex h-10 w-full rounded-lg border border-[#eaeaea] bg-white px-3 py-2 text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black transition-shadow">
                {priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#eaeaea] p-6 lg:p-8">
          <h2 className="text-[16px] font-medium text-black mb-6">Địa chỉ & ghi chú</h2>
          <div className="grid gap-5 lg:grid-cols-4">
            <Field label="Địa chỉ" className="lg:col-span-2">
              <input value={form.address || ""} onChange={(event) => update("address", event.target.value)} className="flex h-10 w-full rounded-lg border border-[#eaeaea] bg-white px-3 py-2 text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black transition-shadow" placeholder="Nhập địa chỉ" />
            </Field>
            <Field label="Tags" className="lg:col-span-2">
              <input value={tagText} onChange={(event) => setTagText(event.target.value)} className="flex h-10 w-full rounded-lg border border-[#eaeaea] bg-white px-3 py-2 text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black transition-shadow" placeholder="VIP, business, chăm sóc lại" />
            </Field>
            <Field label="Ghi chú" className="lg:col-span-4">
              <div className="rounded-lg border border-[#eaeaea] bg-white overflow-hidden focus-within:ring-1 focus-within:ring-black transition-shadow">
                <TiptapEditor 
                  value={form.notes || ""} 
                  onChange={(content) => update("notes", content)} 
                  placeholder="Ghi chú nội bộ, nhu cầu, lịch sử trao đổi..." 
                />
              </div>
            </Field>
          </div>
        </section>
      </form>
    </div>
  );
}
