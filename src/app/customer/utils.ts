export function formatCurrency(amount: number) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount); }
export function formatDate(date: string | Date | undefined) { if (!date) return '—'; return new Date(date).toLocaleDateString('vi-VN'); }
export function statusClass(status: string) {
  if (['PAID', 'COMPLETED', 'DONE', 'ACTIVE', 'APPROVED'].includes(status)) return 'bg-emerald-100 text-emerald-700';
  if (['OVERDUE', 'CANCELLED', 'REJECTED'].includes(status)) return 'bg-red-100 text-red-700';
  if (['IN_PROGRESS', 'SENT', 'IN_REVIEW'].includes(status)) return 'bg-blue-100 text-blue-700';
  return 'bg-slate-100 text-slate-700';
}
export function statusLabel(status: string) {
  const map: Record<string, string> = {
    PAID: 'Đã thanh toán', OVERDUE: 'Quá hạn', DRAFT: 'Nháp', SENT: 'Đã gửi',
    COMPLETED: 'Hoàn thành', DONE: 'Đã xong', IN_PROGRESS: 'Đang làm',
    IN_REVIEW: 'Chờ duyệt', TODO: 'Cần làm', ACTIVE: 'Hoạt động'
  };
  return map[status] || status;
}

export function progressFromTasks(tasks: Array<{ status: string }>) {
  if (!tasks?.length) return 0;
  return Math.round((tasks.filter((task) => task.status === "DONE" || task.status === "COMPLETED").length / tasks.length) * 100);
}
