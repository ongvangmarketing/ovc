# Architecture

## Boundaries

Use this ownership model:

```text
src/modules/social-marketing/
  core/          provider-neutral types, registry, policies, events
  data/          server-only DAL and DTOs
  providers/     facebook/, future adapters
  services/      orchestration, normalization, aggregation, sync logs
  permissions/   permission metadata and checks
  ui/            reusable server/client presentation components
src/app/workspace/social-marketing/
  layout.tsx     module and feature guard
  page.tsx       module summary
  reports/...    report routes
  settings/...   connection and sync settings
src/app/api/social-marketing/
  oauth/...      provider redirect and callback Route Handlers
  jobs/...       authenticated scheduler/webhook handlers
```

Keep pages and actions thin. Business rules live in `src/modules/social-marketing`, not route files.

## Layer flow

```text
Page or Action
  -> auth + organization + permission + entitlement policy
  -> application service
  -> provider registry/adapter
  -> normalize
  -> tenant-scoped DAL transaction
  -> sync log + usage + event
  -> safe DTO
```

## Module metadata

- Code: `SOCIAL_MARKETING`
- Category: `MARKETING`
- Feature: `REPORT`
- First provider capability: `FACEBOOK`
- Routes are declared by module/provider navigation metadata.
- Sidebar consumes enabled module metadata; it does not contain provider conditionals.

## Next.js rules

- Default to Server Components.
- Mark DAL, provider credentials, token crypto, Graph API clients, and sync services with `import "server-only"`.
- Use Route Handlers for OAuth callbacks, webhooks, and scheduler endpoints.
- Use Server Actions for authenticated user mutations.
- Recheck auth and authorization inside every action/handler.
- Return minimal DTOs and never Prisma records containing encrypted token columns.
- Use `revalidatePath` after mutation; do not mutate during rendering.

## UI

Use existing Workspace density, cards, tables, tabs, controls, and responsive behavior. Prefer:

- Setup checklist before connection.
- KPI cards followed by date/provider/account filters.
- Recharts for interactive charts and accessible tooltips.
- TanStack Table for sortable report tables.
- Explicit empty, loading, partial, rate-limited, token-expired, and failed states.
- List/table views for operational data; avoid marketing landing-page composition.

