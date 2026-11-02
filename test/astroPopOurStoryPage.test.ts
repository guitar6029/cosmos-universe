import { createPinia } from "pinia";
import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "vue/server-renderer";
// Astro Pop navigation now consumes shared Clerk identity.
vi.stubGlobal("useUser", () => ({ user: { value: null } }));
import { afterEach, describe, expect, it, vi } from "vitest";
import AstroPopOurStoryPage from "../app/pages/app/astro-pop/our-story.vue";
import { ASTRO_POP_MEDIA } from "../app/data/astroPopMedia";

const NuxtLink = defineComponent({
  props: { to: { type: String, required: true } },
  setup: (props, { slots }) => () => h("a", { href: props.to }, slots.default?.()),
});

describe("AstroPop Our Story page", () => {
  it("renders the story hero and all three chapters with their supplied images and copy", async () => {
    vi.stubGlobal("useHead", () => undefined);
    vi.stubGlobal("useRoute", () => ({ path: "/app/astro-pop/our-story" }));
    const app = createSSRApp(AstroPopOurStoryPage);
    app.use(createPinia());
    app.component("NuxtLink", NuxtLink);
    const html = await renderToString(app);
    const renderedText = html.replaceAll("&#39;", "'");

    expect(html).toContain(`src="${ASTRO_POP_MEDIA.story.hero}"`);
    expect(html).toContain('alt="A father pouring homemade red soda beside his smiling family at a backyard table at sunset"');
    expect(html).toContain("Our Story");
    expect(html).toContain("Est. 1957");
    expect(html).toMatch(/<h1[^>]*id="astropop-our-story-title"[^>]*>It Started on the Porch\.<\/h1>/);
    expect(html).toContain("Before Astro Pop became a household name");
    expect(html).toContain('href="/app/astro-pop"');
    expect(html).toContain('href="/app/astro-pop/cart"');
    expect(html).toContain(`src="${ASTRO_POP_MEDIA.story.lemonadeStand}"`);
    expect(html).toContain('alt="Herbert Walker stirring a bright red batch of homemade soda on the family back porch"');
    expect(html).toContain("The Beginning");
    expect(html).toContain("The Porch Years");
    expect(renderedText).toContain("In 1957, Herbert “Herb” Walker wasn't trying to build a soda empire.");
    expect(renderedText).toContain("Most afternoons, you'd find him on the family back porch");
    expect(renderedText).toContain("His most enthusiastic taste tester?");
    expect(renderedText).toContain("If it's not good enough for our family table");
    expect(renderedText).toContain("— Herb Walker");
    expect((html.match(/astropop-porch-years__cap--/g) ?? [])).toHaveLength(3);
    expect(html).toContain(`src="${ASTRO_POP_MEDIA.story.familyDay}"`);
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt="The Walker family standing outside the first Astro Pop Soda Co. storefront beneath its striped awning and hand-painted sign"');
    expect(html).toContain("The First Shop");
    expect(html).toContain("A Storefront of Our Own");
    expect(renderedText).toContain("It started with a few bottles shared over the backyard fence.");
    expect(renderedText).toContain("Well… I think we're going to need a bigger porch.");
    expect(renderedText).toContain("With a little savings, a whole lot of hard work");
    expect(renderedText).toContain("It wasn't fancy. It wasn't big. But it was theirs.");
    expect(html).toContain(`src="${ASTRO_POP_MEDIA.story.neighborhood}"`);
    expect(html).toContain('alt="Families sharing Astro Pop at porches and a picnic table during a neighborhood celebration, with an Astro Pop delivery van on the street"');
    expect(html).toContain("The Astro Pop Promise");
    expect(html).toContain("A Bigger Neighborhood. The Same Promise.");
    expect(renderedText).toContain("What began on one little back porch has grown into more than 250 Astro Pop locations");
    expect(renderedText).toContain("But no matter how much we've grown");
    expect(renderedText).toContain("So grab a Pop, pull up a chair");
    expect(renderedText).toContain("Made for good times, since 1957.");
    expect(html).toContain('href="/app/astro-pop/#astropop-flavors-title"');
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});
