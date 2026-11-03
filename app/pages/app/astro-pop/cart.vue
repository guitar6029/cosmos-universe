<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ASTROPOP_FLAVORS } from "../../../data/astroPopFlavors";
import type { AstroPopFlavorId } from "../../../stores/astroPopCrate";
import { useAstroPopCrateStore } from "../../../stores/astroPopCrate";

const crateStore = useAstroPopCrateStore();
const announcement = ref("");

const cartItems = computed(() =>
  crateStore.items.flatMap((item) => {
    const flavor = ASTROPOP_FLAVORS.find((candidate) => candidate.id === item.flavorId);
    return flavor ? [{ ...item, flavor }] : [];
  }),
);

onMounted(() => {
  crateStore.restoreFromStorage();
});

const increaseQuantity = (flavorId: AstroPopFlavorId, name: string) => {
  if (crateStore.addItem(flavorId)) {
    announcement.value = `${name} quantity increased. ${crateStore.totalBottles} of 6 bottles selected.`;
  }
};

const decreaseQuantity = (flavorId: AstroPopFlavorId, name: string) => {
  if (crateStore.decrementItem(flavorId)) {
    announcement.value = `${name} quantity decreased. ${crateStore.totalBottles} of 6 bottles selected.`;
  }
};

const updateQuantity = (
  event: Event,
  flavorId: AstroPopFlavorId,
  currentQuantity: number,
  name: string,
) => {
  const input = event.target as HTMLInputElement;
  const inputValue = input.value.trim();

  if (inputValue === "") {
    input.value = String(currentQuantity);
    announcement.value = `Enter a whole-number quantity for ${name}.`;
    return;
  }

  const quantity = Number(input.value);

  if (crateStore.setItemQuantity(flavorId, quantity)) {
    announcement.value =
      quantity === 0
        ? `${name} removed from your order manifest.`
        : `${name} quantity set to ${quantity}. ${crateStore.totalBottles} of 6 bottles selected.`;
    return;
  }

  input.value = String(currentQuantity);
  announcement.value = `Please select a whole number between 0 and ${currentQuantity + crateStore.remainingCapacity} bottles of ${name}.`;
};

const removeItem = (flavorId: AstroPopFlavorId, name: string) => {
  if (crateStore.removeItem(flavorId)) {
    announcement.value = `${name} removed from your order manifest.`;
  }
};
</script>

<template>
  <main class="astropop-cart-page">
    <header class="astropop-cart-page__header">
      <NuxtLink class="astropop-cart-page__back" to="/app/astro-pop">← Back to AstroPop</NuxtLink>
      <p class="astropop-eyebrow astropop-cart-page__eyebrow">Cosmoport Soda Service</p>
      <h1>Order Manifest</h1>
      <p>Reserve a seat in the six-bottle rocket crate.</p>
    </header>

    <p class="sr-only" aria-live="polite">{{ announcement }}</p>

    <section
      v-if="crateStore.isEmpty"
      class="astropop-cart-empty"
      aria-labelledby="empty-cart-title"
    >
      <p class="astropop-eyebrow astropop-cart-empty__stamp">Manifest clear</p>
      <h2 id="empty-cart-title">Your rocket crate is ready for liftoff.</h2>
      <p>Choose a few fizzy passengers and we’ll keep the bottle caps polished.</p>
      <NuxtLink class="astropop-cart-page__button" to="/app/astro-pop#pack-your-pop-title"
        >Choose your flavors</NuxtLink
      >
    </section>

    <div v-else class="astropop-cart-page__layout">
      <section class="astropop-cart-items" aria-labelledby="cart-items-title">
        <h2 id="cart-items-title">Bottle roster</h2>
        <article v-for="item in cartItems" :key="item.flavorId" class="astropop-cart-item">
          <img :src="item.flavor.bottleImage" :alt="`${item.flavor.name} AstroPop bottle`" />
          <div class="astropop-cart-item__details">
            <h3>{{ item.flavor.name }}</h3>
            <p>{{ item.flavor.slogan }}</p>
            <button
              type="button"
              class="astropop-cart-item__remove"
              :disabled="crateStore.isCheckoutLocked"
              @click="removeItem(item.flavorId, item.flavor.name)"
            >
              Remove bottle
            </button>
          </div>
          <div class="astropop-cart-item__quantity">
            <label :for="`quantity-${item.flavorId}`">Quantity</label>
            <div class="astropop-cart-item__quantity-controls">
              <button
                type="button"
                :aria-label="`Decrease ${item.flavor.name} quantity`"
                :disabled="crateStore.isCheckoutLocked"
                @click="decreaseQuantity(item.flavorId, item.flavor.name)"
              >
                −
              </button>
              <input
                :id="`quantity-${item.flavorId}`"
                type="number"
                inputmode="numeric"
                min="0"
                :max="item.quantity + crateStore.remainingCapacity"
                :value="item.quantity"
                :disabled="crateStore.isCheckoutLocked"
                @change="updateQuantity($event, item.flavorId, item.quantity, item.flavor.name)"
              />
              <button
                type="button"
                :aria-label="`Increase ${item.flavor.name} quantity`"
                :disabled="crateStore.isFull || crateStore.isCheckoutLocked"
                @click="increaseQuantity(item.flavorId, item.flavor.name)"
              >
                +
              </button>
            </div>
          </div>
        </article>
      </section>

      <aside class="astropop-cart-summary" aria-labelledby="cart-summary-title">
        <p class="astropop-eyebrow astropop-cart-summary__eyebrow">Crate capacity</p>
        <h2 id="cart-summary-title">{{ crateStore.totalBottles }} of 6 bottles</h2>
        <div class="astropop-cart-summary__meter" aria-label="Six-bottle capacity indicator">
          <span
            v-for="slot in 6"
            :key="slot"
            :class="{ 'is-filled': slot <= crateStore.totalBottles }"
          ></span>
        </div>
        <p>
          {{ crateStore.remainingCapacity }}
          {{ crateStore.remainingCapacity === 1 ? "space remains" : "spaces remain" }}
          in your rocket crate.
        </p>
        <p class="astropop-cart-summary__note">
          Bottle prices will appear when the soda counter opens.
        </p>
        <NuxtLink class="astropop-cart-summary__continue" to="/app/astro-pop#pack-your-pop-title"
          >Continue shopping</NuxtLink
        >
        <AstroPopCheckoutButton />
      </aside>
    </div>
  </main>
</template>

<style scoped src="./cart.css"></style>
