"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock3, Layers3, Pencil, Plus, Trash2 } from "lucide-react";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

import { createServiceOption, deleteServiceOption, getService, updateService, updateServiceOption } from "@/actions/services-crud";

type ServiceStatusValue = "ACTIVE" | "INACTIVE";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);
}

function optionFeatures(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export default function EditServicePage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOptionForm, setShowOptionForm] = useState(false);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [optionData, setOptionData] = useState({
    name: "",
    description: "",
    price: 0,
    unit: "",
    durationText: "",
    status: "ACTIVE" as ServiceStatusValue
  });

  const loadData = async () => {
    const res = await getService(params.id);
    if (res.success) setService(res.service);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  const handleUpdateService = async (event: React.FormEvent) => {
    event.preventDefault();
    await updateService(service.id, {
      name: service.name,
      description: service.description,
      status: service.status
    });
    await loadData();
  };

  const handleSaveOption = async (event: React.FormEvent) => {
    event.preventDefault();
    if (editingOptionId) {
      await updateServiceOption(editingOptionId, optionData);
    } else {
      await createServiceOption(service.id, optionData);
    }
    setShowOptionForm(false);
    setEditingOptionId(null);
    await loadData();
  };

  const handleEditOption = (option: any) => {
    setEditingOptionId(option.id);
    setOptionData({
      name: option.name,
      description: option.description || "",
      price: Number(option.price),
      unit: option.unit || "",
      durationText: option.durationText || "",
      status: option.status as ServiceStatusValue
    });
    setShowOptionForm(true);
  };

  const handleDeleteOption = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa option này?")) return;
    await deleteServiceOption(id);
    await loadData();
  };

  if (loading) {
    return <div className="quote-page mx-auto max-w-[1440px] px-6 py-10 text-center text-sm text-slate-500">Đang tải dịch vụ...</div>;
  }

  if (!service) {
    return <div className="quote-page mx-auto max-w-[1440px] px-6 py-10 text-center text-sm text-red-500">Không tìm thấy dịch vụ</div>;
  }

  return (
    <div className="quote-page mx-auto max-w-[1440px] px-6 py-6 animate-in fade-in duration-300">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
            <Link href="/workspace/services" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Layers3 className="h-4 w-4 text-orange-500" />
            Chi tiết dịch vụ
          </div>
          <h1 className="text-[16px] font-semibold text-slate-950">{service.name}</h1>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingOptionId(null);
            setOptionData({ name: "", description: "", price: 0, unit: "gói", durationText: "", status: "ACTIVE" });
            setShowOptionForm(true);
          }}
          className="quote-action-button quote-action-primary"
        >
          <Plus className="h-4 w-4" />
          Thêm gói
        </button>
      </div>

      <div className="space-y-5">
        <section className="quote-panel">
          <div className="quote-panel-header">
            <h2>Thông tin dịch vụ</h2>
            <span>Cập nhật tên, mô tả và trạng thái hiển thị.</span>
          </div>

          <form onSubmit={handleUpdateService} className="grid gap-4 lg:grid-cols-[1.1fr_2fr_220px_180px] lg:items-end">
            <label className="block">
              <span className="mb-1.5 block text-[15px] font-light text-slate-700">Tên dịch vụ</span>
              <input
                type="text"
                required
                value={service.name}
                onChange={(event) => setService({ ...service, name: event.target.value })}
                className="quote-input"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[15px] font-light text-slate-700">Mô tả tư vấn</span>
              <TiptapEditor
                value={service.description || ""}
                onChange={(content) => setService({ ...service, description: content })}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[15px] font-light text-slate-700">Trạng thái</span>
              <select value={service.status} onChange={(event) => setService({ ...service, status: event.target.value })} className="quote-input">
                <option value="ACTIVE">Đang bật</option>
                <option value="INACTIVE">Tạm ẩn</option>
              </select>
            </label>

            <button type="submit" className="quote-action-button quote-action-secondary w-full justify-center">
              Cập nhật dịch vụ
            </button>
          </form>
        </section>

        <div className="space-y-5">
          {showOptionForm && (
            <section className="quote-panel">
              <div className="quote-panel-header">
                <h2>{editingOptionId ? "Sửa gói dịch vụ" : "Thêm gói dịch vụ"}</h2>
                <span>Nhập thông tin giá, đơn vị và thời gian để dùng trong báo giá.</span>
              </div>

              <form onSubmit={handleSaveOption} className="grid gap-4 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="mb-1.5 block text-[15px] font-light text-slate-700">Tên gói</span>
                  <input type="text" required value={optionData.name} onChange={(event) => setOptionData({ ...optionData, name: event.target.value })} className="quote-input" />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-1.5 block text-[15px] font-light text-slate-700">Mô tả chốt khách</span>
                  <TiptapEditor value={optionData.description} onChange={(content) => setOptionData({ ...optionData, description: content })} />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[15px] font-light text-slate-700">Giá</span>
                  <input type="number" required value={optionData.price} onChange={(event) => setOptionData({ ...optionData, price: Number(event.target.value) })} className="quote-input" />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[15px] font-light text-slate-700">Đơn vị</span>
                  <input type="text" value={optionData.unit} onChange={(event) => setOptionData({ ...optionData, unit: event.target.value })} className="quote-input" />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[15px] font-light text-slate-700">Thời gian</span>
                  <input type="text" value={optionData.durationText} onChange={(event) => setOptionData({ ...optionData, durationText: event.target.value })} className="quote-input" />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[15px] font-light text-slate-700">Trạng thái</span>
                  <select value={optionData.status} onChange={(event) => setOptionData({ ...optionData, status: event.target.value as ServiceStatusValue })} className="quote-input">
                    <option value="ACTIVE">Đang bật</option>
                    <option value="INACTIVE">Tạm ẩn</option>
                  </select>
                </label>

                <div className="flex justify-end gap-3 md:col-span-2">
                  <button type="button" onClick={() => setShowOptionForm(false)} className="quote-action-button quote-action-secondary">
                    Hủy
                  </button>
                  <button type="submit" className="quote-action-button quote-action-primary">
                    Lưu gói
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="quote-panel">
            <div className="quote-panel-header">
              <h2>Các gói dịch vụ</h2>
              <span>So sánh nhanh theo 3 cột để tư vấn và chốt khách.</span>
            </div>

            {service.options?.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
                Chưa có gói nào cho dịch vụ này.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {service.options?.map((option: any) => {
                  const features = optionFeatures(option.featuresJson);

                  return (
                    <article key={option.id} className="flex min-h-[340px] flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold leading-snug text-slate-950">{option.name}</h3>
                          {option.status === "INACTIVE" ? (
                            <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">Tạm ẩn</span>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button type="button" onClick={() => handleEditOption(option)} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-blue-600 hover:bg-blue-50">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => handleDeleteOption(option.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-500 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span className="text-4xl font-bold leading-none tracking-normal text-orange-500">
                            {formatCurrency(Number(option.price))}
                          </span>
                          {option.unit ? <span className="text-sm font-semibold text-slate-500">/{option.unit}</span> : null}
                        </div>
                        {option.durationText ? (
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1">
                              <Clock3 className="h-3.5 w-3.5" />
                              {option.durationText}
                            </span>
                          </div>
                        ) : null}
                      </div>

                      <p className="mb-4 text-sm leading-6 text-slate-600">{option.description || "Chưa có mô tả tư vấn."}</p>

                      <div className="mt-auto space-y-2 border-t border-slate-100 pt-4">
                        {features.length ? (
                          features.slice(0, 7).map((feature) => (
                            <div key={feature} className="flex gap-2 text-sm leading-5 text-slate-700">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                              <span>{feature}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-slate-400">Chưa có danh sách quyền lợi.</div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
