# Astro Pop Code Quality & UI/UX Audit

**Audited:** 2026-10-22
**Scope:** `app/pages/astro-pop`, `app/components/astro-pop`, their shared decoration helper, and Astro Pop public assets. This is an audit only; no application code, styling, assets, or dependencies were changed.

## 1. Executive summary

Astro Pop has a cohesive, distinctive 1950s soda-advertising identity. Its illustration-first approach, variable per-flavor palette, clear page sequence, semantic sections, descriptive image alternatives, and cart announcement regions are strong foundations. It should not be flattened into a generic component library: the individually art-directed flavor cards and testimonial collage are worth preserving.

The most valuable improvements are practical rather than visual redesigns:

1. establish a small Astro Pop token layer and reuse the shared flavor palette;
2. make focus and interaction feedback consistent, while preserving the cart’s existing focus, hover, and disabled treatments;
3. reduce the 53.60 MiB all-PNG image inventory with responsive modern formats; and
4. move repeated decoration positioning out of template `style` attributes; and
5. raise the smallest all-caps labels where they are hard to read.

No confirmed horizontal overflow was found in browser-based checks at the requested width overrides (360, 390, 768, 1024, 1440, and 1920 px). The full-page captures intentionally did not load below-the-fold `loading="lazy"` images until their sections enter the viewport, so those captures were not used to judge whether lazy images render correctly.

## 2. Confirmed code-quality findings

### CQ-1 — Flavor theme values are duplicated in two card components

- **Severity:** Medium
- **Location:** `app/components/astro-pop/AstroPopFlavorCard.vue:60-85`; `app/components/astro-pop/AstroPopBottleSelectionCard.vue:59-80`
- **Problem:** Each of the four flavor themes repeats the same accent, ink, and paper hex values in both display-card implementations. A color correction or new flavor must be updated in two places, which risks theme drift.
- **Recommendation:** Keep the artistic card layouts separate, but centralize the flavor palette once: either expose semantic custom properties from the existing flavor data/theme modifier, or add a small shared Astro Pop theme stylesheet with the four modifier classes. Retain the Flavor Card-only `--card-art` value locally.
- **Scope:** Small

### CQ-2 — Visual primitives are repeatedly hand-authored rather than named

- **Severity:** Medium
- **Location:** `AstroPopFlavorCard.vue:39-58`, `AstroPopBottleSelectionCard.vue:40-57`, `AstroPopDeliveryPlansSection.vue:176-191`, `app/pages/astro-pop/cart.vue:143-154`
- **Problem:** Paper surfaces, asymmetric rounded corners, 2 px ink borders, offset hard shadows, condensed uppercase labels, and Fraunces display headings recur with slightly different literal values. The visual language is good, but its implementation is difficult to tune consistently.
- **Recommendation:** Introduce a deliberately small local vocabulary such as `--ap-ink`, `--ap-paper`, `--ap-red`, `--ap-teal`, `--ap-border`, `--ap-card-radius`, and `--ap-hard-shadow`; use a few component-local reusable classes for paper cards, eyebrow labels, and pill buttons. Do not force flavor cards, plan cards, and testimonials into a single universal component.
- **Scope:** Medium

### CQ-3 — Repeated decoration settings are inline and difficult to maintain

- **Severity:** Medium
- **Location:** `AstroPopFlavorSection.vue:9-34`; `AstroPopDeliverySection.vue:29-45`
- **Problem:** Eight `DecorativeImage` instances encode position, size, opacity, rotation, and z-index as inline style strings. The cap settings are repeated verbatim and cannot be adjusted per breakpoint without editing template strings. This is the only substantial inline-style concentration in the Astro Pop page.
- **Recommendation:** Keep `DecorativeImage`, but drive ornaments from a typed data array and modifier class, or add narrowly named classes such as `--flavor-cap-top-left` and `--delivery-note`. Put desktop/mobile positioning in scoped CSS. This preserves the art direction while making responsive adjustments reviewable.
- **Scope:** Small

### CQ-4 — Cart CSS is functionally sound but compressed into dense one-line rules

