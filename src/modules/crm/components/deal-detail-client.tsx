// @ts-nocheck
"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { addOptionToDeal, removeDealOption, convertDealOptionsToQuotation, updateDealOption } from "@/modules/crm/actions/deal-services.actions";
import { reorderDealOptionsAction } from "@/modules/crm/actions/deals.actions";
import { 
  Plus, CheckCircle2, Trash2,
  FileText, Edit3, Ellipsis, Eye, Target, Share2, Copy, Save, X, ChevronUp, ChevronDown, Search
} from "lucide-react";

import { ActivityTimeline, AttachmentList, type FinanceActivity } from "@/modules/finance/components/finance-detail-widgets";

const detailTabs = [
  { id: "info", label: "Thông tin cơ hội" },
  { id: "activity", label: "Lịch sử hoạt động" },
  { id: "files", label: "Tệp đính kèm" },
];

function formatMoney(value: unknown, currency = "VND") {
  const parsed = Number(value ?? 0);
  const num = Number.isFinite(parsed) ? parsed : 0;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDate(value?: string | Date | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  }).format(date);
}

function formatDateTime(value?: string | Date | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(date);
}

function dealOptionLineTotal(option: Pick<DealServiceOption, "unitPrice" | "quantity" | "discount">) {
  const unitPrice = Number(option.unitPrice || 0);
  const quantity = Number(option.quantity || 1);
  const discount = Number(option.discount || 0);
  return Math.max(0, unitPrice * quantity - discount);
}

function parseDealOptionNote(note?: string | null) {
  if (!note) {
    return { note: "" };
  }
  try {
    const parsed = JSON.parse(note);
    if (parsed && parsed.__dealOptionOverrides === true) {
      return {
        name: String(parsed.name || ""),
        description: String(parsed.description || ""),
        unit: String(parsed.unit || ""),
        durationText: String(parsed.durationText || ""),
        featuresText: String(parsed.featuresText || ""),
        note: String(parsed.note || ""),
      };
    }
  } catch {
    // Existing plain notes stay usable.
  }
  return { note };
}

function buildDealOptionNote(overrides: {
  name?: string;
  description?: string;
  unit?: string;
  durationText?: string;
  featuresText?: string;
  note?: string;
}) {
  const hasOverrides = Boolean(
    overrides.name?.trim() ||
    overrides.description?.trim() ||
    overrides.unit?.trim() ||
    overrides.durationText?.trim() ||
    overrides.featuresText?.trim()
  );

  if (!hasOverrides) {
    return overrides.note || "";
  }

  return JSON.stringify({
    __dealOptionOverrides: true,
    name: overrides.name || "",
    description: overrides.description || "",
    unit: overrides.unit || "",
    durationText: overrides.durationText || "",
    featuresText: overrides.featuresText || "",
    note: overrides.note || "",
  });
}

type ServiceOptionValue = string[] | Record<string, unknown> | string | null | undefined;

type CrmServiceOption = {
  id: string;
  name?: string | null;
  price?: number | string | null;
  description?: string | null;
  unit?: string | null;
  durationText?: string | null;
  featuresJson?: ServiceOptionValue;
  service?: { name?: string | null } | null;
};

type CrmService = {
  id: string;
  name: string;
  options: CrmServiceOption[];
};

type DealServiceOption = {
  id: string;
  serviceOptionId?: string | null;
  name?: string | null;
  quantity?: number | string | null;
  unitPrice?: number | string | null;
  discount?: number | string | null;
  taxRate?: number | string | null;
  note?: string | null;
  status?: string | null;
  serviceOption?: CrmServiceOption | null;
};

type DealDetail = {
  id: string;
  serviceOptions: DealServiceOption[];
  [key: string]: unknown;
};

type DealStage = {
  id: string;
  name: string;
  order?: number | null;
};

