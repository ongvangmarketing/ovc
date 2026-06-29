# Provider Contract and Sync

## Provider-neutral contract

Keep core orchestration provider-neutral. Use capability methods because not every provider supports every asset type.

```ts
export type SocialProviderCode = "FACEBOOK" | (string & {});

export interface SocialReportProvider {
  readonly code: SocialProviderCode;
  readonly capabilities: ReadonlySet<SocialProviderCapability>;
  createAuthorizationUrl(context: OAuthStartContext): Promise<AuthorizationRequest>;
  exchangeAuthorizationCode(context: OAuthCallbackContext): Promise<ProviderConnectionGrant>;
  disconnect(context: ProviderExecutionContext): Promise<void>;
  validateConnection(context: ProviderExecutionContext): Promise<ConnectionHealth>;
  discoverAssets(context: ProviderExecutionContext): Promise<DiscoveredAssets>;
  sync(context: ProviderSyncContext): AsyncIterable<NormalizedSyncBatch>;
}
```

Provider registration supplies code, label, icon key, capabilities, required scopes, supported metrics, navigation, filter dimensions, and adapter factory. Core code selects providers from this registry.

## Facebook adapter

Use Meta Graph API only from the server. Keep API version configurable and pinned. Separate:

- OAuth/token exchange and inspection.
- Business, Page, and Ad Account discovery.
- Page/Post collection.
- Campaign, Ad Set, and Ad metadata collection.
- Insights collection.

Store provider field mapping in the adapter. Core services only consume normalized batches.

## Normalization

Normalize before persistence:

- IDs as strings.
- Timestamps as UTC `DateTime`; retain account timezone metadata.
- Money as decimal plus ISO currency.
- Percentages as decimals with an explicit unit contract.
- Status/objective/action values as provider raw value plus normalized enum when possible.
- Metrics as additive vs non-additive metadata; never sum ratios such as CTR, CPC, CPM, frequency, or ROAS.
- Attribution window and breakdown dimensions as part of metric identity.

Preserve a redacted, bounded `rawPayload` only when operationally useful.

## Sync modes

- `INCREMENTAL`: resume from checkpoint with a configurable lookback window for late attribution.
- `FULL`: rebuild a bounded requested date range; require elevated confirmation.
- `MANUAL`: initiated by a user and charged to manual quota.
- `SCHEDULED`: initiated by an authenticated scheduler and charged to scheduled quota.

Every run creates a durable sync log before provider calls. Record status, mode, scope, cursor/checkpoint, requested range, counts, retry count, rate-limit metadata, redacted error, start/end time, and initiator.

## Reliability

- Build deterministic idempotency keys from organization, provider, connection, resource, date range, and mode.
- Upsert batches transactionally using tenant compound keys.
- Advance checkpoints only after persistence succeeds.
- Retry transient network, 429, and 5xx failures with exponential backoff and jitter.
- Do not retry invalid tokens or permission failures; mark connection attention-required.
- Prevent overlapping syncs for the same connection/scope with a database lease or unique active-job constraint.
- Continue independent scopes when one scope fails, then mark the run `PARTIAL`.

## Events

Emit after transaction commit:

```text
social.sync.completed
social.sync.failed
social.token.expired
social.campaign.created
social.report.updated
```

Events include organization, provider, connection, safe entity identifiers, timestamp, and correlation ID. They never include tokens or raw secrets.