- **Severity:** Low
- **Location:** `app/pages/astro-pop/cart.vue:133-158`
- **Problem:** Most cart selectors and media queries are formatted as long single lines, unlike the rest of the Astro Pop components. This obscures visual review and makes future conflict resolution or token adoption unnecessarily error-prone.
- **Recommendation:** Reformat the existing CSS without changing declarations, then apply shared tokens/classes as a separate change. Keep the cart page’s distinct order-manifest layout.
- **Scope:** Small

### CQ-5 — Global smooth-scroll behavior is owned by a leaf section

- **Severity:** Low
- **Location:** `AstroPopDeliveryPlansSection.vue:92-100`
- **Problem:** `:global(html)` is emitted by the delivery-plan component even though smooth scrolling governs the whole Astro Pop document. It works, including a reduced-motion override, but the ownership is surprising and the behavior disappears if that component is ever not rendered.
- **Recommendation:** Move this small global rule to the Astro Pop page or the application stylesheet when performing the token cleanup. Preserve the `prefers-reduced-motion` override.
- **Scope:** Small

### CQ-6 — Commented-out production styling is dead code

- **Severity:** Low
- **Location:** `AstroPopDeliverySection.vue:73`
- **Problem:** A commented hard-shadow declaration remains in the production component.
- **Recommendation:** Remove it or restore it deliberately in a visual-design PR; source control already preserves the experiment.
- **Scope:** Small

## 3. CSS duplication and proposed design tokens

### Proposed token set

These are a modest local foundation, not a new design system:

| Token family    | Suggested examples                                                                          | Current repeated use                                              |
| --------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Core ink/paper  | `--ap-ink: #3a2c35`, `--ap-deep-ink: #5e2730`, `--ap-paper: #fff3d6`, `--ap-cream: #fff8e5` | Page, cart, buttons, cards, testimonials                          |
| Brand accents   | `--ap-red: #a83f2e`, `--ap-teal: #167c89`, `--ap-mint: #9bd4cb`, `--ap-gold: #e6c486`       | Headings, focus states, pills, footer                             |
| Typography      | `--ap-font-body`, `--ap-font-display`, `--ap-font-label`                                    | Repeated Barlow/Fraunces/Barlow Condensed stacks in every section |
| Shape/elevation | `--ap-border: 2px`, `--ap-card-radius`, `--ap-hard-shadow`                                  | Flavor, bottle, delivery-plan, cart surfaces                      |
| Flavor theme    | `--ap-flavor-accent`, `--ap-flavor-ink`, `--ap-flavor-paper`                                | Four duplicated theme blocks noted in CQ-1                        |

Tailwind is already installed and `bg-[#efd099]` is used at `AstroPopDeliverySection.vue:6`. Prefer semantic CSS variables for the repeatable brand vocabulary rather than proliferating arbitrary-value utilities. Ordinary one-off layout declarations (grid, flex, gap, width constraints) could use utilities if that matches future project convention, but converting all scoped art direction to utility strings would reduce readability.

## 4. Component reuse opportunities

### CR-1 — Share the flavor palette, not the two card layouts

- **Severity:** Medium
- **Location:** `AstroPopFlavorCard.vue` and `AstroPopBottleSelectionCard.vue`
- **Problem:** The cards repeat theme values but serve meaningfully different roles: the flavor card is editorial/artwork-led; the bottle card is a transactional selection control.
- **Recommendation:** Reuse only palette configuration and small primitives (eyebrow, paper surface, button). Do not merge the cards into an over-configured component.
- **Scope:** Small

### CR-2 — Extract the visually consistent label and button primitives

- **Severity:** Low
- **Location:** `AstroPopFlavorSection.vue:89-98`, `AstroPopDeliverySection.vue:92-101`, `AstroPopDeliveryPlansSection.vue:137-145`, `AstroPopFooter.vue:57-65`; button styles in `AstroPopBottleSelectionCard.vue:111-126`, `AstroPopDeliverySection.vue:125-150`, `app/pages/astro-pop/cart.vue:153`
- **Problem:** The same condensed, uppercase label treatment and rounded call-to-action structure are reimplemented in several sections.
- **Recommendation:** Add CSS classes (for example, `.ap-eyebrow` and `.ap-button`) before considering Vue wrapper components. A Vue component is only justified if it also standardizes disabled, focus, and link/button semantics.
- **Scope:** Small

