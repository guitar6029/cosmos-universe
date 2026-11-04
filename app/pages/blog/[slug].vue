<script setup lang="ts">
import { computed } from "vue";
import { SITE_URL } from "~/site";
import type { BlogArticle } from "~/types/blog";
import { getSanityImageUrl } from "~/utils/sanityImage";

const route = useRoute();
const slug = computed(() => String(route.params.slug));
const { data: articleResponse, error: articleError } = await useFetch<BlogArticle>(
  () => `/api/blog/${slug.value}`,
  {
    key: () => `blog-article-${slug.value}`,
  },
);

if (articleError.value) {
  if (articleError.value.statusCode === 404) {
    throw createError({ statusCode: 404, statusMessage: "Chronicle dispatch not found." });
  }

  throw createError({
    statusCode: 502,
    statusMessage: "The Chronicle dispatch is temporarily unavailable.",
  });
}

if (!articleResponse.value) {
  throw createError({ statusCode: 404, statusMessage: "Chronicle dispatch not found." });
}

const article = computed(() => articleResponse.value as BlogArticle);

const categoryLabels: Record<string, string> = {
  engineering: "Engineering Logs",
  debugging: "Debugging Dispatches",
  updates: "Universe Updates",
  lore: "Universe Lore",
};
const coverImageUrl = computed(() =>
  getSanityImageUrl(article.value?.coverImageUrl ?? null, 1800, 1000),
);
const avatarUrl = computed(() =>
  getSanityImageUrl(article.value?.author?.avatarUrl ?? null, 112, 112),
);
const categoryLabel = computed(
  () => categoryLabels[article.value?.category ?? ""] ?? article.value?.category,
);
const publishedDate = computed(() =>
  new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(article.value.publishedAt),
  ),
);

useSeoMeta({
  title: () => `${article.value?.title ?? "Chronicle Dispatch"} | Cosmos Universe`,
  description: () => article.value?.excerpt,
  ogTitle: () => article.value?.title,
  ogDescription: () => article.value?.excerpt,
  ogImage: () => coverImageUrl.value ?? undefined,
  ogType: "article",
});
useHead({
  link: [{ rel: "canonical", href: () => new URL(`/blog/${slug.value}`, SITE_URL).toString() }],
});
</script>

<template>
  <div class="chronicle-article">
    <header class="chronicle-article__nav"><UniverseNav presentation="surface" /></header>

    <main>
      <section class="chronicle-article__panel" aria-hidden="true">
        <span></span><span></span><span></span>
      </section>

      <div class="chronicle-article__cover-shell">
        <img
          v-if="coverImageUrl"
          class="chronicle-article__cover"
          :src="coverImageUrl"
          :alt="`Cover artwork for ${article.title}`"
          width="1800"
          height="1000"
          fetchpriority="high"
        />
        <div
          v-else
          class="chronicle-article__cover chronicle-article__cover--fallback"
          aria-label="Cosmos Universe Chronicle cover artwork"
        >
          <span>CU</span><span>The Universe Chronicle</span>
        </div>
      </div>

      <article class="chronicle-article__paper">
        <div class="chronicle-article__heading">
          <NuxtLink class="chronicle-article__back" to="/blog">← All dispatches</NuxtLink>
          <p class="chronicle-article__category">{{ categoryLabel }}</p>
          <h1>{{ article.title }}</h1>
          <p class="chronicle-article__excerpt">{{ article.excerpt }}</p>
          <div class="chronicle-article__byline">
            <img v-if="avatarUrl" :src="avatarUrl" alt="" width="56" height="56" />
            <span v-else class="chronicle-article__avatar-fallback" aria-hidden="true">CU</span>
            <p>
              By <strong>{{ article.author?.name ?? "Cosmos Universe" }}</strong
              ><br /><time :datetime="article.publishedAt">{{ publishedDate }}</time>
            </p>
          </div>
        </div>
        <BlogPortableTextRenderer :blocks="article.body" />
      </article>
    </main>
  </div>
</template>

<style scoped src="./article.css"></style>
