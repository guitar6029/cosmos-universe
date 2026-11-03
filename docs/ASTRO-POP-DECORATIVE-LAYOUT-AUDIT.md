# Astro Pop Decorative Layout Audit

Date: 2026-10-22
Scope: Astro Pop decorative imagery, ornamentation, containing blocks, clipping, stacking, and responsive placement. This is an analysis-only report; no application styles, assets, or behavior were changed.

## 1. Executive summary

Astro Pop has a strong, deliberately collaged 1950s-advertising treatment. Most decoration is appropriately local to its section: flavor-card stars are deliberately contained, delivery-plan rules are ordinary flow adornments, and the testimonial sign intentionally crosses the preceding section boundary. The existing visual language should be preserved.

The main architectural issue is that the generic `decorative-container` utility combines an absolute-positioning containing block with `overflow: hidden`. That is a useful local pattern, but it makes every decoration in the flavor and delivery sections a section-clipped layer. As a result, the flavor section's bottom cap has a fragile `top: 95%` placement, and the rotated delivery note is mostly obscured by the foreground delivery card at desktop widths. The latter two items are the only confirmed corrective work in this audit.

Recommendation: retain per-section decoration by default, retain the intentional edge crops, and use a small page-level or adjacent-section transition layer only where art is meant to bridge a boundary. Do not make all decorations global.

## 2. Decorative inventory

`DecorativeImage` renders a non-interactive, hidden-from-accessibility-tree `<img>` and establishes its own absolute positioning (`app/components/shared/DecorativeImage.vue:8-13,17-25`). Its nearest positioned ancestor therefore determines its coordinates; its `max-width: 100%` prevents intrinsic-width horizontal overflow but does not prevent an ancestor from clipping it.

| Section / decoration                     | Source and location                                            | Placement / visual intent                                                                                                      | Containing block and layer                                                                                                      | Classification                     |
| ---------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Hero radial glow                         | `app/pages/astro-pop/index.vue:52-71`                          | CSS radial background, centered at 50%/35%; no opacity or z-index. Supports the hero image without competing with it.          | `.astropop-hero` is `position: relative; overflow: hidden`; its background is intrinsically contained.                          | A — contained                      |
| Flavor top-left cap                      | `AstroPopFlavorSection.vue:9-12`                               | 150px, 45% opacity, -15°, `top:-6rem; left:-5rem`; an intentional corner crop.                                                 | Flavor section (`position: relative` through utility); z-index 0, beneath content z-index 1.                                    | B — intentional edge crop          |
| Flavor lower cap                         | `AstroPopFlavorSection.vue:14-18`                              | 150px, 45% opacity, -15°, `top:95%; left:5rem`; intended as a lower transition accent.                                         | Same section clipper. Its lower extent depends on computed section height and its generous but variable bottom padding.         | D — problematic / fragile          |
| Flavor right-edge cap                    | `AstroPopFlavorSection.vue:19-22`                              | 150px, 45% opacity, -15°, `top:50%; left:95%`; a deliberately partial right-edge crop.                                         | Same section clipper, z-index 0.                                                                                                | B — intentional edge crop          |
| Flavor interior cap                      | `AstroPopFlavorSection.vue:24-27`                              | 150px, 45% opacity, -15°, `top:30%; left:10%`, behind card content.                                                            | Same section clipper, z-index 0.                                                                                                | A — contained                      |
| Flavor bottle opener                     | `AstroPopFlavorSection.vue:30-34,75-77`                        | Up to 550px/75vw, 25° rotation at `top:30%; left:75%`; a large background collage fragment.                                    | Same section clipper, z-index 0 below content. At 1440px it is visibly cropped at the right edge as part of the composition.    | B — intentional edge crop          |
| Flavor-card ornaments, starbursts, rules | `AstroPopFlavorCard.vue:15,21-23,33-34,39-54,100-178`          | Small star glyphs, dashed artwork frame, and line/star/line divider; all use the card palette.                                 | `.flavor-card` is the positioned, `overflow:hidden` clipper. Artwork adds `isolation:isolate` and a transform stacking context. | A — contained                      |
| Pack Your Pop logo                       | `AstroPopPackYourPopSection.vue:33-41,123-134`                 | Large illustrated logo; it has meaningful alternative text and is primary section content, not a decorative accent.            | Normal flow. The section has `overflow:hidden` but no absolute decoration.                                                      | Excluded from decorative inventory |
| Delivery lower-left cap                  | `AstroPopDeliverySection.vue:29-33`                            | 150px, 45% opacity, -15°, `top:90%; left:-5rem`; partial lower-left crop.                                                      | Delivery utility container; z-index 0 behind the foreground panel.                                                              | B — intentional edge crop          |
| Delivery right-edge cap                  | `AstroPopDeliverySection.vue:35-39`                            | 150px, 45% opacity, -15°, `top:10%; left:95%`; partial right crop.                                                             | Delivery utility container; z-index 0.                                                                                          | B — intentional edge crop          |
| Delivery note                            | `AstroPopDeliverySection.vue:41-45,53-55`                      | Up to 550px/75vw, 45% opacity, -45°, `top:10%; left:5%`; intended as an oversized behind-panel paper layer.                    | Delivery utility container; z-index 0 while panel and content are z-index 1.                                                    | D — obscured at desktop            |
| Delivery-plan rules and star             | `AstroPopDeliveryPlansSection.vue:54,92-125`                   | 2px red pseudo-element rules and a centered teal star.                                                                         | Normal flow / pseudo-elements of positioned section; no clipping.                                                               | A — contained                      |
| Testimonial suburban background          | `AstroPopDeliveryTestimonialsSection.vue:79-94`                | Cover background with a light gradient overlay.                                                                                | Background of the testimonial section; `isolation:isolate`, `overflow:visible`.                                                 | A — contained                      |
| Testimonial sign                         | `AstroPopDeliveryTestimonialsSection.vue:36-41,96-105,285-299` | 18–31rem sign, negative top offset, responsive 82vw cap on narrow screens; intentionally overlaps the delivery-plans boundary. | Testimonials section; z-index 1 below content z-index 2; overflow is intentionally visible.                                     | C — intentional cross-section      |
| Testimonial portraits and speech tails   | `AstroPopDeliveryTestimonialsSection.vue:179-245`              | Circular portrait crop is content framing; pseudo-element tails extend 0.72rem from speech cards.                              | Portrait itself clips intentionally; the outer testimonial section remains visible to avoid clipping tails.                     | A — contained                      |
| Footer                                   | `AstroPopFooter.vue:41-141`                                    | Borders, typography, and text links supply the visual finish; there are no standalone decorative image layers.                 | Normal flow.                                                                                                                    | No standalone decoration           |

