import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Building2, Edit3, MapPin, Mail, Phone, Globe, Briefcase, FileText, BadgeDollarSign, Plus } from "lucide-react";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Chi tiết Doanh nghiệp" };

function customFieldsObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  return {};
}

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  const { id } = await params;

  const company = await db.company.findUnique({
    where: { id, organizationId: session.organizationId },
    include: {
      contacts: true,
      deals: true,
    }
  });

  if (!company) return notFound();
  const taxCode = customFieldsObject(company.customFields).taxCode;

  return (
    <div className="quote-page mx-auto max-w-[1440px] px-6 py-6 animate-in fade-in duration-300">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/workspace/crm/companies" className="quote-action-button quote-action-secondary !h-9 !w-9 !p-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2 text-[14px] font-light text-slate-500">
                CRM / Công ty
              </div>
              <h1 className="text-xl font-semibold text-slate-950">{company.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                {company.industry && (
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5"/> {company.industry}</span>
                )}
                {company.website && (
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5"/> {company.website}
                  </span>
                )}
                {typeof taxCode === "string" && taxCode ? (
                  <span className="flex items-center gap-1">
                    <BadgeDollarSign className="w-3.5 h-3.5"/> MST {taxCode}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/workspace/crm/companies/${company.id}/edit`} className="quote-action-button quote-action-secondary">
            <Edit3 className="h-4 w-4 mr-1.5" />
            Sửa thông tin
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-1">
          <section className="quote-panel">
            <div className="quote-panel-header">
              <h2><FileText className="w-4 h-4 text-orange-500"/> Thông tin liên hệ</h2>
              <span>Dữ liệu định danh và liên hệ chính của công ty.</span>
            </div>
            <div className="space-y-4">
              {typeof taxCode === "string" && taxCode && (
                <div className="flex items-start gap-3">
                  <BadgeDollarSign className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Mã số thuế</p>
                    <p className="text-sm font-medium text-slate-900">{taxCode}</p>
                  </div>
                </div>
              )}
              {company.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Email công ty</p>
                    <p className="text-sm font-medium text-slate-900">{company.email}</p>
                  </div>
                </div>
              )}
              {company.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Số điện thoại</p>
                    <p className="text-sm font-medium text-slate-900">{company.phone}</p>
                  </div>
                </div>
              )}
              {company.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Trụ sở / Địa chỉ</p>
                    <p className="text-sm font-medium text-slate-900">{company.address}</p>
                  </div>
                </div>
              )}
              {company.description && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-slate-500 mb-1">Mô tả thêm</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{company.description}</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <section className="quote-panel overflow-hidden">
            <div className="quote-panel-header">
              <div>
                <h2>Danh sách Người liên hệ ({company.contacts.length})</h2>
                <span>Các khách hàng đang được gắn với công ty này.</span>
              </div>
              <Link href={`/workspace/crm/contacts/create?companyId=${company.id}`} className="quote-action-button quote-action-primary">
                <Plus className="h-4 w-4" />
                Thêm người liên hệ
              </Link>
            </div>
            <div className="overflow-x-auto">
              {company.contacts.length === 0 ? (
                <div className="quote-detail-empty">Chưa có người liên hệ nào.</div>
              ) : (
                <table className="w-full min-w-[620px] text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {company.contacts.map(contact => (
                      <tr key={contact.id} className="table-row-hover">
                        <td className="px-4 py-3">
                          <Link href={`/workspace/crm/contacts/${contact.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                            {contact.firstName} {contact.lastName}
                          </Link>
                          {contact.jobTitle && <div className="text-xs text-slate-500">{contact.jobTitle}</div>}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">{contact.email || "-"}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{contact.phone || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <section className="quote-panel overflow-hidden">
            <div className="quote-panel-header">
              <h2>Cơ hội bán hàng ({company.deals.length})</h2>
              <span>Các deal đang liên quan đến công ty.</span>
            </div>
            <div className="overflow-x-auto">
              {company.deals.length === 0 ? (
                <div className="quote-detail-empty">Chưa có cơ hội bán hàng nào.</div>
              ) : (
                <table className="w-full min-w-[620px] text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {company.deals.map(deal => (
                      <tr key={deal.id} className="table-row-hover">
                        <td className="px-4 py-3">
                          <Link href={`/workspace/crm/deals/${deal.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                            {deal.title}
                          </Link>
                          <div className="text-xs text-slate-500">Trạng thái: {deal.status}</div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(deal.value || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
