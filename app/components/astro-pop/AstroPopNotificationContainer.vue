<script setup lang="ts">
import { useAstroPopNotifications } from "../../composables/astro-pop/useAstroPopNotifications";
import AstroPopNotification from "./AstroPopNotification.vue";

const { notifications, dismiss, pause, resume } = useAstroPopNotifications();
</script>

<template>
  <TransitionGroup
    name="astro-pop-notification"
    tag="div"
    class="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-lg flex-col gap-3 sm:bottom-6 sm:right-6"
  >
    <AstroPopNotification
      v-for="notification in notifications"
      :key="notification.id"
      :notification="notification"
      @dismiss="dismiss(notification.id)"
      @pause="pause(notification.id, $event)"
      @resume="resume(notification.id, $event)"
    />
  </TransitionGroup>
</template>

<style scoped>
.astro-pop-notification-enter-active,
.astro-pop-notification-leave-active,
.astro-pop-notification-move {
  transition:
    opacity 225ms ease,
    transform 225ms ease;
}

.astro-pop-notification-enter-from,
.astro-pop-notification-leave-to {
  opacity: 0;
  transform: translateX(1rem);
}

.astro-pop-notification-leave-active {
  position: absolute;
  width: 100%;
}

@media (prefers-reduced-motion: reduce) {
  .astro-pop-notification-enter-active,
  .astro-pop-notification-leave-active,
  .astro-pop-notification-move {
    transition: none;
  }
}
</style>
