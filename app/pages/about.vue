<script setup lang="ts">
useSeoMeta({
  title: "About | Cosmos Universe",
  description:
    "Discover the imaginative digital worlds and thoughtful engineering behind Cosmos Universe.",
  ogTitle: "About | Cosmos Universe",
  ogDescription:
    "An expanding collection of digital worlds, built with curiosity and engineered with purpose.",
});
</script>

<template>
  <div class="universe-about">
    <header class="universe-about__header">
      <UniverseNav presentation="surface" />
    </header>

    <main>
      <section class="universe-about__hero" aria-labelledby="about-title">
        <div class="universe-about__hero-content">
          <p class="universe-about__eyebrow">Cosmos Universe · Est. Tomorrow</p>
          <h1 id="about-title">One Universe.<br /><em>Endless Possibilities.</em></h1>
          <p class="universe-about__lede">
            Cosmos Universe is an expanding collection of digital worlds inspired by the optimism,
            imagination, and unmistakable charm of the 1950s Space Age.
          </p>
          <p class="universe-about__intro">
            Every destination has its own personality, purpose, and visual language—because a
            universe worth exploring should never feel like one-size-fits-all.
          </p>
        </div>

        <UniverseMultiverseCollage />
      </section>

      <section
        class="universe-about__section universe-about__destinations"
        aria-labelledby="destinations-title"
      >
        <div class="universe-about__section-heading">
          <p class="universe-about__eyebrow">Destination directory</p>
          <h2 id="destinations-title">Different Worlds,<br /><em>Different Experiences.</em></h2>
          <p>
            Each experience is independently designed with distinct functionality and creative
            direction. The visual differences are intentional: they let every product tell its own
            story in the right voice.
          </p>
        </div>

        <div class="destination-postcards">
          <article class="destination-postcard destination-postcard--astropop">
            <div class="destination-postcard__stamp" aria-hidden="true">AP<br /><span>✦</span></div>
            <p class="destination-postcard__status">Now open</p>
            <h3>Astro Pop<br />Soda Co.</h3>
            <p>
              A nostalgic soda-commerce experience, bubbling with flavor, character, and a fully
              considered shopping journey.
            </p>
            <NuxtLink class="destination-postcard__link" to="/app/astro-pop"
              >Visit Astro Pop <span aria-hidden="true">→</span></NuxtLink
            >
          </article>

          <article class="destination-postcard destination-postcard--voyage">
            <div class="destination-postcard__stamp" aria-hidden="true">CV<br /><span>✦</span></div>
            <p class="destination-postcard__status">In development</p>
            <h3>CosmoPort<br />Voyage</h3>
            <p>
              An upcoming space-travel-inspired experience about choosing extraordinary destinations
              beyond the familiar.
            </p>
            <span class="destination-postcard__coming">Boarding soon</span>
          </article>
        </div>
      </section>

      <section
        class="universe-about__section universe-about__engineering"
        aria-labelledby="engineering-title"
      >
        <div class="mission-control" aria-hidden="true">
          <div class="mission-control__screen">
            <span></span><span></span><span></span><b>READY</b>
          </div>
          <div class="mission-control__diagram">
            <i></i><i></i><i></i><i></i><strong>PRODUCT<br />SYSTEM</strong>
          </div>
          <div class="mission-control__readout">
            MISSION CONTROL<br /><span>FUNCTION · FORM · FEEDBACK</span>
          </div>
        </div>
        <div class="universe-about__section-heading">
          <p class="universe-about__eyebrow">Mission control</p>
          <h2 id="engineering-title">The Engineering<br /><em>Behind the Magic.</em></h2>
          <p>
            Cosmos Universe is a place to explore real product development: where design choices,
            software systems, and integrations work together to make an experience feel effortless.
          </p>
        </div>
        <ul class="engineering-list" aria-label="Product engineering practices">
          <li>Product design &amp; user experience</li>
          <li>Frontend &amp; backend engineering</li>
          <li>Authentication &amp; account systems</li>
          <li>Payments &amp; data persistence</li>
          <li>APIs &amp; third-party integrations</li>
          <li>Cloud infrastructure, testing, security &amp; reliability</li>
        </ul>
        <p class="universe-about__technology-note">
          Nuxt, Vue, and TypeScript shape the interface; Clerk, Stripe, Neon, and Cloudflare support
          the services behind it where they serve the product. The goal is not a stack for its own
          sake—it is a dependable, understandable path through each experience.
        </p>
      </section>

      <section class="universe-about__closing" aria-labelledby="expanding-title">
        <p class="universe-about__eyebrow">The next launch window</p>
        <h2 id="expanding-title">An Expanding<br /><em>Universe.</em></h2>
        <p>
          New destinations, improvements, and integrations continue to take shape. Each launch is an
          opportunity to refine the world, test an idea, and make the journey more useful.
        </p>
        <p class="universe-about__signoff">Built with curiosity.<br />Engineered with purpose.</p>
        <NuxtLink class="universe-about__home-link" to="/"
          >Return to the Universe <span aria-hidden="true">→</span></NuxtLink
        >
      </section>
    </main>
  </div>
