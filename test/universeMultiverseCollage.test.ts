import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";
import { ABOUT_MEDIA, ABOUT_MEDIA_BASE_URL } from "../app/data/aboutMedia";
import UniverseMultiverseCollage, {
  MULTIVERSE_ARTWORK,
} from "../app/components/universe/UniverseMultiverseCollage.vue";

describe("Cosmo Universe multiverse collage", () => {
  it("maps precisely six reviewed About CDN images", () => {
    const urls = Object.values(ABOUT_MEDIA);

    expect(urls).toHaveLength(6);
    expect(urls).toEqual([
      `${ABOUT_MEDIA_BASE_URL}/01-midcentury-cartoon.webp`,
      `${ABOUT_MEDIA_BASE_URL}/02-cinematic-voyage.webp`,
      `${ABOUT_MEDIA_BASE_URL}/03-atomic-wasteland.webp`,
      `${ABOUT_MEDIA_BASE_URL}/04-pencil-and-ink.webp`,
      `${ABOUT_MEDIA_BASE_URL}/05-watercolor-fantasy.webp`,
      `${ABOUT_MEDIA_BASE_URL}/06-neon-pixel-inspired.webp`,
    ]);
  });

  it("renders all six images from deterministic independent stacking data", async () => {
    const html = await renderToString(createSSRApp(UniverseMultiverseCollage));

    expect(MULTIVERSE_ARTWORK).toHaveLength(6);
    expect(new Set(MULTIVERSE_ARTWORK.map(({ zIndex }) => zIndex)).size).toBeGreaterThan(3);
    expect(html.match(/<img/g)).toHaveLength(6);
    for (const artwork of MULTIVERSE_ARTWORK) expect(html).toContain(artwork.src);
    expect(html).toContain('aria-label="Six artistic visions of the Cosmo Universe"');
  });
});
