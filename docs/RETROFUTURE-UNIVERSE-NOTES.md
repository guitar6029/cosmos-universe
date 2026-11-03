# The Radiant Age — Shared Universe Notes

> **Status:** Creative exploration, not final canon. Names, slogans, planets, and product ideas below are working concepts unless explicitly approved later.
>
> **Historical planning note:** This document captures early world-building ideas from before the Cosmos Universe launch. The current ecosystem contains multiple experiences, and CosmoPort Voyage remains a distinct mini-app. For shipped capabilities and current priorities, see the repository README.

## The big idea

CosmoPort Voyage can be more than an isolated fictional space-tourism website. It can be the first window into an interconnected retrofuturistic universe: an alternate future imagined through the optimistic, consumer-oriented lens of the 1950s.

Humanity has settled distant worlds. Families vacation by rocketliner. Atomic-powered cars and domestic robots are everyday conveniences. Radio stations broadcast across colonies, and every corporation is eager to sell the next miracle product.

The universe should feel much larger than any one application. A visitor may encounter a cereal advertisement, a robotic hotel concierge, or a particular automobile model in a CosmoPort illustration. Those details establish recurring companies and lore. Any of those companies _could_ someday become the subject of its own small application.

**Creative north star:** _The future is fantastic — and the advertisements insist it is even better._

## Tone and visual identity

Our current preference is a blend of two modes:

1. **Bright retrofuture:** glamorous interplanetary travel, appealing gadgets, Googie architecture, cheerful illustrated advertisements, heroic rockets, and inviting planetary resorts.
2. **Gentle corporate satire:** absurd slogans, questionable inventions, overenthusiastic spokespeople, suspiciously reassuring safety claims, and companies competing for attention.

A working tonal ratio is roughly **75% hopeful wonder / 25% playful corporate absurdity**. This is a direction to test, not an enforced formula. The experience should be charming, lively, and original rather than grim, relentlessly cynical, or dependent on recognizable franchises.

Visual references and ingredients:

- Mid-century commercial illustration and fictional travel posters
- Atomic Age / Atompunk industrial design, chrome, fins, ray-gun geometry
- Googie architecture, bubble-domed vehicles, sky-trams, rocketliners
- Cream, turquoise, coral, mustard, deep navy, and metallic accents
- Printed brochures, cereal packaging, airline tickets, radio dials, period advertisements
- A contrast between immaculate marketing claims and occasionally ridiculous fine print

Avoid copying specific brands, characters, artwork, or protected iconography from Fallout or other existing properties. The world should have its own identity.

### Image treatments, medium, and cinematic language

Visual consistency does **not** mean every image must look like it was made with the same medium. We can show the same fictional world through several intentional treatments:

- **Vintage print illustration:** gouache/ink, paper texture, simplified shadows, matte commercial art for brochures, packaging, and period ads.
- **Polished retro illustration:** smooth painterly gradients, clearer dimensional lighting, luminous pastels, selective glossy chrome for CosmoPort's main marketing.
- **Retro studio editorial:** sculpted portrait/product lighting, photographed-or-CG realism, controlled reflections and lacquer finishes for characters and product campaigns.
- **Cinematic realism:** convincing physical environments and materials, motivated light sources, camera/lens depth, atmospheric haze, and film grading for immersive destination previews and future motion work.

Medium, surface gloss/roughness, lighting/exposure, camera framing, texture, and color treatment are separate art-direction choices. A glossy surface is not synonymous with photorealism; a film still is not the same as a studio product photograph. Preserve approved character faces, outfits, vehicle silhouettes, logos, and recognizable locations as treatments change.

**CosmoPort proposal:** polished retro illustration as the primary website language; vintage print for fictional sponsor advertisements; cinematic realism for selective destination reveals. Start with one recurring character, one rocketliner, and approved master references before widening the asset library.

