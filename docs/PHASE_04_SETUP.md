# Phase 4 setup: PostgreSQL enquiry management

## Local setup

1. Install dependencies with `npm install` and copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to the PostgreSQL runtime connection and `DIRECT_URL` to a direct connection suitable for schema migrations. Never commit either value.
3. Set `ADMIN_EMAIL`. Run `npm run admin:hash-password` in a private terminal and put the resulting scrypt hash into `ADMIN_PASSWORD_HASH`.
4. Set independent random values of at least 32 characters for `ADMIN_SESSION_SECRET`, `IDEMPOTENCY_SECRET`, and `RATE_LIMIT_HASH_SECRET`.
5. Apply the checked-in migration to the intended non-production database with `npm run db:migrate`; generate the Prisma client with `npm run db:generate` (the production build also generates it).
6. Start the app with `npm run dev` and open `/contact` or `/admin/login`.

The migration is a plain PostgreSQL migration under `prisma/migrations`. It creates `event_enquiries`, `enquiry_activity`, `admin_sessions`, and `rate_limit_buckets`. No migration is applied automatically to a live database by this repository. Confirm the connection target before applying migrations.

## Admin access

There is no public registration. The initial implementation accepts one administrator, configured with `ADMIN_EMAIL` and a scrypt password hash. Successful sign-in creates an opaque, HttpOnly, SameSite=Lax cookie; PostgreSQL stores only an HMAC hash of the token and its expiry. Logout revokes that database session. Set a strong session secret and rotate credentials through the deployment's secret manager.

## Security and operations

- PostgreSQL credentials and all auth secrets are server-only. Browser code calls narrowly scoped API routes; it never connects directly to the database.
- Public enquiry submission accepts only validated enquiry fields. Status, priority, and internal notes are server-owned and excluded from the public response.
- PostgreSQL-backed rate limits fail closed when the database is unavailable. Idempotency keys are HMACed and unique in the database.
- Since this is direct PostgreSQL, there is no Supabase RLS layer. Access control is enforced by the server-only Prisma boundary and authorization checks on every admin page/API operation. Database networking and credentials must also be restricted to the application and trusted operators.
- Notification interface is present but disabled. Email and WhatsApp delivery require provider configuration and are not claimed as sent.

## Required environment variables

`DATABASE_URL`, `DIRECT_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, `IDEMPOTENCY_SECRET`, `RATE_LIMIT_HASH_SECRET`, and `NEXT_PUBLIC_SITE_URL`.

## Deployment checklist

Provision a PostgreSQL database and separate runtime/migration credentials where supported. Configure the environment variables in the deployment secret manager, review the SQL migration against the intended database, run `npm run db:migrate` as a controlled release step, then deploy. Configure backups, retention/privacy policy, database monitoring, and an email provider before enabling customer acknowledgements or admin alerts. No credentials or production database have been configured from this workspace.
