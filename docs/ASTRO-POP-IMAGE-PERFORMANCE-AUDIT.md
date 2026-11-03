# Astro Pop image performance audit

Audit date: 2026-10-22
Scope: `public/images/astro-pop/**` and the Astro Pop page/cart references. No artwork, application code, dependencies, or image derivatives were changed.

## 1. Executive summary

Astro Pop currently serves **26 PNG files totaling 56,202,032 bytes (53.60 MiB)** from `public/images/astro-pop`. There are no WebP or AVIF assets, no `srcset`/`sizes`, and no configured image module or image-processing dependency. Because files in `public/` are served as-is, each image request downloads the full original PNG chosen by the markup.

The first page view is much heavier than the `loading="lazy"` attributes suggest. In a local browser measurement at a 1280 x 720 CSS-pixel viewport, 10 distinct Astro Pop image URLs were already observed as requested: **24.11 MiB of source PNG bytes**. That includes the hero, three large off-screen decorative assets, the testimonial background/sign, and all four flavor posters. The flavor posters are lazy in markup but are close enough to the viewport for the browser's lazy-load threshold.

The recommended proof of concept is the **hero first**: create visually reviewed responsive WebP derivatives (and an AVIF candidate) from its preserved PNG master, serve the responsive WebP derivative with a PNG fallback, and measure before expanding the approach. The hero is above the fold, is intentionally priority content, is 2.54 MiB today, and has the clearest user-facing payoff. Do not claim a byte-saving percentage until a quality-reviewed conversion is actually measured.

The simplest maintainable long-term approach is a small, explicit **Sharp build-time generation script** that produces committed static derivatives from preserved masters. It fits the present local-file Nuxt application, avoids a runtime image service/CDN, and makes widths and quality settings reviewable. Nuxt Image is a capable alternative if the team wants component-level responsive generation across the app, but it adds a module, markup migration, provider/deployment behavior, and a larger first optimization PR than this asset set requires.

## 2. Method and measurement boundaries

- Inspected every file in `public/images/astro-pop`, its bytes, PNG metadata, decoded dimensions, and alpha-channel pixels with Pillow. `Transparency` below means at least one alpha value is below 255, not merely that the PNG has an alpha channel.
- Inspected every Astro Pop component, page, data definition, CSS background, `package.json`, lockfile, and `nuxt.config.ts`. Neither `@nuxt/image` nor Sharp is declared/configured.
- Browser baseline: local Nuxt dev page at **1280 x 720 CSS px, DPR 1**. The browser observed the initial resource set and rendered bounds below. The browser runtime did not expose the Performance Resource Timing API, so **no HTTP transfer timings or compression ratios were measured**. The 24.11 MiB figure is the sum of the exact on-disk source bytes for those observed static PNG URLs; it is not represented as a timing measurement.
- No image conversion experiment was run: the task prohibits converting artwork. All WebP/AVIF savings statements are therefore deliberately qualitative and unverified.

## 3. Complete image inventory

Rendered dimensions are either the observed desktop bounds above (including CSS transforms where noted) or the CSS target/range. They are not a responsive source-selection mechanism. `Eager/default` means no `loading="lazy"` attribute; it does not use `fetchpriority` or a preload.

