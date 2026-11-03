<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AstroPopNotificationContainer from "../../../../components/astro-pop/AstroPopNotificationContainer.vue";
import { useAstroPopNotifications, type AstroPopNotificationOptions } from "../../../../composables/astro-pop/useAstroPopNotifications";
import { useAstroPopCheckoutConfirmation, type AstroPopCheckoutFinalOutcome } from "../../../../composables/useAstroPopCheckoutConfirmation";
import { useAstroPopCrateStore } from "../../../../stores/astroPopCrate";

const route = useRoute();
const crateStore = useAstroPopCrateStore();
const sessionId =
  typeof route.query.session_id === "string"
    ? route.query.session_id
    : undefined;
const { status, finalOutcome, cartCompletion, start } = useAstroPopCheckoutConfirmation({ sessionId, crateStore });
const { show } = useAstroPopNotifications();
const hasMounted = ref(false);
let notificationShown = false;

const notificationFor: Record<AstroPopCheckoutFinalOutcome, AstroPopNotificationOptions> = {
  confirmed: {
    type: "success",
    title: "Order confirmed!",
    message: "Your Astro Pop order is confirmed!",
  },
  "payment-received": {
    type: "info",
    title: "Payment received!",
    message: "We're still finalizing your order.",
  },
  "payment-received-recording-unknown": {
    type: "info",
    title: "Payment received!",
    message: "We couldn't confirm your order record yet.",
  },
  "payment-pending": {
    type: "info",
    title: "Payment processing",
    message: "Your payment hasn't been confirmed yet.",
  },
  unpaid: {
    type: "error",
    title: "Checkout incomplete",
    message: "Your payment wasn't completed. Your cart is still saved.",
  },
  unavailable: {
    type: "error",
    title: "Checkout update",
    message: "We couldn't verify your checkout status. Please try again.",
  },
  unauthorized: {
    type: "error",
    title: "Checkout unavailable",
    message: "This browser cannot access or confirm that checkout.",
  },
  unrecognized: {
    type: "error",
    title: "Checkout unavailable",
    message: "This browser cannot access or confirm that checkout.",
  },
};

const messages = {
  checking: "Checking your checkout…",
  confirmed: "Your payment and order are confirmed.",
  "payment-pending": "Your payment has not been confirmed yet. Your cart is still saved.",
  "payment-received": "Your payment was received. We’re finalizing your order.",
  "payment-received-recording-unknown": "Your payment was received, but order recording is temporarily unavailable.",
  unpaid: "This checkout was not completed. Your cart is still saved.",
  unavailable: "Checkout status is temporarily unavailable. Your cart is still saved.",
  unauthorized: "This browser cannot access that checkout.",
  unrecognized: "We could not confirm this checkout for this browser.",
} as const;
const message = computed(() => messages[status.value]);
const cartMessage = computed(() => {
  if (cartCompletion.value === "cleared") return "Your checkout cart has been cleared.";
  if (cartCompletion.value === "preserved") return "Your cart changed while checkout was in progress, so the updated cart was preserved.";
  if (cartCompletion.value === "untouched") return "Your current cart was left untouched.";
  return "";
});

watch(finalOutcome, (outcome) => {
  if (!outcome || notificationShown) return;
  notificationShown = true;
  show(notificationFor[outcome]);
});

onMounted(() => {
  hasMounted.value = true;
  start();
});
</script>

<template>
  <main class="astropop-checkout-success">
    <AstroPopNotificationContainer v-if="hasMounted" />
    <p v-if="status === 'checking'" role="status">{{ message }}</p>
    <template v-else>
      <h1>{{ status === "confirmed" ? "Thank you for your order" : "Checkout update" }}</h1>
      <p :role="status === 'confirmed' ? undefined : 'alert'">{{ message }}</p>
      <p v-if="cartMessage">{{ cartMessage }}</p>
      <NuxtLink to="/app/astro-pop/cart">Return to your cart</NuxtLink>
    </template>
  </main>
</template>

<style scoped>
.astropop-checkout-success {
  min-height: 100vh;
  padding: 3rem 1.5rem;
  background: radial-gradient(circle at top, #fff4d8 0, #e8d3ad 55%);
  color: var(--astropop-ink);
  font-family: var(--astropop-body-font);
  text-align: center;
}

.astropop-checkout-success h1 {
  font-family: var(--astropop-display-font);
}
</style>
