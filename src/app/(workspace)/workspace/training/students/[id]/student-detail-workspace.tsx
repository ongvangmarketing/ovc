"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { ArrowLeft, BookOpen, Clock, Mail, Phone, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { User } from "@prisma/client";

type EnrollmentDetail = {
  id: string;
  course: { id: string; title: string };
  class: { id: string; name: string } | null;
  status: string;
  progress: number;
  createdAt: Date;
};

type StudentDetail = User & {
  enrollments: EnrollmentDetail[];
};

function SubmitButton({ hasEmail }: { hasEmail: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending || !hasEmail}
      className={cn(
        "flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-lg border border-[#eaeaea] bg-white px-3 text-[13px] font-medium text-black transition-colors",
        !hasEmail ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
      )}
    >
      <Settings className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{pending ? "Đang gửi..." : "Cấp Portal"}</span>
    </button>
  );
}

export function StudentDetailWorkspace({ 
  student, 
  portalAction 
}: { 
  student: StudentDetail;
  portalAction: (payload: FormData) => void;
}) {
  const hasEmail = !student.email?.endsWith("@no-email.ovc.local") && !!student.email;
  const email = hasEmail ? student.email : "Chưa có email";

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-[#fafafa]">
      
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 shrink-0 border-b border-[#eaeaea] bg-white px-6 py-6 md:px-10">
        
        <Link 
          href="/workspace/training/students" 
          className="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-widest text-gray-400 hover:text-black transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          QUAY LẠI DANH SÁCH
        </Link>

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-[24px] font-medium text-black shadow-sm shrink-0 uppercase">
              {student.name ? student.name.split(" ").slice(-1)[0]?.charAt(0) ?? "?" : "?"}
            </div>
            <div>
              <h1 className="text-[48px] font-medium tracking-tighter leading-none text-black mb-4">{student.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-[14px] text-gray-500">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {student.phone || "Chưa cập nhật SĐT"}
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-3">
            <Link 
              href={`/workspace/training/students/${student.id}/edit`}
              className="flex h-9 min-w-0 items-center justify-center rounded-lg border border-[#eaeaea] bg-white px-3 text-[13px] font-medium text-black transition-colors hover:bg-gray-50"
            >
              <span className="truncate">Sửa</span>
            </Link>
            <form action={portalAction} className="min-w-0">
              <SubmitButton hasEmail={hasEmail} />
            </form>
            <Link 
              href={`/workspace/training/tuition/create?studentId=${student.id}`}
              className="flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-lg bg-black px-3 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Ghi danh</span>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[#eaeaea] bg-white p-5 hover:border-gray-300 transition-colors">
            <div className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-2">SỐ KHÓA HỌC</div>
            <div className="text-[32px] font-medium tracking-tight text-black">{student.enrollments.length}</div>
          </div>
          <div className="rounded-2xl border border-[#eaeaea] bg-white p-5 hover:border-gray-300 transition-colors">
            <div className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-2">TRẠNG THÁI TÀI KHOẢN</div>
            <div className="text-[32px] font-medium tracking-tight text-black">{student.isActive ? "Hoạt động" : "Tạm khóa"}</div>
          </div>
          <div className="rounded-2xl border border-[#eaeaea] bg-white p-5 hover:border-gray-300 transition-colors">
            <div className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-2">GHI CHÚ</div>
            <div className="text-[15px] font-medium text-black mt-2 leading-relaxed">{student.bio || "Không có ghi chú"}</div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-full">
          <h2 className="text-[20px] font-medium text-black mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gray-400" />
            Khóa đang học
          </h2>
          
          <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
            {student.enrollments.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <BookOpen className="w-8 h-8 text-gray-300 mb-3" />
                <h3 className="text-[14px] font-medium text-black">Chưa ghi danh</h3>
                <p className="text-[13px] text-gray-500 mt-1 mb-4">Học viên chưa được đăng ký vào khóa học nào.</p>
                <Link 
                  href={`/workspace/training/tuition/create?studentId=${student.id}`}
                  className="text-[13px] text-black font-medium hover:underline"
                >
                  Ghi danh ngay
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#eaeaea]">
                {student.enrollments.map((enrollment) => (
                  <Link 
                    key={enrollment.id} 
                    href={`/workspace/training/tuition/${enrollment.id}`} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-gray-50 transition-colors group cursor-pointer"
                  >
                    <div className="mb-4 sm:mb-0">
                      <div className="text-[16px] font-medium text-black group-hover:underline decoration-gray-300 underline-offset-4">{enrollment.course.title}</div>
                      <div className="text-[13px] text-gray-500 mt-1 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                          {enrollment.class?.name || "Chưa xếp lớp"}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(enrollment.createdAt).toLocaleDateString("vi-VN")}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 sm:w-48">
                      <div className="flex-1">
                        <div className="flex justify-between items-center text-[12px] mb-1.5 text-gray-500">
                          <span className="font-medium uppercase">{enrollment.status}</span>
                          <span className="font-medium text-black">{enrollment.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#eaeaea] rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full transition-all", enrollment.progress === 100 ? "bg-emerald-500" : "bg-black")} 
                            style={{ width: `${Math.min(enrollment.progress, 100)}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
