# Facebook Marketing Report

## Scope

Build reporting and synchronization, not publishing or post scheduling.

Connection flow:

```text
Facebook Login -> Business -> Pages -> Ad Accounts -> selection -> initial sync
```

Collect connection identity, business/page/ad-account identifiers, granted scopes, token expiry, connected time, and last sync. Encrypt tokens.

## Data

Pages: name, avatar, category, followers, likes, URL, created/updated time.

Posts: caption, media references, publish time, reach, impressions, reactions, comments, shares, clicks.

Ads hierarchy: Campaign -> Ad Set -> Ad, including name, objective, buying type, status, budget, spend, reach, impressions, clicks, CPC, CPM, CTR, frequency, leads, purchases, and ROAS when available for the selected attribution window.

## Dashboard and reports

KPI cards: Spend, Reach, Impressions, Clicks, CTR, CPC, CPM, Leads, ROAS.

Interactive charts: Spend, Reach, Clicks, CTR, CPC, CPM, Leads.

Tables: Campaign Performance, Ad Set Performance, Ads Performance, Top Campaigns, Top Ads, Top Pages.

Filters: date range, connection, Page, Ad Account, Campaign, objective, status, attribution window, and timezone when relevant.

## Navigation

```text
/workspace/social-marketing
/workspace/social-marketing/reports
/workspace/social-marketing/reports/facebook
/workspace/social-marketing/reports/facebook/accounts
/workspace/social-marketing/reports/facebook/pages
/workspace/social-marketing/reports/facebook/ad-accounts
/workspace/social-marketing/reports/facebook/campaigns
/workspace/social-marketing/reports/facebook/adsets
/workspace/social-marketing/reports/facebook/ads
/workspace/social-marketing/reports/facebook/insights
/workspace/social-marketing/reports/facebook/sync-logs
/workspace/social-marketing/settings
```

Generate these from module/provider metadata where practical. Avoid scattering route strings across services.

## Notifications

Create Notification Center entries for sync success/failure, expired tokens, provider errors, and newly discovered campaigns. Do not send direct email from sync code.

## Acceptance

- Super Admin can enable the module, Report feature, Facebook capability, and limits for an organization.
- Disabled organizations cannot access UI, services, actions, routes, APIs, or widgets.
- Ong Vang Workspace can connect Facebook, discover/select assets, and disconnect.
- Pages, Posts, Ad Accounts, Campaigns, Ad Sets, Ads, and Insights sync idempotently.
- Manual, scheduled, incremental, and bounded full syncs expose last/next sync, status, total, success, failed, and logs.
- Dashboard and reports display real normalized database data with working filters and interactive charts.
- Events are ready for Automation.
- Adding another provider requires a new adapter and registry entry, not core rewrites.

