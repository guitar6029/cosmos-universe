<script setup lang="ts">
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

    <main class="universe-blog__content">
      <p class="universe-blog__eyebrow">Cosmos Universe · The Universe Chronicle</p>
      <h1>The Universe Chronicle</h1>
      <p class="universe-blog__subtitle">
        Engineering logs, cosmic dispatches, and stories from tomorrow.
      </p>
    </main>
  </div>
</template>

<style scoped>
.universe-blog {
  min-height: 100vh;
  background: var(--cp-universe-cream);
  color: var(--cp-universe-space-teal);
}

.universe-blog__header {
  position: sticky;
  z-index: 10;
  top: 0.75rem;
  height: 0;
  pointer-events: none;
}

.universe-blog__header :deep(.universe-nav) {
  pointer-events: auto;
}

.universe-blog__content {
  display: grid;
  min-height: 100vh;
  place-content: center;
  width: min(100% - 2rem, 52rem);
  margin: 0 auto;
  padding: 7rem 0 4rem;
  text-align: center;
}

.universe-blog__eyebrow {
  margin: 0 0 1rem;
  color: var(--cp-universe-rust);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(3rem, 8vw, 6rem);
  letter-spacing: -0.055em;
  line-height: 0.95;
  text-wrap: balance;
}

.universe-blog__subtitle {
  max-width: 34rem;
  margin: 1.5rem auto 0;
  color: color-mix(in srgb, var(--cp-universe-space-teal) 76%, transparent);
  font-size: clamp(1.1rem, 2vw, 1.35rem);
  line-height: 1.55;
}
</style>
