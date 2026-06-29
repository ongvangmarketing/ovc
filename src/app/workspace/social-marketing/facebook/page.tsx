import Link from "next/link";
import { BarChart3, Database, Megaphone, MousePointerClick, Radio, Target, WalletCards } from "lucide-react";
import { requireSocialMarketingAccess } from "@/modules/social-marketing/policy";
import { getSocialMarketingDashboard } from "@/modules/social-marketing/data/dashboard";
import { SocialMarketingTabs } from "../_components/social-marketing-tabs";
import { SocialReportChart } from "../social-report-chart";

const number = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });
const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export default async function FacebookAdsPage() {
  const { organizationId } = await requireSocialMarketingAccess({ provider: "FACEBOOK" });
  const data = await getSocialMarketingDashboard(organizationId);
  const adAccounts = data.assets.filter((asset) => asset.assetType === "AD_ACCOUNT");
  const kpis = [
    ["Tổng chi tiêu", money.format(data.totals.spend), WalletCards],
    ["Tiếp cận", number.format(data.totals.reach), Radio],
    ["Hiển thị", number.format(data.totals.impressions), BarChart3],
    ["Lượt nhấp", number.format(data.totals.clicks), MousePointerClick],
    ["CTR", `${number.format(data.totals.ctr)}%`, Target],
    ["CPC", money.format(data.totals.cpc), Database],
    ["Leads", number.format(data.totals.leads), Megaphone],
    ["ROAS", `${number.format(data.totals.roas)}x`, BarChart3],
  ] as const;

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-6">
      <Header title="Facebook Ads" subtitle="Campaign, Ad Account và hiệu quả quảng cáo đã đồng bộ." />
      <SocialMarketingTabs />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(([label, value, Icon]) => (
          <article key={label} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500"><Icon className="h-4 w-4 text-orange-500" />{label}</div>
            <strong className="mt-2 block text-xl text-gray-950">{value}</strong>
          </article>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-3"><h2 className="font-semibold text-gray-950">Ads performance 30 ngày</h2><p className="text-sm text-gray-500">Chỉ tính insight cấp AD.</p></div>
          <SocialReportChart data={data.daily} />
        </section>
        <aside className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-950">Ad Account</h2>
          <div className="mt-4 space-y-3">
            {adAccounts.map((account) => (
              <article key={account.id} className="rounded-lg border border-gray-100 p-3">
                <p className="font-semibold text-gray-950">{account.name}</p>
                <p className="text-xs text-gray-500">{account.externalId} · {account.currency || "--"} · {account.timezone || "--"}</p>
              </article>
            ))}
            {!adAccounts.length ? <div className="py-8 text-center text-sm text-gray-500">Chưa có Ad Account. Token cần quyền ads_read / ads_management.</div> : null}
          </div>
        </aside>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-gray-950">Campaign gần đây</h2><Link href="/workspace/social-marketing/reports/facebook" className="text-sm font-semibold text-orange-600">Xem báo cáo</Link></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-gray-500"><th className="py-3">Campaign</th><th>Mục tiêu</th><th>Trạng thái</th><th>Ads Account</th></tr></thead>
            <tbody>{data.campaigns.map((campaign) => <tr key={campaign.id} className="border-b border-gray-100"><td className="py-3 font-medium text-gray-950">{campaign.name}</td><td>{campaign.objective || "--"}</td><td>{campaign.status}</td><td>{campaign.adAccountExternalId}</td></tr>)}</tbody>
          </table>
          {!data.campaigns.length ? <div className="py-10 text-center text-sm text-gray-500">Chưa có Campaign. Bấm đồng bộ trong Cài đặt sau khi token đủ quyền Ads.</div> : null}
        </div>
      </section>
    </div>
  );
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Megaphone className="h-5 w-5" /></div>
        <div><h1 className="text-xl font-bold text-gray-950">{title}</h1><p className="text-sm text-gray-500">{subtitle}</p></div>
      </div>
      <Link href="/workspace/social-marketing/settings" className="rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white">Kết nối & cài đặt</Link>
    </header>
  );
}