| Asset                                                  | Format / bytes / pixels / transparency | Component and role                                              | Approx. rendered size                                                                | Current loading                                              |
| ------------------------------------------------------ | -------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `accents/AstroPop Soda Co. Delivery Note.png`          | PNG; 2.96 MiB; 1536x1024; yes          | `AstroPopDeliverySection`; decorative note                      | 550px nominal width; 648x648 transformed bounding box measured                       | Eager/default, off-screen on initial view                    |
| `accents/CouponSavings.png`                            | PNG; 2.34 MiB; 1448x1086; yes          | No application reference found                                  | Not rendered                                                                         | Not requested                                                |
| `accents/DeliveredFreshStamp.png`                      | PNG; 2.31 MiB; 1254x1254; yes          | No application reference found                                  | Not rendered                                                                         | Not requested                                                |
| `accents/Vintage AstroPop Soda Bottle Opener.png`      | PNG; 1.65 MiB; 1774x887; yes           | `AstroPopFlavorSection`; decorative opener                      | 550px max nominal width; 615x482 transformed bounding box measured                   | Eager/default, requested initially                           |
| `accents/Vintage AstroPop Soda Cap.png`                | PNG; 2.14 MiB; 1254x1254; yes          | Page/Flavor/Delivery sections; repeated decoration (6 DOM uses) | 150px nominal width / 184x184 transformed bounds measured; one URL request is cached | Eager/default, requested initially                           |
| `bottles/AstroPop Atomic Cherry Fizz Bottle.png`       | PNG; 1.81 MiB; 1024x1536; yes          | Bottle selection and populated cart; product artwork            | Selection: 225x192 box; cart: 72x112 mobile, 88x128 desktop                          | Selection lazy; cart default/eager once a cart item exists   |
| `bottles/AstroPop Lunar Lime Lift Bottle.png`          | PNG; 1.78 MiB; 1024x1536; yes          | Bottle selection and populated cart; product artwork            | Same as Atomic Cherry                                                                | Same as Atomic Cherry                                        |
| `bottles/AstroPop Neptune Berry Fizz Bottle.png`       | PNG; 1.86 MiB; 1024x1536; yes          | Bottle selection and populated cart; product artwork            | Same as Atomic Cherry                                                                | Same as Atomic Cherry                                        |
| `bottles/AstroPop Retro Soda Quartet.png`              | PNG; 2.09 MiB; 1536x1024; no           | No application reference found                                  | Not rendered                                                                         | Not requested                                                |
| `bottles/AstroPop Solar Citrus Spark Bottle.png`       | PNG; 1.72 MiB; 1024x1536; yes          | Bottle selection and populated cart; product artwork            | Same as Atomic Cherry                                                                | Same as Atomic Cherry                                        |
| `cart/Retro Atomic Shopping Cart.png`                  | PNG; 1.61 MiB; 1314x1197; yes          | No application reference found                                  | Not rendered                                                                         | Not requested                                                |
| `delivery/AstroPop Delivers_ Retro Soda Adventure.png` | PNG; 2.69 MiB; 1448x1086; no           | `AstroPopDeliverySection`; delivery feature artwork             | Up to 608px CSS width; 512x384 measured                                              | Lazy                                                         |
| `delivery/astropop-crate-large.png`                    | PNG; 1.54 MiB; 808x768; yes            | `AstroPopDeliveryPlansSection`; plan artwork                    | 288–368px CSS height, 350x358 measured                                               | Lazy; `width`/`height` attributes supplied                   |
| `delivery/astropop-crate-medium.png`                   | PNG; 1.12 MiB; 655x768; yes            | `AstroPopDeliveryPlansSection`; plan artwork                    | Same plan-art box                                                                    | Lazy; `width`/`height` attributes supplied                   |
| `delivery/astropop-crate-small.png`                    | PNG; 0.85 MiB; 585x768; yes            | `AstroPopDeliveryPlansSection`; plan artwork                    | Same plan-art box                                                                    | Lazy; `width`/`height` attributes supplied                   |
| `drinks/AstroPop Atomic Cherry Fizz.png`               | PNG; 2.80 MiB; 1448x1086; no           | `AstroPopFlavorCard`; flavor poster                             | 478x362 measured in 2-column desktop grid                                            | Lazy, but observed requested on initial view                 |
| `drinks/AstroPop Lunar Lime Lift Retro Ad.png`         | PNG; 2.77 MiB; 1448x1086; no           | `AstroPopFlavorCard`; flavor poster                             | 478x362 measured                                                                     | Lazy, but observed requested on initial view                 |
| `drinks/Neptune Berry Fizz Space Adventure.png`        | PNG; 2.71 MiB; 1448x1086; no           | `AstroPopFlavorCard`; flavor poster                             | 478x362 measured                                                                     | Lazy, but observed requested on initial view                 |
| `drinks/Solar Citrus Spark Retro Poster.png`           | PNG; 2.50 MiB; 1448x1086; no           | `AstroPopFlavorCard`; flavor poster                             | 478x362 measured                                                                     | Lazy, but observed requested on initial view                 |
| `hero/AstroPopDeliveryMan.png`                         | PNG; 2.54 MiB; 1448x1086; no           | `pages/astro-pop/index.vue`; primary hero/LCP candidate         | 1233x632 measured; width is fluid and height is viewport-capped                      | Eager/default, requested initially; no priority hint/preload |
| `logos/AstroPop Pack Your Pop Logo.png`                | PNG; 1.92 MiB; 1377x1142; yes          | `AstroPopPackYourPopSection`; section logo                      | Up to 544px wide (about 451px high at intrinsic ratio)                               | Lazy                                                         |
| `testimonials/AstroPop Soda Housewife Portrait.png`    | PNG; 1.60 MiB; 1312x1199; yes          | `AstroPopDeliveryTestimonialsSection`; testimonial portrait     | 152x152 measured desktop; 90x90 mobile                                               | Lazy                                                         |
| `testimonials/Grandpa’s AstroPop Soda Endorsement.png` | PNG; 2.10 MiB; 1086x1448; yes          | `AstroPopDeliveryTestimonialsSection`; testimonial portrait     | 152x152 measured desktop; 90x90 mobile                                               | Lazy                                                         |
| `testimonials/Retro AstroPop Golf Advertisement.png`   | PNG; 2.15 MiB; 1122x1402; yes          | `AstroPopDeliveryTestimonialsSection`; testimonial portrait     | 152x152 measured desktop; 90x90 mobile                                               | Lazy                                                         |
| `testimonials/RetroFuturisticSuburbanUtopia.png`       | PNG; 2.60 MiB; 1672x941; no            | `AstroPopDeliveryTestimonialsSection`; CSS background           | `cover` over 1265x1152 section measured                                              | CSS background: eager request, no native lazy control        |
| `testimonials/TheNeighborhoodIsTalkingSign.png`        | PNG; 1.44 MiB; 1448x1086; yes          | `AstroPopDeliveryTestimonialsSection`; decorative heading sign  | 288–496px CSS width; 496x372 measured                                                | Eager/default, off-screen on initial view                    |

