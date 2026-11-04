# Code standards

Follow repository conventions and prefer straightforward, focused solutions over new abstractions or dependencies. Keep brand-specific code in its corresponding experience folder; place only genuinely reusable UI in shared components. Avoid unrelated refactors and mass formatting in feature PRs.

## Application quality

Keep responsive layouts, accessibility, keyboard support, loading and error states, and reduced-motion behavior in mind. Maintain the approved retrofuturist visual identity without copying existing franchises. Keep server-side logic authoritative for payments, identity, and persisted orders. Avoid changing unrelated Cloudflare deployment, Stripe or Clerk settings, database state, or external resources during UI-only work.

## Readability and formatting

- Write readable, consistently formatted TypeScript, JavaScript, Vue, and CSS.
- Never minify or compress source to reduce line counts.
- Use one statement per line and multiline blocks for functions, conditionals, loops, and `try`/`catch`/`finally`.
- Break up long parameter lists, objects, and expressions where appropriate; keep indentation and spacing consistent.
- Prefer maintainability over minimizing line count. Review source readability even when checks pass.
- Do not use `!important` merely to work around selector specificity. Keep CSS declarations conventionally formatted when counting lines.
- Run formatting and lint checks as required by [VALIDATION.md](VALIDATION.md).

## Vue single-file component styles

Keep component styles inline at 50 or fewer nonblank CSS lines. At 51–100 nonblank lines, use judgment based on readability. Above 100 nonblank CSS lines across style blocks, extract styles into a colocated stylesheet unless there is a clear reason not to.

Name the stylesheet after its component, such as `AstroPopHero.vue` → `AstroPopHero.css`; for scoped styles, use `<style scoped src="./AstroPopHero.css"></style>`. Preserve scoped versus global behavior, style-block order, preprocessors, selectors, media queries, animations, responsive behavior, and visual output. Keep style blocks separate when they have different semantics. Leave global styles, shared utilities, and design tokens in their existing shared locations. Consider decomposing oversized components rather than only moving CSS, and validate style extraction as a behavior-preserving refactor.
