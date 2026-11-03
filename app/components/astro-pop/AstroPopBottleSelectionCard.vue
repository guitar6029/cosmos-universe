<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import type { AstroPopFlavor } from "../../data/astroPopFlavors";
import type { AstroPopFlavorId } from "../../stores/astroPopCrate";

const props = defineProps<{
  flavor: AstroPopFlavor & { id: AstroPopFlavorId };
  disabled?: boolean;
  successToken?: number;
}>();

const emit = defineEmits<{
  add: [flavorId: AstroPopFlavorId];
}>();

const isShowingSuccess = ref(false);
let successTimer: ReturnType<typeof setTimeout> | undefined;

watch(
  () => props.successToken,
  () => {
    if (successTimer) {
      clearTimeout(successTimer);
    }

    isShowingSuccess.value = true;
    successTimer = setTimeout(() => {
      isShowingSuccess.value = false;
      successTimer = undefined;
    }, 800);
  },
);

onBeforeUnmount(() => {
  if (successTimer) {
    clearTimeout(successTimer);
  }
});
</script>

<template>
  <article class="bottle-selection-card" :class="`bottle-selection-card--${flavor.theme}`">
    <div class="bottle-selection-card__image-wrap">
      <img
        class="bottle-selection-card__image"
        :src="flavor.bottleImage"
        :alt="`${flavor.name} AstroPop bottle`"
        loading="lazy"
      />
    </div>

    <h3 class="bottle-selection-card__title">{{ flavor.name }}</h3>

    <div class="bottle-selection-card__actions">
      <NuxtLink
        class="bottle-selection-card__details-link"
        :to="`/app/astro-pop/flavors/${flavor.id}`"
      >
        View Details
      </NuxtLink>
      <button
        class="bottle-selection-card__button"
        type="button"
        :disabled="props.disabled"
        :class="{ 'bottle-selection-card__button--added': isShowingSuccess }"
        @click="emit('add', flavor.id)"
      >
        <span v-if="isShowingSuccess" aria-hidden="true">✓ ADDED!</span>
        <span v-else>Add Bottle</span>
      </button>
    </div>
  </article>
</template>

<style scoped src="./AstroPopBottleSelectionCard.css"></style>