## 3. Parent hierarchy, clipping, and stacking analysis

### The shared `decorative-container` utility

`app/assets/css/main.css:5-8` defines one utility:

```css
position: relative;
overflow: hidden;
```

It is applied to the flavor section (`AstroPopFlavorSection.vue:8`) and delivery wrapper (`AstroPopDeliverySection.vue:6`). `position: relative` is useful: direct `DecorativeImage` children position against that section. `overflow:hidden` makes that same element the actual clipper for all descendants, including transformed ones.

This is not interchangeable with `overflow-x: hidden`. CSS overflow axes interact: setting one axis to `hidden`/`auto` can cause the other visible axis to compute to an auto-like clipping/scrolling value. A later implementation should not assume that `overflow-x: hidden` preserves vertical overhang; it must verify the computed values and visual behavior in the target browsers.

### Section-specific hierarchy

| Section        | Coordinate owner                                                                                                                                | Actual clipper                                                                                      | Stacking / responsive observations                                                                                                                                                                                                                                                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero           | `.astropop-hero` (`position:relative`)                                                                                                          | `.astropop-hero` (`overflow:hidden`)                                                                | No overhanging child art. The background is safely contained; the image is fluid to 124rem (`index.vue:65-71`).                                                                                                                                                                                       |
| Flavor         | Utility gives `.astropop-flavor-section` its containing block; content adds `position:relative; z-index:1` (`AstroPopFlavorSection.vue:63-69`). | The flavor section itself.                                                                          | `isolation:isolate` (`:56-61`) creates a local stacking context. Cap width changes to `min(150px,45vw)` and opener to `min(550px,75vw)` (`:71-77`), but their offsets do not change. Grid becomes one column below 680px (`:124-128`), changing the section height that percentage offsets depend on. |
| Flavor cards   | `.flavor-card` (`position:relative`) and `.flavor-card__artwork` (`position:relative`)                                                          | `.flavor-card` (`overflow:hidden`)                                                                  | Card decorations intentionally cannot escape. Artwork’s `isolation:isolate` and `transform` create another local stack (`AstroPopFlavorCard.vue:73-89`).                                                                                                                                              |
| Pack Your Pop  | No positioned decoration owner.                                                                                                                 | Section uses `overflow:hidden` (`AstroPopPackYourPopSection.vue:64-70`) but has no absolute accent. | Two-column controls begin at 760px; one-column at 420px. Removing its overflow is not warranted by the current source.                                                                                                                                                                                |
| Delivery       | Utility gives the outer `.astropop-delivery-section-container` its containing block.                                                            | The outer utility container, not the bordered `.astropop-delivery-section`.                         | The bordered panel is `position:relative; z-index:1` (`AstroPopDeliverySection.vue:58-74`) and hides z-index-0 paper art behind it. Layout changes to row at 760px (`:161-166`) with unchanged decoration offsets.                                                                                    |
| Delivery plans | `.astropop-delivery-plans` is relative (`AstroPopDeliveryPlansSection.vue:92-100`).                                                             | No overflow clipper.                                                                                | Rules/star participate in normal flow; plan badge is within its artwork card, not a page accent.                                                                                                                                                                                                      |
| Testimonials   | `.astropop-testimonials` is relative and isolated (`AstroPopDeliveryTestimonialsSection.vue:79-86`).                                            | No section clipper (`overflow:visible`). Portrait circles clip their own images.                    | The sign deliberately crosses upward; header top padding reserves space (`:107-120`). Narrow override reduces its negative top offset and width (`:285-299`).                                                                                                                                         |
| Footer         | No decorative containing block.                                                                                                                 | None.                                                                                               | No image decoration to escape or clip.                                                                                                                                                                                                                                                                |

