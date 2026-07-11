export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Super Admin Sidebar placeholder */}
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Super Admin</h2>
        <nav className="space-y-2">
          <div>Dashboard</div>
          <div>Organizations</div>
          <div>Admins</div>
          <div>Subscription</div>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
