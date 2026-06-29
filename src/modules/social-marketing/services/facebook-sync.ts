import "server-only";

import { createHash, randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { allPages } from "@/modules/social-marketing/providers/facebook/provider";
import { getFacebookAccessToken } from "@/modules/social-marketing/services/facebook-connection";

type FacebookAction = { action_type?: string; value?: string };
type InsightRow = {
  campaign_id?: string; campaign_name?: string; adset_id?: string; adset_name?: string;
  ad_id?: string; ad_name?: string; date_start: string; date_stop: string;
  account_id?: string; account_currency?: string; spend?: string; reach?: string;
  impressions?: string; clicks?: string; actions?: FacebookAction[]; action_values?: FacebookAction[];
};
type PageInsightRow = {
  name: string;
  period: string;
  values?: Array<{ value?: number; end_time?: string }>;
};

function entityStatus(value?: string) {
  if (value === "ACTIVE") return "ACTIVE" as const;
  if (value === "PAUSED") return "PAUSED" as const;
  if (value === "ARCHIVED") return "ARCHIVED" as const;
  if (value === "DELETED") return "DELETED" as const;
  return "UNKNOWN" as const;
}

function actionValue(actions: FacebookAction[] | undefined, names: string[]) {
  return (actions || [])
    .filter((item) => item.action_type && names.includes(item.action_type))
    .reduce((sum, item) => sum + Number(item.value || 0), 0);
}

function jsonObject(value: Record<string, unknown>): Prisma.InputJsonObject {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonObject;
}

export async function syncFacebookReport(params: {
  organizationId: string;
  connectionId: string;
  initiatedById: string;
  dateFrom: Date;
  dateTo: Date;
}) {
  const range = `${params.dateFrom.toISOString().slice(0, 10)}:${params.dateTo.toISOString().slice(0, 10)}`;
  const [since, until] = range.split(":") as [string, string];
  const idempotencyKey = createHash("sha256")
    .update(`${params.connectionId}:MANUAL:${range}:${Date.now()}`)
    .digest("hex");
  const correlationId = randomUUID();
  const log = await db.socialMarketingSyncLog.create({
    data: {
      organizationId: params.organizationId, connectionId: params.connectionId,
      provider: "FACEBOOK", mode: "MANUAL", scope: "REPORT", status: "RUNNING",
      idempotencyKey, correlationId, initiatedById: params.initiatedById,
      dateFrom: params.dateFrom, dateTo: params.dateTo, startedAt: new Date(),
    },
  });

  try {
    const token = await getFacebookAccessToken(params.organizationId, params.connectionId);
    const accounts = await db.socialProviderAsset.findMany({
      where: {
        organizationId: params.organizationId, connectionId: params.connectionId,
        provider: "FACEBOOK", assetType: "AD_ACCOUNT", selected: true, deletedAt: null,
      },
    });
    const pages = await db.socialProviderAsset.findMany({
      where: {
        organizationId: params.organizationId, connectionId: params.connectionId,
        provider: "FACEBOOK", assetType: "PAGE", selected: true, deletedAt: null,
      },
    });
    let successRecords = 0;
    let failedRecords = 0;

    for (const account of accounts) {
      try {
        const [campaigns, adSets, ads, insights] = await Promise.all([
          allPages<{ id: string; name: string; objective?: string; buying_type?: string; status?: string; effective_status?: string; daily_budget?: string; lifetime_budget?: string; created_time?: string; updated_time?: string }>(
            `${account.externalId}/campaigns`, token,
            { fields: "id,name,objective,buying_type,status,effective_status,daily_budget,lifetime_budget,created_time,updated_time", limit: "100" }
          ),
          allPages<{ id: string; campaign_id: string; name: string; status?: string; effective_status?: string; daily_budget?: string; lifetime_budget?: string; optimization_goal?: string; billing_event?: string }>(
            `${account.externalId}/adsets`, token,
            { fields: "id,campaign_id,name,status,effective_status,daily_budget,lifetime_budget,optimization_goal,billing_event", limit: "100" }
          ),
          allPages<{ id: string; campaign_id: string; adset_id: string; name: string; status?: string; effective_status?: string; creative?: { id?: string } }>(
            `${account.externalId}/ads`, token,
            { fields: "id,campaign_id,adset_id,name,status,effective_status,creative", limit: "100" }
          ),
          allPages<InsightRow>(`${account.externalId}/insights`, token, {
            level: "ad", time_increment: "1",
            time_range: JSON.stringify({ since, until }),
            fields: "account_id,account_currency,campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,date_start,date_stop,spend,reach,impressions,clicks,actions,action_values",
            limit: "500",
          }),
        ]);

        await db.$transaction(async (tx) => {
          for (const row of campaigns) {
            await tx.socialCampaign.upsert({
              where: { organizationId_provider_externalId: { organizationId: params.organizationId, provider: "FACEBOOK", externalId: row.id } },
              update: { name: row.name, objective: row.objective, buyingType: row.buying_type, status: entityStatus(row.effective_status || row.status), rawStatus: row.effective_status || row.status, dailyBudget: row.daily_budget, lifetimeBudget: row.lifetime_budget, providerUpdatedAt: row.updated_time ? new Date(row.updated_time) : undefined, deletedAt: null },
              create: { organizationId: params.organizationId, connectionId: params.connectionId, provider: "FACEBOOK", adAccountExternalId: account.externalId, externalId: row.id, name: row.name, objective: row.objective, buyingType: row.buying_type, status: entityStatus(row.effective_status || row.status), rawStatus: row.effective_status || row.status, dailyBudget: row.daily_budget, lifetimeBudget: row.lifetime_budget, currency: account.currency, providerCreatedAt: row.created_time ? new Date(row.created_time) : undefined, providerUpdatedAt: row.updated_time ? new Date(row.updated_time) : undefined },
            });
          }
          for (const row of adSets) {
            await tx.socialAdSet.upsert({
              where: { organizationId_provider_externalId: { organizationId: params.organizationId, provider: "FACEBOOK", externalId: row.id } },
              update: { name: row.name, campaignExternalId: row.campaign_id, status: entityStatus(row.effective_status || row.status), rawStatus: row.effective_status || row.status, dailyBudget: row.daily_budget, lifetimeBudget: row.lifetime_budget, optimizationGoal: row.optimization_goal, billingEvent: row.billing_event, deletedAt: null },
              create: { organizationId: params.organizationId, connectionId: params.connectionId, provider: "FACEBOOK", campaignExternalId: row.campaign_id, externalId: row.id, name: row.name, status: entityStatus(row.effective_status || row.status), rawStatus: row.effective_status || row.status, dailyBudget: row.daily_budget, lifetimeBudget: row.lifetime_budget, optimizationGoal: row.optimization_goal, billingEvent: row.billing_event },
            });
          }
          for (const row of ads) {
            await tx.socialAd.upsert({
              where: { organizationId_provider_externalId: { organizationId: params.organizationId, provider: "FACEBOOK", externalId: row.id } },
              update: { name: row.name, campaignExternalId: row.campaign_id, adSetExternalId: row.adset_id, status: entityStatus(row.effective_status || row.status), rawStatus: row.effective_status || row.status, creative: row.creative, deletedAt: null },
              create: { organizationId: params.organizationId, connectionId: params.connectionId, provider: "FACEBOOK", campaignExternalId: row.campaign_id, adSetExternalId: row.adset_id, externalId: row.id, name: row.name, status: entityStatus(row.effective_status || row.status), rawStatus: row.effective_status || row.status, creative: row.creative },
            });
          }
          for (const row of insights) {
            const leads = actionValue(row.actions, ["lead", "offsite_conversion.fb_pixel_lead", "onsite_conversion.lead_grouped"]);
            const purchases = actionValue(row.actions, ["purchase", "offsite_conversion.fb_pixel_purchase"]);
            const purchaseValue = actionValue(row.action_values, ["purchase", "offsite_conversion.fb_pixel_purchase"]);
            if (!row.ad_id) continue;
            await tx.socialInsight.upsert({
              where: { organizationId_provider_entityType_entityExternalId_dateStart_dateStop_breakdownKey_attributionWindow: { organizationId: params.organizationId, provider: "FACEBOOK", entityType: "AD", entityExternalId: row.ad_id, dateStart: new Date(`${row.date_start}T00:00:00.000Z`), dateStop: new Date(`${row.date_stop}T23:59:59.999Z`), breakdownKey: "none", attributionWindow: "default" } },
              update: { spend: row.spend || 0, reach: BigInt(row.reach || 0), impressions: BigInt(row.impressions || 0), clicks: BigInt(row.clicks || 0), leads, purchases, purchaseValue, actions: row.actions || [], rawPayload: { campaignName: row.campaign_name, adSetName: row.adset_name, adName: row.ad_name }, deletedAt: null },
              create: { organizationId: params.organizationId, connectionId: params.connectionId, provider: "FACEBOOK", entityType: "AD", entityExternalId: row.ad_id, adAccountExternalId: account.externalId, dateStart: new Date(`${row.date_start}T00:00:00.000Z`), dateStop: new Date(`${row.date_stop}T23:59:59.999Z`), currency: row.account_currency || account.currency, spend: row.spend || 0, reach: BigInt(row.reach || 0), impressions: BigInt(row.impressions || 0), clicks: BigInt(row.clicks || 0), leads, purchases, purchaseValue, actions: row.actions || [], rawPayload: { campaignName: row.campaign_name, adSetName: row.adset_name, adName: row.ad_name } },
            });
          }
        });
        successRecords += campaigns.length + adSets.length + ads.length + insights.length;
      } catch {
        failedRecords += 1;
      }
    }

    for (const page of pages) {
      try {
        const [posts, pageInsights] = await Promise.all([
          allPages<{
            id: string; message?: string; story?: string; permalink_url?: string; created_time?: string;
            full_picture?: string; attachments?: unknown;
          }>(`${page.externalId}/posts`, token, {
            fields: "id,message,story,permalink_url,created_time,full_picture,attachments",
            limit: "100",
          }),
          allPages<PageInsightRow>(`${page.externalId}/insights`, token, {
            metric: "page_impressions,page_impressions_unique,page_post_engagements",
            period: "day",
            since,
            until,
            limit: "100",
          }),
        ]);

        const dailyPage = new Map<string, { impressions: number; reach: number; engagements: number; raw: Record<string, unknown> }>();
        for (const metric of pageInsights) {
          for (const value of metric.values || []) {
            if (!value.end_time) continue;
            const key = value.end_time.slice(0, 10);
            const current = dailyPage.get(key) || { impressions: 0, reach: 0, engagements: 0, raw: {} };
            if (metric.name === "page_impressions") current.impressions = Number(value.value || 0);
            if (metric.name === "page_impressions_unique") current.reach = Number(value.value || 0);
            if (metric.name === "page_post_engagements") current.engagements = Number(value.value || 0);
            current.raw[metric.name] = value.value || 0;
            dailyPage.set(key, current);
          }
        }

        await db.$transaction(async (tx) => {
          for (const post of posts) {
            await tx.socialPost.upsert({
              where: {
                organizationId_provider_externalId: {
                  organizationId: params.organizationId,
                  provider: "FACEBOOK",
                  externalId: post.id,
                },
              },
              update: {
                caption: post.message || post.story,
                permalinkUrl: post.permalink_url,
                media: jsonObject({ picture: post.full_picture || null, attachments: post.attachments || null }),
                publishedAt: post.created_time ? new Date(post.created_time) : undefined,
                deletedAt: null,
              },
              create: {
                organizationId: params.organizationId,
                connectionId: params.connectionId,
                provider: "FACEBOOK",
                pageExternalId: page.externalId,
                externalId: post.id,
                caption: post.message || post.story,
                permalinkUrl: post.permalink_url,
                media: jsonObject({ picture: post.full_picture || null, attachments: post.attachments || null }),
                publishedAt: post.created_time ? new Date(post.created_time) : undefined,
              },
            });
          }

          for (const [day, metrics] of dailyPage) {
            await tx.socialInsight.upsert({
              where: {
                organizationId_provider_entityType_entityExternalId_dateStart_dateStop_breakdownKey_attributionWindow: {
                  organizationId: params.organizationId,
                  provider: "FACEBOOK",
                  entityType: "PAGE",
                  entityExternalId: page.externalId,
                  dateStart: new Date(`${day}T00:00:00.000Z`),
                  dateStop: new Date(`${day}T23:59:59.999Z`),
                  breakdownKey: "none",
                  attributionWindow: "default",
                },
              },
              update: {
                reach: BigInt(metrics.reach),
                impressions: BigInt(metrics.impressions),
                clicks: BigInt(metrics.engagements),
                rawPayload: jsonObject(metrics.raw),
                deletedAt: null,
              },
              create: {
                organizationId: params.organizationId,
                connectionId: params.connectionId,
                provider: "FACEBOOK",
                entityType: "PAGE",
                entityExternalId: page.externalId,
                dateStart: new Date(`${day}T00:00:00.000Z`),
                dateStop: new Date(`${day}T23:59:59.999Z`),
                reach: BigInt(metrics.reach),
                impressions: BigInt(metrics.impressions),
                clicks: BigInt(metrics.engagements),
                rawPayload: jsonObject(metrics.raw),
              },
            });
          }
        });
        successRecords += posts.length + dailyPage.size;
      } catch {
        failedRecords += 1;
      }
    }

    await db.$transaction([
      db.socialProviderConnection.updateMany({ where: { id: params.connectionId, organizationId: params.organizationId }, data: { lastSyncAt: new Date(), status: failedRecords ? "ATTENTION_REQUIRED" : "ACTIVE" } }),
      db.socialMarketingSyncLog.update({ where: { id: log.id }, data: { status: failedRecords ? "PARTIAL" : "SUCCESS", totalRecords: successRecords + failedRecords, successRecords, failedRecords, completedAt: new Date() } }),
    ]);
    return { successRecords, failedRecords };
  } catch (error) {
    const message = error instanceof Error ? error.message.replace(/access_token=[^&\s]+/gi, "access_token=[REDACTED]") : "Facebook sync failed";
    await db.socialMarketingSyncLog.update({ where: { id: log.id }, data: { status: "FAILED", errorMessage: message.slice(0, 1000), failedRecords: 1, completedAt: new Date() } });
    throw new Error(message);
  }
}