See [CosmoPort Visual Style Guide](./COSMOPORT-VISUAL-STYLE-GUIDE.md) for image-treatment vocabulary, lighting/material/camera brief fields, example prompts, continuity checks, and the minimal production workflow. These are documentation notes—not new MVP features, backend work, or Sanity document types.

## Setting foundations — working concepts

| Element                       | Current idea                                                                  | Status                 |
| ----------------------------- | ----------------------------------------------------------------------------- | ---------------------- |
| Shared setting                | **The Radiant Age**                                                           | Working universe title |
| Era                           | An alternate, spacefaring future imagined through 1950s optimism              | Direction              |
| Space travel                  | Commercially ordinary: rocketliners, spaceports, interplanetary tourism       | Direction              |
| Technology                    | Atomic propulsion, domestic robots, exotic vehicles, orbital infrastructure   | Direction              |
| Commercial culture            | Brands, endorsements, jingles, slogans, consumer gadgets, corporate rivalries | Central motif          |
| First featured planet         | **Velora-7**                                                                  | Working name           |
| First featured travel regions | **Aurora City**, **Pearlwater Coast**, **Saffron Expanse**                    | Working names          |

We do **not** need a complete timeline, a map of the galaxy, hundreds of settlements, or scientific explanations for every device. Consistency matters more than encyclopedic detail.

## Fictional company directory

These companies are early lore seeds and possible future app concepts, not an implementation backlog.

| Company                       | In-universe role                                                    | Working slogan / personality                                                                          | Potential standalone experience                                                        |
| ----------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **CosmoPort Voyage**          | Interplanetary travel agency and the entry point into the setting   | _Your World Away!_ Cheerful, aspirational, polished                                                   | Destination browser, vacation finder, shareable itinerary and printable travel dossier |
| **Atomic Cluster Cereal**     | Mass-market atomic breakfast cereal                                 | _You'll go bunkers for every bite!_ Mascots, collectible rocket toys, improbable nutritional promises | Playful product marketing microsite, interactive cereal box, collector experience      |
| **Mike & Mike's RoboFactory** | Domestic and industrial robot manufacturer                          | _Two Mikes. A Million Possibilities!_ Two founders with competing ideas about robots                  | Build-a-Robot configurator, lightweight factory-management simulator                   |
| **Starline Motors**           | Atomic-powered cars, cruisers, and futuristic family transportation | _Tomorrow Drives Today!_ Glossy styling and exceedingly confident safety advertising                  | Retro automobile catalog or vehicle configurator                                       |
| **Galaxy Wave Broadcasting**  | Interplanetary news, entertainment, radio, and advertising network  | _The Voice of a Thousand Worlds!_ Jingles, broadcasts, personality-driven presenters                  | In-universe radio player, curated programs and commercials                             |

Additional companies may arise naturally from illustrations, destinations, stories, or product references. Resist building a large company taxonomy before it becomes useful.

### Seeds of personality and lore

- **Atomic Cluster:** Every cereal box might promise an impossible prize or contain a collectible rocket. Its commercials are relentlessly cheerful.
- **Mike & Mike's:** The two founders disagree about robot personalities, repairability, or whether robots should be allowed to complain. Product descriptions reveal their rivalry.
- **Starline Motors:** Advertising treats its latest Atomic Cruiser as perfectly ordinary and unreasonably glamorous; the fine print hints at colorful product history.
- **Galaxy Wave:** A radio announcer can mention travel delays, sponsors, new inventions, weather on distant worlds, and events at other fictional companies.
- **CosmoPort:** A brochure can enthusiastically frame a moderately alarming planetary attraction as a once-in-a-lifetime adventure.

These are storytelling prompts, not facts the application must simulate.

## How the universe feels connected

Crossovers should be visible and optional. They begin as _set dressing_, not technical integrations.

**Example: A CosmoPort visit to Aurora City**

