<script setup lang="ts">
import DestinationSection from "../../../components/cosmoport-voyage/DestinationSection.vue";
import PearlwaterCoastSection from "../../../components/cosmoport-voyage/PearlwaterCoastSection.vue";
import SaffronExpanseSection from "../../../components/cosmoport-voyage/SaffronExpanseSection.vue";
</script>

<template>
  <div>
    <main id="hero" class="hero-shell">
      <img
        class="hero-image"
        src="/images/cosmoport-voyage/hero/hero-world.png"
        alt="A silver rocketliner above a futuristic seaside spaceport resort"
      />
      <div class="hero-scrim" aria-hidden="true"></div>

      <section class="hero-content" aria-labelledby="hero-title">
        <div class="hero-heading flex flex-col gap-1">
          <p class="hero-kicker">CosmoPort Voyage presents</p>
          <div class="flex flex-col gap-2 max-w-2xl">
            <h1 id="hero-title" class="hero-title">Tired of the Same Old World?</h1>
            <span id="hero-supporting-title">Take a Vacation on Another!</span>
          </div>
        </div>
        <div class="hero-description-panel">
          <img
            class="hero-text-panel"
            src="/images/cosmoport-voyage/hero/hero-text-panel.png"
            alt=""
            aria-hidden="true"
          />
          <p class="hero-description">
            Discover extraordinary destinations, spectacular cities, and unforgettable adventures.
            Your next vacation is just a rocket ride away.
          </p>
        </div>
      </section>

      <p class="hero-mark" aria-hidden="true">CPV <span>✦</span> 1958</p>
    </main>

    <DestinationSection />
    <PearlwaterCoastSection />
    <SaffronExpanseSection />
  </div>
</template>

<style scoped src="./index.css"></style>
