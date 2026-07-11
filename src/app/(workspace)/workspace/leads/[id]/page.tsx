import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRightLeft, GraduationCap, Merge, UserCircle, Star, Phone, Mail, Building2, MapPin, Target, LayoutDashboard, History, MessageSquare, Plus } from "lucide-react";
import { requireAuth } from "@/lib/auth/require-auth";
import { LeadService } from "@/modules/leads/services/lead.service";

export const metadata: Metadata = { title: "Chi tiết Lead | Vercel UI" };

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  const { id } = await params;
  const orgId = session.organizationId;
  const leadId = id;

  const lead = await LeadService.getLeadDetailData(orgId, leadId);

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
    <div className="flex flex-col min-h-screen bg-white text-black font-sans">
      <div className="max-w-[1200px] mx-auto w-full px-4 py-8 space-y-10 md:px-10 md:py-12 md:space-y-12">
        {/* Vercel Header */}
        <div className="border-b border-[#eaeaea] pb-6">
          <div className="mb-5 flex items-center gap-3">
            <Link href="/workspace/leads" className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-[#eaeaea] bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-black">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400">Chi tiết Lead</span>
                {lead.status === 'DUPLICATE' && (
                  <span className="rounded-full bg-gray-50 border border-[#eaeaea] text-gray-600 px-3 py-1 text-[10px] font-medium uppercase tracking-widest">
                    Trùng lặp
                  </span>
                )}
                {lead.status === 'CONVERTED' && (
                  <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-[10px] font-medium uppercase tracking-widest">
                    Đã chốt
                  </span>
                )}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end md:gap-6">
            <div className="min-w-0">
              <h1 className="text-[34px] font-medium tracking-tighter leading-[1.05] text-black md:text-[56px]">
                {lead.fullName}
              </h1>
              {lead.companyName && (
                <p className="mt-3 flex items-center gap-2 text-[14px] leading-relaxed text-gray-500">
                  <Building2 className="h-4 w-4 shrink-0" /> {lead.companyName}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 md:justify-end">
            {lead.status === 'DUPLICATE' && (
              <button className="inline-flex h-9 items-center justify-center rounded-md border border-[#eaeaea] bg-white px-3 text-[13px] font-medium text-black transition-colors hover:bg-gray-50">
                <Merge className="h-4 w-4 mr-2" />
                Xử lý trùng lặp
              </button>
            )}
            {lead.status === 'NEW' && (
              <button className="inline-flex h-9 items-center justify-center rounded-md border border-[#eaeaea] bg-white px-3 text-[13px] font-medium text-black transition-colors hover:bg-gray-50">
                Đánh dấu đã liên hệ
              </button>
            )}
            <Link href={`/workspace/leads/${lead.id}/edit`} className="inline-flex h-9 items-center justify-center rounded-md border border-[#eaeaea] bg-white px-3 text-[13px] font-medium text-black transition-colors hover:bg-gray-50">
              Sửa
            </Link>
            <Link href={createStudentHref} className="inline-flex h-9 items-center justify-center rounded-md border border-[#eaeaea] bg-white px-3 text-[13px] font-medium text-black transition-colors hover:bg-gray-50">
              <GraduationCap className="h-4 w-4 mr-2" />
              Tạo học viên
            </Link>
            {lead.status !== 'CONVERTED' && (
              <form action={convertLead}>
                <button type="submit" className="inline-flex h-9 items-center justify-center rounded-md bg-black px-3 text-[13px] font-medium text-white transition-colors hover:bg-gray-800">
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Chuyển CRM
                </button>
              </form>
            )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Content (Left 2/3) */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            
            {/* Notes */}
            <div className="rounded-2xl border border-[#eaeaea] bg-white p-5 sm:p-8">
              <h3 className="text-[22px] font-medium tracking-tight text-black mb-5 sm:text-[24px] sm:mb-6">
                Ghi chú từ khách hàng
              </h3>
              {lead.note ? (
                <div className="text-[15px] text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-[#eaeaea] sm:p-6 sm:text-[16px]">
                  {lead.note}
                </div>
              ) : (
                <div className="text-[14px] text-gray-400 italic py-4 border-l-2 border-[#eaeaea] pl-4">
                  Không có ghi chú.
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
               <div className="p-5 border-b border-[#eaeaea] flex items-center justify-between gap-3 sm:p-8">
                  <h3 className="text-[22px] font-medium tracking-tight text-black sm:text-[24px]">
                    Lịch sử hoạt động
                  </h3>
                  <button className="h-[32px] px-3 inline-flex items-center justify-center rounded-full bg-black text-[13px] font-medium text-white hover:bg-gray-800 transition-colors">
                    <Plus className="h-4 w-4 mr-1.5" /> Ghi nhận
                  </button>
               </div>
               <div className="p-5 sm:p-8">
                  {lead.activities.length === 0 ? (
                    <div className="text-[14px] text-gray-400">
                      Chưa có hoạt động nào được ghi nhận.
                    </div>
                  ) : (
                    <div className="relative border-l border-[#eaeaea] ml-3 space-y-8 pb-4">
                      {lead.activities.map((activity) => (
                         <div key={activity.id} className="relative pl-8">
                            <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-white border-2 border-black"></span>
                            <div>
                              <p className="text-[16px] font-medium text-black">{activity.title || activity.type}</p>
                              <p className="text-[12px] uppercase tracking-widest text-gray-400 font-medium mt-1">
                                {new Date(activity.createdAt).toLocaleString('vi-VN')}
                              </p>
                              {activity.content && <p className="text-[14px] text-gray-600 mt-3 leading-relaxed bg-gray-50 p-4 rounded-md border border-[#eaeaea]">{activity.content}</p>}
                            </div>
                         </div>
                      ))}
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* Sidebar (Right 1/3) */}
          <div className="space-y-6 lg:sticky lg:top-8">
            
            <div className="rounded-2xl border border-[#eaeaea] bg-white p-6">
              <h3 className="text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-6">Hồ sơ chi tiết</h3>
              
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-gray-400 font-medium block mb-2">Liên hệ</span>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[14px]">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-black break-all">{lead.email || <span className="text-gray-400 italic">Chưa có email</span>}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[14px]">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-black">{lead.phone || <span className="text-gray-400 italic">Chưa có SĐT</span>}</span>
                    </div>
                    <div className="flex items-start gap-3 text-[14px]">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <span className="text-black leading-relaxed">
                        {lead.address ? lead.address : ''}
                        {lead.city ? `, ${lead.city}` : ''}
                        {!lead.address && !lead.city && <span className="text-gray-400 italic">Chưa có địa chỉ</span>}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#eaeaea]">
                  <span className="text-[11px] uppercase tracking-widest text-gray-400 font-medium block mb-3">Nguồn gốc</span>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-black text-[14px]">{lead.source?.name || "Thủ công"}</span>
                  </div>
                  {lead.utmSource && (
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">UTM Source</span>
                        <span className="text-[13px] text-black font-medium">{lead.utmSource}</span>
                      </div>
                      {lead.utmMedium && (
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">UTM Medium</span>
                          <span className="text-[13px] text-black font-medium">{lead.utmMedium}</span>
                        </div>
                      )}
                      {lead.utmCampaign && (
                        <div className="col-span-2">
                          <span className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">Campaign</span>
                          <span className="text-[13px] text-black font-medium">{lead.utmCampaign}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-[#eaeaea]">
                  <span className="text-[11px] uppercase tracking-widest text-gray-400 font-medium block mb-3">Phân bổ cho</span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {lead.assignee ? (
                        <>
                          <img src={lead.assignee.image || `https://ui-avatars.com/api/?name=${lead.assignee.name}`} alt="" className="w-8 h-8 rounded-full border border-[#eaeaea]" />
                          <span className="text-[14px] font-medium text-black">{lead.assignee.name}</span>
                        </>
                      ) : (
                        <span className="text-[13px] text-gray-500 italic">Chưa phân bổ</span>
                      )}
                    </div>
                    <button className="text-black text-[13px] font-medium hover:underline">Đổi</button>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Score (Brand Accent Callout alternative) */}
            <div className="rounded-2xl border border-[#eaeaea] bg-gradient-to-b from-gray-50 to-white p-6">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] uppercase tracking-widest text-gray-400 font-medium flex items-center gap-2">
                    <Star className="w-4 h-4 text-black" />
                    AI Lead Score
                  </h3>
                  <span className="text-[24px] font-medium tracking-tight text-black">{lead.score}</span>
               </div>
               <p className="text-[13px] text-gray-500 leading-relaxed">
                 Điểm số đánh giá độ nóng của Lead dựa trên mức độ hoàn thiện hồ sơ.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