1. The brochure illustration shows a **Starline Motors** cruiser outside the hotel.
2. A billboard advertises **Atomic Cluster Cereal**.
3. A **Mike & Mike's** hotel robot carries luggage.
4. A radio in the lobby plays **Galaxy Wave Broadcasting**.
5. A vacation package includes a playful sponsor promotion: a complimentary Starline cruiser excursion.

Someone who notices the brand names repeatedly begins to recognize a shared culture. If we eventually build Starline Motors as a standalone app, an in-universe ad or subtle link can lead there.

Crossovers can also appear in:

- Product packaging, model numbers, warranties, and collectible inserts
- Advertising posters, jingles, sponsorships, and corporate endorsements
- Hotel amenities, shops, automobiles, signage, public transport
- Editorial news stories or radio segments
- Small jokes repeated across separate applications

**Important:** Do not create fake storefronts, dead links, or unbuilt routes merely to imply a large universe. For now, illustrations and copy are enough.

## The application-universe opportunity

Each brand may provide a different, self-contained project and a different engineering challenge.

| Experience                | Main interaction                                   | Possible skills to explore                            |
| ------------------------- | -------------------------------------------------- | ----------------------------------------------------- |
| CosmoPort Voyage          | Choose a holiday and receive a travel itinerary    | Nuxt, Sanity, SEO, recommendations, testing           |
| Atomic Cluster Cereal     | Explore a brand and its collectible packaging      | Motion design, playful UI, storytelling               |
| Mike & Mike's RoboFactory | Configure robots or manage a small production line | State modeling, simulation, interactive dashboards    |
| Starline Motors           | Configure an Atomic Cruiser                        | Reactive UI, product customization, possibly 3D later |
| Galaxy Wave Broadcasting  | Tune a fictional interplanetary radio              | Audio UX, curated media, time-based interactions      |

If spin-offs materialize, they can be separate repositories and independently deployed websites. Sharing lore does **not** imply shared authentication, databases, APIs, microservices, or deployment infrastructure. A common design system could be extracted only when there is demonstrated reuse.

This makes the universe a coherent collection of projects rather than one enormous application.

## Interactive business ideas — 2026-10-20 brainstorm

> **Idea parking lot, not a roadmap or approved canon.** Everything here is optional. The goal is a collection of entertaining, connected experiences, not a real-world SaaS platform or a commitment to build every business.

### The visitor promise

CosmoPort can eventually be one attraction in a wider, curated retrofuturistic universe: fictional businesses that visitors can actually _play with_. Fun, humor, nostalgia, discovery, and memorable interactions are valid outcomes. Some experiences may teach real integration or engineering skills; none needs enterprise complexity merely to justify its existence.

A visitor might plan an imaginary vacation, tune a radio, configure a robot, explore a diner, or order an absurdly cheerful soda delivery. Each experience should offer at least one satisfying interaction or takeaway, not just more images and text.

### Candidate attractions and technical experiments

| Working experience                | Small, entertaining interaction                                                                                                                 | Distinct visual approach                                                                  | Optional skills to explore                                                                                                                            |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AstroPop Soda Co.**             | Choose flavors and a daily, weekly, every-two-weeks, or monthly visit from a fictional soda delivery person; receive a period-style order slip. | Pencil-and-ink characters, halftone print, soda packaging, cheerful 1950s advertisements. | Reactive forms, plan selection, validation; optionally payment-provider **test mode** and subscription webhooks in a later, explicitly approved task. |
| **Atomic Diner**                  | Wander one small retro diner, talk to a few characters, order food, and play a jukebox.                                                         | Pixel art or a deliberately stylized 2D game world with warm neon and Googie interiors.   | Canvas or a small game framework, dialogue trees, game state, lightweight audio. No multiplayer needed.                                               |
| **Tomorrow's Gazette**            | Read fictional news, sign up for an imaginary newspaper route, and assign or rearrange a handful of delivery stops.                             | Newsprint, monochrome photography, editorial columns, hand-inked cartoons.                | Client-side route state first; optionally a tiny CRUD API or persistence if a clear interaction requires it.                                          |
| **Mike & Mike's RoboFactory**     | Mix robot bodies, heads, tools, colors, and dubious household upgrades; generate an absurd product specification or order form.                 | Retro product catalog, exploded technical diagrams, polished showroom illustrations.      | Configurator state, conditional options, optional on-demand Three.js preview; a playful small-scale storefront parody.                                |
| **Tomorrow Homes Realty**         | Browse fictional properties, filter homes, inspect floor plans, and take an exaggerated sales tour with domestic robots.                        | Mid-century real-estate brochures, staged family photography, optimistic suburban ads.    | Search/filter UI, floor-plan interactions, optional 3D tours or mock inquiry forms.                                                                   |
| **CosmoPort / Galaxy Wave Radio** | Tune in to laid-back Space Age lounge music, adjust volume, and encounter station IDs or fictional commercials.                                 | Bakelite knobs, glowing radio dials, analog broadcast graphics.                           | HTML audio, playback state, user-initiated sound and accessible controls; no autoplay with sound.                                                     |

