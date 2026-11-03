<script setup lang="ts">
import { onMounted, ref } from "vue";
import { GRAND_CONCOURSE_MEDIA } from "../data/grandConcourseMedia";

const heroFailed = ref(false);
const heroImage = ref<HTMLImageElement>();

onMounted(() => {
  if (heroImage.value?.complete && heroImage.value.naturalWidth === 0) {
    heroFailed.value = true;
    return;
  }

  void heroImage.value?.decode().catch(() => { heroFailed.value = true; });
});

useSeoMeta({
  title: "CosmoPort Universe",
  description: "Welcome to the Grand Concourse, your gateway to the CosmoPort Universe.",
  ogTitle: "CosmoPort Universe",
  ogDescription: "Welcome to the Grand Concourse, your gateway to the CosmoPort Universe.",
});
const { data, status, error, refresh } = useFetch("/api/apps");
</script>

<template>
  <div class="grand-concourse">
    <header class="grand-concourse__header">
      <UniverseNav />
    </header>
    <main>
      <section class="grand-concourse__hero" aria-label="CosmoPort Grand Concourse">
        <div class="grand-concourse__hero-art">
          <div class="grand-concourse__hero-fallback" aria-hidden="true"><span>CosmoPort</span><strong>Grand
              Concourse</strong><small>Arrivals from tomorrow</small></div>
          <img v-if="!heroFailed" ref="heroImage" :src="GRAND_CONCOURSE_MEDIA.hero"
            alt="Illustrated CosmoPort Grand Concourse terminal, with travelers, a central CosmoPort sign, and the AstroPop Soda Co. storefront."
            fetchpriority="high" @error="heroFailed = true">
        </div>
        <a class="grand-concourse__scroll-link" href="#concourse">Explore the Concourse <span
            aria-hidden="true">↓</span></a>
      </section>

      <section id="concourse" class="concourse-experiences" aria-labelledby="concourse-title">
        <p v-if="status === 'pending'" role="status">Loading applications…</p>

        <div v-else-if="error" role="alert" class="space-y-2">
          <p>Unable to load applications. Please try again.</p>
          <button type="button" class="btn btn-sm" @click="refresh()">Retry</button>
        </div>

        <div v-else-if="data" class="concourse-experiences__cards">
          <div v-for="app in data.apps" :key="app.id" class="concourse-card">
            <h2>{{ app.title }}</h2>
            <p>{{ app.description }}</p>
            <NuxtLink v-if="app.enabled" :to="`/app/${app.id}`" class="concourse-card__link">
              Enter {{ app.title }}
            </NuxtLink>

            <span v-else class="concourse-card__unavailable">
              Under Construction
            </span>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped src="./index.css"></style>