## 4. Largest assets and performance concerns

### Ten largest files

| Rank | Asset                                                  |     Size |
| ---- | ------------------------------------------------------ | -------: |
| 1    | `accents/AstroPop Soda Co. Delivery Note.png`          | 2.96 MiB |
| 2    | `drinks/AstroPop Atomic Cherry Fizz.png`               | 2.80 MiB |
| 3    | `drinks/AstroPop Lunar Lime Lift Retro Ad.png`         | 2.77 MiB |
| 4    | `drinks/Neptune Berry Fizz Space Adventure.png`        | 2.71 MiB |
| 5    | `delivery/AstroPop Delivers_ Retro Soda Adventure.png` | 2.69 MiB |
| 6    | `testimonials/RetroFuturisticSuburbanUtopia.png`       | 2.60 MiB |
| 7    | `hero/AstroPopDeliveryMan.png`                         | 2.54 MiB |
| 8    | `drinks/Solar Citrus Spark Retro Poster.png`           | 2.50 MiB |
| 9    | `accents/CouponSavings.png`                            | 2.34 MiB |
| 10   | `accents/DeliveredFreshStamp.png`                      | 2.31 MiB |

The four flavor posters are the largest interactive content group: **10.78 MiB** combined. They render at about 478x362 in the measured desktop layout versus 1448x1086 sources, and all four entered the initial browser resource set despite lazy markup. The biggest immediate inefficiency, however, is eager decoration: the 2.96 MiB delivery note, 2.14 MiB cap, 1.65 MiB opener, 1.44 MiB testimonial sign, and 2.60 MiB testimonial background are not needed to paint the hero.

Assets are substantially over-resolved for their display targets, especially the 1254px cap at 150px nominal width, 1,000+px bottle sources in 225x192 selection boxes and 72x112/88x128 cart slots, and 1,000+px testimonial portraits in 152px circles. The hero is not materially oversized at the measured desktop width (1448px source vs. 1233px rendered width), but it is oversized for small screens because the same 1448px file is served at every viewport.

