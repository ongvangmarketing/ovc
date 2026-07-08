import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRightLeft, GraduationCap, Merge, UserCircle, Star, Phone, Mail, Building2, MapPin, Target, LayoutDashboard, History, MessageSquare, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { LeadService } from "@/lib/services/lead.service";

export const metadata: Metadata = { title: "Chi tiết Lead" };

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  const { id } = await params;
  const orgId = session.organizationId;
  const leadId = id;

  const lead = await db.lead.findUnique({
    where: { id: leadId, organizationId: orgId },
    include: {
      source: true,
      assignee: true,
      tagItems: { include: { tag: true } },
      activities: { orderBy: { createdAt: 'desc' } },
      duplicateLogs1: { include: { matchedLead: true } }
    },
  });

  if (!lead) return notFound();
  const createStudentHref = `/workspace/training/students/create?${new URLSearchParams({
    name: lead.fullName || "",
    email: lead.email || "",
    phone: lead.phone || "",
    note: `Tạo từ Lead: ${lead.source?.name || lead.utmSource || "Thủ công"}${lead.note ? ` · ${lead.note}` : ""}`,
  }).toString()}`;

  async function convertLead() {
    "use server";
    const session = await requireAuth();
    await LeadService.convertToCRM(leadId, session.user.id);
    redirect(`/workspace/crm/deals`);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/workspace/leads" className="p-2 rounded-full hover:bg-gray-100 transition text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[15px] font-medium border border-indigo-200 shadow-sm">
              {lead.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-[15px] font-medium text-gray-950 flex items-center gap-2">
                {lead.fullName}
                {lead.status === 'DUPLICATE' && (
                  <span className="inline-flex items-center rounded-md bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 border border-orange-200">
                    Trùng lặp
                  </span>
                )}
                {lead.status === 'CONVERTED' && (
                  <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 border border-green-200">
                    Đã chuyển đổi
                  </span>
                )}
              </h1>
              {lead.companyName && <p className="text-gray-500 text-sm flex items-center gap-1"><Building2 className="w-3.5 h-3.5"/> {lead.companyName}</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lead.status === 'DUPLICATE' && (
            <button className="h-9 px-4 inline-flex items-center justify-center rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm">
              <Merge className="h-4 w-4 mr-1.5" />
              Xử lý trùng lặp
            </button>
          )}
          {lead.status === 'NEW' && (
            <button className="h-9 px-4 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm">
              Đánh dấu đã liên hệ
            </button>
          )}
          <Link href={`/workspace/leads/${lead.id}/edit`} className="h-9 px-4 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm">
            Sửa
          </Link>
          <Link href={createStudentHref} className="h-9 px-4 inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition shadow-sm">
            <GraduationCap className="h-4 w-4 mr-1.5" />
            Tạo học viên
          </Link>
          {lead.status !== 'CONVERTED' && (
            <form action={convertLead}>
              <button type="submit" className="h-9 px-4 inline-flex items-center justify-center rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 transition shadow-sm">
                <ArrowRightLeft className="h-4 w-4 mr-1.5" />
                Chuyển thành Khách hàng
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột 1: Thông tin cơ bản */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-gray-400" />
              Thông tin liên hệ
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{lead.email || <span className="text-gray-400 italic">Chưa cập nhật email</span>}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{lead.phone || <span className="text-gray-400 italic">Chưa cập nhật số điện thoại</span>}</span>
              </div>
              <div className="flex flex-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <span className="text-gray-900 leading-snug">
                  {lead.address ? lead.address : ''}
                  {lead.city ? `, ${lead.city}` : ''}
                  {!lead.address && !lead.city && <span className="text-gray-400 italic">Chưa cập nhật địa chỉ</span>}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100">
              <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">Nguồn gốc (Source)</h3>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-indigo-500" />
                  <span className="font-medium text-gray-900 text-sm">{lead.source?.name || "Thủ công"}</span>
                </div>
                {lead.utmSource && (
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div>
                      <span className="block text-gray-500 mb-1">UTM Source</span>
                      <span className="font-medium text-gray-900">{lead.utmSource}</span>
                    </div>
                    {lead.utmMedium && (
                      <div>
                        <span className="block text-gray-500 mb-1">UTM Medium</span>
                        <span className="font-medium text-gray-900">{lead.utmMedium}</span>
                      </div>
                    )}
                    {lead.utmCampaign && (
                      <div className="col-span-2 mt-1">
                        <span className="block text-gray-500 mb-1">Campaign</span>
                        <span className="font-medium text-gray-900">{lead.utmCampaign}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100">
              <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">Phân bổ</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {lead.assignee ? (
                    <>
                      <img src={lead.assignee.image || `https://ui-avatars.com/api/?name=${lead.assignee.name}`} alt="" className="w-6 h-6 rounded-full" />
                      <span className="text-sm font-medium text-gray-900">{lead.assignee.name}</span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500 italic">Chưa phân bổ</span>
                  )}
                </div>
                <button className="text-indigo-600 text-xs font-medium hover:underline">Thay đổi</button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-orange-400" />
                  AI Lead Scoring
                </h3>
                <span className="text-[15px] font-medium text-orange-600">{lead.score}</span>
             </div>
             <p className="text-xs text-gray-500 leading-relaxed">
               Điểm số này được tính toán dựa trên mức độ hoàn thiện hồ sơ và nguồn gốc tương tác của Lead. 
               Càng nhiều thông tin, điểm càng cao.
             </p>
          </div>
        </div>

        {/* Cột 2 & 3: Timeline & Activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              Ghi chú từ khách hàng
            </h3>
            {lead.note ? (
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 italic border border-gray-100">
                {lead.note}
              </div>
            ) : (
              <div className="text-sm text-gray-400 italic text-center py-4">Khách hàng không để lại lời nhắn.</div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-gray-400" />
                  Lịch sử chăm sóc (Timeline)
                </h3>
                <button className="h-8 px-3 inline-flex items-center justify-center rounded-md bg-gray-900 text-xs font-medium text-white hover:bg-gray-800 transition">
                  <Plus className="h-3 w-3 mr-1" /> Ghi nhận
                </button>
             </div>
             <div className="p-4">
                {lead.activities.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">Chưa có hoạt động chăm sóc nào được ghi nhận.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Render activities here, for now keeping it simple */}
                    {lead.activities.map((activity) => (
                       <div key={activity.id} className="flex gap-4">
                          <div className="mt-1">
                             <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                <LayoutDashboard className="w-4 h-4" />
                             </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{activity.title || activity.type}</p>
                            {activity.content && <p className="text-sm text-gray-600 mt-1">{activity.content}</p>}
                            <p className="text-xs text-gray-400 mt-1">{new Date(activity.createdAt).toLocaleString('vi-VN')}</p>
                          </div>
                       </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
