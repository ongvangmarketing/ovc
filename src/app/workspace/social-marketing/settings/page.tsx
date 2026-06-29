import { KeyRound, Megaphone, RefreshCw, ShieldCheck, Unplug } from "lucide-react";
import { connectFacebookTokenAction, disconnectFacebookAction, syncFacebookReportAction } from "@/app/actions/social-marketing";
import { getSocialMarketingDashboard } from "@/modules/social-marketing/data/dashboard";
import { requireSocialMarketingAccess } from "@/modules/social-marketing/policy";

export default async function SocialMarketingSettingsPage({ searchParams }: { searchParams: Promise<{ connected?: string; error?: string }> }) {
  const query = await searchParams;
  const { organizationId } = await requireSocialMarketingAccess({ provider: "FACEBOOK" });
  const data = await getSocialMarketingDashboard(organizationId);
  const configured = Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);
  const oauthScopes = process.env.FACEBOOK_OAUTH_SCOPES || "public_profile";
  const hasMarketingScopes = ["pages_show_list", "ads_read", "business_management"].some((scope) => oauthScopes.includes(scope));
  const hasConnectionWithoutAssets = data.connections.length > 0 && !data.assets.length;
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const monthAgo = new Date(now.getTime() - 29 * 86400000).toISOString().slice(0, 10);

  return <div className="mx-auto max-w-5xl space-y-5 p-6">
    <header className="rounded-lg border border-gray-200 bg-white p-5"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Megaphone className="h-5 w-5" /></div><div><h1 className="text-xl font-bold">Kết nối Facebook</h1><p className="text-sm text-gray-500">Kết nối tài khoản để chọn Fanpage và Ads Account cần báo cáo.</p></div></div></header>
    {query.connected ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">Đã kết nối Facebook. Nếu chưa thấy Fanpage hoặc Ads Account, cần bật thêm quyền dữ liệu trong Meta App.</div> : null}
    {query.error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">Không thể kết nối: {query.error === "facebook-config" ? "Chưa cấu hình Meta App." : query.error}</div> : null}
    <section className="rounded-lg border border-gray-200 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-semibold">Meta for Developers</h2><p className="mt-1 text-sm text-gray-500">App ID và App Secret chỉ được đọc ở máy chủ. Access Token được mã hóa trước khi lưu.</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${configured ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{configured ? "Đã cấu hình" : "Chưa có App ID / Secret"}</span></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><Info icon={KeyRound} label="Token" value="AES-256-GCM" /><Info icon={ShieldCheck} label="Quyền dữ liệu" value={hasMarketingScopes ? "Fanpage / Ads" : "Cơ bản"} /><Info icon={RefreshCw} label="Chế độ" value="Đồng bộ thủ công" /></div><div className="mt-5 flex flex-wrap gap-2"><a href="/api/social-marketing/oauth/facebook/start" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"><Megaphone className="h-4 w-4" />Kết nối OAuth</a></div>{!configured ? <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Cần tạo Meta Developer App và lưu App ID / App Secret trước lần kết nối OAuth. Callback URL: <strong>/api/social-marketing/oauth/facebook/callback</strong></p> : null}{hasConnectionWithoutAssets ? <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Tài khoản Facebook đã kết nối, nhưng app Meta hiện chỉ cấp quyền cơ bản nên chưa lấy được Fanpage, Ads Account và số liệu quảng cáo thật.</p> : null}</section>
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">Kết nối bằng Access Token</h2>
          <p className="mt-1 text-sm text-gray-500">Dùng khi bạn tạo token ở Graph API Explorer. Token sẽ được mã hóa AES-256-GCM trước khi lưu.</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Manual</span>
      </div>
      <form action={connectFacebookTokenAction} className="mt-4 space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Access Token mới</span>
          <textarea name="accessToken" required rows={4} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="Dán token mới sau khi đã revoke token cũ..." />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-500">Không dùng lại token đã dán vào chat. Hãy generate token mới trước khi lưu.</p>
          <button className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white"><ShieldCheck className="h-4 w-4" />Lưu & kiểm tra</button>
        </div>
      </form>
    </section>
    <section className="rounded-lg border border-gray-200 bg-white p-5"><h2 className="font-semibold">Tài khoản đã kết nối</h2><div className="mt-4 space-y-3">{data.connections.map((connection) => <article key={connection.id} className="rounded-lg border border-gray-200 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><strong>{connection.displayName || "Facebook Account"}</strong><p className="text-sm text-gray-500">{connection.status} · Đồng bộ gần nhất: {connection.lastSyncAt?.toLocaleString("vi-VN") || "Chưa đồng bộ"}</p></div><div className="flex gap-2"><form action={syncFacebookReportAction.bind(null, connection.id)} className="flex flex-wrap gap-2"><input type="date" name="dateFrom" defaultValue={monthAgo} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" /><input type="date" name="dateTo" defaultValue={today} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" /><button className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white"><RefreshCw className="h-4 w-4" />Đồng bộ ngay</button></form><form action={disconnectFacebookAction.bind(null, connection.id)}><button title="Ngắt kết nối" className="rounded-lg border border-red-200 p-2 text-red-600"><Unplug className="h-4 w-4" /></button></form></div></div></article>)}{!data.connections.length ? <div className="rounded-lg bg-gray-50 py-10 text-center text-sm text-gray-500">Chưa có tài khoản Facebook nào được kết nối.</div> : null}</div></section>
  </div>;
}

function Info({ icon: Icon, label, value }: { icon: typeof KeyRound; label: string; value: string }) { return <div className="rounded-lg border border-gray-100 bg-gray-50 p-3"><Icon className="h-4 w-4 text-orange-500" /><span className="mt-2 block text-xs text-gray-500">{label}</span><strong className="text-sm">{value}</strong></div>; }
