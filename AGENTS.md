# Instructions for AI Coding Agents

## Repository workflow

- Read this `AGENTS.md` before beginning any task.
- Verify current checkout, branch, worktrees, and uncommitted changes before modifying files.
- **Never develop directly on `main` or push directly to `main`.** Create a dedicated feature branch/worktree and submit a pull request.
- Keep PRs focused and reasonably small. Preserve unrelated work.
- **Never merge a PR without explicit user authorization.**
- Do not reset, delete, overwrite, stash, or clean other people's changes, branches, or worktrees.

## Parallel-agent worktree isolation (mandatory)

These rules apply whenever several AI agents may be working in the repository.

- **One agent = one dedicated worktree + one dedicated feature branch.** Never share another agent's checkout.
- Do not switch branches inside an existing or shared checkout to begin a new task.
- Create independent task branches from the latest fetched `origin/main`, not from the current checkout's HEAD or a stale local `main`, unless explicitly approved otherwise.
- Use unique, descriptive names for each task branch and worktree.
- Treat existing worktrees, branches, and uncommitted changes as owned by someone else unless clearly assigned to you.
- Never force-push, reset, rebase, rename, or delete another agent's branch. Do not silently resolve uncertain ownership.

### Required preflight before editing

From the checkout where you start, run:

```sh
pwd
git rev-parse --show-toplevel
git branch --show-current
git status --short --branch
git worktree list --porcelain
```

Identify ownership and the intended working location. If the repository is dirty or worktree ownership is unclear, do not disturb existing changes.

### Create an isolated task worktree

From an existing repository checkout, for example:

```sh
git fetch origin main
git worktree add -b docs/refresh-universe-readme ../cosmos-universe-readme origin/main
cd ../cosmos-universe-readme
git rev-parse --show-toplevel
git branch --show-current
git status --short --branch
```

Choose a unique branch and path instead of reusing this illustrative example. If fetching fails, report the failure rather than claiming to be up to date. Never switch the original checkout's branch.

### While editing and before pushing

- Perform edits, installs, builds, tests, and commits only in the agent-owned worktree.
- Recheck the worktree root, branch, and `git status --short --branch` before committing and pushing.
- Review `git diff` and staged changes; do not mix unrelated tasks.
- Open a PR targeting `main` and **leave merging to explicit user approval**.
- Do not remove branches or worktrees as automatic cleanup; request authorization after work is finished, particularly for dirty worktrees.

## Project overview

**Cosmos Universe** is a multi-experience, 1950s Space Age / Atompunk fictional world. The Nuxt 4 application includes:

- **Grand Concourse (`/`):** Universe homepage, shared navigation and account controls, and CosmoPort Radio.

- **Astro Pop Soda Co. (`/app/astro-pop`):** fictional storefront with flavor details, crate/cart, Stripe Checkout integration, server-side validation, notifications, and Neon-backed orders via Stripe webhooks.

- **Passport Office (`/passport-office`):** Custom Clerk registration,
  email verification, and returning-traveler sign-in.
  Registration supports four curated avatar presets.
  Universal profile provisioning is implemented through a verified
  Clerk webhook and Neon PostgreSQL. Avatar preference persistence
  and passport issuance are not yet implemented.

- **CosmoPort Voyage (`/app/cosmoport-voyage`):** destination-marketing landing page; trip search, comparison, and booking are **not** implemented. It is currently presented as under construction from the homepage.
- **About (`/about`):** shared world introduction.

Do not describe the repository as a minimal frontend, claim its checkout is real-world fulfillment, or describe planned features as implemented. Keep the [README](README.md) aligned with shipped capabilities.

### Architecture and existing integrations

- **Web:** Nuxt 4, Vue 3, TypeScript, Nitro, Tailwind v4, DaisyUI v5; Pinia for Astro Pop cart state and Zod for request validation.
- **Authentication:** `@clerk/nuxt` and a shared Universe Clerk instance. Public routes/guest checkout remain available. Trust server-side Clerk identities for authenticated endpoints, not arbitrary client IDs.
- **Commerce:** Stripe Checkout and webhook handlers in `server/api/astro-pop/`; Neon/Postgres order persistence and migrations in `database/migrations/`. Preserve webhook idempotency, error/retry semantics, server-side validation, and guest credential verification.
- **Media:** separately deployable Cloudflare Worker under `workers/media/` reading R2 objects from reviewed public prefixes. Respect allowlists, fail-closed behavior, caching rules, rate-limiting configuration, byte ranges, and the emergency controls described in `workers/media/OPERATIONS.md`. Do not casually change live CDN/WAF settings.
- **CMS:** `@nuxtjs/sanity` and separate `studio/` app with a destination schema. The current Voyage page does not fetch live CMS content.
- **Configuration:** Node 22.23.4 (`.nvmrc`), Doppler (`cosmoport-universe` / `dev`) for integrated local development, and `.env.example` for variable names only. Do not create or commit populated secrets files.

