import Link from "next/link";
import { requireInstructorPortal } from "@/lib/auth/rbac";
import { InstructorService } from "@/modules/training/services/instructor.service";
import { AlertTriangle, TrendingDown, TrendingUp, Users } from "lucide-react";
import { AnalyticsDashboard } from "./components/analytics-dashboard";

export default async function InstructorAnalyticsPage() {
  const session = await requireInstructorPortal();
  
  // 1. Fetch all enrollments for this instructor's courses
  const enrollments = await InstructorService.getAnalytics(session.organizationId!, session.user.id);

  // Calculate some aggregate stats
  const totalStudents = enrollments.length;
  const avgProgress = totalStudents > 0 
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / totalStudents)
    : 0;
  
  const atRiskStudents = enrollments.filter(e => e.progress < 20); // arbitrary logic for "at-risk"
  const topStudents = enrollments.filter(e => e.progress > 80);

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8 animate-in fade-in duration-500">
      
      <header className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Phân tích Học tập (Analytics)</h1>
          <p className="mt-1 text-sm text-slate-500">Theo dõi tiến độ, phát hiện học viên có nguy cơ và phân tích rớt môn.</p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Tổng Học viên</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalStudents}</h3>
            </div>
          </div>
        </div>
        
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Tiến độ Trung bình</p>
              <h3 className="text-2xl font-bold text-slate-900">{avgProgress}%</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-orange-500/20">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Học viên Nguy cơ</p>
              <h3 className="text-2xl font-bold text-orange-600">{atRiskStudents.length}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Tỉ lệ bỏ cuộc (ước tính)</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {totalStudents > 0 ? Math.round((atRiskStudents.length / totalStudents) * 100) : 0}%
              </h3>
            </div>
          </div>
        </div>
      </div>

      <AnalyticsDashboard 
        enrollments={enrollments} 
        atRiskCount={atRiskStudents.length} 
      />
      
    </div>
  );
}
