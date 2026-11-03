import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";
import DecorativeImage from "../app/components/shared/DecorativeImage.vue";
import { ASTRO_POP_MEDIA } from "../app/data/astroPopMedia";

describe("DecorativeImage", () => {
  it("renders a decorative image with accessible defaults", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(DecorativeImage, {
            src: ASTRO_POP_MEDIA.sodaCap,
          }),
      }),
    );

    expect(html).toContain("decorative-image");
    expect(html).toContain(ASTRO_POP_MEDIA.sodaCap);
    expect(html).toContain('alt aria-hidden="true"');
  });
});
