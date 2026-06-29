# Canonical Data Model

Use the existing Prisma naming and relation conventions. Every tenant model includes `organizationId`, `createdAt`, `updatedAt`, and nullable `deletedAt`.

## Core models

- `SocialProviderConnection`: provider, external user, encrypted token envelope, scopes, expiry, health, last/next sync.
- `SocialProviderAsset`: normalized business/account/page/channel asset with provider type and parent relation.
- `SocialMarketingSyncLog`: durable run status, mode, scope, cursor, counts, error, timing, initiator, correlation key.
- `SocialMarketingReportSetting`: timezone, currency, default attribution, selected assets, schedule, retention.

## Report entities

Keep provider-neutral normalized entities where semantics match, and provider extension JSON for fields that do not:

- `SocialCampaign`
- `SocialAdSet`
- `SocialAd`
- `SocialPost`
- `SocialInsight`

Provider-specific relation names may be exposed through adapter DTOs, but dashboards query canonical entities.

## Facebook compatibility names

If project requirements demand explicit models, map them to canonical tables or use these adapter-owned models:

```text
SocialFacebookConnection
SocialFacebookPage
SocialFacebookPost
SocialFacebookAdAccount
SocialFacebookCampaign
SocialFacebookAdSet
SocialFacebookAd
SocialFacebookInsight
```

Do not duplicate the same metric in both canonical and Facebook tables.

## Required keys

Examples:

```text
Connection: unique(organizationId, provider, externalUserId)
Asset: unique(organizationId, provider, assetType, externalId)
Campaign: unique(organizationId, provider, externalId)
AdSet: unique(organizationId, provider, externalId)
Ad: unique(organizationId, provider, externalId)
Post: unique(organizationId, provider, externalId)
Insight: unique(organizationId, provider, entityType, entityExternalId,
                dateStart, dateStop, breakdownKey, attributionWindow)
Setting: unique(organizationId)
```

Index tenant-first report access:

```text
(organizationId, provider, dateStart, dateStop)
(organizationId, connectionId, syncStatus)
(organizationId, adAccountId, status)
(organizationId, campaignId, dateStart)
```

Use Decimal for spend, CPC, CPM, CTR, frequency, conversion values, and ROAS. Use BigInt only if provider counts can exceed Int; convert to safe display DTO strings or numbers deliberately.

## Metric semantics

- Additive: spend, impressions, reach only when provider dimensions do not overlap, clicks, leads, purchases.
- Derived: CTR = clicks / impressions; CPC = spend / clicks; CPM = spend / impressions * 1000; frequency = impressions / reach; ROAS = purchase value / spend.
- Recompute derived metrics from aggregate numerators/denominators instead of averaging row ratios.
- Store currency and attribution window with insight identity.

Use soft deletion for disconnected assets and preserve historical reports according to organization retention settings.

