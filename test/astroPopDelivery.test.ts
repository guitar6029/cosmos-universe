import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";
import AstroPopDeliverySection from "../app/components/astro-pop/AstroPopDeliverySection.vue";
import { ASTRO_POP_MEDIA } from "../app/data/astroPopMedia";

describe("AstroPop delivery section", () => {
  it("renders its heading, delivery hero image, and View Plans CTA", async () => {
    const html = await renderToString(createSSRApp({ render: () => h(AstroPopDeliverySection) }));

    expect(html).toContain("AstroPop Delivers!");
    expect(html).toContain(ASTRO_POP_MEDIA.deliveryArtwork);
    expect(html).toContain("View Plans");
    expect(html).toContain('href="#astropop-delivery-plans"');
  });
});