Preserve existing systems; **do not introduce new services, authentication mechanisms, payment flows, or infrastructure changes without clear task scope and approval**. Adding a feature to an existing integration still requires normal validation and security review.

## Development standards

- Follow repository conventions; inspect relevant components, composables, routes, and existing tests before changing behavior.
- Prefer straightforward, focused solutions over unnecessary abstractions or new dependencies.
- Keep brand-specific code in the corresponding experience folders; put truly reusable UI in shared components.
- Keep responsive layouts, accessibility, keyboard support, loading/error states, and reduced-motion behavior in mind.
- Maintain the shared fictional universe's approved retrofuturist visual identity without copying existing franchises.
- Keep server-side logic authoritative for payments, identity, and persisted orders.
- Avoid touching unrelated Cloudflare deployment, Stripe settings, Clerk settings, database state, or external resources as part of UI-only tasks.

### Code formatting and readability

- Write readable, consistently formatted TypeScript, JavaScript, Vue, and CSS.
- Never minify or compress source code to reduce file length or line counts.
- Use one statement per line. Do not combine unrelated declarations.
- Use multiline blocks for functions, conditionals, loops, and try/catch/finally.
- Break up long parameter lists, objects, and expressions where appropriate.
- Maintain consistent indentation and spacing.
- Prefer readability and maintainability over minimizing line count.
- Never compress CSS declarations to circumvent component style limits.
- Count CSS lines using conventional formatting, with declarations on separate lines.
- Do not use `!important` merely to work around poor selector specificity.
- Preserve existing functionality when making formatting changes.
- Avoid unrelated mass-formatting changes in feature PRs.
- Review source readability before committing, even when tests pass.
- Run repository formatting and lint checks when available.

### Vue component styling

Keep Vue Single-File Components readable without creating unnecessary files.

- Keep component styles inline at **50 or fewer nonblank CSS lines**.
- At **51–100 nonblank CSS lines**, use judgment based on readability.
- Above **100 nonblank CSS lines** across a component's style blocks, extract styles into a colocated stylesheet unless there is a clear reason not to.
- Name the file after its component, e.g. `AstroPopHero.vue` → `AstroPopHero.css`. For scoped styles, reference it with `<style scoped src="./AstroPopHero.css"></style>`.
- Preserve scoped versus global behavior, existing style-block order, preprocessors, selectors, media queries, animations, responsive behavior and visual output. Keep separate style blocks when they have different semantics.
- Keep global styles, shared utilities and design tokens in their existing shared locations.
- Consider decomposing oversized components rather than simply moving their CSS.
- Treat extraction as a behavior-preserving refactor: run relevant tests and visual/responsive checks, and avoid unrelated redesigns.

## Validation

Inspect the root `package.json` before selecting commands. At the repository root:

```sh
nvm use 22.23.4
npm ci
npm run test
npm run test:e2e
npm run build
```

Integrated local development uses `npm run doppler:dev`. Local webhook forwarding uses `npm run stripe:webhook:dev` in a separate terminal while the Nuxt server is running; it is not automatically started by `npm run dev`.

Clerk-specific Playwright tests use `npm run test:e2e:clerk` and require suitable development/test configuration. The media Worker has separate dependencies and test commands:

```sh
npm --prefix workers/media ci
npm --prefix workers/media test
npm --prefix workers/media run typecheck
npm --prefix workers/media run validate:wrangler
```

Run task-relevant focused tests and full checks when practical. Report exactly which commands passed, failed, or were not run. Do not claim live CDN, webhook, or authentication behavior is verified by a build alone. Validate production behavior separately when the task requires it.

## Security

- Never read, print, or expose `.env` contents, credentials, private keys, tokens, API secrets, or personal data.
- Never commit secret-bearing files or embed backend secrets in public Nuxt runtime config or frontend code.
- Use `.env.example` for required names only and Doppler for actual environment configuration.
- Keep Clerk secret keys server-side and derive identity from verified server-side auth context.
- Verify Stripe webhooks and maintain idempotent persistence/retry behavior.
- Follow media Worker's explicit public-prefix allowlists, least-privilege R2 access, and documented incident controls.

## Task completion

- Summarize the files changed and meaningful decisions.
- Report the results of checks actually performed, including limitations.
- Surface blockers and unresolved risks.
- Do not expand the task scope or merge the PR without user authorization.