function getDealOptionView(dealOpt: DealServiceOption) {
  const overrides = parseDealOptionNote(dealOpt.note);
  const serviceOption = dealOpt.serviceOption || {};
  const serviceFeatures = Array.isArray(serviceOption.featuresJson)
    ? serviceOption.featuresJson.join("\n")
    : typeof serviceOption.featuresJson === "string"
      ? serviceOption.featuresJson
      : serviceOption.featuresJson
        ? Object.values(serviceOption.featuresJson).join("\n")
        : "";

  return {
    name: overrides.name || serviceOption.name || dealOpt.name || "",
    description: overrides.description || serviceOption.description || "",
    unit: overrides.unit || serviceOption.unit || "Gói",
    durationText: overrides.durationText || serviceOption.durationText || "Theo thỏa thuận",
    featuresText: overrides.featuresText || serviceFeatures,
    note: overrides.note || "",
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function optionDetailHtml(view: ReturnType<typeof getDealOptionView>) {
  if (view.note) return view.note;

  const parts: string[] = [];
  if (view.description) parts.push(`<p>${escapeHtml(view.description)}</p>`);
  if (view.unit) parts.push(`<p><strong>Đơn vị:</strong> ${escapeHtml(view.unit)}</p>`);
  if (view.durationText) parts.push(`<p><strong>Thời lượng:</strong> ${escapeHtml(view.durationText)}</p>`);

  const features = view.featuresText
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (features.length) {
    parts.push(`<p><strong>Hạng mục / quyền lợi:</strong></p><ul>${features.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`);
  }

  return parts.join("");
}

export function DealDetailClient({ deal, availableServices, stages }: { deal: DealDetail, availableServices: CrmService[], stages: DealStage[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("info");
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [servicePickerOpen, setServicePickerOpen] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [selectedOptionsForQuote, setSelectedOptionsForQuote] = useState<string[]>([]);
  
  // Inline edit states
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    unit: "",
    durationText: "",
    featuresText: "",
    unitPrice: 0,
    quantity: 1,
    discount: 0,
    taxRate: 0,
    note: ""
  });

  const handleAddOption = async (optionId: string) => {
    setLoading(true);
    await addOptionToDeal(deal.id, optionId, 1);
    setLoading(false);
  };

  const handleRemoveOption = async (dealOptionId: string) => {
    if (confirm("Xóa option này khỏi deal?")) {
      await removeDealOption(dealOptionId);
      setSelectedOptionsForQuote(prev => prev.filter(id => id !== dealOptionId));
    }
  };

  const handleStartEdit = (dealOpt: DealServiceOption) => {
    const view = getDealOptionView(dealOpt);
    setEditingOptionId(dealOpt.id);
    setEditForm({
      name: view.name,
      description: view.description,
      unit: view.unit,
      durationText: view.durationText,
      featuresText: view.featuresText,
      unitPrice: Number(dealOpt.unitPrice) || 0,
      quantity: dealOpt.quantity || 1,
      discount: Number(dealOpt.discount) || 0,
      taxRate: Number(dealOpt.taxRate) || 0,
      note: optionDetailHtml(view)
    });
  };

  const handleSaveEdit = async () => {
    if (!editingOptionId) return;
    setLoading(true);
    await updateDealOption(editingOptionId, {
      unitPrice: editForm.unitPrice,
      quantity: editForm.quantity,
      discount: editForm.discount,
      taxRate: editForm.taxRate,
      note: buildDealOptionNote({
        ...editForm,
        description: "",
        featuresText: "",
      })
    });
    setEditingOptionId(null);
    setLoading(false);
  };

  const handleCancelEdit = () => {
    setEditingOptionId(null);
  };

  const handleMoveOption = async (index: number, direction: number) => {
    if (index + direction < 0 || index + direction >= deal.serviceOptions.length) return;
    setLoading(true);
    const newOptions = [...deal.serviceOptions];
    const temp = newOptions[index];
    newOptions[index] = newOptions[index + direction];
    newOptions[index + direction] = temp;
    await reorderDealOptionsAction(deal.id, newOptions.map((o) => o.id));
    router.refresh();
    setLoading(false);
  };

  const handleConvertToQuote = async () => {
    if (selectedOptionsForQuote.length === 0) {
      alert("Vui lòng chọn ít nhất 1 option để tạo báo giá!");
      return;
    }
    if (!window.confirm("Tạo báo giá từ các Option đã chọn? Bạn vẫn có thể chỉnh sửa báo giá sau khi tạo.")) {
      return;
    }
    setConverting(true);
    const res = await convertDealOptionsToQuotation(deal.id, selectedOptionsForQuote);
    setConverting(false);

    if (res.error) {
      alert(res.error);
    } else if (res.success && res.quotationId) {
      alert("Tạo báo giá thành công!");
      router.push(`/workspace/finance/quotations/${res.quotationId}/edit`);
    }
  };

  const existingOptionIds = new Set(deal.serviceOptions?.map((option) => option.serviceOptionId).filter(Boolean));
  const serviceKeyword = serviceSearch.trim().toLowerCase();
  const filteredServices = availableServices
    .map((service) => ({
      ...service,
      options: service.options.filter((option) =>
        !existingOptionIds.has(option.id) &&
        (!serviceKeyword || `${service.name} ${option.name || ""}`.toLowerCase().includes(serviceKeyword))
      ),
    }))
    .filter((service) => service.options.length > 0);
  const publicUrl = `/shared/deals/${deal.id}/options`;
  const fullPublicUrl = typeof window !== "undefined" ? `${window.location.origin}${publicUrl}` : "";

  const copyLink = async () => {
    if (!fullPublicUrl) return;
    await navigator.clipboard.writeText(fullPublicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const steps = useMemo(() => {
    if (!stages || stages.length === 0) return [];
    
    // Find the index of the current stage
    const currentIndex = stages.findIndex(s => s.id === deal.stageId);
    
    return stages.map((stage, index) => ({
      label: stage.name,
      done: index <= currentIndex,
    }));
  }, [stages, deal.stageId]);

  const fallbackActivities = useMemo(() => [
    { action: "created", description: `Tạo cơ hội ${deal.title}`, createdAt: deal.createdAt },
  ] as FinanceActivity[], [deal.title, deal.createdAt]);

  const customerName = deal.company?.name || deal.contact?.name || `${deal.contact?.firstName || ""} ${deal.contact?.lastName || ""}`.trim() || 'Chưa xác định';

  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-8">
      <header className="flex flex-col items-start justify-between gap-6 border-b border-[#eaeaea] pb-6 lg:flex-row lg:items-end mb-8">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase w-fit">
              CRM Deal Detail
            </span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start mb-4">
            <h1 className="text-[32px] md:text-[44px] tracking-tight leading-[1.15] font-medium uppercase line-clamp-2">{deal.title}</h1>
            <span className="inline-flex w-fit rounded-full border border-[#eaeaea] bg-gray-50 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-gray-600 mt-2 sm:mt-0">
              {deal.stage?.name || deal.status}
            </span>
          </div>
          <p className="text-[14px] text-gray-500 font-light">
            Ngày tạo: {formatDate(deal.createdAt)} <span className="mx-2 text-gray-300">|</span> Cập nhật cuối: {formatDate(deal.updatedAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a href={publicUrl} target="_blank" className="flex items-center justify-center gap-2 px-4 h-9 bg-white border border-[#eaeaea] text-[13px] font-medium text-black rounded-md hover:bg-gray-50 transition-colors">
            <Eye className="h-4 w-4" />
            Xem
          </a>
          <Link href={`/workspace/crm/deals/${deal.id}/edit`} className="flex items-center justify-center gap-2 px-4 h-9 bg-white border border-[#eaeaea] text-[13px] font-medium text-black rounded-md hover:bg-gray-50 transition-colors">
            <Edit3 className="h-4 w-4" />
            Sửa
          </Link>
          <div className="relative">
            <button type="button" onClick={() => setMenuOpen((current) => !current)} className="flex items-center justify-center w-9 h-9 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
              <Ellipsis className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-[#eaeaea] bg-white p-1 shadow-xl shadow-black/5">
                <button type="button" onClick={copyLink} className="flex w-full items-center gap-3 px-3 py-2 text-left text-[14px] text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors">
                  <Copy className="h-4 w-4" />
                  {copied ? "Đã copy" : "Copy link"}
                </button>
                <button type="button" className="flex w-full items-center gap-3 px-3 py-2 text-left text-[14px] text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4" />
                  Xóa cơ hội
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-3 mb-10">
        <div className="rounded-2xl border border-[#eaeaea] bg-white p-5">
          <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400">Khách hàng / Doanh nghiệp</span>
          <strong className="mt-4 block truncate text-[22px] font-medium tracking-tight text-black">{customerName}</strong>
          <p className="mt-2 text-[13px] text-gray-500">{deal.company?.industry || deal.contact?.jobTitle || "Khách cá nhân"}</p>
        </div>
        <div className="rounded-2xl border border-[#eaeaea] bg-white p-5">
          <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400">Cơ hội bán hàng</span>
          <strong className="mt-4 block truncate text-[22px] font-medium tracking-tight text-black">{deal.title}</strong>
          <p className="mt-2 text-[13px] text-gray-500">Giai đoạn: {deal.stage?.name || deal.status}</p>
        </div>
        <div className="rounded-2xl border border-[#eaeaea] bg-white p-5">
          <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400">Giá trị dự kiến</span>
          <strong className="mt-4 block text-[28px] font-medium leading-none tracking-tight text-black">{formatMoney(deal.value, deal.currency)}</strong>
          <p className="mt-2 text-[13px] text-gray-500">Tỷ lệ thắng: {deal.probability || 50}%</p>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="min-w-0 space-y-5">
          <nav className="inline-flex rounded-lg border border-[#eaeaea] bg-gray-50/50 p-1">
            {detailTabs.map((tab) => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={activeTab === tab.id ? "rounded-md bg-white px-4 py-1.5 text-[13px] font-medium text-black shadow-sm" : "rounded-md px-4 py-1.5 text-[13px] font-medium text-gray-500 hover:text-black"}>
                {tab.label}
              </button>
            ))}
          </nav>

          {activeTab === "info" ? (
            <>
              <section className="rounded-2xl border border-[#eaeaea] bg-white p-6">
                <div className="border-b border-[#eaeaea] pb-4">
                  <h2 className="text-[24px] font-medium tracking-tight text-black">Quy trình Sales Pipeline</h2>
                  <span className="mt-1 block text-[14px] text-gray-500">Tiến độ thực hiện của cơ hội kinh doanh.</span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {steps.map((step) => (
                    <div key={step.label} className={step.done ? "rounded-xl border border-[#f5d76e] bg-gradient-to-br from-[#fff3bf] via-[#fff8df] to-white p-4 text-black" : "rounded-xl border border-[#eaeaea] bg-white p-4 text-gray-500"}>
                      <span className={step.done ? "flex h-7 w-7 items-center justify-center rounded-full border border-[#f5d76e] bg-white text-black" : "flex h-7 w-7 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-gray-400"}>✓</span>
                      <p className="mt-3 text-[13px] font-medium">{step.label}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-[#eaeaea] bg-white p-6">
                <div className="mb-5 flex flex-col justify-between gap-4 border-b border-[#eaeaea] pb-4 lg:flex-row lg:items-center">
                  <div>
                    <h2 className="text-[24px] font-medium tracking-tight text-black">Dịch vụ đề xuất</h2>
                    <span className="mt-1 block text-[14px] text-gray-500">Danh sách các dịch vụ đang được đề xuất cho khách hàng.</span>
                  </div>
                  <button type="button" onClick={() => setServicePickerOpen((open) => !open)} className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#eaeaea] bg-white px-4 text-[13px] font-medium text-black transition-colors hover:bg-gray-50">
                    {servicePickerOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {servicePickerOpen ? "Đóng" : "Chọn dịch vụ"}
                  </button>
                </div>

                {servicePickerOpen ? (
                  <div className="mb-4 border-b border-[#eaeaea] bg-gray-50/50 p-5">
                    <div className="relative mb-4">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        value={serviceSearch}
                        onChange={(event) => setServiceSearch(event.target.value)}
                        className="h-9 w-full rounded-md border border-[#eaeaea] bg-white pl-9 pr-4 text-[13px] outline-none focus:border-black focus:ring-1 focus:ring-black"
                        placeholder="Tìm gói hoặc option dịch vụ..."
                      />
                    </div>
                    <div className="space-y-3">
                      {filteredServices.map((service) => (
                        <div key={service.id} className="rounded-2xl border border-[#eaeaea] bg-white p-4">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <h3 className="text-[15px] font-medium text-black">{service.name}</h3>
                            <span className="shrink-0 rounded-full border border-[#eaeaea] bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-500">{service.options.length} option</span>
                          </div>
                          <div className="grid gap-2 md:grid-cols-3">
                            {service.options.map((opt) => {
                              return (
                                <div key={opt.id} className="rounded-xl border border-[#eaeaea] bg-white p-3.5 transition-colors hover:border-black">
                                  <div className="space-y-3">
                                    <div className="min-w-0">
                                      <div className="text-[14px] font-medium leading-5 text-black">{opt.name}</div>
                                      <div className="mt-1 text-[12px] font-medium uppercase tracking-widest text-gray-400">{service.name}</div>
                                    </div>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                      <div className="text-[15px] font-medium tabular-nums text-black">{formatMoney(opt.price)}</div>
                                      <button
                                        type="button"
                                        onClick={() => handleAddOption(opt.id)}
                                        disabled={loading}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-black text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                                        aria-label={`Thêm ${opt.name || "dịch vụ"}`}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      {filteredServices.length === 0 ? (
                        <div className="text-[13px] text-gray-500">Không còn dịch vụ phù hợp để thêm.</div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div className="quotation-items-list mt-2">
                  {deal.serviceOptions?.length ? (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-[#eaeaea] bg-white">
                      <div className="overflow-x-auto w-full">
                        <table className="w-full text-sm text-left border-collapse">
                          <thead className="border-b border-[#eaeaea] bg-gray-50/50 text-gray-400">
                            <tr>
                              <th className="w-16 border-r border-[#eaeaea] px-4 py-3 text-center text-[11px] font-medium uppercase tracking-widest">
                                <input 
                                  type="checkbox" 
                                  className="h-4 w-4 cursor-pointer rounded border-[#eaeaea] accent-black"
                                  title="Chọn tất cả để tạo báo giá"
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedOptionsForQuote(deal.serviceOptions.map((o) => o.id));
                                    else setSelectedOptionsForQuote([]);
                                  }}
                                  checked={selectedOptionsForQuote.length > 0 && selectedOptionsForQuote.length === deal.serviceOptions.length}
                                />
                              </th>
                              <th className="min-w-[320px] border-r border-[#eaeaea] px-4 py-3 text-[11px] font-medium uppercase tracking-widest">Nội dung dịch vụ</th>
                              <th className="w-40 border-r border-[#eaeaea] px-4 py-3 text-center text-[11px] font-medium uppercase tracking-widest">Giá</th>
                              <th className="w-28 px-4 py-3 text-center text-[11px] font-medium uppercase tracking-widest">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#eaeaea]">
                            {deal.serviceOptions.map((dealOpt, index: number) => {
                              const isSelected = selectedOptionsForQuote.includes(dealOpt.id);
                              const isConverted = dealOpt.status === 'CONVERTED_TO_QUOTE';
                              const isEditing = editingOptionId === dealOpt.id;
                              const optionView = getDealOptionView(dealOpt);
                              const detailHtml = optionDetailHtml(optionView);
                              const lineTotal = dealOptionLineTotal(dealOpt);

                              if (isEditing) {
                                const editLineTotal = Math.max(0, (Number(editForm.unitPrice) * Number(editForm.quantity || 1)) - Number(editForm.discount || 0));
                                return (
                                  <tr key={dealOpt.id} className="bg-gray-50/50">
                                    <td colSpan={4} className="p-4">
                                      <div className="space-y-4 rounded-2xl border border-[#eaeaea] bg-white p-4">
                                        <div>
                                          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-gray-400">Tên SP/Dịch vụ</label>
                                          <input className="w-full rounded-md border border-[#eaeaea] bg-gray-50/50 px-3 py-2 text-[15px] font-medium text-black outline-none focus:border-black focus:ring-1 focus:ring-black" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                                        </div>

                                        <div className="space-y-2">
                                          <div className="text-[11px] font-medium uppercase tracking-widest text-gray-400">Nội dung chi tiết của gói</div>
                                          <TiptapEditor placeholder="Nhập mô tả chi tiết, phạm vi công việc, ghi chú riêng..." value={editForm.note} onChange={content => setEditForm({...editForm, note: content})} />
                                        </div>

                                        <div className="grid gap-3 md:grid-cols-[120px_1fr_1fr_1fr]">
                                          <label className="block">
                                            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-gray-400">Số lượng</span>
                                            <input type="number" min="1" className="w-full rounded-md border border-[#eaeaea] px-2 py-2 text-center text-sm outline-none focus:border-black focus:ring-1 focus:ring-black" value={editForm.quantity} onChange={e => setEditForm({...editForm, quantity: Number(e.target.value)})} />
                                          </label>
                                          <label className="block">
                                            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-gray-400">Đơn giá</span>
                                            <input type="number" min="0" className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-right text-sm outline-none focus:border-black focus:ring-1 focus:ring-black" value={editForm.unitPrice} onChange={e => setEditForm({...editForm, unitPrice: Number(e.target.value)})} />
                                          </label>
                                          <label className="block">
                                            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-gray-400">Chiết khấu</span>
                                            <input type="number" min="0" className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-right text-sm outline-none focus:border-black focus:ring-1 focus:ring-black" value={editForm.discount} onChange={e => setEditForm({...editForm, discount: Number(e.target.value)})} />
                                          </label>
                                          <div>
                                            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-gray-400">Thành tiền</span>
                                            <div className="rounded-md border border-transparent bg-gray-50 px-3 py-2 text-right text-sm font-medium text-black">
                                              {formatMoney(editLineTotal)}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex justify-end gap-2 border-t border-[#eaeaea] pt-2">
                                          <button onClick={handleCancelEdit} disabled={loading} className="flex items-center gap-1.5 rounded-md border border-[#eaeaea] px-4 h-9 text-[13px] font-medium text-black transition-colors hover:bg-gray-50">
                                            <X className="w-4 h-4" /> Hủy
                                          </button>
                                          <button onClick={handleSaveEdit} disabled={loading} className="flex items-center gap-1.5 rounded-md bg-black px-4 h-9 text-[13px] font-medium text-white transition-colors hover:bg-gray-800">
                                            <Save className="w-4 h-4" /> {loading ? "Đang lưu..." : "Lưu thay đổi"}
                                          </button>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              }

                              return (
                                <Fragment key={dealOpt.id}>
                                <tr className={`${isSelected ? 'bg-gray-50/60 text-black' : 'bg-white text-gray-700'} group transition-colors hover:bg-gray-50`}>
                                  <td className="border-r border-[#eaeaea] px-4 py-5 text-center align-top">
                                    <input 
                                      type="checkbox" 
                                      className="mt-1 h-5 w-5 cursor-pointer rounded border-[#eaeaea] accent-black disabled:opacity-50"
                                      checked={isSelected}
                                      disabled={isConverted}
                                      onChange={(e) => {
                                        if (e.target.checked) setSelectedOptionsForQuote([...selectedOptionsForQuote, dealOpt.id]);
                                        else setSelectedOptionsForQuote(selectedOptionsForQuote.filter(id => id !== dealOpt.id));
                                      }}
                                    />
                                  </td>
                                  <td className="border-r border-[#eaeaea] px-4 py-5 align-top">
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="font-medium uppercase text-black">
                                        {optionView.name}
                                      </div>
                                      <div className="shrink-0 ml-2">
                                        {dealOpt.status === 'CUSTOMER_SELECTED' && <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-700"><CheckCircle2 className="w-3 h-3" /> Đã chọn</span>}
                                        {dealOpt.status === 'CONVERTED_TO_QUOTE' && <span className="rounded-full border border-[#eaeaea] bg-white px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500">Đã lên Báo giá</span>}
                                        {dealOpt.status === 'PROPOSED' && <span className="rounded-full border border-[#eaeaea] bg-gray-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-600">Đang đề xuất</span>}
                                      </div>
                                    </div>
                                    <div className="mb-1 text-[12px] font-medium uppercase tracking-wide text-gray-400">{dealOpt.serviceOption.service?.name}</div>
                                    {detailHtml ? (
                                      <div className="mt-2 text-sm leading-6 text-gray-600 [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-1" dangerouslySetInnerHTML={{ __html: detailHtml }} />
                                    ) : null}
                                  </td>
                                  <td className="border-r border-[#eaeaea] px-4 py-5 text-right align-top">
                                    <span className="text-[14px] font-medium tabular-nums text-black">
                                      {formatMoney(lineTotal)}
                                    </span>
                                    {Number(dealOpt.quantity || 1) > 1 || Number(dealOpt.discount || 0) > 0 ? (
                                      <span className="mt-1 block text-[11px] leading-4 text-gray-400">
                                        {Number(dealOpt.quantity || 1) > 1 ? `${dealOpt.quantity} x ${formatMoney(dealOpt.unitPrice || 0)}` : null}
                                        {Number(dealOpt.quantity || 1) > 1 && Number(dealOpt.discount || 0) > 0 ? " · " : null}
                                        {Number(dealOpt.discount || 0) > 0 ? `Giảm ${formatMoney(dealOpt.discount)}` : null}
                                      </span>
                                    ) : null}
                                  </td>
                                  <td className="px-4 py-5 align-top text-center">
                                    {!isConverted && (
                                      <div className="mx-auto grid w-[60px] grid-cols-2 gap-1">
                                        <button onClick={() => handleMoveOption(index, -1)} disabled={index === 0 || loading} className="flex items-center justify-center rounded border border-[#eaeaea] bg-white p-1 text-gray-400 hover:text-black disabled:opacity-30" title="Lên trên">
                                          <ChevronUp className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleMoveOption(index, 1)} disabled={index === deal.serviceOptions.length - 1 || loading} className="flex items-center justify-center rounded border border-[#eaeaea] bg-white p-1 text-gray-400 hover:text-black disabled:opacity-30" title="Xuống dưới">
                                          <ChevronDown className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleStartEdit(dealOpt)} disabled={loading} className="flex items-center justify-center rounded border border-[#eaeaea] bg-white p-1 text-gray-400 hover:text-black" title="Chỉnh sửa">
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleRemoveOption(dealOpt.id)} disabled={loading} className="flex items-center justify-center rounded border border-[#eaeaea] bg-white p-1 text-gray-400 hover:text-red-600" title="Xóa">
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                                </Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#eaeaea] bg-white p-8 text-center text-[14px] text-gray-500">Chưa có dịch vụ nào được đề xuất. Hãy thêm từ danh sách phía trên.</div>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-[#eaeaea] bg-white p-6">
                <div className="border-b border-[#eaeaea] pb-4">
                  <h2 className="text-[24px] font-medium tracking-tight text-black">Ghi chú Cơ hội</h2>
                  <span className="mt-1 block text-[14px] text-gray-500">Ghi chú nội bộ hoặc yêu cầu thêm từ khách hàng.</span>
                </div>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-xl border border-[#eaeaea] bg-gray-50/50 p-4 text-[14px] text-gray-600">
                    <p>{deal.notes || "Chưa có ghi chú."}</p>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <section className="rounded-2xl border border-[#eaeaea] bg-white p-6">
              <div className="border-b border-[#eaeaea] pb-4">
                <h2 className="text-[24px] font-medium tracking-tight text-black">{activeTab === "activity" ? "Lịch sử hoạt động" : "Tệp đính kèm"}</h2>
                <span className="mt-1 block text-[14px] text-gray-500">{activeTab === "activity" ? "Lịch sử các thay đổi và tương tác." : "Tài liệu đính kèm."}</span>
              </div>
              {activeTab === "activity" ? (
                <ActivityTimeline logs={deal.activityLogs} fallback={fallbackActivities} />
              ) : (
                <AttachmentList files={deal.files} />
              )}
            </section>
          )}
        </main>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-[#eaeaea] bg-white p-5">
            <h2 className="text-[18px] font-medium tracking-tight text-black">Thông tin Cơ hội</h2>
            <div className="mt-4 divide-y divide-[#eaeaea]">
              <div className="flex items-center justify-between gap-4 py-3"><span className="text-[12px] text-gray-500">Nguồn Deal</span><strong className="text-right text-[13px] font-medium text-black">{deal.source || "Tự khai thác"}</strong></div>
              <div className="flex items-center justify-between gap-4 py-3"><span className="text-[12px] text-gray-500">Trạng thái</span><strong className="text-right text-[13px] font-medium text-black">{deal.status || "Mở"}</strong></div>
              <div className="flex items-center justify-between gap-4 py-3"><span className="text-[12px] text-gray-500">Tỷ lệ chốt</span><strong className="text-right text-[13px] font-medium text-black">{deal.probability || 50}%</strong></div>
              <div className="flex items-center justify-between gap-4 py-3"><span className="text-[12px] text-gray-500">Ngày tạo</span><strong className="text-right text-[13px] font-medium text-black">{formatDateTime(deal.createdAt)}</strong></div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#eaeaea] bg-white p-5">
            <h2 className="text-[18px] font-medium tracking-tight text-black">Giá trị Dự kiến</h2>
            <div className="mt-4">
              <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400">Ngân sách KH</span>
              <strong className="mt-2 block text-[28px] font-medium leading-none tracking-tight text-black">{formatMoney(deal.value, deal.currency)}</strong>
            </div>
          </section>

          <section className="rounded-2xl border border-[#eaeaea] bg-white p-5">
            <h2 className="text-[18px] font-medium tracking-tight text-black">Tài liệu & Trình bày</h2>
            <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-[#eaeaea] bg-gray-50/50 p-5 text-center">
              <Share2 className="h-10 w-10 text-black" />
              <strong className="mt-3 text-black">Bản trình bày HTML</strong>
              <span className="mt-1 text-xs text-gray-500">Gửi link này cho khách hàng để xem các Options.</span>
            </div>
            <a href={publicUrl} target="_blank" className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-md bg-black text-[13px] font-medium text-white hover:bg-gray-800">
              <Eye className="h-4 w-4" />
              Mở giao diện Khách
            </a>
            <button type="button" onClick={copyLink} className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-md border border-[#eaeaea] bg-white text-[13px] font-medium text-black hover:bg-gray-50">
              <Copy className="h-4 w-4" />
              {copied ? "Đã copy" : "Copy Link Gửi Khách"}
            </button>
          </section>

          <section className="rounded-2xl border border-[#eaeaea] bg-white p-5">
            <div>
              <h2 className="text-[18px] font-medium tracking-tight text-black">Thao tác chuyển đổi</h2>
            </div>
            <div className="mt-3">
              <p className="mb-3 text-[13px] text-gray-500">Sau khi khách hàng chọn option, bạn có thể tạo Báo giá chính thức.</p>
              <button 
                onClick={handleConvertToQuote}
                disabled={converting || selectedOptionsForQuote.length === 0}
                className="flex h-9 w-full items-center justify-center gap-2 rounded-md bg-black font-medium text-white text-[13px] transition hover:bg-gray-800 disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                {converting ? "Đang tạo..." : `Tạo Báo giá (${selectedOptionsForQuote.length} options)`}
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
"// @ts-nocheck";
