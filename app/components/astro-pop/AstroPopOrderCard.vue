<script setup lang="ts">
import { computed } from "vue";
import type { AstroPopOrderHistory } from "../../../server/types/astro-pop.types";
import { ASTROPOP_FLAVORS } from "../../data/astroPopFlavors";

const props = defineProps<{ order: AstroPopOrderHistory }>();

const formattedDate = computed(() =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(props.order.createdAt)),
);
const formattedTotal = computed(() =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: props.order.currency.toUpperCase(),
  }).format(props.order.totalCents / 100),
);
const itemImages = computed(() =>
  props.order.items.map((item) => ({
    ...item,
    image: ASTROPOP_FLAVORS.find((flavor) => flavor.id === item.flavorId)?.bottleImage,
  })),
);
const bottleCount = computed(() => props.order.items.reduce((sum, item) => sum + item.quantity, 0));
</script>

<template>
  <article class="order-card" :aria-label="`Astro Pop order placed ${formattedDate}`">
    <header class="order-card__header">
      <div>
        <span class="order-card__eyebrow">Order placed</span>
        <strong>{{ formattedDate }}</strong>
      </div>
      <div>
        <span class="order-card__eyebrow">Total</span>
        <strong>{{ formattedTotal }}</strong>
      </div>
      <div>
        <span class="order-card__eyebrow">Payment</span>
        <strong class="order-card__status">{{ order.paymentStatus.replaceAll("_", " ") }}</strong>
      </div>
    </header>

    <div class="order-card__body">
      <div class="order-card__items">
        <div v-for="item in itemImages" :key="item.flavorId" class="order-card__item">
          <div class="order-card__artwork">
            <img v-if="item.image" :src="item.image" :alt="item.flavorName" loading="lazy" />
            <span v-else aria-hidden="true">✦</span>
            <span class="order-card__quantity" :aria-label="`Quantity ${item.quantity}`"
              >×{{ item.quantity }}</span
            >
          </div>
          <div class="order-card__item-text">
            <strong>{{ item.flavorName }}</strong>
            <span>{{ item.quantity }} {{ item.quantity === 1 ? "bottle" : "bottles" }}</span>
          </div>
        </div>
      </div>
      <footer class="order-card__footer">
        <span
          >{{ bottleCount }} {{ bottleCount === 1 ? "bottle" : "bottles" }} ·
          {{ order.status.toLowerCase() }}</span
        >
        <span>Demo checkout · Order #{{ order.id.slice(0, 8).toUpperCase() }}</span>
        <NuxtLink
          class="order-card__details-link"
          :to="`/app/astro-pop/account/orders/${order.id}`"
        >
          View details <span aria-hidden="true">→</span>
        </NuxtLink>
      </footer>
    </div>
  </article>
</template>

<style scoped>
.order-card {
  overflow: hidden;
  border: var(--astropop-border-width) solid var(--astropop-card-ink);
  border-radius: var(--astropop-card-radius);
  background: #fff3d6;
  box-shadow: 0.35rem 0.4rem 0 var(--astropop-card-ink);
  color: var(--astropop-ink);
  font-family: var(--astropop-body-font);
}
.order-card__header {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem clamp(1.5rem, 4vw, 3rem);
  padding: clamp(0.9rem, 2vw, 1.25rem);
  border-bottom: var(--astropop-border-width) solid var(--astropop-card-ink);
  background: #e1eee8;
}
.order-card__header > div {
  display: grid;
  align-content: start;
  gap: 0.25rem;
}
.order-card__header strong {
  font-size: 1rem;
  line-height: 1.35;
}
.order-card__eyebrow {
  font: 700 0.8rem/1.2 var(--astropop-label-font);
  text-transform: uppercase;
  letter-spacing: 0.09em;
}
.order-card__status {
  color: #116c70;
  text-transform: capitalize;
}
.order-card__body {
  padding: clamp(0.9rem, 2vw, 1.25rem);
}
.order-card__items {
  display: grid;
  gap: 1rem;
}
.order-card__item {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 5.5rem;
  min-width: 0;
}
.order-card__artwork {
  position: relative;
  display: grid;
  place-items: center;
  flex: 0 0 5rem;
  width: 5rem;
  height: 5rem;
  border-radius: 0.75rem;
  background: #efdbc0;
}
.order-card__artwork img {
  position: absolute;
  inset: 0;
  display: block;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 0.45rem;
  object-fit: contain;
  object-position: center;
}
.order-card__quantity {
  position: absolute;
  z-index: 1;
  right: -0.35rem;
  bottom: -0.35rem;
  min-width: 1.6rem;
  padding: 0.2rem 0.35rem;
  border-radius: 999px;
  background: var(--astropop-red);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.3;
  text-align: center;
}
.order-card__item-text {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
}
.order-card__item-text strong {
  font-size: 1rem;
  line-height: 1.4;
}
.order-card__item-text span {
  font-size: 0.9rem;
  line-height: 1.4;
}
.order-card__footer {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-top: 1.25rem;
  padding-top: 0.85rem;
  border-top: 1px solid var(--astropop-muted-gold);
  font-size: 0.85rem;
  line-height: 1.5;
}
.order-card__details-link {
  color: var(--astropop-red);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 0.18em;
}
.order-card__details-link:focus-visible {
  outline: 3px solid var(--astropop-focus-ring);
  outline-offset: 4px;
}
@media (max-width: 600px) {
  .order-card__header {
    gap: 0.8rem 1.25rem;
  }
  .order-card__footer {
    flex-direction: column;
  }
}
</style>
