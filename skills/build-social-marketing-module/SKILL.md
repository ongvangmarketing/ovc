---
name: build-social-marketing-module
description: Build, extend, review, or debug the licensed multi-tenant Social Marketing reporting module in Ong Vang Workspace, including provider adapters such as Facebook, OAuth connections, normalized marketing data, scheduled or manual synchronization, KPI dashboards, reports, permissions, usage limits, events, and organization provisioning. Use for any Social Marketing architecture, schema, code, UI, API integration, sync, or provider expansion work in newongvangnew.
---

# Build Social Marketing Module

Build Social Marketing as a provider-neutral, independently licensed module. Treat Facebook as the first adapter, never as the core domain.

## Read context first

1. Read `AGENTS.md` and the relevant Next.js 16 guides under `node_modules/next/dist/docs/` before editing.
2. Inspect `src/lib/modules/registry.tsx`, `entitlements.ts`, `guards.ts`, the organization provisioning actions/UI, and current Prisma conventions.
3. Read these references according to the task:
   - Architecture, folder ownership, route rules: [architecture.md](references/architecture.md)
   - Tenant isolation, licensing, permissions, limits: [tenancy-security.md](references/tenancy-security.md)
   - Provider interfaces, OAuth, sync, normalization: [provider-contract.md](references/provider-contract.md)
   - Canonical entities, indexes, retention: [data-model.md](references/data-model.md)
   - Facebook Marketing Report scope and acceptance criteria: [facebook-report.md](references/facebook-report.md)

## Required implementation order

1. Register `SOCIAL_MARKETING` in the module registry and platform seed with category `MARKETING` and dependency `CRM` only when CRM linking is used.
2. Provision feature `REPORT` and provider capability `FACEBOOK` through license `features`, `limits`, and `settings`; do not create organization-specific constants.
3. Add tenant-owned Prisma models and migrations. Include `organizationId`, timestamps, `deletedAt`, provider identifiers, compound tenant uniqueness, and query indexes.
4. Implement a server-only Data Access Layer. Require organization context in every public function and apply it in every read, update, upsert, and delete.
5. Implement provider-neutral contracts and registry, then add the Facebook adapter.
6. Implement OAuth with signed single-use state, encrypted tokens, callback ownership checks, and no secrets in browser props or logs.
7. Implement idempotent incremental sync, explicit full sync, retry/backoff, cursor checkpoints, usage limits, and durable sync logs.
8. Add thin Server Actions and Route Handlers. Re-authenticate, re-authorize, validate input, enforce module/feature/provider access, then delegate to the DAL/services.
9. Register navigation from module metadata. Guard layout, page, action, route, widget, and service boundaries.
10. Build non-technical UI using existing Workspace patterns: connection/setup, KPI cards, interactive charts, report tables, filters, sync status, and logs.
11. Emit Notification Center messages and domain events. Never send direct notification email from a sync service.
12. Seed the module and enable it for Ong Vang Workspace with conservative limits.
13. Validate schema/client generation, types, focused tests, tenant-isolation checks, and browser-visible workflows.

## Non-negotiable rules

- Never query social data globally. Reject a missing organization context.
- Never trust `organizationId`, permission, role, provider, account, or record ownership supplied by the browser.
- Never expose, return, serialize, cache, or log access tokens, app secrets, OAuth codes, signed state, or raw provider responses containing secrets.
- Never hard-code provider-specific behavior in core dashboards, routes, sidebar, permissions, or sync orchestration.
- Never mark a sync successful when a provider request or persistence batch failed.
- Never delete historical metrics during an incremental sync. Upsert by tenant, provider, entity, date, breakdown, and attribution window.
- Keep provider payloads for diagnostics only after redaction and with bounded retention.
- Prefer real database aggregates. Label unavailable metrics; do not invent zeros that imply successful collection.
- Keep UI client payloads minimal and token-free.

## Definition of done

- A Super Admin can enable/disable Social Marketing, Report, Facebook, and limits per organization.
- Disabled organizations cannot see navigation or widgets and receive 403-equivalent enforcement at every server boundary.
- Ong Vang Workspace can configure Facebook credentials, connect, select assets, sync, inspect logs, and disconnect.
- Dashboard and reports use normalized persisted data with working filters and hoverable charts.
- Sync is idempotent, observable, recoverable, rate-limit aware, and tenant isolated.
- A second provider can be added by implementing the provider contract and registering metadata without changing core orchestration or UI architecture.

