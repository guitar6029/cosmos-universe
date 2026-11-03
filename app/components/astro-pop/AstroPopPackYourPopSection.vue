<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ASTROPOP_FLAVORS } from "../../data/astroPopFlavors";
import { ASTRO_POP_MEDIA } from "../../data/astroPopMedia";
import type { AstroPopFlavorId } from "../../stores/astroPopCrate";
import { useAstroPopCrateStore } from "../../stores/astroPopCrate";
import AstroPopBottleSelectionCard from "./AstroPopBottleSelectionCard.vue";

const crateStore = useAstroPopCrateStore();
const announcement = ref("");
const confirmation = ref("");
const addedTokens = ref<Record<AstroPopFlavorId, number>>(
  Object.fromEntries(ASTROPOP_FLAVORS.map((flavor) => [flavor.id, 0])) as Record<
    AstroPopFlavorId,
    number
  >,
);

onMounted(() => {
  crateStore.restoreFromStorage();
});

const addBottle = (flavorId: AstroPopFlavorId) => {
  const flavor = ASTROPOP_FLAVORS.find((item) => item.id === flavorId);
  if (crateStore.addItem(flavorId) && flavor) {
    announcement.value = `${flavor.name} added to your order manifest. ${crateStore.totalBottles} of 6 bottles selected.`;
    confirmation.value = `${flavor.name} added · ${crateStore.totalBottles} of 6 bottles`;
    addedTokens.value[flavorId] += 1;
  }
};
</script>

<template>
  <section class="astropop-pack-your-pop-section" aria-labelledby="pack-your-pop-title">
    <h2 id="pack-your-pop-title" class="sr-only">Pack Your Pop!</h2>
    <p class="sr-only" aria-live="polite">{{ announcement }}</p>

    <div class="astropop-pack-your-pop-section__layout">
      <div class="astropop-pack-your-pop-section__artwork">
        <img
          class="astropop-pack-your-pop-section__logo"
          :src="ASTRO_POP_MEDIA.packYourPopLogo"
          alt="AstroPop Pack Your Pop!"
          loading="lazy"
        />
      </div>

      <div class="astropop-pack-your-pop-section__selection-grid">
        <AstroPopBottleSelectionCard
          v-for="flavor in ASTROPOP_FLAVORS"
          :key="flavor.id"
          :flavor="flavor"
          :disabled="crateStore.isFull"
          :success-token="addedTokens[flavor.id]"
          @add="addBottle"
        />
      </div>
    </div>

    <NuxtLink class="astropop-pack-your-pop-section__manifest-link" to="/app/astro-pop/cart">
      Review order manifest · {{ crateStore.totalBottles }} of 6 bottles
    </NuxtLink>
    <p v-if="confirmation" class="astropop-pack-your-pop-section__confirmation" aria-hidden="true">
      {{ confirmation }}
    </p>
  </section>
</template>

<style scoped>
.astropop-pack-your-pop-section {
  width: min(100%, 80rem);
  margin: 0 auto;
  overflow: hidden;
  padding: 0 clamp(1rem, 4vw, 3rem) clamp(5rem, 9vw, 9rem);
  color: #3a2c35;
}

.astropop-pack-your-pop-section__layout {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: clamp(2rem, 6vw, 5rem);
}

.astropop-pack-your-pop-section__artwork,
.astropop-pack-your-pop-section__selection-grid {
  min-width: 0;
  flex: 1 1 0%;
}

.astropop-pack-your-pop-section__manifest-link {
  justify-self: center;
  border-bottom: 2px solid currentColor;
  color: #6d2e35;
  font-family: "Barlow Condensed", Arial, sans-serif;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-decoration: none;
  text-transform: uppercase;
}

.astropop-pack-your-pop-section__manifest-link:hover,
.astropop-pack-your-pop-section__manifest-link:focus-visible {
  color: #167c89;
}

.astropop-pack-your-pop-section__confirmation {
  width: fit-content;
  max-width: 100%;
  margin: 1rem auto 0;
  border: 1px solid #4f9470;
  border-radius: 999px;
  padding: 0.45rem 0.85rem;
  background: #eaf1c9;
  color: #285748;
  font-family: "Barlow Condensed", Arial, sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.35;
  text-align: center;
}

.astropop-pack-your-pop-section__manifest-link:focus-visible {
  outline: 3px solid var(--astropop-focus-ring, #167c89);
  outline-offset: 4px;
}

.astropop-pack-your-pop-section__artwork {
  display: flex;
  align-items: center;
  justify-content: center;
}

.astropop-pack-your-pop-section__logo {
  display: block;
  width: min(100%, 34rem);
  height: auto;
  object-fit: contain;
}

.astropop-pack-your-pop-section__selection-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: start;
  gap: clamp(1rem, 2vw, 1.5rem);
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

@media (min-width: 760px) {
  .astropop-pack-your-pop-section__layout {
    flex-direction: row;
    align-items: stretch;
  }

  .astropop-pack-your-pop-section__artwork,
  .astropop-pack-your-pop-section__selection-grid {
    flex-basis: 50%;
  }
}

@media (max-width: 420px) {
  .astropop-pack-your-pop-section__selection-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