These are **working names and experiments**. The original seeds—Atomic Cluster Cereal, Starline Motors, Galaxy Wave Broadcasting, and other companies—remain possible future attractions. Naming an idea here neither changes the approved brand direction nor starts implementation.

### One era, several artistic lenses

The connective tissue is the same optimistic 1950s-inspired spacefaring society, recurring companies, recognizable products, and gently absurd corporate culture. The individual applications need **not** share an identical visual theme:

- **CosmoPort Voyage:** glossy, cinematic, destination-focused travel imagery and luxury brochures.
- **AstroPop:** matte commercial illustration, pencil/ink, imperfect printing, expressive delivery characters.
- **Atomic Diner:** a cohesive pixel-art or illustrated game treatment rather than photorealistic travel imagery.
- **Gazette:** traditional newspaper layouts, halftones, advertisements, and retro editorial typography.
- **RoboFactory and real estate:** product-showroom, technical-catalog, or staged commercial photography treatments.
- **Radio:** tactile vintage hardware, broadcast dials, and animated but restrained feedback.

Treatments differ by fictional business, while lore, era, and recurring designs keep them connected. Preserve readability, responsiveness, reduced-motion preferences, and sensible asset budgets.

### Possible central portal and deployment evolution

If a second experience becomes real, the root page could eventually become a **World's Fair-style directory or entertainment portal** connecting the fictional businesses, while the current CosmoPort travel homepage moves into a dedicated Voyage section. This is a future design exploration, **not authorization to change today's routes or homepage**.

1. **Start together:** keep small experiences as separately styled routes/features in the existing Nuxt application. Load game engines, 3D viewers, audio, and large assets only when visitors enter the corresponding experience.
2. **Keep boundaries light:** each attraction owns its specific components and assets; shared navigation or lore links can be simple. No common database, authentication system, event broker, or microfrontend framework is required.
3. **Split selectively later:** if an attraction develops a distinct build pipeline, dependency footprint, deployment rhythm, or substantial performance demands, it may become its own repository and deployment with a link from the central portal.

Independent visual identity does not require independent infrastructure. Conversely, sharing a fictional universe does not require shared backend services.

### Real integrations without turning everything into SaaS

- A fake newspaper delivery route, fictional order receipt, boarding pass, or robot specification can be fully client-side and still feel complete.
- When an integration itself is the learning objective, keep it tightly scoped: e.g., a payment provider's sandbox for AstroPop subscription lifecycle/webhook experience, or minimal persistence for Gazette deliveries.
- **Never charge real money for imaginary goods.** Real payment collection would require a clearly defined real product or service, honest fulfillment terms, and separate approval and planning; it is not part of these ideas.
- Build one fun, finished interaction per attraction before extending it. Avoid speculative APIs, subscriptions, identities, cross-app state, or infrastructure.

### Current priority and anti-backlog rule

