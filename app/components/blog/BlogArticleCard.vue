<script setup lang="ts">
import { computed } from "vue";
import type { BlogListingPost } from "../../types/blog";
import { getSanityImageUrl } from "../../utils/sanityImage";

const props = defineProps<{ post: BlogListingPost }>();
const coverImageUrl = computed(() => getSanityImageUrl(props.post.coverImageUrl, 960, 640));
const avatarUrl = computed(() => getSanityImageUrl(props.post.author?.avatarUrl ?? null, 96, 96));
const publishedDate = computed(() =>
  new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(props.post.publishedAt),
  ),
);
const categoryLabel = computed(() =>
  props.post.category.replace(
    /(^|[-_])(\w)/g,
    (_, prefix: string, letter: string) => `${prefix ? " " : ""}${letter.toUpperCase()}`,
  ),
);
</script>

<template>
  <article class="blog-article-card">
    <div class="blog-article-card__image-wrap">
      <img
        v-if="coverImageUrl"
        class="blog-article-card__image"
        :src="coverImageUrl"
        :alt="`Cover artwork for ${post.title}`"
        width="960"
        height="640"
        loading="lazy"
      />
      <div v-else class="blog-article-card__image-fallback" aria-hidden="true"><span>CU</span></div>
    </div>
    <div class="blog-article-card__content">
      <p class="blog-article-card__category">{{ categoryLabel }}</p>
      <h3 class="blog-article-card__title">{{ post.title }}</h3>
      <p class="blog-article-card__excerpt">{{ post.excerpt }}</p>
      <footer class="blog-article-card__byline">
        <img
          v-if="avatarUrl"
          class="blog-article-card__avatar"
          :src="avatarUrl"
          alt=""
          width="32"
          height="32"
          loading="lazy"
        />
        <span v-else class="blog-article-card__avatar-fallback" aria-hidden="true">CU</span>
        <span>
          <span class="blog-article-card__author">{{
            post.author?.name ?? "Cosmos Universe"
          }}</span>
          <span aria-hidden="true"> · </span>
          <time :datetime="post.publishedAt">{{ publishedDate }}</time>
        </span>
      </footer>
    </div>
  </article>
</template>

<style scoped src="./BlogArticleCard.css"></style>
