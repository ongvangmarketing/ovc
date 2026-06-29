# Tenancy, Licensing, Permissions, and Security

## Enforcement stack

Enforce all levels; hiding UI alone is insufficient:

1. Organization is active.
2. `SOCIAL_MARKETING` license is active or trialing and unexpired.
3. License feature `REPORT` is enabled.
4. Provider capability `FACEBOOK` is enabled.
5. User has the required permission.
6. Requested connection/account/page/ad account belongs to the session organization.
7. Usage is below the relevant limit.

Use 403 responses in Route Handlers and typed forbidden results/errors in actions/services. Workspace pages may redirect to a clear disabled-module state.

## Permissions

```text
social_marketing.read
social_marketing.report.read
social_marketing.report.sync
social_marketing.report.export
social_marketing.settings.update
social_marketing.facebook.connect
social_marketing.facebook.disconnect
social_marketing.facebook.sync
```

Define permissions as registry metadata. Resolve effective permissions from membership role plus explicit grants. A module-disabled organization has no effective Social Marketing permission.

## License shape

Recommended `OrganizationModuleLicense` values:

```json
{
  "features": { "REPORT": true },
  "limits": {
    "connections": 2,
    "facebookPages": 10,
    "facebookAdAccounts": 5,
    "manualSyncsPerDay": 20,
    "scheduledSyncsPerDay": 4,
    "historyMonths": 25
  },
  "settings": {
    "providers": { "FACEBOOK": { "enabled": true } },
    "syncTimezone": "Asia/Ho_Chi_Minh"
  }
}
```

Track limit consumption in `OrganizationModuleUsage`; do not infer all usage from table counts.

## Tenant query rules

- Require `organizationId` as a non-optional service/DAL argument.
- Use compound unique selectors that include `organizationId` whenever supported.
- For updates/deletes, use `updateMany`/`deleteMany` with ownership filters or fetch tenant-owned records first.
- Include organization ownership in nested relation checks.
- Add tests proving organization A cannot read or mutate organization B using guessed IDs.
- Super Admin switching must create an explicit audited organization context; never silently bypass tenant filters.

## Secrets

- Keep App Secret and token encryption key in server environment configuration.
- Encrypt access and refresh tokens using authenticated encryption such as AES-256-GCM with a versioned key identifier.
- Store ciphertext, IV/nonce, auth tag, key version, expiry, scopes, and token fingerprint. Do not store plaintext.
- Redact `access_token`, `client_secret`, OAuth code/state, authorization headers, and signed requests from logs and error payloads.
- Never use `NEXT_PUBLIC_` for secrets.
- Rotate/revoke tokens on disconnect and record the event.

## OAuth

- Generate a cryptographically random, signed, expiring, single-use state bound to user, organization, provider, and return path.
- Validate callback origin, state signature, expiry, nonce use, session user, and organization before token exchange.
- Exchange codes server-side only.
- Validate granted scopes and provider identity before persistence.
- Do not perform mutations in a GET render; OAuth callback Route Handlers may exchange the provider code after state validation.

