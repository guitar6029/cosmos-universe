<script setup lang="ts">
import { onMounted, ref } from "vue";
import { BLOG_MEDIA } from "../data/blogMedia";

const heroFailed = ref(false);
const heroImage = ref<HTMLImageElement>();

onMounted(() => {
  if (heroImage.value?.complete && heroImage.value.naturalWidth === 0) {
    heroFailed.value = true;
    return;
  }

  void heroImage.value?.decode().catch(() => {
    heroFailed.value = true;
  });
});

useSeoMeta({
  title: "The Universe Chronicle | Cosmos Universe",
  description: "Engineering logs, cosmic dispatches, and stories from tomorrow.",
});
</script>

<template>
  <div class="universe-blog">
    <header class="universe-blog__header">
      <UniverseNav presentation="surface" />
    </header>

    <main>
      <section class="universe-blog__hero" aria-labelledby="universe-chronicle-title">
        <h1 id="universe-chronicle-title" class="universe-blog__sr-only">The Universe Chronicle</h1>
        <div class="universe-blog__fallback" :aria-hidden="!heroFailed">
          <p class="universe-blog__fallback-eyebrow">Cosmos Universe</p>
          <p class="universe-blog__fallback-title">The Universe Chronicle</p>
          <p class="universe-blog__fallback-subtitle">
            Engineering logs, cosmic dispatches, and stories from tomorrow.
          </p>
        </div>
        <img
          v-if="!heroFailed"
          ref="heroImage"
          class="universe-blog__artwork"
          :src="BLOG_MEDIA.universeChronicleTerminal"
          alt="The Universe Chronicle terminal kiosk and illuminated Chronicle signage in the CosmoPort Grand Concourse."
          fetchpriority="high"
          @error="heroFailed = true"
        />
      </section>
    </main>
  </div>
</template>

<style scoped src="./blog.css"></style>
