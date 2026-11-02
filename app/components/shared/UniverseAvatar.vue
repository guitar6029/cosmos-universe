<script setup lang="ts">
import { computed, ref, watch } from "vue";

const props = withDefaults(defineProps<{
  name?: string | null;
  imageUrl?: string | null;
  size?: "default" | "large";
}>(), { name: "CosmoPort traveler", imageUrl: null, size: "default" });

const imageFailed = ref(false);
watch(() => props.imageUrl, () => { imageFailed.value = false; });
const initials = computed(() => (props.name || "CosmoPort traveler")
  .split(/[\s@._-]+/).filter(Boolean).slice(0, 2)
  .map((part) => part[0]?.toUpperCase()).join("") || "CP");
</script>

<template>
  <span class="universe-avatar" :class="{ 'universe-avatar--large': size === 'large' }" aria-hidden="true">
    <img v-if="imageUrl && !imageFailed" :src="imageUrl" alt="" @error="imageFailed = true">
    <span v-else class="universe-avatar__initials">{{ initials }}</span>
  </span>
</template>

<style scoped>
.universe-avatar {
  display: inline-grid;
  flex: none;
  place-items: center;
  overflow: hidden;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid #173c47;
  border-radius: .5rem;
  background: #b8493a;
  color: #fff3d7;
}
.universe-avatar--large { width: 6rem; height: 6rem; border-radius: 1rem; }
.universe-avatar img { display: block; width: 100%; height: 100%; object-fit: cover; }
.universe-avatar__initials { font: 700 .8rem Georgia, serif; }
.universe-avatar--large .universe-avatar__initials { font-size: 1.75rem; }
</style>
