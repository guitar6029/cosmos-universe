# CosmoPort Typography Assessment

## Scope

This review covers the homepage hero and the shared `DestinationSection` used by Aurora City, Pearlwater Coast, and Saffron Expanse. It is based on the current source styles, not a browser accessibility audit.

## Current font inventory

Fonts are loaded through `@nuxt/fonts` in [`nuxt.config.ts`](../nuxt.config.ts):

| Font                      | Current use                                                                  | Declared weights              |
| ------------------------- | ---------------------------------------------------------------------------- | ----------------------------- |
| Fontdiner Swanky          | Hero title and destination names                                             | `400` in component styles     |
| Cherry Cream Soda         | Hero supporting title, destination taglines, guide headings, and card titles | `400`                         |
| Georgia / Times New Roman | Fallback for display headings                                                | Browser fallback only         |
| `system-ui`               | Body copy, labels, controls, metadata, and fallback                          | `400`, with some `800` labels |

No explicit font weights or subsets are configured in Nuxt. The display fonts are used at regular weight; bold label weights belong to the system-font portions of the UI.

## Current hierarchy and sizing

### Hero — [`app/pages/index.vue`](../app/pages/index.vue)

- Kicker: `0.75rem`, weight `800`, `0.3em` tracking, reduced to `0.65rem` / `0.2em` on mobile.
- Main title: Fontdiner Swanky, `clamp(3.25rem, 7vw, 7.75rem)`, `0.88` line-height, `-0.06em` tracking.
- Supporting title: Cherry Cream Soda, fixed `2rem`, with no mobile-specific size.
- Description: Cherry Cream Soda, `clamp(1.0625rem, 1.15vw, 1.375rem)`, `1.5` line-height; mobile is `clamp(1.0625rem, 4vw, 1.1875rem)`.
- Small mark: `0.7rem`, weight `800`, `0.25em` tracking.
- Unused button rules remain in the page stylesheet (`.hero-actions` and `.hero-button*`), although no hero buttons are currently rendered.

### Shared destination sections — [`app/components/DestinationSection.vue`](../app/components/DestinationSection.vue)

Aurora City, Pearlwater Coast, and Saffron Expanse all use the same scale and hierarchy:

- Destination eyebrow: `0.72rem`, weight `800`, `0.28em` tracking.
- Destination name: Fontdiner Swanky, `clamp(3.5rem, 8vw, 8rem)`, `0.9` line-height, `-0.04em` tracking.
- Tagline: Cherry Cream Soda, `clamp(1.2rem, 2vw, 1.8rem)`, `1.25` line-height.
- Introduction: system font, `1.08rem`, `1.65` line-height.
- Guide heading: Cherry Cream Soda, `clamp(1.8rem, 3vw, 3rem)`.
- Guide subtitle: system font, `0.98rem`, `1.4` line-height.
- Card number: `0.72rem`, weight `800`, `0.2em` tracking.
- Card title: Cherry Cream Soda, `1.45rem`, `1.15` line-height.
- Card description: system font, `0.95rem`, `1.5` line-height.
- Status/fallback heading: Fontdiner Swanky, `clamp(3rem, 7vw, 6.5rem)`.

The wrappers [`PearlwaterCoastSection.vue`](../app/components/PearlwaterCoastSection.vue) and [`SaffronExpanseSection.vue`](../app/components/SaffronExpanseSection.vue) configure content and color themes but do not introduce separate typography, which keeps the three destination sections consistent.

## Findings

### Strengths

- The Fontdiner Swanky / Cherry Cream Soda pairing clearly supports the optimistic mid-century space-travel identity.
- Display, supporting, label, and body roles are visually distinct and repeat consistently across all destinations.
- Body line-heights (`1.5`–`1.65`) are generally comfortable for paragraph content.
- Responsive destination layouts switch to one column at `800px`, while the main display scale remains fluid through `clamp()`.

### Readability and consistency risks

1. The hero supporting title is fixed at `2rem`; it should scale at narrow widths so long copy does not wrap awkwardly or compete with the panel.
2. Destination names have a `3.5rem` minimum even on mobile. This is on-brand, but long names such as “Saffron Expanse” can dominate the first viewport and reduce room for the tagline and description.
3. Destination card titles use `1.15` line-height. That works for short titles but is tight for longer CMS content.
4. Very small uppercase labels (`0.65`–`0.72rem`) combined with wide tracking can become difficult to scan, especially on mobile or over busy imagery.
5. Several body and subtitle colors use translucent ivory. Contrast should be checked against each theme background, particularly the terracotta Saffron palette and image-backed hero panel.
6. The hero has both `.hero-title` and a broad `h1` rule. The class wins for the font and line-height, but the overlap makes the intended typography harder to maintain.
7. The unused `.cherry-cream-soda-regular` and hero button rules add noise and make the active type system less obvious.

## Recommended typography direction

Keep the current two-display-font pairing, but formalize the roles:

- **Fontdiner Swanky:** primary campaign titles and destination names only.
- **Cherry Cream Soda:** supporting slogans, taglines, guide headings, and attraction titles.
- **System sans:** descriptions, labels, controls, counters, and status messaging.

For the next typography pass:

1. Replace the hero supporting title’s fixed `2rem` with a responsive `clamp()` range and define a safe maximum line length.
2. Give destination headings a slightly smaller mobile upper bound while retaining the oversized desktop treatment.
3. Increase card-title line-height toward `1.25` and keep CMS descriptions at least `1.5`.
4. Use a shared set of typography custom properties for eyebrow, body, guide, card, and display sizes so all three destinations evolve together.
5. Verify text contrast at desktop and mobile widths against the hero image, panel artwork, Aurora/Pearlwater backgrounds, and Saffron’s clay background.
6. Consolidate the hero heading rules and remove unused typography/button rules once the hero content is considered stable.

These recommendations preserve the current retrofuturistic identity while improving the hierarchy’s resilience across destination names, CMS content, and small screens.