## 4. Confirmed clipping and stacking findings

### DLAY-1 — Lower flavor cap is tied to a fragile percentage offset

- **Severity:** Medium
- **Location:** `app/components/astro-pop/AstroPopFlavorSection.vue:14-18,63-69`; `app/assets/css/main.css:5-8`
- **Behavior:** The lower cap is positioned at 95% of the flavor section height but is also clipped by that section. Its available bottom clearance is incidental: it changes as the two-column grid becomes a one-column grid below 680px and as content reflows. At 768px it appeared fully in the gap before Pack Your Pop; at 390px the transition reads as a partially isolated cap beneath the final card rather than a reliable boundary accent.
- **Root cause:** One element is responsible both for percent-based placement and overflow clipping. The art’s 150px physical extent is not included in `top:95%`.
- **Recommendation:** Choose the intended ownership before changing CSS. If the cap belongs to Flavor, anchor it with a bottom offset that guarantees its whole intended visible area inside Flavor. If it should bridge into Pack Your Pop, move it into a small transition layer owned by the two-section boundary (or a carefully anchored page-level layer) and allow only that layer to overflow visibly.
- **Side effects:** A cross-section layer needs an explicit z-index contract so it stays behind controls and above the section background. It must have narrow-width placement rules and be checked at the 680px grid breakpoint.
- **Effort:** Small

### DLAY-2 — Delivery note is hidden by the foreground panel on desktop

- **Severity:** Low
- **Location:** `app/components/astro-pop/AstroPopDeliverySection.vue:41-45,58-74,161-166`; `app/assets/css/main.css:5-8`
- **Behavior:** At 768px, a rotated portion of the delivery note remains visible below/left of the delivery card. At 1440px, the foreground panel covers the note almost entirely, so the intended paper-collage accent no longer materially contributes. The decoration does not obstruct content, but its visual payoff is inconsistent.
- **Root cause:** The note is z-index 0 in the same clipping container as a broad z-index-1 panel. The row layout at 760px changes panel coverage but the note’s 10%/5% placement is fixed.
- **Recommendation:** Keep it non-interactive and behind content, but reposition it into a visible peripheral gap at desktop, or intentionally remove it at the widths where it cannot be seen. A per-breakpoint `opacity:0` is preferable to maintaining an invisible asset if the desktop composition is better without it.
- **Side effects:** Moving it outward may need a dedicated visible-overflow transition layer; do not raise it above the panel where it could reduce text contrast.
- **Effort:** Small

## 5. Responsive visual verification

### What was actually checked

Browser screenshots were captured from the local Astro Pop route at these requested widths:

| Viewport | Areas observed                                                                               | Result                                                                                                                                                                                                                        |
| -------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 390px    | Flavor cards and Flavor-to-Pack transition; Delivery section; testimonial content/transition | No visible horizontal overflow in the sampled views. The one-column Flavor layout leaves the lower cap as a weak/partial transition accent. The delivery panel stays readable; lower-left cap appears as an intentional crop. |
| 768px    | Flavor-to-Pack transition; Delivery section                                                  | The lower Flavor cap is fully visible in the whitespace before Pack Your Pop. Delivery’s rotated note is partly visible below/left of the panel, and the right cap reads as a deliberate crop.                                |
| 1440px   | Flavor section; Delivery section                                                             | Right-edge opener and cap crop cleanly and do not obscure cards. Delivery remains legible, but the note is effectively hidden behind the wide panel. No visible horizontal overflow in sampled views.                         |

The inspection used screenshots and the rendered accessibility tree, not automated pixel comparison. Screenshots are point-in-time viewport samples; they do not prove absence of overflow at every scroll position or device/browser. The optional 360px and 1920px checks were not run. Computed-style inspection was not available in this browser session, so containing-block and overflow conclusions are source-code observations rather than browser-derived computed values.

