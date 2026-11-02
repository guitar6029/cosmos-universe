// @vitest-environment jsdom
import { createApp as createVueApp, createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
// Astro Pop navigation now consumes shared Clerk identity.
vi.stubGlobal("useUser", () => ({ user: { value: null } }));
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ASTROPOP_FLAVORS } from "../app/data/astroPopFlavors";
import AstroPopFlavorDetailPage from "../app/pages/app/astro-pop/flavors/[slug].vue";
import { useAstroPopCrateStore } from "../app/stores/astroPopCrate";

const route = { path: "/app/astro-pop/flavors", params: { slug: "" } };
const useHead = vi.fn();

vi.stubGlobal("useRoute", () => route);
vi.stubGlobal("useHead", useHead);
vi.stubGlobal("createError", (options: { statusCode: number; statusMessage: string }) => options);
vi.stubGlobal("matchMedia", () => ({
  matches: false,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
}));

const NuxtLinkStub = {
  props: { to: { type: String, required: true } },
  template: '<a :href="to"><slot /></a>',
};

const renderPage = () => {
  const pinia = createPinia();
  setActivePinia(pinia);

  return renderToString(
    createSSRApp({
      render: () => h(AstroPopFlavorDetailPage),
    })
      .use(pinia)
      .component("NuxtLink", NuxtLinkStub),
  );
};

describe("AstroPop flavor detail page", () => {
  beforeEach(() => {
    useHead.mockClear();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each(ASTROPOP_FLAVORS)("renders the $name hero from catalog data", async (flavor) => {
    route.params.slug = flavor.id;

    const html = await renderPage();

    for (const word of flavor.name.split(" ")) {
      expect(html).toContain(`>${word}</span>`);
    }
    expect(html).toContain(flavor.bottleImage);
    expect(html).toContain(flavor.slogan);
    expect(html).toContain(`href="/app/astro-pop"`);
    expect(useHead).toHaveBeenCalledWith({ title: `${flavor.name} | AstroPop Soda Co.` });
  });

  it("adds the selected flavor to the existing crate store", async () => {
    const flavor = ASTROPOP_FLAVORS[0];
    route.params.slug = flavor.id;
    const pinia = createPinia();
    setActivePinia(pinia);
    const crateStore = useAstroPopCrateStore(pinia);
    const container = document.createElement("div");
    const app = createVueApp(AstroPopFlavorDetailPage);

    app.use(pinia);
    app.component("NuxtLink", NuxtLinkStub);
    document.body.appendChild(container);
    app.mount(container);

    (container.querySelector(".astropop-flavor-hero__add-button") as HTMLButtonElement).click();
    await nextTick();

    expect(crateStore.items).toEqual([{ flavorId: flavor.id, quantity: 1 }]);
    expect(container.textContent).toContain("Added to your manifest · 1 of 6");

    app.unmount();
    container.remove();
  });

  it("returns a 404 error for an unknown flavor slug", async () => {
    route.params.slug = "unknown-flavor";

    await expect(renderPage()).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: "AstroPop flavor not found",
    });
  });
});
