# Ong Vang Workspace - Deploy Checklist

## Build status

- `npm run build` passed locally with Next.js 16.2.9.
- App runs as a Node.js Next server, not static export.

## Production environment

Set these variables on the hosting platform:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
BETTER_AUTH_SECRET="change-to-a-strong-secret"
BETTER_AUTH_URL="https://YOUR-DOMAIN"
NEXTAUTH_URL="https://YOUR-DOMAIN"
NEXT_PUBLIC_APP_URL="https://YOUR-DOMAIN"
NEXT_PUBLIC_APP_NAME="Ong Vang Workspace"
NEXT_SERVER_ACTION_ALLOWED_ORIGINS="YOUR-DOMAIN"

FACEBOOK_APP_ID="1417112806843645"
FACEBOOK_APP_SECRET="set-in-host-secret-manager"
FACEBOOK_GRAPH_API_VERSION="v25.0"
FACEBOOK_OAUTH_SCOPES="public_profile,pages_show_list,pages_read_engagement,read_insights,ads_read,business_management"
SOCIAL_TOKEN_ENCRYPTION_KEY="32-byte-base64-secret"

RESEND_API_KEY=""
RESEND_FROM_EMAIL="noreply@YOUR-DOMAIN"
MAIL_HOST=""
MAIL_PORT="587"
MAIL_USERNAME=""
MAIL_PASSWORD=""
MAIL_FROM_ADDRESS="noreply@YOUR-DOMAIN"
MAIL_FROM_NAME="Ong Vang Workspace"
```

Only `NEXT_PUBLIC_*` values are public. Keep Facebook App Secret, database URL, mail credentials, and token encryption key private.

## Database

For a first deploy or schema update:

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npx tsx prisma/seed-modules.ts
```

Use `npx prisma migrate deploy` later once migrations are formalized.

## Build and start

```bash
npm run build
npm run start
```

## Facebook callback

In Meta for Developers, add the production callback:

```txt
https://YOUR-DOMAIN/api/social-marketing/oauth/facebook/callback
```

Keep localhost callback for local testing:

```txt
http://localhost:3000/api/social-marketing/oauth/facebook/callback
```

## Pre-deploy checks

- Login works for `marketing@ovc.vn`.
- `/workspace/dashboard` loads.
- `/admin/organizations` loads.
- `/workspace/social-marketing/settings` shows `Quyen du lieu: Fanpage / Ads`.
- Facebook OAuth returns to `/workspace/social-marketing/reports/facebook`.
- Run `npm run build` before every deploy.
