<script setup lang="ts">
import { useAstroPopOrders } from "../../../../composables/useAstroPopOrders";
import AstroPopOrderCard from "../../../../components/astro-pop/AstroPopOrderCard.vue";

const { orders, pending, error, refresh } = useAstroPopOrders();
definePageMeta({
  middleware: ["astro-pop-account-auth"],
});

useSeoMeta({
  title: "My Account | Astro Pop Soda Co.",
  robots: "noindex, nofollow",
});
</script>

<template>
  <div class="astro-pop-account-page">
    <AstroPopNav />
    <section class="account">
      <header class="account__header">
        <h1>My Account</h1>
      </header>

      <div class="account__content">
        <div class="account__section-heading">
          <h2>Order History</h2>
          <span>Last 30 days</span>
        </div>

        <AstroPopLoader v-if="pending" message="Fetching your orders..." />
        <div v-else-if="error" class="account__message" role="alert">
          <p>We couldn't load your orders right now.</p>
          <button type="button" @click="refresh()">Try again</button>
        </div>
        <div v-else-if="orders.length === 0" class="account__message">
          <p>No orders in the last 30 days.</p>
          <NuxtLink to="/app/astro-pop/#astropop-flavors-title">Explore flavors</NuxtLink>
        </div>
        <div v-else class="account__orders">
          <AstroPopOrderCard v-for="order in orders" :key="order.id" :order="order" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.astro-pop-account-page {
  min-height: 100vh;
  background: #ead5b0;
  color: var(--astropop-ink);
  font-family: var(--astropop-body-font);
}
.account {
  width: min(100% - 2rem, 75rem);
  margin-inline: auto;
  padding-block: clamp(1.5rem, 4vw, 2.5rem) 4rem;
}
.account__header {
  margin-bottom: clamp(1.5rem, 3vw, 2rem);
}
.account__header h1 {
  margin: 0;
  font-family: var(--astropop-display-font);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 900;
  line-height: 1.15;
}
.account__section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.account__section-heading h2 {
  margin: 0;
  font-family: var(--astropop-display-font);
  font-size: clamp(1.35rem, 3vw, 1.75rem);
  font-weight: 800;
}
.account__section-heading span {
  font-size: 0.9rem;
}
.account__orders {
  display: grid;
  gap: 1.5rem;
}
.account__message {
  padding: clamp(1.25rem, 3vw, 2rem);
  border: var(--astropop-border-width) solid var(--astropop-card-ink);
  border-radius: var(--astropop-card-radius);
  background: #fff3d6;
}
.account__message a,
.account__message button {
  display: inline-block;
  margin-top: 1rem;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--astropop-red);
  font: 700 1rem var(--astropop-body-font);
  text-decoration: underline;
  cursor: pointer;
}
.account__message :is(a, button):focus-visible {
  outline: 3px solid var(--astropop-focus-ring);
  outline-offset: 4px;
}
</style>