### Confirmed visual observations

- The Flavor right-edge cap and bottle opener crop at 1440px as a coherent edge treatment; preserve them.
- The Testimonials sign is designed to bridge sections and uses an explicit responsive narrow-screen rule; retain its visible-overflow model. It did not visibly cover testimonial text in the sampled mobile view.
- The Delivery section’s lower-left and right-edge caps read as deliberate partial crops at the tested widths; preserve them.

### Source-observed responsive risks to validate after implementation

- `top:95%` on the flavor cap remains coupled to content height below 680px.
- The delivery note has no breakpoint-specific placement despite the panel switching from column to row at 760px.
- `overflow:hidden` prevents an intended cross-section accent from extending in either direction, even where the desired visual is vertical rather than horizontal.

## 6. Recommended decorative architecture

Adopt a hybrid ownership model rather than a global decorative canvas:

1. **Keep local, clipped layers** for decoration that is part of a single framed object: Flavor-card stars, artwork bursts, card rules, and hero background glow.
2. **Keep local, intentionally edge-cropped section layers** for the Flavor top/right caps, opener, and Delivery caps. The current section-local z-index 0 / content z-index 1 relationship protects usability.
3. **Introduce a narrowly scoped transition layer only for bridging art.** The lower Flavor cap is the first candidate. Its layer should be positioned relative to a wrapper that spans the Flavor/Pack boundary, use `pointer-events:none`, have an explicit z-index below interactive content, and contain its own responsive offsets.
4. **Retain Testimonials as an intentional cross-section exception.** Its current `overflow:visible`, isolated stacking context, sign z-index 1, and content z-index 2 are a clear, maintainable contract; use this as the model if another section genuinely needs to bridge.
5. **Do not create a global page decoration layer yet.** It would introduce coupling across all sections and make the current local artwork harder to reason about. Revisit only if more than two additional boundary accents need the same orchestration.

## 7. Optional creative enhancements

These are not confirmed problems and should be considered only after DLAY-1 and DLAY-2:

### OPT-1 — Make the bottle opener’s collage role more intentional on compact layouts

- **Severity:** Low
- **Location:** `app/components/astro-pop/AstroPopFlavorSection.vue:30-34,75-77`
- **Behavior:** The opener is strongly cropped at desktop and appears mainly as a peripheral collage fragment; that is stylistically valid, but it has less recognizable visual value on small screens.
- **Recommendation:** If desired, add a compact breakpoint placement that exposes one recognizable end of the opener without moving it above card content. Preserve the desktop crop.
- **Scope:** Small

### OPT-2 — Add one low-opacity transition motif only after ownership is explicit

- **Severity:** Low
- **Location:** Flavor/Pack boundary, if DLAY-1 is addressed with a transition wrapper
- **Behavior:** The transition currently relies on a single cap whose placement varies with content height.
- **Recommendation:** A second subtle starburst or small cap may reinforce the handoff, but only inside the proposed transition layer and only if it improves the composition at 390px and 768px. Do not add decoration to Pack Your Pop simply to fill whitespace.
- **Scope:** Small

## 8. Implementation tasks in dependency order

### PR 1 — Establish the Flavor/Pack boundary owner

- **Addresses:** DLAY-1
- **Scope:** Small
- **Work:** Decide whether the lower cap belongs inside Flavor or spans the Flavor/Pack boundary. Implement the smallest corresponding wrapper/placement change; preserve the top and right edge crops. Test 390px, 680px, 768px, 1440px, and keyboard focus on Pack Your Pop controls to ensure layer order is non-interfering.

### PR 2 — Make the delivery-note treatment intentional at desktop

- **Addresses:** DLAY-2
- **Scope:** Small
- **Work:** Either position the note in visible negative space for row layouts or hide it at those widths. Keep it behind panel content and preserve the existing delivery caps. Test 390px, 768px, and 1440px.

### PR 3 — Optional compact collage polish

- **Addresses:** OPT-1 / OPT-2 only
- **Scope:** Small
- **Work:** After PRs 1–2, make any small-screen opener or transition motif adjustment that survives visual review. Do not combine this optional art direction work with clipping fixes.

## 9. Non-findings / preserve as-is

- Hero image, Pack Your Pop logo, delivery artwork, plan crate images, and testimonial portraits are meaningful content images, not disposable decoration.
- Flavor-card `overflow:hidden` is appropriate because it clips deliberately oversized artwork and ornaments inside a framed card.
- Testimonial speech-tail overflow is intentional and is protected by the outer section’s `overflow:visible`.
- Footer needs no additional decorative image layer; its borders and typography finish the page without visual noise.
