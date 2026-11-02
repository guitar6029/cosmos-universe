import { createSSRApp, defineComponent, h, ref } from "vue";
import { createPinia } from "pinia";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it, vi } from "vitest";
import AstroPopNav from "../app/components/astro-pop/AstroPopNav.vue";
import { ASTROPOP_FLAVORS } from "../app/data/astroPopFlavors";
import { useAstroPopCrateStore } from "../app/stores/astroPopCrate";

const route = { path: "/app/astro-pop" };

vi.stubGlobal("useRoute", () => route);
vi.stubGlobal("useUser", () => ({ user: ref({ fullName: "Nova Ray", imageUrl: "https://example.test/nova.png" }) }));
vi.stubGlobal("useAuth", () => ({
  isLoaded: ref(true),
  isSignedIn: ref(true),
  signOut: vi.fn(),
}));
vi.mock("../app/composables/useCosmosProfile", () => ({
  useCosmosProfile: () => ({
    avatarSrc: ref("https://media.cosmos-universe.com/avatars/cosmos_avatar_robot_transparent.png"),
    loading: ref(false),
  }),
}));

const renderNavigation = async (bottles = 0, path = "/app/astro-pop") => {
  route.path = path;
  const pinia = createPinia();
  const app = createSSRApp({ render: () => h(AstroPopNav) });
  app.use(pinia);
  app.component("NuxtLink", defineComponent({
    props: { to: { type: String, required: true } },
    setup(props, { slots }) {
      return () => h("a", { href: props.to }, slots.default?.());
    },
  }));

  if (bottles > 0) {
    useAstroPopCrateStore(pinia).addItem(ASTROPOP_FLAVORS[0].id, bottles);
  }

  return renderToString(app);
};

describe("AstroPop navigation", () => {
  it("renders section links, the cap control, and the accessible cart quantity", async () => {
    const html = await renderNavigation();
    expect(html).toContain('aria-label="AstroPop navigation"');
    expect(html).toContain("Open navigation menu");
    expect(html).toContain('href="#astropop-flavors-title"');
    expect(html).toContain('href="#pack-your-pop-title"');
    expect(html).toContain('href="#astropop-delivery-plans"');
    expect(html).toContain('href="#astropop-delivery-testimonials"');
    expect(html).toContain('href="/app/astro-pop/cart"');
    expect(html).toContain("Cart, 0 bottles");
  });

  it("shows Orders without a redundant Account link on the account page", async () => {
    const html = await renderNavigation(0, "/app/astro-pop/account");
    expect(html).toContain('href="/app/astro-pop/account"');
    expect(html).toMatch(/>\s*Orders\s*<\/a>/);
    expect(html).toContain('aria-label="Account"');
    expect(html).toContain("cosmos_avatar_robot_transparent.png");
    expect(html).not.toContain("<svg");
  });

  it("uses the current Pinia crate quantity in the cart label", async () => {
    const html = await renderNavigation(2);

    expect(html).toContain("Cart, 2 bottles");
    expect(html).toContain(">2</span>");
  });

  it("uses homepage destinations instead of local fragments on secondary AstroPop pages", async () => {
    const html = await renderNavigation(0, "/app/astro-pop/our-story");

    expect(html).toContain('href="/app/astro-pop/#astropop-flavors-title"');
    expect(html).toContain("Shop Flavors");
    expect(html).not.toContain('href="#pack-your-pop-title"');
    expect(html).not.toContain('href="#astropop-delivery-plans"');
    expect(html).not.toContain('href="#astropop-delivery-testimonials"');
    expect(html).toContain('href="/app/astro-pop/cart"');
  });
});
