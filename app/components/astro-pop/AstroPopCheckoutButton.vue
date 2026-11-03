<script setup lang="ts">
import { ref } from "vue";
import { useAstroPopCrateStore } from "../../stores/astroPopCrate";
import { savePendingAstroPopCheckout } from "../../utils/astroPopCheckout";

const crateStore = useAstroPopCrateStore();

const isCheckingOut = ref(false);
const checkoutError = ref("");

const handleCheckout = async () => {
  if (crateStore.isEmpty || isCheckingOut.value || crateStore.isCheckoutLocked) return;

  const checkoutItems = Object.freeze(
    crateStore.items.map((item) =>
      Object.freeze({
        flavorId: item.flavorId,
        quantity: item.quantity,
      }),
    ),
  );

  if (!crateStore.lockCheckout()) return;
  isCheckingOut.value = true;
  checkoutError.value = "";

  try {
    const response = await $fetch("/api/astro-pop/checkout", {
      method: "POST",
      body: {
        items: checkoutItems,
      },
    });

    if (!response.url || !response.sessionId) {
      // noty here TODO
      throw new Error("Checkout URL missing");
    }

    savePendingAstroPopCheckout(response.sessionId, checkoutItems);
    window.location.assign(response.url);
  } catch {
    // noty TODO
    checkoutError.value = "Unable to start checkout. Please try again.";
    isCheckingOut.value = false;
    crateStore.unlockCheckout();
  }
};
</script>
<template>
  <button
    class="astropop-cart-page__button"
    type="button"
    :disabled="crateStore.isEmpty || isCheckingOut || crateStore.isCheckoutLocked"
    @click="handleCheckout"
  >
    {{ isCheckingOut ? "Preparing checkout..." : "Proceed to Checkout" }}
  </button>

  <p v-if="checkoutError" role="alert">
    {{ checkoutError }}
  </p>
</template>

<style scoped>
.astropop-cart-page__button {
  display: inline-flex;
  min-height: 2.8rem;
  align-items: center;
  justify-content: center;
  border: var(--astropop-border-width) solid #6d2e35;
  border-radius: 999px;
  padding: 0.65rem 1.1rem;
  width: 100%;
  background: var(--astropop-red);
  color: var(--astropop-cream);
  font-family: var(--astropop-label-font);
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-decoration: none;
  text-transform: uppercase;
}

.astropop-cart-page__button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}
</style>
