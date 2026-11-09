# Astro Pop checkout endpoint protections

The public Astro Pop checkout flow intentionally supports guests. `POST /api/astro-pop/checkout` creates a browser-bound, HttpOnly guest credential only after Stripe accepts a Checkout Session. `GET /api/astro-pop/checkout/status` and `GET /api/astro-pop/checkout/verify` require that credential before they contact Stripe, then require its fingerprint to match Stripe Checkout Session metadata before returning payment or order state.

The credential precondition prevents a request containing only a guessed or obtained Checkout Session ID from using Stripe lookups. It does not replace edge abuse controls: a caller can still send a syntactically valid cookie value, and checkout creation remains intentionally public.

## Production configuration requirements

Configure the hosting/CDN security layer to rate-limit these routes before they reach Nitro, without caching their responses:

- `POST /api/astro-pop/checkout`
- `GET /api/astro-pop/checkout/status`
- `GET /api/astro-pop/checkout/verify`

Use per-client limits appropriate to observed traffic and alert on sustained `429` responses and Stripe API errors. Preserve Stripe webhook delivery separately; do not apply the browser endpoint policy to `/api/astro-pop/stripe-webhook`.

No in-process rate limiter is used. Per-process counters are inconsistent across serverless instances and do not provide a reliable production control. This repository does not currently contain a durable shared rate-limit service, so the required enforcement point is the platform edge until a reviewed shared solution is introduced.
