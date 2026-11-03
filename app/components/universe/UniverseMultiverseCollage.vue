<script lang="ts">
import { ABOUT_MEDIA } from "../../data/aboutMedia";
import { ref } from "vue";

export const MULTIVERSE_ARTWORK = [
  { id: "midcentury-cartoon", src: ABOUT_MEDIA.midcenturyCartoon, x: 4, y: 17, zIndex: 2 },
  { id: "cinematic-voyage", src: ABOUT_MEDIA.cinematicVoyage, x: 29, y: 3, zIndex: 5 },
  { id: "atomic-wasteland", src: ABOUT_MEDIA.atomicWasteland, x: 54, y: 21, zIndex: 3 },
  { id: "pencil-and-ink", src: ABOUT_MEDIA.pencilAndInk, x: 10, y: 52, zIndex: 4 },
  { id: "watercolor-fantasy", src: ABOUT_MEDIA.watercolorFantasy, x: 37, y: 44, zIndex: 6 },
  { id: "neon-pixel-inspired", src: ABOUT_MEDIA.neonPixelInspired, x: 61, y: 57, zIndex: 1 },
] as const;
</script>

<script setup lang="ts">
const failedArtwork = ref<string[]>([]);
const markArtworkFailed = (id: string) => {
  if (!failedArtwork.value.includes(id)) failedArtwork.value.push(id);
};
</script>

<template>
  <figure
    class="universe-multiverse-collage"
    aria-label="Six artistic visions of the Cosmo Universe"
  >
    <div class="universe-multiverse-collage__canvas">
      <div
        v-for="artwork in MULTIVERSE_ARTWORK"
        :key="artwork.id"
        class="universe-multiverse-collage__artwork"
        :class="`universe-multiverse-collage__artwork--${artwork.id}`"
        :style="{ '--x': `${artwork.x}%`, '--y': `${artwork.y}%`, zIndex: artwork.zIndex }"
      >
        <img
          v-if="!failedArtwork.includes(artwork.id)"
          :src="artwork.src"
          alt=""
          width="512"
          height="512"
          loading="lazy"
          decoding="async"
          @error="markArtworkFailed(artwork.id)"
        />
        <span v-else class="universe-multiverse-collage__fallback" aria-hidden="true"></span>
      </div>
    </div>
  </figure>
</template>

<style scoped>
.universe-multiverse-collage {
  width: min(100%, 33rem);
  margin: 0;
  justify-self: end;
}
.universe-multiverse-collage__canvas {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 0.94;
}
.universe-multiverse-collage__artwork {
  position: absolute;
  top: var(--y);
  left: var(--x);
  width: 38%;
  aspect-ratio: 1;
  overflow: hidden;
  border: 2px solid #183d4a;
  background: #d8ad67;
  box-shadow: 0.35rem 0.4rem 0 rgba(24, 61, 74, 0.5);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}
.universe-multiverse-collage__artwork img,
.universe-multiverse-collage__fallback {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.universe-multiverse-collage__fallback {
  background: linear-gradient(135deg, #f5a24b, #b44d32 48%, #183d4a 49%);
}
.universe-multiverse-collage__artwork--midcentury-cartoon {
  transform: rotate(-6deg);
}
.universe-multiverse-collage__artwork--cinematic-voyage {
  transform: rotate(3deg);
}
.universe-multiverse-collage__artwork--atomic-wasteland {
  transform: rotate(6deg);
}
.universe-multiverse-collage__artwork--pencil-and-ink {
  transform: rotate(4deg);
}
.universe-multiverse-collage__artwork--watercolor-fantasy {
  transform: rotate(-4deg);
}
.universe-multiverse-collage__artwork--neon-pixel-inspired {
  transform: rotate(7deg);
}
@media (hover: hover) {
  .universe-multiverse-collage__artwork:hover {
    transform: translateY(-0.3rem) rotate(0);
    box-shadow: 0.5rem 0.6rem 0 rgba(24, 61, 74, 0.6);
  }
}
@media (max-width: 44rem) {
  .universe-multiverse-collage {
    width: min(100%, 29rem);
    justify-self: center;
  }
}
@media (max-width: 30rem) {
  .universe-multiverse-collage {
    width: min(100%, 22rem);
  }
  .universe-multiverse-collage__artwork {
    width: 40%;
  }
}
@media (prefers-reduced-motion: reduce) {
  .universe-multiverse-collage__artwork {
    transition: none;
  }
}
</style>
