import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CircleAlert,
  CreditCard,
  FileText,
  FolderKanban,
  LayoutDashboard,
  MapPin,
  ReceiptText,
  UserCircle2,
} from "lucide-react";

import {
  formatCurrency,
  formatDate,
  getCustomerPortalData,
  progressFromTasks,
  statusLabel,
} from "./portal-data";

export default async function CustomerPortalPage() {
  const data = await getCustomerPortalData();

  if (!data.contact) {
    return (
      <div className="mx-auto max-w-[1440px] px-6 py-8 animate-in fade-in duration-500">
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <UserCircle2 className="mb-4 h-12 w-12 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900">Không tìm thấy thông tin khách hàng</h3>
          <p className="mt-1 text-sm text-slate-500">Email của bạn ({data.session.user.email}) chưa được liên kết với hồ sơ khách hàng nào.</p>
        </div>
      </div>
    );
  }

  const { contact, customerName, projects, tasks, quotations, contracts, invoices, totals } = data;
  const focusProject = projects[0]; // The most recent active project

  const pendingInvoices = invoices.filter(inv => inv.amountDue && Number(inv.amountDue) > 0);
  const recentDocs = [...contracts, ...quotations].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5);

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8 animate-in fade-in duration-500">
      
      {/* Enterprise SaaS Header (Instructor Style) */}
      <header className="mb-8 flex flex-col justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm lg:flex-row lg:items-center">
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-4 ring-blue-50/50">
            <Building2 className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Chào mừng, {customerName}!</h1>
            <p className="mt-1 text-sm text-slate-500">Mã KH: {contact.id.slice(-3).toUpperCase()} · {contact.email || data.session.user.email}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
              <span className="flex items-center gap-1.5"><FolderKanban className="h-4 w-4 text-blue-500" /> {projects.length} Dự án</span>
              <span className="flex items-center gap-1.5"><ReceiptText className="h-4 w-4 text-orange-500" /> {totals.openTasks} Task chờ</span>
              <span className="flex items-center gap-1.5"><CircleAlert className="h-4 w-4 text-red-500" /> Nợ: {formatCurrency(totals.totalDue)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Link href="/customer/projects" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 transition-all hover:bg-slate-50">
            <FolderKanban className="h-4 w-4" /> Dự án
          </Link>
          <Link href="/customer/finance" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:ring-4 focus:ring-blue-100">
            <CreditCard className="h-4 w-4" /> Tài chính
          </Link>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        
        {/* Main Content Column */}
        <div className="space-y-8">
          
          {/* Active Project Section */}
          {focusProject ? (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Dự án ưu tiên</h2>
                <Link href="/customer/projects" className="text-sm font-medium text-blue-600 hover:text-blue-700">Xem tất cả</Link>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="inline-block rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 uppercase tracking-wider">{statusLabel(focusProject.status)}</span>
                    <h3 className="mt-3 text-xl font-bold text-slate-900">{focusProject.name}</h3>
                    <p className="mt-2 text-sm text-slate-500 line-clamp-2">{focusProject.description || "Không có mô tả dự án"}</p>
                  </div>
                  <Link href={`/customer/projects/${focusProject.id}`} className="shrink-0 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                    Chi tiết <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <div className="text-xs font-medium text-slate-500 mb-1">Ngày bắt đầu</div>
                    <div className="text-sm font-bold text-slate-900">{formatDate(focusProject.startDate)}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <div className="text-xs font-medium text-slate-500 mb-1">Hạn chót</div>
                    <div className="text-sm font-bold text-slate-900">{formatDate(focusProject.dueDate)}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <div className="text-xs font-medium text-slate-500 mb-1">Nhiệm vụ</div>
                    <div className="text-xl font-bold text-slate-900">{focusProject.tasks.length}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <div className="text-xs font-medium text-slate-500 mb-1">Tiến độ</div>
                    <div className="text-xl font-bold text-emerald-600">{progressFromTasks(focusProject.tasks)}%</div>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <FolderKanban className="mb-4 h-12 w-12 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900">Chưa có dự án nào</h3>
              <p className="mt-1 text-sm text-slate-500">Bạn chưa có dự án nào đang hoạt động.</p>
            </div>
          )}

          {/* Running Projects */}
          {projects.length > 1 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Các dự án khác</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {projects.slice(1).map((project) => (
                  <Link key={project.id} href={`/customer/projects/${project.id}`} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 line-clamp-1">{project.name}</h3>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5 uppercase font-medium">{statusLabel(project.status)}</span>
                      <span className="flex items-center gap-1.5"><ReceiptText className="h-3.5 w-3.5" /> {project.tasks.length} task</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-500">Tiến độ</span>
                      <span className="text-emerald-600">{progressFromTasks(project.tasks)}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progressFromTasks(project.tasks)}%` }} />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* Pending Invoices */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CircleAlert className="h-5 w-5 text-red-500" />
                <h2 className="font-semibold text-slate-900">Cần thanh toán</h2>
              </div>
              {pendingInvoices.length > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">{pendingInvoices.length}</span>
              )}
            </div>
            <div className="space-y-4">
              {pendingInvoices.length > 0 ? pendingInvoices.slice(0, 3).map((item) => (
                <Link key={item.id} href={item.token ? `/document/${item.token}` : "/customer/finance"} className="group relative block pl-4">
                  <div className="absolute bottom-0 left-0 top-1 w-[2px] rounded-full bg-slate-200 group-hover:bg-red-500 transition-colors" />
                  <div className="absolute left-[-3px] top-1.5 h-2 w-2 rounded-full border-2 border-white bg-slate-300 group-hover:bg-red-500 transition-colors" />
                  <h3 className="font-medium text-slate-900 group-hover:text-red-600 transition-colors">{item.number}</h3>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                    <span>Hạn: {item.dueDate ? formatDate(item.dueDate) : "Không có"}</span>
                    <span className="font-bold text-red-600">{formatCurrency(item.amountDue)}</span>
                  </div>
                </Link>
              )) : (
                <div className="text-sm text-slate-500 text-center py-4">Tuyệt vời, không có khoản nợ nào!</div>
              )}
            </div>
          </div>

          {/* Recent Documents */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 pb-4 border-b border-slate-100">
              <FileText className="h-5 w-5 text-slate-400" />
              <h2 className="font-semibold text-slate-900">Tài liệu mới nhất</h2>
            </div>
            <div className="space-y-3">
              {recentDocs.length > 0 ? recentDocs.map((item: any) => (
                <Link key={item.id} href={item.token ? `/document/${item.token}` : "/customer/finance"} className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900 line-clamp-1">{item.title || item.number}</h3>
                    <p className="mt-1 text-[11px] text-slate-500">{formatDate(item.createdAt)}</p>
                  </div>
                  <div className="shrink-0 pt-0.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.status === 'SIGNED' || item.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {statusLabel(item.status)}
                    </span>
                  </div>
                </Link>
              )) : (
                <div className="text-sm text-slate-500 text-center py-4">Chưa có tài liệu nào</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
