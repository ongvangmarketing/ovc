import type { Metadata } from "next";

export const metadata: Metadata = { title: "Khóa học" };

export default function CoursesPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Khóa học</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Quản lý khóa học và đào tạo</p>
        </div>
      </div>
      <div className="empty-state">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-3xl mb-2">🎓</div>
        <h3 className="font-semibold text-foreground">Module đang phát triển</h3>
        <p className="text-sm text-muted-foreground">LMS Module sẽ có trong Phase 2</p>
      </div>
    </div>
  );
}