## 5. UI/UX findings by section

### Hero

**Observed in browser at mobile and desktop widths.** The hero image is effective and already contains a retro-futuristic neighborhood/spaceport scene behind the delivery man. Its restrained radial glow lets the artwork lead.

**Optional creative enhancement — do not add a separate neighborhood image.**

- **Severity:** Low
- **Location:** `app/pages/astro-pop/index.vue:42-61`
- **Problem:** A second illustrated neighborhood background would likely compete with the existing, detailed hero composition and increase already substantial image weight.
- **Recommendation:** Keep the current single hero asset. If greater depth is desired after performance work, test only a CSS grain/halftone or extremely low-opacity geometric starfield behind it, disabled under reduced motion. Do not generate or replace imagery as part of this work.
- **Scope:** Small

### Flavor section

**Observed in browser.** The large heading, four-color card cadence, and sparse cap/opener ornaments work well. At mobile, the cards remain legible and do not overflow.

### Pack Your Pop

**Confirmed source observation.** Four actionable `Add Bottle` controls have no component-authored `:hover`, `:active`, or `:focus-visible` styling.

- **Severity:** Medium
- **Location:** `AstroPopBottleSelectionCard.vue:111-130`
- **Problem:** The primary transactional controls provide no intentional keyboard focus indicator or feedback beyond the browser baseline. Tailwind’s reset makes reliance on a browser default especially fragile. The disabled state changes only the cursor, so it is not visually distinct enough for all users.
- **Recommendation:** Define visible `:focus-visible`, `:hover` (hover-capable devices only), `:active`, and disabled background/opacity treatments with sufficient contrast. Keep the existing button dimensions; their padding provides an adequate starting touch target.
- **Scope:** Small

### Delivery callout and plans

**Observed in browser.** The callout’s content/artwork split and the 3-up-to-1-up plan grid are balanced. The source breakpoint at `959px` deliberately avoids cramped cards on tablet.

- **Severity:** Low
- **Location:** `AstroPopDeliveryPlansSection.vue:167-288`
- **Problem:** At 768 px, the plan cards intentionally collapse to one column, leaving a large vertical sequence. This is not broken, but a two-column intermediate layout could improve scan speed if user testing identifies excessive scroll.
- **Recommendation:** Treat a two-column 640–959 px variant as an optional experiment only; retain the current one-column mobile behavior if artwork and pricing readability suffer.
- **Scope:** Medium

### Typography

**Observed in browser and confirmed in source.** The display-face hierarchy is strong, but the smallest condensed uppercase copy becomes difficult to read at mobile scale, particularly when its letter spacing is retained. The delivery-plan badge is decorative but still conveys useful differentiation.

- **Severity:** Medium
- **Location:** Flavor-card brand `AstroPopFlavorCard.vue:94-103` (`0.68rem`); flavor-section eyebrow `AstroPopFlavorSection.vue:89-98` (`0.72rem`); delivery-plan eyebrow `AstroPopDeliveryPlansSection.vue:137-145` (`0.75rem`); featured-plan badge `AstroPopDeliveryPlansSection.vue:217-235` (`0.7rem`); bottle CTA `AstroPopBottleSelectionCard.vue:111-126` (`0.85rem`)
- **Problem:** At 360 and 390 px, the 0.68–0.75rem uppercase labels are visually subordinate to a degree that impairs quick reading. Letter spacing is appropriate to the period style, but compounds the issue at these sizes. The large headings and body copy remain readable and do not need a global type-scale rewrite.
- **Recommendation:** Establish a readable Astro Pop label floor of `0.75rem` for non-essential decorative copy and `0.8rem` for labels/badges that communicate state or an offer. Keep Barlow Condensed and the uppercase aesthetic, but modestly reduce letter spacing at the narrowest breakpoint rather than shrinking the font. Verify final contrast and legibility with real-device testing.
- **Scope:** Small

