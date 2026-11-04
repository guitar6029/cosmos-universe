# Validation requirements

Finish all source modifications before final validation. Inspect the root `package.json` before choosing commands and use Node.js 22.23.4 from `.nvmrc`. Install root dependencies with `npm ci` when needed; do not expose environment values while preparing the development environment.

## Mandatory baseline

Before completing a coding task or creating/updating a PR, run the baseline validation command from the repository root:

```sh
npm run validate:pr
```

It runs formatting, application linting, CSS/Vue style linting, TypeScript checks, and unit tests. If formatting fails, run Prettier on the relevant modified files, then rerun `npm run validate:pr`. Do not replace, weaken, or treat this command as a substitute for CI or task-specific checks.

## Additional task-relevant checks

Run relevant E2E tests and production builds when appropriate:

```sh
npm run test:e2e
npm run test:e2e:clerk
npm run build
```

Clerk E2E tests require suitable development/test configuration. Integrated local development uses `npm run doppler:dev`; `npm run dev` starts Nuxt without Doppler. Local Stripe webhook forwarding requires `npm run stripe:webhook:dev` in a separate terminal while Nuxt runs.

For changes to the independently configured media Worker, run its own dependency install and checks:

```sh
npm --prefix workers/media ci
npm --prefix workers/media test
npm --prefix workers/media run typecheck
npm --prefix workers/media run validate:wrangler
```

Run the Studio build when Studio changes are relevant. A successful build alone does not verify live CDN, webhook, authentication, or deployment behavior; validate production behavior separately when the task requires it.

## Failures and reruns

Do not silently skip a check. Report every command that failed or could not run, why, and any resulting limitation. If a commit hook modifies files or another source modification follows validation, rerun the affected checks; rerun the complete baseline when its coverage may be affected. Never claim a check passed unless it was executed successfully.
