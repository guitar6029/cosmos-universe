<script setup lang="ts">
import { ASTRO_POP_MEDIA } from "../../data/astroPopMedia";
import type { AstroPopNotification } from "../../composables/astro-pop/useAstroPopNotifications";
import type { AstroPopNotificationType } from "../../types/astroPopNotification";

const props = defineProps<{
  notification: AstroPopNotification;
}>();

const emit = defineEmits<{
  dismiss: [];
  pause: [interaction: "focus" | "pointer" | "touch"];
  resume: [interaction: "focus" | "pointer" | "touch"];
}>();

const notificationImages: Record<AstroPopNotificationType, string> = {
  success: ASTRO_POP_MEDIA.notifications.success,
  error: ASTRO_POP_MEDIA.notifications.error,
  info: ASTRO_POP_MEDIA.notifications.info,
};

function handleFocusOut(event: FocusEvent) {
  const nextTarget = event.relatedTarget;
  const currentTarget = event.currentTarget;

  if (
    nextTarget instanceof Node &&
    currentTarget instanceof HTMLElement &&
    currentTarget.contains(nextTarget)
  ) {
    return;
  }

  emit("resume", "focus");
}
</script>

<template>
  <div
    class="astro-pop-notification"
    :role="props.notification.type === 'error' ? 'alert' : 'status'"
    @pointerenter="emit('pause', 'pointer')"
    @pointerleave="emit('resume', 'pointer')"
    @focusin="emit('pause', 'focus')"
    @focusout="handleFocusOut"
    @touchstart.passive="emit('pause', 'touch')"
    @touchend="emit('resume', 'touch')"
    @touchcancel="emit('resume', 'touch')"
  >
    <img
      :src="notificationImages[props.notification.type]"
      alt=""
      class="astro-pop-notification__portrait"
    />
    <div class="astro-pop-notification__content" tabindex="0">
      <p class="astro-pop-notification__title">{{ props.notification.title }}</p>
      <p class="astro-pop-notification__message">{{ props.notification.message }}</p>
    </div>
    <button
      class="astro-pop-notification__dismiss"
      type="button"
      aria-label="Dismiss notification"
      @click="emit('dismiss')"
    >
      ×
    </button>
  </div>
</template>

<style scoped>
.astro-pop-notification {
  position: relative;
  display: grid;
  grid-template-columns: clamp(7rem, 28vw, 9rem) minmax(0, 1fr);
  gap: clamp(0.5rem, 2vw, 1rem);
  min-height: 7rem;
  overflow: visible;
  border: 3px solid #3a2c35;
  border-radius: 1rem;
  background: #fff9e1;
  box-shadow: 4px 4px 0 #3a2c35;
  pointer-events: auto;
}

.astro-pop-notification__portrait {
  align-self: end;
  width: 132%;
  max-width: none;
  margin: -1.25rem 0 -0.25rem -1.5rem;
  pointer-events: none;
}

.astro-pop-notification__content {
  min-width: 0;
  min-height: 0;
  max-height: 9rem;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 1rem 2.75rem 1rem 0;
  color: #3a2c35;
  overflow-wrap: anywhere;
  -webkit-overflow-scrolling: touch;
}

.astro-pop-notification__content:focus-visible {
  outline: 3px solid var(--astropop-focus-ring, #a83f2e);
  outline-offset: -3px;
}

.astro-pop-notification__title {
  margin: 0 0 0.3rem;
  font-family: var(--astropop-display-font);
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.2;
}

.astro-pop-notification__message {
  margin: 0;
  font-family: var(--astropop-body-font);
  font-size: 1rem;
  line-height: 1.45;
}

.astro-pop-notification__dismiss {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 2px solid #3a2c35;
  border-radius: 50%;
  color: #3a2c35;
  background: #fff9e1;
  font-family: var(--astropop-display-font);
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.astro-pop-notification__dismiss:hover,
.astro-pop-notification__dismiss:focus-visible {
  color: #fff9e1;
  background: #a83f2e;
}

.astro-pop-notification__dismiss:focus-visible {
  outline: 3px solid var(--astropop-focus-ring);
  outline-offset: 2px;
}

@media (max-width: 420px) {
  .astro-pop-notification {
    grid-template-columns: 5.75rem minmax(0, 1fr);
    gap: 0.35rem;
  }

  .astro-pop-notification__portrait {
    width: 125%;
    margin-left: -1rem;
  }

  .astro-pop-notification__content {
    padding-right: 0.75rem;
  }
}
</style>
