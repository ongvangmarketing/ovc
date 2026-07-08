"use client";

import { useState } from "react";
import type { ElementType } from "react";
import { ArrowLeft, BarChart3, CalendarDays, CheckCircle2, CircleDot, Flag, Megaphone, Save, Search, Sparkles, ImagePlus, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { updateProject, updateProjectSocialReportSetup, uploadProjectThumbnail, generateProjectShareToken, revokeProjectShareToken } from "@/app/actions/projects";
import { Link as LinkIcon, Trash2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { getInitials } from "@/lib/utils/format";

const projectColors = ["#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EF4444", "#06B6D4", "#64748B"];

const statuses = [
  { value: "PLANNING", label: "Lên kế hoạch", dot: "bg-slate-400" },
  { value: "ACTIVE", label: "Đang chạy", dot: "bg-indigo-500" },
  { value: "ON_HOLD", label: "Tạm dừng", dot: "bg-amber-500" },
  { value: "COMPLETED", label: "Hoàn tất", dot: "bg-emerald-500" },
  { value: "CANCELLED", label: "Đã hủy", dot: "bg-red-500" },
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
  thumbnail: string | null;
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
  thumbnail?: string | null;
  shareToken?: string | null;
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
  
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [shareToken, setShareToken] = useState(project.shareToken);
  const [copiedLink, setCopiedLink] = useState(false);

  const [form, setForm] = useState<ProjectForm>({
    name: project.name || "",
    description: project.description || "",
    color: project.color || "#F59E0B",
    thumbnail: project.thumbnail || null,
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

  
  const handleGenerateShareToken = async () => {
    const res = await generateProjectShareToken(project.id);
    if (res.success && res.token) {
      setShareToken(res.token);
      toast.success("Đã tạo link chia sẻ");
    } else {
      toast.error(res.error || "Không thể tạo link chia sẻ");
    }
  };

  const handleRevokeShareToken = async () => {
    if (!confirm("Bạn có chắc chắn muốn vô hiệu hóa link này? Khách hàng sẽ không thể truy cập được nữa.")) return;
    const res = await revokeProjectShareToken(project.id);
    if (res.success) {
      setShareToken(null);
      toast.success("Đã thu hồi link chia sẻ");
    } else {
      toast.error(res.error || "Không thể thu hồi link chia sẻ");
    }
  };

  const copyShareLink = () => {
    if (!shareToken) return;
    const url = `${window.location.origin}/share/p/${shareToken}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success("Đã copy link");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    setIsSaving(true);
    
    try {
      let thumbnailUrl = form.thumbnail;
      if (thumbnailFile) {
        const fileFormData = new FormData();
        fileFormData.append("file", thumbnailFile);
        thumbnailUrl = await uploadProjectThumbnail(fileFormData.get("file")) || form.thumbnail;
      }

      const res = await updateProject(project.id, { ...form, thumbnail: thumbnailUrl });
      const reportRes: { success: boolean; error?: string } = res.success && project.socialMarketingEnabled
        ? await updateProjectSocialReportSetup(project.id, reportForm)
        : { success: true };
        
      if (res.success && reportRes.success) {
        toast.success("Đã cập nhật dự án");
        router.refresh();
        window.location.assign(`/workspace/projects/${project.id}?saved=${Date.now()}`);
      } else {
        toast.error(res.error || reportRes.error || "Không lưu được dự án");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setIsSaving(false);
    }
  };

  const activeStatus = statuses.find(s => s.value === form.status);

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-[#eaeaea]">
        <div className="max-w-[1440px] mx-auto w-full flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            
          <Link href={`/workspace/projects/${project.id}`} className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#eaeaea] bg-white text-gray-400 transition-colors hover:text-black hover:bg-gray-50" aria-label="Quay lại">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-gray-500">
              PROJECT SETTINGS
            </div>
            <h2 className="mt-1 text-[24px] font-medium tracking-tight text-black">Sửa dự án</h2>
            <p className="mt-0.5 text-[14px] text-gray-500 font-medium">Cập nhật thông tin, trạng thái và thiết lập báo cáo.</p>
          </div>
        
          </div>
          <div className="flex items-center gap-3 mt-1">
            <Link href={`/workspace/projects/${project.id}`} className="rounded-md border border-[#eaeaea] bg-white px-5 py-2.5 text-[14px] font-medium text-black transition-colors hover:bg-gray-50">Hủy</Link>
            <button type="submit" form="edit-project-form" disabled={isSaving} className="rounded-md bg-black px-5 py-2.5 flex items-center justify-center gap-2 text-[14px] font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-60">
              <Save className="h-4 w-4" />
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-6 py-8">
        <form id="edit-project-form" onSubmit={handleSubmit} className="mx-auto max-w-6xl grid gap-8 xl:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <section className="rounded-xl border border-[#eaeaea] bg-white p-8">
              <h2 className="text-[18px] font-medium text-black tracking-tight mb-6">Thông tin chính</h2>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Tên dự án" className="md:col-span-2">
                  <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-[14px] border-none bg-slate-100/70 px-4 py-3 text-[15px] font-medium text-slate-900 outline-none transition-all focus:bg-slate-100 focus:ring-2 focus:ring-indigo-500/20" />
                </Field>
                <Field label="Trạng thái">
                  <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ProjectForm["status"] })} className="w-full rounded-[14px] border-none bg-slate-100/70 px-4 py-3 text-[15px] font-medium text-slate-900 outline-none transition-all focus:bg-slate-100 focus:ring-2 focus:ring-indigo-500/20">
                    {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </Field>
                <Field label="Ưu tiên">
                  <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as ProjectForm["priority"] })} className="w-full rounded-[14px] border-none bg-slate-100/70 px-4 py-3 text-[15px] font-medium text-slate-900 outline-none transition-all focus:bg-slate-100 focus:ring-2 focus:ring-indigo-500/20">
                    {priorities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </Field>
                <Field label="Ngày bắt đầu">
                  <input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} className="w-full rounded-[14px] border-none bg-slate-100/70 px-4 py-3 text-[15px] font-medium text-slate-900 outline-none transition-all focus:bg-slate-100 focus:ring-2 focus:ring-indigo-500/20" />
                </Field>
                <Field label="Hạn hoàn thành">
                  <input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className="w-full rounded-[14px] border-none bg-slate-100/70 px-4 py-3 text-[15px] font-medium text-slate-900 outline-none transition-all focus:bg-slate-100 focus:ring-2 focus:ring-indigo-500/20" />
                </Field>
                <Field label="Ngân sách" className="md:col-span-2">
                  <input type="number" min={0} value={form.budget} onChange={(event) => setForm({ ...form, budget: event.target.value })} className="w-full rounded-[14px] border-none bg-slate-100/70 px-4 py-3 text-[15px] font-medium text-slate-900 outline-none transition-all focus:bg-slate-100 focus:ring-2 focus:ring-indigo-500/20" placeholder="VD: 50000000" />
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
                <Field label="Mô tả / Brief" className="md:col-span-2">
                  <TiptapEditor value={form.description} onChange={(content) => setForm({ ...form, description: content })} placeholder="Mục tiêu, phạm vi, đầu việc chính..." />
                </Field>
              </div>
            </section>

            
            

            {project.socialMarketingEnabled ? (
              <section className="rounded-xl border border-[#eaeaea] bg-white p-8">
                <div className="mb-6 flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#eaeaea] bg-white text-gray-500">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-medium text-black tracking-tight">Nguồn báo cáo Social</h2>
                    <p className="mt-0.5 text-[13px] font-medium text-slate-500">Tick nguồn nào thì portal khách sẽ thấy report nguồn đó.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[16px] border border-slate-100 bg-slate-50/50 p-4">
                    <label className="flex items-start gap-3 cursor-pointer mb-1">
                      <input
                        type="checkbox"
                        checked={reportForm.enablePage}
                        onChange={(event) => setReportForm({ ...reportForm, enablePage: event.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>
                        <span className="block text-[14px] font-semibold text-slate-900">Facebook Page</span>
                        <span className="block text-[13px] text-slate-500 font-medium">Hiện reach, impression, engagement và bài đăng Page.</span>
                      </span>
                    </label>
                    {reportForm.enablePage ? (
                      <div className="mt-4 space-y-4 pl-7">
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
                          <textarea value={reportForm.pageAccessToken} onChange={(event) => setReportForm({ ...reportForm, pageAccessToken: event.target.value })} className="w-full min-h-[90px] resize-y rounded-[12px] border-none bg-white shadow-sm px-4 py-3 text-[13px] font-medium text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Dán Page Access Token..." />
                        </Field>
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-[16px] border border-slate-100 bg-slate-50/50 p-4">
                    <label className="flex items-start gap-3 cursor-pointer mb-1">
                      <input
                        type="checkbox"
                        checked={reportForm.enableAds}
                        onChange={(event) => setReportForm({ ...reportForm, enableAds: event.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>
                        <span className="block text-[14px] font-semibold text-slate-900">Facebook Ads</span>
                        <span className="block text-[13px] text-slate-500 font-medium">Hiện campaign, ads, spend, reach, lead theo ID đã gắn.</span>
                      </span>
                    </label>
                    {reportForm.enableAds ? (
                      <div className="mt-4 space-y-4 pl-7">
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
                          <textarea value={reportForm.adsAccessToken} onChange={(event) => setReportForm({ ...reportForm, adsAccessToken: event.target.value })} className="w-full min-h-[90px] resize-y rounded-[12px] border-none bg-white shadow-sm px-4 py-3 text-[13px] font-medium text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Dán token có quyền Ads..." />
                        </Field>
                        <Field label="Campaign ID">
                          <textarea value={reportForm.campaignIdsText} onChange={(event) => setReportForm({ ...reportForm, campaignIdsText: event.target.value })} className="w-full min-h-[90px] resize-y rounded-[12px] border-none bg-white shadow-sm px-4 py-3 text-[13px] font-medium text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Mỗi dòng một Campaign ID" />
                        </Field>
                        <Field label="Ads ID">
                          <textarea value={reportForm.adIdsText} onChange={(event) => setReportForm({ ...reportForm, adIdsText: event.target.value })} className="w-full min-h-[90px] resize-y rounded-[12px] border-none bg-white shadow-sm px-4 py-3 text-[13px] font-medium text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Mỗi dòng một Ads ID" />
                        </Field>
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            ) : null}
          </div>

          <div className="space-y-8">
            <section className="rounded-xl border border-[#eaeaea] bg-white p-8">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.portalVisible}
                  disabled={!form.contactId}
                  onChange={(event) => setForm({ ...form, portalVisible: event.target.checked })}
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-40 transition-all"
                />
                <span>
                  <span className="block text-[15px] font-semibold text-slate-900">Hiện trên Portal Khách hàng</span>
                  <span className="block mt-1 text-[13px] text-slate-500 font-medium">Khách hàng sẽ nhìn thấy dự án, công việc và báo cáo liên quan.</span>
                </span>
              </label>
            </section>


            <section className="rounded-xl border border-[#eaeaea] bg-white p-8">
              <div className="mb-6">
                <h3 className="text-[18px] font-medium text-black tracking-tight">Link chia sẻ bí mật</h3>
                <p className="mt-1 text-[13px] text-gray-500 font-medium">Khách hàng không cần tài khoản cũng có thể xem tiến độ dự án qua link này.</p>
              </div>
              
              {!shareToken ? (
                <button
                  type="button"
                  onClick={handleGenerateShareToken}
                  className="w-full flex items-center justify-center gap-2 rounded-md border border-[#eaeaea] bg-white px-4 py-3 text-[14px] font-medium text-black transition-colors hover:bg-gray-50"
                >
                  <LinkIcon className="h-4 w-4" /> Tạo link chia sẻ
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-md bg-gray-50 p-2 border border-[#eaeaea]">
                    <div className="flex-1 truncate pl-2 text-[13px] font-medium text-gray-600">
                      .../share/p/{shareToken.substring(0, 8)}...
                    </div>
                    <button
                      type="button"
                      onClick={copyShareLink}
                      className="flex shrink-0 items-center justify-center h-8 w-8 rounded-md bg-white text-gray-500 border border-[#eaeaea] transition-colors hover:text-black hover:bg-gray-50"
                      title="Copy link"
                    >
                      {copiedLink ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleRevokeShareToken}
                    className="w-full flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-[13px] font-medium text-red-600 border border-red-200 bg-red-50 transition-all hover:bg-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Thu hồi link
                  </button>
                </div>
              )}
            </section>


            
            <section className="rounded-xl border border-[#eaeaea] bg-white p-8">
              <div className="mb-6">
                <h3 className="text-[18px] font-medium text-black tracking-tight">Nhận diện & Màu sắc</h3>
              </div>
              
              <div className="mb-6">
                <span className="mb-2.5 block text-[13px] font-medium text-gray-500 uppercase tracking-widest">Màu chủ đạo</span>
                <div className="flex flex-wrap gap-2.5">
                  {projectColors.map((color) => (
                    <button key={color} type="button" onClick={() => setForm({ ...form, color })} className={cn("h-9 w-9 rounded-md transition-transform", form.color === color ? "scale-110 ring-2 ring-offset-2 ring-black" : "hover:scale-110 border border-[#eaeaea]")} style={{ backgroundColor: color }} aria-label={color} />
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-2.5 block text-[13px] font-medium text-gray-500 uppercase tracking-widest">Ảnh Thumbnail</span>
                <label className="flex h-[180px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-[#eaeaea] bg-white transition-all hover:bg-gray-50 group relative overflow-hidden">
                  {thumbnailFile ? (
                    <>
                      <Image src={URL.createObjectURL(thumbnailFile)} alt="Preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-[13px] font-medium">Đổi ảnh khác</span>
                      </div>
                    </>
                  ) : form.thumbnail ? (
                    <>
                      <Image src={form.thumbnail} alt="Preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-[13px] font-medium">Đổi ảnh khác</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="mb-3 h-8 w-8 text-gray-400 group-hover:text-black transition-colors" />
                      <span className="text-[14px] font-medium text-black">Tải ảnh lên (Tùy chọn)</span>
                      <span className="text-[12px] font-medium text-gray-400 mt-1">Tỷ lệ 2:1, JPG, PNG, WEBP</span>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setThumbnailFile(file);
                    }}
                  />
                </label>
                {(form.thumbnail || thumbnailFile) && (
                  <button type="button" onClick={() => { setForm({...form, thumbnail: null}); setThumbnailFile(null); }} className="text-[13px] font-medium text-red-600 hover:text-red-700 mt-2 flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> Gỡ ảnh
                  </button>
                )}
              </div>
            </section>

            <section className="rounded-[24px] bg-white shadow-[0_2px_20px_rgba(0,0,0,0.03)] overflow-hidden">
              
            </section>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-[13.5px] font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

import { ComboSelectModal as ComboSelect } from "@/components/ui/combo-select-modal";

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
    <div className="rounded-[12px] bg-slate-50/80 p-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[12px] font-semibold tracking-tight">{label}</span>
      </div>
      <div className="font-semibold text-[13px] text-slate-900">{value}</div>
    </div>
  );
}
