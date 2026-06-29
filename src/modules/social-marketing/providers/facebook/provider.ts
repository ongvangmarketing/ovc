import "server-only";

import type { FacebookAssetDiscovery, SocialReportProvider } from "@/modules/social-marketing/core/provider";

type GraphPage<T> = { data?: T[]; paging?: { next?: string }; error?: { message?: string; code?: number } };

function config() {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const version = process.env.FACEBOOK_GRAPH_API_VERSION || "v25.0";
  if (!appId || !appSecret) throw new Error("Chưa cấu hình Facebook App ID và App Secret.");
  return { appId, appSecret, version };
}

async function graphJson<T>(pathOrUrl: string, accessToken: string, params?: Record<string, string>) {
  const version = process.env.FACEBOOK_GRAPH_API_VERSION || "v25.0";
  const url = pathOrUrl.startsWith("https://")
    ? new URL(pathOrUrl)
    : new URL(`https://graph.facebook.com/${version}/${pathOrUrl.replace(/^\//, "")}`);
  for (const [key, value] of Object.entries(params || {})) url.searchParams.set(key, value);
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const body = (await response.json()) as T & { error?: { message?: string; code?: number } };
  if (!response.ok || body.error) {
    throw new Error(`Facebook API: ${body.error?.message || `HTTP ${response.status}`}`);
  }
  return body;
}

async function allPages<T>(path: string, accessToken: string, params: Record<string, string>) {
  const rows: T[] = [];
  let next: string | undefined = path;
  let first = true;
  while (next && rows.length < 5000) {
    const page: GraphPage<T> = await graphJson<GraphPage<T>>(next, accessToken, first ? params : undefined);
    rows.push(...(page.data || []));
    next = page.paging?.next;
    first = false;
  }
  return rows;
}

export const facebookProvider: SocialReportProvider = {
  code: "FACEBOOK",
  async exchangeAuthorizationCode(code, redirectUri) {
    const { appId, appSecret, version } = config();
    const url = new URL(`https://graph.facebook.com/${version}/oauth/access_token`);
    url.searchParams.set("client_id", appId);
    url.searchParams.set("client_secret", appSecret);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("code", code);
    const response = await fetch(url, { cache: "no-store" });
    const body = (await response.json()) as { access_token?: string; expires_in?: number; error?: { message?: string } };
    if (!response.ok || !body.access_token) throw new Error(`Facebook OAuth: ${body.error?.message || "Không nhận được access token."}`);
    return {
      accessToken: body.access_token,
      expiresAt: body.expires_in ? new Date(Date.now() + body.expires_in * 1000) : undefined,
    };
  },
  async discoverAssets(accessToken): Promise<FacebookAssetDiscovery> {
    const user = await graphJson<{ id: string; name: string }>("me", accessToken, { fields: "id,name" });
    const pages = await allPages<{
      id: string; name: string; category?: string; link?: string; fan_count?: number;
      followers_count?: number; picture?: { data?: { url?: string } };
    }>("me/accounts", accessToken, { fields: "id,name,category,link,fan_count,followers_count,picture.type(square)", limit: "100" }).catch(() => []);
    const adAccounts = await allPages<{
      id: string; account_id?: string; name: string; currency?: string;
      timezone_name?: string; account_status?: number;
    }>("me/adaccounts", accessToken, { fields: "id,account_id,name,currency,timezone_name,account_status", limit: "100" }).catch(() => []);
    return {
      user,
      pages: pages.map((page) => ({
        id: page.id, name: page.name, category: page.category, link: page.link,
        followers: page.followers_count, likes: page.fan_count, pictureUrl: page.picture?.data?.url,
      })),
      adAccounts: adAccounts.map((account) => ({
        id: account.id, accountId: account.account_id, name: account.name,
        currency: account.currency, timezone: account.timezone_name, status: account.account_status,
      })),
    };
  },
};

export { allPages, graphJson };
