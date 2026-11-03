<script setup lang="ts">
import { onBeforeUnmount, watch } from "vue";
import { useRoute } from "vue-router";
import { useUniverseRadio } from "../../composables/useUniverseRadio";

const route = useRoute();
const { stopForMiniApp, dispose } = useUniverseRadio();

function isMiniApp(path: string) {
  return ["/app/astro-pop", "/passport-office", "/app/cosmoport-voyage"].some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

watch(
  () => route.path,
  (path) => {
    if (isMiniApp(path)) stopForMiniApp();
  },
  { immediate: true },
);

onBeforeUnmount(dispose);
</script>

<template><span class="universe-radio-provider" aria-hidden="true" /></template>