</template>

<style scoped>
.universe-about {
  min-height: 100vh;
  background: #f3e4c7;
  color: #183d4a;
}
.universe-about__header {
  position: sticky;
  z-index: 10;
  top: 0.75rem;
  height: 0;
  pointer-events: none;
}
.universe-about__header :deep(.universe-nav) {
  pointer-events: auto;
}
.universe-about__hero,
.universe-about__section,
.universe-about__closing {
  width: min(100% - 2rem, 72rem);
  margin: 0 auto;
}
.universe-about__hero {
  display: grid;
  position: relative;
  grid-template-columns: minmax(0, 1.05fr) minmax(16rem, 0.95fr);
  gap: 2.5rem;
  min-height: 36rem;
  align-items: center;
  padding: 8.5rem 0 5rem;
}
.universe-about__eyebrow {
  margin: 0 0 1rem;
  color: #b44d32;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
h1,
h2,
h3 {
  font-family: Georgia, "Times New Roman", serif;
}
h1,
h2 {
  margin: 0;
  letter-spacing: -0.055em;
  line-height: 0.92;
  text-wrap: balance;
}
h1 {
  font-size: clamp(3.5rem, 7.4vw, 6.25rem);
}
h2 {
  font-size: clamp(2.6rem, 5vw, 4.5rem);
}
h1 em,
h2 em {
  color: #b44d32;
  font-weight: inherit;
}
.universe-about__lede {
  max-width: 36rem;
  margin: 2rem 0 0;
  font-size: clamp(1.12rem, 2vw, 1.4rem);
  font-weight: 700;
  line-height: 1.5;
}
.universe-about__intro {
  max-width: 33rem;
  margin: 1rem 0 0;
  color: #49656d;
  line-height: 1.65;
}
.universe-about__section {
  padding: 5rem 0;
}
.universe-about__section-heading {
  max-width: 42rem;
}
.universe-about__section-heading > p:not(.universe-about__eyebrow) {
  margin: 1.5rem 0 0;
  color: #49656d;
  line-height: 1.65;
}
.universe-about__destinations {
  border-top: 2px solid rgba(24, 61, 74, 0.24);
}
.destination-postcards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  margin-top: 3rem;
}
.destination-postcard {
  position: relative;
  min-height: 21rem;
  border: 3px solid #183d4a;
  padding: 2rem;
  box-shadow: 0.45rem 0.45rem 0 #183d4a;
}
.destination-postcard--astropop {
  background: #f4a7a4;
}
.destination-postcard--voyage {
  background: #71b5ba;
}
.destination-postcard__stamp {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  display: grid;
  width: 3.3rem;
  height: 3.8rem;
  place-content: center;
  border: 2px dashed #183d4a;
  color: #183d4a;
  font-family: Georgia, serif;
  font-weight: 700;
  line-height: 0.85;
  text-align: center;
  transform: rotate(7deg);
}
.destination-postcard__stamp span {
  color: #b44d32;
}
.destination-postcard__status {
  margin: 0 0 2.7rem;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.destination-postcard h3 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  letter-spacing: -0.05em;
  line-height: 0.9;
}
.destination-postcard > p:not(.destination-postcard__status) {
  max-width: 25rem;
  margin: 1.3rem 0;
  line-height: 1.55;
}
.destination-postcard__link,
.destination-postcard__coming {
  display: inline-flex;
  position: absolute;
  bottom: 1.75rem;
  align-items: center;
  gap: 0.5rem;
  color: inherit;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-decoration: none;
  text-transform: uppercase;
}
.destination-postcard__link {
  border-bottom: 2px solid #183d4a;
}
.destination-postcard__link:hover,
.destination-postcard__link:focus-visible {
  color: #8d301e;
}
.destination-postcard__link:focus-visible {
  outline: 3px solid #183d4a;
  outline-offset: 4px;
}
.universe-about__engineering {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 1.5rem clamp(2rem, 7vw, 6rem);
  background: #183d4a;
  color: #fff8e8;
  box-shadow: 0 0 0 100vmax #183d4a;
  clip-path: inset(0 -100vmax);
}
.universe-about__engineering .universe-about__eyebrow {
  color: #ffd281;
}
.universe-about__engineering h2 em {
  color: #f5a24b;
}
.universe-about__engineering .universe-about__section-heading > p:not(.universe-about__eyebrow),
.universe-about__technology-note {
  color: #c5dddd;
}
.mission-control {
  grid-row: span 3;
  align-self: center;
  border: 3px solid #f3e4c7;
  padding: 1rem;
  background: #103947;
  box-shadow: 0.45rem 0.45rem 0 #f5a24b;
}
.mission-control__screen {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  min-height: 4rem;
  border: 2px solid #71b5ba;
  padding: 0.75rem;
}
.mission-control__screen span {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  background: #df784c;
}
.mission-control__screen b {
  margin-left: auto;
  color: #ffd281;
  font-size: 0.66rem;
  letter-spacing: 0.13em;
}
.mission-control__diagram {
  display: grid;
  position: relative;
  min-height: 13rem;
  place-items: center;
  border-right: 2px solid #71b5ba;
  border-bottom: 2px solid #71b5ba;
  border-left: 2px solid #71b5ba;
  overflow: hidden;
}
.mission-control__diagram strong {
  z-index: 1;
  width: 5.8rem;
  height: 5.8rem;
  display: grid;
  place-content: center;
  border: 2px solid #ffd281;
  border-radius: 50%;
  color: #fff8e8;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  line-height: 1.15;
  text-align: center;
}
.mission-control__diagram i {
  position: absolute;
  width: 135%;
  height: 1px;
  background: rgba(113, 181, 186, 0.6);
  transform: rotate(31deg);
}
.mission-control__diagram i:nth-child(2) {
  transform: rotate(-31deg);
}
.mission-control__diagram i:nth-child(3) {
  width: 70%;
  transform: rotate(0);
}
.mission-control__diagram i:nth-child(4) {
  height: 70%;
  width: 1px;
  transform: rotate(0);
}
.mission-control__readout {
  padding: 0.9rem 0 0.15rem;
  color: #fff8e8;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  line-height: 1.5;
}
.mission-control__readout span {
  color: #71b5ba;
}
.engineering-list {
  display: grid;
  gap: 0.45rem;
  margin: 0.5rem 0 0;
  padding: 0;
  list-style: none;
}
.engineering-list li {
  padding: 0.65rem 0;
  border-bottom: 1px solid rgba(197, 221, 221, 0.35);
  font-size: 0.9rem;
  font-weight: 700;
}
.engineering-list li::before {
  margin-right: 0.65rem;
  color: #f5a24b;
  content: "✦";
}
.universe-about__technology-note {
  grid-column: 2;
  margin: 0.25rem 0 0;
  line-height: 1.65;
}
.universe-about__closing {
  max-width: 43rem;
  padding: 6rem 0 7rem;
  text-align: center;
}
.universe-about__closing > p:not(.universe-about__eyebrow):not(.universe-about__signoff) {
  margin: 1.5rem auto 0;
  color: #49656d;
  line-height: 1.65;
}
.universe-about__signoff {
  margin: 2.5rem 0;
  color: #b44d32;
  font-family: Georgia, serif;
  font-size: clamp(1.6rem, 3vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
}
.universe-about__home-link {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  border: 2px solid #183d4a;
  border-radius: 999px;
  padding: 0.85rem 1.15rem;
  color: #183d4a;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-decoration: none;
  text-transform: uppercase;
  transition:
    background-color 160ms ease,
    color 160ms ease;
}
.universe-about__home-link:hover,
.universe-about__home-link:focus-visible {
  background: #183d4a;
  color: #fff8e8;
}
.universe-about__home-link:focus-visible {
  outline: 3px solid #b44d32;
  outline-offset: 4px;
}
@media (max-width: 44rem) {
  .universe-about__hero {
    grid-template-columns: 1fr;
    gap: 2rem;
    min-height: 0;
    padding: 7.5rem 0 4rem;
  }
  .destination-postcards,
  .universe-about__engineering {
    grid-template-columns: 1fr;
  }
  .universe-about__engineering {
    gap: 2rem;
  }
  .mission-control {
    grid-row: auto;
    width: min(100%, 27rem);
    justify-self: center;
  }
  .universe-about__technology-note {
    grid-column: auto;
  }
  .universe-about__section {
    padding: 4rem 0;
  }
  .universe-about__closing {
    padding: 5rem 0;
  }
}
@media (max-width: 30rem) {
  .universe-about__hero,
  .universe-about__section,
  .universe-about__closing {
    width: min(100% - 1.5rem, 72rem);
  }
  .destination-postcard {
    min-height: 22rem;
    padding: 1.5rem;
  }
  .destination-postcard__stamp {
    top: 1rem;
    right: 1rem;
  }
  .universe-about__lede {
    margin-top: 1.5rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  .universe-about__home-link {
    transition: none;
  }
}
</style>
