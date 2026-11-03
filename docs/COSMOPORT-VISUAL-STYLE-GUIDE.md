# CosmoPort Visual Style Guide — Working Notes

> **Status:** Art-direction exploration, not approved canon. This document records creative decisions and vocabulary for future CosmoPort imagery. It is not an implementation task or a new Sanity schema.
>
> **Scope:** One recognizable fictional universe with several intentional visual treatments. Images can look like vintage advertisements, polished illustrations, editorial photographs, or film stills without losing their shared identity.

## The key distinction: world design versus image treatment

Retrofuturism / Atompunk describes the **world**: mid-century optimism, Googie architecture, rocketliners, bubble-domes, chrome appliances, domestic robots, space tourism, and playful consumer advertising.

A separate set of choices determines **how we see that world**:

| Dimension               | Questions to decide                                                                                       | Useful vocabulary                                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Medium / rendering      | Is this gouache or ink on paper, a digital painting, a photographic/CG render, or a simulated film frame? | Hand-painted, screen-printed, digital illustration, editorial photography, photorealistic 3D, cinematic still         |
| Surface finish / gloss  | Which objects are matte, satin, lacquered, reflective, or weathered?                                      | Paper grain, brush marks, soft sheen, polished enamel, chrome, roughness, specular highlights                         |
| Light / exposure        | Where is the light coming from? How hard, soft, warm, bright, or contrasty is it?                         | Diffuse daylight, directional sunlight, studio softbox, practical tungsten lights, rim light, high-key, low-key       |
| Camera / composition    | What point of view, framing, lens behavior, and depth separation should the image imply?                  | Poster composition, eye-level, low angle, portrait framing, wide establishing shot, 35mm lens, shallow depth of field |
| Color / finishing       | How saturated, aged, and film-like is the result?                                                         | Limited print palette, pastel turquoise/coral/cream, warm color grade, halation, subtle film grain                    |
| Texture / believability | Do we want idealized forms or signs of use and physical material?                                         | Simplified painted shadows, paper aging, fabric weave, fingerprints, surface wear, atmospheric haze                   |

**Important:** "Glossy" is not itself a medium or a realism level. A hand-painted chrome car can be glossy; a photorealistic paper brochure can be matte. Likewise, "cinematic lighting" alone does not turn an illustration into a convincing film still: the rendering medium, materials, lens treatment, and finishing must also change.

## Four useful visual treatments

The five shared inspiration images discussed on 2026-10-19 illustrate these families. Their source images remain inspiration only; do not add third-party reference assets to the repository without appropriate rights.

| Treatment                                           | Character                                                                                                                                                                                                                                              | Suggested CosmoPort use                                                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| **A. Vintage commercial illustration**              | Mid-century gouache/paint and ink, visible print/paper texture, simplified shading, slightly imperfect registration, matte look. Like the illustrated train passengers reference (image 7).                                                            | In-universe period brochures, sponsor advertisements, fictional packaging, travel posters                         |
| **B. Polished retro illustration**                  | Digitally refined mid-century illustration with smooth gradients, luminous pastels, confident shapes, selective reflections, and readable scenes. Like the futuristic family diner reference (image 8).                                                | Main landing-page hero, vacation finder artwork, illustrated destination cards and campaign materials             |
| **C. Retro editorial / studio photography**         | Stylized but materially convincing fashion/product imagery; controlled studio light, sculpted face and product lighting, glossy helmet/chrome or lacquer details. Like the mint space-helmet portrait (image 10).                                      | Character portraits, product reveals, Starline Motors or other in-universe premium campaigns                      |
| **D. Cinematic environmental realism / film still** | Photorealistic or near-photorealistic locations, physically plausible materials, atmosphere, motivated/practical lights, filmic color grade, depth of field. Like the mint-green sky pod (image 9) and the orange robot diner scene (final reference). | Destination feature imagery, immersive location previews, narrative scenes, future image-to-video starting frames |

**Film still versus studio photograph:** A studio photograph typically feels staged and controlled, with isolated subjects and intentionally sculpted light. A film still suggests a moment within a larger story: people interacting, motivated set lighting, environment detail, depth separation, and a camera situated inside the action. Both can be photorealistic, and both may be produced with AI or 3D rather than a physical camera.

**Illustration versus photograph:** Even with realistic shadows, a painted image keeps evidence of constructed brushwork, simplified edges, stylized anatomy, and illustrative color. Photographic or CG realism requires believable optics, fine material detail, and coherent physical illumination.

## Initial CosmoPort direction (proposal)

- **Primary brand/marketing language:** Treatment B — cheerful, highly art-directed polished retro illustration.
- **In-universe advertising and collectibles:** Treatment A — an intentionally older printed look; this contrast helps sell the fiction.
- **Destination previews and atmosphere:** Treatment D — the advertised dream seen as a tangible place.
- **Optional portraits and product campaigns:** Treatment C — deliberately glossy, composed like retro commercial photography.

