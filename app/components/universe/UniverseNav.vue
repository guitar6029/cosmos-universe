<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import UniverseRadioControl from "./UniverseRadioControl.vue";
import UniverseAvatar from "../shared/UniverseAvatar.vue";
import { useCosmosProfile } from "../../composables/useCosmosProfile";

const { isLoaded, isSignedIn, signOut } = useAuth();
const { user } = useUser();
const isSigningOut = ref(false);
const signOutError = ref("");
const accountMenuOpen = ref(false);
const profileRoot = ref<HTMLDivElement>();
const accountToggle = ref<HTMLButtonElement>();
const signOutButton = ref<HTMLButtonElement>();

const hasAdminAccess = ref(false);


const {
  avatarSrc,
  loading: profileLoading,
} = useCosmosProfile();

withDefaults(defineProps<{
  presentation?: "overlay" | "surface";
}>(), {
  presentation: "overlay",
});

const userName = computed(() => (
  user.value?.fullName
  || user.value?.username
  || user.value?.primaryEmailAddress?.emailAddress
  || "CosmoPort traveler"
));

const userEmail = computed(() => user.value?.primaryEmailAddress?.emailAddress || "No email address on file");

const handleSignOut = async () => {
  if (isSigningOut.value) {
    return;
  }

  signOutError.value = "";
  accountMenuOpen.value = true;
  isSigningOut.value = true;

  try {
    await signOut.value({ redirectUrl: "/" });
  } catch {
    signOutError.value = "We couldn't sign you out. Please try again.";
  } finally {
    isSigningOut.value = false;
  }
};

function closeAccountMenu(restoreFocus = false) {
  if (isSigningOut.value) {
    return;
  }

  accountMenuOpen.value = false;

  if (restoreFocus) {
    void nextTick(() => accountToggle.value?.focus());
  }
}

function openAccountMenu() {
  signOutError.value = "";
  accountMenuOpen.value = true;
  // Upcoming Account/Settings destinations aren't actionable yet.
  void nextTick(() => signOutButton.value?.focus());
}

function toggleAccountMenu() {
  if (accountMenuOpen.value) {
    closeAccountMenu(true);
    return;
  }

  openAccountMenu();
}

function handleAccountKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && accountMenuOpen.value && !isSigningOut.value) {
    event.preventDefault();
    closeAccountMenu(true);
  }
}

function closeOnOutsideInteraction(event: Event) {
  if (accountMenuOpen.value && !isSigningOut.value
    && event.target instanceof Node && !profileRoot.value?.contains(event.target)) {
    closeAccountMenu();
  }
}

const isAdmin = computed(() =>
  isSignedIn.value === true && hasAdminAccess.value
);

onMounted(() => {
  document.addEventListener("pointerdown", closeOnOutsideInteraction);
  document.addEventListener("focusin", closeOnOutsideInteraction);
  watch(isSignedIn, (signedIn) => {
    hasAdminAccess.value = false;
    if (!signedIn) return;

    $fetch<{ authorized: boolean }>("/api/admin/access")
      .then(({ authorized }) => {
        hasAdminAccess.value = authorized === true;
      })
      .catch(() => {
        hasAdminAccess.value = false;
      });
  }, { immediate: true });
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", closeOnOutsideInteraction);
  document.removeEventListener("focusin", closeOnOutsideInteraction);
});
</script>

<template>
  <nav class="universe-nav" :class="`universe-nav--${presentation}`" aria-label="CosmoPort Universe">
    <div class="flex items-center gap-2">
      <NuxtLink class="universe-nav__link" to="/">Home</NuxtLink>
      <NuxtLink class="universe-nav__link" to="/about">About</NuxtLink>
      <UniverseRadioControl />
    </div>

    <div class="universe-nav__account" aria-live="polite">
      <template v-if="!isLoaded">
        <span class="universe-nav__loading" role="status">Loading account controls</span>
      </template>

      <template v-else-if="!isSignedIn">
        <div class="universe-nav__controls">
          <NuxtLink class="universe-nav__button universe-nav__button--quiet" to="/passport-office?intent=sign-in">Sign
            In</NuxtLink>
          <NuxtLink class="universe-nav__button" to="/passport-office?intent=register">Register</NuxtLink>
        </div>
      </template>

      <template v-else>
        <div ref="profileRoot" class="universe-nav__profile" @keydown="handleAccountKeydown">
          <button ref="accountToggle" class="universe-nav__account-toggle" type="button"
            :aria-label="'Account for ' + userName" :aria-expanded="accountMenuOpen"
            aria-controls="universe-account-menu" @click="toggleAccountMenu">
            <span v-if="profileLoading"
              class="inline-block size-10 rounded-full bg-current/15 motion-safe:animate-pulse" role="status"
              aria-label="Loading traveler avatar" />

            <UniverseAvatar v-else :image-url="avatarSrc" :name="userName" />
            <!-- <UniverseAvatar :image-url="user?.imageUrl" :name="userName" /> -->
            <svg class="universe-nav__chevron" :class="{ 'universe-nav__chevron--open': accountMenuOpen }"
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          <div v-if="accountMenuOpen" id="universe-account-menu" class="universe-nav__account-menu" role="group"
            aria-label="Account details">
            <div class="universe-nav__account-identity">
              <p class="universe-nav__account-name">{{ userName }}</p>
              <p class="universe-nav__account-email">{{ userEmail }}</p>
            </div>
            <hr class="universe-nav__menu-divider" />
            <NuxtLink to="/account" class="universe-nav__menu-item universe-nav__menu-link" @click="closeAccountMenu()">
              <svg class="universe-nav__menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                aria-hidden="true">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5.5 20v-1.5a6.5 6.5 0 0 1 13 0V20" />
              </svg>
              <span>My Account</span>
            </NuxtLink>
            <NuxtLink v-if="isAdmin" to="/admin" class="universe-nav__menu-item universe-nav__menu-link"
              @click="closeAccountMenu()">
              <svg class="universe-nav__menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                aria-hidden="true">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5.5 20v-1.5a6.5 6.5 0 0 1 13 0V20" />
              </svg>
              <span>Admin Dashboard</span>
            </NuxtLink>
            <div class="universe-nav__menu-item universe-nav__menu-item--unavailable" aria-disabled="true">
              <svg class="universe-nav__menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                aria-hidden="true">
                <path d="M4.5 6.5h15M4.5 12h15M4.5 17.5h15" />
                <circle cx="9" cy="6.5" r="2" fill="var(--cp-universe-space-teal)" />
                <circle cx="15" cy="12" r="2" fill="var(--cp-universe-space-teal)" />
                <circle cx="9" cy="17.5" r="2" fill="var(--cp-universe-space-teal)" />
              </svg>
              <span>Settings</span>
              <span class="universe-nav__menu-soon">Soon</span>
            </div>
            <hr class="universe-nav__menu-divider" />
            <button ref="signOutButton" class="universe-nav__menu-item universe-nav__menu-sign-out" type="button"
              :disabled="isSigningOut" @click="handleSignOut">
              <svg class="universe-nav__menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                aria-hidden="true">
                <path
                  d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
              </svg>
              <span>{{ isSigningOut ? "Signing Out" : "Sign Out" }}</span>
            </button>
            <p v-if="signOutError" class="universe-nav__sign-out-error" role="alert">{{ signOutError }}</p>
          </div>
        </div>
      </template>
    </div>
  </nav>
</template>

<style scoped src="./UniverseNav.css"></style>
