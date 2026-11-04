# CosmoPort media Worker

This independent Cloudflare Worker is the delivery layer for CosmoPort public media at `media.cosmos-universe.com`. The authoritative `wrangler.jsonc` explicitly sets `MEDIA_DELIVERY_ENABLED` to `"true"`; public access remains subject to the separately managed emergency WAF Block rule. The Worker never writes, lists, or deletes R2 objects.

Its Cloudflare configuration is in `wrangler.jsonc`, and its source and tests are isolated from the Nuxt/Nitro application under `workers/media`.

## Local use

From this directory:

```sh
npm ci
npm test
npm run typecheck
npm run validate:wrangler
npx wrangler dev --local
```

This starts the Worker with configured delivery enabled. Do not use remote mode for this scaffold.

To exercise fail-closed behavior locally, override the delivery switch for that command only:

```sh
npx wrangler dev --local --var MEDIA_DELIVERY_ENABLED:false
```

`--var MEDIA_DELIVERY_ENABLED:false` injects the Worker's runtime binding; a shell environment variable alone does not override the Wrangler `vars` configuration. `--local` keeps the Worker and R2 binding on local simulation storage.

The Worker accepts only `GET` and `HEAD` for media under the `astro-pop/`, `passport-office/`, `about/`, `blog/`, `grand-concourse/`, and narrowly scoped `sounds/grand-concourse/` prefixes. It permits PNG, JPEG, WebP, MP4, MP3, WAV, and OGG files; validates and decodes paths before R2 access; and supports one byte range per request using R2 native ranged reads. Multiple ranges are deliberately rejected with `416` until multipart response support is separately designed. The latter prefixes are reviewed public artwork and Grand Concourse radio namespaces.

## Deployment settings

When Cloudflare Workers Builds is configured, use:

- Root directory: `workers/media`
- Deploy command: `npx wrangler deploy`
- Production branch: `main`
- Preview builds: disabled initially

No route or custom domain is configured in this repository. R2 public access remains disabled. Workers Caching is disabled (`cache.enabled: false`); the Worker uses its explicit Cache API behavior for eligible image responses. Follow [OPERATIONS.md](OPERATIONS.md) for the emergency WAF Block rule and separately approved public-access procedure.
