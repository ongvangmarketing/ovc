import Link from "next/link";
import { BarChart3, FileText, Megaphone, Radio, RefreshCw, ThumbsUp } from "lucide-react";
import { syncFacebookReportAction } from "@/app/actions/social-marketing";
import { requireSocialMarketingAccess } from "@/modules/social-marketing/policy";
import { getSocialMarketingDashboard } from "@/modules/social-marketing/data/dashboard";
import { SocialMarketingTabs } from "../_components/social-marketing-tabs";

const number = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });

export default async function FacebookPageReportPage() {
  const { organizationId } = await requireSocialMarketingAccess({ provider: "FACEBOOK" });
  const data = await getSocialMarketingDashboard(organizationId);
  const pages = data.assets.filter((asset) => asset.assetType === "PAGE");
  const today = new Date();
  const dateTo = today.toISOString().slice(0, 10);
  const dateFromValue = new Date(today.getTime() - 29 * 86400000).toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-6">
      <Header />
      <SocialMarketingTabs />

      <section className="grid gap-3 sm:grid-cols-3">
        <Kpi icon={Radio} label="Page Reach" value={number.format(data.pageTotals.reach)} />
        <Kpi icon={BarChart3} label="Page Impressions" value={number.format(data.pageTotals.impressions)} />
        <Kpi icon={ThumbsUp} label="Page Engagements" value={number.format(data.pageTotals.engagements)} />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div><h2 className="font-semibold text-gray-950">Fanpage đã kết nối</h2><p className="text-sm text-gray-500">Danh sách Page lấy được từ token hiện tại.</p></div>
            <Link href="/workspace/social-marketing/settings" className="text-sm font-semibold text-orange-600">Cài đặt</Link>
          </div>
          <div className="space-y-3">
            {pages.map((page) => (
              <article key={page.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-950">{page.name}</p>
                  <p className="text-xs text-gray-500">Page ID: {page.externalId}</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{page.selected ? "Đang lấy dữ liệu" : "Tắt"}</span>
              </article>
            ))}
            {!pages.length ? <div className="py-10 text-center text-sm text-gray-500">Chưa có Fanpage. Token cần quyền pages_show_list / pages_read_engagement.</div> : null}
          </div>
        </section>

        <aside className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-950">Đồng bộ Page</h2>
          <p className="mt-1 text-sm text-gray-500">Nếu đã thấy Page nhưng KPI còn 0, hãy đồng bộ để lấy posts và page insights.</p>
          <div className="mt-4 space-y-3">
            {data.connections.map((connection) => (
              <form key={connection.id} action={syncFacebookReportAction.bind(null, connection.id)} className="rounded-lg border border-gray-100 p-3">
                <p className="font-semibold text-gray-950">{connection.displayName || "Facebook Account"}</p>
                <p className="text-xs text-gray-500">Đồng bộ gần nhất: {connection.lastSyncAt?.toLocaleString("vi-VN") || "Chưa đồng bộ"}</p>
                <div className="mt-3 grid gap-2">
                  <input type="date" name="dateFrom" defaultValue={dateFromValue} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                  <input type="date" name="dateTo" defaultValue={dateTo} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                  <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white"><RefreshCw className="h-4 w-4" />Đồng bộ Page/Ads</button>
                </div>
              </form>
            ))}
          </div>
        </aside>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-gray-950">Bài viết Page gần đây</h2><FileText className="h-4 w-4 text-gray-400" /></div>
        <div className="grid gap-3 md:grid-cols-2">
          {data.posts.map((post) => (
            <article key={post.id} className="rounded-lg border border-gray-100 p-4">
              <p className="line-clamp-3 text-sm font-medium text-gray-950">{post.caption || "Bài viết không có caption"}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                <span>{post.publishedAt?.toLocaleString("vi-VN") || "Chưa rõ ngày"}</span>
                {post.permalinkUrl ? <a href={post.permalinkUrl} target="_blank" rel="noreferrer" className="font-semibold text-blue-600">Mở bài viết</a> : null}
              </div>
            </article>
          ))}
        </div>
        {!data.posts.length ? <div className="py-10 text-center text-sm text-gray-500">Chưa đồng bộ bài viết Page.</div> : null}
      </section>
    </div>
  );
}

function Header() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Megaphone className="h-5 w-5" /></div>
        <div><h1 className="text-xl font-bold text-gray-950">Facebook Page</h1><p className="text-sm text-gray-500">Fanpage, bài viết và chỉ số tương tác Page.</p></div>
      </div>
      <Link href="/workspace/social-marketing/settings" className="rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white">Kết nối & cài đặt</Link>
    </header>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: typeof Radio; label: string; value: string }) {
  return <article className="rounded-lg border border-gray-200 bg-white p-4"><div className="flex items-center gap-2 text-sm text-gray-500"><Icon className="h-4 w-4 text-blue-500" />{label}</div><strong className="mt-2 block text-xl text-gray-950">{value}</strong></article>;
}