These are **asset-level choices**, not different website themes, render engines, or user-selectable settings. We can use one or two treatments for the MVP and introduce others only when they help the story. Do not attempt to fill every style category before shipping.

A useful storytelling contrast: the travel poster promises a pristine illustrated paradise (A/B); the destination preview lets the visitor imagine stepping into a physical world (D).

## Shared-universe continuity rules

Different rendering treatments should still preserve:

1. **Object and character identity:** the same face, hairstyle, silhouette, wardrobe, recurring family members, rocketliner design, robots, and vehicle model geometry.
2. **Brand identity:** exact logo, wordmark, insignia, slogan, and recognizable packaging shapes for CosmoPort, Atomic Cluster, Mike & Mike's, Starline Motors, etc.
3. **Design language:** mid-century-future architecture, optimistic silhouettes, integrated atomic-age technology, and a related palette of cream, turquoise, coral, mustard, navy, and chrome.
4. **Lore and physical details:** products and locations have stable names; recurring props and companies do not mysteriously change shape between images.
5. **Intentional style variation:** an illustration and a simulated film frame can portray the same scene, but do not accidentally switch treatments within one campaign or matched image set.

Keep a small **approved master reference** for recurring characters, products, vehicles, and places. For characters, capture front/three-quarter/profile views and stable clothing/accessory details. For important fictional brands, render or overlay the exact approved logo/label rather than asking AI to reproduce lettering perfectly. Use existing approved reference images on each new generation or edit; chat history and seeds alone are not reliable identity locks. Generative tools cannot guarantee 100% visual identity across independent outputs, so review and correct drift before publishing.

## Image brief template

For a new asset, record only what is useful:

- **Asset / placement:** e.g., home hero, Aurora City destination preview, Atomic Cluster print ad.
- **Story / subject:** who or what happens; which approved people, props, buildings, and brands appear.
- **Treatment:** A vintage illustration / B polished illustration / C studio editorial / D cinematic realism.
- **Medium:** paint/ink and paper, digital painting, photographic/CG, or film-frame appearance.
- **Finish and materials:** matte / satin / lacquer / chrome; weathered or pristine; degree of gloss on specific objects.
- **Lighting and exposure:** source, direction, softness, color temperature, contrast, time of day.
- **Camera and framing:** angle, crop/aspect ratio, wide/medium/close-up, lens/depth-of-field behavior when relevant.
- **Color and texture:** palette, saturation, print grain or film grain, surface detail.
- **Required references:** approved character/environment/vehicle master assets and their versions.
- **Approval:** what identity details were checked, final output location, usage/provenance rights.

This is an **art-production note**, not a requirement to add each field to Sanity. Finished web assets can be uploaded to Sanity as ordinary images until a real CMS workflow needs more structure.

## Starting prompt language (examples)

### Vintage brochure (A)

"1950s hand-painted interplanetary travel advertisement, gouache and ink on textured paper, simplified painted shading, restrained turquoise/coral/cream print palette, slightly aged magazine reproduction; [approved CosmoPort vehicle reference]."

### Polished hero illustration (B)

"Modernized mid-century commercial illustration, clean confident retro shapes, luminous pastel colors, sophisticated directional daylight, refined highlights on chrome, smooth painterly shading, cinematic composition **while remaining visibly illustrated**; [approved character/environment references]."

### Studio portrait / product ad (C)

"Space Age editorial studio portrait, physically believable enamel and chrome, carefully sculpted soft key and rim lights, controlled background, crisp silhouette, high-end retro advertising photography; preserve [approved outfit/helmet/product geometry]."

### Narrative destination frame (D)

"Photorealistic retrofuturist film still, convincing materials and environmental scale, warm practical lights, atmospheric depth, natural skin/fabric detail, subtly filmic color grade, restrained grain and depth of field; preserve [approved architecture and character references]."

Avoid generic instructions like "make it more retro," "make it glossy," or "make it cinematic" without specifying **what changes and what must remain fixed**.

## Small, testable first step

1. Approve one **CosmoPort salesman**, one **rocketliner**, and one **hero illustration treatment (B)**.
2. Reuse those exact references to make three scenes; compare facial identity, silhouette, clothing, palette, typography, and object design.
3. Make one alternate scene using treatment D while preserving the character and rocketliner design; review the difference between rendering treatment and world identity.
4. Save only approved assets and brief notes; produce the MVP landing page before building a larger image library, custom image service, or additional app.

## Explicitly not in scope yet

- Runtime AI image generation, extra API services, or model fine-tuning
- A multi-style switcher in the public website
- A comprehensive asset-management backend or complicated Sanity schemas
- Video production before the important static image masters are settled

**Working principle:** _One universe, recognizable designs, deliberately different lenses on the same world._
