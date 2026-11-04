<script setup lang="ts">
import { onMounted, ref } from "vue";
import { BLOG_MEDIA } from "../data/blogMedia";
import { getBlogEditorialLayout } from "../utils/blogEditorialLayout";
import type { BlogListingPost } from "~/types/blog";

const heroFailed = ref(false);
const heroImage = ref<HTMLImageElement>();
const {
  data: posts,
  error,
  status,
} = await useFetch<BlogListingPost[]>("/api/blog", {
  default: () => [],
  key: "blog-listing",
});

onMounted(() => {
  if (heroImage.value?.complete && heroImage.value.naturalWidth === 0) {
    heroFailed.value = true;
    return;
  }

  void heroImage.value?.decode().catch(() => {
    heroFailed.value = true;
  });
});

useSeoMeta({
  title: "The Universe Chronicle | Cosmos Universe",
  description: "Engineering logs, cosmic dispatches, and stories from tomorrow.",
});
</script>

<template>
  <div class="universe-blog">
    <header class="universe-blog__header">
      <UniverseNav presentation="surface" />
    </header>

    <main>
      <section class="universe-blog__hero" aria-labelledby="universe-chronicle-title">
        <h1 id="universe-chronicle-title" class="universe-blog__sr-only">The Universe Chronicle</h1>
        <div class="universe-blog__fallback" :aria-hidden="!heroFailed">
          <p class="universe-blog__fallback-eyebrow">Cosmos Universe</p>
          <p class="universe-blog__fallback-title">The Universe Chronicle</p>
          <p class="universe-blog__fallback-subtitle">
            Engineering logs, cosmic dispatches, and stories from tomorrow.
          </p>
        </div>
        <img
          v-if="!heroFailed"
          ref="heroImage"
          class="universe-blog__artwork"
          :src="BLOG_MEDIA.universeChronicleTerminal"
          alt="The Universe Chronicle terminal kiosk and illuminated Chronicle signage in the CosmoPort Grand Concourse."
          fetchpriority="high"
          @error="heroFailed = true"
        />
      </section>

      <section class="universe-blog__dispatches" aria-labelledby="latest-dispatches-title">
        <div class="universe-blog__dispatches-inner">
          <header class="universe-blog__dispatches-heading">
            <p class="universe-blog__dispatches-kicker">The Universe Chronicle</p>
            <h2 id="latest-dispatches-title">Latest Dispatches</h2>
            <p>Stories, engineering logs and transmissions from across the universe.</p>
          </header>

          <div v-if="status === 'pending'" class="universe-blog__state" aria-live="polite">
            <p>Receiving the latest transmissions…</p>
          </div>
          <div v-else-if="error" class="universe-blog__state" role="alert">
            <p>The newsroom is temporarily off the air. Please check back soon.</p>
          </div>
          <div v-else-if="posts.length === 0" class="universe-blog__state">
            <p>The newsroom is preparing its first dispatch. Check back soon.</p>
          </div>
          <div v-else class="universe-blog__grid">
            <BlogArticleCard
              v-for="(post, index) in posts"
              :key="post.slug"
              :post="post"
              :layout="getBlogEditorialLayout(index).layout"
              :image-position="getBlogEditorialLayout(index).imagePosition"
            />
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped src="./blog.css"></style>
