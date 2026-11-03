<script setup lang="ts">
import { ASTRO_POP_MEDIA } from "../../data/astroPopMedia";

withDefaults(
  defineProps<{
    message?: string;
  }>(),
  {
    message: undefined,
  },
);
</script>

<template>
  <div class="astro-pop-loader" role="status" aria-live="polite" :aria-label="message || 'Loading'">
    <img
      class="astro-pop-loader__rocket"
      :src="ASTRO_POP_MEDIA.loadingRocket"
      alt=""
      aria-hidden="true"
      width="180"
      height="128"
      decoding="async"
    />
    <p v-if="message" class="astro-pop-loader__message">{{ message }}</p>
    <span v-else class="astro-pop-loader__sr-only">Loading</span>
  </div>
</template>

<style scoped>
.astro-pop-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 10rem;
  padding: 1rem;
  text-align: center;
  color: var(--astropop-ink);
  font-family: var(--astropop-body-font);
}
.astro-pop-loader__rocket {
  width: min(100%, 11.25rem);
  height: auto;
  aspect-ratio: 180 / 128;
  object-fit: contain;
  animation: astro-pop-float 2.5s ease-in-out infinite;
}
.astro-pop-loader__message {
  margin: 0;
  font-weight: 700;
  line-height: 1.5;
}
.astro-pop-loader__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
@keyframes astro-pop-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .astro-pop-loader__rocket {
    animation: none;
  }
}
</style>
