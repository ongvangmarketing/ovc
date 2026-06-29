export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-blue-900 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Customer Portal</h2>
        <nav className="space-y-2">
          <div>Dashboard</div>
          <div>Dự án</div>
          <div>Báo giá</div>
          <div>Hóa đơn</div>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
