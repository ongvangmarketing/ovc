"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layers3, Plus, Settings2 } from "lucide-react";

import { getServices } from "@/actions/services-crud";

function statusLabel(status: string) {
  if (status === "ACTIVE") return "Đang bật";
  if (status === "INACTIVE") return "Tạm ẩn";
  return "Lưu trữ";
}

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const res = await getServices();
      if (res.success) setServices(res.services);
      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <div className="quote-page mx-auto max-w-[1440px] px-6 py-6 animate-in fade-in duration-300">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
            <Layers3 className="h-4 w-4 text-orange-500" />
            Danh mục Dịch vụ
          </div>
          <h1 className="text-[14px] font-light text-slate-950">
            Quản lý dịch vụ và các gói tư vấn để gửi cho khách hàng.
          </h1>
        </div>

        <Link href="/workspace/services/new" className="quote-action-button quote-action-primary">
          <Plus className="h-4 w-4" />
          Thêm dịch vụ mới
        </Link>
      </div>

      {loading ? (
        <section className="quote-panel">
          <div className="py-10 text-center text-sm text-slate-500">Đang tải danh mục dịch vụ...</div>
        </section>
      ) : services.length === 0 ? (
        <section className="quote-panel">
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-orange-500">
              <Layers3 className="h-7 w-7" />
            </div>
            <h2 className="text-base font-semibold text-slate-950">Chưa có dịch vụ nào</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Tạo dịch vụ đầu tiên để đội kinh doanh có bộ gói tư vấn rõ ràng khi làm báo giá.
            </p>
          </div>
        </section>
      ) : (
        <section className="quote-panel overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">Tên dịch vụ</th>
                  <th className="px-6 py-4">Danh mục</th>
                  <th className="px-6 py-4 text-center">Số gói</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((service) => (
                  <tr
                    key={service.id}
                    className="group cursor-pointer transition-colors hover:bg-orange-50/50"
                    onClick={() => router.push(`/workspace/services/${service.id}/edit`)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-950">{service.name}</div>
                      <div className="mt-1 max-w-[420px] truncate text-xs text-slate-500">
                        {service.description || "Chưa có mô tả"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {service.category?.name || "Khác"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-blue-50 px-2 text-xs font-bold text-blue-700">
                        {service.options?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          service.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {statusLabel(service.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/workspace/services/${service.id}/edit`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
                      >
                        <Settings2 className="h-4 w-4" />
                        Cấu hình
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
