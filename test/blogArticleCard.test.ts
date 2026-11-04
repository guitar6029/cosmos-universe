// @vitest-environment jsdom
import { createApp, h, nextTick } from "vue";
import { createMemoryHistory, createRouter, RouterLink } from "vue-router";
import { describe, expect, it } from "vitest";
import BlogArticleCard from "../app/components/blog/BlogArticleCard.vue";

const ARTICLE_SLUG = "the-case-of-the-mysterious-three-lines";

const NuxtLinkStub = {
  props: { to: { type: String, required: true } },
  setup(props: { to: string }, { slots }: { slots: { default?: () => unknown[] } }) {
    return () => h(RouterLink, { to: props.to }, { default: slots.default });
  },
};

describe("Chronicle article card navigation", () => {
  it("navigates from the rendered article card to its dynamic article route", async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { component: { template: "<main />" }, path: "/" },
        { component: { template: "<article />" }, path: "/blog/:slug" },
      ],
    });
    const container = document.createElement("div");
    const app = createApp({
      render: () =>
        h(BlogArticleCard, {
          post: {
            author: null,
            category: "debugging",
            coverImageUrl: null,
            excerpt: "A Chronicle dispatch.",
            publishedAt: "2026-11-04T12:00:00.000Z",
            slug: ARTICLE_SLUG,
            title: "The Case of the Mysterious Three Lines",
          },
        }),
    });

    app.component("NuxtLink", NuxtLinkStub);
    app.use(router);
    await router.push("/");
    await router.isReady();
    document.body.appendChild(container);
    app.mount(container);

    (container.querySelector(".blog-article-card__read-more") as HTMLAnchorElement).click();
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve));

    expect(router.currentRoute.value.fullPath).toBe(`/blog/${ARTICLE_SLUG}`);
    app.unmount();
    container.remove();
  });
});