### Testimonials and footer

**Observed in browser.** The testimonial composition is attractive, text remains readable against the neighborhood background, and the footer supplies good destination links. The testimonial heading is visually supplied by the sign while remaining available to assistive technology, which is a thoughtful pattern.

- **Severity:** Low
- **Location:** `AstroPopDeliveryTestimonialsSection.vue:96-151`
- **Problem:** The large sign and image background make this section visually dense; adding more ornaments here would dilute the collage and could obstruct the message bubbles at smaller widths.
- **Recommendation:** Add no further decorative accents here. If change is needed, prioritize portrait-image loading/performance over additional decoration.
- **Scope:** Small

### Decorative accents overall

The existing caps, opener, delivery note, stars, and testimonial sign are sufficient. The browser check found no horizontal overflow at the requested widths. However, their inline positional styles make future breakpoint tuning harder (CQ-3). Preserve their `pointer-events: none` behavior in `app/components/shared/DecorativeImage.vue:17-25`.

### Custom cursor feasibility (optional enhancement)

- **Severity:** Low
- **Location:** New Astro Pop global/page CSS only; no current custom cursor implementation
- **Problem:** A custom cursor can reinforce the period feel, but raster cursor files have poor scaling, limited hotspot control, and can reduce usability or disappear on touch/coarse-pointer devices.
- **Recommendation:** Only test this after core accessibility work. Use compact `.cur`/PNG assets with explicit hotspots; gate behind `@media (pointer: fine)` and retain the platform cursor as fallback. Apply a themed pointing-hand only to clearly interactive controls, never to text selection, inputs, disabled controls, or touch environments. Respect forced-colors mode and do not hide the native cursor.
- **Scope:** Medium

## 6. Responsive and accessibility findings

### Browser-based responsive check

The Astro Pop landing page was opened in a local Nuxt development server and checked with browser viewport overrides for **360, 390, 768, 1024, 1440, and 1920 px**. For every check, `documentElement.scrollWidth` did not exceed the reported viewport width. The hero image stayed contained, and the flavor grid, pack controls, delivery plans, testimonials, and footer changed layout without clipping. Full-page visual captures were reviewed at mobile and desktop sizes.

The cart route was also checked in the same browser at **360, 390, 768, 1024, 1440, and 1920 px**, in both states below:

| State                                                                   | What was verified                                                   | Result                                                                                                                                                                                                                                                                     |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Empty cart                                                              | Header/back link, empty-message card, and “Choose your flavors” CTA | No horizontal overflow at all six widths. At 360/390 px, the back link correctly switches from absolute to normal flow; CTA rendered 48 px high.                                                                                                                           |
| Populated cart (one bottle added through the site’s Add Bottle control) | Roster, quantity stepper, summary, and disabled checkout button     | No horizontal overflow at all six widths. At 360/390 px, content remains a single column and the 136 px quantity control fits. At 768 px and above, the roster and summary use the intended two-column layout. A populated 360 px full-page capture was visually reviewed. |

**Limitations:** This verifies local-browser rendering and structural measurements, not real-device touch behavior, screen-reader output, zoom/reflow at 200%, or keyboard traversal of every control. The populated case used one line item; it does not verify a full six-bottle/multiple-flavor roster. Lazy below-the-fold imagery was not judged from full-page screenshots until it entered the viewport.

The following are source-code observations, not claims of assistive-technology testing:

### A11Y-1 — Focus treatment is inconsistent across interactive elements

