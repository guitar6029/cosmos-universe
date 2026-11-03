<script setup lang="ts">
import { onMounted, ref } from "vue";
import AstroPopFlavorSection from "../../../components/astro-pop/AstroPopFlavorSection.vue";
import AstroPopPackYourPopSection from "../../../components/astro-pop/AstroPopPackYourPopSection.vue";
import AstroPopDeliverySection from "../../../components/astro-pop/AstroPopDeliverySection.vue";
import AstroPopDeliveryPlansSection from "../../../components/astro-pop/AstroPopDeliveryPlansSection.vue";
import AstroPopDeliveryTestimonialsSection from "../../../components/astro-pop/AstroPopDeliveryTestimonialsSection.vue";
import AstroPopFooter from "../../../components/astro-pop/AstroPopFooter.vue";
import DecorativeImage from "../../../components/shared/DecorativeImage.vue";
import AstroPopNav from "../../../components/astro-pop/AstroPopNav.vue";
import AstroPopNotificationContainer from "../../../components/astro-pop/AstroPopNotificationContainer.vue";
import { ASTRO_POP_MEDIA } from "../../../data/astroPopMedia";

const hasMounted = ref(false);
const heroLoaded = ref(false);
const heroFailed = ref(false);
const heroImage = ref<HTMLImageElement | null>(null);

onMounted(() => {
  hasMounted.value = true;
  // The browser may finish (or fail) the SSR image request before Vue attaches
  // its @load/@error listeners during hydration.
  const image = heroImage.value;
  if (!image) return;
  if (image.complete) {
    if (image.naturalWidth === 0) heroFailed.value = true;
    else heroLoaded.value = true;
  }
});
</script>

<template>
  <div>
    <main class="astropop-page">
      <AstroPopNotificationContainer v-if="hasMounted" />
      <section class="astropop-hero" aria-labelledby="astropop-title">
        <NuxtLink class="astropop-home-link" to="/">← Universe directory</NuxtLink>
        <div class="astropop-nav">
          <AstroPopNav />
        </div>

        <div class="astropop-hero__visual">
          <div v-if="!heroLoaded || heroFailed" class="astropop-hero__fallback">
            <p class="astropop-hero__eyebrow">A little sparkle in every bottle</p>
            <h1 id="astropop-title">AstroPop <span>Soda Co.</span></h1>
            <p class="astropop-hero__tagline">Bringing Tomorrow to Your Doorstep!</p>
          </div>
          <h1 v-else id="astropop-title" class="sr-only">AstroPop Soda Co.</h1>
          <img
            v-if="!heroFailed"
            ref="heroImage"
            class="astropop-hero__image"
            :class="{ 'astropop-hero__image--loaded': heroLoaded }"
            :src="ASTRO_POP_MEDIA.hero"
            alt="Vintage AstroPop Soda Co. advertisement featuring a smiling soda delivery man and a flying delivery rocket"
            fetchpriority="high"
            decoding="async"
            @load="heroLoaded = true"
            @error="heroFailed = true"
          />
        </div>
      </section>

      <div class="astropop-flavor-pack-transition">
        <AstroPopFlavorSection class="astropop-flavor-pack-transition__section" />
        <div class="astropop-flavor-pack-transition__artwork" aria-hidden="true">
          <DecorativeImage
            class="astropop-flavor-pack-transition__cap"
            :src="ASTRO_POP_MEDIA.sodaCap"
          />
        </div>
        <AstroPopPackYourPopSection class="astropop-flavor-pack-transition__section" />
      </div>
      <AstroPopDeliverySection />
      <AstroPopDeliveryPlansSection />
      <AstroPopDeliveryTestimonialsSection />
    </main>
    <AstroPopFooter />
  </div>
</template>

<style scoped>
.astropop-page {
  min-height: 100vh;
  min-height: 100svh;
  background: #e8d3ad;
}

.astropop-nav {
  width: min(100%, 72rem);
}

.astropop-flavor-pack-transition {
  position: relative;
  isolation: isolate;
}

.astropop-flavor-pack-transition__section {
  position: relative;
  z-index: 1;
}

.astropop-flavor-pack-transition__artwork {
  position: relative;
  z-index: 0;
  height: 0;
  overflow: visible;
}

.astropop-flavor-pack-transition__cap {
  top: clamp(-4rem, -5vw, -2.5rem);
  left: clamp(1.25rem, 5vw, 5rem);
  width: min(150px, 45vw);
  opacity: 0.45;
  transform: rotate(-15deg);
}

:global(html:has(.astropop-page)) {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  :global(html:has(.astropop-page)) {
    scroll-behavior: auto;
  }
}

.astropop-hero {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: clamp(0.5rem, 2vh, 1.25rem);
  min-height: 100vh;
  min-height: 100svh;
  overflow: hidden;
  padding: 4.5rem 1rem 1rem;
  background:
    radial-gradient(circle at 50% 35%, rgba(255, 249, 225, 0.7), transparent 48%), #e8d3ad;
}

.astropop-hero__visual {
  display: grid;
  width: 100%;
  flex: 1;
  place-items: center;
  min-height: 0;
}

.astropop-hero__visual > * {
  grid-area: 1 / 1;
}

.astropop-hero__fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(0.75rem, 2vw, 1.5rem);
  width: 100%;
  min-height: min(60vh, 36rem);
  padding: clamp(2rem, 5vw, 4rem) 1rem;
  color: #183d4a;
  text-align: center;
}

.astropop-hero__eyebrow {
  margin: 0;
  color: #a83f2e;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.astropop-hero__fallback h1 {
  margin: 0;
  color: #a83f2e;
  font-family: var(--astropop-display-font), Georgia, serif;
  font-size: clamp(3.5rem, 11vw, 9rem);
  font-weight: 900;
  line-height: 0.95;
  text-wrap: balance;
}

.astropop-hero__fallback h1 span {
  display: block;
  font-size: 0.5em;
}

.astropop-hero__tagline {
  max-width: 32rem;
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(1.25rem, 2.5vw, 2rem);
  font-weight: 700;
  line-height: 1.4;
}

.astropop-hero__image {
  opacity: 0;
  display: block;
  width: auto;
  max-width: min(100%, 124rem);
  max-height: calc(100svh - 9.5rem);
  height: auto;
  object-fit: contain;
}

.astropop-hero__image--loaded {
  opacity: 1;
}

.astropop-home-link {
  position: absolute;
  z-index: 1;
  top: 1.25rem;
  left: 1.25rem;
  color: #3a2c35;
  font-family: Georgia, "Times New Roman", serif;
  font-weight: 700;
  text-decoration: none;
}

.astropop-home-link:hover,
.astropop-home-link:focus-visible {
  color: #a83f2e;
  text-decoration: underline;
}

.astropop-home-link:focus-visible {
  outline: 3px solid var(--astropop-focus-ring);
  outline-offset: 4px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 600px) {
  .astropop-hero {
    padding: 4.25rem 0.5rem 0.5rem;
  }

  .astropop-hero__image {
    width: 100%;
  }
}
</style>
