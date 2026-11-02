<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { ASTRO_POP_MEDIA } from "../../data/astroPopMedia";
import UniverseAvatar from "../shared/UniverseAvatar.vue";
import { useCosmosProfile } from "../../composables/useCosmosProfile";
import { useAstroPopCrateStore } from "../../stores/astroPopCrate";

const route = useRoute();
const crateStore = useAstroPopCrateStore();
const isHomepage = computed(() => route.path === "/app/astro-pop");
const isAccountPage = computed(() =>
  route.path === "/app/astro-pop/account" ||
  route.path.startsWith("/app/astro-pop/account/"),
);
const isMenuOpen = ref(false);
const isMobileMenu = ref(true);
const menuTrigger = ref<HTMLButtonElement>();
const closeButton = ref<HTMLButtonElement>();
const drawer = ref<HTMLElement>();
let previousBodyOverflow = "";
let mobileQuery: MediaQueryList | undefined;

const isMobileNavigation = () => isMobileMenu.value;

const { isSignedIn } = useAuth();
const { user } = useUser();
const {
  avatarSrc,
  loading: profileLoading,
} = useCosmosProfile();
const userName = computed(() => user.value?.fullName || user.value?.username || user.value?.primaryEmailAddress?.emailAddress || "Cosmos traveler");

const scrollToTop = () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
};

const closeMenu = (returnFocus = true) => {
  isMenuOpen.value = false;

  if (returnFocus) {
    nextTick(() => menuTrigger.value?.focus());
  }
};

const handleCapClick = () => {
  if (isMobileNavigation()) {
    isMenuOpen.value = true;
    return;
  }

  scrollToTop();
};

const handleMobileQueryChange = (event: MediaQueryListEvent) => {
  isMobileMenu.value = event.matches;
  if (!event.matches && isMenuOpen.value) {
    closeMenu(false);
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && isMenuOpen.value) {
    event.preventDefault();
    closeMenu();
    return;
  }

  if (event.key !== "Tab" || !isMenuOpen.value || !drawer.value) {
    return;
  }

  const focusableElements = Array.from(
    drawer.value.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements.at(-1);

  if (!firstElement || !lastElement) {
    return;
  }

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
};

onMounted(() => {
  crateStore.restoreFromStorage();
  document.addEventListener("keydown", handleKeydown);
  mobileQuery = window.matchMedia("(max-width: 700px)");
  isMobileMenu.value = mobileQuery.matches;
  mobileQuery.addEventListener("change", handleMobileQueryChange);
});

watch(isMenuOpen, async (isOpen) => {
  if (typeof document === "undefined") {
    return;
  }

  if (isOpen) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    await nextTick();
    closeButton.value?.focus();
  } else {
    document.body.style.overflow = previousBodyOverflow;
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeydown);
  mobileQuery?.removeEventListener("change", handleMobileQueryChange);
  document.body.style.overflow = previousBodyOverflow;
});
</script>

<template>
  <nav class="navigation" aria-label="AstroPop navigation">
    <NuxtLink v-if="!isHomepage && !isMobileNavigation()" class="navigation__cap" to="/app/astro-pop"
      aria-label="Astro Pop home">
      <img :src="ASTRO_POP_MEDIA.sodaCap" alt="" aria-hidden="true" />
    </NuxtLink>
    <button v-else ref="menuTrigger" class="navigation__cap" type="button"
      :aria-expanded="isMobileNavigation() ? isMenuOpen : undefined"
      :aria-controls="isMobileNavigation() ? 'astropop-mobile-menu' : undefined"
      :aria-label="isMobileNavigation() ? 'Open navigation menu' : 'Back to top'" @click="handleCapClick">
      <img :src="ASTRO_POP_MEDIA.sodaCap" alt="" aria-hidden="true" />
    </button>

    <div class="navigation__links" aria-label="AstroPop sections">

      <template v-if="isAccountPage">
        <NuxtLink to="/app/astro-pop/account">
          Orders
        </NuxtLink>
      </template>


      <template v-else-if="isHomepage">
        <a href="#astropop-flavors-title">Flavors</a>
        <a href="#pack-your-pop-title">Pack Your Pop</a>
        <a href="#astropop-delivery-plans">Delivery</a>
        <a href="#astropop-delivery-testimonials">Reviews</a>
      </template>
      <NuxtLink v-else to="/app/astro-pop/#astropop-flavors-title">Shop Flavors</NuxtLink>
    </div>

    <div class="flex items-center gap-2">
      <NuxtLink v-if="isSignedIn" class="navigation__account-avatar" to="/app/astro-pop/account"
        aria-label="Account" title="Astro Pop orders">
        <span v-if="profileLoading" class="navigation__avatar-loading" role="status"
          aria-label="Loading traveler avatar" />
        <UniverseAvatar v-else :image-url="avatarSrc" :name="userName" />
      </NuxtLink>
      <NuxtLink to="/app/astro-pop/cart" class="navigation__cart"
        :aria-label="`Cart, ${crateStore.totalBottles} bottles`">
        <img :src="ASTRO_POP_MEDIA.cartCrate" alt="" aria-hidden="true" loading="lazy" />
        <span class="navigation__cart-count" aria-hidden="true">{{ crateStore.totalBottles }}</span>
      </NuxtLink>
    </div>
  </nav>

  <Teleport to="body">
    <div v-if="isMenuOpen" class="navigation-drawer-wrap">
      <button class="navigation-drawer__backdrop" type="button" aria-label="Close navigation menu"
        @click="closeMenu()" />
      <aside id="astropop-mobile-menu" ref="drawer" class="navigation-drawer" role="dialog" aria-modal="true"
        aria-label="AstroPop navigation menu">
        <div class="navigation-drawer__header">
          <NuxtLink v-if="!isHomepage" class="navigation-drawer__home-link" to="/app/astro-pop"
            aria-label="Astro Pop home" @click="closeMenu(false)">
            <img :src="ASTRO_POP_MEDIA.sodaCap" alt="" aria-hidden="true" />
          </NuxtLink>
          <img v-else :src="ASTRO_POP_MEDIA.sodaCap" alt="" aria-hidden="true" />
          <button ref="closeButton" class="navigation-drawer__close" type="button" @click="closeMenu()">
            <span aria-hidden="true">×</span><span>Close menu</span>
          </button>
        </div>
        <nav aria-label="AstroPop mobile sections">
          <template v-if="isAccountPage">
            <NuxtLink to="/app/astro-pop/account" @click="closeMenu(false)">Orders</NuxtLink>
          </template>
          <template v-else-if="isHomepage">
            <a href="#astropop-flavors-title" @click="closeMenu(false)">Flavors</a>
            <a href="#pack-your-pop-title" @click="closeMenu(false)">Pack Your Pop</a>
            <a href="#astropop-delivery-plans" @click="closeMenu(false)">Delivery</a>
            <a href="#astropop-delivery-testimonials" @click="closeMenu(false)">Reviews</a>
            <a href="#astropop-title" @click="closeMenu(false)">Back to Top</a>
          </template>
          <NuxtLink v-else to="/app/astro-pop/#astropop-flavors-title" @click="closeMenu(false)">Shop Flavors</NuxtLink>
        </nav>
      </aside>
    </div>
  </Teleport>
</template>

<style scoped src="./AstroPopNav.css"></style>
