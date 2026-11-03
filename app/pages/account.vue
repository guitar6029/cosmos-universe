<script setup lang="ts">
import { computed, ref, watch } from "vue";
import UniverseAvatar from "../components/shared/UniverseAvatar.vue";

definePageMeta({ middleware: ["universe-account-auth"] });
useSeoMeta({ title: "My Account | Cosmos Universe", robots: "noindex, nofollow" });

const { isLoaded, user } = useUser();
const firstName = ref("");
const lastName = ref("");
const saving = ref(false);
const error = ref("");
const success = ref("");

const displayName = computed(
  () =>
    user.value?.fullName ||
    user.value?.username ||
    user.value?.primaryEmailAddress?.emailAddress ||
    "Cosmos traveler",
);

watch(
  user,
  (current) => {
    if (!current || saving.value) return;
    firstName.value = current.firstName ?? "";
    lastName.value = current.lastName ?? "";
  },
  { immediate: true },
);

async function saveName() {
  if (saving.value || !user.value) return;
  error.value = "";
  success.value = "";
  const first = firstName.value.trim();
  const last = lastName.value.trim();
  if (!first || !last || first.length > 100 || last.length > 100) {
    error.value = "Enter a first and last name (up to 100 characters each).";
    return;
  }
  saving.value = true;
  try {
    await user.value.update({ firstName: first, lastName: last });
    success.value = "Your name has been updated throughout Cosmos Universe.";
  } catch {
    error.value = "We couldn't update your name. Please try again.";
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="universe-account">
    <header class="universe-account__nav"><UniverseNav presentation="surface" /></header>
    <main class="universe-account__main">
      <div class="universe-account__heading">
        <p class="universe-account__eyebrow">Cosmos Universe · Passport records</p>
        <h1>My Account</h1>
        <p>
          Manage your identity across the universe. Each destination keeps its own orders and
          activity.
        </p>
      </div>

      <section v-if="!isLoaded || !user" class="universe-account__card" role="status">
        Loading your profile…
      </section>
      <template v-else>
        <section class="universe-account__card" aria-labelledby="profile-title">
          <div class="universe-account__identity">
            <UniverseAvatar :image-url="user.imageUrl" :name="displayName" size="large" />
            <div>
              <h2 id="profile-title">{{ displayName }}</h2>
              <p>{{ user.primaryEmailAddress?.emailAddress || "No email address on file" }}</p>
              <p class="universe-account__hint">
                Your avatar is shared across Cosmos Universe apps.
              </p>
            </div>
          </div>
          <form class="universe-account__form" @submit.prevent="saveName">
            <div>
              <label for="universe-first-name">First name</label>
              <input
                id="universe-first-name"
                v-model="firstName"
                autocomplete="given-name"
                maxlength="100"
                required
                :disabled="saving"
              />
            </div>
            <div>
              <label for="universe-last-name">Last name</label>
              <input
                id="universe-last-name"
                v-model="lastName"
                autocomplete="family-name"
                maxlength="100"
                required
                :disabled="saving"
              />
            </div>
            <p v-if="error" class="universe-account__error" role="alert">{{ error }}</p>
            <p v-if="success" class="universe-account__success" role="status">{{ success }}</p>
            <button type="submit" :disabled="saving">{{ saving ? "Saving…" : "Save name" }}</button>
          </form>
        </section>
        <section class="universe-account__card" aria-labelledby="privacy-title">
          <h2 id="privacy-title">Security &amp; privacy</h2>
          <p>
            Password management, avatar changes, and account deletion will be added as separate
            verified workflows. No irreversible account action is enabled here yet.
          </p>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped>
.universe-account {
  min-height: 100svh;
  background: #f3e4c7;
  color: #173c47;
}
.universe-account__nav {
  padding-top: 1rem;
}
.universe-account__main {
  width: min(100% - 2rem, 54rem);
  margin: 0 auto;
  padding: 3rem 0 5rem;
}
.universe-account__heading {
  margin-bottom: 2rem;
}
.universe-account__heading h1 {
  margin: 0.4rem 0;
  font:
    900 clamp(2.4rem, 6vw, 4rem)/1.1 Georgia,
    serif;
}
.universe-account__heading p {
  max-width: 40rem;
  line-height: 1.6;
}
.universe-account__eyebrow {
  color: #a34335;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.universe-account__card {
  margin-top: 1.5rem;
  border: 2px solid #173c47;
  border-radius: 1rem;
  padding: clamp(1.25rem, 4vw, 2rem);
  background: #fff3d7;
  box-shadow: 0.35rem 0.4rem 0 #173c47;
}
.universe-account__identity {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}
.universe-account__identity h2 {
  margin: 0;
  font:
    800 clamp(1.35rem, 3vw, 2rem)/1.2 Georgia,
    serif;
}
.universe-account__identity p {
  margin: 0.4rem 0 0;
  overflow-wrap: anywhere;
}
.universe-account__hint {
  color: #51646a;
  font-size: 0.87rem;
}
.universe-account__form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}
.universe-account__form > div {
  display: grid;
  gap: 0.35rem;
}
.universe-account__form label {
  font-weight: 800;
}
.universe-account__form input {
  min-width: 0;
  border: 2px solid #173c47;
  border-radius: 0.4rem;
  padding: 0.7rem;
  background: #fffdf5;
  color: #173c47;
  font: inherit;
}
.universe-account__form button {
  width: fit-content;
  border: 2px solid #173c47;
  border-radius: 0.5rem;
  padding: 0.7rem 1rem;
  background: #78c5bf;
  color: #173c47;
  font-weight: 800;
  cursor: pointer;
}
.universe-account__form button:disabled {
  opacity: 0.65;
  cursor: wait;
}
.universe-account__form :is(button, input):focus-visible {
  outline: 3px solid #a34335;
  outline-offset: 3px;
}
.universe-account__error,
.universe-account__success {
  grid-column: 1 / -1;
  margin: 0;
  font-weight: 700;
}
.universe-account__error {
  color: #9a3024;
}
.universe-account__success {
  color: #116c53;
}
.universe-account__card > h2 {
  margin-top: 0;
  font:
    800 1.5rem Georgia,
    serif;
}
.universe-account__card > p {
  line-height: 1.6;
}
@media (max-width: 37rem) {
  .universe-account__form {
    grid-template-columns: 1fr;
  }
}
</style>
