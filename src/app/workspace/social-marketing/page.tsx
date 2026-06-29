import Link from "next/link";
import { BarChart3, Database, FileText, Megaphone, MousePointerClick, Radio, Target, ThumbsUp, WalletCards } from "lucide-react";
import { requireSocialMarketingAccess } from "@/modules/social-marketing/policy";
import { getSocialMarketingDashboard } from "@/modules/social-marketing/data/dashboard";
import { SocialMarketingTabs } from "./_components/social-marketing-tabs";
import { SocialReportChart } from "./social-report-chart";

const number = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });
const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export default async function SocialMarketingPage() {
  const { organizationId } = await requireSocialMarketingAccess({ provider: "FACEBOOK" });
  const data = await getSocialMarketingDashboard(organizationId);
  const pageCount = data.assets.filter((x) => x.assetType === "PAGE").length;
  const adAccountCount = data.assets.filter((x) => x.assetType === "AD_ACCOUNT").length;
  const hasConnection = data.connections.length > 0;
  const hasReportSource = pageCount > 0 || adAccountCount > 0;
  const kpis = [
    ["Tổng chi tiêu", money.format(data.totals.spend), WalletCards],
    ["Tiếp cận", number.format(data.totals.reach), Radio],
    ["Hiển thị", number.format(data.totals.impressions), BarChart3],
    ["Lượt nhấp", number.format(data.totals.clicks), MousePointerClick],
    ["CTR", `${number.format(data.totals.ctr)}%`, Target],
    ["CPC", money.format(data.totals.cpc), Database],
    ["Khách hàng tiềm năng", number.format(data.totals.leads), Megaphone],
    ["ROAS", `${number.format(data.totals.roas)}x`, BarChart3],
  ] as const;

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Megaphone className="h-5 w-5" /></div>
          <div><h1 className="text-xl font-bold text-gray-950">Social Marketing</h1><p className="text-sm text-gray-500">Báo cáo Facebook từ dữ liệu đã đồng bộ</p></div>
        </div>
        <div className="flex gap-2">
          <Link href="/workspace/social-marketing/reports/facebook/sync-logs" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">Lịch sử đồng bộ</Link>
          <Link href="/workspace/social-marketing/settings" className="rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white">Kết nối & cài đặt</Link>
        </div>
      </header>
      <SocialMarketingTabs />

      {!hasConnection ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong className="block text-base">Chưa kết nối Facebook</strong>
          <p className="mt-1">Bấm Kết nối Facebook để liên kết tài khoản trước, sau đó chọn Fanpage hoặc Ads Account cần lấy số liệu.</p>
          <Link href="/workspace/social-marketing/settings" className="mt-3 inline-flex rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white">Đi tới kết nối</Link>
        </section>
      ) : !hasReportSource ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong className="block text-base">Đã kết nối tài khoản, nhưng chưa có nguồn dữ liệu báo cáo</strong>
          <p className="mt-1">App Meta hiện chỉ cấp quyền cơ bản nên hệ thống chưa lấy được Fanpage, Ads Account, Campaign và chỉ số quảng cáo thật. Cần bật quyền Fanpage/Ads trong Meta App rồi kết nối lại.</p>
          <Link href="/workspace/social-marketing/settings" className="mt-3 inline-flex rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white">Kiểm tra cấu hình</Link>
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(([label, value, Icon]) => <article key={label} className="rounded-lg border border-gray-200 bg-white p-4"><div className="flex items-center gap-2 text-sm text-gray-500"><Icon className="h-4 w-4 text-orange-500" />{label}</div><strong className="mt-2 block text-xl text-gray-950">{value}</strong></article>)}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-lg border border-gray-200 bg-white p-5"><div className="mb-3"><h2 className="font-semibold text-gray-950">Hiệu quả 30 ngày gần nhất</h2><p className="text-sm text-gray-500">Di chuột lên biểu đồ để xem số liệu từng ngày.</p></div><SocialReportChart data={data.daily} /></section>
        <aside className="rounded-lg border border-gray-200 bg-white p-5"><h2 className="font-semibold text-gray-950">Trạng thái dữ liệu</h2><dl className="mt-4 space-y-3 text-sm"><Row label="Kết nối" value={data.connections.length} /><Row label="Fanpage" value={pageCount} /><Row label="Ads Account" value={adAccountCount} /><Row label="Campaign" value={data.campaigns.length} /></dl>{!data.connections.length ? <Link href="/workspace/social-marketing/settings" className="mt-5 block rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white">Kết nối Facebook</Link> : null}</aside>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-lg border border-gray-200 bg-white p-4"><div className="flex items-center gap-2 text-sm text-gray-500"><Radio className="h-4 w-4 text-blue-500" />Page Reach</div><strong className="mt-2 block text-xl text-gray-950">{number.format(data.pageTotals.reach)}</strong></article>
        <article className="rounded-lg border border-gray-200 bg-white p-4"><div className="flex items-center gap-2 text-sm text-gray-500"><BarChart3 className="h-4 w-4 text-blue-500" />Page Impressions</div><strong className="mt-2 block text-xl text-gray-950">{number.format(data.pageTotals.impressions)}</strong></article>
        <article className="rounded-lg border border-gray-200 bg-white p-4"><div className="flex items-center gap-2 text-sm text-gray-500"><ThumbsUp className="h-4 w-4 text-blue-500" />Page Engagements</div><strong className="mt-2 block text-xl text-gray-950">{number.format(data.pageTotals.engagements)}</strong></article>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-gray-950">Fanpage đã kết nối</h2><Link href="/workspace/social-marketing/settings" className="text-sm font-semibold text-orange-600">Cài đặt</Link></div><div className="space-y-3">{data.assets.filter((asset) => asset.assetType === "PAGE").map((page) => <article key={page.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-3"><div className="min-w-0"><p className="truncate font-semibold text-gray-950">{page.name}</p><p className="text-xs text-gray-500">Page ID: {page.externalId}</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{page.selected ? "Đang lấy dữ liệu" : "Tắt"}</span></article>)}{!data.assets.filter((asset) => asset.assetType === "PAGE").length ? <div className="py-8 text-center text-sm text-gray-500">Chưa có Fanpage. Token cần quyền pages_show_list / pages_read_engagement.</div> : null}</div></section>
        <section className="rounded-lg border border-gray-200 bg-white p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-gray-950">Bài viết Page gần đây</h2><FileText className="h-4 w-4 text-gray-400" /></div><div className="space-y-3">{data.posts.map((post) => <article key={post.id} className="rounded-lg border border-gray-100 p-3"><p className="line-clamp-2 text-sm font-medium text-gray-950">{post.caption || "Bài viết không có caption"}</p><div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500"><span>{post.publishedAt?.toLocaleString("vi-VN") || "Chưa rõ ngày"}</span>{post.permalinkUrl ? <a href={post.permalinkUrl} target="_blank" rel="noreferrer" className="font-semibold text-blue-600">Mở bài viết</a> : null}</div></article>)}{!data.posts.length ? <div className="py-8 text-center text-sm text-gray-500">Chưa đồng bộ bài viết Page.</div> : null}</div></section>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-gray-950">Campaign gần đây</h2><Link href="/workspace/social-marketing/reports/facebook" className="text-sm font-semibold text-orange-600">Xem báo cáo</Link></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-gray-500"><th className="py-3">Campaign</th><th>Mục tiêu</th><th>Trạng thái</th><th>Ads Account</th></tr></thead><tbody>{data.campaigns.map((campaign) => <tr key={campaign.id} className="border-b border-gray-100"><td className="py-3 font-medium text-gray-950">{campaign.name}</td><td>{campaign.objective || "--"}</td><td>{campaign.status}</td><td>{campaign.adAccountExternalId}</td></tr>)}</tbody></table>{!data.campaigns.length ? <div className="py-10 text-center text-sm text-gray-500">Kết nối và đồng bộ Facebook để xem Campaign.</div> : null}</div></section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) { return <div className="flex justify-between border-b border-gray-100 pb-2"><dt className="text-gray-500">{label}</dt><dd className="font-semibold text-gray-950">{value}</dd></div>; }
