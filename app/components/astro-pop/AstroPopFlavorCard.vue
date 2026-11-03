<script setup lang="ts">
import type { AstroPopFlavor } from "../../data/astroPopFlavors";

defineProps<{
  flavor: AstroPopFlavor;
}>();
</script>

<template>
  <article
    class="flavor-card"
    :class="`flavor-card--${flavor.theme}`"
    :aria-labelledby="`${flavor.id}-title`"
  >
    <div class="flavor-card__ornament flavor-card__ornament--top" aria-hidden="true">✦</div>
    <header class="flavor-card__header">
      <p class="flavor-card__brand">AstroPop Soda Co. · Future flavor</p>
      <h3 :id="`${flavor.id}-title`" class="sr-only">{{ flavor.name }}</h3>
    </header>

    <div class="flavor-card__artwork">
      <span class="flavor-card__artwork-burst flavor-card__artwork-burst--one" aria-hidden="true"
        >✦</span
      >
      <span class="flavor-card__artwork-burst flavor-card__artwork-burst--two" aria-hidden="true"
        >✦</span
      >
      <img
        class="flavor-card__artwork-image"
        :src="flavor.artwork.src"
        :alt="flavor.artwork.alt"
        loading="lazy"
      />
    </div>

    <p class="flavor-card__description">{{ flavor.description }}</p>
    <div class="flavor-card__rule" aria-hidden="true"><span>✦</span></div>
    <div class="flavor-card__ornament flavor-card__ornament--bottom" aria-hidden="true">✦</div>
  </article>
</template>

<style scoped src="./AstroPopFlavorCard.css"></style>