- **Severity:** Medium
- **Location:** Landing-page focus styles: `app/pages/astro-pop/index.vue:81-90`, `AstroPopCartLink.vue:41-49`, `AstroPopDeliverySection.vue:142-150`, `AstroPopFooter.vue:125-135`, `AstroPopPackYourPopSection.vue:96-121`; cart-wide focus rule: `app/pages/astro-pop/cart.vue:156`; bottle button: `AstroPopBottleSelectionCard.vue:111-130`
- **Problem:** The cart already applies a teal `:focus-visible` outline to its buttons, inputs, and links, while several landing-page links use individually authored outlines. The genuinely missing authored treatment is on the Pack Your Pop bottle button: it has no component-level `:focus-visible` style. This is inconsistency, not an absence of cart focus support.
- **Recommendation:** Define one Astro Pop focus-ring token/class, preserve the cart’s existing teal ring where it meets contrast requirements, and apply the same intentional treatment to Bottle Selection controls and other landing-page actions. Keyboard-test both routes after implementation.
- **Scope:** Small

### A11Y-2 — Interactive state feedback is incomplete

- **Severity:** Medium
- **Location:** Missing Bottle Selection states: `AstroPopBottleSelectionCard.vue:111-130`; existing cart quantity and CTA states: `app/pages/astro-pop/cart.vue:151-153`; cart remove action: `app/pages/astro-pop/cart.vue:149`
- **Problem:** The cart already provides a quantity-button hover background, disabled quantity color/cursor, and a disabled checkout opacity/cursor. The Bottle Selection button genuinely lacks authored hover, active, focus, and visually distinct disabled treatments; the cart remove action also lacks a hover treatment. State feedback is therefore inconsistent rather than wholly missing.
- **Recommendation:** Preserve cart states, add clear Bottle Selection hover/active/disabled styles, and add a modest hover/active cue to Remove bottle. Pair color changes with a non-color change (for example, hard-shadow offset or underline) and use `@media (hover: hover)` for hover-only decoration.
- **Scope:** Small

### A11Y-3 — Reduced-motion handling is good but narrowly scoped

- **Severity:** Low
- **Location:** `AstroPopDeliveryPlansSection.vue:92-100`
- **Problem:** Smooth anchor scrolling correctly respects `prefers-reduced-motion`; that is the only current motion behavior. Future hover/cursor/ornament animation could accidentally bypass this safeguard.
- **Recommendation:** Retain the current override and establish an Astro Pop convention that transitions and decorative motion are reduced or removed under `prefers-reduced-motion: reduce`.
- **Scope:** Small

### Existing strengths

- Clear heading hierarchy starts with an assistive-technology-visible hero `h1` (`app/pages/astro-pop/index.vue:17`).
- Decorative images are hidden from assistive technology (`DecorativeImage.vue:8-13`), while meaningful product and testimonial images receive descriptive alternatives.
- Cart changes use polite live announcements (`AstroPopPackYourPopSection.vue:30-31`; `app/pages/astro-pop/cart.vue:72`), and quantity buttons have explicit accessible names.
- Footer links use 44 px-ish minimum block height (`AstroPopFooter.vue:113-123`), a good touch-target baseline.

## 7. Performance and asset findings

### PA-1 — Astro Pop’s image inventory is large and PNG-only

- **Severity:** High
- **Location:** `public/images/astro-pop/**` (26 PNGs, **53.60 MiB** total)
- **Problem:** The artwork-heavy page uses only large PNG files. Examples include the 2.54 MiB hero (`1448×1086`), four 2.50–2.80 MiB flavor posters, four 1.72–1.86 MiB bottle cutouts, and a 2.60 MiB testimonial background. This is expensive for mobile bandwidth and decode time, especially after scrolling through the entire page.
- **Recommendation:** Preserve original PNG masters, but produce responsive WebP and (where browser support/product policy allows) AVIF derivatives. Serve them with `<picture>` and width descriptors/sizes appropriate to each grid; keep PNG fallback only where transparency/compatibility requires it. Prioritize hero, flavor posters, bottle cutouts, and testimonial background first.
- **Scope:** Large

### PA-2 — Several image elements lack explicit intrinsic dimensions