## 5. Current loading behavior

### Observed initial browser resource set

At 1280x720/DPR 1, the following distinct Astro Pop URLs were observed as browser resources before manual scrolling: hero; cap; bottle opener; delivery note; testimonial sign; four flavor posters; and the testimonial CSS background. Their source-byte total is **24.11 MiB**. The cap is reused six times but is a single cached URL request.

This is an actual browser observation of which resources were fetched, not a simulated waterfall. Resource Timing was unavailable in the browser runtime, therefore request start times, transfer durations, and encoded transfer sizes could not be collected. The source bytes are a reliable static upper baseline for the local untransformed PNG payloads, but not a substitute for an HTTP waterfall on the production host.

### Markup/CSS findings

- The hero is the likely LCP image and is naturally eager because it has no `loading="lazy"`. It lacks explicit `width`/`height`, `fetchpriority="high"`, and a responsive `srcset`/`sizes` strategy. Do not lazy-load it.
- The four posters, selection bottles, delivery feature, crates, logo, and testimonial portraits use native lazy loading. Lazy loading alone does not constrain their source byte size, and the poster group is near enough to be fetched immediately at the measured viewport.
- `DecorativeImage` renders a plain `<img>` without `loading="lazy"`; it makes caps, the opener, and delivery note eager even when decoration is lower in the document. The testimonial sign is also eager.
- The testimonials `background-image` is CSS-based and is requested eagerly; native `<img loading="lazy">` cannot govern it.
- Only crate images carry intrinsic `width` and `height` attributes. Other content images can lack intrinsic layout reservation; adding dimensions/aspect ratios in a future implementation would reduce layout-shift risk.
- No responsive sources are available today: all images have one PNG URL and no `srcset`, `sizes`, `<picture>`, or transformed URL.

## 6. PNG vs. WebP vs. AVIF

| Format | Best use here                                                                              | Trade-offs                                                               | Audit conclusion                                                                                                     |
| ------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| PNG    | Masters, pixel-critical UI art, or a compatibility fallback                                | Large for photographic/painted art; all current production assets use it | Preserve as master; retain selectively as fallback rather than serving every master by default                       |
| WebP   | Default production derivative for hero, posters, backgrounds, portraits, and alpha artwork | Needs visual QA for retro texture/text edges; broad browser support      | First modern production target; supports transparency for decorative/bottle assets                                   |
| AVIF   | Optional additional source for large opaque artwork and possibly alpha artwork             | Slower encode/decode trade-off; visual QA and browser fallback required  | Evaluate after WebP proof of concept; use `<picture>` with WebP/PNG fallback only when measurements prove worthwhile |

