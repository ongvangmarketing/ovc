import "server-only";

import { db } from "@/lib/db";

export async function getSocialMarketingDashboard(organizationId: string, days = 30) {
  const dateTo = new Date();
  const dateFrom = new Date();
  dateFrom.setUTCDate(dateFrom.getUTCDate() - Math.max(1, Math.min(days, 365)) + 1);
  dateFrom.setUTCHours(0, 0, 0, 0);

  const [insights, pageInsights, connections, assets, campaigns, posts, recentLogs] = await Promise.all([
    db.socialInsight.findMany({
      where: { organizationId, provider: "FACEBOOK", entityType: "AD", dateStart: { gte: dateFrom }, dateStop: { lte: dateTo }, deletedAt: null },
      orderBy: { dateStart: "asc" },
      select: { dateStart: true, spend: true, reach: true, impressions: true, clicks: true, leads: true, purchases: true, purchaseValue: true },
    }),
    db.socialInsight.findMany({
      where: { organizationId, provider: "FACEBOOK", entityType: "PAGE", dateStart: { gte: dateFrom }, dateStop: { lte: dateTo }, deletedAt: null },
      orderBy: { dateStart: "asc" },
      select: { dateStart: true, reach: true, impressions: true, clicks: true },
    }),
    db.socialProviderConnection.findMany({
      where: { organizationId, provider: "FACEBOOK", deletedAt: null },
      orderBy: { connectedAt: "desc" },
      select: { id: true, displayName: true, status: true, connectedAt: true, lastSyncAt: true, nextSyncAt: true, tokenExpiresAt: true },
    }),
    db.socialProviderAsset.findMany({
      where: { organizationId, provider: "FACEBOOK", deletedAt: null },
      orderBy: [{ assetType: "asc" }, { name: "asc" }],
      select: { id: true, assetType: true, externalId: true, name: true, avatarUrl: true, selected: true, currency: true, timezone: true },
    }),
    db.socialCampaign.findMany({
      where: { organizationId, provider: "FACEBOOK", deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: { id: true, name: true, objective: true, status: true, adAccountExternalId: true },
    }),
    db.socialPost.findMany({
      where: { organizationId, provider: "FACEBOOK", deletedAt: null },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 8,
      select: { id: true, pageExternalId: true, externalId: true, caption: true, permalinkUrl: true, publishedAt: true },
    }),
    db.socialMarketingSyncLog.findMany({
      where: { organizationId, provider: "FACEBOOK", deletedAt: null },
      orderBy: { createdAt: "desc" }, take: 10,
      select: { id: true, status: true, mode: true, scope: true, totalRecords: true, successRecords: true, failedRecords: true, errorMessage: true, startedAt: true, completedAt: true, createdAt: true },
    }),
  ]);

  const totals = insights.reduce((sum, row) => ({
    spend: sum.spend + Number(row.spend),
    reach: sum.reach + Number(row.reach),
    impressions: sum.impressions + Number(row.impressions),
    clicks: sum.clicks + Number(row.clicks),
    leads: sum.leads + Number(row.leads),
    purchases: sum.purchases + Number(row.purchases),
    purchaseValue: sum.purchaseValue + Number(row.purchaseValue),
  }), { spend: 0, reach: 0, impressions: 0, clicks: 0, leads: 0, purchases: 0, purchaseValue: 0 });

  const daily = new Map<string, { date: string; spend: number; reach: number; impressions: number; clicks: number; leads: number }>();
  for (const row of insights) {
    const key = row.dateStart.toISOString().slice(0, 10);
    const current = daily.get(key) || { date: key, spend: 0, reach: 0, impressions: 0, clicks: 0, leads: 0 };
    current.spend += Number(row.spend);
    current.reach += Number(row.reach);
    current.impressions += Number(row.impressions);
    current.clicks += Number(row.clicks);
    current.leads += Number(row.leads);
    daily.set(key, current);
  }

  const pageTotals = pageInsights.reduce((sum, row) => ({
    reach: sum.reach + Number(row.reach),
    impressions: sum.impressions + Number(row.impressions),
    engagements: sum.engagements + Number(row.clicks),
  }), { reach: 0, impressions: 0, engagements: 0 });

  const pageDaily = new Map<string, { date: string; reach: number; impressions: number; engagements: number }>();
  for (const row of pageInsights) {
    const key = row.dateStart.toISOString().slice(0, 10);
    const current = pageDaily.get(key) || { date: key, reach: 0, impressions: 0, engagements: 0 };
    current.reach += Number(row.reach);
    current.impressions += Number(row.impressions);
    current.engagements += Number(row.clicks);
    pageDaily.set(key, current);
  }

  return {
    dateFrom, dateTo, connections, assets, campaigns, posts, recentLogs,
    totals: {
      ...totals,
      ctr: totals.impressions ? (totals.clicks / totals.impressions) * 100 : 0,
      cpc: totals.clicks ? totals.spend / totals.clicks : 0,
      cpm: totals.impressions ? (totals.spend / totals.impressions) * 1000 : 0,
      roas: totals.spend ? totals.purchaseValue / totals.spend : 0,
    },
    pageTotals,
    daily: Array.from(daily.values()),
    pageDaily: Array.from(pageDaily.values()),
  };
}
