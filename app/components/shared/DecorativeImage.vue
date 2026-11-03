<script setup lang="ts">
defineProps<{
  src: string;
}>();
</script>

<template>
  <img class="decorative-image" :src="src" alt="" aria-hidden="true" />
</template>

<style scoped>
:where(.decorative-image) {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  height: auto;
  max-width: 100%;
  pointer-events: none;
  user-select: none;
}
</style>
