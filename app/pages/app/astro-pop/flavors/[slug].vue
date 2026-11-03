<script setup lang="ts">
import { onMounted, ref } from "vue";
import AstroPopNav from "../../../../components/astro-pop/AstroPopNav.vue";
import { ASTROPOP_FLAVORS } from "../../../../data/astroPopFlavors";
import { useAstroPopCrateStore } from "../../../../stores/astroPopCrate";

const route = useRoute();
const slug = Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug;
const flavor = ASTROPOP_FLAVORS.find((candidate) => candidate.id === slug);

if (!flavor) {
  throw createError({
    statusCode: 404,
    statusMessage: "AstroPop flavor not found",
  });
}

useHead({
  title: `${flavor.name} | AstroPop Soda Co.`,
});

const crateStore = useAstroPopCrateStore();
const announcement = ref("");
const hasAddedBottle = ref(false);

onMounted(() => {
  crateStore.restoreFromStorage();
});

const addBottle = () => {
  if (crateStore.addItem(flavor.id)) {
    hasAddedBottle.value = true;
    announcement.value = `${flavor.name} added to your order manifest. ${crateStore.totalBottles} of 6 bottles selected.`;
  }
};
</script>

<template>
  <main class="astropop-flavor-detail-page" :class="`astropop-flavor-detail-page--${flavor.theme}`">
    <section class="astropop-flavor-hero" :aria-labelledby="`${flavor.id}-title`">
      <NuxtLink class="astropop-flavor-hero__back-link" to="/app/astro-pop">
        <span aria-hidden="true">←</span> Back to AstroPop
      </NuxtLink>

      <div class="astropop-flavor-hero__nav">
        <AstroPopNav />
      </div>

      <div class="astropop-flavor-hero__panel">
        <div
          class="astropop-flavor-hero__orbit astropop-flavor-hero__orbit--one"
          aria-hidden="true"
        />
        <div
          class="astropop-flavor-hero__orbit astropop-flavor-hero__orbit--two"
          aria-hidden="true"
        />

        <div class="astropop-flavor-hero__bottle-stage">
          <span class="astropop-flavor-hero__burst" aria-hidden="true">✦</span>
          <img
            class="astropop-flavor-hero__bottle"
            :src="flavor.bottleImage"
            :alt="`${flavor.name} AstroPop bottle`"
          />
        </div>

        <div class="astropop-flavor-hero__content">
          <p class="astropop-flavor-hero__eyebrow">AstroPop Soda Co. presents</p>
          <h1 :id="`${flavor.id}-title`" class="astropop-flavor-hero__title">
            <span v-for="word in flavor.name.split(' ')" :key="word">{{ word }}</span>
          </h1>
          <p class="astropop-flavor-hero__slogan">{{ flavor.slogan }}</p>
          <p class="astropop-flavor-hero__description">{{ flavor.description }}</p>

          <div class="astropop-flavor-hero__actions">
            <button
              class="astropop-flavor-hero__add-button"
              type="button"
              :disabled="crateStore.isFull || crateStore.isCheckoutLocked"
              @click="addBottle"
            >
              Add Bottle <span aria-hidden="true">✦</span>
            </button>
            <p v-if="hasAddedBottle" class="astropop-flavor-hero__confirmation" aria-hidden="true">
              Added to your manifest · {{ crateStore.totalBottles }} of 6
            </p>
          </div>
        </div>
      </div>
      <p class="sr-only" aria-live="polite">{{ announcement }}</p>
    </section>
  </main>
</template>

<style scoped src="./[slug].css"></style>
