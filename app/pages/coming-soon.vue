<script setup lang="ts">
useSeoMeta({
  title: "Coming Soon | CosmoPort Universe",
  description: "A new CosmoPort experience is preparing for departure.",
  robots: "noindex",
});
</script>

<template>
  <main class="coming-soon">
    <section class="coming-soon__panel" aria-labelledby="coming-soon-title">
      <p class="coming-soon__eyebrow">CosmoPort Universe · Departure Notice</p>
      <div class="coming-soon__symbol" aria-hidden="true">✦</div>
      <h1 id="coming-soon-title">Under Construction</h1>
      <p>Our engineers are preparing the next destination. Check back for launch updates!</p>
      <NuxtLink to="/" class="coming-soon__link">Return to the Grand Concourse</NuxtLink>
    </section>
  </main>
</template>

<style scoped>
.coming-soon {
  display: grid;
  min-height: 100vh;
  min-height: 100svh;
  place-items: center;
  padding: 2rem 1rem;
  background: radial-gradient(circle at 50% 30%, #f9dda1, #f3e4c7 56%, #d5a86e);
  color: #173c49;
}
.coming-soon__panel {
  width: min(100%, 42rem);
  padding: clamp(2rem, 6vw, 4rem);
  border: 3px double #ab633e;
  border-radius: 1rem;
  background: #fff8e8;
  box-shadow: 0 18px 0 -10px #173c49;
  text-align: center;
}
.coming-soon__eyebrow {
  color: #a34f34;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.coming-soon__symbol {
  margin: 1.5rem 0;
  font-size: 3rem;
  color: #c16c45;
}
h1 {
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(2.25rem, 6vw, 3.75rem);
  line-height: 1.1;
}
p {
  margin: 1rem auto;
  line-height: 1.6;
}
.coming-soon__link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.8rem 1.25rem;
  border-radius: 0.5rem;
  background: #173c49;
  color: #fff8e8;
  font-weight: 700;
  text-decoration: none;
}
.coming-soon__link:hover {
  background: #2b5968;
}
.coming-soon__link:focus-visible {
  outline: 3px solid #a34f34;
  outline-offset: 4px;
}
</style>
