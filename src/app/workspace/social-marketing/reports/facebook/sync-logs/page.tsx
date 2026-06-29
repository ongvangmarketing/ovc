import Link from "next/link";
import { requireSocialMarketingAccess } from "@/modules/social-marketing/policy";
import { getSocialMarketingDashboard } from "@/modules/social-marketing/data/dashboard";

export default async function FacebookSyncLogsPage() {
  const { organizationId } = await requireSocialMarketingAccess({ provider: "FACEBOOK" });
  const data = await getSocialMarketingDashboard(organizationId);
  return <div className="mx-auto max-w-6xl space-y-5 p-6"><header className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-5"><div><h1 className="text-xl font-bold">Lịch sử đồng bộ Facebook</h1><p className="text-sm text-gray-500">Theo dõi số bản ghi và lỗi đã được làm sạch thông tin nhạy cảm.</p></div><Link href="/workspace/social-marketing/settings" className="rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white">Cài đặt đồng bộ</Link></header><section className="overflow-hidden rounded-lg border border-gray-200 bg-white"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-left text-gray-500"><tr><th className="px-4 py-3">Thời gian</th><th>Chế độ</th><th>Trạng thái</th><th>Thành công</th><th>Thất bại</th><th>Lỗi</th></tr></thead><tbody>{data.recentLogs.map((log) => <tr key={log.id} className="border-t border-gray-100"><td className="px-4 py-3">{log.createdAt.toLocaleString("vi-VN")}</td><td>{log.mode}</td><td><span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold">{log.status}</span></td><td>{log.successRecords}</td><td>{log.failedRecords}</td><td className="max-w-xs truncate text-red-600">{log.errorMessage || "--"}</td></tr>)}</tbody></table>{!data.recentLogs.length ? <div className="py-12 text-center text-sm text-gray-500">Chưa có lần đồng bộ nào.</div> : null}</div></section></div>;
}

