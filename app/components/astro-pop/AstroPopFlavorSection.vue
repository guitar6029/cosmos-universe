<script setup lang="ts">
import { ASTROPOP_FLAVORS } from "../../data/astroPopFlavors";
import { ASTRO_POP_MEDIA } from "../../data/astroPopMedia";
import DecorativeImage from "../shared/DecorativeImage.vue";
import AstroPopFlavorCard from "./AstroPopFlavorCard.vue";
</script>

<template>
  <section
    class="astropop-flavor-section decorative-container"
    aria-labelledby="astropop-flavors-title"
  >
    <DecorativeImage
      class="astropop-flavor-section__cap"
      :src="ASTRO_POP_MEDIA.sodaCap"
      style="
        top: -6rem;
        left: -5rem;
        width: 150px;
        opacity: 0.45;
        transform: rotate(-15deg);
        z-index: 0;
      "
    />
    <DecorativeImage
      class="astropop-flavor-section__cap"
      :src="ASTRO_POP_MEDIA.sodaCap"
      style="
        top: 50%;
        left: 95%;
        width: 150px;
        opacity: 0.45;
        transform: rotate(-15deg);
        z-index: 0;
      "
    />
    <DecorativeImage
      class="astropop-flavor-section__cap"
      :src="ASTRO_POP_MEDIA.sodaCap"
      style="
        top: 30%;
        left: 10%;
        width: 150px;
        opacity: 0.45;
        transform: rotate(-15deg);
        z-index: 0;
      "
    />

    <DecorativeImage
      class="astropop-flavor-section__bottle_opener"
      :src="ASTRO_POP_MEDIA.bottleOpener"
      style="top: 30%; left: 75%; opacity: 1; transform: rotate(25deg); z-index: 0"
    />

    <div class="astropop-flavor-section__content">
      <header class="astropop-flavor-section__header">
        <p class="astropop-eyebrow astropop-flavor-section__eyebrow">
          AstroPop Soda Co. · The flavor department
        </p>
        <h2 id="astropop-flavors-title">Pick Your Pop!</h2>
        <p class="astropop-flavor-section__subtitle">Four Marvelous Flavors from the Future!</p>
      </header>

      <div class="astropop-flavor-grid">
        <AstroPopFlavorCard v-for="flavor in ASTROPOP_FLAVORS" :key="flavor.id" :flavor="flavor" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.astropop-flavor-section {
  width: 100%;
  isolation: isolate;
  font-family: "Barlow", Arial, sans-serif;
  color: #3a2c35;
}

.astropop-flavor-section__content {
  position: relative;
  width: min(100%, 80rem);
  z-index: 1;
  margin: 0 auto;
  padding: clamp(4rem, 8vw, 8rem) clamp(1rem, 4vw, 3rem) clamp(5rem, 9vw, 9rem);
}

.astropop-flavor-section__cap {
  max-width: min(150px, 45vw);
}

.astropop-flavor-section__bottle_opener {
  max-width: min(550px, 75vw);
}

.astropop-flavor-section__header {
  position: relative;
  z-index: 1;
  max-width: 48rem;
  margin: 0 auto clamp(2.5rem, 5vw, 4.5rem);
  text-align: center;
}

.astropop-flavor-section__eyebrow {
  margin: 0 0 1rem;
  color: #a83f2e;
  font-size: 0.8rem;
  letter-spacing: 0.14em;
  line-height: 1.3;
}

.astropop-flavor-section h2 {
  margin: 0;
  color: #3a2c35;
  font-family: "Fraunces", Georgia, "Times New Roman", serif;
  font-size: clamp(3rem, 8vw, 6.5rem);
  font-weight: 900;
  line-height: 0.9;
  text-wrap: balance;
}

.astropop-flavor-section__subtitle {
  margin: 1rem 0 0;
  color: #167c89;
  font-family: "Fraunces", Georgia, "Times New Roman", serif;
  font-size: clamp(1.25rem, 2.5vw, 1.8rem);
  font-style: italic;
  font-weight: 700;
  line-height: 1.2;
}

.astropop-flavor-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 33rem));
  justify-content: center;
  gap: clamp(2rem, 4vw, 4rem);
}

@media (max-width: 680px) {
  .astropop-flavor-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
