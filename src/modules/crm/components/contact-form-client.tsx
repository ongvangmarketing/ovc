"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";

import { createContact, lookupCompanyByTaxCode, updateContact, type ContactPayload } from "@/app/actions/crm";
import { cn } from "@/lib/utils/cn";

type CompanyOption = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  customFields?: unknown | null;
};

type AssigneeOption = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

type ContactFormInitial = ContactPayload & {
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
      <span className="mb-1.5 block text-[14px] font-light text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function CompanyCombo({
  value,
  search,
  selectedTitle,
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
          placeholder="Gõ tên công ty, email hoặc mã số thuế..."
          type="search"
        />
        {open ? (
          <div className="quote-combo-menu">
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onSelect(null);
                onSearchChange("");
                setOpen(false);
              }}
              className={cn("quote-combo-option", !value && "quote-combo-option-active")}
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
                  onSearchChange(company.name);
                  setOpen(false);
                }}
                className={cn("quote-combo-option", company.id === value && "quote-combo-option-active")}
              >
                <span>{company.name}</span>
                <small>{companySubtitle(company) || "Chưa có email công ty"}</small>
              </button>
            ))}
            {!options.length ? <div className="quote-detail-empty">Nhập tên mới để tự tạo công ty khi lưu.</div> : null}
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
  const [tagText, setTagText] = useState(splitTags(initial?.tags));
  const [error, setError] = useState<string | null>(null);
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);
  const [lastLookupTaxCode, setLastLookupTaxCode] = useState("");

  const title = useMemo(() => mode === "create" ? "Tạo khách hàng" : "Chỉnh sửa khách hàng", [mode]);
  const selectedCompany = useMemo(() => companies.find((company) => company.id === form.companyId), [companies, form.companyId]);
  const filteredCompanies = useMemo(() => {
    const keyword = companySearch.trim().toLowerCase();
    if (!keyword) return companies;

    return companies.filter((company) =>
      [company.name, company.email, company.phone, companyTaxCode(company)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [companies, companySearch]);

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
      return;
    }

    setForm((current) => ({
      ...current,
      companyId: company.id,
      companyName: company.name,
      companyEmail: company.email || current.companyEmail || "",
      companyTaxCode: companyTaxCode(company) || current.companyTaxCode || "",
    }));
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
    <div className="quote-page mx-auto max-w-[1280px] px-6 py-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="quote-breadcrumb">Khách hàng</p>
          <h1 className="quote-work-heading text-slate-950">{title}</h1>
        </div>
        <div className="quote-form-actions">
          <button type="button" onClick={() => router.back()} className="quote-action-button quote-action-secondary">Quay lại</button>
          <button type="submit" form="contact-form" disabled={saveMutation.isPending} className="quote-action-button quote-action-primary">
            {saveMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      {error ? <div className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-light text-red-700">{error}</div> : null}

      <form id="contact-form" className="space-y-5" onSubmit={(event) => { event.preventDefault(); setError(null); saveMutation.mutate(); }}>
        <section className="quote-panel">
          <div className="quote-panel-header"><h2>Thông tin khách hàng</h2></div>
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Tên khách hàng" className="md:col-span-2">
              <input value={form.firstName} onChange={(event) => update("firstName", event.target.value)} className="quote-input" placeholder="Tên khách hàng" required />
            </Field>
            <Field label="Loại khách hàng">
              <select value={form.type} onChange={(event) => update("type", event.target.value as ContactPayload["type"])} className="quote-input">
                {typeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            <Field label="Trạng thái">
              <select value={form.status} onChange={(event) => update("status", event.target.value as ContactPayload["status"])} className="quote-input">
                {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
          </div>
        </section>

        <section className="quote-panel">
          <div className="quote-panel-header"><h2>Liên hệ & công ty</h2></div>
          <div className="grid gap-4 lg:grid-cols-4">
            <Field label="Email khách hàng">
              <input type="email" value={form.email || ""} onChange={(event) => update("email", event.target.value)} className="quote-input" placeholder="email@domain.com" />
            </Field>
            <Field label="Số điện thoại">
              <input value={form.phone || ""} onChange={(event) => update("phone", event.target.value)} className="quote-input" placeholder="0918..." />
            </Field>
            <Field label="Di động">
              <input value={form.mobile || ""} onChange={(event) => update("mobile", event.target.value)} className="quote-input" placeholder="Số phụ nếu có" />
            </Field>
            <Field label="Người phụ trách">
              <select value={form.assigneeId || ""} onChange={(event) => update("assigneeId", event.target.value || null)} className="quote-input">
                <option value="">Chưa gán</option>
                {assignees.map((assignee) => <option key={assignee.id} value={assignee.id}>{assignee.name} · {assignee.email}</option>)}
              </select>
            </Field>
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
              <input type="email" value={form.companyEmail || ""} onChange={(event) => update("companyEmail", event.target.value)} className="quote-input" placeholder="company@domain.com" />
            </Field>
            <Field label="Mã số thuế">
              <div className="flex gap-2">
                <input value={form.companyTaxCode || ""} onChange={(event) => handleCompanyTaxCodeChange(event.target.value)} className="quote-input" placeholder="Nhập MST để tự tra cứu" />
                <button
                  type="button"
                  onClick={() => runTaxLookup(form.companyTaxCode || "")}
                  disabled={taxLookupMutation.isPending}
                  className="quote-button quote-button-soft shrink-0"
                >
                  {taxLookupMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Tra cứu
                </button>
              </div>
              {lookupMessage ? <small className="mt-1 block text-[13px] text-emerald-600">{lookupMessage}</small> : null}
            </Field>
            <Field label="Chức danh">
              <input value={form.jobTitle || ""} onChange={(event) => update("jobTitle", event.target.value)} className="quote-input" placeholder="Giám đốc, kế toán..." />
            </Field>
            <Field label="Phòng ban">
              <input value={form.department || ""} onChange={(event) => update("department", event.target.value)} className="quote-input" placeholder="Kinh doanh..." />
            </Field>
            <Field label="Nguồn khách hàng">
              <input value={form.source || ""} onChange={(event) => update("source", event.target.value)} className="quote-input" placeholder="website, referral, facebook..." />
            </Field>
            <Field label="Ưu tiên">
              <select value={form.priority} onChange={(event) => update("priority", event.target.value as ContactPayload["priority"])} className="quote-input">
                {priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
          </div>
        </section>

        <section className="quote-panel">
          <div className="quote-panel-header"><h2>Địa chỉ & ghi chú</h2></div>
          <div className="grid gap-4 lg:grid-cols-4">
            <Field label="Địa chỉ công ty" className="lg:col-span-2">
              <input value={form.address || ""} onChange={(event) => update("address", event.target.value)} className="quote-input" placeholder="Nhập địa chỉ công ty / khách hàng" />
            </Field>
            <Field label="Tags" className="lg:col-span-2">
              <input value={tagText} onChange={(event) => setTagText(event.target.value)} className="quote-input" placeholder="VIP, business, chăm sóc lại" />
            </Field>
            <Field label="Ghi chú" className="lg:col-span-4">
              <textarea value={form.notes || ""} onChange={(event) => update("notes", event.target.value)} className="quote-input min-h-32 resize-y" placeholder="Ghi chú nội bộ, nhu cầu, lịch sử trao đổi..." />
            </Field>
          </div>
        </section>
      </form>
    </div>
  );
}
