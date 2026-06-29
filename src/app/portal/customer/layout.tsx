export default function CustomerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Customer Sidebar */}
      <aside className="w-[220px] flex-shrink-0 border-r border-border bg-card flex flex-col">
        <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">OV</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground leading-none">Ong Vàng</p>
            <p className="text-[10px] text-muted-foreground">Customer Portal</p>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {[
            { href: "/portal/customer/dashboard", label: "Tổng quan", emoji: "📊" },
            { href: "/portal/customer/projects", label: "Dự án của tôi", emoji: "📁" },
            { href: "/portal/customer/invoices", label: "Hóa đơn", emoji: "🧾" },
            { href: "/portal/customer/files", label: "Tệp tin", emoji: "📎" },
            { href: "/portal/customer/support", label: "Hỗ trợ", emoji: "💬" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
