# Security and infrastructure safeguards

Never read, print, expose, embed, or commit `.env` contents, credentials, private keys, tokens, API secrets, or personal data. Use `.env.example` only for variable names and Doppler (`cosmoport-universe` / `dev`) for actual development configuration. Do not create or commit populated environment files.

## Existing integrations

- **Authentication:** Keep Clerk secret keys server-side. Trust verified server-side Clerk identity for authenticated endpoints, not arbitrary client IDs. Public routes and guest checkout remain available where already supported.
- **Commerce and persistence:** Preserve Stripe webhook verification, server-side validation, idempotent Neon/Postgres order persistence, retry/error semantics, and guest credential verification. Database migrations are in `database/migrations/`.
- **Media:** The separately deployable Worker in `workers/media/` may read only reviewed public R2 prefixes. Preserve allowlists, fail-closed behavior, caching, rate-limiting configuration, byte ranges, and the emergency controls in [workers/media/OPERATIONS.md](../../workers/media/OPERATIONS.md). Do not casually change CDN, WAF, Worker, R2, or live Cloudflare settings.
- **CMS and configuration:** The main Voyage page does not currently fetch live Sanity content. Preserve existing services and configuration; do not introduce infrastructure, payment, or authentication mechanisms without clear scope and approval.

For architecture and current shipped capabilities, consult [README.md](../../README.md). For media deployment and emergency procedures, `workers/media/OPERATIONS.md` is authoritative. Do not treat builds as verification of live CDN, webhook, identity, or production behavior.
