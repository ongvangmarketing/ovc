"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { addOptionToDeal, removeDealOption, convertDealOptionsToQuotation, updateDealOption } from "@/app/actions/deal-services";
import { reorderDealOptionsAction } from "@/app/actions/deals";
import { 
  ArrowLeft, Plus, CheckCircle2, Trash2, ExternalLink, 
  FileText, Edit3, Ellipsis, Eye, Target, Briefcase, Share2, Copy, Save, X, ChevronUp, ChevronDown
} from "lucide-react";

import { ActivityTimeline, AttachmentList, type FinanceActivity, type FinanceAttachment } from "@/modules/finance/components/finance-detail-widgets";

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

function getDealOptionView(dealOpt: any) {
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

export function DealDetailClient({ deal, availableServices, stages }: { deal: any, availableServices: any[], stages: any[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("info");
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [selectedOptionsForQuote, setSelectedOptionsForQuote] = useState<string[]>([]);
  const [expandedOptionIds, setExpandedOptionIds] = useState<string[]>([]);
  const [optionQuantities, setOptionQuantities] = useState<Record<string, number>>({});
  
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
    await addOptionToDeal(deal.id, optionId, Math.max(1, optionQuantities[optionId] || 1));
    setLoading(false);
  };

  const handleRemoveOption = async (dealOptionId: string) => {
    if (confirm("Xóa option này khỏi deal?")) {
      await removeDealOption(dealOptionId);
      setSelectedOptionsForQuote(prev => prev.filter(id => id !== dealOptionId));
    }
  };

  const handleStartEdit = (dealOpt: any) => {
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
      note: view.note
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
      note: buildDealOptionNote(editForm)
    });
    setEditingOptionId(null);
    setLoading(false);
  };

  const handleCancelEdit = () => {
    setEditingOptionId(null);
  };

  const toggleOptionDetail = (id: string) => {
    setExpandedOptionIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const featureList = (value: any) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (typeof value === "object") return Object.values(value).map(String).filter(Boolean);
    if (typeof value === "string") {
      try {
        return featureList(JSON.parse(value));
      } catch {
        return value.split(/\n|,/).map((item) => item.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const updateOptionQuantity = (optionId: string, quantity: number) => {
    setOptionQuantities((current) => ({
      ...current,
      [optionId]: Math.max(1, Number.isFinite(quantity) ? quantity : 1),
    }));
  };

  const handleMoveOption = async (index: number, direction: number) => {
    if (index + direction < 0 || index + direction >= deal.serviceOptions.length) return;
    setLoading(true);
    const newOptions = [...deal.serviceOptions];
    const temp = newOptions[index];
    newOptions[index] = newOptions[index + direction];
    newOptions[index + direction] = temp;
    await reorderDealOptionsAction(deal.id, newOptions.map((o: any) => o.id));
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

  const activeService = availableServices.find(s => s.id === selectedServiceId);
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
    <div className="quote-page mx-auto w-full max-w-[1440px] px-6 py-6 animate-in fade-in duration-300">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
            <Target className="h-4 w-4 text-orange-500" />
            <Link href="/workspace/crm/deals" className="hover:text-slate-700 hover:underline">CRM / Cơ hội kinh doanh</Link>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-[18px] font-light text-slate-950">{deal.title}</h1>
            <span className="text-[12px] px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
              {deal.stage?.name || deal.status}
            </span>
          </div>
          <p className="text-[13px] text-slate-500 mt-1">
            Ngày tạo: {formatDate(deal.createdAt)} · Cập nhật cuối: {formatDate(deal.updatedAt)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a href={publicUrl} target="_blank" className="quote-action-button quote-action-secondary">
            <Eye className="h-4 w-4" />
            Xem
          </a>
          <Link href={`/workspace/crm/deals/${deal.id}/edit`} className="quote-action-button quote-action-secondary">
            <Edit3 className="h-4 w-4" />
            Chỉnh sửa
          </Link>
          <div className="relative">
            <button type="button" onClick={() => setMenuOpen((current) => !current)} className="quote-action-button quote-action-secondary px-2">
              <Ellipsis className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50">
                <button type="button" onClick={copyLink} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  {copied ? "Đã copy" : "Copy link"}
                </button>
                <button type="button" className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Xóa cơ hội
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="quote-detail-summary mt-6">
        <div>
          <span>Khách hàng / Doanh nghiệp</span>
          <strong>{customerName}</strong>
          <p>{deal.company?.industry || deal.contact?.jobTitle || "Khách cá nhân"}</p>
        </div>
        <div>
          <span>Cơ hội bán hàng</span>
          <strong>{deal.title}</strong>
          <p>Giai đoạn: {deal.stage?.name || deal.status}</p>
        </div>
        <div>
          <span>Giá trị dự kiến</span>
          <strong className="text-indigo-600">{formatMoney(deal.value, deal.currency)}</strong>
          <p>Tỷ lệ thắng (Win prob): {deal.probability || 50}%</p>
        </div>
      </section>

      <div className="quote-detail-layout mt-6">
        <main className="space-y-5 min-w-0 w-full">
          <nav className="quote-detail-tabs">
            {detailTabs.map((tab) => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={activeTab === tab.id ? "active" : ""}>
                {tab.label}
              </button>
            ))}
          </nav>

          {activeTab === "info" ? (
            <>
              <section className="quote-panel">
                <div className="quote-panel-header">
                  <h2>Quy trình Sales Pipeline</h2>
                  <span>Tiến độ thực hiện của cơ hội kinh doanh.</span>
                </div>
                <div className="quote-progress quote-progress-five">
                  {steps.map((step) => (
                    <div key={step.label} className={step.done ? "done" : ""}>
                      <span>✓</span>
                      <p>{step.label}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="quote-panel">
                <div className="quote-panel-header flex items-center justify-between !border-b-0 !pb-0 mb-4">
                  <div>
                    <h2>Dịch vụ Đề xuất (Options)</h2>
                    <span>Danh sách các dịch vụ đang được đề xuất cho khách hàng.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select 
                      className="quote-input py-2 bg-slate-50 cursor-pointer w-[260px] truncate"
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                    >
                      <option value="">+ Thêm Dịch vụ</option>
                      {availableServices.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {activeService && (
                  <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                    <div className="mb-3 flex flex-col gap-1">
                      <h4 className="font-medium text-indigo-900 text-sm">Chọn Option từ {activeService.name}</h4>
                      <p className="text-[13px] text-indigo-700">Hiển thị đầy đủ option, giá, đơn vị và số lượng trước khi thêm vào Cơ hội.</p>
                    </div>
                    <div className="grid gap-3">
                      {activeService.options.map((opt: any) => {
                        const features = featureList(opt.featuresJson);
                        const quantity = optionQuantities[opt.id] || 1;
                        return (
                          <article key={opt.id} className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
                            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_120px_110px_auto] lg:items-start">
                              <div className="min-w-0">
                                <div className="font-medium uppercase text-slate-900">{opt.name}</div>
                                <div className="mt-1 text-[13px] font-medium uppercase text-orange-500">{activeService.name}</div>
                                {opt.description ? <p className="mt-2 whitespace-pre-wrap text-[14px] leading-6 text-slate-600">{opt.description}</p> : null}
                                <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-slate-600">
                                  <span className="rounded-full bg-slate-100 px-2.5 py-1">Đơn vị: {opt.unit || "Gói"}</span>
                                  <span className="rounded-full bg-slate-100 px-2.5 py-1">Thời lượng: {opt.durationText || "Theo thỏa thuận"}</span>
                                </div>
                                {features.length ? (
                                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                    {features.map((feature: string, featureIndex: number) => (
                                      <div key={`${opt.id}-${featureIndex}`} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[13px] text-slate-600">
                                        {feature}
                                      </div>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                              <div>
                                <span className="mb-1 block text-[11px] font-medium uppercase text-slate-400">Đơn giá</span>
                                <strong className="text-slate-900">{formatMoney(opt.price)}</strong>
                              </div>
                              <label className="block">
                                <span className="mb-1 block text-[11px] font-medium uppercase text-slate-400">Số lượng</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={quantity}
                                  onChange={(event) => updateOptionQuantity(opt.id, Number(event.target.value))}
                                  className="quote-input h-10"
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => handleAddOption(opt.id)}
                                disabled={loading}
                                className="quote-action-button quote-action-primary h-10 min-h-10 px-4"
                              >
                                <Plus className="h-4 w-4" />
                                Thêm
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="quotation-items-list mt-2">
                  {deal.serviceOptions?.length ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-4">
                      <div className="overflow-x-auto w-full">
                        <table className="w-full text-sm text-left border-collapse">
                          <thead className="bg-[#ee8f15] text-white">
                            <tr>
                              <th className="px-4 py-3 font-medium text-center w-16 border-r border-[#fa9f2a]">
                                <input 
                                  type="checkbox" 
                                  className="w-4 h-4 rounded border-white text-orange-500 focus:ring-orange-500 cursor-pointer accent-orange-500"
                                  title="Chọn tất cả để tạo báo giá"
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedOptionsForQuote(deal.serviceOptions.map((o: any) => o.id));
                                    else setSelectedOptionsForQuote([]);
                                  }}
                                  checked={selectedOptionsForQuote.length > 0 && selectedOptionsForQuote.length === deal.serviceOptions.length}
                                />
                              </th>
                              <th className="px-4 py-3 font-medium border-r border-[#fa9f2a] min-w-[320px]">Nội dung dịch vụ</th>
                              <th className="px-4 py-3 font-medium text-center w-36 border-r border-[#fa9f2a]">Đơn vị tính</th>
                              <th className="px-4 py-3 font-medium text-center w-28">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {deal.serviceOptions.map((dealOpt: any, index: number) => {
                              const isSelected = selectedOptionsForQuote.includes(dealOpt.id);
                              const isConverted = dealOpt.status === 'CONVERTED_TO_QUOTE';
                              const isEditing = editingOptionId === dealOpt.id;
                              const isExpanded = expandedOptionIds.includes(dealOpt.id);
                              const optionView = getDealOptionView(dealOpt);
                              const features = featureList(optionView.featuresText);

                              if (isEditing) {
                                return (
                                  <tr key={dealOpt.id} className="bg-slate-50">
                                    <td colSpan={4} className="p-4">
                                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                          <div>
                                            <label className="block text-[11px] font-medium text-slate-500 mb-1 uppercase">Tên option</label>
                                            <input className="w-full border border-slate-200 rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-orange-500 outline-none" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                                          </div>
                                          <div>
                                            <label className="block text-[11px] font-medium text-slate-500 mb-1 uppercase">Mô tả</label>
                                            <TiptapEditor value={editForm.description} onChange={content => setEditForm({...editForm, description: content})} />
                                          </div>
                                          <div>
                                            <label className="block text-[11px] font-medium text-slate-500 mb-1 uppercase">Quyền lợi / Hạng mục</label>
                                            <TiptapEditor placeholder="Mỗi dòng là một quyền lợi" value={editForm.featuresText} onChange={content => setEditForm({...editForm, featuresText: content})} />
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <label className="block text-[11px] font-medium text-slate-500 mb-1 uppercase">Giá (VND)</label>
                                            <input type="number" className="w-full border border-slate-200 rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-orange-500 outline-none" value={editForm.unitPrice} onChange={e => setEditForm({...editForm, unitPrice: Number(e.target.value)})} />
                                          </div>
                                          <div>
                                            <label className="block text-[11px] font-medium text-slate-500 mb-1 uppercase">Đơn vị</label>
                                            <input className="w-full border border-slate-200 rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-orange-500 outline-none" value={editForm.unit} onChange={e => setEditForm({...editForm, unit: e.target.value})} />
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block text-[11px] font-medium text-slate-500 mb-1 uppercase">Ghi chú</label>
                                          <TiptapEditor placeholder="VD: Gói bao gồm hosting 1 năm..." value={editForm.note} onChange={content => setEditForm({...editForm, note: content})} />
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                          <button onClick={handleCancelEdit} disabled={loading} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5">
                                            <X className="w-4 h-4" /> Hủy
                                          </button>
                                          <button onClick={handleSaveEdit} disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm">
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
                                <tr className={`${isSelected ? 'bg-orange-50/30 text-slate-900' : 'bg-white text-slate-700'} transition-colors hover:bg-slate-50 group`}>
                                  <td className="px-4 py-5 text-center align-top border-r border-slate-100">
                                    <input 
                                      type="checkbox" 
                                      className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500 cursor-pointer accent-orange-500 mt-1 disabled:opacity-50"
                                      checked={isSelected}
                                      disabled={isConverted}
                                      onChange={(e) => {
                                        if (e.target.checked) setSelectedOptionsForQuote([...selectedOptionsForQuote, dealOpt.id]);
                                        else setSelectedOptionsForQuote(selectedOptionsForQuote.filter(id => id !== dealOpt.id));
                                      }}
                                    />
                                  </td>
                                  <td className="px-4 py-5 align-top border-r border-slate-100">
                                    <div className="flex justify-between items-start mb-2">
                                      <div className={`font-medium uppercase ${isSelected ? 'text-orange-600' : 'text-slate-800'}`}>
                                        {optionView.name}
                                      </div>
                                      <div className="shrink-0 ml-2">
                                        {dealOpt.status === 'CUSTOMER_SELECTED' && <span className="text-[10px] font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Đã chọn</span>}
                                        {dealOpt.status === 'CONVERTED_TO_QUOTE' && <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">Đã lên Báo giá</span>}
                                        {dealOpt.status === 'PROPOSED' && <span className="text-[10px] font-medium bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded uppercase">Đang đề xuất</span>}
                                      </div>
                                    </div>
                                    <div className="text-[13px] font-medium text-orange-500 mb-1 uppercase">{dealOpt.serviceOption.service?.name}</div>
                                    {optionView.description && <p className="text-slate-500 mt-1 mb-2 whitespace-pre-wrap text-[14px]">{optionView.description}</p>}
                                    {optionView.note && <div className="text-sm text-slate-600 whitespace-pre-wrap mt-2">{optionView.note}</div>}
                                    <button
                                      type="button"
                                      onClick={() => toggleOptionDetail(dealOpt.id)}
                                      className="mt-3 inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[12px] font-medium text-orange-600 hover:bg-orange-100"
                                    >
                                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                      {isExpanded ? "Thu gọn chi tiết" : "Xem chi tiết để sửa"}
                                    </button>
                                    {Number(dealOpt.discount) > 0 && (
                                      <div className="mt-2 inline-block text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">
                                        Được giảm giá: {formatMoney(dealOpt.discount)}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-4 py-5 text-center align-top border-r border-slate-100">
                                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[12px] font-medium text-slate-700">
                                      {optionView.unit}
                                    </span>
                                  </td>
                                  <td className="px-4 py-5 align-top text-center">
                                    {!isConverted && (
                                      <div className="grid grid-cols-2 gap-1 w-[60px] mx-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleMoveOption(index, -1)} disabled={index === 0 || loading} className="text-slate-400 hover:text-blue-500 p-1 bg-white rounded shadow-sm border border-slate-200 disabled:opacity-30 flex items-center justify-center" title="Lên trên">
                                          <ChevronUp className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleMoveOption(index, 1)} disabled={index === deal.serviceOptions.length - 1 || loading} className="text-slate-400 hover:text-blue-500 p-1 bg-white rounded shadow-sm border border-slate-200 disabled:opacity-30 flex items-center justify-center" title="Xuống dưới">
                                          <ChevronDown className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleStartEdit(dealOpt)} disabled={loading} className="text-slate-400 hover:text-orange-500 p-1 bg-white rounded shadow-sm border border-slate-200 flex items-center justify-center" title="Chỉnh sửa">
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleRemoveOption(dealOpt.id)} disabled={loading} className="text-slate-400 hover:text-red-500 p-1 bg-white rounded shadow-sm border border-slate-200 flex items-center justify-center" title="Xóa">
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                                {isExpanded ? (
                                  <tr className="bg-orange-50/20">
                                    <td />
                                    <td colSpan={3} className="px-4 py-4">
                                      <div className="rounded-xl border border-orange-100 bg-white p-4 text-[13px] leading-6 text-slate-600 shadow-sm">
                                        <div className="mb-2 text-slate-500">
                                          Đơn vị tính: <strong className="text-slate-800">{optionView.unit}</strong>
                                          {" · "}Đơn giá: <strong className="text-slate-800">{formatMoney(dealOpt.unitPrice || 0)}</strong>
                                          {" · "}Thời lượng: <strong className="text-slate-800">{optionView.durationText}</strong>
                                          {" · "}Thuế: <strong className="text-slate-800">{Number(dealOpt.taxRate || 0)}%</strong>
                                        </div>
                                        {features.length ? (
                                          <div>
                                            <div className="font-medium text-slate-700">Hạng mục / quyền lợi:</div>
                                            <ul className="mt-1 list-disc space-y-1 pl-5">
                                              {features.map((feature, featureIndex) => (
                                                <li key={`${dealOpt.id}-feature-${featureIndex}`}>{feature}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        ) : null}
                                        <div className="mt-2 whitespace-pre-wrap">
                                          {optionView.description || "Chưa có mô tả chi tiết cho option này."}
                                        </div>
                                        {optionView.note ? (
                                          <div className="mt-2">
                                            <strong className="text-slate-700">Ghi chú riêng trong Cơ hội:</strong>{" "}
                                            <span className="whitespace-pre-wrap">{optionView.note}</span>
                                          </div>
                                        ) : null}
                                      </div>
                                    </td>
                                  </tr>
                                ) : null}
                                </Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="quote-detail-empty">Chưa có dịch vụ nào được đề xuất. Hãy thêm từ danh sách phía trên.</div>
                  )}
                </div>
              </section>

              <section className="quote-panel">
                <div className="quote-panel-header">
                  <h2>Ghi chú Cơ hội (Notes)</h2>
                  <span>Ghi chú nội bộ hoặc yêu cầu thêm từ khách hàng.</span>
                </div>
                <div className="grid gap-3">
                  <div className="contract-terms text-[14px]">
                    <p>{deal.notes || "Chưa có ghi chú."}</p>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <section className="quote-panel">
              <div className="quote-panel-header">
                <h2>{activeTab === "activity" ? "Lịch sử hoạt động" : "Tệp đính kèm"}</h2>
                <span>{activeTab === "activity" ? "Lịch sử các thay đổi và tương tác." : "Tài liệu đính kèm."}</span>
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
          <section className="quote-detail-card">
            <h2>Thông tin Cơ hội</h2>
            <div className="quote-side-list">
              <div><span>Nguồn Deal</span><strong>{deal.source || "Tự khai thác"}</strong></div>
              <div><span>Trạng thái</span><strong>{deal.status || "Mở"}</strong></div>
              <div><span>Tỷ lệ chốt</span><strong>{deal.probability || 50}%</strong></div>
              <div><span>Ngày tạo</span><strong>{formatDateTime(deal.createdAt)}</strong></div>
            </div>
          </section>

          <section className="quote-detail-card">
            <h2>Giá trị Dự kiến</h2>
            <div className="quote-side-list">
              <div><span>Ngân sách KH</span><strong className="text-indigo-700 text-[15px]">{formatMoney(deal.value, deal.currency)}</strong></div>
            </div>
          </section>

          <section className="quote-detail-card">
            <h2>Tài liệu & Trình bày</h2>
            <div className="contract-document-box bg-indigo-50 border-indigo-100">
              <Share2 className="h-10 w-10 text-indigo-600" />
              <strong className="text-indigo-900">Bản trình bày (HTML)</strong>
              <span className="text-indigo-700 text-xs text-center mt-1">Gửi link này cho khách hàng để xem các Options.</span>
            </div>
            <a href={publicUrl} target="_blank" className="quote-detail-action w-full mt-3 flex justify-center text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200">
              <Eye className="h-4 w-4" />
              Mở giao diện Khách
            </a>
            <button type="button" onClick={copyLink} className="quote-detail-action w-full mt-2 justify-center">
              <Copy className="h-4 w-4" />
              {copied ? "Đã copy" : "Copy Link Gửi Khách"}
            </button>
          </section>

          <section className="quote-panel border-2 border-indigo-100 bg-indigo-50/30">
            <div className="quote-panel-header !border-b-0 !mb-0 !pb-0">
              <h2 className="text-indigo-900">Thao tác chuyển đổi</h2>
            </div>
            <div className="mt-3">
              <p className="text-[13px] text-slate-600 mb-3">Sau khi khách hàng chọn option, bạn có thể tạo Báo giá chính thức.</p>
              <button 
                onClick={handleConvertToQuote}
                disabled={converting || selectedOptionsForQuote.length === 0}
                className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
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
