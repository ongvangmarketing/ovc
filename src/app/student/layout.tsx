export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-orange-900 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Student Portal</h2>
        <nav className="space-y-2">
          <div>Dashboard</div>
          <div>Khóa học của tôi</div>
          <div>Lịch học</div>
          <div>Bài tập</div>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