Sharp can write WebP and AVIF output and reports output bytes/dimensions, which makes it appropriate for a controlled experiment. Its output docs also state that metadata is removed by default, so a future script must deliberately preserve any metadata that is relevant to artwork provenance. See the [Sharp output API](https://sharp.pixelplumbing.com/api-output/).

No conversion savings are estimated in this audit. A credible number requires generated candidates, fixed quality settings, automated byte capture, and a visual review at the actual display sizes. Those artifacts were intentionally not produced here.

## 7. Sharp vs. Nuxt Image

### Option A — Sharp static derivative pipeline (recommended)

Add Sharp only when implementation begins and create one repository script that reads immutable masters and writes a small, committed derivative matrix. Keep the page on ordinary static paths and use native `<picture>`/`srcset` where responsive variants matter. Record width, format, quality, source hash, and output bytes in a generated manifest.

Why it fits:

- Assets are local, finite, and largely stable; no runtime transformation service is needed.
- Outputs are reviewable in a focused PR and serve as ordinary cacheable static files in local development and production.
- A narrow width matrix can be tailored to actual CSS sizes rather than emitting arbitrary permutations.
- It has no CDN, external object storage, or provider configuration.

### Option B — Nuxt Image

Nuxt Image is not installed. It can produce optimized local URLs through its default IPX provider and supports `sizes`, density variants, lazy loading, preload, and WebP/AVIF picture formats; see [Nuxt Image `<NuxtImg>`](https://image.nuxt.com/usage/nuxt-img) and [providers](https://image.nuxt.com/get-started/providers). It is a valid future choice if the project expects numerous editorial images or wants a component convention across the full site.

It is not the simplest first change here: it requires adding `@nuxt/image`, module configuration, and component/markup migration, and its production behavior should be validated against the selected Nitro deployment mode. It also does not fix eager decorative requests by itself; loading policy and `sizes` still need deliberate component changes.

### Decision

Start with a Sharp-generated static hero proof of concept. Adopt Nuxt Image later only if repeated responsive-image markup and generated variants across multiple site areas outweigh the added module/runtime complexity. Keep selected PNGs where exact edges, translucent retro print texture, or comparison QA demonstrates a lossy derivative is unacceptable.

## 8. Original artwork preservation strategy

1. Treat current high-resolution PNGs as immutable masters; do not delete, overwrite, or recompress them.
2. When implementation is approved, place masters outside the deployed public path, for example `artwork/astro-pop/masters/`, and place only reviewed derivatives under `public/images/astro-pop/`. The generator reads masters and never edits them.
3. Commit a machine-readable manifest containing original filename, SHA-256, source dimensions, derivative settings, generated paths, and review date. This makes future art replacement and regeneration deterministic.
4. Avoid retaining both masters and duplicate full-resolution PNGs in `public/`; once a derivative is accepted, production should point only to the derivative/fallback set. Preserve the existing files until that migration PR is reviewed and accepted.
5. Because binary revisions permanently enlarge Git history, use Git LFS for masters only if the repository's hosting, contributor workflow, and quota are explicitly approved. Otherwise retain a carefully curated in-repository master set and avoid churn; do not introduce external storage in this work.

## 9. Ordered implementation backlog

Each item is intentionally small and independently reviewable.

1. **Hero experiment:** add a Sharp development dependency and a one-asset generator; make 1x/2x WebP candidates plus an AVIF candidate from the hero master outside `public`; record bytes and visual-review results. No broad migration.
2. **Hero delivery:** add only reviewed static hero derivatives and native responsive markup (`<picture>`/`srcset`/`sizes`), explicit dimensions, and high fetch priority/preload if the production measurement confirms it is LCP. Preserve the PNG fallback/master.
3. **Measurement gate:** run production-host Lighthouse/WebPageTest (desktop and representative mobile), capture LCP, image transfer totals, and visual comparison. Establish the before/after numbers that this audit cannot measure locally.
4. **Loading-policy PR:** make below-fold decorative image requests lazy/deferred where visually safe; reassess the testimonial background, sign, cap, opener, and delivery note. Do not change art formats in this PR.
5. **Poster responsive PR:** generate and integrate reviewed responsive WebP poster variants. Pay special attention to the initial lazy-load threshold and add intrinsic dimensions.
6. **Small-rendered-art PR:** handle bottles, portraits, caps, crates, logo, and other alpha artwork with dimensions tailored to their CSS boxes. Keep PNG for any asset that fails visual QA.
7. **Master/manifest PR:** introduce the masters/derivatives directory contract, generator manifest, documented command, and CI-style verification that derivatives are current. Consider Git LFS only after an explicit workflow decision.
8. **Nuxt Image decision:** revisit only after the static pipeline has shown whether component-level responsive generation would materially reduce repeated work.

## 10. Risks and expected benefits

Expected benefits are lower first-view image bytes, faster hero rendering on constrained networks, less decoding work for small decorative/product images, and predictable responsive delivery while retaining the Astro Pop visual identity. The hero-first experiment provides the cleanest way to validate both fidelity and impact before wider artwork changes.

Risks are visible artifacts in illustrated text/halftones, alpha-edge fringing, loss of original provenance, layout shift from incorrect dimensions, and unnecessary build/variant growth. Mitigate them with side-by-side visual sign-off at target breakpoints, PNG fallback where needed, immutable masters, a narrow width matrix, explicit intrinsic sizing, and measured production-host baselines. Do not optimize unused assets (`CouponSavings`, `DeliveredFreshStamp`, `AstroPop Retro Soda Quartet`, or `Retro Atomic Shopping Cart`) until a product decision makes them live.