- **Severity:** Medium
- **Location:** Hero `app/pages/astro-pop/index.vue:18-22`; flavor artwork `AstroPopFlavorCard.vue:24-29`; bottles `AstroPopBottleSelectionCard.vue:18-23`; delivery image `AstroPopDeliverySection.vue:20-25`; portraits `AstroPopDeliveryTestimonialsSection.vue:56-61`
- **Problem:** Only delivery-plan crates specify `width` and `height` (`AstroPopDeliveryPlansSection.vue:67-74`). CSS constraints reduce some layout instability, but explicit dimensions/aspect ratios make allocation and cumulative-layout-shift behavior more robust while images load.
- **Recommendation:** Record true intrinsic dimensions (or a matching `aspect-ratio`) for each content image when adding responsive formats. Do not add inaccurate attributes merely to silence a metric.
- **Scope:** Medium

### PA-3 — Lazy loading is appropriately broad, but the hero should stay eager and high priority

- **Severity:** Low
- **Location:** Hero `app/pages/astro-pop/index.vue:18-22`; deferred images throughout components
- **Problem:** The hero is not lazy-loaded, which is correct. Most below-the-fold images use `loading="lazy"`; several also use `decoding="async"`. The primary image has no explicit fetch priority.
- **Recommendation:** When implementing responsive images, set the actual hero candidate to `fetchpriority="high"` and preserve lazy loading for below-the-fold artwork. Recheck LCP and decode behavior with production output rather than guessing.
- **Scope:** Small

### PA-4 — Decorative full-resolution images are costly for their rendered size

- **Severity:** Medium
- **Location:** `AstroPopFlavorSection.vue:9-34`; `AstroPopDeliverySection.vue:29-45`; assets such as `Vintage AstroPop Soda Cap.png` (2.14 MiB, rendered around 150 px) and `AstroPop Soda Co. Delivery Note.png` (2.96 MiB)
- **Problem:** Decorative accents are displayed at low opacity and much smaller than source resolution, yet download full multi-megabyte files.
- **Recommendation:** Generate small decorative derivatives (and modern formats) sized near their maximum CSS display size; consider CSS/vector stars for simple symbols already represented by text glyphs. Keep the image-based cap/opener where it contributes unique illustration.
- **Scope:** Medium

## 8. Recommended implementation backlog

These are ordered as small, independently reviewable PRs. They do not include Cloudflare migration, music, Supabase, or payments.

1. **PR: Astro Pop focus and state consistency** — Preserve the cart’s current focus, quantity-hover, and disabled treatments; add the same intentional focus and state feedback to Bottle Selection controls and a restrained hover/active cue to Remove bottle. Keyboard-test both `/astro-pop` and `/astro-pop/cart`. **Small.**
2. **PR: Astro Pop label legibility** — Raise the smallest eyebrow/badge text to the documented floor and tune narrow-screen tracking without changing the display/body hierarchy. Check 360 and 390 px on a real device where possible. **Small.**
3. **PR: Astro Pop CSS vocabulary** — Add the small token layer; deduplicate flavor palette modifiers; reformat cart CSS; remove the commented declaration; relocate smooth-scroll ownership. Preserve all existing art-directed layouts. **Small/Medium.**
4. **PR: Responsive decoration rules** — Replace inline decorative style strings with data-backed modifier classes and scoped breakpoint rules. Compare 360, 768, 1024, and 1440 px screenshots. **Small.**
5. **PR: Astro Pop image delivery** — Create responsive AVIF/WebP derivatives with PNG fallback, add `picture`/`sizes`, intrinsic dimensions, and hero fetch priority. Validate visual fidelity and measure production LCP/transfer size. **Large.**
6. **PR: Optional interaction polish** — If desired after accessibility validation, add subtle motion or a fine-pointer-only themed cursor with reduced-motion, touch, forced-colors, and native-cursor fallbacks. **Medium.**
7. **Optional experiment: tablet plan grid** — Test a two-column delivery-plan variant at 640–959 px only if product feedback shows the current single-column sequence is too long. **Medium.**

The recommended first task is **PR 1, Astro Pop focus and state consistency**: it is low-risk, preserves the cart’s existing support, and improves the purchase-path controls before visual-system or asset work.
