<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";

defineProps<{
  links: Array<{ label: string; to: string }>;
}>();

const emit = defineEmits<{
  close: [restoreFocus?: boolean];
  navigate: [];
}>();

const closeButton = ref<HTMLButtonElement>();
const panel = ref<HTMLElement>();

function close() {
  emit("close");
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    event.preventDefault();
    close();
    return;
  }

  if (event.key !== "Tab" || !panel.value) {
    return;
  }

  const focusableElements = Array.from(
    panel.value.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
}

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  void nextTick(() => closeButton.value?.focus());
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <div class="universe-mobile-nav">
      <button
        class="universe-mobile-nav__backdrop"
        type="button"
        aria-label="Close navigation menu"
        @click="close"
      />
      <aside
        id="universe-mobile-navigation"
        ref="panel"
        class="universe-mobile-nav__panel"
        role="dialog"
        aria-modal="true"
        aria-label="CosmoPort navigation menu"
      >
        <div class="universe-mobile-nav__header">
          <p>CosmoPort Universe</p>
          <button ref="closeButton" class="universe-mobile-nav__close" type="button" @click="close">
            <span aria-hidden="true">×</span>
            <span>Close menu</span>
          </button>
        </div>
        <nav class="universe-mobile-nav__links" aria-label="CosmoPort sections">
          <NuxtLink v-for="link in links" :key="link.to" :to="link.to" @click="emit('navigate')">
            {{ link.label }}
          </NuxtLink>
        </nav>
        <div class="universe-mobile-nav__radio">
          <slot />
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<style scoped src="./UniverseMobileNavPanel.css"></style>
