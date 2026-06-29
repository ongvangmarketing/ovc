"use client";

import { useState } from "react";
import type { ElementType } from "react";
import { ArrowLeft, BarChart3, CalendarDays, CheckCircle2, CircleDot, Flag, Megaphone, Save, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProject, updateProjectSocialReportSetup } from "@/app/actions/projects";
import { cn } from "@/lib/utils/cn";
import { getInitials } from "@/lib/utils/format";

const projectColors = ["#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EF4444", "#06B6D4", "#64748B"];

const statuses = [
  { value: "PLANNING", label: "Lên kế hoạch" },
  { value: "ACTIVE", label: "Đang chạy" },
  { value: "ON_HOLD", label: "Tạm dừng" },
  { value: "COMPLETED", label: "Hoàn tất" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const priorities = [
  { value: "LOW", label: "Thấp" },
  { value: "MEDIUM", label: "Vừa" },
  { value: "HIGH", label: "Cao" },
  { value: "URGENT", label: "Khẩn" },
];

type ProjectForm = {
  name: string;
  description: string;
  color: string;
  status: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED" | "ARCHIVED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  startDate: string;
  dueDate: string;
  budget: string;
  contactId: string;
  portalVisible: boolean;
};

type ProjectLite = {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  status?: ProjectForm["status"] | null;
  priority?: ProjectForm["priority"] | null;
  startDate?: string | Date | null;
  dueDate?: string | Date | null;
  budget?: unknown;
  contactId?: string | null;
  portalVisible?: boolean;
  customerContacts?: Array<{ id: string; name: string; email?: string | null }>;
  socialMarketingEnabled?: boolean;
  facebookPages?: Array<{ id: string; externalId: string; name: string; avatarUrl?: string | null; selected: boolean }>;
  facebookAdAccounts?: Array<{ id: string; externalId: string; name: string; currency?: string | null; timezone?: string | null; selected: boolean }>;
  facebookReportSetup?: {
    enabledSources?: Record<string, unknown>;
    pageExternalId?: string;
    pageName?: string;
    adAccountExternalId?: string;
    adAccountName?: string;
    pageTokenSaved?: boolean;
    adsTokenSaved?: boolean;
    campaignIds?: string[];
    adIds?: string[];
  } | null;
};

function dateInput(value?: string | Date | null) {
  if (!value) return "";
  return new Date(value).toISOString().split("T")[0] || "";
}

export function ProjectEditClient({ project }: { project: ProjectLite }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const selectedContact = (project.customerContacts || []).find((contact) => contact.id === (project.contactId || ""));
  const [customerSearch, setCustomerSearch] = useState(selectedContact ? contactTitle(selectedContact) : "");
  const selectedPage = (project.facebookPages || []).find((page) => page.externalId === project.facebookReportSetup?.pageExternalId);
  const [pageSearch, setPageSearch] = useState(selectedPage?.name || "");
  const selectedAdAccount = (project.facebookAdAccounts || []).find((account) => account.externalId === project.facebookReportSetup?.adAccountExternalId);
  const [adAccountSearch, setAdAccountSearch] = useState(selectedAdAccount ? adAccountTitle(selectedAdAccount) : "");
  const [form, setForm] = useState<ProjectForm>({
    name: project.name || "",
    description: project.description || "",
    color: project.color || "#F59E0B",
    status: project.status || "ACTIVE",
    priority: project.priority || "MEDIUM",
    startDate: dateInput(project.startDate),
    dueDate: dateInput(project.dueDate),
    budget: project.budget ? String(project.budget) : "",
    contactId: project.contactId || "",
    portalVisible: Boolean(project.portalVisible),
  });
  const [reportForm, setReportForm] = useState({
    enablePage: Boolean(project.facebookReportSetup?.enabledSources?.page || project.facebookReportSetup?.pageExternalId),
    enableAds: Boolean(project.facebookReportSetup?.enabledSources?.ads || project.facebookReportSetup?.adAccountExternalId || project.facebookReportSetup?.adIds?.length || project.facebookReportSetup?.campaignIds?.length),
    pageExternalId: project.facebookReportSetup?.pageExternalId || "",
    adAccountExternalId: project.facebookReportSetup?.adAccountExternalId || "",
    pageAccessToken: "",
    adsAccessToken: "",
    campaignIdsText: project.facebookReportSetup?.campaignIds?.join("\n") || "",
    adIdsText: project.facebookReportSetup?.adIds?.join("\n") || "",
  });
  const filteredContacts = (project.customerContacts || []).filter((contact) => optionMatches(`${contact.name} ${contact.email || ""}`, customerSearch));
  const filteredPages = (project.facebookPages || []).filter((page) => optionMatches(page.name, pageSearch));
  const filteredAdAccounts = (project.facebookAdAccounts || []).filter((account) => optionMatches(`${account.name} ${account.externalId}`, adAccountSearch));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    setIsSaving(true);
    const res = await updateProject(project.id, form);
    const reportRes: { success: boolean; error?: string } = res.success && project.socialMarketingEnabled
      ? await updateProjectSocialReportSetup(project.id, reportForm)
      : { success: true };
    if (res.success && reportRes.success) {
      toast.success("Đã cập nhật dự án");
      router.refresh();
      window.location.assign(`/workspace/projects/${project.id}?saved=${Date.now()}`);
    } else {
      toast.error(res.error || reportRes.error || "Không lưu được dự án");
      setIsSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-start gap-3">
          <Link href={`/workspace/projects/${project.id}`} className="mt-1 rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Quay lại">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Project Settings
            </div>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Sửa dự án</h2>
            <p className="mt-1 text-sm text-muted-foreground">Cập nhật brief, trạng thái và dấu hiệu nhận diện cho team.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <section className="quote-panel">
          <div className="quote-panel-header">
            <h2>Thông tin chính</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Tên dự án" className="md:col-span-2">
              <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="quote-input" />
            </Field>
            <Field label="Trạng thái">
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ProjectForm["status"] })} className="quote-input">
                {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </Field>
            <Field label="Ưu tiên">
              <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as ProjectForm["priority"] })} className="quote-input">
                {priorities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </Field>
            <Field label="Ngày bắt đầu">
              <input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} className="quote-input" />
            </Field>
            <Field label="Hạn hoàn thành">
              <input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className="quote-input" />
            </Field>
            <Field label="Ngân sách" className="md:col-span-2">
              <input type="number" min={0} value={form.budget} onChange={(event) => setForm({ ...form, budget: event.target.value })} className="quote-input" placeholder="VD: 50000000" />
            </Field>
            <Field label="Khách hàng" className="md:col-span-2">
              <ComboSelect
                value={form.contactId}
                search={customerSearch}
                selectedTitle={(project.customerContacts || []).find((contact) => contact.id === form.contactId) ? contactTitle((project.customerContacts || []).find((contact) => contact.id === form.contactId)!) : undefined}
                onSearchChange={setCustomerSearch}
                placeholder="Gõ tên, email hoặc mã khách hàng..."
                options={filteredContacts}
                getTitle={contactTitle}
                getSubtitle={(contact) => contact.email || ""}
                onSelect={(id) => setForm({ ...form, contactId: id })}
                allowEmpty
                emptyTitle="Chưa gán khách hàng"
              />
            </Field>
            <div className="md:col-span-2 rounded-2xl border border-border bg-slate-50/70 p-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={form.portalVisible}
                  disabled={!form.contactId}
                  onChange={(event) => setForm({ ...form, portalVisible: event.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary disabled:opacity-40"
                />
                <span>
                  <span className="block text-sm font-semibold text-foreground">Hiện trên Portal khách hàng</span>
                  <span className="text-xs leading-5 text-muted-foreground">Chỉ bật dự án nào thì tài khoản khách hàng mới thấy dự án, nhiệm vụ và báo cáo liên quan.</span>
                </span>
              </label>
            </div>
            <Field label="Mô tả / Brief" className="md:col-span-2">
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="quote-input min-h-[180px] resize-y" placeholder="Mục tiêu, phạm vi, đầu việc chính, tiêu chí nghiệm thu..." />
            </Field>
          </div>
        </section>

        <aside className="space-y-4">
          {project.socialMarketingEnabled ? (
            <section className="quote-panel">
              <div className="quote-panel-header items-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <h2>Nguồn báo cáo Social</h2>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">Tick nguồn nào thì portal khách sẽ thấy report nguồn đó.</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 rounded-xl border border-border p-3">
                  <input
                    type="checkbox"
                    checked={reportForm.enablePage}
                    onChange={(event) => setReportForm({ ...reportForm, enablePage: event.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">Facebook Page</span>
                    <span className="text-xs text-muted-foreground">Hiện reach, impression, engagement và bài đăng Page.</span>
                  </span>
                </label>
                {reportForm.enablePage ? (
                  <div className="space-y-3 rounded-xl bg-muted/40 p-3">
                    <Field label="Fanpage">
                      <ComboSelect
                        value={reportForm.pageExternalId}
                        search={pageSearch}
                        selectedTitle={(project.facebookPages || []).find((page) => page.externalId === reportForm.pageExternalId)?.name}
                        onSearchChange={setPageSearch}
                        placeholder="Gõ tên Fanpage..."
                        options={filteredPages}
                        getTitle={(page) => page.name}
                        getSubtitle={(page) => `Page ID: ${page.externalId}`}
                        getValue={(page) => page.externalId}
                        onSelect={(id) => setReportForm({ ...reportForm, pageExternalId: id })}
                        allowEmpty
                        emptyTitle="Chưa chọn Facebook Page"
                      />
                    </Field>
                    <Field label={project.facebookReportSetup?.pageTokenSaved ? "Page Token mới (để trống nếu giữ token cũ)" : "Page Token"}>
                      <textarea value={reportForm.pageAccessToken} onChange={(event) => setReportForm({ ...reportForm, pageAccessToken: event.target.value })} className="quote-input min-h-[112px] resize-y text-xs" placeholder="Dán Page Access Token..." />
                    </Field>
                  </div>
                ) : null}

                <label className="flex items-start gap-3 rounded-xl border border-border p-3">
                  <input
                    type="checkbox"
                    checked={reportForm.enableAds}
                    onChange={(event) => setReportForm({ ...reportForm, enableAds: event.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">Facebook Ads</span>
                    <span className="text-xs text-muted-foreground">Hiện campaign, ads, spend, reach, lead theo ID đã gắn.</span>
                  </span>
                </label>
                {reportForm.enableAds ? (
                  <div className="space-y-3 rounded-xl bg-muted/40 p-3">
                    <Field label="Ad Account">
                      <ComboSelect
                        value={reportForm.adAccountExternalId}
                        search={adAccountSearch}
                        selectedTitle={(project.facebookAdAccounts || []).find((account) => account.externalId === reportForm.adAccountExternalId) ? adAccountTitle((project.facebookAdAccounts || []).find((account) => account.externalId === reportForm.adAccountExternalId)!) : undefined}
                        onSearchChange={setAdAccountSearch}
                        placeholder="Gõ tên hoặc ID tài khoản quảng cáo..."
                        options={filteredAdAccounts}
                        getTitle={adAccountTitle}
                        getSubtitle={(account) => [account.currency, account.timezone].filter(Boolean).join(" · ")}
                        getValue={(account) => account.externalId}
                        onSelect={(id) => setReportForm({ ...reportForm, adAccountExternalId: id })}
                        allowEmpty
                        emptyTitle="Chưa chọn Ad Account"
                      />
                    </Field>
                    <Field label={project.facebookReportSetup?.adsTokenSaved ? "Ads Token mới (để trống nếu giữ token cũ)" : "Ads Token"}>
                      <textarea value={reportForm.adsAccessToken} onChange={(event) => setReportForm({ ...reportForm, adsAccessToken: event.target.value })} className="quote-input min-h-[92px] resize-y text-xs" placeholder="Dán token có quyền Ads..." />
                    </Field>
                    <Field label="Campaign ID">
                      <textarea value={reportForm.campaignIdsText} onChange={(event) => setReportForm({ ...reportForm, campaignIdsText: event.target.value })} className="quote-input min-h-[92px] resize-y text-xs" placeholder="Mỗi dòng một Campaign ID" />
                    </Field>
                    <Field label="Ads ID">
                      <textarea value={reportForm.adIdsText} onChange={(event) => setReportForm({ ...reportForm, adIdsText: event.target.value })} className="quote-input min-h-[92px] resize-y text-xs" placeholder="Mỗi dòng một Ads ID" />
                    </Field>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          <section className="quote-panel">
            <div className="quote-panel-header">
              <h2>Nhận diện</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {projectColors.map((color) => (
                <button key={color} type="button" onClick={() => setForm({ ...form, color })} className={cn("h-9 w-9 rounded-full border-2 transition-all", form.color === color ? "border-slate-900 ring-2 ring-slate-200" : "border-white hover:scale-105")} style={{ backgroundColor: color }} aria-label={color} />
              ))}
            </div>
          </section>

          <section className="quote-panel overflow-hidden p-0">
            <div className="p-5">
              <div className="quote-panel-header px-0 pt-0">
                <h2>Preview</h2>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold text-white" style={{ backgroundColor: form.color }}>
                    {getInitials(form.name || "Dự án")}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{form.name || "Tên dự án"}</p>
                    <p className="truncate text-xs text-muted-foreground">{form.description || "Mô tả ngắn của dự án"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <PreviewMetric icon={CircleDot} label="Trạng thái" value={statuses.find((item) => item.value === form.status)?.label} />
                  <PreviewMetric icon={Flag} label="Ưu tiên" value={priorities.find((item) => item.value === form.priority)?.label} />
                  <PreviewMetric icon={CalendarDays} label="Bắt đầu" value={form.startDate || "Chưa đặt"} />
                  <PreviewMetric icon={CheckCircle2} label="Hạn" value={form.dueDate || "Chưa đặt"} />
                  {project.socialMarketingEnabled ? <PreviewMetric icon={BarChart3} label="Report" value={[reportForm.enablePage ? "Page" : "", reportForm.enableAds ? "Ads" : ""].filter(Boolean).join(" + ") || "Chưa bật"} /> : null}
                </div>
              </div>
            </div>
            <div className="flex gap-2 border-t border-border p-5">
              <Link href={`/workspace/projects/${project.id}`} className="quote-button quote-button-soft flex-1 justify-center">Hủy</Link>
              <button type="submit" disabled={isSaving} className="quote-button quote-button-primary flex-1 justify-center disabled:opacity-60">
                <Save className="h-4 w-4" />
                {isSaving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </section>
        </aside>
      </form>
    </div>
  );
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
  value,
  search,
  selectedTitle,
  onSearchChange,
  placeholder,
  options,
  getTitle,
  getSubtitle,
  getValue,
  onSelect,
  emptyTitle,
  allowEmpty,
}: {
  value: string;
  search: string;
  selectedTitle?: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
  options: T[];
  getTitle: (option: T) => string;
  getSubtitle?: (option: T) => string;
  getValue?: (option: T) => string;
  onSelect: (id: string) => void;
  emptyTitle?: string;
  allowEmpty?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const valueOf = (option: T) => getValue?.(option) || option.id;

  return (
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
          {options.slice(0, 9).map((option) => {
            const optionValue = valueOf(option);
            return (
              <button
                key={option.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(optionValue);
                  onSearchChange(getTitle(option));
                  setOpen(false);
                }}
                className={cn("quote-combo-option", optionValue === value && "quote-combo-option-active")}
              >
                <span>{getTitle(option)}</span>
                {getSubtitle ? <small>{getSubtitle(option)}</small> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function optionMatches(text: string, query: string) {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return true;
  return text.toLowerCase().includes(keyword);
}

function contactTitle(contact: { name: string; email?: string | null }) {
  return [contact.name, contact.email].filter(Boolean).join(" - ");
}

function adAccountTitle(account: { name: string; externalId: string; currency?: string | null }) {
  return [account.name, account.externalId, account.currency].filter(Boolean).join(" - ");
}

function PreviewMetric({ icon: Icon, label, value }: { icon: ElementType; label: string; value?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-muted/60 p-3">
      <div className="mb-2 flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <p className="font-semibold text-foreground">{value}</p>
    </div>
  );
}
