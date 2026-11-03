// @vitest-environment jsdom
import { createSSRApp, h, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AstroPopOrderDetailPage from "../app/pages/app/astro-pop/account/orders/[id].vue";
import { ASTROPOP_FLAVORS } from "../app/data/astroPopFlavors";

const route = { params: { id: "f1c2d3e4-5a6b-4c7d-8e9f-0123456789ab" } };
const fetchResult = {
  data: ref<unknown>(null),
  pending: ref(false),
  error: ref<unknown>(null),
  refresh: vi.fn(),
};

vi.stubGlobal("useRoute", () => route);
vi.stubGlobal("useFetch", () => fetchResult);
vi.stubGlobal("definePageMeta", () => undefined);
vi.stubGlobal("useSeoMeta", () => undefined);

const NuxtLinkStub = {
  props: { to: { type: String, required: true } },
  template: '<a :href="to"><slot /></a>',
};
const renderPage = () =>
  renderToString(
    createSSRApp({ render: () => h(AstroPopOrderDetailPage) })
      .component("NuxtLink", NuxtLinkStub)
      .component("AstroPopNav", { template: "<nav>Astro Pop</nav>" })
      .component("AstroPopLoader", {
        props: ["message"],
        template: '<div role="status">{{ message }}</div>',
      }),
  );

describe("Astro Pop order detail page", () => {
  beforeEach(() => {
    fetchResult.data.value = null;
    fetchResult.pending.value = false;
    fetchResult.error.value = null;
    fetchResult.refresh.mockReset();
  });

  it("shows a loading state while the order is requested", async () => {
    fetchResult.pending.value = true;
    const html = await renderPage();
    expect(html).toContain('role="status"');
    expect(html).toContain("Fetching your order...");
  });

  it("renders historical quantities, prices, statuses, and total", async () => {
    fetchResult.data.value = {
      id: route.params.id,
      createdAt: "2026-10-31T12:00:00.000Z",
      currency: "usd",
      totalCents: 357,
      status: "PLACED",
      paymentStatus: "PARTIALLY_REFUNDED",
      items: [
        {
          flavorId: "atomic-cherry-fizz",
          flavorName: "Atomic Cherry Fizz",
          quantity: 3,
          unitPriceCents: 119,
        },
      ],
    };
    const html = await renderPage();
    expect(html).toContain("Atomic Cherry Fizz");
    expect(html).toContain("3 bottles");
    expect(html).toContain("$1.19 each");
    expect(html).toContain("$3.57");
    expect(html).toContain("partially refunded");
    expect(html).toContain(ASTROPOP_FLAVORS[0].bottleImage);
    expect(html).toContain("Line total");
    expect(html).toContain('href="/app/astro-pop/account"');
  });

  it("shows not-found and unexpected-error states", async () => {
    fetchResult.error.value = { statusCode: 404 };
    await expect(renderPage()).resolves.toContain("Order not found");

    fetchResult.error.value = { statusCode: 500 };
    await expect(renderPage()).resolves.toContain("We couldn&#39;t load this order");
  });
});