Complete the existing CosmoPort destination experience and its lightweight vacation-finder / itinerary / souvenir boarding-pass loop first. Radio or an illustrative AstroPop micro-experience may be natural next experiments after that, but this page is deliberately **not** a sprint plan.

Choose future work by three questions: _Would a visitor enjoy interacting with it? Can we finish a satisfying small version? Is the technology justified by the experience or learning goal?_ If not, leave the idea here for later.

## CosmoPort remains the first finished product

The initial product goal has not changed:

> A visitor can explore three gorgeous destinations on one inhabited planet, answer a short vacation-finder questionnaire, receive a personalized itinerary, and print or share a retro travel dossier.

Suggested minimal flow:

1. **Discover:** explore the fictional travel agency and its destinations.
2. **Choose:** select vacation type (City, Coast, Adventure), duration (3, 5, 7 days), and an interest or mood.
3. **Match:** recommend a destination using simple deterministic logic and Sanity-managed content.
4. **Plan:** assemble arrival, departure, and matching experiences into an itinerary.
5. **Take away:** present the result as a vintage travel dossier or boarding pass.

No runtime AI service or large custom backend is required to make that experience satisfying.

### First destination concepts

- **Aurora City — City:** sky-trams, sparkling architecture, cultural attractions, floating markets, and rooftop jazz.
- **Pearlwater Coast — Relaxation:** crystalline seas, domed beachfront resorts, and leisurely holidays.
- **Saffron Expanse — Adventure:** golden deserts, extraordinary rock formations, and observatories beneath alien skies.

Treat the planet and destination names as working titles until we approve them.

### Practical launch boundary

**In scope for CosmoPort V1**

- One inhabited planet, three destination regions
- Illustrations and retrofuturistic brand presentation
- Sanity-managed destination and experience content
- Vacation-finder preferences and matching
- A generated itinerary and printable/shareable travel dossier
- Responsive, accessible pages and appropriate tests/SEO

**Explicitly out of scope**

- Procedurally generating thousands of planets
- Live booking, payment, inventory, or real commerce
- User accounts or a custom database
- Factory simulations or car configurators inside CosmoPort
- A shared technical platform for every fictional company
- An encyclopedic lore CMS before the content requires it

### Content modeling rule

Do not preemptively add a separate Sanity document type for every fictional corporation. Destination descriptions and illustrations can mention sponsor names naturally. Introduce structured brands, planets, vehicles, and cross-app references only when a real feature needs them.

## Lightweight world-building process

Maintain a compact, human-readable canon record as the universe takes shape. Useful fields for a future brand entry might include:

- Company name, sector, and tagline
- Flagship products or services
- Personality and tone of its advertising
- Home planet or headquarters (if relevant)
- Known relationships, endorsements, and rivalries
- First appearance in a published experience
- Potential app idea — clearly marked as an idea

A brand's existence in lore **does not** create an obligation to build its app. A future brand app should have its own clear user experience, small MVP, and completion criteria before development begins.

## Open creative decisions

Before treating these notes as canon, decide:

1. Should the universe be called **The Radiant Age**, or something else?
2. How prominent should corporate satire be relative to genuine optimism?
3. Is **Velora-7** the right first planet, and do the three destinations feel distinct enough?
4. Which two or three brands should recur in CosmoPort's initial advertisements?
5. Should sponsor mentions remain decorative in V1, with cross-links introduced only after a second app exists?
6. What visual rules make every company feel part of the same era without making their websites look identical?

## Delivery principles

- **One task per PR.** Break broad features into reviewable pieces.
- **Finish CosmoPort first.** The universe is a source of creative depth, not scope expansion.
- Build a company-specific app only when it has a compelling independent end goal.
- Add lore through finished product details, not speculative infrastructure.
- Keep working names and slogans provisional until reviewed; check names and potential trademarks before public branding.
- Prefer original intellectual property over direct imitation of existing game universes.

The near-term next step is to finalize CosmoPort's content needs, then introduce Sanity Studio and the smallest useful destination schema in separate focused tasks.
